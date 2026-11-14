import copy
import hashlib
import json
import tempfile
import unittest
from pathlib import Path
from contract import ContractError, choose_contrast, validate_job

BASE = json.loads((Path(__file__).parent / 'case-v3.json').read_text())


class ContractTests(unittest.TestCase):
    def rejected(self, mutate):
        job = copy.deepcopy(BASE)
        mutate(job)
        with self.assertRaises(ContractError):
            validate_job(job, '.', check_assets=False)

    def test_valid_contract(self):
        validate_job(BASE, '.', check_assets=False)

    def test_production_cannot_reuse_unregistered_demo(self):
        self.rejected(lambda j: j.__setitem__('case_kind', 'production'))

    def test_unresolved_font_contract_blocks_production(self):
        def mutate(job):
            job.update(case_kind='production', production_job_id='V-202611-CAR-99',
                       brief_version='1', script_status='ACCEPTED')
        self.rejected(mutate)

    def test_wrong_phrase_count(self):
        self.rejected(lambda j: j['copy']['2'].pop())

    def test_empty_translation(self):
        self.rejected(lambda j: j['copy']['3'][0].__setitem__(2, ' '))

    def test_multiline_card_rejected(self):
        self.rejected(lambda j: j['copy']['4'][0].__setitem__(0, 'a\nb'))

    def test_unaccepted_background(self):
        self.rejected(lambda j: j['background_statuses'].__setitem__(2, 'GENERATED'))

    def test_old_logo_margins_rejected(self):
        self.rejected(lambda j: j['style']['logo'].__setitem__('top', 108))

    def test_colored_arrow_rejected(self):
        self.rejected(lambda j: j['style']['arrow'].__setitem__('mode', 'orange'))

    def test_final_arrow_rejected(self):
        self.rejected(lambda j: j['style']['arrow'].__setitem__('final_slide', True))

    def test_outside_canvas(self):
        self.rejected(lambda j: j['positions']['2'][0].__setitem__(0, 1070))

    def test_nonfinite_geometry(self):
        self.rejected(lambda j: j['positions']['2'][0].__setitem__(1, float('nan')))

    def test_missing_font(self):
        self.rejected(lambda j: j['fonts']['primary'].__setitem__('family', 'Arial'))

    def test_missing_asset_hash(self):
        self.rejected(lambda j: j['asset_hashes'].pop('logo-dark.png'))

    def test_missing_asset(self):
        with tempfile.TemporaryDirectory() as root:
            with self.assertRaisesRegex(ContractError, 'ASSET_MISSING'):
                validate_job(BASE, root)

    def test_changed_asset(self):
        job = copy.deepcopy(BASE)
        with tempfile.TemporaryDirectory() as root:
            for name in job['asset_hashes']:
                data = name.encode()
                (Path(root) / name).write_bytes(data)
                job['asset_hashes'][name] = hashlib.sha256(data).hexdigest()
            validate_job(job, root)
            (Path(root) / 'background-01.png').write_bytes(b'changed')
            with self.assertRaisesRegex(ContractError, 'ASSET_HASH_MISMATCH'):
                validate_job(job, root)

    def test_contrast_dark_and_light(self):
        self.assertEqual(choose_contrast([0] * 100)[0], 'white')
        self.assertEqual(choose_contrast([1] * 100)[0], 'black')

    def test_mixed_contrast_uses_low_decile(self):
        self.assertEqual(choose_contrast([.01] * 90 + [.5] * 10)[0], 'white')


if __name__ == '__main__':
    unittest.main()
