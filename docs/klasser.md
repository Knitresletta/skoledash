# Designnotat: klasser (grupper av sider)

Utkast 4. november 2026, avklart samme dag (se «Avgjort»). Bygd som v2.56 samme kveld, venter på lokal test. Avvik fra notatet: en klasse uten sider slettes av seg selv (regel 5 og 6 under er dermed utgått), og trekkene bor i klassen når klassen ikke er koblet til en liste, så sidene deler dem uansett.

## Mål

En lærer har flere sider for samme klasse: «7B Matte», «7B Norsk», «7B Stasjoner». I dag eier hver side sin egen elevliste, så de tre sidene er tre kopier av 7B som kan sprike. Målet er at **gruppen er klassen og sidene er aktivitetene**: én elevliste og ett oppmøte for klassen, og hver side beholder det som er fagspesifikt.

Ikke-mål i denne runden: maler for en hel klasse (flere sider i én mal), deling av en hel klasse, og ukeplan per klasse. Alt det kan bygges oppå etterpå.

## Ordvalg

«Gruppe» er opptatt (gruppeinndelingen i Grupper-kortet). Avgjort: **Klasse** i grensesnittet og `klasser` i koden. En klasse kan like gjerne hete «5. trinn» eller «Valgfag».

## Datamodell

Nytt globalt felt:

```
state.klasser = {
  'klasse-1': {
    navn: '7B',
    elever: [{ id, navn }],      // flyttet fra siden
    oppmøte: { dato, status },   // flyttet fra siden
    liste: '7B' | null,          // koblingen til 📋 Lister, flyttet fra siden
    gruppe_begrensninger: [],    // gamle par fra før v2.38, flyttet fra siden
    klassekart: { rader, kolonner, av, plasser },  // flyttet fra siden
    ukeplan: { man..fre }, ukeplan_dato,            // flyttet fra siden
  },
}
state.klasse_teller = 1
state.klasse_oppsett = ['klasse-1', ...]   // rekkefølgen i menyen (som liste_oppsett)
```

På siden:

```
s.klasse = 'klasse-1' | null   // null = siden står alene, som i dag
```

Feltene `elever`, `oppmøte`, `liste`, `gruppe_begrensninger`, `klassekart`, `ukeplan` og `ukeplan_dato` blir stående på siden. De brukes når siden ikke har klasse, og ligger brakk når den har. `dagsplan` (én plan) og `dagsplan_modus` er per side: 🗓 på en side viser klassens uke, 🗓 av viser sidens egen plan.

## Ett oppslag: `klasse(s)`

Samme mønster som `trekk(s)`, som gir listas trekk når siden er koblet og sidens egne ellers:

```js
function klasse(s = aktivSide()) {
  return s.klasse && state.klasser[s.klasse] ? state.klasser[s.klasse] : s;
}
```

Alt som i dag leser eller skriver `s.elever`, `s.oppmøte`, `s.liste`, `s.gruppe_begrensninger`, `s.klassekart`, `s.ukeplan` og `s.ukeplan_dato`, går via `klasse(s)`. Det er rundt 80 steder, alle mekaniske. `sidensListe(s)`, `tilStede(s)`, `oppmøteIdag(s)`, `elevNavn(id, s)`, `aktivePar(s)`, `lastListe`, `lagreListe`, `fjernEleverBatch`, `byttElevIder` og klassekartets oppslag er de viktigste. Trekkene trenger ingen endring: de følger allerede lista, og lista følger klassen.

Regel for CLAUDE.md etterpå: les aldri `s.elever` direkte, bruk `klasse(s).elever`.

## Hva som flytter, og hva som blir

| Flytter til klassen | Blir på siden |
|---|---|
| Elevliste | Kortene og oppsettet |
| Oppmøte i dag | Dagsplan (én plan) og 🗓-bryteren |
| Kobling til 📋 Lister (og dermed trekkene) | Gruppeinndeling (Grupper-kortet): varierer fra fag til fag |
| Gamle «hold fra hverandre»-par (før v2.38) | Notater, timere, bilder, kortnavn, bamsens navn |
| Ukeplan (man–fre) med avkryssinger | |
| Klassekart: rommet og plassene | |

Mal og deling: `mal.rom` (klassekartets rom) brukes bare når den nye siden ikke har klasse. I en klasse er rommet klassens.

## Klassen eier sidene (avklart 4. november, kveld)

En ny klasse er et nytt sett med sider. **➕ Ny klasse** i klasseknappen lager klassen med én tom side; læreren legger til elever eller henter en liste, og **+** gir flere sider, tomme eller fra mal. Sider som finnes fra før, flyttes inn med **Flytt til klasse** eller **Ny klasse med denne siden** i menyen på sidenavnet (siden tar med seg elevene). Den opprinnelige tanken, at «Ny klasse» flyttet siden man sto på, er dermed byttet ut.

