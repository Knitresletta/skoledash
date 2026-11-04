// tekster.js: nynorsk for Skoledash. Lastes før app.js (se index.html).
//
// Bokmål er grunnspråket og står i koden og HTML-en som før. Denne fila er en ordbok
// fra bokmålstekst til nynorsk. Nøkkelen er bokmålsteksten nøyaktig slik den står i
// koden, med emoji og tegnsetting. Endres en bokmålstekst, må nøkkelen her endres
// tilsvarende, ellers vises bokmål også på nynorsk.
//
// Tekster som er like på begge målformer (f.eks. «Lagre», «Dagsplan», «Klassebamse»),
// står ikke her. Mangler en tekst, vises bokmål.
//
// Plassholdere i krøllparenteser ({navn}, {antall}) fylles inn av t() i app.js og må
// stå med samme navn i den nynorske teksten.
//
// Nynorsken er skrevet etter beste evne og ikke lest korrektur av noen som bruker
// nynorsk til daglig. Ordvalg som kan diskuteres: vêr, bilete, Gruppeavgrensing,
// Brukarrettleiing. «Timer» (nedteljing) er beholdt, fordi «timar» betyr klokketimar.

const NYNORSK = {
  // ---------- Toppfelt, menyer og knapper ----------
  'Bytt mellom begge, analog og digital': 'Byt mellom begge, analog og digital',
  // Guidekortene for nye brukere (index.html, data-t-html)
  '↘ Hurtigtaster': '↘ Snøggtastar',
  'øyne hit': 'auge hit',
  'Flere': 'Fleire',
  'elever her i dag': 'elevar her i dag',
  '· {antall} borte': '· {antall} borte',
  'Sett bursdag': 'Set bursdag',
  'Bursdag: {dato}': 'Bursdag: {dato}',
  '🎂 Bursdag for {navn}': '🎂 Bursdag for {navn}',
  '{navn} har bursdag i dag 🎂': '{navn} har bursdag i dag 🎂',
  'Skriv dag og måned, f.eks. 14.03': 'Skriv dag og månad, t.d. 14.03',
  'Skriv dag og måned, f.eks. <strong>14.03</strong>. På dagen vises 👑 og fornavnet i toppfeltet.': 'Skriv dag og månad, t.d. <strong>14.03</strong>. På dagen blir 👑 og fornamnet vist i toppfeltet.',
  'og': 'og',
  'Fjern': 'Fjern',
  '{antall} sider til': '{antall} sider til',
  'Klikk for de andre sidene, nytt navn eller lagre som mal': 'Klikk for dei andre sidene, nytt namn eller lagre som mal',
  'Slett siden': 'Slett sida',
  '👀 Øyne hit': '👀 Auge hit',
  'Øyne hit!': 'Auge hit!',
  'Beskjeden fyller hele skjermen. Klikk, <kbd>Esc</kbd> eller <kbd>ø</kbd> tar den bort igjen. <kbd>Shift</kbd>+<kbd>Ø</kbd> viser den rett på, uten å spørre.': 'Meldinga fyller heile skjermen. Klikk, <kbd>Esc</kbd> eller <kbd>ø</kbd> tek henne bort att. <kbd>Shift</kbd>+<kbd>Ø</kbd> viser henne rett på, utan å spørje.',
  'Spill en mild lyd': 'Spel ein mild lyd',
  'Vis beskjeden': 'Vis meldinga',
  'Klikk eller trykk <kbd>Esc</kbd> for å lukke': 'Klikk eller trykk <kbd>Esc</kbd> for å lukke',
  'Klikk på <strong>🏫 Skoledash</strong> oppe til venstre for å velge tema, font, skriftstørrelse og bokmål eller nynorsk.':
    'Klikk på <strong>🏫 Skoledash</strong> oppe til venstre for å velje tema, font, skriftstorleik og bokmål eller nynorsk.',
  'Der finner du også eksport og import av dataene dine, brukerveiledningen og hva som er nytt.':
    'Der finn du også eksport og import av dataa dine, brukarrettleiinga og kva som er nytt.',
  'Bordet er tomt med vilje. Under <strong>⊞ Kort</strong> oppe til høyre henter du fram det du trenger: klokke, elevliste, trekk, dagsplan, timer, notater og mer.':
    'Bordet er tomt med vilje. Under <strong>⊞ Kort</strong> oppe til høgre hentar du fram det du treng: klokke, elevliste, trekk, dagsplan, timer, notat og meir.',
  'Dra i overskriften på et kort for å flytte det, og i kantene for å endre størrelsen.':
    'Dra i overskrifta på eit kort for å flytte det, og i kantane for å endre storleiken.',
  'Bokstavene nede til høyre styrer appen uten mus. <kbd>a</kbd> legger til en elev, <kbd>r</kbd> trekker en tilfeldig elev, <kbd>t</kbd> starter og pauser timeren, og <kbd>b</kbd> gjør skjermen svart.':
    'Bokstavane nede til høgre styrer appen utan mus. <kbd>a</kbd> legg til ein elev, <kbd>r</kbd> trekkjer ein tilfeldig elev, <kbd>t</kbd> startar og pausar timeren, og <kbd>b</kbd> gjer skjermen svart.',
  'Hold musa over en knapp for å se hvilken tast den har.': 'Hald musa over ein knapp for å sjå kva tast han har.',
  'Vis/skjul kort': 'Vis/skjul kort',
  'Lagres automatisk i nettleseren': 'Blir lagra automatisk i nettlesaren',
  '● Ueksporterte endringer': '● Ueksporterte endringar',
  'Du har endringer siden siste eksport — klikk for å eksportere nå': 'Du har endringar sidan siste eksport — klikk for å eksportere no',
  '❓ Brukerveiledning': '❓ Brukarrettleiing',
  '⛔ Gruppebegrensning': '⛔ Gruppeavgrensing',
  '☕ Støtt utviklingen': '☕ Støtt utviklinga',
  'Støtt utviklingen av Skoledash': 'Støtt utviklinga av Skoledash',
  '🖥 System standard': '🖥 Systemstandard',
  '📏 Skriftstørrelse': '📏 Skriftstorleik',
  'Alle kort': 'Alle kort',
  '0 = samme som alle kort. Negativt tall krymper, positivt forstørrer': '0 = same som alle kort. Negativt tal krympar, positivt forstørrar',
  'Legg til flere': 'Legg til fleire',
  '+ 🖼 Bilde': '+ 🖼 Bilete',
  'Fjern fra siden': 'Fjern frå sida',
  'Dobbeltklikk for å gi nytt navn': 'Dobbeltklikk for å gi nytt namn',
  // Klasser (v2.56)
  'Uten klasse': 'Utan klasse',
  'Klasse: sidene i raden deler elever, oppmøte, klassekart og ukeplan': 'Klasse: sidene i rada deler elevar, oppmøte, klassekart og vekeplan',
  'En klasse samler sidene for én klasse: samme elever, oppmøte, klassekart og ukeplan på alle sidene':
    'Ein klasse samlar sidene for éin klasse: same elevar, oppmøte, klassekart og vekeplan på alle sidene',
  'Ny klasse med denne siden': 'Ny klasse med denne sida',
  'Gi klassen nytt navn': 'Gi klassen nytt namn',
  'Løs opp klassen': 'Løys opp klassen',
  'Løs opp? Sidene beholder hver sin kopi': 'Løys opp? Sidene beheld kvar sin kopi',
  'Flytt til klasse': 'Flytt til klasse',
  'Ut av klassen': 'Ut av klassen',
  'Ny klasse': 'Ny klasse',
  'Nytt navn på klassen': 'Nytt namn på klassen',
  '📚 Klassen «{navn}» er laget med denne siden': '📚 Klassen «{navn}» er laga med denne sida',
  '📚 Klassen «{navn}» er laget. Legg til elever, eller hent en liste': '📚 Klassen «{navn}» er laga. Legg til elevar, eller hent ei liste',
  '📚 Klassen «{navn}» er laget med sidene uten klasse': '📚 Klassen «{navn}» er laga med sidene utan klasse',
  'Ta med alle sidene uten klasse ({antall})': 'Ta med alle sidene utan klasse ({antall})',
  'Ta med de andre sidene uten klasse ({antall})': 'Ta med dei andre sidene utan klasse ({antall})',
  'Bare denne siden': 'Berre denne sida',
  'Start med en tom side': 'Start med ei tom side',
  'Elevlista er fra «{side}». Elever fra de andre sidene som ikke sto der: {navn}': 'Elevlista er frå «{side}». Elevar frå dei andre sidene som ikkje stod der: {navn}',
  'Klassen «{navn}» er løst opp. Sidene har hver sin kopi av elevene': 'Klassen «{navn}» er løyst opp. Sidene har kvar sin kopi av elevane',
  '{klasse} har {antall} elever. {mangler} på siden sto ikke der: {navn}': '{klasse} har {antall} elevar. {mangler} på sida stod ikkje der: {navn}',
  'Sidene i en klasse deler elevliste, oppmøte, klassekart og ukeplan. Kortene, dagsplanen og gruppeinndelingen er fortsatt egne per side.':
    'Sidene i ein klasse deler elevliste, oppmøte, klassekart og vekeplan. Korta, dagsplanen og gruppeinndelinga er framleis eigne per side.',
  'f.eks. 7B, 5. trinn, Valgfag…': 't.d. 7B, 5. trinn, Valfag…',
  // Fanemenyene og sidemaler (v2.51)
  'Klikk for å gi nytt navn eller lagre som mal': 'Klikk for å gi nytt namn eller lagre som mal',
  'Ny side, tom eller fra mal': 'Ny side, tom eller frå mal',
  'Gi nytt navn': 'Gi nytt namn',
  'Lagre en side som mal ved å klikke på navnet i fanen': 'Lagre ei side som mal ved å klikke på namnet i fana',
  '📑 Siden er lagret som malen «{navn}»': '📑 Sida er lagra som malen «{navn}»',
  '🗑 Malen «{navn}» er slettet': '🗑 Malen «{navn}» er sletta',
  '📑 Ny side fra malen «{navn}»': '📑 Ny side frå malen «{navn}»',
  '📑 Lagre siden som mal': '📑 Lagre sida som mal',
  'Malen tar med oppsettet av kortene og innstillingene i dem, men ikke elever, grupper, dagsplan eller trekk.':
    'Malen tek med oppsettet av korta og innstillingane i dei, men ikkje elevar, grupper, dagsplan eller trekk.',
  'f.eks. Mattetime, Stasjoner…': 't.d. Mattetime, Stasjonar…',
  // Deling av side (v2.52)
  'Del siden': 'Del sida',
  'Importer side fra fil': 'Importer side frå fil',
  '📤 «{navn}» lastet ned, uten elever': '📤 «{navn}» lasta ned, utan elevar',
  'Dette ser ikke ut som en fil fra Skoledash': 'Dette ser ikkje ut som ei fil frå Skoledash',
  'Fant ingen side i fila': 'Fann inga side i fila',
  '📥 «{navn}» ligger nå i +-menyen som mal': '📥 «{navn}» ligg no i +-menyen som mal',
  '📥 {antall} maler lagt i +-menyen': '📥 {antall} malar lagde i +-menyen',
  'Dra for å endre rekkefølge': 'Dra for å endre rekkjefølgja',

  // Temaer
  '⬛ Høy kontrast': '⬛ Høg kontrast',
  '🌊 Under vann': '🌊 Under vatnet',
  '🌋 I en vulkan': '🌋 I ein vulkan',

  // ---------- Elever ----------
  'Elever': 'Elevar',
  'elever inne': 'elevar inne',
  'Ingen elever inne': 'Ingen elevar inne',
  'Ingen elever inne ennå.': 'Ingen elevar inne enno.',
  'Klasselisten er full (maks 35 elever)': 'Klasselista er full (maks 35 elevar)',
  '{navn} er allerede inne': '{navn} er alt inne',
  '✓ Endret til {navn}': '✓ Endra til {navn}',
  'Fjern elever': 'Fjern elevar',
  '👤 Fjern elever…': '👤 Fjern elevar…',
  'Fjern valgte': 'Fjern dei valde',
  '{antall} elever fjernet': '{antall} elevar fjerna',
  '{antall} elev fjernet': '{antall} elev fjerna',
  'Navn…': 'Namn…',
  'Endre navn': 'Endre namn',
  'Nytt navn…': 'Nytt namn…',
  'Skriv inn et navn': 'Skriv inn eit namn',
  '{navn} er her, men passer ikke i noen gruppe uten å bryte en begrensning. Del inn på nytt.':
    '{navn} er her, men passar ikkje i nokon gruppe utan å bryte ei avgrensing. Del inn på nytt.',
  '✓ {navn} er her og er lagt i gruppe {n}': '✓ {navn} er her og er lagd i gruppe {n}',
  'Alle elevene er markert borte i dag': 'Alle elevane er merkte borte i dag',
  'Trenger minst 2 elever som er her i dag ({antall} her)': 'Treng minst 2 elevar som er her i dag ({antall} her)',
  'Klikk på en elev for å markere dem som allerede brukt. Grå = brukt, hvit = tilgjengelig.': 'Klikk på ein elev for å merke eleven som brukt. Grå = brukt, kvit = tilgjengeleg.',

  // ---------- Trekk ----------
  '⭐ Ordenselever': '⭐ Ordenselevar',
  'Ordenselever': 'Ordenselevar',
  'Trekk ordenselever': 'Trekk ordenselevar',
  'Trekk ordenselever (o)': 'Trekk ordenselevar (o)',
  'Trekk uten repetisjon (R)': 'Trekk utan repetisjon (R)',
  'Trykk Trekk for å velge en tilfeldig elev': 'Trykk Trekk for å velje ein tilfeldig elev',
  'Trykk Trekk for å velge to ordenselever': 'Trykk Trekk for å velje to ordenselevar',
  'Trykk Trekk for å velge en ordenselev': 'Trykk Trekk for å velje ein ordenselev',
  '⭐ Én ordenselev per trekk': '⭐ Éin ordenselev per trekk',
  '⭐ To ordenselever per trekk': '⭐ To ordenselevar per trekk',
  'Én ordenselev per trekk. Trykk for to.': 'Éin ordenselev per trekk. Trykk for to.',
  'To ordenselever per trekk. Trykk for én.': 'To ordenselevar per trekk. Trykk for éin.',
  'Trykk Trekk for å velge hvem som tar med klassebamse hjem': 'Trykk Trekk for å velje kven som tek med klassebamse heim',
  'Trykk Trekk for å velge hvem som tar med {bamse} hjem': 'Trykk Trekk for å velje kven som tek med {bamse} heim',
  '{elev} tar med {bamse} hjem!': '{elev} tek med {bamse} heim!',
  '{antall} trukket (backlog)': '{antall} trekte (backlog)',
  'Alle elever er trukket. Trykk 🔄 på kortet for å starte på nytt.': 'Alle elevane er trekte. Trykk 🔄 på kortet for å starte på nytt.',
  '⭐ Alle har vært ordenselev. Ny runde!': '⭐ Alle har vore ordenselev. Ny runde!',
  'Alle har hatt {bamse}. Ny runde: {elev} tar med {bamse} hjem!': 'Alle har hatt {bamse}. Ny runde: {elev} tek med {bamse} heim!',
  'Tøm backlog: alle kan trekkes igjen': 'Tøm backloggen: alle kan trekkjast igjen',
  'Tøm elevlista og start en ny. Lagrede lister røres ikke.': 'Tøm elevlista og start ei ny. Lagra lister blir ikkje rørte.',
  '🧹 Elevlista er tømt': '🧹 Elevlista er tømd',
  'Ikke lagret. Tøm?': 'Ikkje lagra. Tøm?',
  'Trykk igjen for å tømme. Lista {navn} er lagret og røres ikke.': 'Trykk ein gong til for å tømme. Lista {navn} er lagra og blir ikkje rørt.',
  'Trykk igjen for å tømme. Elevene er ikke lagret i en liste og blir borte.': 'Trykk ein gong til for å tømme. Elevane er ikkje lagra i ei liste og blir borte.',
  'Alle som er her i dag, er trukket. Trykk 🔄 på kortet for å starte på nytt.': 'Alle som er her i dag, er trekte. Trykk 🔄 på kortet for å starte på nytt.',
  'Trenger minst 2 elever': 'Treng minst 2 elevar',
  'Trenger minst 2 elever ({antall} inne)': 'Treng minst 2 elevar ({antall} inne)',
  'Endre navn på klassebamsen': 'Endre namn på klassebamsen',
  '⭐ Ordenselever-trekk': '⭐ Ordenselevar-trekk',
  '⭐ Ordenselever-trekk nullstilt': '⭐ Ordenselevar-trekk nullstilt',

  // ---------- Grupper og gruppeavgrensing ----------
  'Antall grupper (min. 2)…': 'Talet på grupper (min. 2)…',
  'Ingen grupper aktive — trykk': 'Ingen grupper er aktive — trykk',
  'For mange grupper — bare {antall} elever inne': 'For mange grupper — berre {antall} elevar inne',
  'Klarte ikke lage grupper uten å bryte begrensningene — prøv færre par eller flere grupper': 'Klarte ikkje å lage grupper utan å bryte avgrensingane — prøv færre par eller fleire grupper',
  '🎲 {antall} grupper ({min}–{maks} elever)': '🎲 {antall} grupper ({min}–{maks} elevar)',
  'Velg to forskjellige elever': 'Vel to ulike elevar',
  'Dette paret er allerede lagt til': 'Dette paret er alt lagt til',
  '{navn} er lagt til, men passer ikke i noen gruppe uten å bryte en begrensning. Del inn på nytt.':
    '{navn} er lagt til, men passar ikkje i nokon gruppe utan å bryte ei avgrensing. Del inn på nytt.',
  'Legg til minst to elever i elevlista først.': 'Legg til minst to elevar i elevlista først.',
  'Ingen par ennå.': 'Ingen par enno.',

  // ---------- Lister ----------
  'Ingen elever inne å lagre': 'Ingen elevar inne å lagre',
  'Ingen lagrede lister ennå.': 'Ingen lagra lister enno.',
  'Hent en liste fra en fil, f.eks. fra en kollega': 'Hent ei liste frå ei fil, til dømes frå ein kollega',
  '(denne siden)': '(denne sida)',
  'Nytt navn på lista': 'Nytt namn på lista',
  'Gi nytt navn': 'Gi nytt namn',
  'Par som ikke skal i samme gruppe': 'Par som ikkje skal i same gruppe',
  'Slett?': 'Slette?',
  'Skoledash klarte ikke å lese det som var lagret. Ingenting lagres nå, så dataene ikke skrives over. Prøv å laste inn på nytt, og si fra via 💬 Tilbakemelding hvis det ikke hjelper.': 'Skoledash klarte ikkje å lese det som var lagra. Ingenting blir lagra no, så dataa ikkje blir skrivne over. Prøv å laste inn på nytt, og sei frå via 💬 Tilbakemelding om det ikkje hjelper.',
  'uke': 'veke',
  'Teller': 'Teljar',
  'Én mindre': 'Éin mindre',
  'Én mer': 'Éin meir',
  'Nullstill telleren': 'Nullstill teljaren',
  'Trykk igjen for å sette telleren til 0': 'Trykk ein gong til for å setje teljaren til 0',
  'Klikk for å skrive en beskjed til klassen': 'Klikk for å skrive ein beskjed til klassen',
  'Nedtelling til dato': 'Nedteljing til dato',
  'Klikk for å velge dato': 'Klikk for å velje dato',
  'dager til {navn}': 'dagar til {navn}',
  '{navn} var for {antall} dager siden': '{navn} var for {antall} dagar sidan',
  'Velg en dato': 'Vel ein dato',
  'F.eks. Juleferie': 'T.d. Juleferie',
  'Hva skjer': 'Kva skjer',
  'Bare kort som vokser med innholdet (elever, grupper, dagsplan) har prosent. De andre blir større når du drar kortet større, og notat har A− og A+ i kortet.': 'Berre kort som veks med innhaldet (elevar, grupper, dagsplan) har prosent. Dei andre blir større når du dreg kortet større, og notat har A− og A+ i kortet.',
  'Det navnet kan ikke brukes': 'Det namnet kan ikkje brukast',
  'Ingen Tilfeldig elev-kort på siden': 'Ingen Tilfeldig elev-kort på sida',
  'Ingen timer på siden': 'Ingen timer på sida',
  '⏰ {navn}: tiden er ute!': '⏰ {navn}: tida er ute!',
  'Bilde': 'Bilete',
  'Gi kortet et navn': 'Gi kortet eit namn',
  'Navn på kortet': 'Namn på kortet',
  'Arbeidssymboler': 'Arbeidssymbol',
  '🔇 Arbeidssymboler': '🔇 Arbeidssymbol',
  'Hviskestemme': 'Kviskrestemme',
  'Rekk opp hånda': 'Rekk opp handa',
  'Se hit': 'Sjå hit',
  'Velg et symbol under': 'Vel eit symbol under',
  'Eget symbol': 'Eige symbol',
  'Ingen egne symboler ennå.': 'Ingen eigne symbol enno.',
  'Skriv inn en tekst': 'Skriv inn ein tekst',
  'Du har nådd grensen på 30 egne symboler': 'Du har nådd grensa på 30 eigne symbol',
  'Egne arbeidssymboler': 'Eigne arbeidssymbol',
  'Rødt lys': 'Raudt lys',
  'F.eks. Lesestund': 'T.d. Lesestund',
  'Hold musa over et kort og trykk f': 'Hald musa over eit kort og trykk f',
  '📋 Alle punktene er ferdige': '📋 Alle punkta er ferdige',
  '▶ Nå: {punkt}': '▶ No: {punkt}',
  'Punktet som pågår, er ferdig, videre til neste (p). Shift+P angrer.': 'Punktet som går føre seg, er ferdig, vidare til neste (p). Shift+P angrar.',
  '⏳ Nedtelling': '⏳ Nedteljing',
  'Dra for å flytte. Slipp på en annen liste for å lage en gruppe.': 'Dra for å flytte. Slepp på ei anna liste for å lage ei gruppe.',
  'Nytt navn på gruppa': 'Nytt namn på gruppa',
  'Gi gruppa nytt navn': 'Gi gruppa nytt namn',
  'Alt Skoledash husker, ligger bare i denne nettleseren. Ta en backup med jevne mellomrom.': 'Alt Skoledash hugsar, ligg berre i denne nettlesaren. Ta ein backup med jamne mellomrom.',
  'Nullstill ordenselev-trekket: alle kan trekkes igjen': 'Nullstill ordenselev-trekket: alle kan trekkjast igjen',
  'Nullstill bamse-trekket: alle kan trekkes igjen': 'Nullstill bamse-trekket: alle kan trekkjast igjen',
  'Trykk igjen: alle kan bli ordenselev igjen': 'Trykk ein gong til: alle kan bli ordenselev igjen',
  'Trykk igjen: alle kan få bamsen igjen': 'Trykk ein gong til: alle kan få bamsen igjen',
  'Trykk igjen for å slette alle punktene i dagsplanen': 'Trykk ein gong til for å slette alle punkta i dagsplanen',
  'nederst til venstre.': 'nedst til venstre.',
  '⚠️ Klarte ikke å lagre. Endringene forsvinner når siden lukkes. Ta en 📤 eksport for å sikre dem.': '⚠️ Klarte ikkje å lagre. Endringane forsvinn når sida blir lukka. Ta ein 📤 eksport for å sikre dei.',
  'Dataene er lagret av en nyere versjon av Skoledash. Endringer her blir ikke lagret.': 'Dataa er lagra av ein nyare versjon av Skoledash. Endringar her blir ikkje lagra.',
  'Skoledash er endret i en annen fane. Endringer her blir ikke lagret før du laster inn på nytt.': 'Skoledash er endra i ei anna fane. Endringar her blir ikkje lagra før du lastar inn på nytt.',
  'Endringen ble ikke lagret. Last inn siden på nytt.': 'Endringa vart ikkje lagra. Last inn sida på nytt.',
  'ingen ennå': 'ingen enno',
  'for {antall} dager siden': 'for {antall} dagar sidan',
  '● Ueksporterte endringer (siste backup: {alder})': '● Ueksporterte endringar (siste backup: {alder})',
  'Overskriv?': 'Skrive over?',
  'Erstatt elevene i lista med elevene på siden': 'Byt ut elevane i lista med elevane på sida',
  'Trykk igjen for å erstatte elevene i {navn} med de {antall} elevene på siden': 'Trykk ein gong til for å byte ut elevane i {navn} med dei {antall} elevane på sida',
  'Trykk igjen for å slette {navn}': 'Trykk ein gong til for å slette {navn}',
  'Det finnes allerede en liste som heter {navn}': 'Det finst alt ei liste som heiter {navn}',
  '✓ Lista heter nå {navn}': '✓ Lista heiter no {navn}',
  "📤 '{navn}' lastet ned": "📤 '{navn}' lasta ned",
  'Fila er laget av en nyere versjon av Skoledash. Last siden på nytt og prøv igjen.': 'Fila er laga av ein nyare versjon av Skoledash. Last sida på nytt og prøv igjen.',
  'Fant ingen lister i fila': 'Fann ingen lister i fila',
  'Velg to elever som ikke skal havne i samme gruppe når du trykker <strong>Del inn</strong>. Parene lagres i lista <strong>{liste}</strong>, så de blir med når lista deles.':
    'Vel to elevar som ikkje skal hamne i same gruppe når du trykkjer <strong>Del inn</strong>. Para blir lagra i lista <strong>{liste}</strong>, så dei blir med når lista blir delt.',
  'Parene lagres i en klasseliste, så de blir med når lista deles med en vikar. Lagre elevlista under <strong>📋 Lister</strong> først, så kan du legge til par her.':
    'Para blir lagra i ei klasseliste, så dei blir med når lista blir delt med ein vikar. Lagre elevlista under <strong>📋 Lister</strong> først, så kan du leggje til par her.',
  'Lista har færre enn to elever.': 'Lista har færre enn to elevar.',
  '{antall} elever': '{antall} elevar',
  "📋 '{navn}' lagret ({antall} elever)": "📋 '{navn}' lagra ({antall} elevar)",
  "📋 '{navn}' oppdatert ({antall} elever)": "📋 '{navn}' oppdatert ({antall} elevar)",
  "📋 '{navn}' lastet ({antall} elever)": "📋 '{navn}' lasta ({antall} elevar)",
  "🗑️ '{navn}' slettet": "🗑️ '{navn}' sletta",
  'Navn på listen': 'Namn på lista',
  'f.eks. 8A, Valgfag høst…': 't.d. 8A, Valfag haust…',
  '💾 Lagre nåværende': '💾 Lagre den noverande',

  // ---------- Timer ----------
  '⏰ Tiden er ute!': '⏰ Tida er ute!',
  '⏱️ Timer satt til {min} min': '⏱️ Timer sett til {min} min',
  '▶ Kjører': '▶ Køyrer',
  '⏸ Pauset': '⏸ Pausa',
  'Sett tid': 'Set tid',
  'Sett tid (s)': 'Set tid (s)',
  'Sett nedtellingstid': 'Set nedteljingstid',
  'Minutter (1–60)…': 'Minutt (1–60)…',
  'Skriv inn 1–60 minutter': 'Skriv inn 1–60 minutt',

  // ---------- Dagsplan og notat ----------
  'Legg til punkt i dagsplan': 'Legg til punkt i dagsplanen',
  // Klassekart (v2.54)
  '🎲 Trekk plasser': '🎲 Trekk plassar',
  'Trekk nye plasser til alle': 'Trekk nye plassar til alle',
  'Endre rommet: rader, kolonner og hvilke ruter som er pulter': 'Endre rommet: rader, kolonnar og kva ruter som er pultar',
  'Kolonner': 'Kolonnar',
  'Klikk på en rute for å slå pulten av eller på': 'Klikk på ei rute for å slå pulten av eller på',
  'Uten plass': 'Utan plass',
  'Ingen elever på siden': 'Ingen elevar på sida',
  'Klikk på en pult for å sette {navn} der': 'Klikk på ein pult for å setje {navn} der',
  'Ingen elever å plassere': 'Ingen elevar å plassere',
  'For få pulter: {pulter} pulter til {elever} elever': 'For få pultar: {pulter} pultar til {elever} elevar',
  'Klarte ikke å plassere uten at par sitter ved siden av hverandre. Prøv igjen, eller gi rommet flere pulter':
    'Klarte ikkje å plassere utan at par sit ved sida av kvarandre. Prøv igjen, eller gi rommet fleire pultar',
  // Ukeplan (v2.53)
  'Dagsplan / Ukeplan': 'Dagsplan / Vekeplan',
  'Ukeplan': 'Vekeplan',
  'Ukeplan: én plan per ukedag': 'Vekeplan: éin plan per vekedag',
  'Ukeplan er på: én plan per ukedag. Klikk for én plan': 'Vekeplan er på: éin plan per vekedag. Klikk for éin plan',
  '🗓 Ukeplan: én plan per ukedag': '🗓 Vekeplan: éin plan per vekedag',
  '📋 Én dagsplan for alle dager': '📋 Éin dagsplan for alle dagar',
  'Man': 'Mån',
  'Tir': 'Tys',
  'f.eks. Gjennomgang kapittel 3…': 't.d. Gjennomgang av kapittel 3…',
  'Marker ferdig': 'Merk som ferdig',

  // ---------- Terning ----------
  'Flere terninger': 'Fleire terningar',
  'Færre terninger': 'Færre terningar',
  'Hvor mange terninger som kastes': 'Kor mange terningar som blir kasta',

  // ---------- Vêr og posisjon ----------
  '⏳ Henter vær…': '⏳ Hentar vêr…',
  'Fikk ikke tak i værvarselet': 'Fekk ikkje tak i vêrvarselet',
  '💧 Luftfuktighet': '💧 Luftfuktigheit',
  'standardsted': 'standardstad',
  'fra din posisjon': 'frå posisjonen din',
  'valgt av deg': 'valt av deg',
  '📍 Bruk min posisjon': '📍 Bruk posisjonen min',
  '…eller søk etter et sted': '…eller søk etter ein stad',
  'Søker…': 'Søkjer…',
  'Fant ingen steder med det navnet': 'Fann ingen stader med det namnet',
  'Søket feilet — sjekk nettforbindelsen': 'Søket feila — sjekk nettsambandet',
  'Posisjon krever at siden åpnes over https (eller localhost)': 'Posisjon krev at sida blir opna over https (eller localhost)',
  'Værvarsel hentes nå for {sted}': 'Vêrvarselet blir henta no for {sted}',
  'Fikk ikke tak i posisjonen din': 'Fekk ikkje tak i posisjonen din',
  'Min posisjon': 'Posisjonen min',
  '📍 Vis været der du er': '📍 Vis vêret der du er',
  // Pollen
  'Gress': 'Gras',
  'Lavt': 'Lågt',
  'lavt': 'lågt',
  'høyt': 'høgt',

  // ---------- Bilete og YouTube ----------
  '🖼 Bilde': '🖼 Bilete',
  'Slett dette bildekortet': 'Slett dette biletkortet',
  'Fjern bilde': 'Fjern biletet',
  'Det ser ikke ut som en bildefil': 'Det ser ikkje ut som ei biletfil',
  'Bildet er for stort — maks 50 MB': 'Biletet er for stort — maks 50 MB',
  '🎵 Kun lyd': '🎵 Berre lyd',
  'Spill / pause': 'Spel / pause',
  '🎵 Laster…': '🎵 Lastar…',
  'Fant ingen gyldig YouTube-lenke': 'Fann inga gyldig YouTube-lenke',

  // ---------- Eksport, import og sletting ----------
  'Kunne ikke lese fila — er det en gyldig JSON-fil?': 'Kunne ikkje lese fila — er det ei gyldig JSON-fil?',
  'Dette ser ikke ut som en Skoledash-backup': 'Dette ser ikkje ut som ein Skoledash-backup',
  'Fila er laget i en nyere versjon — importerer det jeg kjenner igjen': 'Fila er laga i ein nyare versjon — importerer det eg kjenner att',
  'ukjent dato': 'ukjend dato',
  'Fil fra {dato} — {sider} side(r), {lister} lagret liste(r).': 'Fil frå {dato} — {sider} side(r), {lister} lagra liste(r).',
  '📥 {antall} liste(r) flettet inn': '📥 {antall} liste(r) fletta inn',
  'Klarte ikke lagre importen — for mye data for nettleseren': 'Klarte ikkje å lagre importen — for mykje data for nettlesaren',
  'Gjenoppretter hele tilstanden fra fila og overskriver alt som ligger her nå (lister, sider, innstillinger, notater og bilder).': 'Gjenopprettar heile tilstanden frå fila og skriv over alt som ligg her no (lister, sider, innstillingar, notat og bilete).',
  'Slå sammen kun klasselister': 'Slå saman berre klasselister',
  'Behold alt nåværende, legg bare til de lagrede listene fra fila.': 'Behald alt som er her no, og legg berre til dei lagra listene frå fila.',
  '🗑 Slett alle data på denne maskinen': '🗑 Slett alle data på denne maskina',
  '🗑 Slett alle data på denne maskinen…': '🗑 Slett alle data på denne maskina…',
  'Dette sletter alt Skoledash har lagret i denne nettleseren: klasselister, sider, notater, bilder og innstillinger. Det kan ikke angres.': 'Dette slettar alt Skoledash har lagra i denne nettlesaren: klasselister, sider, notat, bilete og innstillingar. Det kan ikkje angrast.',
  'Bruk det når du er ferdig på en maskin andre også bruker, eller når du vil begynne helt på nytt. Ta gjerne en backup først.': 'Bruk det når du er ferdig på ei maskin som andre òg brukar, eller når du vil starte heilt på nytt. Ta gjerne ein backup først.',
  'Trykk igjen for å slette alt': 'Trykk ein gong til for å slette alt',
  'Trykk igjen for å bekrefte': 'Trykk ein gong til for å stadfeste',
  'Skoledash klarte ikke å starte': 'Skoledash klarte ikkje å starte',
  'De lagrede dataene i denne nettleseren kunne ikke leses. Last dem ned først, så går ingenting tapt. Deretter kan du starte med en tom app og importere en tidligere backup.': 'Dei lagra dataa i denne nettlesaren kunne ikkje lesast. Last dei ned først, så går ingenting tapt. Deretter kan du starte med ein tom app og importere ein tidlegare backup.',
  '📤 Last ned lagrede data': '📤 Last ned lagra data',

  // ---------- Velkomst og tilbakemelding ----------
  '👋 Velkommen til Skoledash!': '👋 Velkomen til Skoledash!',
  'Skoledash er et gratis verktøy for klasserommet, uten innlogging og uten abonnement. Alt du legger inn lagres bare i nettleseren din.': 'Skoledash er eit gratis verktøy for klasserommet, utan innlogging og utan abonnement. Alt du legg inn, blir berre lagra i nettlesaren din.',
  'Vil du støtte utviklingen, finner du alltid': 'Vil du støtte utviklinga, finn du alltid',
  'øverst til høyre på siden.': 'øvst til høgre på sida.',
  'Vil du se været der du er, kan appen bruke posisjonen din. Den brukes bare til værvarselet, rundes av til omtrent en kilometer og lagres i nettleseren din. Du kan også velge et sted selv ved å klikke på været øverst til høyre.': 'Vil du sjå vêret der du er, kan appen bruke posisjonen din. Posisjonen blir berre brukt til vêrvarselet, blir runda av til om lag ein kilometer og blir lagra i nettlesaren din. Du kan òg velje ein stad sjølv ved å klikke på vêret øvst til høgre.',
  'Har du brukt Skoledash på den gamle adressen? Hent dataene dine med': 'Har du brukt Skoledash på den gamle adressa? Hent dataa dine med',
  'Funnet en feil, eller har du et ønske til appen? Jeg vil gjerne høre fra deg — velg det som passer deg best.': 'Har du funne ein feil, eller har du eit ønske til appen? Eg vil gjerne høyre frå deg — vel det som passar deg best.',
  '✉️ Send en e-post': '✉️ Send ein e-post',
  '🐙 Opprett en sak på GitHub': '🐙 Opprett ei sak på GitHub',
  'Meld feil eller foreslå en ny funksjon': 'Meld feil eller føreslå ein ny funksjon',
};

