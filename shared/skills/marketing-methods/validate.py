"""Offline checks for imported document integrity and concrete role routing."""
from pathlib import Path
import hashlib
import json
import re

ROOT = Path(__file__).resolve().parents[3]
ADAPTER = ROOT / 'shared/skills/marketing-methods'
VENDOR = ROOT / 'shared/vendor/marketing-methods'


def require(condition, message):
    if not condition:
        raise ValueError(message)


def main():
    sources = json.loads((VENDOR / 'SOURCES.json').read_text())
    routes = json.loads((ADAPTER / 'routing.json').read_text())
    expected = set()
    for package in sources['packages']:
        require(re.fullmatch(r'[0-9a-f]{40}', package['commit']), 'Unpinned source')
        license_paths = [f['path'] for f in package['files'] if Path(f['path']).name == 'LICENSE']
        require(license_paths, 'Missing upstream license')
        for entry in package['files']:
            path = ROOT / entry['path']
            require(path.is_file() and not path.is_symlink(), 'Missing source: ' + entry['path'])
            require(path.resolve().is_relative_to(VENDOR), 'Source outside vendor')
            expected.add(path)
            raw = path.read_bytes()
            require(len(raw) == entry['bytes'], 'Source length drift: ' + entry['path'])
            require(hashlib.sha256(raw).hexdigest() == entry['sha256'], 'Source hash drift: ' + entry['path'])
            require('/blob/' + package['commit'] + '/' in entry['source_url'], 'Source URL not pinned')
            require(path.suffix == '.md' or path.name in ('LICENSE', 'NOTICE'), 'Executable imported')
    actual = {p for package in sources['packages'] for p in (VENDOR / package['id']).rglob('*') if p.is_file()}
    require(actual == expected, 'Unmanifested/missing upstream file')

    modules = set()
    for kind in ('roles', 'pipelines', 'skills'):
        for route in routes[kind]:
            path = ROOT / route['path']
            require(path.is_file(), 'Missing route entry: ' + route['path'])
            text = path.read_text()
            require('shared/skills/marketing-methods/SKILL.md' in text, 'No adapter hook: ' + route['path'])
            for module in route['modules']:
                target = 'shared/skills/marketing-methods/modules/' + module + '.md'
                require(target in text, 'No role-specific module hook: ' + route['path'])
                require((ROOT / target).is_file(), 'Missing module: ' + target)
                modules.add(module)
    require(modules == {p.stem for p in (ADAPTER / 'modules').glob('*.md')}, 'Unrouted module')

    active = [ADAPTER / 'SKILL.md'] + sorted((ADAPTER / 'modules').glob('*.md'))
    referenced_sources = set()
    for path in active:
        text = path.read_text()
        require(not re.search(r'\$\{CLAUDE_PLUGIN_ROOT\}|printenv|npx |publish_direct\.py', text), 'Upstream runtime leaked into adapter')
        for link in re.findall(r'\]\(([^)]+)\)', text):
            if '://' in link or link.startswith('#'):
                continue
            target = (path.parent / link.split('#')[0]).resolve()
            require(target.is_file(), 'Broken adapter link: ' + str(path) + ': ' + link)
            if target.is_relative_to(VENDOR):
                referenced_sources.add(target)
    source_skills = {p.resolve() for p in expected if p.name == 'SKILL.md'}
    require(source_skills <= referenced_sources, 'Imported method has no adapter use')
    print(f'PASS: {len(sources["packages"])} pinned repositories, {len(expected)} verified source files, '
          f'{len(source_skills)} source methods, {len(modules)} modules, '
          f'{len(routes["roles"])} roles, {len(routes["pipelines"])} pipelines, {len(routes["skills"])} existing skills')
    print('Validation is offline. Content production and external API behavior were not tested.')


if __name__ == '__main__':
    main()
