"""Manual Scout collector. No third-party dependencies, retries or publishing."""
import datetime as dt
from decimal import Decimal, InvalidOperation
import json
import os
from pathlib import Path
import re
import sys
import time
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
    if mode not in ('check', 'youtube', 'instagram', 'tiktok'):
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
    max_handles = 7 if mode == 'instagram' else 5
    if not handles or len(handles) > max_handles or any(
            not re.fullmatch(r'[\w.-]{1,100}', h) for h in handles):
        raise ScoutError(f'Expected 1–{max_handles} public handles, not URLs')
    try:
        limit = int(env.get('SCOUT_LIMIT', '5'))
        budget = Decimal(env.get('SCOUT_APIFY_BUDGET_USD', '0.50'))
    except (ValueError, InvalidOperation):
        raise ScoutError('Invalid limit or budget') from None
    if not 1 <= limit <= 12 or len(handles) * limit > 50:
        raise ScoutError('Limit must be 1–12 per handle and at most 50 total')
    if not budget.is_finite() or not Decimal('0.01') <= budget <= Decimal('1.00'):
        raise ScoutError('Apify budget must be 0.01–1.00 USD')
    if mode in ('instagram', 'tiktok'):
        if limit > 6 or budget > Decimal('0.50'):
            raise ScoutError('Research cap: at most 6 posts per profile and 0.50 USD per platform')
        if env.get('GITHUB_RUN_ATTEMPT', '1') != '1':
            raise ScoutError('Apify workflow retries are forbidden; inspect the existing actor run')
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


def usd(value):
    if isinstance(value, bool) or value is None:
        raise ScoutError('Missing or invalid Apify cost; actor not started/retried')
    try:
        amount = Decimal(str(value))
    except InvalidOperation:
        raise ScoutError('Invalid Apify cost; actor not started/retried') from None
    if not amount.is_finite() or amount < 0:
        raise ScoutError('Invalid Apify cost; actor not started/retried')
    return amount


def apify_preflight(api, budget):
    limits = api('users/me/limits')
    usage = api('users/me/usage/monthly')
    try:
        current = limits['current']
        cycle = limits['monthlyUsageCycle']
        if cycle != usage['usageCycle']:
            raise ScoutError('Apify usage cycles disagree; no actor started')
        now = dt.datetime.now(dt.timezone.utc)
        if not (dt.datetime.fromisoformat(cycle['startAt'].replace('Z', '+00:00')) <= now
                <= dt.datetime.fromisoformat(cycle['endAt'].replace('Z', '+00:00'))):
            raise ScoutError('Apify billing cycle is not current; no actor started')
        active = current['activeActorJobCount']
        if isinstance(active, bool) or not isinstance(active, int) or active != 0:
            raise ScoutError('Concurrent/unknown Apify jobs; no actor started')
        spent = max(usd(current['monthlyUsageUsd']),
                    usd(usage['totalUsageCreditsUsdAfterVolumeDiscount']))
        ceiling = min(Decimal('5.00'), usd(limits['limits']['maxMonthlyUsageUsd']))
    except (KeyError, TypeError, ValueError):
        raise ScoutError('Incomplete Apify billing metadata; no actor started') from None
    remaining = ceiling - spent
    if remaining < usd(budget):
        raise ScoutError('Insufficient verified monthly budget; no actor started')
    return {'usage_cycle': cycle, 'monthly_spent_usd': str(spent),
            'monthly_ceiling_usd': str(ceiling), 'remaining_before_run_usd': str(remaining)}


def pricing_upper_bound(pricing, count, budget):
    minimum = pricing.get('minimalMaxTotalChargeUsd')
    if minimum is not None and usd(minimum) > usd(budget):
        raise ScoutError('Actor minimum cost cap exceeds the authorized cap; no actor started')
    model = pricing['pricingModel']
    if model == 'PRICE_PER_DATASET_ITEM':
        values = [x['tieredPricePerUnitUsd'] for x in pricing.get('tieredPricing', {}).values()]
        rate = max(map(usd, values)) if values else usd(pricing.get('pricePerUnitUsd'))
        start = Decimal('0')
    else:
        events = pricing.get('pricingPerEvent', {}).get('actorChargeEvents', {})
        if not isinstance(events, dict) or not events:
            raise ScoutError('Actor event rates missing; no actor started')
        rates = {}
        for name, event in events.items():
            tiers = event.get('eventTieredPricingUsd', {})
            values = [x['tieredEventPriceUsd'] for x in tiers.values()]
            rates[name] = max(map(usd, values)) if values else usd(event.get('eventPriceUsd'))
        primary = [rates[name] for name, event in events.items() if event.get('isPrimaryEvent')]
        if len(primary) != 1:
            raise ScoutError('Actor primary event rate ambiguous; no actor started')
        rate = primary[0]
        start = sum((rates[name] for name, event in events.items() if event.get('isOneTimeEvent')),
                    Decimal('0'))
    estimate = start + rate * count
    if estimate > usd(budget):
        raise ScoutError('Base sample estimate exceeds authorized cap; no actor started')
    return {'primary_result_upper_usd': str(rate), 'known_start_upper_usd': str(start),
            'base_sample_estimate_upper_usd': str(estimate),
            'note': 'Conservative across published tiers; optional events excluded; actual cost from run'}


