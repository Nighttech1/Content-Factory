"""Offline guards. Technical validation never grants visual/editor/owner approval."""
import hashlib
import math
import re
from pathlib import Path


class ContractError(ValueError):
    pass


def require(condition, message):
    if not condition:
        raise ContractError(message)


def validate_job(job, asset_root, check_assets=True):
    kind = job.get('case_kind')
    require(kind in ('replay-fixture', 'production'), 'CASE_KIND_REQUIRED')
    if kind == 'production':
        require(bool(re.fullmatch(r'V-\d{6}-CAR-\d{2}', job.get('production_job_id') or '')),
                'PRODUCTION_JOB_ID_REQUIRED')
        require(bool(job.get('brief_version')) and job.get('script_status') == 'ACCEPTED',
                'PRODUCTION_BRIEF_AND_SCRIPT_REQUIRED')
    require(job.get('canvas') == [1080, 1350], 'CANVAS: expected 1080x1350')
    require(len(job.get('backgrounds', [])) == 7, 'SLIDES: type 1 requires seven')
    require(job.get('background_statuses') == ['ACCEPTED'] * 7,
            'BACKGROUND_NOT_ACCEPTED: all seven backgrounds need explicit visual acceptance')
    require(set(job.get('copy', {})) == set('23456'), 'MIDDLE: expected slides 2-6')
    require(set(job.get('positions', {})) == set('23456'), 'GEOMETRY: expected slides 2-6')
    for slide in '23456':
        cards = job['copy'][slide]
        rects = job['positions'][slide]
        require(len(cards) == len(rects) == 3, f'PHRASE_COUNT: slide {slide}')
        for card, rect in zip(cards, rects):
            require(len(card) == 3 and all(isinstance(t, str) and t.strip() and
                    '\n' not in t and '\r' not in t for t in card),
                    f'THREE_NONEMPTY_LINES: slide {slide}')
            require(len(rect) == 4 and all(isinstance(v, (int, float)) and
                    math.isfinite(v) for v in rect), 'GEOMETRY: finite x/y/w/h required')
            x, y, w, h = rect
            require(x >= 0 and y >= 0 and w > 0 and h > 0 and
                    x + w <= 1080 and y + h <= 1350, f'BOUNDS: slide {slide}')
    logo = job['style']['logo']
    require(logo['top'] == logo['right'] == 54, 'LOGO_MARGIN: approved override is 54 px')
    require(0 < logo['width'] < 1080 - 2 * logo['right'], 'LOGO_WIDTH')
    require(job['style']['arrow']['mode'] == 'local-black-white', 'ARROW_COLOR: monochrome only')
    require(job['style']['arrow']['final_slide'] is False, 'FINAL_ARROW: forbidden')
    rgba = job['style']['card_rgba']
    require(len(rgba) == 4 and all(0 <= v <= 1 for v in rgba), 'CARD_RGBA')
    require(job['fonts']['primary']['family'] == 'Noto Serif Display', 'FONT_PRIMARY_MISSING')
    require(job['fonts']['armenian']['family'] == 'Noto Sans Armenian', 'FONT_ARMENIAN_MISSING')
    require(job['fonts']['primary']['path'] == 'NotoSerifDisplay.ttf' and
            job['fonts']['armenian']['path'] == 'NotoSansArmenian.ttf', 'FONT_INPUT_NAMES')
    require(logo['width'] == 160, 'LOGO_WIDTH: current approved replay contract is 160 px')
    require(logo['dark_asset'] == 'logo-dark.png' and logo['light_asset'] == 'logo-light.png',
            'LOGO_ASSET_NAMES')
    if kind == 'production':
        require(not job.get('font_contract_sha_mismatch', False), 'FONT_CONTRACT_UNRESOLVED')
    required = set(job['backgrounds']) | {x['path'] for x in job['fonts'].values()} | {
        job['style']['logo']['dark_asset'], job['style']['logo']['light_asset']}
    root = Path(asset_root).resolve()
    hashes = {}
    for name in sorted(required):
        path = (root / name).resolve()
        require(path.is_relative_to(root), f'ASSET_PATH: outside asset root: {name}')
        expected = job.get('asset_hashes', {}).get(name, '')
        require(len(expected) == 64 and all(c in '0123456789abcdef' for c in expected),
                f'ASSET_HASH_REQUIRED: {name}')
        if check_assets:
            require(path.is_file(), f'ASSET_MISSING: {name}')
            actual = hashlib.sha256(path.read_bytes()).hexdigest()
            require(actual == expected, f'ASSET_HASH_MISMATCH: {name}')
            hashes[name] = actual
    return hashes


def choose_contrast(luminances):
    require(bool(luminances), 'CONTRAST: empty sample')
    require(all(0 <= v <= 1 for v in luminances), 'CONTRAST: invalid luminance')
    scores = {}
    for name in ('black', 'white'):
        ratios = sorted((v + .05) / .05 if name == 'black' else 1.05 / (v + .05)
                        for v in luminances)
        scores[name] = {'p10': ratios[int(len(ratios) * .1)],
                        'median': ratios[len(ratios) // 2]}
    return max(scores, key=lambda key: scores[key]['p10']), scores
