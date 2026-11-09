"""Optional interactive Kaggle/Colab RealESRGAN trial. No paid APIs or face repair."""
import argparse
from fractions import Fraction
import json
from pathlib import Path
import shutil
import re
import math
import subprocess
import urllib.request
import run as q

MODEL_URL = 'https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.1/RealESRGAN_x2plus.pth'

def cfr_check(source, fps):
    info = json.loads(q.execute(['ffprobe', '-v', 'error', '-select_streams', 'v:0',
        '-show_entries', 'frame=best_effort_timestamp_time', '-of', 'json', source]))
    ts = [float(x['best_effort_timestamp_time']) for x in info['frames']
          if 'best_effort_timestamp_time' in x]
    if len(ts) < 2 or any(abs((b-a) - 1/fps) > .001 for a,b in zip(ts, ts[1:])):
        raise ValueError('GPU path requires CFR. VFR needs an explicit timing conversion first.')

def main(a):
    import numpy as np
    from PIL import Image
    import torch
    from spandrel import ModelLoader, ImageModelDescriptor
    if not torch.cuda.is_available():
        raise ValueError('CUDA GPU unavailable. Stop; do not activate paid resources.')
    if not a.rights_confirmed:
        raise ValueError('Confirm rights and permission to upload to this platform first')
    if not re.fullmatch(r'VQ-\d{6}-\d{2,3}', a.job_id):
        raise ValueError('Use VQ-YYYYMM-NN quality job ID')
    if not 0 <= a.strength <= 1:
        raise ValueError('Strength must be 0..1')
    source = Path(a.input).resolve()
    if not source.is_file() or source.stat().st_size > 500 * 1024 * 1024:
        raise ValueError('Input missing or exceeds size limit')
    info = q.probe(source)
    q.validate_media(info, processing=True)
    v = q.video(info)
    fps = q.rate(v)
    cfr_check(source, fps)
    cfg = {'version': 1, 'profile': 'realesrgan-x2plus', 'width': a.width,
           'strength': a.strength, 'tile': 192, 'padding': 24,
           'model_url': MODEL_URL, 'spandrel': '0.4.1'}
    q.settings('baseline', a.width)  # validate width contract
    sha = q.digest(source)
    if a.mode == 'final':
        if not a.approval: raise ValueError('Sample manifest required')
        accepted = json.loads(Path(a.approval).read_text())
        if accepted.get('job_id') != a.job_id:
            raise ValueError('Sample belongs to another quality job')
        q.check_approval(accepted, sha, cfg, a.accept_sample)
    elif (not math.isfinite(a.start) or not math.isfinite(a.seconds) or
          not 3 <= a.seconds <= 5 or a.start < 0 or
          a.start + a.seconds > q.duration(info)):
        raise ValueError('Choose a valid 3–5 second sample')
    out = q.output_dir(a.output, source)
    weights = Path(a.weights).resolve()
    if not weights.exists():
        weights.parent.mkdir(parents=True, exist_ok=True)
        urllib.request.urlretrieve(MODEL_URL, weights)
    weight_sha = q.digest(weights)
    if a.mode == 'final':
        approval = json.loads(Path(a.approval).read_text())
        if approval.get('model_sha256') != weight_sha:
            raise ValueError('Model weights changed since sample; repeat sample')
    model = ModelLoader(device='cuda').load_from_file(str(weights))
    if not isinstance(model, ImageModelDescriptor) or model.scale != 2:
        raise ValueError('Expected an x2 image restoration model')
    model.eval()
    frames, processed = out/'frames', out/'processed'
    frames.mkdir(); processed.mkdir()
    start = a.start if a.mode == 'sample' else 0
    length = a.seconds if a.mode == 'sample' else q.duration(info)
    # Accurate trim after input; no fps interpolation. CFR checked above.
    q.ff('-n', '-i', source, '-ss', str(start), '-t', str(length),
         '-map', '0:v:0', '-fps_mode', 'passthrough', frames/'%06d.png')
    baseline_cfg = q.settings('baseline', a.width)
    q.encode(source, out/'before.mp4', baseline_cfg, start, length, baseline=True)
    for i, path in enumerate(sorted(frames.glob('*.png'))):
        image = Image.open(path).convert('RGB')
        pixels = np.asarray(image, dtype=np.float32)/255
        h,w = pixels.shape[:2]
        result = np.empty((h*2,w*2,3), dtype=np.uint8)
        # Overlapping context cropped away; full tensors stay off GPU.
        with torch.inference_mode():
            for y in range(0,h,192):
                for x in range(0,w,192):
                    y0,x0 = max(0,y-24),max(0,x-24)
                    y1,x1 = min(h,y+192+24),min(w,x+192+24)
                    tile = torch.from_numpy(pixels[y0:y1,x0:x1].copy()).permute(2,0,1).unsqueeze(0).cuda()
                    pred = model(tile).clamp(0,1)[0].permute(1,2,0).cpu().numpy()
                    th,tw = min(192,h-y),min(192,w-x)
                    crop = pred[(y-y0)*2:(y-y0+th)*2,(x-x0)*2:(x-x0+tw)*2]
                    result[y*2:(y+th)*2,x*2:(x+tw)*2] = (crop*255+.5).astype(np.uint8)
        tw = a.width or w
        th = round((h*tw/w)/2)*2
        candidate = Image.fromarray(result).resize((tw,th), Image.Resampling.LANCZOS)
        original = image.resize((tw,th), Image.Resampling.LANCZOS)
        Image.blend(original,candidate,a.strength).save(processed/path.name)
        if i % 30 == 0: print('Processed frames:', i+1, flush=True)
    if not list(processed.glob('*.png')): raise ValueError('No frames extracted')
    after = out/('after.mp4' if a.mode == 'sample' else 'final.mp4')
    q.ff('-n', '-framerate', str(Fraction(v['avg_frame_rate'])), '-i', processed/'%06d.png',
         '-i', out/'before.mp4', '-map', '0:v:0', '-map', '1:a:0?',
         '-c:v', 'libx264', '-threads', '2', '-crf', '18', '-pix_fmt', 'yuv420p',
         '-c:a', 'copy', '-map_metadata', '-1', '-movflags', '+faststart', after)
    technical = q.verify(after, info, length, a.width)
    if a.mode == 'sample': q.comparison(out/'before.mp4', after, out/'comparison.mp4')
    manifest = {'job_id':a.job_id, 'stage':a.mode, 'source_sha256':sha,
        'settings':cfg, 'model_sha256':weight_sha, 'gpu':torch.cuda.get_device_name(0),
        'torch_version':torch.__version__, 'source':q.metadata(info), 'output':technical,
        'after_sha256':q.digest(after), 'technical_qa':'PASS',
        'status':'NEEDS_VISUAL_REVIEW', 'visual_review':'NOT_PERFORMED',
        'audio_listening':'NOT_PERFORMED', 'start':start, 'seconds':length,
        'warning':'Framewise model: inspect temporal flicker, faces, text, tile seams. No guaranteed recovery.'}
    q.write_json(out/'manifest.json',manifest)
    # Only temporary frame sequences owned by this run are removed.
    shutil.rmtree(frames); shutil.rmtree(processed)
    print('Technical QA PASS. Visual review required:', out)

if __name__ == '__main__':
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--mode',choices=['sample','final'],default='sample')
    p.add_argument('--input',required=True); p.add_argument('--output',required=True)
    p.add_argument('--job-id',required=True); p.add_argument('--width',type=int,default=0)
    p.add_argument('--start',type=float,default=0); p.add_argument('--seconds',type=float,default=3)
    p.add_argument('--strength',type=float,default=.5)
    p.add_argument('--weights',default='/tmp/video-quality/RealESRGAN_x2plus.pth')
    p.add_argument('--rights-confirmed',action='store_true')
    p.add_argument('--approval'); p.add_argument('--accept-sample',action='store_true')
    main(p.parse_args())
