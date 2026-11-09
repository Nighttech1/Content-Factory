#!/usr/bin/env python3
"""Video quality pipeline. Standard library + native FFmpeg; no API calls."""
import argparse
import hashlib
import json
import math
import os
from pathlib import Path
import re
import subprocess
import sys
from fractions import Fraction

PROFILES = {
    'baseline': '',
    'gentle': 'unsharp=5:5:0.30:5:5:0',
    'denoise': 'hqdn3d=1.0:0.75:1.5:1.0,unsharp=5:5:0.25:5:5:0',
    'lanczos': '',
}

def execute(args, timeout=900):
    r = subprocess.run([str(x) for x in args], capture_output=True, text=True,
                       timeout=timeout)
    if r.returncode:
        # Do not log untrusted file metadata / remote URL in a CI error.
        raise ValueError(f'{Path(str(args[0])).name} failed, exit={r.returncode}')
    return r.stdout

def ff(*args):
    return execute(['ffmpeg', '-hide_banner', '-v', 'error', '-nostdin',
                    '-threads', '1', '-filter_threads', '1', '-filter_complex_threads', '1', *args])

def digest(path):
    h = hashlib.sha256()
    with Path(path).open('rb') as f:
        for b in iter(lambda: f.read(1024 * 1024), b''):
            h.update(b)
    return h.hexdigest()

def probe(path):
    return json.loads(execute(['ffprobe', '-v', 'error', '-show_streams',
                              '-show_format', '-of', 'json', path]))

def video(info):
    streams = [s for s in info['streams'] if s['codec_type'] == 'video'
               and not s.get('disposition', {}).get('attached_pic')]
    if len(streams) != 1:
        raise ValueError('Exactly one video stream required')
    return streams[0]

def duration(info):
    n = float(info['format']['duration'])
    if not math.isfinite(n) or not 0 < n <= 180:
        raise ValueError('Supported duration: >0 and <=180 seconds')
    return n

def rate(stream):
    return float(Fraction(stream.get('avg_frame_rate', '0/1')))

def validate_media(info, processing=False):
    s = video(info)
    duration(info)
    if s['width'] * s['height'] > 4096 * 4096:
        raise ValueError('Input exceeds pixel limit')
    if processing:
        if len([x for x in info['streams'] if x['codec_type'] == 'audio']) > 1:
            raise ValueError('Multiple audio tracks: choose a track explicitly before processing')
        if s.get('color_transfer') in ('smpte2084', 'arib-std-b67'):
            raise ValueError('HDR needs a dedicated color-managed conversion; STOP')
        if s.get('sample_aspect_ratio', '1:1') not in ('1:1', '0:1', 'N/A'):
            raise ValueError('Non-square pixels: explicit conversion required')
        rotation = float(s.get('tags', {}).get('rotate', 0))
        if rotation or any(float(x.get('rotation', 0)) for x in s.get('side_data_list', [])):
            raise ValueError('Rotated input: normalize orientation explicitly first')
        if s['width'] % 2 or s['height'] % 2:
            raise ValueError('Odd dimensions: explicit framing decision required')
        if not 0 < rate(s) <= 120:
            raise ValueError('Unsupported frame rate')
        if s.get('field_order', 'progressive') not in ('progressive', 'unknown'):
            raise ValueError('Interlaced input requires a dedicated deinterlace decision')

def metadata(info):
    # Whitelist technical fields; omit file path, tags, device/author metadata.
    fields = ['codec_type', 'codec_name', 'width', 'height', 'pix_fmt',
              'r_frame_rate', 'avg_frame_rate', 'sample_aspect_ratio',
              'color_space', 'color_transfer', 'color_primaries', 'color_range',
              'sample_rate', 'channels', 'bit_rate', 'field_order']
    return {'duration': duration(info), 'size': int(info['format']['size']),
            'streams': [{k: s[k] for k in fields if k in s} for s in info['streams']]}

def settings(profile, width):
    if profile not in PROFILES:
        raise ValueError('Unknown profile')
    if width and (not 16 <= width <= 2160 or width % 2):
        raise ValueError('Target width must be even, 16..2160; 0 preserves dimensions')
    return {'version': 1, 'profile': profile, 'width': width,
            'filter': PROFILES[profile], 'crf': 18, 'codec': 'libx264'}

def output_dir(path, source=None):
    p = Path(path).resolve()
    if source and (p == Path(source).resolve() or p in Path(source).resolve().parents):
        raise ValueError('Output must not contain the input')
    if p.exists() and any(p.iterdir()):
        raise ValueError('Output directory must be new or empty')
    p.mkdir(parents=True, exist_ok=True)
    return p

