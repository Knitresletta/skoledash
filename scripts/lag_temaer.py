"""Lager CSS-blokkene for temaene i style.css (alle unntatt Lyst og Mørkt).

Hvorfor et script: hvert tema trenger ca. 25 variabler, og flere av dem er
utregnet (lyse varianter som fargeblanding med kortfargen, og mørk eller hvit
tekst på signalknappene etter hva som gir best kontrast). Her skriver du bare
grunnfargene, og scriptet regner ut resten likt for alle temaer.

Verdiene kommer fra artefakten «Skoledash temavalg» (v2.25, 2. november 2026).
Fluttershy ble laget etterpå (v2.26).

Bruk (bare stdlib, ingen venv):
    python3 scripts/lag_temaer.py                 # alle temaene
    python3 scripts/lag_temaer.py fluttershy      # bare ett eller flere

Scriptet skriver CSS til terminalen. Det endrer ikke style.css selv: lim
blokka inn over den gamle for samme tema. Lyst (:root) og Mørkt ligger ikke
her og redigeres direkte i style.css.

Felter per tema: id (= data-theme og nøkkel i TEMAER i app.js), navn
(kommentar over blokka), mørk, bg, card, text, muted, border, primary,
onPrimary (tekst på primærknapper), header (CSS-bakgrunn), headerText,
valgfritt signal (green/amber/red/pink), mønster og kant (px, gir også
kant på kortene og fjerner skygger).
"""
from urllib.parse import quote

LYS_SIGNAL = dict(green='#17733f', amber='#9a5300', red='#b42326', pink='#b02a6f')
MØRK_SIGNAL = dict(green='#4ade80', amber='#fbbf24', red='#fb7185', pink='#f472b6')

TEMAER = [
    dict(id='kontrast', navn='Høy kontrast, B Hvit på svart', mørk=True, bg='#000000', card='#000000', text='#ffffff', muted='#e6e6e6', border='#ffffff', primary='#ffe600', onPrimary='#000000', header='#000000', headerText='#ffffff',
         signal=dict(green='#3dff7a', amber='#ffb000', red='#ff6b6b', pink='#ff8ce8'), kant=2),
    dict(id='under-vann', navn='Under vann, A Dyphav', mørk=True, bg='#04192e', card='#0a2a47', text='#e6f4ff', muted='#9cc7e6', border='#1b4468', primary='#4cc9f0', onPrimary='#04192e', header='linear-gradient(180deg, #031222, #0a3a5c)', headerText='#e6f4ff', mønster='bølger'),
    dict(id='fjellet', navn='På fjellet, B Fjellskumring', mørk=True, bg='#1d1b2e', card='#29263f', text='#f0ecf8', muted='#b3abcb', border='#3d3858', primary='#f2a65a', onPrimary='#2a1700', header='linear-gradient(90deg, #2b2448 0%, #5a3d6e 60%, #9a5222 100%)', headerText='#f0ecf8', mønster='fjell'),
    dict(id='skogen', navn='I skogen, A Granskog', mørk=True, bg='#142019', card='#1c2b22', text='#e4f0e6', muted='#a7c2ad', border='#2c4234', primary='#7fc28e', onPrimary='#0e1a12', header='#0d1711', headerText='#e4f0e6', mønster='trær'),
    dict(id='vulkan', navn='I en vulkan, A Glødende', mørk=True, bg='#170b07', card='#24120b', text='#fff1e8', muted='#f0b48f', border='#40200f', primary='#ff6a2b', onPrimary='#1c0700', header='linear-gradient(90deg, #120500, #5c1a05)', headerText='#fff1e8', mønster='glør'),
    dict(id='fluttershy', navn='Fluttershy (het Equestria til v2.26)', mørk=False, bg='#fff6cf', card='#fffdf2', text='#3b2433', muted='#7a4f66', border='#f6e3a6', primary='#b8407a', onPrimary='#ffffff', header='linear-gradient(90deg, #f4a7c8, #f8c6dc 55%, #fbe6a2)', headerText='#3b2433', mønster='sommerfugler',
         signal=dict(green='#17733f', amber='#9a5300', red='#b42326', pink='#1d6f6c')),
    dict(id='twilight', navn='Twilight (het Cosmic v2 i v2.25)', mørk=True, bg='#080414', card='#12102a', text='#e8ecf8', muted='#9aa3bd', border='#262150', primary='#a78bfa', onPrimary='#0b0620', header='linear-gradient(90deg, #080414, #1a1040)', headerText='#e8ecf8', mønster='stjerner',
         signal=dict(green='#6ee7b7', amber='#fcd34d', red='#fb7185', pink='#ff8ad8')),
    dict(id='rarity', navn='Rarity (het Cute i v2.25)', mørk=False, bg='#f0edff', card='#fdfcff', text='#2a2350', muted='#5f5890', border='#dcd6fb', primary='#5e4fc4', onPrimary='#ffffff', header='linear-gradient(90deg, #b9a2ff, #ffc2e2)', headerText='#2a2350', mønster='skyer'),
]


