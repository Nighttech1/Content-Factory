#!/usr/bin/env python3
"""Validate/export approved articles; delivery requires the documented VPS receiver."""
import argparse
import hashlib
import hmac
import json
import os
from pathlib import Path
import re
import time
from datetime import datetime, timezone
from urllib.parse import urlsplit
from urllib.request import Request, build_opener, HTTPRedirectHandler

SITE = 'https://vernatunspeakclub.com'

def require(ok, message):
    if not ok:
        raise ValueError(message)

def timestamp(value):
    parsed = datetime.fromisoformat(value.replace('Z', '+00:00'))
    require(parsed.tzinfo is not None, 'Timezone required')
    return parsed

def https(value):
    u = urlsplit(value)
    require(u.scheme == 'https' and bool(u.hostname) and not u.username and not u.password, 'Unsafe URL')

def digest(content):
    return hashlib.sha256(json.dumps(content, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()).hexdigest()

def validate(article):
    require(set(article) == {'schema_version', 'content', 'release'}, 'Unknown envelope fields')
    require(article['schema_version'] == 1, 'Unknown schema')
    c, r = article['content'], article['release']
    require(set(c) == {'id', 'job_id', 'revision', 'slug', 'title', 'description', 'author', 'category', 'publish_at', 'updated_at', 'blocks', 'sources', 'telegram', 'cta'}, 'Content fields mismatch')
    require(re.fullmatch(r'V-\d{6}-[A-Z]+-\d+', c['id']) is not None, 'Invalid id')
    require(c['id'] == c['job_id'], 'Job id mismatch')
    require(type(c['revision']) is int and c['revision'] > 0, 'Invalid revision')
    require(re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', c['slug']) is not None, 'Invalid slug')
    for key in ['title', 'description', 'author', 'category']:
        require(isinstance(c[key], str) and bool(c[key].strip()), 'Missing '+key)
    timestamp(c['publish_at'])
    timestamp(c['updated_at'])
    require(isinstance(c['blocks'], list) and bool(c['blocks']), 'Empty article')
    for block in c['blocks']:
        require(block.get('type') in ['h2', 'h3', 'p', 'image'], 'Unsafe block')
        if block['type'] == 'image':
            require(set(block) == {'type', 'url', 'alt', 'rights'} and bool(block['alt']) and bool(block['rights']), 'Image metadata missing')
            https(block['url'])
        else:
            require(set(block) == {'type', 'text'} and isinstance(block['text'], str) and bool(block['text'].strip()), 'Invalid text block')
    require(isinstance(c['sources'], list) and bool(c['sources']), 'Sources required')
    for source in c['sources']:
        require(set(source) == {'url', 'title', 'checked_at'}, 'Invalid source')
        https(source['url'])
        timestamp(source['checked_at'])
    require(set(c['cta']) == {'label', 'url'}, 'Invalid CTA')
    require(c['cta']['url'] in [SITE+'/schedule', SITE+'/campus'], 'Unexpected CTA')
    require(bool(c['cta']['label']), 'Missing CTA label')
    require(set(c['telegram']) == {'enabled', 'teaser'} and type(c['telegram']['enabled']) is bool, 'Invalid Telegram metadata')
    require(isinstance(c['telegram']['teaser'], str) and 1 <= len(c['telegram']['teaser']) <= 1000, 'Invalid teaser')
    require(r.get('status') in ['draft', 'approved', 'withdrawn'], 'Invalid release status')
    if r['status'] == 'approved':
        expected = digest(c)
        for key in ['editor', 'owner']:
            approval = r.get(key, {})
            require(approval.get('content_sha256') == expected and bool(approval.get('by')) and bool(approval.get('evidence')), 'Missing or stale '+key+' approval')
            timestamp(approval['at'])
    return c

def bundle(root, now=None):
    now = now or datetime.now(timezone.utc)
    require(Path(root).is_dir(), 'Article directory is missing')
    output, ids, slugs = [], set(), set()
    for path in sorted(Path(root).glob('*.json')):
        article = json.loads(path.read_text())
        c = validate(article)
        require(c['id'] not in ids and c['slug'] not in slugs, 'Duplicate article id/slug')
        ids.add(c['id'])
        slugs.add(c['slug'])
        if article['release']['status'] == 'approved' and timestamp(c['publish_at']) <= now:
            output.append(article)
    return {'schema_version': 1, 'articles': output}

class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None

def deliver(payload, endpoint, secret):
    https(endpoint)
    require(bool(secret), 'VPS signing secret is not configured')
    for article in payload['articles']:
        validate(article)
        body = json.dumps(article, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()
        sent_at = str(int(time.time()))
        signature = hmac.new(secret.encode(), sent_at.encode()+b'.'+body, hashlib.sha256).hexdigest()
        c = article['content']
        key = c['id']+':'+str(c['revision'])+':'+digest(c)
        request = Request(endpoint, body, headers={'Content-Type': 'application/json', 'X-Article-Timestamp': sent_at, 'X-Article-Signature': 'sha256='+signature, 'Idempotency-Key': key}, method='POST')
        with build_opener(NoRedirect()).open(request, timeout=30) as response:
            receipt = json.loads(response.read(65536))
        require(receipt.get('id') == c['id'] and receipt.get('revision') == c['revision'] and receipt.get('content_sha256') == digest(c), 'Receipt mismatch')
        require(receipt.get('url') == SITE+'/articles/'+c['slug'] and receipt.get('site_status') == 'published', 'Site publication is not confirmed')
        require(receipt.get('dashboard_status') == 'synced', 'Dashboard is not synced')
        require(receipt.get('telegram_status') in (['queued', 'sent'] if c['telegram']['enabled'] else ['disabled']), 'Telegram handoff is not confirmed')
        print(json.dumps(receipt, ensure_ascii=False))

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--root', default='projects/vernatun/articles')
    parser.add_argument('--output', default='/tmp/vernatun-articles.json')
    parser.add_argument('--deliver', action='store_true')
    args = parser.parse_args()
    payload = bundle(args.root)
    Path(args.output).write_text(json.dumps(payload, ensure_ascii=False, indent=2)+'\n')
    print('Eligible articles:', len(payload['articles']))
    if args.deliver and payload['articles']:
        deliver(payload, os.environ.get('VERNATUN_ARTICLE_INGEST_URL', ''), os.environ.get('VERNATUN_ARTICLE_INGEST_SECRET', ''))

if __name__ == '__main__':
    main()