const UKEDAGER_NN = ['sundag', 'måndag', 'tysdag', 'onsdag', 'torsdag', 'fredag', 'laurdag'];
const MÅNEDER_NN  = ['januar', 'februar', 'mars', 'april', 'mai', 'juni',
                     'juli', 'august', 'september', 'oktober', 'november', 'desember'];

// Første linje i oppdateringsloggen på nynorsk. Selve loggen står på bokmål.
const LOGG_MERKNAD_NN = '<p class="logg-målform">Oppdateringsloggen er skriven på bokmål.</p>';

// «Hva kommer?» øverst i oppdateringsloggen, på nynorsk. Byter ut <details class="logg-roadmap">
// i OPPDATERINGSLOGG_HTML når nynorsk er valt. Hald han i takt med bokmålsutgåva og ROADMAP.md.
const ROADMAP_KORT_NN = `
  <details class="logg-roadmap">
    <summary>🗺️ Kva kjem? Sjå planen vidare</summary>
    <p>Dette er idear, ikkje lovnader. Rekkjefølgja kan endre seg. Saknar du noko? Sei frå via <strong>💬 Tilbakemelding</strong>.</p>
    <strong>Seinare</strong>
    <ul>
      <li>🔊 Lydnivåmålar med rekord og mål for klassen</li>
      <li>🎡 Lykkehjul som val i Tilfeldig elev</li>
      <li>🃏 Kortbunke med framside og bakside</li>
      <li>🏆 Poengtavle, 🙂 exit-avstemming og rask handsopprekning</li>
      <li>🤸 Rørslepause og lydeffektar</li>
      <li>✏️ Teiknebrett, 🔳 QR-kode og skjermteppe</li>
    </ul>
  </details>`;

