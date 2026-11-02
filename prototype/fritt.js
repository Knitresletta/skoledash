'use strict';
// Prototype for modell A: fritt oppsett.
//
// Hvert kort har { x, y, b, h } i PROSENT av flata (bredde for x og b, høyde for
// y og h), og z for hvilket kort som ligger øverst. Prosent gjør at bordet beholder
// komposisjonen fra laptop til tavle. Under et drag regner vi i piksler (det er det
// pekeren gir oss), og gjør om til prosent igjen når kortet slippes.
//
// Magneter: kanter som kommer innenfor MAGNET_PX av flatekanten eller en kant på et
// annet kort, klikker seg fast. «Ved siden av» betyr med AVSTAND_PX mellomrom, så
// kortene får samme luft som i dagens kolonner. Alt-tasten slår magnetene av.

const LAGRINGSNØKKEL = 'prototype-fritt';
const MAGNET_PX = 8;
const AVSTAND_PX = 12;

const NAVN = ['Aisha', 'Bjørn', 'Cecilie', 'Daniel', 'Emma', 'Filip', 'Guro', 'Henrik',
  'Ida', 'Jonas', 'Kari', 'Liam', 'Maja', 'Noah', 'Olivia', 'Petter', 'Ronja', 'Sander',
  'Tiril', 'Ulrik', 'Vilde', 'William', 'Ylva', 'Zara', 'Åsmund', 'Ørjan'];

function standardKort() {
  return [
    { id: 'klokke',   tittel: '🕐 Klokke',    type: 'klokke',   x: 0,  y: 0,  b: 24, h: 24, minB: 160, minH: 110 },
    { id: 'trekk',    tittel: '🎲 Trekk',     type: 'trekk',    x: 0,  y: 27, b: 24, h: 30, minB: 160, minH: 120 },
    { id: 'timer',    tittel: '⏱ Timer',      type: 'timer',    x: 0,  y: 60, b: 24, h: 40, minB: 160, minH: 110 },
    { id: 'dagsplan', tittel: '📋 Dagsplan',  type: 'dagsplan', x: 25.5, y: 0, b: 47, h: 58, minB: 200, minH: 120 },
    { id: 'notat',    tittel: '📝 Notat',     type: 'notat',    x: 25.5, y: 61, b: 47, h: 39, minB: 160, minH: 100 },
    { id: 'elever',   tittel: '👥 Elevliste', type: 'elever',   x: 74, y: 0,  b: 26, h: 72, minB: 160, minH: 120 },
  ].map((k, i) => ({ ...k, z: i + 1 }));
}

let kortene = hent();
const flateEl = document.getElementById('flate');

function hent() {
  try {
    const lagret = JSON.parse(localStorage.getItem(LAGRINGSNØKKEL));
    if (Array.isArray(lagret) && lagret.length) return lagret;
  } catch { /* ødelagt lagring: start på nytt */ }
  return standardKort();
}

function lagre() {
  localStorage.setItem(LAGRINGSNØKKEL, JSON.stringify(kortene));
}

const klamp = (v, min, maks) => Math.max(min, Math.min(maks, v));
const rund = v => Math.round(v * 100) / 100;

// ===================== Tegning =====================

function innholdFor(kort) {
  switch (kort.type) {
    case 'klokke':   return '<div class="stor" data-klokke></div>';
    case 'trekk':    return '<div class="stor" data-trukket>?</div><button type="button" data-trekk>Trekk en elev</button>';
    case 'timer':    return '<div class="stor">10:00</div>';
    case 'dagsplan': return '<ul><li>08.30 Morgenmøte</li><li>08.45 Matte: brøk</li><li>09.30 Friminutt</li><li>09.45 Norsk: lesing</li><li>10.30 Mat</li><li>11.00 Uteskole</li><li>12.30 Engelsk</li><li>13.15 Slutt</li></ul>';
    case 'notat':    return '<textarea placeholder="Skriv et notat..."></textarea>';
    case 'elever':   return `<ul>${NAVN.map(n => `<li>${n}</li>`).join('')}</ul>`;
    default:         return '<p>Et tomt kort.</p>';
  }
}

function lagKortEl(kort) {
  const el = document.createElement('section');
  el.className = 'kort';
  el.id = `kort-${kort.id}`;
  el.innerHTML = `
    <header class="kort-topp"><span class="grep">⠿</span><h2></h2>
      <button class="lukk" type="button" title="Fjern kortet">×</button></header>
    <div class="kort-innhold">${innholdFor(kort)}</div>
    ${['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'].map(k => `<div class="kant" data-kant="${k}"></div>`).join('')}`;
  el.querySelector('h2').textContent = kort.tittel;

  el.querySelector('.kort-topp').addEventListener('pointerdown', e => {
    if (e.target.closest('.lukk')) return;
    startOperasjon(e, kort, null);
  });
  el.querySelectorAll('.kant').forEach(h =>
    h.addEventListener('pointerdown', e => startOperasjon(e, kort, h.dataset.kant)));
  // Klikk hvor som helst i kortet løfter det fram, uten å stoppe vanlige klikk.
  el.addEventListener('pointerdown', () => løftFram(kort), true);
  el.querySelector('.lukk').addEventListener('click', () => {
    kortene = kortene.filter(k => k !== kort);
    el.remove();
    lagre();
  });
  const trekkKnapp = el.querySelector('[data-trekk]');
  if (trekkKnapp) trekkKnapp.addEventListener('click', () => {
    el.querySelector('[data-trukket]').textContent = NAVN[Math.floor(Math.random() * NAVN.length)];
  });
  flateEl.appendChild(el);
  return el;
}