def rgb(h):
    n = int(h[1:], 16)
    return (n >> 16 & 255, n >> 8 & 255, n & 255)


def bland(farge, bak, prosent):
    """Samme som color-mix(in srgb, farge prosent%, bak)."""
    p = prosent / 100
    return '#' + ''.join(f'{round(a * p + b * (1 - p)):02x}' for a, b in zip(rgb(farge), rgb(bak)))


def lum(h):
    def lin(c):
        c /= 255
        return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    r, g, b = rgb(h)
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)


def kontrast(a, b):
    x, y = sorted([lum(a), lum(b)], reverse=True)
    return (x + 0.05) / (y + 0.05)


def best_tekst(bak):
    return '#ffffff' if kontrast('#ffffff', bak) >= kontrast('#111111', bak) else '#111111'


def svg(innhold, b, h):
    kode = f"<svg xmlns='http://www.w3.org/2000/svg' width='{b}' height='{h}'>{innhold}</svg>"
    return f'url("data:image/svg+xml,{quote(kode, safe="")}")'


def monster(navn, f):
    """Returnerer (bakgrunn, toppfelt). Bare ett av dem brukes per mønster."""
    c, a = f['text'], (0.07 if f['mørk'] else 0.06)
    if navn == 'bølger':
        return svg(f"<path d='M0 15 Q10 5 20 15 T40 15' fill='none' stroke='{c}' stroke-opacity='{a + 0.04:.2f}' stroke-width='1.5'/>", 40, 24), None
    if navn == 'stjerner':
        return svg(f"<g fill='{c}'><circle cx='6' cy='8' r='1' opacity='{a + 0.25:.2f}'/><circle cx='34' cy='22' r='0.7' opacity='{a + 0.2:.2f}'/><circle cx='20' cy='40' r='1.2' opacity='{a + 0.2:.2f}'/><path d='M44 6 l1 3 3 1 -3 1 -1 3 -1 -3 -3 -1 3 -1z' opacity='{a + 0.15:.2f}'/></g>", 52, 52), None
    if navn == 'trær':
        return svg(f"<path d='M12 4 L18 16 H6 Z M12 10 L20 24 H4 Z' fill='{c}' opacity='{a}'/>", 36, 34), None
    if navn == 'glør':
        return svg("<g fill='#ff8a3d'><circle cx='8' cy='30' r='1.3' opacity='0.22'/><circle cx='26' cy='12' r='0.9' opacity='0.18'/><circle cx='40' cy='38' r='1.6' opacity='0.15'/></g>", 48, 48), None
    if navn == 'regnbue':
        return svg("<g opacity='0.16'><circle cx='6' cy='6' r='2' fill='#e0407a'/><circle cx='20' cy='10' r='2' fill='#e8833a'/><circle cx='34' cy='6' r='2' fill='#d9b21a'/><circle cx='12' cy='24' r='2' fill='#3aa65a'/><circle cx='28' cy='26' r='2' fill='#3a7fd9'/><circle cx='40' cy='20' r='2' fill='#8a4fd9'/></g>", 46, 34), None
    if navn == 'skyer':
        return svg(f"<g fill='#ffffff' opacity='{0.05 if f['mørk'] else 0.8}'><ellipse cx='20' cy='20' rx='14' ry='6'/><ellipse cx='28' cy='16' rx='8' ry='6'/><ellipse cx='14' cy='17' rx='6' ry='5'/></g>", 70, 40), None
    if navn == 'sommerfugler':
        return svg("<g opacity='0.22'><path d='M14 14 C6 4 2 12 8 16 C2 20 8 26 14 18 Z' fill='#f08cb8'/><path d='M14 14 C22 4 26 12 20 16 C26 20 20 26 14 18 Z' fill='#f08cb8'/><rect x='13.2' y='11' width='1.6' height='10' rx='0.8' fill='#2a8f8b'/></g>", 56, 48), None
    if navn == 'fjell':
        return None, svg("<path d='M0 30 L14 14 L22 22 L34 6 L48 22 L56 16 L70 30 Z' fill='#ffffff' opacity='0.18'/>", 70, 30)
    return None, None


