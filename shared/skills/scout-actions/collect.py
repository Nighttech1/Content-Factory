"""Manual Scout collector. No third-party dependencies, retries or publishing."""
import datetime as dt
from decimal import Decimal, InvalidOperation
import json
import os
from pathlib import Path
import re
import sys
import urllib.error
import urllib.parse
import urllib.request


class ScoutError(Exception):
    pass


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def request_json(url, *, headers=None, payload=None):
    data = None if payload is None else json.dumps(payload).encode()
    req = urllib.request.Request(url, data=data, headers=headers or {})
    try:
        with urllib.request.build_opener(NoRedirect).open(req, timeout=210) as response:
            body = response.read(10_000_001)
        if len(body) > 10_000_000:
            raise ScoutError('Provider response exceeds 10 MB; not retried')
        return json.loads(body)
    except urllib.error.HTTPError as exc:
        raise ScoutError(f'Provider HTTP {exc.code}; not retried') from None
    except (urllib.error.URLError, TimeoutError, OSError, ValueError):
        raise ScoutError('Provider connection or JSON error; not retried') from None


def validate(env):
    mode = env.get('SCOUT_MODE', 'check')
    if mode not in ('check', 'youtube', 'instagram'):
        raise ScoutError('Unsupported mode')
    if mode == 'check':
        return {'mode': mode}
    report = env.get('SCOUT_REPORT_ID', '')
    if not re.fullmatch(r'S-20\d{2}(0[1-9]|1[0-2])-(GEN|CAR|REL|ART|YTB)-\d{2}', report):
        raise ScoutError('Invalid report ID')
    if env.get('SCOUT_AUTHORIZATION') != f'COLLECT {report}':
        raise ScoutError('Explicit collection authorization is required')
    handles = list(dict.fromkeys(h.strip().lstrip('@') for h in
                               env.get('SCOUT_HANDLES', 'mosarmclub').split(',') if h.strip()))
    if mode == 'instagram':
        handles = list(dict.fromkeys(['mosarmclub'] + [h.lower() for h in handles]))
    if not handles or len(handles) > 5 or any(
            not re.fullmatch(r'[\w.-]{1,100}', h) for h in handles):
        raise ScoutError('Expected 1–5 public handles, not URLs')
    try:
        limit = int(env.get('SCOUT_LIMIT', '5'))
        budget = Decimal(env.get('SCOUT_APIFY_BUDGET_USD', '0.50'))
    except (ValueError, InvalidOperation):
        raise ScoutError('Invalid limit or budget') from None
    if not 1 <= limit <= 12 or len(handles) * limit > 50:
        raise ScoutError('Limit must be 1–12 per handle and at most 50 total')
    if not budget.is_finite() or not Decimal('0.01') <= budget <= Decimal('1.00'):
        raise ScoutError('Apify budget must be 0.01–1.00 USD')
    secret = (env.get('YOUTUBE_API_KEY') if mode == 'youtube' else
              env.get('APIFY_TOKEN') or env.get('APIFY_API_KEY'))
    if not secret:
        raise ScoutError('Required repository secret is missing')
    return dict(mode=mode, report_id=report, handles=handles, limit=limit,
                budget=str(budget), secret=secret)


def youtube(config):
    def api(resource, **params):
        result = request_json('https://www.googleapis.com/youtube/v3/' + resource + '?' +
                              urllib.parse.urlencode(params),
                              headers={'X-Goog-Api-Key': config['secret']})
        if not isinstance(result, dict) or 'error' in result or not isinstance(result.get('items'), list):
            raise ScoutError('Unexpected YouTube response')
        return result['items']

    channels = []
    for handle in config['handles']:
        items = api('channels', part='snippet,statistics,contentDetails', forHandle=handle)
        if len(items) != 1:
            raise ScoutError('YouTube channel not found; no fabricated fallback')
        channel = items[0]
        uploads = channel['contentDetails']['relatedPlaylists']['uploads']
        videos = api('playlistItems', part='contentDetails', playlistId=uploads,
                     maxResults=config['limit'])
        ids = ','.join(v['contentDetails']['videoId'] for v in videos)
        stats = api('videos', part='snippet,statistics', id=ids) if ids else []
        channels.append({'handle': handle, 'group': 'ours' if handle.lower() == 'mosarmclub' else 'competitors',
                         'source_url': 'https://www.youtube.com/channel/' + channel['id'],
                         'channel': channel, 'videos': [dict(v, source_url=
                            'https://www.youtube.com/watch?v=' + v['id']) for v in stats]})
    return {'channels': channels}


