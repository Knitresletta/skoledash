"""Henter Fluent Emoji Flat-filene for emojiene Skoledash bruker.

Kjør fra repoets rot:  python3 -I ikoner/hent.py <sti til klone av microsoft/fluentui-emoji>

Klon tynt, repoet er stort:
  git clone --filter=blob:none --no-checkout --depth 1 https://github.com/microsoft/fluentui-emoji.git
  cd fluentui-emoji
  git sparse-checkout set --no-cone '/LICENSE' '/assets/*/metadata.json' '/assets/*/Flat/*' '/assets/*/Default/Flat/*'
  git checkout

Scriptet leser index.html, app.js og tekster.js, finner hvilke av Fluents emoji som står der,
og skriver ikoner/<kodepunkt>.svg (uten FE0F, flere kodepunkt bundet med -), ikoner/LICENSE
og ikoner/liste.js (IKONER-settet app.js bytter). SVG-er som ikke brukes lenger, slettes.
Bare stdlib.
"""
import json
import pathlib
import shutil
import sys

ROT = pathlib.Path(__file__).resolve().parent.parent
UT = ROT / 'ikoner'


def nøkkel(glyph):
    return '-'.join(f'{ord(c):x}' for c in glyph)


def main(repo):
    repo = pathlib.Path(repo)
    tekst = ''.join((ROT / f).read_text() for f in ('index.html', 'app.js', 'tekster.js')).replace('️', '')
    brukt = {}
    for meta in sorted(repo.glob('assets/*/metadata.json')):
        d = json.loads(meta.read_text())
        glyph = (d.get('glyph') or '').replace('️', '')
        if not glyph or glyph not in tekst:
            continue
        flat = sorted(meta.parent.glob('Flat/*_flat.svg')) or sorted(meta.parent.glob('Default/Flat/*_flat_default.svg'))
        if not flat:
            continue
        svg = flat[0].read_text()
        if '<script' in svg.lower() or 'onload' in svg.lower():
            print('hopper over (skript i fila):', meta.parent.name)
            continue
        brukt[nøkkel(glyph)] = (svg, meta.parent.name)
    for p in UT.glob('*.svg'):
        if p.stem not in brukt:
            p.unlink()
            print('slettet', p.name)
    for k, (svg, navn) in brukt.items():
        (UT / f'{k}.svg').write_text(svg)
    shutil.copy(repo / 'LICENSE', UT / 'LICENSE')
    (UT / 'liste.js').write_text(
        '// Generert av ikoner/hent.py, ikke rediger for hånd. Kodepunktene (uten FE0F, bundet\n'
        '// med -) som har en fil i ikoner/. Lastes før app.js; tegnIkoner() bytter bare disse.\n'
        f'const IKONER = new Set({json.dumps(sorted(brukt))});\n')
    print(len(brukt), 'ikoner,', sum(len(s) for s, _ in brukt.values()) // 1024, 'KB')


if __name__ == '__main__':
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(sys.argv[1])