def apify(config, snapshot, save):
    headers = {'Authorization': 'Bearer ' + config['secret'], 'Content-Type': 'application/json'}

    def api(path, *, payload=None, query=None, dataset=False):
        url = 'https://api.apify.com/v2/' + path
        if query:
            url += '?' + urllib.parse.urlencode(query)
        response = request_json(url, headers=headers, payload=payload)
        if dataset:
            if not isinstance(response, list):
                raise ScoutError('Invalid Apify dataset response; not retried')
            return response
        if not isinstance(response, dict) or not isinstance(response.get('data'), dict):
            raise ScoutError('Invalid Apify metadata response; no actor retry')
        return response['data']

    evidence = snapshot['apify'] = {'actor_runs_requested': 0, 'actual_charge_usd': None}
    evidence['preflight'] = apify_preflight(api, config['budget'])
    actor = ('apify~instagram-scraper' if config['mode'] == 'instagram'
             else 'clockworks~tiktok-scraper')
    metadata = api('acts/' + actor)
    pricing = metadata.get('pricingInfos')
    if not isinstance(pricing, list) or not pricing:
        raise ScoutError('Apify actor pricing unavailable; no actor started')
    # Rental/usage-only actors are outside this bounded PPE/PPR collector.
    now = dt.datetime.now(dt.timezone.utc)
    applicable = []
    for entry in pricing:
        if not isinstance(entry, dict):
            continue
        try:
            since = dt.datetime.fromisoformat(entry['startedAt'].replace('Z', '+00:00'))
        except (KeyError, TypeError, ValueError):
            continue
        if since <= now:
            applicable.append((since, entry))
    active_pricing = max(applicable, key=lambda pair: pair[0])[1] if applicable else None
    if not active_pricing or active_pricing.get('pricingModel') not in ('PAY_PER_EVENT', 'PRICE_PER_DATASET_ITEM'):
        raise ScoutError('Current supported actor pricing not verified; no actor started')
    evidence.update(actor=actor, pricing=active_pricing)
    evidence['pricing_check'] = pricing_upper_bound(active_pricing,
        len(config['handles']) * config['limit'], config['budget'])
    if config['mode'] == 'instagram':
        payload = {'directUrls': ['https://www.instagram.com/' + h + '/' for h in config['handles']],
                   'resultsType': 'posts', 'resultsLimit': config['limit'], 'addParentData': True}
    else:
        payload = {'profiles': config['handles'], 'resultsPerPage': config['limit'],
                   'profileScrapeSections': ['videos'], 'profileSorting': 'latest',
                   'excludePinnedPosts': True, 'maxFollowersPerProfile': 0,
                   'maxFollowingPerProfile': 0, 'commentsPerPost': 0,
                   'shouldDownloadVideos': False, 'shouldDownloadCovers': False,
                   'shouldDownloadSlideshowImages': False, 'shouldDownloadAvatars': False,
                   'shouldDownloadMusicCovers': False,
                   'downloadSubtitlesOptions': 'NEVER_DOWNLOAD_SUBTITLES',
                   'aiVideoDescription': False, 'aiVideoSummary': False}
    evidence['actor_runs_requested'] = 1
    evidence['run_start_state'] = 'requested; if connection fails inspect Apify before any further action'
    save()
    run = api('acts/' + actor + '/runs', payload=payload,
              query={'timeout': 180, 'maxTotalChargeUsd': config['budget'], 'restartOnError': 'false'})
    run_id = run.get('id')
    if not isinstance(run_id, str) or not re.fullmatch(r'[A-Za-z0-9]+', run_id):
        raise ScoutError('Actor start returned no valid run ID; do not retry')
    evidence['run_id'] = run_id
    evidence['console_url'] = 'https://console.apify.com/actors/runs/' + run_id
    terminal = {'SUCCEEDED', 'FAILED', 'TIMED-OUT', 'ABORTED'}
    for _ in range(9):
        evidence['status'] = run.get('status')
        cost = run.get('usageTotalUsd')
        evidence['reported_usage_total_usd'] = str(usd(cost)) if cost is not None else None
        save()
        options = run.get('options', {})
        cap = options.get('maxTotalChargeUsd')
        if cap is None or not Decimal('0') < usd(cap) <= usd(config['budget']):
            api('actor-runs/' + run_id + '/abort', payload={})
            raise ScoutError('Run cap not confirmed; abort requested; inspect existing run, no retry')
        if run.get('status') in terminal:
            break
        run = api('actor-runs/' + run_id, query={'waitForFinish': 30})
    else:
        api('actor-runs/' + run_id + '/abort', payload={})
        raise ScoutError('Actor did not terminate in monitoring window; abort requested; no retry')
    # The first terminal response can still contain provisional billing figures.
    time.sleep(10)
    run = api('actor-runs/' + run_id)
    evidence['status'] = run.get('status')
    cost = run.get('usageTotalUsd')
    evidence['actual_charge_usd'] = str(usd(cost)) if cost is not None else None
    evidence['cost_source'] = 'Authenticated run metadata re-read after 10 seconds; not an invoice'
    evidence['charged_event_counts'] = run.get('chargedEventCounts')
    save()
    if run.get('status') != 'SUCCEEDED':
        raise ScoutError('Actor ended without success; cost/run ID retained; no retry')
    dataset_id = run.get('defaultDatasetId')
    if not isinstance(dataset_id, str) or not re.fullmatch(r'[A-Za-z0-9]+', dataset_id):
        raise ScoutError('Actor dataset ID invalid; run/cost retained')
    posts = api('datasets/' + dataset_id + '/items', query={'clean': 'true', 'limit': 51}, dataset=True)
    return normalise_apify(config, posts)