def write_json(path, data):
    Path(path).write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')

def filters(config, baseline=False):
    parts = []
    if not baseline and config['filter']:
        parts.append(config['filter'])
    if config['width']:
        parts.append(f"scale={config['width']}:-2:flags=lanczos")
    parts.extend(['setsar=1', 'format=yuv420p'])
    return ','.join(parts)

def encode(source, out, config, start=0, length=None, baseline=False):
    args = ['-n', '-i', source, '-ss', str(start)]
    if length is not None:
        args += ['-t', str(length)]
    ff(*args, '-map', '0:v:0', '-map', '0:a:0?', '-vf', filters(config, baseline),
       '-fps_mode', 'passthrough', '-c:v', 'libx264', '-threads', '2',
       '-preset', 'medium', '-crf', '18', '-c:a', 'aac', '-b:a', '192k',
       '-map_metadata', '-1', '-movflags', '+faststart', out)

def verify(out, source_info, expected_duration, width=0):
    info = probe(out)
    v, original = video(info), video(source_info)
    if v['codec_name'] != 'h264' or v['pix_fmt'] != 'yuv420p':
        raise ValueError('Output codec/pixel format mismatch')
    target_w = width or original['width']
    if v['width'] != target_w:
        raise ValueError('Output width mismatch')
    if abs(v['height'] / v['width'] - original['height'] / original['width']) > 2 / target_w:
        raise ValueError('Output aspect ratio changed')
    if v.get('sample_aspect_ratio', '1:1') != '1:1':
        raise ValueError('Output SAR mismatch')
    if abs(duration(info) - expected_duration) > max(.12, 2 / rate(original)):
        raise ValueError('Output duration mismatch')
    if abs(rate(v) - rate(original)) > max(.05, rate(original) * .01):
        raise ValueError('Output frame rate drift')
    input_audio = [s for s in source_info['streams'] if s['codec_type'] == 'audio']
    output_audio = [s for s in info['streams'] if s['codec_type'] == 'audio']
    if bool(input_audio) != bool(output_audio):
        raise ValueError('Audio presence mismatch')
    if output_audio and output_audio[0]['codec_name'] != 'aac':
        raise ValueError('Output audio must be AAC')
    ff('-xerror', '-i', out, '-map', '0:v:0', '-map', '0:a:0?', '-f', 'null', '-')
    return metadata(info)

def comparison(before, after, out):
    # Identical time range, both shown at 540px width. Sound from before only.
    ff('-n', '-i', before, '-i', after, '-filter_complex',
       '[0:v]scale=540:-2,setsar=1[a];[1:v]scale=540:-2,setsar=1[b];[a][b]hstack=inputs=2[v]',
       '-map', '[v]', '-map', '0:a:0?', '-c:v', 'libx264', '-threads', '2',
       '-crf', '18', '-c:a', 'aac', '-map_metadata', '-1', '-movflags', '+faststart', out)

def check_approval(manifest, source_sha, config, accept):
    if not accept:
        raise ValueError('Final requires explicit acceptance of the sample')
    if manifest.get('stage') != 'sample' or manifest.get('source_sha256') != source_sha:
        raise ValueError('Sample belongs to a different source or stage')
    if manifest.get('settings') != config or manifest.get('technical_qa') != 'PASS':
        raise ValueError('Sample settings/technical QA mismatch')
    if not manifest.get('after_sha256'):
        raise ValueError('Missing sample fingerprint')

