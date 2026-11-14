"""Canonical Chromium export. No automatic fallback and no content approval."""
import argparse
import asyncio
import hashlib
import json
import shutil
from pathlib import Path


async def render(build, executable=None):
    from playwright.async_api import async_playwright
    manifest = json.loads((build / '40-bake-manifest.json').read_text())
    # Reject changed/missing render inputs even if a previous preview looked correct.
    required = {'NotoSerifDisplay.ttf': 'NotoSerifDisplay.ttf',
                'NotoSansArmenian.ttf': 'NotoSansArmenian.ttf'}
    for slide in manifest['slides']:
        required[f'background-{slide["slide"]:02d}.png'] = slide['background']
        required[slide['logo']['source']] = slide['logo']['source']
    for local_name, input_name in required.items():
        path = build / 'assets' / local_name
        expected = manifest['input_hashes'][input_name]
        assert path.is_file() and hashlib.sha256(path.read_bytes()).hexdigest() == expected, f'BUILD_ASSET_CHANGED: {local_name}'
    target = build / 'chromium-output'
    target.mkdir(exist_ok=True)
    report = {'status': 'RUNNING', 'renderer': 'Chromium',
              'visual_approval': False, 'editor_approval': False,
              'owner_approval': False, 'slides': []}
    async with async_playwright() as p:
        options = {'headless': True, 'args': ['--no-sandbox']}
        if executable:
            options['executable_path'] = executable
        browser = await p.chromium.launch(**options)
        try:
            page = await browser.new_page(viewport={'width': 1080, 'height': 1350},
                                          device_scale_factor=1)
            # The offline bake is not authorized to transmit files or call providers.
            async def offline(route):
                if route.request.url.startswith(('file:', 'data:')):
                    await route.continue_()
                else:
                    await route.abort()
            await page.route('**/*', offline)
            for slide in manifest['slides']:
                n = slide['slide']
                await page.goto((build / f'slide-{n:02d}.html').as_uri())
                await page.evaluate('document.fonts.ready')
                checks = await page.evaluate('''() => {
                  const rect = el => { const r=el.getBoundingClientRect();
                    return {x:r.x,y:r.y,w:r.width,h:r.height}; };
                  const lines=[...document.querySelectorAll('.card > div')];
                  const bad=lines.filter(el => {
                    const a=el.getBoundingClientRect(),b=el.parentElement.getBoundingClientRect();
                    return !el.textContent.trim() || el.scrollWidth>el.clientWidth+1 ||
                      a.x<b.x-1 || a.right>b.right+1 || a.y<b.y-1 || a.bottom>b.bottom+1;
                  });
                  const fontFaces=[...document.fonts].map(f=>({family:f.family,status:f.status}));
                  const fontReady=['Noto Serif Display','Noto Sans Armenian'].every(name =>
                    fontFaces.some(f=>f.family.replaceAll(/['"]/g,'')===name && f.status==='loaded'));
                  return {badLines:bad.map(el=>el.textContent),fontReady,fontFaces,
                    texts:lines.map(el=>el.textContent),
                    arrowColors:[...document.querySelectorAll('.arrow path')].map(el=>getComputedStyle(el).stroke),
                    logoSource:document.querySelector('.logo img').getAttribute('src'),
                    cards:document.querySelectorAll('.card').length,
                    lines:lines.length,logo:rect(document.querySelector('.logo')),
                    arrows:document.querySelectorAll('.arrow').length,
                    imagesLoaded:[...document.images].every(im=>im.complete&&im.naturalWidth>0),
                    body:rect(document.body)};
                }''')
                # Cover/CTA use no Armenian text but the face must be loadable explicitly.
                if not checks['fontReady']:
                    await page.evaluate("Promise.all([document.fonts.load('900 32px \"Noto Serif Display\"'),document.fonts.load('700 32px \"Noto Sans Armenian\"')])")
                    checks['fontReady'] = await page.evaluate("document.fonts.check('900 32px \"Noto Serif Display\"') && document.fonts.check('700 32px \"Noto Sans Armenian\"')")
                expected_cards = 3 if 2 <= n <= 6 else 0
                assert not checks['badLines'], f'TEXT_OVERFLOW slide {n}: {checks["badLines"]}'
                assert checks['fontReady'], f'FONT_PRIMARY_MISSING slide {n}'
                assert checks['imagesLoaded'], f'IMAGE_MISSING slide {n}'
                assert checks['texts'] == [line['text'] for card in slide['cards'] for line in card['lines']], f'TEXT_CHANGED slide {n}'
                assert checks['logoSource'] == 'assets/' + slide['logo']['source'], f'LOGO_CHANGED slide {n}'
                assert set(checks['arrowColors']).issubset({'rgb(0, 0, 0)', 'rgb(255, 255, 255)'}), f'ARROW_NOT_MONOCHROME slide {n}'
                assert checks['cards'] == expected_cards and checks['lines'] == expected_cards * 3
                assert checks['arrows'] == int(n < 7), f'ARROW_COUNT slide {n}'
                logo = checks['logo']
                assert abs(logo['y'] - 54) < 1 and abs(1080 - logo['x'] - logo['w'] - 54) < 1
                assert checks['body']['w'] == 1080 and checks['body']['h'] == 1350
                output = target / f'slide-{n:02d}.png'
                await page.screenshot(path=str(output), full_page=False)
                from PIL import Image
                with Image.open(output) as im:
                    assert im.size == (1080, 1350)
                report['slides'].append({'slide': n, 'checks': checks,
                    'sha256': hashlib.sha256(output.read_bytes()).hexdigest()})
        finally:
            await browser.close()
    report['status'] = 'TECHNICAL_PASS_PENDING_VISUAL_QA'
    return report


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--build', type=Path, required=True)
    parser.add_argument('--chromium', help='Explicit executable, otherwise Playwright-managed Chromium')
    args = parser.parse_args()
    build = args.build.resolve()
    try:
        report = asyncio.run(render(build, args.chromium))
        code = 0
    except Exception as exc:
        # Never accept a stale report from an earlier successful run.
        report = {'status': 'BLOCKED_OR_FAILED', 'renderer': 'Chromium',
                  'error': str(exc)[:4000], 'visual_approval': False,
                  'editor_approval': False, 'owner_approval': False}
        code = 2
    build.mkdir(parents=True, exist_ok=True)
    (build / 'canonical-report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2))
    print(json.dumps({'status': report['status'], 'report': str(build / 'canonical-report.json')}))
    return code


if __name__ == '__main__':
    raise SystemExit(main())
