"""Offline safety and transport contract tests; never call provider APIs."""
import contextlib
import datetime as dt
import importlib.util
import io
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
import urllib.error

spec = importlib.util.spec_from_file_location('collect', Path(__file__).with_name('collect.py'))
collect = importlib.util.module_from_spec(spec)
spec.loader.exec_module(collect)


class CollectorTests(unittest.TestCase):
    def env(self, mode='instagram', **overrides):
        return dict(SCOUT_MODE=mode, SCOUT_REPORT_ID='S-202611-GEN-01',
                    SCOUT_AUTHORIZATION='COLLECT S-202611-GEN-01',
                    SCOUT_HANDLES='example', SCOUT_LIMIT='5',
                    YOUTUBE_API_KEY='test-youtube-secret', APIFY_TOKEN='test-apify-secret',
                    **overrides)

    def run_collector(self, env):
        with tempfile.TemporaryDirectory() as folder, contextlib.redirect_stdout(io.StringIO()) as logs:
            code = collect.main(env, folder)
            raw = (Path(folder) / 'snapshot.json').read_text()
            for key in ('YOUTUBE_API_KEY', 'APIFY_TOKEN', 'APIFY_API_KEY'):
                if env.get(key):
                    self.assertNotIn(env[key], raw + logs.getvalue())
            return code, json.loads(raw)

    def apify_responses(self, posts=None, *, spent=0, status='SUCCEEDED', cap='0.50'):
        now = dt.datetime.now(dt.timezone.utc)
        cycle = {'startAt': (now-dt.timedelta(days=1)).isoformat(),
                 'endAt': (now+dt.timedelta(days=29)).isoformat()}
        limits = {'data': {'monthlyUsageCycle': cycle, 'limits': {'maxMonthlyUsageUsd': 5},
                          'current': {'monthlyUsageUsd': spent, 'activeActorJobCount': 0}}}
        usage = {'data': {'usageCycle': cycle, 'totalUsageCreditsUsdAfterVolumeDiscount': spent}}
        pricing = {'data': {'pricingInfos': [{'pricingModel': 'PAY_PER_EVENT',
                                            'pricingPerEvent': {'actorChargeEvents': {'result': {
                                                'eventPriceUsd': 0.0027, 'isPrimaryEvent': True}}},
                                            'startedAt': cycle['startAt']}]}}
        run = {'data': {'id': 'RUN1', 'status': status, 'options': {'maxTotalChargeUsd': cap},
                        'defaultDatasetId': 'DATA1', 'usageTotalUsd': 0.1134}}
        return [limits, usage, pricing, run, run, posts or []]

    def test_check_never_calls_network(self):
        with patch.object(collect, 'request_json', side_effect=AssertionError('network')) as net:
            code, data = self.run_collector({'SCOUT_MODE': 'check'})
        self.assertEqual(code, 0)
        self.assertEqual(data['provider_api_requests'], 0)
        self.assertFalse(data['secrets_present']['YOUTUBE_API_KEY'])
        net.assert_not_called()

    def test_authorization_and_limits_before_network(self):
        cases = [{'SCOUT_AUTHORIZATION': ''}, {'SCOUT_REPORT_ID': '../../bad'},
                 {'SCOUT_LIMIT': '51'}, {'SCOUT_LIMIT': '0'},
                 {'SCOUT_APIFY_BUDGET_USD': 'NaN'}, {'SCOUT_APIFY_BUDGET_USD': '1.01'},
                 {'SCOUT_HANDLES': 'a,b,c,d', 'SCOUT_LIMIT': '12'},
                 {'SCOUT_HANDLES': 'https://evil.example/x'}, {'APIFY_TOKEN': ''}]
        for changes in cases:
            env = self.env()
            env.update(changes)
            with self.subTest(changes=changes), patch.object(collect, 'request_json') as net:
                code, result = self.run_collector(env)
                self.assertEqual(code, 1)
                self.assertEqual(result['status'], 'failed')
                net.assert_not_called()

    def test_instagram_one_bounded_batch_ours_separate_missing_metrics_null(self):
        posts = [{'id': '1', 'ownerUsername': 'mosarmclub', 'url': 'https://instagram.com/p/1'},
                 {'id': '2', 'ownerUsername': 'example', 'url': 'https://instagram.com/p/2',
                  'caption': 'test-apify-secret'}]
        with patch.object(collect, 'request_json', side_effect=self.apify_responses(posts)) as net, \
                patch.object(collect.time, 'sleep'):
            code, result = self.run_collector(self.env())
        self.assertEqual(code, 0)
        starts = [c for c in net.call_args_list if c.kwargs.get('payload') is not None]
        self.assertEqual(len(starts), 1)
        self.assertIn('maxTotalChargeUsd=0.50', starts[0].args[0])
        self.assertIn('restartOnError=false', starts[0].args[0])
        self.assertNotIn('test-apify-secret', starts[0].args[0])
        self.assertEqual(len(starts[0].kwargs['payload']['directUrls']), 2)
        self.assertEqual(result['data']['ours'][0]['ownerUsername'], 'mosarmclub')
        self.assertIsNone(result['data']['ours'][0]['likesCount'])
        self.assertEqual(result['data']['competitors'][0]['caption'], '[REDACTED]')
        self.assertEqual(result['apify']['actual_charge_usd'], '0.1134')
        self.assertEqual(result['apify']['run_id'], 'RUN1')

    def test_apify_empty_partial_error_retains_cost_without_retry(self):
        cases = [[], [{'error': 'private'}], [{'ownerUsername': 'example', 'url': 'https://x'}]]
        for response in cases:
            with self.subTest(size=len(response)), \
                    patch.object(collect, 'request_json', side_effect=self.apify_responses(response)) as net, \
                    patch.object(collect.time, 'sleep'):
                code, result = self.run_collector(self.env())
                self.assertEqual(code, 0)
                self.assertEqual(result['status'], 'partial')
                self.assertEqual(result['apify']['actual_charge_usd'], '0.1134')
                self.assertEqual(sum(c.kwargs.get('payload') is not None for c in net.call_args_list), 1)

    def test_apify_budget_failures_never_start_actor(self):
        for spent in [4.51, 5, float('nan'), -1, None, True]:
            with self.subTest(spent=spent), patch.object(collect, 'request_json',
                    side_effect=self.apify_responses(spent=spent)) as net:
                code, result = self.run_collector(self.env())
                self.assertEqual(code, 1)
                self.assertEqual(result['apify']['actor_runs_requested'], 0)
                self.assertFalse(any(c.kwargs.get('payload') is not None for c in net.call_args_list))

    def test_concurrent_unknown_billing_or_rental_prevents_start(self):
        for case in ['concurrent', 'missing_usage', 'rental', 'future_pricing', 'cycle_mismatch']:
            responses = self.apify_responses()
            if case == 'concurrent':
                responses[0]['data']['current']['activeActorJobCount'] = 1
            elif case == 'missing_usage':
                del responses[1]['data']['totalUsageCreditsUsdAfterVolumeDiscount']
            elif case == 'rental':
                responses[2]['data']['pricingInfos'][0]['pricingModel'] = 'FLAT_PRICE_PER_MONTH'
            elif case == 'future_pricing':
                responses[2]['data']['pricingInfos'][0]['startedAt'] = '2099-01-01T00:00:00Z'
            else:
                responses[1]['data']['usageCycle'] = {}
            with self.subTest(case=case), patch.object(collect, 'request_json', side_effect=responses) as net:
                code, result = self.run_collector(self.env())
                self.assertEqual(code, 1)
                self.assertFalse(any(c.kwargs.get('payload') is not None for c in net.call_args_list))

    def test_limits_and_workflow_retry_block_before_network(self):
        cases = [{'SCOUT_LIMIT': '7'}, {'SCOUT_APIFY_BUDGET_USD': '0.51'},
                 {'GITHUB_RUN_ATTEMPT': '2'}, {'SCOUT_HANDLES': 'a,b,c,d,e,f,g'}]
        for changes in cases:
            env = self.env()
            env.update(changes)
            with self.subTest(changes=changes), patch.object(collect, 'request_json') as net:
                code, _ = self.run_collector(env)
                self.assertEqual(code, 1)
                net.assert_not_called()
        env = self.env()
        env.update(SCOUT_HANDLES='mosarmclub,a,b,c,d,e,f', SCOUT_LIMIT='6')
        self.assertEqual(len(collect.validate(env)['handles']), 7)

    def test_actor_failure_retains_spend_and_no_second_start(self):
        with patch.object(collect, 'request_json', side_effect=self.apify_responses(status='FAILED')) as net, \
                patch.object(collect.time, 'sleep'):
            code, result = self.run_collector(self.env())
        self.assertEqual(code, 1)
        self.assertEqual(result['apify']['actual_charge_usd'], '0.1134')
        self.assertEqual(result['apify']['run_id'], 'RUN1')
        self.assertEqual(sum(c.kwargs.get('payload') is not None for c in net.call_args_list), 1)

    def test_missing_cap_aborts_without_second_actor_start(self):
        responses = self.apify_responses(cap=None)
        with patch.object(collect, 'request_json', side_effect=responses) as net:
            code, result = self.run_collector(self.env())
        self.assertEqual(code, 1)
        writes = [c for c in net.call_args_list if c.kwargs.get('payload') is not None]
        self.assertEqual(len(writes), 2)
        self.assertIn('/runs?', writes[0].args[0])
        self.assertTrue(writes[1].args[0].endswith('/RUN1/abort'))
        self.assertEqual(result['apify']['run_id'], 'RUN1')
        self.assertIsNone(result['apify']['actual_charge_usd'])

    def test_tiktok_no_paid_addons_and_metrics_from_real_owner(self):
        post = {'id': 'V1', 'webVideoUrl': 'https://www.tiktok.com/@example/video/1',
                'authorMeta': {'name': 'example'}, 'text': 'test', 'playCount': 18,
                'createTimeISO': '2026-11-01T00:00:00Z'}
        with patch.object(collect, 'request_json', side_effect=self.apify_responses([post])) as net, \
                patch.object(collect.time, 'sleep'):
            code, result = self.run_collector(self.env('tiktok'))
        self.assertEqual(code, 0)
        self.assertEqual(result['status'], 'collected')
        starts = [c for c in net.call_args_list if c.kwargs.get('payload') is not None]
        self.assertEqual(len(starts), 1)
        payload = starts[0].kwargs['payload']
        self.assertEqual(payload['profiles'], ['example'])
        self.assertFalse(payload['shouldDownloadVideos'])
        self.assertEqual(payload['commentsPerPost'], 0)
        self.assertEqual(payload['downloadSubtitlesOptions'], 'NEVER_DOWNLOAD_SUBTITLES')
        self.assertNotIn('oldestPostDateUnified', payload)
        self.assertEqual(result['data']['competitors'][0]['videoViewCount'], 18)

    def test_connection_error_on_start_is_not_retried(self):
        responses = self.apify_responses()[:3] + [collect.ScoutError('connection failed')]
        with patch.object(collect, 'request_json', side_effect=responses) as net:
            code, result = self.run_collector(self.env())
        self.assertEqual(code, 1)
        self.assertEqual(result['apify']['actor_runs_requested'], 1)
        self.assertIsNone(result['apify']['actual_charge_usd'])
        self.assertEqual(sum(c.kwargs.get('payload') is not None for c in net.call_args_list), 1)

    def test_oversized_dataset_or_profile_result_limit_fails(self):
        cases = [[{'ownerUsername': 'mosarmclub', 'url': 'https://instagram.com/p/1'}]*51,
                 [{'ownerUsername': 'mosarmclub', 'url': 'https://instagram.com/p/1'}]*6]
        for posts in cases:
            with self.subTest(size=len(posts)), \
                    patch.object(collect, 'request_json', side_effect=self.apify_responses(posts)), \
                    patch.object(collect.time, 'sleep'):
                code, result = self.run_collector(self.env())
                self.assertEqual(code, 1)
                self.assertEqual(result['apify']['actual_charge_usd'], '0.1134')

    def test_real_public_actor_pricing_and_minimum_cap(self):
        pricing = {'pricingModel': 'PAY_PER_EVENT', 'minimalMaxTotalChargeUsd': 0.5,
                   'pricingPerEvent': {'actorChargeEvents': {
                       'result': {'isPrimaryEvent': True, 'eventTieredPricingUsd': {
                           'FREE': {'tieredEventPriceUsd': 0.0037},
                           'BRONZE': {'tieredEventPriceUsd': 0.003}}},
                       'actor-start': {'isOneTimeEvent': True, 'eventPriceUsd': 0.001}}}}
        estimate = collect.pricing_upper_bound(pricing, 30, '0.50')
        self.assertEqual(estimate['base_sample_estimate_upper_usd'], '0.1120')
        with self.assertRaises(collect.ScoutError):
            collect.pricing_upper_bound(pricing, 30, '0.49')
        with self.assertRaises(collect.ScoutError):
            collect.pricing_upper_bound({'pricingModel': 'PAY_PER_EVENT'}, 30, '0.50')

    def test_youtube_three_calls_per_channel_no_search(self):
        responses = [{'items': [{'id': 'UC1', 'statistics': {'subscriberCount': '42'},
                                 'contentDetails': {'relatedPlaylists': {'uploads': 'UU1'}}}]},
                     {'items': [{'contentDetails': {'videoId': 'video1'}}]},
                     {'items': [{'id': 'video1', 'statistics': {'viewCount': '7'}}]}]
        with patch.object(collect, 'request_json', side_effect=responses) as net:
            code, result = self.run_collector(self.env('youtube'))
        self.assertEqual(code, 0)
        self.assertEqual(net.call_count, 3)
        for call in net.call_args_list:
            self.assertNotIn('/search', call.args[0])
            self.assertNotIn('test-youtube-secret', call.args[0])
        self.assertEqual(result['data']['channels'][0]['videos'][0]['source_url'],
                         'https://www.youtube.com/watch?v=video1')

    def test_http_error_sanitized_and_not_retried(self):
        opener = unittest.mock.Mock()
        opener.open.side_effect = urllib.error.HTTPError(
            'https://x?secret=private', 403, 'private', {}, None)
        with patch.object(collect.urllib.request, 'build_opener', return_value=opener):
            with self.assertRaisesRegex(collect.ScoutError, '^Provider HTTP 403; not retried$'):
                collect.request_json('https://example.com')
        opener.open.assert_called_once()

    def test_escaped_secret_redaction(self):
        secret = 'secret"\\\nvalue'
        self.assertEqual(json.loads(collect.redact({'x': secret}, {'APIFY_TOKEN': secret}))['x'], '[REDACTED]')


if __name__ == '__main__':
    unittest.main()
