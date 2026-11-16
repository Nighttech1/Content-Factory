import hashlib
import hmac
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

import publish

ROOT = Path(__file__).resolve().parents[2]

def fixture(approved=False):
    a = json.loads((ROOT/'projects/vernatun/articles/examples/draft.json').read_text())
    if approved:
        a['release'] = {'status': 'approved'}
        for role in ['editor', 'owner']:
            a['release'][role] = {'by': 'test-only', 'at': '2026-11-16T12:00:00+03:00', 'evidence': 'offline fixture', 'content_sha256': publish.digest(a['content'])}
    return a

class ArticlesTest(unittest.TestCase):
    def exported(self, a):
        with tempfile.TemporaryDirectory() as root:
            (Path(root)/'one.json').write_text(json.dumps(a))
            return publish.bundle(root)['articles']

    def test_draft_never_exported(self):
        self.assertEqual(self.exported(fixture()), [])

    def test_due_approved_exported(self):
        self.assertEqual(len(self.exported(fixture(True))), 1)

    def test_future_approved_excluded(self):
        a = fixture(True)
        a['content']['publish_at'] = '2099-01-01T00:00:00Z'
        for role in ['editor', 'owner']:
            a['release'][role]['content_sha256'] = publish.digest(a['content'])
        self.assertEqual(self.exported(a), [])

    def test_changed_text_invalidates_both_approvals(self):
        for field in ['title', 'description']:
            a = fixture(True)
            a['content'][field] += ' changed'
            with self.assertRaises(ValueError):
                self.exported(a)

    def test_missing_owner_rejected(self):
        a = fixture(True)
        del a['release']['owner']
        with self.assertRaises(ValueError):
            self.exported(a)

    def test_unsafe_media_and_html_block_rejected(self):
        for block in [{'type': 'html', 'text': '<script>x</script>'}, {'type': 'image', 'url': 'javascript:alert(1)', 'alt': 'a', 'rights': 'owner'}]:
            a = fixture()
            a['content']['blocks'] = [block]
            with self.assertRaises(ValueError):
                publish.validate(a)

    def test_duplicates_rejected(self):
        with tempfile.TemporaryDirectory() as root:
            for name in ['one', 'two']:
                (Path(root)/(name+'.json')).write_text(json.dumps(fixture()))
            with self.assertRaises(ValueError):
                publish.bundle(root)

    def test_timezone_required(self):
        a = fixture()
        a['content']['publish_at'] = '2026-11-16T12:00:00'
        with self.assertRaises(ValueError):
            publish.validate(a)

    def test_hmac_receipt_and_stable_key(self):
        a = fixture(True)
        c = a['content']
        receipt = {'id': c['id'], 'revision': 1, 'content_sha256': publish.digest(c), 'url': publish.SITE+'/articles/example', 'site_status': 'published', 'dashboard_status': 'synced', 'telegram_status': 'disabled'}
        with patch('publish.build_opener') as opener:
            response = opener.return_value.open.return_value.__enter__.return_value
            response.read.return_value = json.dumps(receipt).encode()
            publish.deliver({'articles': [a]}, 'https://receiver.example/articles', 'test-secret')
            req = opener.return_value.open.call_args.args[0]
            headers = {k.lower(): v for k, v in req.header_items()}
            expected = hmac.new(b'test-secret', headers['x-article-timestamp'].encode()+b'.'+req.data, hashlib.sha256).hexdigest()
            self.assertEqual(headers['x-article-signature'], 'sha256='+expected)
            self.assertEqual(headers['idempotency-key'], c['id']+':1:'+publish.digest(c))
            receipt['content_sha256'] = 'wrong'
            response.read.return_value = json.dumps(receipt).encode()
            with self.assertRaises(ValueError):
                publish.deliver({'articles': [a]}, 'https://receiver.example/articles', 'test-secret')

    def test_missing_endpoint_or_secret_fails(self):
        for url, secret in [('', 'x'), ('http://example.com', 'x'), ('https://example.com', '')]:
            with self.assertRaises(ValueError):
                publish.deliver({'articles': [fixture(True)]}, url, secret)

    def test_redirects_disabled(self):
        self.assertIsNone(publish.NoRedirect().redirect_request(None, None, 302, '', {}, 'https://other.example'))

if __name__ == '__main__':
    unittest.main()