def instagram(config):
    # One actor run for all profiles, including ours. No retry on timeout/4xx/5xx.
    query = urllib.parse.urlencode({'timeout': 180, 'maxTotalChargeUsd': config['budget']})
    posts = request_json('https://api.apify.com/v2/acts/apify~instagram-scraper/'
                         'run-sync-get-dataset-items?' + query,
                         headers={'Authorization': 'Bearer ' + config['secret'],
                                  'Content-Type': 'application/json'},
                         payload={'directUrls': ['https://www.instagram.com/' + h + '/'
                                                 for h in config['handles']],
                                  'resultsType': 'posts', 'resultsLimit': config['limit'],
                                  'addParentData': True})
    if not isinstance(posts, list) or not posts or len(posts) > 50:
        raise ScoutError('Empty, invalid or oversized Apify dataset; not retried')
    fields = ('id', 'shortCode', 'url', 'type', 'caption', 'timestamp', 'ownerUsername',
              'likesCount', 'commentsCount', 'videoViewCount', 'videoPlayCount',
              'ownerFollowersCount', 'followersCount')
    groups = {'ours': [], 'competitors': []}
    counts = {}
    for post in posts:
        if not isinstance(post, dict) or post.get('error'):
            raise ScoutError('Apify returned a failed item; snapshot is incomplete')
        owner = str(post.get('ownerUsername', '')).lower()
        if owner not in config['handles'] or not post.get('url'):
            raise ScoutError('Apify item has no verified owner/source URL')
        counts[owner] = counts.get(owner, 0) + 1
        if counts[owner] > config['limit']:
            raise ScoutError('Apify exceeded requested per-profile result limit')
        groups['ours' if owner == 'mosarmclub' else 'competitors'].append(
            {field: post.get(field) for field in fields})
    missing = [h for h in config['handles'] if h not in counts]
    if missing:
        raise ScoutError('Apify returned no posts for one or more requested profiles')
    return dict(groups, actor='apify/instagram-scraper', actor_runs_requested=1,
                max_total_charge_usd=config['budget'], actual_charge_usd=None,
                unavailable_metrics=['reach', 'impressions', 'saves', 'shares', 'demographics'])


def redact(value, env):
    encoded = json.dumps(value, ensure_ascii=False, indent=2)
    for name in ('YOUTUBE_API_KEY', 'APIFY_TOKEN', 'APIFY_API_KEY'):
        secret = env.get(name)
        if secret:
            # Replace JSON-escaped secret, too; provider text is untrusted.
            encoded = encoded.replace(json.dumps(secret, ensure_ascii=False)[1:-1], '[REDACTED]')
    return encoded


def main(env=None, output=None):
    env = os.environ if env is None else env
    target = Path(output or 'work/scout-actions-result')
    target.mkdir(parents=True, exist_ok=True)
    result = {'collected_at_utc': dt.datetime.now(dt.timezone.utc).isoformat(),
              'repository': env.get('GITHUB_REPOSITORY'), 'commit': env.get('GITHUB_SHA'),
              'run_id': env.get('GITHUB_RUN_ID'), 'run_attempt': env.get('GITHUB_RUN_ATTEMPT'),
              'status': 'failed'}
    code = 1
    try:
        config = validate(env)
        result['mode'] = config['mode']
        if config['mode'] == 'check':
            result.update(status='presence_checked_not_authenticated',
                          secrets_present={'YOUTUBE_API_KEY': bool(env.get('YOUTUBE_API_KEY')),
                              'APIFY_TOKEN_OR_API_KEY': bool(env.get('APIFY_TOKEN') or env.get('APIFY_API_KEY'))},
                          provider_api_requests=0)
        else:
            result.update(report_id=config['report_id'], handles=config['handles'],
                          limit_per_handle=config['limit'])
            result['data'] = youtube(config) if config['mode'] == 'youtube' else instagram(config)
            result['status'] = 'collected'
        code = 0
    except ScoutError as exc:
        result['error'] = str(exc)
    except Exception:
        # Never expose exceptions containing request URLs, headers or credentials.
        result['error'] = 'Unexpected collector/response error; not retried'
    (target / 'snapshot.json').write_text(redact(result, env) + '\n', encoding='utf-8')
    print('Scout: ' + result['status'] + '; see snapshot.json')
    return code


if __name__ == '__main__':
    sys.exit(main())