def process(args):
    if not re.fullmatch(r'VQ-\d{6}-\d{2,3}', args.job_id):
        raise ValueError('Use technical job ID VQ-YYYYMM-NN')
    source = Path(args.input).resolve()
    if not source.is_file() or source.stat().st_size > 500 * 1024 * 1024:
        raise ValueError('Input missing or exceeds 500 MiB')
    info = probe(source)
    validate_media(info, args.mode != 'diagnose')
    source_sha = digest(source)
    cfg = settings(args.profile, args.width)
    if args.mode != 'diagnose' and not args.rights_confirmed:
        raise ValueError('Rights/consents must be confirmed before processing')
    if args.mode == 'final':
        if not args.approval:
            raise ValueError('Final requires a sample manifest')
        accepted = json.loads(Path(args.approval).read_text())
        if accepted.get('job_id') != args.job_id:
            raise ValueError('Sample belongs to another quality job')
        check_approval(accepted, source_sha, cfg, args.accept_sample)
    if args.mode == 'sample' and (not math.isfinite(args.start) or
            not math.isfinite(args.seconds) or args.start < 0 or
            not 3 <= args.seconds <= 5 or args.start + args.seconds > duration(info) + .001):
        raise ValueError('Sample must be a valid 3–5 second range inside source')
    out = output_dir(args.output, source)
    manifest = {'job_id': args.job_id, 'stage': args.mode, 'source_sha256': source_sha,
                'source': metadata(info), 'settings': cfg,
                'ffmpeg_version': execute(['ffmpeg', '-version']).splitlines()[0],
                'status': 'NEEDS_VISUAL_REVIEW', 'visual_review': 'NOT_PERFORMED',
                'audio_listening': 'NOT_PERFORMED'}
    ff('-xerror', '-i', source, '-map', '0:v:0', '-map', '0:a:0?', '-f', 'null', '-')
    if args.mode == 'diagnose':
        for i in range(5):
            t = max(0, duration(info) * (i + .5) / 5)
            ff('-n', '-ss', str(t), '-i', source, '-frames:v', '1',
               '-vf', 'scale=540:-2', '-update', '1', out / f'frame-{i+1}.jpg')
        manifest['technical_qa'] = 'PASS'
        manifest['observations'] = [
            'Metadata and frames do not establish motion quality or source resolution.',
            'Inspect faces, motion blur, compression blocks, lighting, text and upload copy.',
            'Compare original camera file, this export and the social-platform download.',
            'Do not infer a quality score from bitrate or pixel dimensions.']
    elif args.mode == 'sample':
        encode(source, out / 'before.mp4', cfg, args.start, args.seconds, baseline=True)
        encode(source, out / 'after.mp4', cfg, args.start, args.seconds)
        verify(out / 'before.mp4', info, args.seconds, args.width)
        manifest['output'] = verify(out / 'after.mp4', info, args.seconds, args.width)
        comparison(out / 'before.mp4', out / 'after.mp4', out / 'comparison.mp4')
        ff('-xerror', '-i', out / 'comparison.mp4', '-f', 'null', '-')
        manifest.update({'technical_qa': 'PASS', 'start': args.start,
                         'seconds': args.seconds, 'after_sha256': digest(out / 'after.mp4'),
                         'comparison_layout': 'LEFT: baseline, RIGHT: candidate; preview only'})
    else:
        encode(source, out / 'final.mp4', cfg)
        manifest['output'] = verify(out / 'final.mp4', info, duration(info), args.width)
        manifest.update({'technical_qa': 'PASS', 'output_sha256': digest(out / 'final.mp4'),
                         'sample_accepted_by': os.environ.get('GITHUB_ACTOR', 'local operator'),
                         'accepted_sample_sha256': json.loads(Path(args.approval).read_text())['after_sha256']})
    write_json(out / 'manifest.json', manifest)
    (out / 'REVIEW.md').write_text(
        '# Проверка качества\n\nСтатус: NEEDS_VISUAL_REVIEW.\n'
        'Техническая проверка не доказывает улучшение.\n'
        'В comparison.mp4 слева baseline, справа candidate. Смотри также оба файла '
        'в полном размере.\n\nПроверь: лица/кожу, сетку/мелкие детали, движение, '
        'мерцание, ореолы, буквы, цвет, звук и синхронизацию.\n'
        'Решение: принять / отклонить / оставить оригинал. Причина: ____.\n')
    return manifest

def parser():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--mode', choices=['diagnose', 'sample', 'final'], required=True)
    p.add_argument('--input', required=True)
    p.add_argument('--output', required=True)
    p.add_argument('--job-id', required=True)
    p.add_argument('--profile', choices=PROFILES, default='gentle')
    p.add_argument('--width', type=int, default=0)
    p.add_argument('--start', type=float, default=0)
    p.add_argument('--seconds', type=float, default=3)
    p.add_argument('--rights-confirmed', action='store_true')
    p.add_argument('--approval')
    p.add_argument('--accept-sample', action='store_true')
    return p

if __name__ == '__main__':
    try:
        m = process(parser().parse_args())
        print(json.dumps({'stage': m['stage'], 'technical_qa': m['technical_qa'],
                          'status': m['status']}))
    except (ValueError, KeyError, OSError, subprocess.SubprocessError) as e:
        print('BLOCKED: ' + str(e), file=sys.stderr)
        sys.exit(1)
