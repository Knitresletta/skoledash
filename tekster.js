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
  'Ingen kort på denne siden': 'Ingen kort på denne sida',
  'Legg til flere': 'Legg til fleire',
  '+ 🖼 Bilde': '+ 🖼 Bilete',
  'Fjern fra siden': 'Fjern frå sida',
  'Dobbeltklikk for å gi nytt navn': 'Dobbeltklikk for å gi nytt namn',
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
    <strong>Neste</strong>
    <ul>
      <li>⏱ <strong>Stoppeklokke og timeglas:</strong> tel oppover, eller sjå tida som ei skive som krympar</li>
      <li>📋 <strong>Neste punkt i dagsplanen med éin tast,</strong> og punktet som pågår, blir utheva</li>
      <li>🔍 <strong>Fokusmodus:</strong> eitt kort fyller heile skjermen</li>
      <li>🤫 <strong>Arbeidssymbol og trafikklys</strong> i same kort</li>
      <li>🔢 <strong>Teljar, instruksjonskort, nedteljing til ein dato og vekenummer</strong></li>
      <li>📑 <strong>Malar for sider,</strong> og deling av ei side med ein kollega, utan elevnamn</li>
    </ul>
    <strong>Seinare</strong>
    <ul>
      <li>🔊 Lydnivåmålar med rekord og mål for klassen</li>
      <li>👀 «Auge hit»-melding over heile skjermen, med din eigen tekst</li>
      <li>🪑 Klassekart og 🗓 vekeplan</li>
      <li>🎡 Lykkehjul som val i Tilfeldig elev</li>
      <li>🃏 Kortbunke med framside og bakside</li>
      <li>🏆 Poengtavle, 🙂 exit-avstemming og rask handsopprekning</li>
      <li>🎂 Bursdagar i toppfeltet, 🤸 rørslepause og lydeffektar</li>
      <li>✏️ Teiknebrett, 🔳 QR-kode og skjermteppe</li>
    </ul>
  </details>`;

// Brukarrettleiinga på nynorsk. Hald ho i takt med BRUKERVEILEDNING_HTML i app.js:
// endrar du bokmålsutgåva, endre denne òg. Namna på knappar og menyar skal vere dei
// same som i nynorsk-menyane (sjå NYNORSK over).
const BRUKERVEILEDNING_NN = `
  <h4>📦 Flytte frå den gamle adressa</h4>
  <p>Skoledash låg tidlegare på <em>knitresletta.github.io/klasserom-dashboard</em> og bur no på <strong>skoledash.app</strong>. Nettlesaren held data frå kvar adresse åtskilde, så klasselister og sider blir ikkje med av seg sjølv. Opne den gamle adressa, trykk <strong>📤 Eksporter og åpne skoledash.app</strong> i banneret øvst, og vel <strong>📥 Importer data</strong> i 🏫-menyen på den nye sida.</p>
  <h4>☕ Gratis, utan innlogging</h4>
  <p>Skoledash er gratis å bruke. Du treng verken konto eller abonnement, og alt du legg inn, blir liggande i nettlesaren din. Vil du støtte utviklinga, trykkjer du på <strong>☕</strong> heilt øvst til høgre. Då blir ei side for donasjonar opna i ei ny fane. Kva som kjem framover, ser du øvst i <strong>📋 Oppdateringslogg</strong>.</p>
  <h4>Sider: eitt arbeidsbord per klasse</h4>
  <p>Klikk <strong>+</strong> midt i toppfeltet for å leggje til ei ny side, klikk på eit sidenamn for å byte, og <strong>✕</strong> på ei fane for å slette. Tanken er at <strong>kvar side er sin eigen klasse</strong>: lag side 1 for 1A og side 2 for 1B, og byt fritt mellom dei gjennom dagen utan at noko blir blanda.</p>
  <p><strong>Gi ei side nytt namn</strong> ved å dobbeltklikke på fana. Då blir ho til eit lite skrivefelt. Skriv inn namnet (t.d. «1A» eller «Mattegruppe») og trykk <kbd>Enter</kbd> for å lagre. <kbd>Esc</kbd> avbryt utan å endre namnet.</p>
  <p><strong>Per side</strong> (eiga for kvar klasse): elevlista, grupper, dagsplanen, namnet på klassebamsen, og i tillegg oppsettet av korta, notat og bilete.</p>
  <p><strong>Felles for alle sider:</strong> lagra klasselister (📋 Lister, eit felles bibliotek du kan laste inn på kva side som helst) med trekka sine, tema, font, skriftstorleik, målform og timeren.</p>
  <p>Timeren er felles og held fram med å gå sjølv om du byter side. Vil du til dømes vise eit bilete på ei eiga side medan nedteljinga går, går det heilt fint. Timeren tel vidare i bakgrunnen.</p>
  <p>Ei <strong>ny side startar heilt tom</strong>, utan synlege kort. Du hentar sjølv fram akkurat dei korta du vil ha via <strong>⊞ Kort</strong>-menyen, så kvar side blir nøyaktig slik du vil ha ho.</p>
  <p><strong>Side 1 startar med eit lite utval</strong> første gongen du opnar appen: klokke og tilfeldig elev til venstre, dagsplan og notat i midten, og elevlista til høgre. Det er med vilje få kort, så heile sida får plass på skjermen med ein gong. Ordenselevar, klassebamse, terning, timer og grupper ligg klare i <strong>⊞ Kort</strong> og dukkar opp på den faste plassen sin når du kryssar dei av.</p>

  <h4>Kom i gang</h4>
  <p>Trykk <strong>+ Legg til elev</strong> (eller tasten <kbd>a</kbd>) for å leggje inn elevane i klassen din. Du kan ha opptil 35 elevar inne samtidig.</p>
  <p><strong>Rette eit namn:</strong> klikk rett på elevnamnet i lista, så blir det til eit lite skrivefelt. Rett opp og trykk <kbd>Enter</kbd> for å lagre, eller <kbd>Esc</kbd> for å avbryte. Endrar du namnet, blir det oppdatert automatisk overalt der eleven er brukt: i grupper, trekk-backlogar og gruppeavgrensingar. (Vil du heller fjerne eleven, bruk <strong>✕</strong> til høgre.)</p>
  <p><strong>Fjerne ein elev:</strong> trykk <strong>✕</strong> til høgre for namnet (blir vist når du held musa over), eller <strong>👤 Fjern elevar…</strong> for å fjerne fleire. Eleven forsvinn då òg frå gruppene, trekk-backlogane og gruppeavgrensingane.</p>
  <p><strong>Stor forbokstav kjem av seg sjølv:</strong> skriv du «kari nordmann», blir det lagra som «Kari Nordmann». Det same gjeld etter bindestrek («Anne-Marie»), og namn med æ, ø og å blir handsama rett.</p>
  <p>Vil du spare tid neste gong? Lagre elevlista di under <strong>📋 Lister</strong>, og last ho inn att med eitt klikk.</p>
  <p><strong>Starte ein ny klasse:</strong> trykk <strong>🧹 Tøm</strong> nedst i elevkortet, og trykk ein gong til når knappen spør. Elevane, gruppene og oppmøtet forsvinn frå sida, og <strong>+ Legg til elev</strong> blir opna. Lagra lister blir ikkje rørte. Står det <strong>Ikkje lagra. Tøm?</strong> på knappen, er elevane ikkje lagra i ei liste og blir borte.</p>

  <h4>📋 Klasselister</h4>
  <p>Opne <strong>📋 Lister</strong> i elevkortet, eller <strong>📋 Klasselister</strong> i 🏫 Skoledash-menyen. <strong>💾 Lagre nåværende</strong> lagrar elevlista på sida du står på. Klikk på ei liste for å laste ho inn. Lagra lister blir delte av alle sidene dine.</p>
  <p>Kvar liste har fem knappar: <strong>✏️</strong> gir lista nytt namn (<kbd>Enter</kbd> lagrar, <kbd>Esc</kbd> avbryt), <strong>⛔</strong> opnar para som ikkje skal i same gruppe, <strong>📤</strong> lastar ned lista som ei fil, <strong>🔄</strong> byter ut elevane i lista med elevane på sida, og <strong>✕</strong> slettar ho. 🔄 bruker du når du har lagt til eller fjerna elevar og vil at lista skal hugse det. Både 🔄 og ✕ må trykkjast to gonger: første trykket gjer knappen om til <strong>Skrive over?</strong> eller <strong>Slette?</strong>.</p>
  <p><strong>Del ei liste med ein vikar eller kollega:</strong> trykk <strong>📤</strong> og send fila. Mottakaren trykkjer <strong>📥 Importer liste</strong> nedst i Klasselister. Para følgjer med. Fila inneheld elevnamn, så tenk over kven du gir ho til. Har mottakaren ei liste med same namn frå før, blir ho erstatta.</p>
  <p>Står det <em>(denne sida)</em> bak ei liste, er det den lista sida sist vart lasta frå eller lagra som. Lista og sida er elles kvar sin kopi: endrar du elevar på sida, hamnar det i lista først når du lagrar ho på nytt.</p>
  <p><strong>Trekka følgjer lista.</strong> Kven som har vore ordenselev, hatt bamsen og vorte trekt, blir hugsa per liste. Byter du til ei anna liste og tilbake, er trekka der framleis. Bruker to sider same liste, deler dei trekka.</p>

  <h4>✓ Kven er her i dag?</h4>
  <p>Kvar elev i lista har to små runde knappar: <strong>✓</strong> tyder at eleven er her, og <strong>−</strong> tyder at eleven er borte. Trykk på same knapp ein gong til for å fjerne merket.</p>
  <p><strong>Elevar som er borte, er ikkje med i trekka</strong> (tilfeldig elev, ordenselevar og klassebamse) <strong>eller når du deler inn i grupper.</strong> Namnet blir grått og gjennomstreka i lista, og under lista står det kor mange som er borte. Elevar du ikkje har merkt, er med som vanleg, så du treng berre å merke dei som manglar. ✓ er der for deg som vil krysse av heile klassen.</p>
  <p><strong>Har du alt laga grupper,</strong> blir dei ståande som dei er. Ein elev som er borte, blir vist nedtona i gruppa si, og er utelaten neste gong du trykkjer <strong>🎲 Del inn</strong>.</p>
  <p><strong>Kjem ein elev etter at gruppene er laga?</strong> Var eleven merkt borte då du delte inn, står eleven utanfor gruppene. Trykk <strong>✓</strong> (eller − ein gong til for å fjerne borte-merket), så hamnar eleven i den minste gruppa, akkurat som ein ny elev. Gruppeavgrensingane blir følgde.</p>
  <p>Merka gjeld <strong>berre i dag</strong>. Neste dag er alle umerkte att, så ingen blir hengande som borte. Kvar side har sitt eige oppmøte.</p>

  <h4>Trekke elevar</h4>
  <p><strong>🙋 Tilfeldig elev</strong>: trykk <strong>Trekk</strong> for å velje ein tilfeldig elev frå lista. Vanleg trekk unngår å velje same elev to gonger på rad.</p>
  <p><strong>Trekk (bl)</strong> trekkjer utan repetisjon (backlog). Kvar elev blir trekt éin gong før nokon blir trekt på nytt. Talet på trekte står under knappen. Når alle er trekte, trykkjer du <strong>🔄</strong> øvst i kortet (blir vist når du held musa over) for å starte på nytt.</p>
  <p><strong>⭐ Ordenselevar</strong> vel to elevar som har ordenselev-ansvar. Alle får tur før nokon blir gjentekne, og når alle har vore ordenselev, startar ein ny runde av seg sjølv, med ei melding om det. Er det éin elev att, kjem den eleven med i første trekket i den nye runden. To elevar som ikkje skal i same gruppe (⛔), blir heller aldri ordenselevar saman. Vil du berre ha éin ordenselev, trykkjer du <strong>👥</strong> øvst i kortet, så blir han til <strong>👤</strong>. Valet gjeld lista, som trekka.</p>
  <p><strong>Klassebamse</strong> vel kven som får bamsen (eller ein annan gjenstand) med heim. Går òg i rundar av seg sjølv.</p>
  <p><strong>Borte når runden er ferdig?</strong> Ein elev som er merkt borte og ikkje har hatt tur, mistar han ikkje: eleven blir trekt først når eleven er tilbake.</p>
  <p>Vil du nullstille ein backlog for hand? Trykk <strong>⚙️ Nullstill…</strong> nedst til venstre.</p>

  <h4>📝 Redigere backlog for ordenselev og klassebamse</h4>
  <p>Trykk på blyantikonet (📝) i hjørnet av kortet. Du ser alle elevane som brikker, og grå brikker er alt «brukte». Trykk på ein elev for å setje eller fjerne merket. Nyttig om du har mista lokale data og må finne ut att kven som har vore ordenselev eller hatt med bamsen.</p>

  <h4>✏️ Gi klassebamsen eit eige namn</h4>
  <p>Trykk på blyantikonet (✏️) i hjørnet av Klassebamse-kortet, skriv inn det nye namnet og trykk Lagre. Namnet blir hugsa sjølv etter at du lukkar nettlesaren.</p>

  <h4>Grupper</h4>
  <p>Trykk <strong>🎲 Del inn</strong> i Grupper-kortet (eller tasten <kbd>g</kbd>). Skriv inn kor mange grupper du vil ha, og elevane blir fordelte tilfeldig. Gruppefargane blir òg viste i elevlista. Trykk <strong>✕</strong> for å fjerne gruppeinndelinga.</p>
  <p><strong>Ny elev når gruppene er laga:</strong> eleven hamnar i den minste gruppa, og dei andre blir verande der dei er. Er fleire grupper like små, blir ei av dei vald tilfeldig. Gruppeavgrensingar blir følgde: passar eleven ikkje i nokon gruppe utan å bryte ei, står eleven utanfor til du deler inn på nytt.</p>

  <h4>⛔ Gruppeavgrensing</h4>
  <p>Klikk <strong>⛔</strong> ved ei liste i <strong>📋 Klasselister</strong>, eller <strong>⛔ Par</strong> i hjørnet av Grupper-kortet. Vel to elevar i nedtrekkslistene og klikk <strong>Legg til</strong>. Paret hamnar aldri i same gruppe. Du kan leggje til så mange par du vil. Fjern eit par ved å klikke <strong>✕</strong> ved sida av det.</p>
  <p><strong>Para blir lagra i klasselista,</strong> ikkje på sida. Då blir dei med når du deler lista med ein vikar, og dei gjeld på kvar side du lastar lista inn på. Har sida inga lagra liste enno, ber ⛔ deg lagre lista først. Par du laga før dette, verkar som før og blir flytta inn i lista neste gong du lagrar eller lastar ho.</p>

  <h4>🎲 Terning</h4>
  <p>Trykk <strong>🎲 Kast</strong> (eller tasten <kbd>k</kbd>) for å kaste. Terningen trillar eit lite augeblikk før han landar, så klassen rekk å bli spent.</p>
  <p><strong>Vel terningtype</strong> i knappraden: <strong>d4, d6, d8, d10, d12</strong> eller <strong>d20</strong>. Talet seier kor mange sider terningen har. Den vanlege sekssida terningen (d6) har prikkar, slik elevane kjenner han att frå brettspel. Dei andre har tal på flatene, akkurat som ekte terningar av den typen.</p>
  <p><strong>Fleire terningar:</strong> bruk <strong>−</strong> og <strong>+</strong> ved sida av kast-knappen for å kaste opptil 36 om gongen. Terningane blir lagde i rader som er så kvadratiske som mogleg, og kortet tilpassar seg. Då blir <strong>summen</strong> vist under terningane. Nyttig i matte, eller når to terningar skal gi eit tal mellom 2 og 12.</p>
  <p>Byter du type eller tal, blir det kasta på nytt automatisk, så det aldri ligg att eit gammalt resultat som ikkje passar terningen. Siste kast blir hugsa til neste gong du opnar sida.</p>
  <p>Terningoppsettet er <strong>felles for alle sider</strong>, på same måte som timeren.</p>

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

  <h4>Timer</h4>
  <p>Standard er 5 minutt. Trykk <strong>Set tid</strong> (eller <kbd>s</kbd>) for å velje ei anna lengd (1–60 min). Start og stopp med <strong>▶ Start</strong> (eller <kbd>t</kbd>). Det kjem ein lyd når tida er ute.</p>
  <p>Startar du timeren med <kbd>t</kbd> medan timerkortet ikkje er framme, blir kortet henta fram av seg sjølv og lagt øvst, så klassen ser nedteljinga.</p>
  <p>Timeren går rett sjølv om du viser noko i ei anna fane ei stund, og lastar du sida inn på nytt, held han fram der han var.</p>

  <h4>Notat</h4>
  <p>Eit felt for fritekst som veks automatisk med innhaldet. Det blir lagra automatisk i nettlesaren, så du mistar ikkje notatet når sida blir lasta på nytt.</p>
  <p>Du kan ha <strong>fleire notatkort</strong>: opne <strong>⊞ Kort</strong>-menyen og klikk <strong>+ Notat</strong>. Kvart notat kan flyttast uavhengig av dei andre. Slett eit notat med <strong>✕</strong> øvst til høgre i kortet. Notat er per side, så side 1 og side 2 har heilt ulike notatkort.</p>

  <h4>Dagsplan</h4>
  <p>Legg til punkt med <strong>+ Legg til punkt</strong> (eller <kbd>d</kbd>). Fjern einskildpunkt med <strong>✕</strong> ved sida av kvart punkt.</p>
  <p>Kvart punkt har tre stader du kan klikke: <strong>prikken</strong> (●) merkjer punktet som ferdig. Han blir grøn, og teksten får ein strek over (klikk igjen for å angre). <strong>Teksten</strong> opnar redigering: klikk på han, rett opp og trykk <kbd>Enter</kbd> for å lagre eller <kbd>Esc</kbd> for å avbryte. <strong>✕</strong> fjernar punktet.</p>
  <p><strong>Endre rekkjefølgja:</strong> hald inne drahandtaket <strong>⠿</strong> heilt til høgre på punktet (det kjem fram når du held musa over rada), og dra det opp eller ned. Ein blå strek viser kvar punktet hamnar når du slepper.</p>

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
    <li><kbd>k</kbd> Kast terning</li>
    <li><kbd>l</kbd> Vis klasselister</li>
    <li><kbd>b</kbd> Tavlemodus</li>
    <li><kbd>n</kbd> Nullstill…</li>
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
  <p><strong>Delte maskiner:</strong> elevdataa blir liggande i nettlesaren til du slettar dei. Bruker andre den same maskina og nettlesaren, kan dei sjå klasselistene dine. Når du er ferdig på ei slik maskin, vel <strong>Nullstill… → 🗑 Slett alle data på denne maskina</strong>. Ta gjerne ein backup først.</p>
  <p>Backupfila du eksporterer, inneheld alt, òg notat og bilete. Ta vare på henne like trygt som på ei klasseliste.</p>

  <h4>📤 Eksportere og 📥 importere data</h4>
  <p>Sidan data berre bur i nettlesaren din, er det lurt å ta ein <strong>backup</strong>. Opne <strong>Skoledash-menyen</strong> og vel <strong>📤 Eksporter data</strong>. Då blir det lasta ned éi fil som inneheld alt: klasselister, alle sider (med elevar, grupper, trekk-backlogar og avgrensingar), innstillingar, notat og bilete.</p>
  <p>For å hente data tilbake, eller flytte alt til ei anna maskin eller ein annan nettlesar, vel <strong>📥 Importer data</strong> og peik på fila. Du kan velje mellom <strong>«Erstatt alt»</strong> (full gjenoppretting som skriv over det som ligg der no) og <strong>«Slå saman berre klasselister»</strong> (behald alt ditt, men hent inn dei lagra listene frå fila, fint for å dele klasselister mellom lærarar).</p>
  <p>Når du har laga nye lister eller endra ein backlog sidan førre eksport, dukkar det opp eit lite <strong>«● Ueksporterte endringar»</strong>-merke nedst, rett over linja med snarvegar. Klikk på det for å ta ein ny backup. Merket viser òg kor lenge det er sidan førre backup. Tips: eksporter med jamne mellomrom, så er du trygg om nettlesardata skulle bli tømde.</p>
  <p><strong>Safari ryddar bort data</strong> frå nettsider som ikkje er brukte på sju dagar. Bruker du Safari på Mac eller iPad, er det særleg lurt å ta ein backup før feriar. Skoledash ber nettlesaren om å ta vare på dataa, men Safari bestemmer sjølv.</p>
  <p><strong>Open i fleire faner?</strong> Endrar du noko i éi fane, sluttar dei andre fanene å lagre, så dei ikkje skriv over endringa. Går du tilbake til ei slik fane, blir ho lasta inn på nytt med det nyaste. Står fana framme på skjermen, ser du eit raudt varsel med knappen <strong>↻ Last inn på nytt</strong>.</p>
`;
const BRUKERVEILEDNING_MERKNAD_NN = '<p class="logg-målform">Brukarrettleiinga er førebels berre på bokmål.</p>';
