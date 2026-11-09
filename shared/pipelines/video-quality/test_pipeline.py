import argparse
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

HERE = Path(__file__).parent
def module(name):
    s = importlib.util.spec_from_file_location(name, HERE / (name + '.py'))
    m = importlib.util.module_from_spec(s)
    s.loader.exec_module(m)
    return m
q, d = module('run'), module('download')

class Gates(unittest.TestCase):
    def test_final_rejects_missing_acceptance_and_wrong_source(self):
        cfg = q.settings('gentle', 0)
        m = dict(stage='sample', source_sha256='a', settings=cfg,
                 technical_qa='PASS', after_sha256='b')
        for sha, conf, accepted in [('a', cfg, False), ('wrong', cfg, True),
                                     ('a', q.settings('denoise', 0), True)]:
            with self.assertRaises(ValueError):
                q.check_approval(m, sha, conf, accepted)
        q.check_approval(m, 'a', cfg, True)

    def test_hdr_and_rotation_blocked(self):
        for extra in [dict(color_transfer='smpte2084'), dict(side_data_list=[dict(rotation=90)])]:
            info = dict(format=dict(duration=4), streams=[dict(codec_type='video', width=320,
                height=480, avg_frame_rate='30/1', **extra)])
            with self.assertRaises(ValueError): q.validate_media(info, True)

    def test_input_in_output_rejected(self):
        with tempfile.TemporaryDirectory() as tmp:
            p = Path(tmp) / 'input.mp4'
            p.write_bytes(b'original')
            with self.assertRaises(ValueError): q.output_dir(tmp, p)
            self.assertEqual(p.read_bytes(), b'original')

    def test_network_gate(self):
        for url in ['http://assets.example/a', 'https://evil.example/a',
                    'https://user:pass@assets.example/a', 'https://assets.example:444/a']:
            with self.assertRaises(ValueError): d.validate_url(url, {'assets.example'})
        with patch('socket.getaddrinfo', return_value=[(0,0,0,'',('127.0.0.1',443))]):
            with self.assertRaises(ValueError): d.validate_url('https://assets.example/a', {'assets.example'})

    def test_profiles_do_not_claim_ai(self):
        self.assertEqual(set(q.PROFILES), {'baseline', 'gentle', 'denoise', 'lanczos'})
        for width in [-1, 17, 5000]:
            with self.assertRaises(ValueError): q.settings('gentle', width)

    def test_notebook_syntax_and_embedded_source(self):
        nb = json.loads((HERE / 'free-gpu.ipynb').read_text())
        for i, cell in enumerate(nb['cells']):
            if cell['cell_type'] == 'code': compile(''.join(cell['source']), f'cell-{i}', 'exec')
        combined = '\n'.join(''.join(c['source']) for c in nb['cells'])
        self.assertIn(repr((HERE / 'run.py').read_text()), combined)
        self.assertIn(repr((HERE / 'gpu.py').read_text()), combined)

class EndToEnd(unittest.TestCase):
    def test_real_decode_sample_and_final_gates(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            src = root / 'original.mp4'
            q.ff('-n', '-f', 'lavfi', '-i', 'testsrc2=size=320x480:rate=30:duration=4',
                 '-f', 'lavfi', '-i', 'sine=frequency=440:duration=4', '-c:v', 'libx264',
                 '-threads', '2', '-pix_fmt', 'yuv420p', '-c:a', 'aac', src)
            sha = q.digest(src)
            def args(mode, **kwargs):
                a = dict(mode=mode, input=str(src), output=str(root/mode), job_id='VQ-202611-01',
                         profile='gentle', width=0, start=0, seconds=3, rights_confirmed=True,
                         approval=None, accept_sample=False)
                a.update(kwargs)
                return argparse.Namespace(**a)
            diag = q.process(args('diagnose'))
            self.assertEqual(diag['technical_qa'], 'PASS')
            self.assertEqual(len(list((root/'diagnose').glob('*.jpg'))), 5)
            for change in [dict(rights_confirmed=False), dict(start=3), dict(seconds=float('nan'))]:
                with self.assertRaises(ValueError): q.process(args('sample', **change))
            sample = q.process(args('sample'))
            self.assertEqual(sample['technical_qa'], 'PASS')
            manifest = root/'sample'/'manifest.json'
            with self.assertRaises(ValueError): q.process(args('final'))
            with self.assertRaises(ValueError): q.process(args('final', approval=str(manifest)))
            final = q.process(args('final', approval=str(manifest), accept_sample=True))
            self.assertEqual(final['status'], 'NEEDS_VISUAL_REVIEW')
            self.assertEqual(q.digest(src), sha)
            self.assertEqual(final['output']['streams'][0]['width'], 320)
            self.assertTrue((root/'final'/'final.mp4').stat().st_size > 0)

if __name__ == '__main__': unittest.main(verbosity=2)