// Brukarrettleiinga på nynorsk. Hald ho i takt med BRUKERVEILEDNING_HTML i app.js:
// endrar du bokmålsutgåva, endre denne òg. Namna på knappar og menyar skal vere dei
// same som i nynorsk-menyane (sjå NYNORSK over).
const BRUKERVEILEDNING_NN = `
  <h4>📦 Flytte frå den gamle adressa</h4>
  <p>Skoledash låg tidlegare på <em>knitresletta.github.io/klasserom-dashboard</em> og bur no på <strong>skoledash.app</strong>. Nettlesaren held data frå kvar adresse åtskilde, så klasselister og sider blir ikkje med av seg sjølv. Opne den gamle adressa, trykk <strong>📤 Eksporter og åpne skoledash.app</strong> i banneret øvst, og vel <strong>📥 Importer backup</strong> under <strong>💾 Data</strong> nedst til venstre på den nye sida.</p>
  <h4>☕ Gratis, utan innlogging</h4>
  <p>Skoledash er gratis å bruke. Du treng verken konto eller abonnement, og alt du legg inn, blir liggande i nettlesaren din. Vil du støtte utviklinga, trykkjer du på <strong>☕</strong> heilt øvst til høgre. Då blir ei side for donasjonar opna i ei ny fane. Kva som kjem framover, ser du øvst i <strong>📋 Oppdateringslogg</strong>.</p>
  <h4>Sider: eitt arbeidsbord per klasse</h4>
  <p>Klikk <strong>+</strong> midt i toppfeltet for å leggje til ei ny side (tom, eller frå ein mal du har lagra), klikk på eit sidenamn for å byte, og <strong>✕</strong> på ei fane for å slette. Tanken er at <strong>kvar side er sin eigen klasse</strong>: lag side 1 for 1A og side 2 for 1B, og byt fritt mellom dei gjennom dagen utan at noko blir blanda.</p>
  <p>Dei tre første sidene har kvar si fane. Har du fleire, ligg resten bak <strong>Fleire ▾</strong>: klikk for å sjå dei og byte. Står du på ei av desse sidene, viser knappen namnet på sida, og menyen har dei eigne vala til sida nedst.</p>
  <p><strong>Klikk på namnet til sida du står på</strong> for å få to val: <strong>✏️ Gi nytt namn</strong> og <strong>📑 Lagre som mal</strong>. Nytt namn gjer fana til eit lite skrivefelt. Skriv inn namnet (t.d. «1A» eller «Mattegruppe») og trykk <kbd>Enter</kbd> for å lagre. <kbd>Esc</kbd> avbryt utan å endre namnet. Dobbeltklikk på fana går rett til skrivefeltet.</p>
  <p><strong>Per side</strong> (eiga for kvar klasse): elevlista, grupper, dagsplanen, namnet på klassebamsen, og i tillegg oppsettet av korta, notat og bilete.</p>
  <p><strong>Felles for alle sider:</strong> lagra klasselister (📋 Lister, eit felles bibliotek du kan laste inn på kva side som helst) med trekka sine, tema, font, skriftstorleik og målform.</p>
  <p>Timerar høyrer til sida dei er laga på, men held fram med å gå når du byter side. Vil du til dømes vise eit bilete på ei eiga side medan nedteljinga går, går det heilt fint, og du får beskjed når tida er ute.</p>
  <p>Ei <strong>ny side startar heilt tom</strong>, utan synlege kort. Du hentar sjølv fram akkurat dei korta du vil ha via <strong>⊞ Kort</strong>-menyen, så kvar side blir nøyaktig slik du vil ha ho.</p>
  <p><strong>Side 1 startar med eit lite utval</strong> første gongen du opnar appen: klokke og tilfeldig elev til venstre, dagsplan og notat i midten, og elevlista til høgre. Det er med vilje få kort, så heile sida får plass på skjermen med ein gong. Ordenselevar, klassebamse, terning og grupper ligg klare i <strong>⊞ Kort</strong> og dukkar opp på den faste plassen sin når du kryssar dei av.</p>

  <h4>📚 Klassar: fleire sider for same klasse</h4>
  <p>Ein klasse har sitt eige sett med sider: «Matte», «Norsk» og «Stasjonar» for <strong>7B</strong>. Klikk <strong>Utan klasse ▾</strong> til venstre for fanene, vel <strong>➕ Ny klasse</strong> og gi klassen eit namn. <strong>Har du sider utan klasse, spør dialogen om dei skal bli med.</strong> Det er førehandsvalt, så sidene du har brukt tid på, ikkje blir liggjande gøymde bak «Utan klasse». Elevlista blir den frå sida du står på, og du får beskjed om elevar frå dei andre sidene som ikkje stod der. Vel du å starte tomt, får klassen éi tom side: legg til elevar eller hent ei liste, og trykk <strong>+</strong> for fleire sider, tomme eller frå malane dine. Har du alt ei side for klassen, bruker du <strong>Flytt til klasse</strong> eller <strong>Ny klasse med denne sida</strong> i menyen på sidenamnet, så tek sida med seg elevane sine.</p>
  <p><strong>Klassen eig</strong> elevlista, oppmøtet i dag, koplinga til 📋 Lister (og dermed trekka), klassekartet og vekeplanen. Legg du til ein elev eller merkjer nokon borte på éi side, gjeld det på alle sidene i klassen. <strong>Sida eig</strong> korta og oppsettet, dagsplanen (éin plan), gruppeinndelinga, notat og timerar, så kvart fag kan ha sitt.</p>
  <p>Fanene viser berre sidene i klassen du står i. Klasseknappen byter til ein annan klasse eller til sidene utan klasse. Flyttar du ei side inn i ein klasse som alt har elevar, er det lista til klassen som gjeld, og du får beskjed om kven på sida som ikkje stod der. Flyttar du ei side ut, eller vel <strong>Løys opp klassen</strong>, får sida sin eigen kopi av elevane, så ingenting forsvinn. Ein klasse utan sider forsvinn av seg sjølv.</p>
  <p>Har du ingen klassar, er alt som før: kvar side har si eiga elevliste.</p>

  <h4>📑 Sidemalar</h4>
  <p>Har du sett opp ei side slik du vil ha ho, kan du ta vare på oppsettet som ein mal: klikk på sidenamnet i fana og vel <strong>📑 Lagre som mal</strong>. Malen tek med korta og kvar dei står, kva som blir vist, eigne kortnamn, namnet på klassebamsen og innstillingane i korta (tida på timeren, instruksjonstekstar, notat, YouTube-lenkje). Elevar, grupper, dagsplan, trekk og oppmøte blir <strong>ikkje</strong> med: malen er bordet, ikkje klassen.</p>
  <p>Trykk <strong>+</strong> og vel malen for å lage ei ny side frå han. Sida får namnet til malen og heilt eigne kort, så det du skriv der, endrar ikkje malen. Biletkort kjem tomme, og ein teljar startar på null. Lagrar du ei side med eit malnamn som finst frå før, blir malen bytt ut. <strong>✕</strong> ved ein mal i +-menyen slettar han (trykk to gonger). Malane blir med i 📤 backup.</p>

  <h4>📤 Del ei side med ein kollega</h4>
  <p>Klikk på sidenamnet og vel <strong>📤 Del sida</strong>. Då blir ei fil lasta ned med det same som ein mal har: korta, oppsettet og innstillingane, men <strong>ingen elevar</strong>, grupper, dagsplan, trekk eller bilete. Send fila til kollegaen (e-post, Teams, minnepinne). <strong>📤</strong> ved ein mal i +-menyen deler malen på same måte.</p>
  <p>Kollegaen trykkjer <strong>+</strong>, vel <strong>📥 Importer side frå fil</strong> og peikar på fila. Sida kjem inn som ein mal i +-menyen, og som ei ny side med ein gong. Finst namnet frå før, får den nye malen eit tal bak namnet.</p>

  <h4>Kom i gang</h4>
  <p>Trykk <strong>+ Legg til elev</strong> (eller tasten <kbd>a</kbd>) for å leggje inn elevane i klassen din. Du kan ha opptil 35 elevar inne samtidig.</p>
  <p><strong>Rette eit namn:</strong> klikk rett på elevnamnet i lista, så blir det til eit lite skrivefelt. Rett opp og trykk <kbd>Enter</kbd> for å lagre, eller <kbd>Esc</kbd> for å avbryte. Endrar du namnet, blir det oppdatert automatisk overalt der eleven er brukt: i grupper, trekk-backlogar og gruppeavgrensingar. (Vil du heller fjerne eleven, bruk <strong>✕</strong> til høgre.)</p>
  <p><strong>Fjerne ein elev:</strong> trykk <strong>✕</strong> til høgre for namnet (blir vist når du held musa over), eller <strong>🧹 Tøm</strong> nedst i kortet for å tømme heile lista. Eleven forsvinn då òg frå gruppene, trekk-backlogane og gruppeavgrensingane.</p>
  <p><strong>Stor forbokstav kjem av seg sjølv:</strong> skriv du «kari nordmann», blir det lagra som «Kari Nordmann». Det same gjeld etter bindestrek («Anne-Marie»), og namn med æ, ø og å blir handsama rett.</p>
  <p>Vil du spare tid neste gong? Lagre elevlista di under <strong>📋 Lister</strong>, og last ho inn att med eitt klikk.</p>
  <p><strong>Starte ein ny klasse:</strong> trykk <strong>🧹 Tøm</strong> nedst i elevkortet, og trykk ein gong til når knappen spør. Elevane, gruppene og oppmøtet forsvinn frå sida, og <strong>+ Legg til elev</strong> blir opna. Lagra lister blir ikkje rørte. Står det <strong>Ikkje lagra. Tøm?</strong> på knappen, er elevane ikkje lagra i ei liste og blir borte.</p>

  <h4>🎂 Bursdagar</h4>
  <p>Hald musa over ein elev i elevlista og trykk <strong>🎂</strong>. Skriv dag og månad, t.d. «14.03», og trykk <kbd>Enter</kbd>. Når dagen kjem, står <strong>👑 og fornamnet</strong> i toppfeltet mellom fanene og vêret, så lenge eleven står på lista til sida du har framme. Har fleire bursdag same dag, står alle der. Ein svak 🎂 i lista viser kven som har bursdag lagt inn; klikk på han for å endre eller fjerne. Bursdagen blir lagra på eleven, så han blir med i 📋 Lister og i backupen. Berre dag og månad blir lagra, aldri år.</p>

  <h4>📋 Klasselister</h4>
  <p>Opne <strong>📋 Lister</strong> i elevkortet, eller <strong>📋 Klasselister</strong> i 🏫 Skoledash-menyen. <strong>💾 Lagre nåværende</strong> lagrar elevlista på sida du står på. Klikk på ei liste for å laste ho inn. Lagra lister blir delte av alle sidene dine.</p>
  <p>Kvar liste har fem knappar: <strong>✏️</strong> gir lista nytt namn (<kbd>Enter</kbd> lagrar, <kbd>Esc</kbd> avbryt), <strong>⛔</strong> opnar para som ikkje skal i same gruppe, <strong>📤</strong> lastar ned lista som ei fil, <strong>🔄</strong> byter ut elevane i lista med elevane på sida, og <strong>✕</strong> slettar ho. 🔄 bruker du når du har lagt til eller fjerna elevar og vil at lista skal hugse det. Både 🔄 og ✕ må trykkjast to gonger: første trykket gjer knappen om til <strong>Skrive over?</strong> eller <strong>Slette?</strong>.</p>
  <p><strong>Del ei liste med ein vikar eller kollega:</strong> trykk <strong>📤</strong> og send fila. Mottakaren trykkjer <strong>📥 Importer liste</strong> nedst i Klasselister. Para følgjer med. Fila inneheld elevnamn, så tenk over kven du gir ho til. Har mottakaren ei liste med same namn frå før, blir ho erstatta.</p>
  <p>Står det <em>(denne sida)</em> bak ei liste, er det den lista sida sist vart lasta frå eller lagra som. Lista og sida er elles kvar sin kopi: endrar du elevar på sida, hamnar det i lista først når du lagrar ho på nytt.</p>
  <p><strong>Ordne listene:</strong> ta tak i <strong>⠿</strong> til venstre og dra lista dit du vil ha ho. Slepper du ho midt på ei anna liste, blir dei to ei gruppe, som i startmenyen i Windows, og du kan gi gruppa eit namn med ein gong (til dømes «Trinn 7»). Dra fleire lister inn på gruppa, eller dra dei ut att. Klikk på gruppa for å falde ho saman eller opne ho. Ei gruppe som blir tom, forsvinn av seg sjølv.</p>
  <p><strong>Trekka følgjer lista.</strong> Kven som har vore ordenselev, hatt bamsen og vorte trekt, blir hugsa per liste. Byter du til ei anna liste og tilbake, er trekka der framleis. Bruker to sider same liste, deler dei trekka.</p>

  <h4>✓ Kven er her i dag?</h4>
  <p>Kvar elev i lista har to små runde knappar: <strong>✓</strong> tyder at eleven er her, og <strong>−</strong> tyder at eleven er borte. Trykk på same knapp ein gong til for å fjerne merket.</p>
  <p><strong>Elevar som er borte, er ikkje med i trekka</strong> (tilfeldig elev, ordenselevar og klassebamse) <strong>eller når du deler inn i grupper.</strong> Namnet blir grått og gjennomstreka i lista, og under lista står det kor mange som er borte. Elevar du ikkje har merkt, er med som vanleg, så du treng berre å merke dei som manglar. ✓ er der for deg som vil krysse av heile klassen.</p>
  <p><strong>Har du alt laga grupper,</strong> blir dei ståande som dei er. Ein elev som er borte, blir vist nedtona i gruppa si, og er utelaten neste gong du trykkjer <strong>🎲 Del inn</strong>.</p>
  <p><strong>Kjem ein elev etter at gruppene er laga?</strong> Var eleven merkt borte då du delte inn, står eleven utanfor gruppene. Trykk <strong>✓</strong> (eller − ein gong til for å fjerne borte-merket), så hamnar eleven i den minste gruppa, akkurat som ein ny elev. Gruppeavgrensingane blir følgde.</p>
  <p>Merka gjeld <strong>berre i dag</strong>. Neste dag er alle umerkte att, så ingen blir hengande som borte. Kvar side har sitt eige oppmøte.</p>

  <h4>Trekke elevar</h4>
  <p><strong>🙋 Tilfeldig elev</strong>: trykk <strong>Trekk</strong> for å velje ein tilfeldig elev frå lista. Vanleg trekk unngår å velje same elev to gonger på rad.</p>
  <p><strong>Fleire Tilfeldig elev:</strong> <strong>+ 🙋 Tilfeldig elev</strong> under ⊞ Kort lagar eit kort til, med sin eigen backlog, til dømes «Les høgt» og «Svarar på tavla». <kbd>r</kbd> og <kbd>R</kbd> trekkjer i kortet musa er over.</p>
  <p><strong>Trekk (bl)</strong> trekkjer utan repetisjon (backlog). Kvar elev blir trekt éin gong før nokon blir trekt på nytt. Talet på trekte står under knappen. Når alle er trekte, trykkjer du <strong>🔄</strong> øvst i kortet (blir vist når du held musa over) for å starte på nytt.</p>
  <p><strong>⭐ Ordenselevar</strong> vel to elevar som har ordenselev-ansvar. Alle får tur før nokon blir gjentekne, og når alle har vore ordenselev, startar ein ny runde av seg sjølv, med ei melding om det. Er det éin elev att, kjem den eleven med i første trekket i den nye runden. To elevar som ikkje skal i same gruppe (⛔), blir heller aldri ordenselevar saman. Vil du berre ha éin ordenselev, trykkjer du <strong>👥</strong> øvst i kortet, så blir han til <strong>👤</strong>. Valet gjeld lista, som trekka.</p>
  <p><strong>Klassebamse</strong> vel kven som får bamsen (eller ein annan gjenstand) med heim. Går òg i rundar av seg sjølv.</p>
  <p><strong>Borte når runden er ferdig?</strong> Ein elev som er merkt borte og ikkje har hatt tur, mistar han ikkje: eleven blir trekt først når eleven er tilbake.</p>
  <p>Vil du nullstille eit trekk for hand? Hald musa over kortet og trykk <strong>🔄</strong> øvst. På Ordenselevar og Klassebamse må du trykkje to gonger, så ingen runde forsvinn ved eit uhell.</p>

  <h4>📝 Redigere backlog for ordenselev og klassebamse</h4>
  <p>Trykk på blyantikonet (📝) i hjørnet av kortet. Du ser alle elevane som brikker, og grå brikker er alt «brukte». Trykk på ein elev for å setje eller fjerne merket. Nyttig om du har mista lokale data og må finne ut att kven som har vore ordenselev eller hatt med bamsen.</p>

  <h4>✏️ Gi eit kort eit eige namn</h4>
  <p>Hald musa over kortet og trykk <strong>✏️</strong> øvst. Tittelen blir eit skrivefelt: skriv namnet og trykk <kbd>Enter</kbd>, eller <kbd>Esc</kbd> for å avbryte. Tømer du feltet, får kortet standardnamnet tilbake. Namnet gjeld sida du er på. Gir du Klassebamse eit namn, blir det òg brukt i meldingane («Bo tek med Teddy heim»). Klokka har ikkje ✏️, fordi overskrifta der byter visning.</p>

  <h4>Grupper</h4>
  <p>Trykk <strong>🎲 Del inn</strong> i Grupper-kortet (eller tasten <kbd>g</kbd>). Skriv inn kor mange grupper du vil ha, og elevane blir fordelte tilfeldig. Gruppefargane blir òg viste i elevlista. Trykk <strong>✕</strong> for å fjerne gruppeinndelinga.</p>
  <p><strong>Ny elev når gruppene er laga:</strong> eleven hamnar i den minste gruppa, og dei andre blir verande der dei er. Er fleire grupper like små, blir ei av dei vald tilfeldig. Gruppeavgrensingar blir følgde: passar eleven ikkje i nokon gruppe utan å bryte ei, står eleven utanfor til du deler inn på nytt.</p>

  <h4>🪑 Klassekart</h4>
  <p>Hent fram <strong>Klassekart</strong> under <strong>⊞ Kort</strong>. Kortet viser rommet som eit rutenett av pultar, med tavla øvst. Trykk <strong>🛠</strong> for å gjere rommet likt ditt: + og − endrar rader og kolonnar, og eit klikk på ei rute slår pulten av eller på (døra, kateteret, ein tom plass). Trykk 🛠 ein gong til når du er ferdig.</p>
  <p><strong>Setje elevar på plass:</strong> klikk på ein elev (på ein pult, eller i lista <strong>Utan plass</strong> under rommet), og så på pulten eleven skal ha. Klikkar du på ein pult der nokon alt sit, byter dei to plass. <strong>Ta av pulten</strong> set den valde eleven tilbake i lista. <strong>🎲 Trekk plassar</strong> gir alle ein tilfeldig pult, og «hald frå kvarandre»-para frå klasselista får ikkje sitje vegg i vegg, verken ved sida av eller framfor og bak kvarandre.</p>
  <p>Pultane viser gruppefargane når klassen er delt inn, og elevar som er merkte borte i dag, blir viste nedtona. Trykk <strong>⛶</strong> eller <kbd>f</kbd> for å fylle heile skjermen med rommet. Rommet (rader, kolonnar og kva ruter som er pultar) blir med i malar og når du deler sida, men ikkje kven som sit kvar.</p>

  <h4>⛔ Gruppeavgrensing</h4>
  <p>Klikk <strong>⛔</strong> ved ei liste i <strong>📋 Klasselister</strong>, eller <strong>⛔ Par</strong> i hjørnet av Grupper-kortet. Vel to elevar i nedtrekkslistene og klikk <strong>Legg til</strong>. Paret hamnar aldri i same gruppe. Du kan leggje til så mange par du vil. Fjern eit par ved å klikke <strong>✕</strong> ved sida av det.</p>
  <p><strong>Para blir lagra i klasselista,</strong> ikkje på sida. Då blir dei med når du deler lista med ein vikar, og dei gjeld på kvar side du lastar lista inn på. Har sida inga lagra liste enno, ber ⛔ deg lagre lista først. Par du laga før dette, verkar som før og blir flytta inn i lista neste gong du lagrar eller lastar ho.</p>

  <h4>🎲 Terning</h4>
  <p>Trykk <strong>🎲 Kast</strong> (eller tasten <kbd>k</kbd>) for å kaste. Terningen trillar eit lite augeblikk før han landar, så klassen rekk å bli spent.</p>
  <p><strong>Vel terningtype</strong> i knappraden: <strong>d4, d6, d8, d10, d12</strong> eller <strong>d20</strong>. Talet seier kor mange sider terningen har. Den vanlege sekssida terningen (d6) har prikkar, slik elevane kjenner han att frå brettspel. Dei andre har tal på flatene, akkurat som ekte terningar av den typen.</p>
  <p><strong>Fleire terningar:</strong> bruk <strong>−</strong> og <strong>+</strong> ved sida av kast-knappen for å kaste opptil 36 om gongen. Terningane blir lagde i rader som er så kvadratiske som mogleg, og kortet tilpassar seg. Då blir <strong>summen</strong> vist under terningane. Nyttig i matte, eller når to terningar skal gi eit tal mellom 2 og 12.</p>
  <p>Byter du type eller tal, blir det kasta på nytt automatisk, så det aldri ligg att eit gammalt resultat som ikkje passar terningen. Siste kast blir hugsa til neste gong du opnar sida.</p>
  <p>Terningoppsettet er <strong>felles for alle sider</strong>.</p>

  <h4>🕐 Klokke</h4>
  <p>Viser ei <strong>analog urskive</strong> med tala 1–12 og tre visarar, og den <strong>digitale tida</strong> rett under. Time- og minuttvisaren glir jamt slik ekte klokker gjer. Er ho 09:55, står timevisaren nesten på 10, ikkje rett på 9. Det gjer kortet trygt å bruke når klassen øver på å lese klokka.</p>
  <p><strong>Vel visning:</strong> klikk på overskrifta i kortet (der det står <strong>Begge</strong>, <strong>Analog</strong> eller <strong>Digital</strong>) for å byte mellom urskive og tal, berre urskive eller berre tal. Valet blir hugsa.</p>
  <p>Kortet viser berre tida. <strong>Vêret finn du oppe til høgre</strong> i toppen av sida. Sjå avsnittet under.</p>
  <p>Klokka går sjølv om nettet er nede, for ho hentar tida frå maskina di.</p>

  <h4>🌦 Vêret</h4>
  <p>Oppe til høgre står dagens vêr med symbol, temperatur og stadnamn. <strong>Klikk på det</strong> for å opne detaljane: vind, <strong>nedbør dei neste 6 timane</strong>, <strong>pollenvarsel</strong>, luftfuktigheit og lufttrykk, og i tillegg varselet time for time dei neste åtte timane.</p>
  <p><strong>Pollenvarselet</strong> viser kva pollentype som er høgast akkurat no (or, bjørk, gras eller burot) og kor kraftig det er. Er nivået høgt, blir teksten raud. Nyttig å vite før friminuttet om du har allergikarar i klassen.</p>
  <p><strong>Vel stad for vêret.</strong> Første gongen kan du trykkje <strong>📍 Vis vêret der du er</strong> i velkomstmeldinga. Då spør nettlesaren om å få bruke posisjonen din, og vêret blir sett til staden der du er. Under stadnamnet står det kvar staden kom frå, så du aldri er i tvil.</p>
  <p><strong>Vil du byte stad?</strong> Nedst i vêrvindauget ligg <strong>📍 Bruk posisjonen min</strong>, og eit søkjefelt der du kan skrive inn kva stad som helst og trykkje <kbd>Enter</kbd>. Fylke og land står under kvart treff, så du ikkje hamnar i feil land. Staden blir ståande til du byter han sjølv. Appen spør ikkje om posisjonen din kvar gong du opnar han.</p>
  <p>Har du ikkje valt nokon stad, eller seier nei til posisjon, blir <strong>Eidsvoll</strong> brukt til du vel noko anna. Har du valt ein stad tidlegare, blir han brukt.</p>

  <h4>🔢 Teljar, 📣 Instruksjon og 📅 Nedteljing til dato</h4>
  <p>Alle tre blir lagde til under <strong>⊞ Kort</strong>, så mange du vil, og får namn med ✏️. <strong>Teljar</strong> er eit stort tal med + og −, for poeng per gruppe, rundar eller åtvaringar. Han går ikkje under null, og ↺ må trykkjast to gonger. <strong>Instruksjon</strong> er eitt stort skilt: klikk på teksten, skriv beskjeden («Jobb stille til 10.15») og trykk <kbd>Enter</kbd>. <strong>Nedteljing til dato</strong> viser kor mange dagar det er til noko: klikk på kortet, vel datoen og skriv kva som skjer. Kortet seier «i dag!» på dagen, og viser etterpå at det er over.</p>
  <p>Vekenummeret står ved datoen øvst, slik at det alltid er synleg.</p>

  <h4>🔇 Arbeidssymbol</h4>
  <p>Hent kortet fram under <strong>⊞ Kort</strong>. Trykk på eit symbol i rada nedst for å vise det stort: 🔇 Stille arbeid, 🗣️ Kviskrestemme, 🤝 Pararbeid, 👥 Gruppearbeid, 🙋 Rekk opp handa eller 👀 Sjå hit. Trykk på det same symbolet igjen for å fjerne det.</p>
  <p><strong>＋</strong> lagar eit eige symbol med emoji og tekst, til dømes «📖 Lesestund». Eigne symbol finst på alle sidene dine, og blir sletta med ✕ i det same vindauget. Kvar side hugsar sitt eige symbol.</p>

  <h4>🚦 Trafikklys</h4>
  <p>Eit eige kort under <strong>⊞ Kort</strong>, med raudt, gult og grønt lys og ingen tekst. Kva fargane tyder, avtaler du med klassen. Trykk på eit lys for å tenne det, og igjen for å sløkkje. Kvar side hugsar sitt eige lys.</p>

  <h4>🔍 Fokus: eitt kort på heile skjermen</h4>
  <p>Hald musa over eit kort og trykk <strong>⛶</strong> øvst i kortet, eller tasten <kbd>f</kbd>. Kortet fyller heile vindauget, og innhaldet blir så stort det får plass til (overskrifta og knappane held vanleg storleik, det er berre det klassen skal sjå som veks): timeren for heile klassen, elevlista, dagsplanen eller trekket. Alt verkar som vanleg inne i fokus, så du kan starte timeren og krysse av dagsplanen der.</p>
  <p>Lukk med <kbd>Esc</kbd>, <kbd>f</kbd>, <strong>✕ Lukk fokus</strong> øvst til høgre eller eit klikk utanfor kortet. Kortet ligg der det låg på bordet, med same storleik. Vil du ha heile skjermen utan fanene og adressefeltet, trykkjer du <kbd>F11</kbd> i tillegg.</p>

  <h4>Timer</h4>
  <p>Legg til ein timer med <strong>+ ⏱ Timer</strong> under <strong>⊞ Kort</strong>. Du kan ha så mange du vil på ei side, til dømes éin for gruppearbeidet og éin for pausen. Gi dei namn med ✏️, så seier varselet kva for ein som er ferdig. Kvar timer har si eiga tid, og ✕ fjernar han.</p>
  <p>Standard er 5 minutt. Trykk <strong>Set tid</strong> (eller <kbd>s</kbd>) for å velje ei anna lengd (1–60 min). Start og stopp med <strong>▶ Start</strong> (eller <kbd>t</kbd>). Det kjem ein lyd når tida er ute.</p>
  <p>Med fleire timerar gjeld <kbd>t</kbd> og <kbd>s</kbd> timeren musa er over, elles den første på sida. Har sida ingen timer, lagar <kbd>t</kbd> ein ny og startar han.</p>
  <p>Startar du timeren med <kbd>t</kbd> medan timerkortet ikkje er framme, blir kortet henta fram av seg sjølv og lagt øvst, så klassen ser nedteljinga.</p>
  <p>Timeren går rett sjølv om du viser noko i ei anna fane ei stund, og lastar du sida inn på nytt, held han fram der han var.</p>
  <p><strong>⏱ Stoppeklokke:</strong> vel fana øvst i kortet for å telje oppover i staden. Start og stopp på same måte, og ↺ set ho tilbake til null. Nedteljinga og stoppeklokka går kvar for seg: ei nedteljing du har starta, held fram og pip når tida er ute, sjølv om du ser på stoppeklokka.</p>
  <p><strong>◔ Skive:</strong> hald musa over kortet og trykk ◔ øvst for å vise tida som ei skive som krympar, som eit timeglas. ▬ byter tilbake til bjelken. På stoppeklokka går skiva rundt éin gong i minuttet.</p>

  <h4>Notat</h4>
  <p>Eit felt for fritekst som veks automatisk med innhaldet. Det blir lagra automatisk i nettlesaren, så du mistar ikkje notatet når sida blir lasta på nytt.</p>
  <p>Du kan ha <strong>fleire notatkort</strong>: opne <strong>⊞ Kort</strong>-menyen og klikk <strong>+ Notat</strong>. Kvart notat kan flyttast uavhengig av dei andre. Slett eit notat med <strong>✕</strong> øvst til høgre i kortet. Notat er per side, så side 1 og side 2 har heilt ulike notatkort.</p>

  <h4>Dagsplan</h4>
  <p>Legg til punkt med <strong>+ Legg til punkt</strong> (eller <kbd>d</kbd>). Fjern einskildpunkt med <strong>✕</strong> ved sida av kvart punkt, eller tøm heile planen med <strong>🧹</strong> øvst i kortet (to trykk).</p>
  <p><strong>Gjennom dagen:</strong> punktet som går føre seg, er utheva. Trykk <strong>▶ Neste</strong> (eller <kbd>p</kbd>) når de er ferdige med det, så blir det kryssa av og neste punkt blir utheva. <kbd>Shift</kbd>+<kbd>P</kbd> angrar. Kryssar du av for hand med prikken, følgjer uthevinga med.</p>
  <p>Kvart punkt har tre stader du kan klikke: <strong>prikken</strong> (●) merkjer punktet som ferdig. Han blir grøn, og teksten får ein strek over (klikk igjen for å angre). <strong>Teksten</strong> opnar redigering: klikk på han, rett opp og trykk <kbd>Enter</kbd> for å lagre eller <kbd>Esc</kbd> for å avbryte. <strong>✕</strong> fjernar punktet.</p>
  <p><strong>Endre rekkjefølgja:</strong> hald inne drahandtaket <strong>⠿</strong> heilt til høgre på punktet (det kjem fram når du held musa over rada), og dra det opp eller ned. Ein blå strek viser kvar punktet hamnar når du slepper.</p>
  <p><strong>🗓 Vekeplan:</strong> trykk <strong>🗓</strong> øvst i kortet for éin plan per skuledag. Fanene <strong>Mån</strong> til <strong>Fre</strong> lèt deg sjå og fylle kvar dag; ein prikk under fana viser dagen i dag. Når du opnar appen, viser kortet planen for i dag, og det byter aldri dag av seg sjølv, heller ikkje ved midnatt. Avkryssingane blir nullstilte når ein ny dag byrjar, så måndagsplanen er klar att neste måndag. Planen du hadde frå før, blir planen for dagen som blir vist. <kbd>d</kbd>, <kbd>p</kbd> og ▶ Neste gjeld dagen som blir vist. Trykk 🗓 ein gong til for å gå tilbake til éin plan.</p>

  <h4>🖼 Bilete</h4>
  <p>Biletkortet er ikkje med frå start. Legg det til via <strong>⊞ Kort → + 🖼 Bilete</strong>. Du kan ha så mange biletkort du vil.</p>
  <p>Klikk på biletkortet for å velje ei biletfil frå datamaskina (maks 50 MB). Du kan òg lime inn eit bilete direkte med <kbd>Ctrl+V</kbd> (t.d. eit skjermbilete). Klikk først på kortet du vil lime inn i. Biletet blir lagra i nettlesaren (IndexedDB) og vist att ved neste besøk. Trykk <strong>Fjern biletet</strong> for å slette innhaldet.</p>
  <p>Slett eit biletkort med <strong>✕</strong> øvst til høgre i kortet. Biletkort er per side, så ulike sider har ulike bilete.</p>

  <h4>▶️ YouTube</h4>
  <p>Legg til eit YouTube-kort via <strong>⊞ Kort</strong>-menyen og <strong>+ ▶️ YouTube</strong>. Lim inn ei YouTube-lenke (vanleg lenke, <em>youtu.be</em> og <em>Shorts</em> fungerer alle) og trykk <strong>Vis</strong>. Videoen blir spelt rett i kortet.</p>
  <p><strong>🎵 Berre lyd:</strong> byt mellom <strong>▶ Video</strong> og <strong>🎵 Berre lyd</strong> øvst i kortet. Med berre lyd blir biletet skjult, og du får ei lita linje for spel og pause med ein <strong>volumglidar</strong> (🔊) til høgre. Fint for bakgrunnsmusikk eller eit lydklipp utan at videoen tek plass. Volumet du stiller inn, blir hugsa til neste gong. Lyden held fram utan avbrot når du byter modus. Trykk <strong>↻</strong> for å byte til ei anna lenke, og <strong>✕</strong> for å slette kortet.</p>
  <p>Du kan ha <strong>fleire YouTube-kort</strong>, og dei er per side som dei andre korta.</p>

  <h4>Tilpasse oppsettet</h4>
  <p><strong>Flytte eit kort:</strong> ta tak i overskrifta på kortet og dra det dit du vil. Korta kan liggje kvar som helst på skjermen, også delvis oppå kvarandre. Kortet du tek i, legg seg øvst.</p>
  <p><strong>Endre storleik:</strong> dra i ein kant eller eit hjørne av kortet. Er innhaldet større enn kortet, kan du rulle inne i det.</p>
  <p><strong>Bilete og YouTube</strong> har alltid høgda mediet treng, så proporsjonane held. Du endrar storleiken ved å dra i sidene eller hjørna, og høgda følgjer med. Byter du YouTube til <strong>Berre lyd</strong>, krympar kortet til lydlinja.</p>
  <p><strong>Kort som veks sjølv:</strong> elevar, dagsplan, grupper og notat blir høgare når innhaldet veks og lågare når det krympar. Dei veks nedover, og er det stopp under (eit anna kort eller botnen av skjermen), veks dei oppover så langt det er plass. Er det ikkje meir plass, kan du rulle i dei. Drar du eit slikt kort større sjølv, blir den høgda ei minstehøgd: kortet krympar ikkje under henne, men veks framleis når innhaldet ikkje får plass.</p>
  <p><strong>Magnetiske kantar:</strong> når ein kant kjem nær kanten av skjermen eller eit anna kort, smell han på plass, og ei blå linje viser kva han festa seg til. Då blir det lett å få korta på rad. Hald <kbd>Alt</kbd> medan du drar om du vil plassere heilt fritt.</p>
  <p><strong>Same oppsett på tavla:</strong> plassering og storleik blir hugsa som delar av skjermen, ikkje i pikslar. Lagar du oppsettet på den berbare maskina, ser det likt ut på tavla, berre større. Oppsettet blir lagra per side.</p>
  <p><strong>Fjerne eit kort:</strong> hald musa over kortet og klikk <strong>✕</strong> øvst i høgre hjørne. Faste kort (elevar, grupper, trekk, timer, dagsplan) blir berre skjulte, og du hentar dei att i <strong>⊞ Kort</strong>-menyen. Notat- og biletkort blir sletta heilt.</p>
  <p><strong>⊞ Kort-menyen</strong> (øvst til høgre) viser dei faste korta med avkryssing for på og av per side. Notat, bilete og YouTube har i staden ein <strong>«+»</strong>. Trykk for å leggje til så mange du vil. Kvart nytt kort høyrer til sida du står på.</p>
  <p><strong>Kvar hamnar eit nytt kort?</strong> På første ledige plass, rekna ovanfrå og frå venstre, anten du kryssar det av i menyen eller trykkjer «+». Er skjermen full, blir det lagt litt forskove oppå dei andre, så du ser det med ein gong. Eit kort du slår av og på att, kjem tilbake der det stod om plassen er ledig. Elles held det på storleiken sin og hamnar på første ledige plass.</p>
  <p><strong>Liten skjerm:</strong> på smale skjermar (nettbrett på høgkant, mobil) blir korta stabla under kvarandre, ovanfrå og ned i same rekkjefølgje som på den store skjermen.</p>

  <h4>🎨 Ikona</h4>
  <p>Ikona i appen er <strong>Fluent Emoji</strong> frå Microsoft (fri MIT-lisens), i flat stil. Dei ligg i appen sjølv, så ingenting blir henta frå andre, og dei ser like ut anten tavla køyrer Mac, Windows eller Chromebook. Emoji du skriv inn sjølv, i notat eller elevnamn, blir òg viste med dei.</p>

  <h4>Tema</h4>
  <p>Opne <strong>Skoledash-menyen</strong> (🏫 Skoledash øvst til venstre) og hald musa over <strong>🎨 Tema</strong>. Vel mellom tre standardtema (Lyst, Mørkt, Høg kontrast) eller sju kreative tema: Under vatnet, På fjellet, I skogen og I ein vulkan under <strong>Eventyr</strong>, og Fluttershy, Twilight og Rarity under <strong>Jonatan spesial</strong>. Høg kontrast er kvit tekst på svart bakgrunn, laga for å lesast på avstand. Fleire tema har eit svakt mønster i bakgrunnen. Temaet blir lagra automatisk.</p>

  <h4>Font</h4>
  <p>Hald musa over <strong>🔤 Font</strong> i Skoledash-menyen. Vel mellom systemstandard og fem andre: <em>Lexend</em> (laga for å gjere lesing lettare), <em>Outfit</em> (rein og moderne), <em>Sniglet</em> (rund og leiken), <em>Kalam</em> (handskrift) og <em>JetBrains Mono</em> (alle teikn like breie). Valet blir lagra til neste gong.</p>
  <p>Fontane ligg på skoledash.app, så appen hentar ingenting frå Google eller andre fonttenester.</p>

  <h4>Målform (bokmål eller nynorsk)</h4>
  <p>Hald musa over <strong>🗣 Målform</strong> i Skoledash-menyen og vel <strong>Bokmål</strong> eller <strong>Nynorsk</strong>. Sida blir lasta på nytt med den nye målforma, og valet blir hugsa. Alt du har lagt inn, som elevnamn og notat, blir ståande slik du skreiv det.</p>

  <h4>Skriftstorleik</h4>
  <p>Hald musa over <strong>📏 Skriftstorleik</strong> i Skoledash-menyen. Under <strong>Alle kort</strong> skalerer du heile skjermbiletet (Liten → Ekstra stor), der Normal er standardstorleiken. Under <strong>Enkelt kort</strong> står kvart kort som er på sida, med eit tal i prosent. <strong>0</strong> betyr same storleik som alle dei andre. Skriv til dømes <strong>-20</strong> for å gjere kortet 20 % mindre, eller <strong>30</strong> for å gjere det 30 % større. Du kan òg bruke piltastane. Talet kan vere frå -50 til 100.</p>
  <p><strong>Klokke, timer, tilfeldig elev, ordenselevar, klassebamse og terning</strong> står ikkje i lista. Så lenge du ikkje har endra storleiken sjølv, er kortet akkurat så høgt som innhaldet treng, og det veks om det dukkar opp meir (til dømes backlog-teljaren i trekket). Drar du kortet større, blir tal, urskive og knappar større. Gjer du det mindre enn innhaldet treng, krympar innhaldet så alt framleis får plass.</p>
  <p>Storleiken blir hugsa sjølv om du tek bort kortet. Slår du det på att seinare, har det same storleik som før.</p>

  <h4>Tekststorleik og kursiv i notat</h4>
  <p>Trykk <strong>A−</strong> og <strong>A+</strong> øvst i Notat-kortet for å gjere teksten mindre eller større, frå 75 % opp til fire gonger standardstorleiken. Kvart notat hugsar sin eigen storleik, og kortet veks med teksten.</p>
  <p>Trykk <strong><em>𝐼</em></strong>-knappen for å slå kursiv tekst av og på. Innstillingane blir lagra automatisk.</p>

  <h4>Tavlemodus</h4>
  <p>Trykk <strong>🖥 Tavle</strong> (eller <kbd>b</kbd>) for ein heilt svart skjerm. Nyttig når du vil samle merksemda til elevane. Klikk kvar som helst eller trykk <kbd>Esc</kbd> for å avslutte.</p>

  <h4>👀 Auge hit</h4>
  <p>Trykk <kbd>ø</kbd> når du treng blikket til alle. Du får opp meldinga (frå start «Auge hit!») og kan endre henne før du trykkjer <kbd>Enter</kbd>: då fyller ho heile skjermen i fargen til temaet, med ein mild lyd. Klikk, <kbd>Esc</kbd> eller <kbd>ø</kbd> tek henne bort att. <kbd>Shift</kbd>+<kbd>Ø</kbd> viser førre melding rett på, utan å spørje. Lyden slår du av i same dialog. Meldinga er felles for alle sidene og blir med i backupen.</p>

  <h4>Snarvegar på tastaturet</h4>
  <ul>
    <li><kbd>a</kbd> Legg til elev</li>
    <li><kbd>r</kbd> Trekk tilfeldig elev</li>
    <li><kbd>R</kbd> Trekk tilfeldig (backlog)</li>
    <li><kbd>o</kbd> Trekk ordenselevar</li>
    <li><kbd>u</kbd> Trekk klassebamse</li>
    <li><kbd>t</kbd> Start eller stopp timeren</li>
    <li><kbd>s</kbd> Set tid på timeren</li>
    <li><kbd>g</kbd> Del inn i grupper</li>
    <li><kbd>d</kbd> Legg til punkt i dagsplanen</li>
    <li><kbd>p</kbd> Neste punkt i dagsplanen (<kbd>Shift</kbd>+<kbd>P</kbd> angrar)</li>
    <li><kbd>f</kbd> Fokus: kortet musa er over, fyller skjermen (<kbd>Esc</kbd> lukkar)</li>
    <li><kbd>k</kbd> Kast terning</li>
    <li><kbd>l</kbd> Vis klasselister</li>
    <li><kbd>b</kbd> Tavlemodus</li>
    <li><kbd>n</kbd> 💾 Data (backup og sletting)</li>
    <li><kbd>ø</kbd> 👀 Auge hit: skriv meldinga og vis henne (<kbd>Shift</kbd>+<kbd>Ø</kbd> viser førre rett på)</li>
    <li><kbd>Esc</kbd> Lukk opne vindauge</li>
  </ul>
  <p>Snarvegane verkar berre når du <em>ikkje</em> står og skriv i eit tekstfelt, og dei blir ikkje utløyste saman med <kbd>Cmd</kbd>, <kbd>Ctrl</kbd> eller <kbd>Alt</kbd>.</p>

  <h4>💬 Tilbakemelding og kontakt</h4>
  <p>Klikk <strong>💬 Tilbakemelding</strong> i Skoledash-menyen (🏫 Skoledash øvst til venstre). Der finn du to måtar å nå utviklaren på: send ein e-post til <strong>knitresletta@pm.me</strong>, eller opprett ei sak (issue) på GitHub for å melde ein feil eller føreslå ein ny funksjon.</p>

  <h4>Lagring og personvern</h4>
  <p>Alt du legg inn, blir lagra automatisk i nettlesaren din: elevnamn, klasselister, grupper, notat og bilete. <strong>Ingen elevdata forlèt maskina.</strong> Ulike nettlesarar og private vindauge har kvar si lagring.</p>
  <p>Nokre funksjonar hentar likevel data frå andre tenester. Det som blir sendt, er aldri elevdata, men tenesta ser IP-adressa di, slik alle nettsider gjer:</p>
  <ul>
    <li><strong>Sjølve appen</strong> blir lasta frå skoledash.app. Fontane ligg òg der og blir ikkje henta frå Google eller andre fonttenester.</li>
    <li><strong>Vêr og pollen</strong> blir henta når appen startar og kvart tiande minutt. Koordinatane til staden blir sende til Meteorologisk institutt (api.met.no) og open-meteo.com. Søkjer du opp ein stad, blir stadnamnet sendt til open-meteo.com.</li>
    <li><strong>Posisjon</strong> blir berre brukt når du ber om det, med <strong>📍 Vis vêret der du er</strong> eller <strong>📍 Bruk posisjonen min</strong>. Koordinatane blir runda av til om lag ein kilometer, sende éin gong til bigdatacloud.net for å finne stadnamnet, og lagra. Deretter er det desse avrunda koordinatane som blir brukte til vêret.</li>
    <li><strong>YouTube</strong>-kortet viser videoar frå youtube-nocookie.com i ei eiga ramme. Ramma er skild frå resten av appen, så YouTube kan ikkje lese elevdataa dine. Spelaren blir lasta når appen blir opna, så lenge eit YouTube-kort har ein video, òg om kortet ligg på ei anna side. YouTube ser at videoen blir vist på skoledash.app, og kan setje eigne informasjonskapslar inne i spelaren.</li>
  </ul>
  <p><strong>Delte maskiner:</strong> elevdataa blir liggande i nettlesaren til du slettar dei. Bruker andre den same maskina og nettlesaren, kan dei sjå klasselistene dine. Når du er ferdig på ei slik maskin, vel <strong>💾 Data → 🗑 Slett alle data på denne maskina</strong>. Ta gjerne ein backup først.</p>
  <p>Backupfila du eksporterer, inneheld alt, òg notat og bilete. Ta vare på henne like trygt som på ei klasseliste.</p>

  <h4>💾 Backup: eksportere og importere</h4>
  <p>Sidan data berre bur i nettlesaren din, er det lurt å ta ein <strong>backup</strong>. Trykk <strong>💾 Data</strong> nedst til venstre og vel <strong>📤 Eksporter backup</strong>. Då blir det lasta ned éi fil som inneheld alt: klasselister, alle sider (med elevar, grupper, trekk-backlogar og avgrensingar), innstillingar, notat og bilete.</p>
  <p>For å hente data tilbake, eller flytte alt til ei anna maskin eller ein annan nettlesar, vel <strong>📥 Importer backup</strong> under 💾 Data og peik på fila. Du kan velje mellom <strong>«Erstatt alt»</strong> (full gjenoppretting som skriv over det som ligg der no) og <strong>«Slå saman berre klasselister»</strong> (behald alt ditt, men hent inn dei lagra listene frå fila, fint for å dele klasselister mellom lærarar).</p>
  <p>Når du har laga nye lister eller endra ein backlog sidan førre eksport, dukkar det opp eit lite <strong>«● Ueksporterte endringar»</strong>-merke nedst, rett over linja med snarvegar. Klikk på det for å ta ein ny backup. Merket viser òg kor lenge det er sidan førre backup. Tips: eksporter med jamne mellomrom, så er du trygg om nettlesardata skulle bli tømde.</p>
  <p><strong>Safari ryddar bort data</strong> frå nettsider som ikkje er brukte på sju dagar. Bruker du Safari på Mac eller iPad, er det særleg lurt å ta ein backup før feriar. Skoledash ber nettlesaren om å ta vare på dataa, men Safari bestemmer sjølv.</p>
  <p><strong>Open i fleire faner?</strong> Endrar du noko i éi fane, sluttar dei andre fanene å lagre, så dei ikkje skriv over endringa. Går du tilbake til ei slik fane, blir ho lasta inn på nytt med det nyaste. Står fana framme på skjermen, ser du eit raudt varsel med knappen <strong>↻ Last inn på nytt</strong>.</p>
`;
const BRUKERVEILEDNING_MERKNAD_NN = '<p class="logg-målform">Brukarrettleiinga er førebels berre på bokmål.</p>';