def blokk(f):
    s = f.get('signal') or (MØRK_SIGNAL if f['mørk'] else LYS_SIGNAL)
    mix_p = 22 if f['mørk'] else 12   # primær-l, som i artefakten
    mix_s = 24 if f['mørk'] else 14   # signal-l (gruppefelter), som i artefakten
    bg_monster, topp_monster = monster(f.get('mønster'), f)
    skygge = ('0 1px 4px 0 rgb(0 0 0 / 0.5)', '0 4px 8px -1px rgb(0 0 0 / 0.6)') if f['mørk'] else None
    v = [
        ('--bg', f['bg']), ('--card', f['card']),
        ('--primary', f['primary']), ('--primary-l', bland(f['primary'], f['card'], mix_p)),
        ('--on-primary', f['onPrimary']),
        # Teksten på spøkelsesknapper: i mørke temaer blir primærfargen for svak mot
        # den tonede bakgrunnen, så der brukes vanlig tekstfarge.
        ('--primary-tekst', f['text'] if f['mørk'] else f['primary']),
        ('--text', f['text']), ('--muted', f['muted']), ('--border', f['border']),
    ]
    for navn in ('green', 'amber', 'red', 'pink'):
        v.append((f'--{navn}', s[navn]))
        v.append((f'--{navn}-l', bland(s[navn], f['card'], mix_s)))
        if navn != 'pink':
            v.append((f'--on-{navn}', best_tekst(s[navn])))
    v.append(('--header-tekst', f['headerText']))
    if bg_monster:
        v.append(('--monster', bg_monster))
    if f.get('kant'):
        v += [('--shadow', 'none'), ('--shadow-md', 'none')]
    elif skygge:
        v += [('--shadow', skygge[0]), ('--shadow-md', skygge[1])]

    linjer = [f'/* {f["navn"]} */', f'[data-theme="{f["id"]}"] {{']
    linjer += [f'    {k}: {val};' for k, val in v]
    linjer.append('}')
    header_bg = f'{topp_monster} repeat-x bottom, {f["header"]}' if topp_monster else f['header']
    linjer += [f'[data-theme="{f["id"]}"] header {{',
               f'    background: {header_bg};',
               f'    border-bottom: {f.get("kant", 1)}px solid {f["border"]};',
               '}']
    if f.get('kant'):
        linjer += [f'[data-theme="{f["id"]}"] .card {{', f'    border: {f["kant"]}px solid {f["border"]};', '}']
    return '\n'.join(linjer)


if __name__ == '__main__':
    import sys
    valgt = sys.argv[1:]
    print('\n\n'.join(blokk(f) for f in TEMAER if not valgt or f['id'] in valgt))