**Sider uten klasse** (avklart samme kveld, i to runder): finnes det sider uten klasse når en ny klasse lages, spør dialogen om de skal bli med (forhåndsvalgt) eller om klassen skal starte tomt. Blir de med, gir siden læreren står på elevlista, og én samlet beskjed nevner elever fra de andre sidene som ikke sto der. Uten spørsmålet så sidene ut som borte bak «Uten klasse», og en fast regel («første klasse tar alt») var for usynlig.

## Toppfeltet

Til venstre for fanene står en knapp med klassens navn: **«7B ▾»**. Fanene viser bare sidene i den klassen. Knappen åpner en meny (samme stil som fanemenyene):

- de andre klassene, klikk bytter
- **Uten klasse** (sider som står alene), hvis det finnes noen
- skillelinje, **➕ Ny klasse**, og for den aktive klassen **✏️ Gi nytt navn** og **Løs opp klassen**

Står læreren på en side uten klasse, viser knappen «Uten klasse ▾», og fanene viser de løse sidene. Har ingen laget en klasse ennå, finnes knappen likevel, så funksjonen er til å finne.

**+** lager en ny side i den klassen som vises, tom eller fra mal som i dag. Fanemenyen på sidenavnet får **Flytt til klasse ▸** med klassene, «Uten klasse» og «Ny klasse». `state.aktiv_side` er fortsatt indeksen i `state.sider`; klassen leses av den aktive siden.

## Flytting, regler

1. **Første side inn i en tom klasse** tar med seg elevlista, oppmøtet, listekoblingen og parene. Klassen blir en kopi av siden.
2. **Side inn i en klasse som har elever:** klassens liste vinner. Varsel: «7B har 24 elever. 3 av elevene på siden sto ikke der: Kari, Ola, Per.» Sidens egne gruppeinndeling, trekk-referanser og klassekartplasser ryddes for elever som ikke finnes i klassen (`fjernElevReferanser`, som ved `lastListe`).
3. **Side ut av en klasse** får en kopi av klassens elever og oppmøte, og samme listekobling, så ingenting forsvinner.
4. **Løs opp klassen:** alle sidene får hver sin kopi (regel 3), og klassen slettes.
5. **Siste side ut** sletter ikke klassen av seg selv: en tom klasse kan stå og vente på nye sider.
6. **Slett side:** som i dag. Er det klassens siste side, blir klassen stående tom.

Elev-id-ene er de samme i klassen som på sidene som gikk inn først, så gruppeinndeling og klassekartplasser på den siden fortsetter å virke.

## Lagring og migrering

- `LAGRINGSVERSJON` går fra 2 til 3. Eldre versjoner (v2.55 og før) finner høyere versjon og slutter å lagre (`lagringSperre = 'nyere-versjon'`), så de aldri skriver sider med tom `s.elever` over klassens liste. Det er hele poenget med vernet.
- Eksisterende data: `s.klasse = null` på alle sider, `state.klasser = {}`. Ingen side endrer oppførsel før læreren selv lager en klasse.
- `normaliserState`: klasser vaskes som sider (elever, oppmøte, liste, par), `s.klasse` må peke på en klasse som finnes, ellers null. `klasse_oppsett` vaskes som `liste_oppsett`.
- Eksport: `klasser`, `klasse_teller` og `klasse_oppsett` i backupfila. Import «Erstatt alt» tar dem med; «flett lister» rører dem ikke.
- Maler og deling: uendret. En mal er fortsatt én side. Ny side fra mal havner i klassen som vises.

## Avgjort (Jonatan, 4. november 2026)

1. **Navnet:** Klasse.
2. **Klassekart og ukeplan følger klassen.** Hele klassekartet (rom og plasser) og ukeplanen bor i klassen.
3. **Gruppeinndelingen er per side.** Den varierer fra fag til fag.

## Uten klasse: alt som før

En lærer som aldri lager en klasse, merker bare én ting: knappen «Uten klasse ▾» til venstre for fanene. `klasse(s)` gir siden selv, så alle feltene leses og skrives der de ligger i dag. Det eneste tekniske skillet er lagringsversjon 3: åpnes dataene i v2.55 eller eldre (bare ved tilbakerulling), viser den appen dataene uten å lagre.

## Testplan før «klar til lokal test»

- Gamle data uten `klasser` lastes uendret, ingen `lagringSperre`.
- Lag klasse fra en side med elever, legg til side nummer to: samme elever, samme oppmøte, trekk deles.
- Legg til elev og marker borte på én side, se det på den andre.
- Flytt side med egne elever inn i en klasse med elever: varsel, inndeling og plasser ryddet.
- Flytt side ut, løs opp klasse: kopier på plass, ingenting borte.
- Last liste (📋) på en side i klassen: hele klassen bytter.
- Eksport og «Erstatt alt»-import, og import av en delt side inn i en klasse.
- Data med lagringsversjon 3 i v2.55: sperre, ikke tap.
- Alle ti temaer for klasse-knappen og menyen, bokmål og nynorsk.