def normalise_apify(config, posts):
    if len(posts) > 50:
        raise ScoutError('Oversized Apify dataset; run/cost retained; no retry')
    fields = ('id', 'shortCode', 'url', 'type', 'caption', 'timestamp', 'ownerUsername',
              'likesCount', 'commentsCount', 'videoViewCount', 'videoPlayCount',
              'ownerFollowersCount', 'followersCount')
    groups = {'ours': [], 'competitors': []}
    counts = {}
    unavailable = 0
    for post in posts:
        if not isinstance(post, dict) or post.get('error'):
            unavailable += 1
            continue
        if config['mode'] == 'tiktok':
            author = post.get('authorMeta') or {}
            post = {'id': post.get('id'), 'url': post.get('webVideoUrl'), 'type': 'Video',
                    'caption': post.get('text'), 'timestamp': post.get('createTimeISO'),
                    'ownerUsername': author.get('name'), 'ownerFollowersCount': author.get('fans'),
                    'likesCount': post.get('diggCount'), 'commentsCount': post.get('commentCount'),
                    'videoViewCount': post.get('playCount')}
        owner = str(post.get('ownerUsername', '')).lower()
        if owner not in config['handles'] or not post.get('url'):
            unavailable += 1
            continue
        host = urllib.parse.urlparse(post['url']).hostname
        platform = 'instagram.com' if config['mode'] == 'instagram' else 'tiktok.com'
        if host not in (platform, 'www.' + platform):
            unavailable += 1
            continue
        counts[owner] = counts.get(owner, 0) + 1
        if counts[owner] > config['limit']:
            raise ScoutError('Apify exceeded requested per-profile result limit')
        groups['ours' if owner == 'mosarmclub' else 'competitors'].append(
            {field: post.get(field) for field in fields})
    missing = [h for h in config['handles'] if h not in counts]
    return dict(groups, sample_status='partial' if missing or unavailable or not posts else 'collected',
                missing_profiles=missing, unavailable_items=unavailable,
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
    def save():
        (target / 'snapshot.json').write_text(redact(result, env) + '\n', encoding='utf-8')
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
            result['data'] = youtube(config) if config['mode'] == 'youtube' else apify(config, result, save)
            result['status'] = result['data'].get('sample_status', 'collected')
        code = 0
    except ScoutError as exc:
        result['error'] = str(exc)
    except Exception:
        # Never expose exceptions containing request URLs, headers or credentials.
        result['error'] = 'Unexpected collector/response error; not retried'
    save()
    print('Scout: ' + result['status'] + '; see snapshot.json')
    return code


if __name__ == '__main__':
    sys.exit(main())