function plasser(kort) {
  const el = document.getElementById(`kort-${kort.id}`) ?? lagKortEl(kort);
  el.style.left   = `${kort.x}%`;
  el.style.top    = `${kort.y}%`;
  el.style.width  = `${kort.b}%`;
  el.style.height = `${kort.h}%`;
  el.style.zIndex = kort.z;
}

// Rekkefølgen kortene stables i på smal skjerm: ovenfra og ned, så venstre mot høyre.
function settStabelRekkefølge() {
  [...kortene]
    .sort((a, b) => a.y - b.y || a.x - b.x)
    .forEach((k, i) => { document.getElementById(`kort-${k.id}`).style.order = i; });
}

function tegnAlt() {
  flateEl.innerHTML = '';
  kortene.forEach(plasser);
  settStabelRekkefølge();
}

// Gir kortet høyest z, og nummererer de andre 1..n på nytt så tallene ikke vokser
// for evig.
function løftFram(kort) {
  const sortert = kortene.filter(k => k !== kort).sort((a, b) => a.z - b.z);
  sortert.push(kort);
  sortert.forEach((k, i) => {
    k.z = i + 1;
    document.getElementById(`kort-${k.id}`).style.zIndex = k.z;
  });
}

// ===================== Magneter =====================

// Finner den nærmeste kandidaten for hver av kantene. Returnerer { delta, linje }
// for den kanten som er nærmest (innenfor MAGNET_PX), eller null.
function nærmesteMagnet(kanter, kandidaterPerKant) {
  let beste = null;
  kanter.forEach((kant, i) => {
    kandidaterPerKant[i].forEach(k => {
      const delta = k - kant;
      if (Math.abs(delta) <= MAGNET_PX && (!beste || Math.abs(delta) < Math.abs(beste.delta))) {
        beste = { delta, linje: k };
      }
    });
  });
  return beste;
}

// Kandidater for «start»-kanten (venstre/topp) og «slutt»-kanten (høyre/bunn) langs
// én akse. andre = de andre kortene i piksler, pos/str = 'x','b' eller 'y','h'.
function kandidater(andre, pos, str, total) {
  const start = [0];
  const slutt = [total];
  andre.forEach(o => {
    start.push(o[pos], o[pos] + o[str] + AVSTAND_PX);  // flukt med, eller rett etter
    slutt.push(o[pos] + o[str], o[pos] - AVSTAND_PX);  // flukt med, eller rett før
  });
  return { start, slutt };
}

function visHjelpelinjer(loddrett, vannrett) {
  flateEl.querySelectorAll('.linje-hjelp').forEach(l => l.remove());
  if (loddrett != null) {
    const l = document.createElement('div');
    l.className = 'linje-hjelp loddrett';
    l.style.left = `${loddrett}px`;
    flateEl.appendChild(l);
  }
  if (vannrett != null) {
    const l = document.createElement('div');
    l.className = 'linje-hjelp vannrett';
    l.style.top = `${vannrett}px`;
    flateEl.appendChild(l);
  }
}

// ===================== Flytte og endre størrelse =====================

// kant = null betyr flytt hele kortet; ellers en av n, s, e, w, ne, nw, se, sw.
function startOperasjon(e, kort, kant) {
  if (e.button !== 0) return;
  if (window.matchMedia('(max-width: 960px)').matches) return; // stabelvisning
  e.preventDefault();
  e.stopPropagation();

  const flate = flateEl.getBoundingClientRect();
  const W = flate.width;
  const H = flate.height;
  const tilPx = k => ({ x: k.x / 100 * W, y: k.y / 100 * H, b: k.b / 100 * W, h: k.h / 100 * H });
  const start = tilPx(kort);
  const andre = kortene.filter(k => k !== kort).map(tilPx);
  const kx = kandidater(andre, 'x', 'b', W);
  const ky = kandidater(andre, 'y', 'h', H);
  const minB = Math.min(kort.minB, W);
  const minH = Math.min(kort.minH, H);
  const startX = e.clientX;
  const startY = e.clientY;

  const el = document.getElementById(`kort-${kort.id}`);
  const fanger = e.currentTarget;
  fanger.setPointerCapture(e.pointerId);
  el.classList.add('aktiv');
  document.body.classList.add(kant ? 'endrer-størrelse' : 'flytter');

  let r = { ...start };

  function vedFlytt(ev) {
    const dx = ev.clientX - startX;
    const dy = ev.clientY - startY;
    const magnet = !ev.altKey;
    let linjeX = null;
    let linjeY = null;

    if (!kant) {
      // Flytt: begge kantene kan treffe en magnet, kortet beholder størrelsen.
      r = { ...start, x: start.x + dx, y: start.y + dy };
      if (magnet) {
        const mx = nærmesteMagnet([r.x, r.x + r.b], [kx.start, kx.slutt]);
        if (mx) { r.x += mx.delta; linjeX = mx.linje; }
        const my = nærmesteMagnet([r.y, r.y + r.h], [ky.start, ky.slutt]);
        if (my) { r.y += my.delta; linjeY = my.linje; }
      }
      r.x = klamp(r.x, 0, W - r.b);
      r.y = klamp(r.y, 0, H - r.h);
    } else {
      // Endre størrelse: bare kantene man drar i, flytter seg. Den motsatte kanten
      // står fast, så kortet ikke «vandrer» når det treffer minstestørrelsen.
      const høyre = start.x + start.b;
      const bunn  = start.y + start.h;
      r = { ...start };
      if (kant.includes('e')) {
        let ny = høyre + dx;
        const m = magnet && nærmesteMagnet([ny], [kx.slutt]);
        if (m) { ny += m.delta; linjeX = m.linje; }
        r.b = klamp(ny - start.x, minB, W - start.x);
      }
      if (kant.includes('w')) {
        let ny = start.x + dx;
        const m = magnet && nærmesteMagnet([ny], [kx.start]);
        if (m) { ny += m.delta; linjeX = m.linje; }
        r.x = klamp(ny, 0, høyre - minB);
        r.b = høyre - r.x;
      }
      if (kant.includes('s')) {
        let ny = bunn + dy;
        const m = magnet && nærmesteMagnet([ny], [ky.slutt]);
        if (m) { ny += m.delta; linjeY = m.linje; }
        r.h = klamp(ny - start.y, minH, H - start.y);
      }
      if (kant.includes('n')) {
        let ny = start.y + dy;
        const m = magnet && nærmesteMagnet([ny], [ky.start]);
        if (m) { ny += m.delta; linjeY = m.linje; }
        r.y = klamp(ny, 0, bunn - minH);
        r.h = bunn - r.y;
      }
    }

    el.style.left   = `${r.x}px`;
    el.style.top    = `${r.y}px`;
    el.style.width  = `${r.b}px`;
    el.style.height = `${r.h}px`;
    visHjelpelinjer(linjeX, linjeY);
  }

  function vedSlipp() {
    fanger.removeEventListener('pointermove', vedFlytt);
    fanger.removeEventListener('pointerup', vedSlipp);
    fanger.removeEventListener('pointercancel', vedSlipp);
    el.classList.remove('aktiv');
    document.body.classList.remove('flytter', 'endrer-størrelse');
    visHjelpelinjer(null, null);

    kort.x = rund(r.x / W * 100);
    kort.y = rund(r.y / H * 100);
    kort.b = rund(r.b / W * 100);
    kort.h = rund(r.h / H * 100);
    plasser(kort); // tilbake til prosent
    settStabelRekkefølge();
    lagre();
  }

  fanger.addEventListener('pointermove', vedFlytt);
  fanger.addEventListener('pointerup', vedSlipp);
  fanger.addEventListener('pointercancel', vedSlipp);
}

// ===================== Nytt kort =====================

function overlapper(a, b) {
  return a.x < b.x + b.b && b.x < a.x + a.b && a.y < b.y + b.h && b.y < a.y + a.h;
}

// Leter etter første ledige flate (ovenfra, så fra venstre) som har plass til et
// kort på b × h prosent. Finnes ingen, legges kortet forskjøvet oppå de andre.
function ledigPlass(b, h) {
  for (let y = 0; y + h <= 100; y += 2) {
    for (let x = 0; x + b <= 100; x += 2) {
      const kandidat = { x, y, b, h };
      if (!kortene.some(k => overlapper(kandidat, k))) return { x, y };
    }
  }
  const n = kortene.length % 8;
  return { x: 10 + n * 3, y: 10 + n * 3 };
}

function nyttKort() {
  const b = 24, h = 28;
  const { x, y } = ledigPlass(b, h);
  const z = Math.max(0, ...kortene.map(k => k.z)) + 1;
  const kort = { id: `ekstra-${Date.now()}`, tittel: '📦 Nytt kort', type: 'tomt', x, y, b, h, z, minB: 140, minH: 90 };
  kortene.push(kort);
  plasser(kort);
  settStabelRekkefølge();
  lagre();
}

// ===================== Oppstart =====================

function oppdaterKlokker() {
  const tid = new Date().toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  document.querySelectorAll('[data-klokke]').forEach(el => { el.textContent = tid; });
}

document.getElementById('btn-nytt').addEventListener('click', nyttKort);
document.getElementById('btn-nullstill').addEventListener('click', () => {
  kortene = standardKort();
  lagre();
  tegnAlt();
  oppdaterKlokker();
});
document.getElementById('vis-hint').addEventListener('change', e => {
  document.getElementById('hint').hidden = !e.target.checked;
});

tegnAlt();
oppdaterKlokker();
setInterval(oppdaterKlokker, 1000);
