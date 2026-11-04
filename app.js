'use strict';

// ===================== Constants =====================
// Nøkkelen all tilstand lagres under i localStorage. Endres den, «mister» appen
// gammel lagret data (den finner den ikke igjen) — så la den stå.
// NB: nøkkelen heter fortsatt «klasserom» selv om appen nå heter Skoledash. Endres den,
// finner ikke appen igjen dataene til eksisterende brukere.
const STORAGE_KEY = 'klasserom_state_v1'; // samme nøkkel står i tema-tidlig.js
// Reservekopi av lagret tilstand som ikke kunne leses, så den ikke går tapt når appen
// starter blank og lagrer på nytt.
const RESERVE_KEY = 'klasserom_state_v1_reserve';
// Kopi av lagringen slik den var før elevene fikk id-er (v2.37). Skrives én gang, første
// gang gamle data gjøres om, så de kan hentes tilbake hvis migreringen bommer. Slettes
// av «Slett alle data» sammen med resten, fordi den inneholder elevnavn.
const FØR_ELEV_ID_KEY = 'klasserom_state_v1_for_elev_id';
// Settes av slettAlleData(), så ingen lagring skriver dataene tilbake før siden lastes på nytt.
let sletterAlt = false;
// Versjonen av lagringsformatet (v2.40). Øk den når eldre kode ville lest de nye
// dataene feil, slik v2.36 ville gjort med elevobjektene fra v2.37. Finner appen data
// med høyere versjon enn sin egen, lagrer den ingenting (se lagringSperre), så en
// tilbakerulling ikke skriver over nyere data.
const LAGRINGSVERSJON = 2; // 2: timere som egne kort per side (v2.48)
// Når appen ikke skal lagre: null, 'annen-fane' (en annen fane har lagret noe nyere,
// se «Flere faner») eller 'nyere-versjon' (dataene er fra en nyere versjon av appen).
let lagringSperre = null;
// Teksten denne fanen sist leste fra eller skrev til lagringen. saveState sammenligner
// med det som ligger der nå, før den skriver: har noen andre skrevet i mellomtiden (en
// annen fane, en import), lagrer den ikke over. Se saveState.
let sistLagretTekst = null;
// Timerens løpende tilstand per fane (sessionStorage), så en omlasting ikke stopper en
// nedtelling som går. Se «Timer».
const TIMER_ØKT_KEY = 'skoledash_timer_okt';

// Hvor ☕-knappen og velkomstmeldingen sender folk som vil donere. Når Vipps er
// godkjent, blir ☕ en liten meny med Vipps, Ko-fi og lenke til vilkar.html.
const DONASJON_URL = 'https://ko-fi.com/knitresletta';

// Egen nøkkel (ikke i state) så velkomsten gjelder per nettleser, ikke per side,
// og ikke blir med i eksport/import av data.
const VELKOMMEN_KEY = 'skoledash_velkommen_sett';

// Fargepaletten gruppene tildeles (bakgrunn + tekst), brukt både på gruppe-kort og
// som prikk/farge i elevlista. Det er flere grupper enn farger? Da gjentas paletten.
// Fargetonene til gruppene (ca. Tailwind 500). Selve fargene som vises, regnes ut i CSS
// (.gruppe-farget i style.css): tonen blandes med temaets kortfarge til bakgrunn og med
// temaets tekstfarge til tekst. Da passer gruppene til både lyse og mørke temaer, og
// teksten har alltid kontrast. Rekkefølgen er valgt så nabogrupper ikke ligner.
const GRUPPE_FARGER = [
  '#ec4899', // rosa
  '#8b5cf6', // fiolett
  '#10b981', // grønn
  '#f59e0b', // rav
  '#3b82f6', // blå
  '#f43f5e', // rød-rosa
  '#14b8a6', // turkis
  '#a855f7', // lilla
  '#eab308', // gul
  '#0ea5e9', // himmelblå
];

// Visningsnavn for enkeltinstans-widgetene (de som har av/på-avkrysning i ⊞ Widgets).
// Flerinstans-widgetene (notat/bilde) står IKKE her — de håndteres for seg.
// Navnet står uten emoji: ikonet ligger i WIDGET_IKON og får en egen kolonne i menyen,
// så teksten begynner på samme sted uansett hvor bred emojien er.
const WIDGET_NAVN = {
  'card-elever':     'Elever',
  'card-grupper':    'Grupper',
  'card-tilfeldig':  'Tilfeldig elev',
  'card-ordenselev': 'Ordenselever',
  'card-ulv':        'Klassebamse',
  'card-dagsplan':   'Dagsplan',
  'card-klokke':     'Klokke',
  'card-terning':    'Terning',
  'card-arbeid':     'Arbeidssymboler',
  'card-trafikklys': 'Trafikklys',
};
// ⏱️ har variasjonstegnet U+FE0F med vilje: uten det tegner flere nettlesere symbolet
// som smal tekst i stedet for som emoji.
const WIDGET_IKON = {
  'card-elever':     '👥',
  'card-grupper':    '🧩',
  'card-tilfeldig':  '🙋',
  'card-ordenselev': '⭐',
  'card-ulv':        '🧸',
  'card-dagsplan':   '📋',
  'card-klokke':     '🕐',
  'card-terning':    '🎲',
  'card-arbeid':     '🤫',
  'card-trafikklys': '🚦',
};

// Fri flate: magneter, minstestørrelser og standardstørrelser. Står her oppe fordi
// loadState() (via migrerTilFlate) bruker dem før resten av fila er kjørt, og en
// const som ikke er definert ennå kaster feil. Selve logikken ligger under
// «Fri flate (layout)».
const MAGNET_PX  = 8;   // så nær må en kant komme før den klikker seg fast
const AVSTAND_PX = 12;  // luft mellom kort som magnetene legger «ved siden av»
const DRA_TERSKEL_PX = 4; // så langt må pekeren flytte seg før et drag starter
const LUFT_PST = 1;     // luft rundt kort som plasseres automatisk, i prosent

// Minstestørrelse i piksler per widget-type, så ingen krymper klokka til et frimerke.
const MIN_STØRRELSE = {
  klokke: [160, 100], tilfeldig: [200, 150], ordenselev: [200, 150], ulv: [200, 150],
  terning: [200, 160], timer: [200, 150], dagsplan: [220, 160], elever: [200, 180],
  grupper: [220, 160], notat: [180, 120], bilde: [160, 120], youtube: [220, 170],
  arbeid: [200, 150], trafikklys: [100, 180],
};
// Standardstørrelse i prosent (bredde, høyde) når et kort plasseres automatisk.
const STANDARD_STØRRELSE = {
  klokke: [26, 30], tilfeldig: [26, 32], ordenselev: [26, 32], ulv: [26, 30],
  terning: [26, 34], timer: [26, 32], dagsplan: [34, 50], elever: [26, 70],
  grupper: [34, 45], notat: [30, 35], bilde: [28, 38], youtube: [34, 45],
  arbeid: [26, 36], trafikklys: [12, 40],
};
// Hvor stor andel av en gammel kolonne hvert kort fikk ved migreringen: omtrent hvor
// høyt kortet er naturlig, i hundre piksler (klokka med urskive og tall er ca. 320).
// Voksende kort (elever, dagsplan, grupper, notat) tilpasser seg innholdet etterpå
// uansett, så for dem er dette bare et utgangspunkt.
const HØYDEVEKT = {
  klokke: 3.2, tilfeldig: 1.6, ordenselev: 1.6, ulv: 1.6, terning: 2.6, timer: 2.1,
  dagsplan: 2.5, elever: 3.5, grupper: 1.8, notat: 1.8, bilde: 2, youtube: 2.5,
  arbeid: 2.2, trafikklys: 2.6,
};

// Guidekortene nye brukere møter på et tomt bord, ett ved hver meny. De er vanlige
// kort på flata, men står ikke i WIDGET_NAVN: de skal ikke i ⊞ Widgets-menyen, og
// ✕ fjerner dem for godt (fjernGuide).
const GUIDE_KORT = ['card-guide-meny', 'card-guide-widgets', 'card-guide-taster'];

// Widgets med fast innhold: når kortet blir større enn innholdet trenger, skaleres
// innholdet opp (se «Skalering med kortet»). Kortstørrelsen erstatter prosent-
// innstillingen under Skriftstørrelse → Enkelt widget for disse. Widgets med
// voksende innhold (elever, dagsplan, grupper, notat) står ikke her: der betyr
// større kort plass til flere linjer.
const SKALER_MED_KORT = ['card-klokke', 'card-tilfeldig',
  'card-ordenselev', 'card-ulv', 'card-terning', 'card-arbeid',
  'card-trafikklys'];

// Kort som skalerer med størrelsen, også kopier som «card-timer-3» (se kortType).
function erSkalerKort(id) {
  return SKALER_MED_KORT.includes(id) || ['timer', 'tilfeldig'].includes(kortType(id));
}

// Arbeidssymbolene i Arbeidssymboler-kortet (v2.47). Læreren kan legge til egne
// (state.arbeid_egne), som deles av alle sider. Står her oppe fordi loadState() og
// normaliserState() bruker lista.
const ARBEID_SYMBOLER = [
  { id: 'stille', emoji: '🤫', tekst: 'Stille arbeid' },
  { id: 'hviske', emoji: '🗣️', tekst: 'Hviskestemme' },
  { id: 'par',    emoji: '👫', tekst: 'Pararbeid' },
  { id: 'gruppe', emoji: '👥', tekst: 'Gruppearbeid' },
  { id: 'hand',   emoji: '🙋', tekst: 'Rekk opp hånda' },
  { id: 'se',     emoji: '👀', tekst: 'Se hit' },
];
const TRAFIKKLYS = ['rød', 'gul', 'grønn'];

// Visningene klokka går gjennom når man klikker på overskrifta, i denne rekkefølgen.
// Står her oppe fordi loadState() sjekker lagret verdi mot lista.
const KLOKKE_VISNINGER = ['begge', 'analog', 'digital'];
const KLOKKE_VISNING_NAVN = { begge: 'Begge', analog: 'Analog', digital: 'Digital' };

// Widgets med voksende innhold: høyden følger innholdet. Høyden læreren drar kortet
// til, blir en minstehøyde (w.hMin), ikke en fast høyde. Se «Høyde som følger
// innholdet». Står her oppe fordi normaliserState() bruker den.
const FØLGER_INNHOLD = ['elever', 'dagsplan', 'grupper', 'notat'];

// Kort som viser et medium (bilde, YouTube): høyden er alltid det mediet trenger ved
// kortets bredde, så proporsjonene holder. Læreren endrer størrelsen med bredden;
// kantene oppe og nede finnes ikke for disse (se CSS og startOperasjon).
const MEDIA_KORT = ['bilde', 'youtube'];

// Tekststørrelsene A− og A+ går gjennom i et notat, som faktor av standardstørrelsen.
// Står her oppe fordi normaliserState() sjekker lagret verdi mot lista.
const NOTAT_STØRRELSER = [0.75, 0.9, 1, 1.25, 1.5, 2, 2.5, 3, 4];

// Terningtypene widgeten tilbyr, og taket for hvor mange som kan kastes samtidig.
// Taket er 36 (et 6×6-kvadrat): kortet skalerer, så flere får plass, men et tak må
// finnes fordi lagring og import sjekkes mot det. Uten det ville en fil med
// «antall: 10000» tegnet ti tusen SVG-er.
// Bare d6 har ekte prikkeflater — d4, d8, d10, d12 og d20 har tall på flatene også i
// virkeligheten, og tegnes derfor med sin egen silhuett og tallet i midten.
const TERNING_TYPER  = [4, 6, 8, 10, 12, 20];
const MAKS_TERNINGER = 36;

// Silhuetten til hver terningtype som SVG-polygon i et 100×100-rutenett. d6 står ikke
// her — den tegnes som et avrundet kvadrat med <rect>, siden polygon ikke gir runde
// hjørner. d20 får i tillegg en indre trekant, slik ekte tjuekantede terninger ser ut.
const TERNING_FORMER = {
  4:  '50,8 93,85 7,85',
  8:  '50,5 91,50 50,95 9,50',
  10: '50,4 89,36 50,96 11,36',
  12: '50,5 95,39 78,93 22,93 5,39',
  20: '50,4 90,27 90,73 50,96 10,73 10,27',
};

// Prikkemønsteret på en d6, som [kolonne, rad] i et 3×3-rutenett (0 = venstre/topp,
// 2 = høyre/bunn). Én prikk står i midten, to i motsatte hjørner, og så videre.
const TERNING_PRIKKER = {
  1: [[1, 1]],
  2: [[0, 0], [2, 2]],
  3: [[0, 0], [1, 1], [2, 2]],
  4: [[0, 0], [2, 0], [0, 2], [2, 2]],
  5: [[0, 0], [2, 0], [1, 1], [0, 2], [2, 2]],
  6: [[0, 0], [2, 0], [0, 1], [2, 1], [0, 2], [2, 2]],
};

// Standardsted for værvarselet. Brukeren kan bytte sted i klokke-kortet; valget
// lagres i state.vær_sted og deles av headeren og kortet. Koordinatene holdes på
// maks 4 desimaler — se rundKoordinat().
// `kilde` forteller hvor stedet kom fra: 'standard' (nødløsning), 'posisjon' (hentet
// fra nettleseren) eller 'valgt' (brukeren søkte det opp selv). Bare 'valgt' er
// ukrenkelig — de to andre lar seg overskrive av et nytt posisjonsoppslag.
const STANDARD_VÆR_STED = { navn: 'Eidsvoll', lat: 60.33, lon: 11.22, kilde: 'standard' };

// MERK: ikke sett en egen User-Agent på met.no-kallet, selv om API-dokumentasjonen
// ber om det. Den regelen gjelder programmer som snakker med API-et direkte — en
// nettleser sender uansett sin egen User-Agent, og den godtar met.no.
//
// Setter vi headeren selv, blir kallet «ikke-enkelt» etter CORS-reglene, og nettleseren
// må først sende en preflight (OPTIONS). Den svarer met.no på uten CORS-hoder i det
// hele tatt, så hele kallet blokkeres. Chrome skjuler problemet ved å droppe headeren
// stille; Firefox og Zen sender den — og der forsvant værvarselet helt. Se v2.19.

// Pollenartene vi henter fra Open-Meteo (CAMS-varselet for Europa), med norske navn
// og terskler i korn/m³ på formen [moderat, høyt]. Artene har ulik skala — burot
// merkes ved langt lavere konsentrasjon enn bjørk, som kan ligge i hundretall i mai.
const POLLEN_ARTER = [
  { felt: 'alder_pollen',   navn: 'Or',    grenser: [10, 50] },
  { felt: 'birch_pollen',   navn: 'Bjørk', grenser: [15, 90] },
  { felt: 'grass_pollen',   navn: 'Gress', grenser: [10, 50] },
  { felt: 'mugwort_pollen', navn: 'Burot', grenser: [5,  25] },
];
// Indeks 0 brukes ikke i teksten (da skriver vi «Lite pollen» i stedet).
const POLLEN_NIVÅER = ['ingen', 'lavt', 'moderat', 'høyt'];

// Oversetter en yr.no-symbolkode (f.eks. "clearsky_day") til en passende emoji.
// Sjekkene går fra mest til minst spesifikk; ukjente koder faller tilbake til ☁️.
function yrEmoji(kode) {
  if (kode.includes('clearsky'))                         return '☀️';
  if (kode.includes('fair'))                             return '🌤️';
  if (kode.includes('partlycloudy'))                     return '⛅';
  if (kode.includes('fog'))                              return '🌫️';
  if (kode.includes('thunder'))                          return '⛈️';
  if (kode.includes('snow'))                             return '❄️';
  if (kode.includes('sleet'))                            return '🌨️';
  if (kode.includes('rain') || kode.includes('drizzle')) return '🌧️';
  return '☁️';
}

// Norske navn for datoformatering. Rekkefølgen matcher Date: getDay() 0=søndag,
// getMonth() 0=januar.
const UKEDAGER = ['søndag', 'mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag', 'lørdag'];
const MÅNEDER  = ['januar', 'februar', 'mars', 'april', 'mai', 'juni',
                  'juli', 'august', 'september', 'oktober', 'november', 'desember'];

// ===================== State =====================
// Bygger en helt fersk tilstand for en førstegangsbruker (ingen lagret data).
// Globale felt (deles av alle sider) ligger her; per-side-felt ligger i nySide().
function defaultState() {
  return {
    // Globalt scope — deles av alle sider
    lister:              {},
    // «Hold fra hverandre»-par per lagret liste (v2.38): listenavn → [[id, id], ...].
    // Står ved siden av lister, ikke inni, så lagringsformatet for listene er uendret.
    liste_begrensninger: {},
    // Trekkene per lagret liste (v2.39): listenavn → backlogs og hvem som er trukket
    // (se «Trekk per liste»). Delt av alle sider som bruker lista.
    liste_trekk:         {},
    // Rekkefølge og grupper i Lister-menyen (v2.42): listenavn og { gruppe, lister, åpen }.
    // Egen liste fordi rekkefølgen i et objekt ikke kan styres (navn som «8» havner
    // alltid først). Se «Oppsett i Lister-menyen».
    liste_oppsett:       [],
    // Timerne (v2.48): «timer-N» → { varighet, modus, visning }. Kortene står i sidenes
    // oppsett. timer_varighet/_modus/_visning under er den gamle felles timeren; de
    // brukes bare når gamle data gjøres om (se migrerFellesTimer).
    timere:              {},
    timer_teller:        0,
    // Ekstra Tilfeldig elev-kort (v2.48): «tilfeldig-N» → {}. Backlogene ligger i trekkene.
    tilfeldige:          {},
    tilfeldig_teller:    0,
    timer_varighet:      300,
    arbeid_egne:         [],        // lærerens egne arbeidssymboler { id, emoji, tekst }, v2.47
    timer_modus:         'ned',     // 'ned' (nedtelling) eller 'opp' (stoppeklokke), v2.43
    timer_visning:       'bjelke',  // 'bjelke' eller 'skive' (timeglass), v2.43
    tema: 'lyst',
    font: 'system',
    språk: 'nb',          // 'nb' (bokmål) eller 'nn' (nynorsk). Nynorsk-tekstene ligger i tekster.js
    skrift_størrelse: 'normal',
    widget_størrelser: {},
    vær_sted:            { ...STANDARD_VÆR_STED }, // sted for vær + pollen (delt av alle sider)
    terning_type:        6,   // hvilken terning som er valgt (antall sider)
    terning_antall:      1,   // hvor mange som kastes om gangen
    terning_kast:        [],
    klokke_visning:      'begge', // 'begge', 'analog' eller 'digital' (klikk på klokkeoverskrifta)  // siste kast, slik at kortet ikke står tomt etter omlasting
    notater:      {},                // ingen notatkort på et tomt bord; legges til via «+»
    bilder:       {},                // ingen bildekort som standard; legges til via «+». Selve bildene bor i IndexedDB
    youtube:      {},                // ingen YouTube-kort som standard; legges til via «+»
    notat_teller: 0,
    bilde_teller: 0,
    youtube_teller: 0,
    eksport_signatur: null, // signatur av data ved siste eksport (for endrings-varsel)
    eksport_tid: null,      // tidspunkt (ms) for siste eksport, vises i varselet
    lagringsversjon: LAGRINGSVERSJON,
    aktiv_side: 0,
    sider: [ førsteSide() ],
  };
}

// Første side for en helt ny bruker: et tomt bord med tre guidekort, ett inntil hver
// meny (Skoledash-menyen, ⊞ Widgets og hurtigtastene). Alle widgets er skjult og
// hentes fram fra ⊞ Widgets, der de havner på plassen sin fra nySide().
function førsteSide() {
  const side = nySide('Side 1');
  side.widget_layout = side.widget_layout.filter(w => w.id !== 'card-notat-1');
  side.widget_hidden = side.widget_layout.map(w => w.id);
  const z = side.widget_layout.length;
  side.widget_layout.push(
    { id: 'card-guide-meny',    col: 1, x: 0,  y: 0,  b: 26, h: 46, z: z + 1 },
    { id: 'card-guide-widgets', col: 3, x: 74, y: 0,  b: 26, h: 46, z: z + 2 },
    { id: 'card-guide-taster',  col: 3, x: 70, y: 54, b: 30, h: 46, z: z + 3 },
  );
  return side;
}

// Et nytt, tomt side-objekt («klasse-arbeidsbord»). Inneholder alt som er
// per-side scope: roster, grupper, trekk + backlogs, dagsplan, klassebamse-navn,
// gruppebegrensninger, pluss widget-oppsettet på flata.
function nySide(navn) {
  return {
    navn,
    // kolonner/kol_bredder/col brukes ikke lenger (fri flate fra v2.35), men står
    // igjen så en eldre versjon fortsatt finner et oppsett ved tilbakerulling.
    kolonner: 3,
    kol_bredder: [3, 4, 3],
    elever:              [],
    grupper:             null,
    dagsplan:            [],
    tilfeldig_backlog:   [],
    tilfeldig_valgt:     null,
    ordenselev_backlog:  [],
    ordenselev_valgte:   [],
    // Elever som var borte da en runde tok slutt, uten å ha hatt tur. De trekkes
    // først når de er tilbake (se trekkRunde).
    ordenselev_skyldig:  [],
    ordenselev_antall:   2,      // 1 eller 2 per trekk; følger lista via trekk(s)
    ulv_backlog:         [],
    ulv_valgt:           null,
    ulv_skyldig:         [],
    ulv_navn:            'Klassebamse',
    // Egne navn på kortene på denne siden (v2.48): kortId → navn. Klassebamse bruker
    // ulv_navn, som også står i meldingene.
    kort_navn:           {},
    arbeid_symbol:       null,   // id fra ARBEID_SYMBOLER eller state.arbeid_egne (v2.47)
    arbeid_lys:          null,   // 'rød' | 'gul' | 'grønn' | null
    // Par fra før v2.38, da parene hørte til siden. Nye par lagres i lista (se
    // «Gruppebegrensning»). Gamle par virker til de flyttes inn i en liste.
    gruppe_begrensninger: [],
    // Navnet på lista siden sist ble lastet fra eller lagret som, eller null.
    liste:               null,
    // Dagens oppmøte (v2.36): { dato: 'ÅÅÅÅ-MM-DD', status: { navn: 'her' | 'borte' } }.
    // null eller en annen dato betyr at ingen er markert i dag. Se «Oppmøte».
    oppmøte:             null,
    // Posisjon og størrelse i prosent av flata (se «Fri flate»). Alle enkeltinstans-
    // widgets skal stå oppført, også de som er skjult fra start: applyLayout() tvinger
    // inn manglende, og widget_hidden styrer hva som vises. Et kort som slås på, får
    // plassen sin her hvis den er ledig, ellers første ledige flate.
    widget_layout: [
      // Klokka trenger ca. 320 px for både urskive og digital tid. 54 % holder fra
      // en 1280×720-skjerm og oppover.
      { id: 'card-klokke',     col: 1, x: 0,  y: 46, b: 20, h: 54,  z: 1 },
      { id: 'card-tilfeldig',  col: 1, x: 0,  y: 0,  b: 27, h: 30,  z: 2 },
      { id: 'card-ordenselev', col: 1, x: 0,  y: 64, b: 27, h: 32,  z: 3 },
      { id: 'card-ulv',        col: 1, x: 0,  y: 64, b: 27, h: 30,  z: 4 },
      { id: 'card-terning',    col: 1, x: 0,  y: 64, b: 27, h: 34,  z: 5 },
      { id: 'card-arbeid',     col: 2, x: 28, y: 0,  b: 26, h: 36,  z: 11 },
      { id: 'card-trafikklys', col: 2, x: 56, y: 0,  b: 12, h: 40,  z: 12 },
      { id: 'card-dagsplan',   col: 2, x: 28, y: 0,  b: 43, h: 58,  z: 6 },
      { id: 'card-notat-1',    col: 2, x: 28, y: 60, b: 43, h: 40,  z: 7 },
      { id: 'card-elever',     col: 3, x: 72, y: 0,  b: 28, h: 100, z: 9 },
      { id: 'card-grupper',    col: 3, x: 72, y: 0,  b: 28, h: 45,  z: 10 },
    ],
    // Gjelder bare hvis noe kaller nySide() uten å skjule alt selv. Nye sider
    // (leggTilSide) og nye brukere (førsteSide) starter med alt skjult.
    widget_hidden: [
      'card-ordenselev', 'card-ulv', 'card-terning', 'card-grupper',
      'card-arbeid', 'card-trafikklys',
    ],
  };
}

// Standard kolonnebredder (flex-vekter) for n kolonner.
// 3 kolonner beholder den klassiske 30/40/30-fordelingen; ellers like brede.
function standardBredder(n) {
  if (n === 3) return [3, 4, 3];
  return Array.from({ length: n }, () => 1);
}

// Den ene, sentrale tilstanden hele appen leser og skriver. Lastes fra localStorage
// (eller defaults) ved oppstart, og persisteres med saveState() etter hver endring.
// Størrelse per widget er et avvik i prosent fra den globale størrelsen: 0 = som alle,
// -20 = 20 % mindre, +30 = 30 % større. Grensene hindrer at et kort forsvinner ut av
// skjermen eller blir uleselig smått. Ligger før loadState(), som bruker dem ved
// omgjøring av gamle verdier: const-er lenger ned finnes ikke ennå når den kjører.
const WIDGET_PROSENT_MIN = -50;
const WIDGET_PROSENT_MAKS = 100;

// Gjør vilkårlig input (tekst fra feltet, gamle lagrede verdier) om til et helt tall
// innenfor grensene. Tomt felt, «-» midt i skrivingen og annet ugyldig blir 0.
function klemWidgetProsent(verdi) {
  const tall = Math.round(Number(verdi));
  if (!Number.isFinite(tall)) return 0;
  return Math.min(WIDGET_PROSENT_MAKS, Math.max(WIDGET_PROSENT_MIN, tall));
}

// ===================== Normalisering av lagret og importert data =====================
// All tilstand passerer loadState() før appen bruker den, også importerte backupfiler
// («Erstatt alt» skriver fila til localStorage og laster siden på nytt). Her sørger vi
// for at hvert felt har riktig type og ligger innenfor grensene, så en skadet eller
// manipulert fil verken kan krasje appen eller få kode inn i HTML-en. Feil verdier
// byttes ut med standardverdier; gyldige data røres ikke.
//
// Ligger før loadState() med vilje: konstanter lenger ned finnes ikke ennå når den kjører.

// Nøkler som kan endre prototypen til et objekt. Fjernes allerede i JSON.parse.
const FARLIGE_NØKLER = new Set(['__proto__', 'constructor', 'prototype']);
function trygtJsonParse(tekst) {
  return JSON.parse(tekst, (nøkkel, verdi) => (FARLIGE_NØKLER.has(nøkkel) ? undefined : verdi));
}

// Gyldige ID-er for flerinstans-widgets. ID-ene havner i element-ID-er og onclick, så
// alt annet enn «type-tall» forkastes.
const INSTANS_ID = /^(notat|bilde|youtube|timer|tilfeldig)-\d{1,6}$/;
const YOUTUBE_VIDEO_ID = /^[\w-]{11}$/;
const SKRIFT_NØKLER = ['liten', 'normal', 'stor', 'xl']; // speiler STØRRELSER lenger ned

const erObjekt = v => v !== null && typeof v === 'object' && !Array.isArray(v);
const tekstEllerNull = (v, maks) => (typeof v === 'string' ? v.slice(0, maks) : null);
const tekstliste = (v, maks = 200) =>
  Array.isArray(v) ? v.filter(x => typeof x === 'string').map(x => x.slice(0, maks)) : [];
const heltall = (v, min, maks, standard) =>
  Number.isInteger(v) ? Math.min(maks, Math.max(min, v)) : standard;

// --- Elever (v2.37) ---
// En elev er { id, navn }. Alt annet på siden (grupper, backlogs, trekk, «hold fra
// hverandre»-par og oppmøte) peker på id-en, ikke navnet. Da er et navnebytte bare å
// endre ett felt, og eleven kan senere få flere opplysninger (bursdag, pult) uten at
// noe annet må endres. Før v2.37 var en elev bare et navn, og navnet var nøkkelen
// overalt: normaliserElever() og elevOppslag() gjør slike data om.
// Id-en havner i data-attributter og lagring, derfor det strenge mønsteret.
const ELEV_ID = /^e[a-z0-9]{6,12}$/;
// Settes når gamle navnelister er gjort om, så loadState() tar en reservekopi og
// init() lagrer det nye formatet med en gang (ellers fikk elevene nye id-er ved hver
// lasting til noe annet ble lagret).
let elevFormatMigrert = false;

// Ny, unik elev-id innenfor `brukt` (et Set), som også får den nye id-en lagt til.
function nyElevId(brukt) {
  let id;
  do {
    id = 'e' + Math.random().toString(36).slice(2, 10).padEnd(8, '0');
  } while (brukt.has(id));
  brukt.add(id);
  return id;
}

// ===================== Trekk per liste =====================
// Backlogene og hvem som er trukket (tilfeldig, ordenselev, klassebamse) hører til
// klassen, ikke til siden. En side som er koblet til en lagret liste (s.liste), bruker
// listas trekk i state.liste_trekk, og alle sider med samme liste deler dem. Bytter
// siden til en annen liste og tilbake, er trekkene der fortsatt. En side uten liste
// har trekkene på seg selv, slik alle sider hadde før v2.39.
// Bruk alltid trekk(s) for å lese og skrive dem, aldri s.tilfeldig_backlog direkte.
const TREKK_LISTER = ['tilfeldig_backlog', 'ordenselev_backlog', 'ordenselev_valgte',
  'ordenselev_skyldig', 'ulv_backlog', 'ulv_skyldig'];
const TREKK_ENKLE  = ['tilfeldig_valgt', 'ulv_valgt'];

// ordenselev_antall: 2 som standard, 1 for klasser med bare én ordenselev.
// tilfeldig_flere: backlog og trukket for hver ekstra Tilfeldig elev-kopi på siden
// (v2.48), «card-tilfeldig-N» → { backlog, valgt }. Det første kortet bruker
// tilfeldig_backlog/tilfeldig_valgt som før.
function tomtTrekk() {
  return { ...Object.fromEntries([...TREKK_LISTER.map(f => [f, []]), ...TREKK_ENKLE.map(f => [f, null])]),
    ordenselev_antall: 2, tilfeldig_flere: {} };
}

// Hvor mange av id-ene som står på siden. Tellerne i trekkekortene bruker denne, så en
// elev som er tatt ut av siden, men fortsatt står i lista, ikke telles med.
function påSiden(s, ider) {
  const her = new Set(s.elever.map(e => e.id));
  return ider.filter(id => her.has(id)).length;
}

// Trekkene som gjelder for siden: listas hvis siden er koblet til en liste, ellers
// sidens egne.
function trekk(s = aktivSide()) {
  const liste = sidensListe(s);
  return liste ? (state.liste_trekk[liste] ??= tomtTrekk()) : s;
}

// Kopi av trekkene (fra en liste eller en side) med bare elevene `behold` godtar, og
// id-ene byttet via `bytt`. Brukes når trekkene flyttes mellom side og liste.
function kopierTrekk(fra, behold = () => true, bytt = id => id) {
  const ut = tomtTrekk();
  for (const f of TREKK_LISTER) ut[f] = [...new Set((fra[f] ?? []).map(bytt))].filter(behold);
  for (const f of TREKK_ENKLE) ut[f] = fra[f] && behold(bytt(fra[f])) ? bytt(fra[f]) : null;
  ut.ordenselev_antall = fra.ordenselev_antall === 1 ? 1 : 2;
  for (const [kort, x] of Object.entries(fra.tilfeldig_flere ?? {})) {
    const valgt = x?.valgt && behold(bytt(x.valgt)) ? bytt(x.valgt) : null;
    ut.tilfeldig_flere[kort] = { backlog: [...new Set((x?.backlog ?? []).map(bytt))].filter(behold), valgt };
  }
  return ut;
}

// Setter sidens egne trekkfelt til tomme. Brukes når trekkene flyttes inn i en liste.
function tømSidensTrekk(s) {
  Object.assign(s, tomtTrekk());
}

// Gyldige trekk fra lagringen eller en importert fil: bare id-er med riktig form.
function normaliserTrekk(r) {
  const id = v => (typeof v === 'string' && ELEV_ID.test(v) ? v : null);
  const ut = tomtTrekk();
  for (const f of TREKK_LISTER) ut[f] = [...new Set((Array.isArray(r[f]) ? r[f] : []).map(id).filter(Boolean))];
  ut.ordenselev_valgte = ut.ordenselev_valgte.slice(0, 2);
  for (const f of TREKK_ENKLE) ut[f] = id(r[f]);
  ut.ordenselev_antall = r.ordenselev_antall === 1 ? 1 : 2;
  for (const [kort, x] of Object.entries(erObjekt(r.tilfeldig_flere) ? r.tilfeldig_flere : {})) {
    if (!/^card-tilfeldig-\d{1,6}$/.test(kort) || !erObjekt(x)) continue;
    ut.tilfeldig_flere[kort] = { backlog: [...new Set((Array.isArray(x.backlog) ? x.backlog : []).map(id).filter(Boolean))], valgt: id(x.valgt) };
  }
  return ut;
}

// Gjør en lagret elevliste om til gyldige { id, navn }-objekter. Tåler både gammelt
// format (bare navn) og nytt. Tomme navn forkastes, og like navn (uten hensyn til
// store og små bokstaver) slås sammen, fordi appen aldri tillater to like navn i samme
// klasse. Bare id og navn tas med, så ukjente felt fra en importert fil ikke slipper inn.
function normaliserElever(liste) {
  const ut = [];
  const ider = new Set();
  const navnSett = new Set();
  for (const e of Array.isArray(liste) ? liste : []) {
    const rått = typeof e === 'string' ? e : (erObjekt(e) ? e.navn : null);
    if (typeof rått !== 'string' || !rått.trim()) continue;
    const navn = rått.slice(0, 60);
    if (navnSett.has(navn.toLowerCase())) continue;
    navnSett.add(navn.toLowerCase());
    if (typeof e === 'string') elevFormatMigrert = true;
    const gyldigId = erObjekt(e) && typeof e.id === 'string' && ELEV_ID.test(e.id) && !ider.has(e.id);
    let id;
    if (gyldigId) { id = e.id; ider.add(id); } else { id = nyElevId(ider); }
    ut.push({ id, navn });
  }
  return ut;
}

// Lager en funksjon som gjør en referanse til en elev-id, eller null hvis eleven ikke
// finnes i lista. En referanse kan være en id (nytt format) eller et navn (gamle data).
// Referanser til elever som ikke lenger står i lista, blir dermed ryddet bort.
function elevOppslag(elever) {
  const ider = new Set(elever.map(e => e.id));
  const fraNavn = new Map(elever.map(e => [e.navn, e.id]));
  return ref => {
    if (typeof ref !== 'string') return null;
    if (ider.has(ref)) return ref;
    return fraNavn.get(ref.slice(0, 60)) ?? null;
  };
}

// Gyldig kort-ID: en av de faste widgetene, eller card-notat-1, card-bilde-2 osv.
function erGyldigKortId(id) {
  return typeof id === 'string' &&
    (Object.hasOwn(WIDGET_NAVN, id) || GUIDE_KORT.includes(id) || INSTANS_ID.test(id.replace(/^card-/, '')) && id.startsWith('card-'));
}

// Første, grove pass på det rå objektet FØR migreringene i loadState. Migreringene
// forutsetter at enkelte felt er lister eller objekter, og ville ellers krasjet.
function rensRåState(raw) {
  if (!erObjekt(raw)) throw new Error('Lagret tilstand er ikke et objekt');
  if ('sider' in raw) {
    raw.sider = Array.isArray(raw.sider) ? raw.sider.filter(erObjekt) : [];
    if (!raw.sider.length) raw.sider = [nySide('Side 1')];
    for (const side of raw.sider) {
      if (!Array.isArray(side.widget_layout)) side.widget_layout = nySide('').widget_layout;
      if (!Array.isArray(side.widget_hidden)) side.widget_hidden = [];
      if ('dagsplan' in side && !Array.isArray(side.dagsplan)) side.dagsplan = [];
    }
  }
  for (const felt of ['notater', 'bilder', 'youtube', 'lister', 'liste_begrensninger', 'liste_trekk', 'widget_størrelser']) {
    if (felt in raw && !erObjekt(raw[felt])) delete raw[felt];
  }
  if ('widget_layout' in raw && !Array.isArray(raw.widget_layout)) delete raw.widget_layout;
  return raw;
}

// Endelig pass etter migreringene: hvert felt får riktig type. Endrer på stedet og
// returnerer samme objekt. Ukjente felt får stå, de brukes ikke til noe.
// Den felles timeren fra før v2.48 («card-timer», samme timer på alle sider) blir én
// vanlig timer per side der den var synlig, med samme plass og innstillinger. Kjøres
// først i normaliserState, før kort-id-ene sjekkes: «card-timer» er ikke gyldig lenger.
function migrerFellesTimer(s) {
  if (!Array.isArray(s.sider) || !s.sider.some(side => Array.isArray(side.widget_layout) &&
      side.widget_layout.some(w => w?.id === 'card-timer'))) return;
  s.timere = erObjekt(s.timere) ? s.timere : {};
  let teller = Number.isFinite(s.timer_teller) ? s.timer_teller : 0;
  for (const side of s.sider) {
    if (!Array.isArray(side.widget_layout)) continue;
    const w = side.widget_layout.find(x => x?.id === 'card-timer');
    if (!w) continue;
    const skjult = Array.isArray(side.widget_hidden) && side.widget_hidden.includes('card-timer');
    side.widget_layout = side.widget_layout.filter(x => x?.id !== 'card-timer');
    if (Array.isArray(side.widget_hidden)) side.widget_hidden = side.widget_hidden.filter(x => x !== 'card-timer');
    if (skjult) continue;
    const id = `timer-${++teller}`;
    s.timere[id] = { varighet: s.timer_varighet, modus: s.timer_modus, visning: s.timer_visning };
    side.widget_layout.push({ ...w, id: `card-${id}` });
  }
  s.timer_teller = teller;
}

function normaliserState(s) {
  migrerFellesTimer(s);
  // --- Sider ---
  s.sider = s.sider.map((side, i) => {
    side.navn = tekstEllerNull(side.navn, 60) || `Side ${i + 1}`;
    side.kolonner = heltall(side.kolonner, 1, 4, 3);
    if (!Array.isArray(side.kol_bredder) || side.kol_bredder.length !== side.kolonner ||
        !side.kol_bredder.every(b => typeof b === 'number' && Number.isFinite(b) && b > 0)) {
      side.kol_bredder = standardBredder(side.kolonner);
    }
    side.elever = normaliserElever(side.elever);
    // Alle referanser til elever blir id-er, uten duplikater, og bare til elever som
    // faktisk står i lista.
    const tilId = elevOppslag(side.elever);
    const idListe = v => [...new Set((Array.isArray(v) ? v : []).map(tilId).filter(Boolean))];
    const grupper = Array.isArray(side.grupper)
      ? side.grupper.filter(Array.isArray).map(idListe).filter(g => g.length)
      : [];
    side.grupper = grupper.length ? grupper : null;
    side.dagsplan = (Array.isArray(side.dagsplan) ? side.dagsplan : [])
      .map(p => (typeof p === 'string' ? { tekst: p, ferdig: false } : p))
      .filter(p => erObjekt(p) && typeof p.tekst === 'string')
      .map(p => ({ tekst: p.tekst.slice(0, 200), ferdig: p.ferdig === true }));
    side.tilfeldig_backlog  = idListe(side.tilfeldig_backlog);
    side.ordenselev_backlog = idListe(side.ordenselev_backlog);
    side.ordenselev_valgte  = idListe(side.ordenselev_valgte).slice(0, 2);
    side.ulv_backlog        = idListe(side.ulv_backlog);
    side.ordenselev_skyldig = idListe(side.ordenselev_skyldig);
    side.ulv_skyldig        = idListe(side.ulv_skyldig);
    side.ordenselev_antall  = side.ordenselev_antall === 1 ? 1 : 2;
    side.arbeid_symbol = typeof side.arbeid_symbol === 'string' && /^[a-z0-9-]{1,30}$/.test(side.arbeid_symbol)
      ? side.arbeid_symbol : null;
    side.arbeid_lys = TRAFIKKLYS.includes(side.arbeid_lys) ? side.arbeid_lys : null;
    side.kort_navn = Object.fromEntries(Object.entries(erObjekt(side.kort_navn) ? side.kort_navn : {})
      .filter(([id, navn]) => erGyldigKortId(id) && !FARLIGE_NØKLER.has(id) && typeof navn === 'string' && navn.trim())
      .map(([id, navn]) => [id, navn.trim().slice(0, 40)]));
    side.tilfeldig_valgt    = tilId(side.tilfeldig_valgt);
    side.tilfeldig_flere    = normaliserTrekk({ tilfeldig_flere: side.tilfeldig_flere }).tilfeldig_flere;
    side.ulv_valgt          = tilId(side.ulv_valgt);
    side.ulv_navn           = tekstEllerNull(side.ulv_navn, 40) || 'Klassebamse';
    side.gruppe_begrensninger = (Array.isArray(side.gruppe_begrensninger) ? side.gruppe_begrensninger : [])
      .filter(par => Array.isArray(par) && par.length === 2)
      .map(par => par.map(tilId))
      .filter(([a, b]) => a && b && a !== b);
    side.oppmøte = normaliserOppmøte(side.oppmøte, tilId);
    side.widget_hidden = tekstliste(side.widget_hidden).filter(erGyldigKortId);
    side.widget_layout = side.widget_layout
      .filter(w => erObjekt(w) && erGyldigKortId(w.id))
      .map(w => ({ id: w.id, col: heltall(w.col, 1, 4, 1), ...gyldigPlassering(w) }));
    // Kolonneoppsett fra før v2.35 (eller et kort uten gyldig plass): regn om hele
    // siden til fri plassering. Se migrerTilFlate().
    if (side.widget_layout.some(w => w.x === undefined)) migrerTilFlate(side);
    // Voksende kort læreren har satt størrelsen på før minstehøyden fantes: høyden
    // de har nå, blir minstehøyden, så ingenting krymper.
    side.widget_layout.forEach(w => {
      if (w.fast && w.hMin === undefined && FØLGER_INNHOLD.includes(kortType(w.id))) w.hMin = w.h;
    });
    return side;
  });
  s.aktiv_side = heltall(s.aktiv_side, 0, s.sider.length - 1, 0);

  // --- Lagrede klasselister: listenavn → liste med { id, navn } ---
  const lister = {};
  for (const [navn, elever] of Object.entries(erObjekt(s.lister) ? s.lister : {})) {
    if (Array.isArray(elever)) lister[navn.slice(0, 60)] = normaliserElever(elever);
  }
  s.lister = lister;

  // --- Par per liste: bare lister som finnes, og bare elever som står i lista ---
  const listePar = {};
  for (const [navn, par] of Object.entries(erObjekt(s.liste_begrensninger) ? s.liste_begrensninger : {})) {
    const elever = lister[navn];
    if (!elever) continue;
    const ider = new Set(elever.map(e => e.id));
    listePar[navn] = slåSammenPar((Array.isArray(par) ? par : [])
      .filter(p => Array.isArray(p) && p.length === 2 && p.every(id => ider.has(id))));
  }
  s.liste_begrensninger = listePar;

  // --- Trekk per liste: bare lister som finnes. Id-ene sjekkes bare for form, ikke
  // mot lista: en elev som er lagt til på siden etter at lista ble lagret, kan stå i
  // backlogen uten å stå i lista. ---
  const listeTrekk = {};
  for (const [navn, r] of Object.entries(erObjekt(s.liste_trekk) ? s.liste_trekk : {})) {
    if (lister[navn] && erObjekt(r)) listeTrekk[navn] = normaliserTrekk(r);
  }
  s.liste_trekk = listeTrekk;
  // --- Oppsett i Lister-menyen: nye objekter, så ukjente felt fra en fil ikke blir med ---
  s.liste_oppsett = normaliserOppsett((Array.isArray(s.liste_oppsett) ? s.liste_oppsett : [])
    .map(x => (erObjekt(x) ? { gruppe: x.gruppe, lister: x.lister, åpen: x.åpen } : x)), lister);
  // Sidens kobling til en liste gjelder bare hvis lista finnes.
  for (const side of s.sider) {
    side.liste = typeof side.liste === 'string' && Object.hasOwn(lister, side.liste) ? side.liste : null;
  }

  // --- Flerinstans-widgets. Bare gyldige ID-er overlever ---
  const notater = {};
  for (const [id, n] of Object.entries(s.notater ?? {})) {
    if (!INSTANS_ID.test(id) || !id.startsWith('notat-')) continue;
    notater[id] = {
      tekst: erObjekt(n) && typeof n.tekst === 'string' ? n.tekst.slice(0, 100000) : '',
      kursiv: erObjekt(n) && n.kursiv === true,
      størrelse: erObjekt(n) && NOTAT_STØRRELSER.includes(n.størrelse) ? n.størrelse : 1,
    };
  }
  s.notater = notater;

  const bilder = {};
  for (const [id, b] of Object.entries(s.bilder ?? {})) {
    if (!INSTANS_ID.test(id) || !id.startsWith('bilde-')) continue;
    // Bildedata som data-URL finnes bare som reserve uten IndexedDB, eller i en
    // importfil. Andre adresser (f.eks. https://) ville blitt en sporingspiksel.
    bilder[id] = erObjekt(b) && typeof b.data === 'string' && b.data.startsWith('data:image/')
      ? { data: b.data }
      : {};
  }
  s.bilder = bilder;

  const youtube = {};
  for (const [id, y] of Object.entries(s.youtube ?? {})) {
    if (!INSTANS_ID.test(id) || !id.startsWith('youtube-')) continue;
    const ny = { modus: erObjekt(y) && y.modus === 'lyd' ? 'lyd' : 'video' };
    if (erObjekt(y) && typeof y.videoId === 'string' && YOUTUBE_VIDEO_ID.test(y.videoId)) {
      ny.videoId = y.videoId;
      ny.url   = tekstEllerNull(y.url, 500) || `https://www.youtube.com/watch?v=${y.videoId}`;
      ny.start = heltall(y.start, 0, 86400, 0);
    }
    if (erObjekt(y) && Number.isFinite(y.volum)) ny.volum = heltall(Math.round(y.volum), 0, 100, 100);
    youtube[id] = ny;
  }
  s.youtube = youtube;

  // Tellerne må ligge minst like høyt som største ID, ellers kan et nytt kort få en
  // ID som allerede er i bruk.
  const størsteId = (obj) => Math.max(0, ...Object.keys(obj).map(k => parseInt(k.split('-')[1], 10)));
  s.notat_teller   = Math.max(heltall(s.notat_teller, 0, 999999, 0), størsteId(s.notater));
  // Timere: gyldige innstillinger, og en timer for hvert timerkort som står i et oppsett
  // (et kort uten innstillinger får standardene i stedet for å forsvinne).
  const timere = {};
  for (const [id, x] of Object.entries(erObjekt(s.timere) ? s.timere : {})) {
    if (!/^timer-\d{1,6}$/.test(id) || !erObjekt(x)) continue;
    timere[id] = { varighet: heltall(x.varighet, 1, 86400, 300), modus: x.modus === 'opp' ? 'opp' : 'ned',
                   visning: x.visning === 'skive' ? 'skive' : 'bjelke' };
  }
  for (const side of s.sider) {
    for (const w of side.widget_layout) {
      const id = w.id.replace(/^card-/, '');
      if (/^timer-\d{1,6}$/.test(id) && !timere[id]) timere[id] = { varighet: 300, modus: 'ned', visning: 'bjelke' };
    }
  }
  // Timere som ikke står på noen side (en side ble slettet før v2.49), slettes: de kunne
  // ellers tikke videre uten kort.
  const brukteKort = new Set(s.sider.flatMap(side => side.widget_layout.map(w => w.id)));
  for (const id of Object.keys(timere)) if (!brukteKort.has(`card-${id}`)) delete timere[id];
  s.timere = timere;
  s.timer_teller = Math.max(heltall(s.timer_teller, 0, 999999, 0), størsteId(s.timere));
  const tilfeldige = {};
  for (const id of Object.keys(erObjekt(s.tilfeldige) ? s.tilfeldige : {})) if (/^tilfeldig-\d{1,6}$/.test(id)) tilfeldige[id] = {};
  for (const side of s.sider) {
    for (const w of side.widget_layout) {
      const id = w.id.replace(/^card-/, '');
      if (/^tilfeldig-\d{1,6}$/.test(id)) tilfeldige[id] = {};
    }
  }
  for (const id of Object.keys(tilfeldige)) if (!brukteKort.has(`card-${id}`)) delete tilfeldige[id];
  s.tilfeldige = tilfeldige;
  s.tilfeldig_teller = Math.max(heltall(s.tilfeldig_teller, 0, 999999, 0), størsteId(s.tilfeldige));
  s.bilde_teller   = Math.max(heltall(s.bilde_teller, 0, 999999, 0), størsteId(s.bilder));
  s.youtube_teller = Math.max(heltall(s.youtube_teller, 0, 999999, 0), størsteId(s.youtube));

  // --- Øvrige globale felt ---
  s.timer_varighet = heltall(s.timer_varighet, 1, 86400, 300);
  s.timer_modus   = s.timer_modus === 'opp' ? 'opp' : 'ned';
  s.timer_visning = s.timer_visning === 'skive' ? 'skive' : 'bjelke';
  // Egne arbeidssymboler: bare emoji og tekst med fornuftig lengde, unike id-er.
  const egneIder = new Set();
  s.arbeid_egne = (Array.isArray(s.arbeid_egne) ? s.arbeid_egne : [])
    .filter(x => erObjekt(x) && typeof x.id === 'string' && /^eget-[a-z0-9]{4,12}$/.test(x.id) && !egneIder.has(x.id) && egneIder.add(x.id))
    .map(x => ({ id: x.id, emoji: tekstEllerNull(x.emoji, 8) || '⭐', tekst: tekstEllerNull(x.tekst, 30) || '' }))
    .filter(x => x.tekst)
    .slice(0, 30);
  if (!SKRIFT_NØKLER.includes(s.skrift_størrelse)) s.skrift_størrelse = 'normal';
  if (typeof s.tema !== 'string') s.tema = 'lyst';  // settTema() sjekker mot gyldige temaer
  if (typeof s.font !== 'string') s.font = 'system'; // settFont() sjekker mot FONTER
  if (typeof s.eksport_signatur !== 'string') s.eksport_signatur = null;
  if (!Number.isFinite(s.eksport_tid)) s.eksport_tid = null;
  // Nyere data beholder versjonen sin (de lagres uansett ikke, se lagringSperre).
  s.lagringsversjon = Math.max(LAGRINGSVERSJON, Number(s.lagringsversjon) || 0);
  if (s.språk !== 'nn') s.språk = 'nb';
  return s;
}

let state = loadState();
let værData = null;    // siste værsvar fra met.no, delt mellom topptekst, popup og klokkekort
let pollenData = null; // siste pollensvar fra Open-Meteo, brukt av klokkekortet
let stedsTreff = [];   // siste geokodingstreff, slik at klikk kan slå opp på indeks

// Timernes løpende tilstand: se «Timer» (timerKjøring).

// Leser lagret tilstand fra localStorage og migrerer eldre dataformater opp til
// dagens struktur (flat state → sider, enkelt-notat → flerinstans osv.). Returnerer
// defaultState() hvis ingenting er lagret eller parsing feiler — appen starter da blank.
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    sistLagretTekst = raw;
    if (raw) {
      // VIKTIG: les migreringsbeslutninger fra det RÅ parsede objektet (_raw), ikke fra
      // det default-flettede `state`. defaultState() fyller alltid sider[0] og notater/bilder
      // med tomme defaults, så guards som "finnes feltet?" må sjekke _raw — ellers ser de
      // alltid defaultene og migrerer aldri (→ datatap for gamle states). Se v2.7.
      const _raw = rensRåState(trygtJsonParse(raw));
      if (Number(_raw.lagringsversjon) > LAGRINGSVERSJON) lagringSperre = 'nyere-versjon';
      const state = Object.assign(defaultState(), _raw);
      if (!_raw.sider) {
        // Flatt pre-v1.9-state uten `sider`: bygg side 1 fra gammelt topp-nivå-oppsett
        state.sider = [{
          navn: 'Side 1',
          widget_layout: _raw.widget_layout ?? defaultState().sider[0].widget_layout,
          widget_hidden: _raw.widget_hidden ?? [],
        }];
        state.aktiv_side = 0;
        delete state.widget_layout;
        delete state.widget_hidden;
      }
      // Migrer flat notat/bilde-state til flerinstans-struktur
      if (_raw.notat !== undefined && _raw.notater === undefined) {
        state.notater = { 'notat-1': { tekst: _raw.notat || '', kursiv: _raw.notat_kursiv || false } };
        delete state.notat;
        delete state.notat_kursiv;
      }
      if (_raw.bilde_data !== undefined && _raw.bilder === undefined) {
        state.bilder = { 'bilde-1': { data: _raw.bilde_data || null } };
        delete state.bilde_data;
      }
      if (!state.notat_teller) state.notat_teller = Math.max(...Object.keys(state.notater || {}).map(k => parseInt(k.split('-')[1]) || 0), 0);
      if (!state.bilde_teller) state.bilde_teller = Math.max(...Object.keys(state.bilder  || {}).map(k => parseInt(k.split('-')[1]) || 0), 0);
      // Migrer widget_layout-IDer på alle sider (card-notat → card-notat-1 osv.)
      for (const side of state.sider) {
        side.widget_layout = side.widget_layout.map(w =>
          w.id === 'card-notat' ? { ...w, id: 'card-notat-1' } :
          w.id === 'card-bilde' ? { ...w, id: 'card-bilde-1' } : w
        );
        side.widget_hidden = (side.widget_hidden || []).map(id =>
          id === 'card-notat' ? 'card-notat-1' :
          id === 'card-bilde' ? 'card-bilde-1' : id
        );
        // Migrer kolonne-innstillinger (lagt til i v2.6)
        if (!side.kolonner) side.kolonner = 3;
        if (!Array.isArray(side.kol_bredder) || side.kol_bredder.length !== side.kolonner) {
          side.kol_bredder = standardBredder(side.kolonner);
        }
      }
      // Migrer current-state til per-side scope (v2.7): flytt gammelt topp-nivå
      // (roster, trekk, backlogs, dagsplan, grupper, klassebamse-navn, begrensninger)
      // inn i den første siden. Ikke-destruktivt.
      const PER_SIDE_FELT = [
        'elever', 'grupper', 'dagsplan', 'tilfeldig_backlog', 'tilfeldig_valgt',
        'ordenselev_backlog', 'ordenselev_valgte', 'ulv_backlog', 'ulv_valgt',
        'ulv_navn', 'gruppe_begrensninger',
      ];
      const flatLegacy = _raw.sider === undefined;
      const førsteSide = state.sider[0];
      for (const felt of PER_SIDE_FELT) {
        // Flytt _raw sitt topp-nivå current-state inn i side 1.
        // Flatt legacy: kopier alltid (default-siden har allerede tomme verdier).
        // v2.6 med ekte sider-array: kopier kun når side 1 ikke selv hadde feltet.
        if (_raw[felt] !== undefined && (flatLegacy || førsteSide[felt] === undefined)) {
          førsteSide[felt] = _raw[felt];
        }
        delete state[felt];
      }
      // Sørg for at alle sider har komplette per-side-felter med fornuftige defaults
      for (const side of state.sider) {
        side.elever              ??= [];
        side.grupper             ??= null;
        side.dagsplan            ??= [];
        side.tilfeldig_backlog   ??= [];
        side.tilfeldig_valgt     ??= null;
        side.ordenselev_backlog  ??= [];
        side.ordenselev_valgte   ??= [];
        side.ulv_backlog         ??= [];
        side.ulv_valgt           ??= null;
        side.ordenselev_skyldig  ??= [];
        side.ulv_skyldig         ??= [];
        side.ulv_navn            ??= 'Klassebamse';
        side.gruppe_begrensninger ??= [];
        // Migrer dagsplan-strenger til { tekst, ferdig }-objekter
        side.dagsplan = side.dagsplan.map(p =>
          typeof p === 'string' ? { tekst: p, ferdig: false } : p
        );
      }
      // Vær-sted (v2.19). Eldre states mangler feltet helt — da har Object.assign
      // allerede gitt oss standardstedet. Vi sjekker likevel at koordinatene er tall,
      // så et halvskrevet eller manuelt redigert felt ikke sender ugyldige kall til met.no.
      const vs = state.vær_sted;
      if (!vs || !vs.navn || typeof vs.lat !== 'number' || typeof vs.lon !== 'number') {
        state.vær_sted = { ...STANDARD_VÆR_STED };
      } else if (!vs.kilde) {
        // Lagret før v2.20 hadde ikke `kilde`. Sto stedet på standardverdien, har
        // brukeren aldri valgt noe selv — da skal posisjonsoppslaget få lov til å
        // overstyre. Har de søkt opp et sted, regnes det som deres eget valg.
        vs.kilde = (vs.navn === STANDARD_VÆR_STED.navn) ? 'standard' : 'valgt';
      }
      // Posisjon lagret før v2.31 hadde 4 desimaler (~11 m). Rund ned til ~1 km.
      if (state.vær_sted.kilde === 'posisjon') {
        state.vær_sted.lat = Math.round(state.vær_sted.lat * 100) / 100;
        state.vær_sted.lon = Math.round(state.vær_sted.lon * 100) / 100;
      }
      if (typeof state.vær_sted.navn !== 'string') state.vær_sted.navn = STANDARD_VÆR_STED.navn;
      state.vær_sted.navn = state.vær_sted.navn.slice(0, 100);
      // Terning (v2.20). Klem verdiene innenfor det widgeten faktisk støtter, så en
      // redigert eller importert fil ikke gir en «d7» eller 40 terninger på skjermen.
      if (!TERNING_TYPER.includes(state.terning_type)) state.terning_type = 6;
      if (!KLOKKE_VISNINGER.includes(state.klokke_visning)) state.klokke_visning = 'begge';
      state.terning_antall = Math.min(MAKS_TERNINGER, Math.max(1, state.terning_antall | 0 || 1));
      if (!Array.isArray(state.terning_kast)) state.terning_kast = [];
      // Størrelse per widget (v2.24) er prosent avvik fra global størrelse. Før var det
      // trinnene liten/stor/xl, som zoomet 14/16, 18/16 og 20/16. De gjøres om til
      // nærmeste hele prosent, så kortene ser like ut som før. Gjelder også import,
      // siden «Erstatt alt» skriver til localStorage og laster siden på nytt.
      const GAMLE_TRINN = { liten: -13, normal: 0, stor: 13, xl: 25 };
      const størrelser = {};
      for (const [id, v] of Object.entries(state.widget_størrelser ?? {})) {
        const pst = klemWidgetProsent(typeof v === 'string' ? GAMLE_TRINN[v] : v);
        if (pst) størrelser[id] = pst;
      }
      state.widget_størrelser = størrelser;
      const ferdig = normaliserState(state);
      // Første gang gamle navnelister gjøres om til elever med id: ta vare på rådataene
      // slik de var, før noe lagres over dem. Bare én gang, så kopien forblir den eldste.
      if (elevFormatMigrert) {
        try {
          if (!localStorage.getItem(FØR_ELEV_ID_KEY)) localStorage.setItem(FØR_ELEV_ID_KEY, raw);
        } catch (_) { /* full lagring: migreringen går likevel, uten kopi */ }
      }
      return ferdig;
    }
  } catch (e) {
    console.warn('loadState:', e);
    // Appen starter blank og vil snart lagre over det som lå der. Ta vare på det
    // uleselige først, så dataene kan reddes (se nødmeldingen i startOppTrygt).
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) localStorage.setItem(RESERVE_KEY, raw);
    } catch (_) { /* full lagring eller ingen tilgang: ingenting mer å gjøre */ }
  }
  return defaultState();
}

// Henter side-objektet brukeren ser på nå. Alt «per-side»-innhold (elever, trekk,
// grupper, dagsplan osv.) leses og skrives gjennom denne hjelperen.
function aktivSide() {
  return state.sider[state.aktiv_side ?? 0];
}

// Skriver hele tilstanden til localStorage. Kalles etter HVER mutasjon av `state`,
// ellers går endringen tapt ved neste sideoppfriskning. Oppdaterer også eksport-
// varselet, siden lagret data nå kan avvike fra forrige eksporterte backup.
// Lagring som feiler (full lagring, sperret i et privat vindu), sies fra om én gang
// til den virker igjen. Ellers ville læreren trodd at alt var lagret.
let lagringFeilet = false;
// Settes når siden lukkes eller lastes på nytt (pagehide). Mens siden rives ned, endrer
// layouten seg, og observatørene (skalering, høyde) ville lagret den gamle tilstanden
// over det som ligger der nå, f.eks. data en annen fane eller en nyere versjon nettopp
// skrev. Nullstilles hvis nettleseren henter siden fram igjen fra hurtiglageret.
let sidenLukkes = false;
window.addEventListener('pagehide', () => { sidenLukkes = true; });
window.addEventListener('pageshow', e => { if (e.persisted) sidenLukkes = false; });
// En skjult fane (annen fane framme, eller vinduet minimert) har ingen lærer som gjør
// noe; det eneste den kan ha å lagre, er layoutstøy fra observatørene. Skrev den, kunne
// den synlige fanen sett det som en endring og sperret seg selv. Derfor venter den med
// å lagre til den blir synlig igjen.
let lagringVenter = false;
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && lagringVenter) { lagringVenter = false; if (!lagringSperre) saveState(); }
});
function saveState() {
  if (sletterAlt || sidenLukkes) return;
  if (lagringSperre) { varsleLagringSperre(); return; }
  if (document.hidden) { lagringVenter = true; oppdaterEksportVarsel(); return; }
  try {
    // Har noen andre skrevet siden sist, er denne fanen utdatert. «storage»-hendelsen
    // ville sagt det samme, men den kommer først når nettleseren kommer til den, og en
    // lagring som lå i kø (høydejustering, skalering) kunne rukket å skrive over først.
    const nå = localStorage.getItem(STORAGE_KEY);
    if (sistLagretTekst !== null && nå !== sistLagretTekst) {
      lagringSperre = 'annen-fane';
      varsleLagringSperre();
      return;
    }
    const tekst = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, tekst);
    sistLagretTekst = tekst;
    lagringFeilet = false;
  } catch (e) {
    console.warn('saveState:', e);
    if (!lagringFeilet) {
      lagringFeilet = true;
      notify(t('⚠️ Klarte ikke å lagre. Endringene forsvinner når siden lukkes. Ta en 📤 eksport for å sikre dem.'), 'error');
    }
  }
  oppdaterEksportVarsel();
}

// ===================== Flere faner =====================
// Hver fane har sin egen kopi av state og lagrer hele kopien. Var Skoledash åpen i to
// faner, ville den som lagret sist, skrevet over den andres endringer uten at noen
// merket det. Nettleseren sender «storage» til de ANDRE fanene når en fane lagrer.
// Da blir denne fanen utdatert: den slutter å lagre, og laster inn på nytt så snart
// det ikke forstyrrer (med en gang hvis fanen er skjult, ellers når læreren kommer
// tilbake til den eller trykker knappen i varselet). Timeren overlever omlastingen.
function følgAndreFaner() {
  window.addEventListener('storage', e => {
    if (e.key !== STORAGE_KEY || e.storageArea !== localStorage || sletterAlt) return;
    if (lagringSperre === 'nyere-versjon') return;
    // Lagret den andre fanen akkurat det denne fanen har, er det ingen konflikt.
    if (e.newValue === JSON.stringify(state)) return;
    lagringSperre = 'annen-fane';
    if (document.hidden) lastInnPåNytt();
    else visLagringVarsel();
  });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && lagringSperre === 'annen-fane') lastInnPåNytt();
  });
}

function lastInnPåNytt() {
  lagreTimerØkt();
  location.reload();
}

// Fast varsel øverst når appen ikke lagrer, med knapp for å laste inn på nytt.
function visLagringVarsel() {
  const el = document.getElementById('lagring-varsel');
  if (!el || !lagringSperre) return;
  document.getElementById('lagring-varsel-tekst').textContent = lagringSperre === 'nyere-versjon'
    ? t('Dataene er lagret av en nyere versjon av Skoledash. Endringer her blir ikke lagret.')
    : t('Skoledash er endret i en annen fane. Endringer her blir ikke lagret før du laster inn på nytt.');
  el.classList.remove('hidden');
}

// Kalles når noe skulle vært lagret, men ikke ble det. Sier fra høyst hvert 5. sekund.
let sistSperreVarsel = 0;
function varsleLagringSperre() {
  visLagringVarsel();
  if (Date.now() - sistSperreVarsel < 5000) return;
  sistSperreVarsel = Date.now();
  notify(t('Endringen ble ikke lagret. Last inn siden på nytt.'), 'warning');
}

// Ber nettleseren om å ikke rydde bort dataene når det blir trangt om plass eller
// siden ikke er brukt på en stund. Chrome og Edge svarer uten å spørre, Firefox kan
// spørre læreren. Kalles når læreren gjør noe med lister eller backup, ikke ved
// oppstart, så ingen får et spørsmål første gang de åpner appen.
function beOmVarigLagring() {
  navigator.storage?.persisted?.()
    .then(varig => varig || navigator.storage.persist?.())
    .catch(() => {});
}

// ===================== Date / Weather =====================
// Formaterer dagens dato på norsk, f.eks. «mandag 12. mai 2025».
function norskDato() {
  const d = new Date();
  const nn = state.språk === 'nn';
  const dager = nn ? UKEDAGER_NN : UKEDAGER;
  const mnd   = nn ? MÅNEDER_NN  : MÅNEDER;
  return `${dager[d.getDay()]} ${d.getDate()}. ${mnd[d.getMonth()]} ${d.getFullYear()}`;
}

// Skriver dagens dato inn i toppteksten. Kalles ved oppstart og hvert minutt.
function oppdaterDato() {
  document.getElementById('header-dato').textContent = norskDato();
}

// Runder av en koordinat til 4 desimaler. met.no avviser kall med flere desimaler
// (de vil unngå unødvendig cache-spredning), og geokodingen gir gjerne 5.
function rundKoordinat(n) {
  return Math.round(n * 10000) / 10000;
}

// Runder av lærerens egen posisjon til 2 desimaler, omtrent 1 km. Det holder godt for
// værvarselet, men peker ikke ut en adresse. Steder som søkes opp, er stedsnavn og
// beholder rundKoordinat().
function rundPosisjon(n) {
  return Math.round(n * 100) / 100;
}

// Stedet vær og pollen hentes for. Faller tilbake til standardstedet hvis det lagrede
// feltet skulle mangle eller være ødelagt, så et kall aldri sendes uten koordinater.
function værSted() {
  const s = state.vær_sted;
  return (s && typeof s.lat === 'number' && typeof s.lon === 'number') ? s : STANDARD_VÆR_STED;
}

// Liten fetch-innpakning: kaster ved HTTP-feil, ellers gir den ferdig parset JSON.
// Sender bevisst ingen egne headere — se merknaden over MET-kallet om CORS-preflight.
async function hentJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

// Henter værvarsel (met.no) og pollenvarsel (Open-Meteo) for det valgte stedet, og
// tegner resultatet i både toppteksten og klokke-kortet. Kjøres ved oppstart, hvert
// tiende minutt, og når brukeren bytter sted.
// De to kallene går parallelt og uavhengig av hverandre: allSettled gjør at et
// mislykket pollenkall ikke tar med seg været i fallet. Feil svelges stille — vær er
// pynt, ikke kjernefunksjon, og dashbordet skal ikke bråke om nettet er nede.
async function hentVær() {
  const sted = værSted();
  const pollenfelt = POLLEN_ARTER.map(a => a.felt).join(',');
  const [vær, pollen] = await Promise.allSettled([
    hentJson(`https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${sted.lat}&lon=${sted.lon}`),
    hentJson(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${sted.lat}&longitude=${sted.lon}&current=${pollenfelt}&timezone=auto`),
  ]);
  værData    = vær.status    === 'fulfilled' ? vær.value    : null;
  pollenData = pollen.status === 'fulfilled' ? pollen.value : null;
  renderVær();
}

// Finner arten med høyest nivå i pollensvaret og beskriver den på norsk, f.eks.
// «Bjørk – høyt». Returnerer null hvis vi ikke har tall for noen art (utenfor
// sesongen kan feltene mangle helt), og «Lavt» når alt ligger i bunn.
function pollenSammendrag() {
  const nå = pollenData?.current;
  if (!nå) return null;

  let verst = null;
  for (const art of POLLEN_ARTER) {
    const verdi = nå[art.felt];
    if (typeof verdi !== 'number') continue;
    const nivå = verdi >= art.grenser[1] ? 3
               : verdi >= art.grenser[0] ? 2
               : verdi > 1               ? 1 : 0;
    if (!verst || nivå > verst.nivå) verst = { navn: art.navn, nivå };
  }
  if (!verst) return null;
  // Returnerer både tekst og om nivået er høyt, så fargen ikke avhenger av ordet
  // («høyt» på bokmål, «høgt» på nynorsk).
  return verst.nivå === 0
    ? { tekst: t('Lavt'), høyt: false }
    : { tekst: `${t(verst.navn)} – ${t(POLLEN_NIVÅER[verst.nivå])}`, høyt: verst.nivå === 3 };
}

// Tegner været i toppteksten: symbol, temperatur og stedsnavn. Detaljene ligger i
// vær-popupen, som bygges av visVærPopup(). Er popupen åpen når nye data kommer inn,
// tegnes den på nytt så den ikke står med utdaterte tall.
// Gjør ingen nettverkskall — den kan derfor kalles fritt.
function renderVær() {
  const sted   = værSted();
  const d      = værData?.properties?.timeseries?.[0]?.data;
  const header = document.getElementById('header-ver');

  if (header) {
    header.textContent = d
      ? `${yrEmoji(d.next_1_hours?.summary.symbol_code ?? 'cloudy')} ${Math.round(d.instant.details.air_temperature)}°C  ${sted.navn}`
      : t('⏳ Henter vær…');
  }

  const popup = document.getElementById('vær-popup');
  if (popup && !popup.classList.contains('hidden')) tegnVærPopup();
}

// Forklarende undertekst til stedsnavnet i popupen, så det aldri er uklart hvor
// stedet kom fra — særlig når posisjonsoppslaget feilet og vi står på standardstedet.
const STEDSKILDE_TEKST = {
  standard: 'standardsted',
  posisjon: 'fra din posisjon',
  valgt:    'valgt av deg',
};

// Åpner/lukker vær-popupen. Innholdet bygges av tegnVærPopup(), som også kalles når
// nye data kommer inn mens popupen står åpen.
function visVærPopup() {
  const popup = document.getElementById('vær-popup');
  const skalÅpnes = popup.classList.contains('hidden');
  if (skalÅpnes) tegnVærPopup();
  popup.classList.toggle('hidden', !skalÅpnes);
}

// Nedbør for de neste seks timene, slik met.no selv har summert den.
function nedbørTekst(nå) {
  const mm = nå?.next_6_hours?.details?.precipitation_amount;
  return typeof mm === 'number' ? `${mm.toFixed(1).replace('.', ',')} mm` : '–';
}

// Bygger hele innholdet i vær-popupen: sted, nåværende forhold, de neste 8 timene og
// stedskontrollene. Bruker de allerede hentede `værData`/`pollenData` — ingen nye kall.
// Nedbør og pollen lå tidligere bare i klokke-kortet; nå er dette eneste stedet været
// vises i detalj.
function tegnVærPopup() {
  const popup = document.getElementById('vær-popup');
  if (!popup) return;
  const sted   = værSted();
  const ts     = værData?.properties?.timeseries;
  const nå     = ts?.[0]?.data;
  const pollen = pollenSammendrag();

  // Uten værdata viser vi likevel stedskontrollene — ellers ville popupen vært tom, og
  // brukeren sittet fast på feil sted uten mulighet til å bytte.
  const detaljer = !nå ? `<div class="vær-tom">${t('Fikk ikke tak i værvarselet')}</div>` : `
    <div class="vær-hoved">
      <span class="vær-hoved-emoji">${yrEmoji(nå.next_1_hours?.summary.symbol_code ?? 'cloudy')}</span>
      <span class="vær-hoved-temp">${Math.round(nå.instant.details.air_temperature)}°C</span>
    </div>
    <div class="vær-nå">
      <div class="vær-rad"><span>${t('💨 Vind')}</span><strong>${Math.round(nå.instant.details.wind_speed)} m/s</strong></div>
      <div class="vær-rad"><span>${t('🌧 Nedbør (6 t)')}</span><strong>${nedbørTekst(nå)}</strong></div>
      <div class="vær-rad"><span>${t('🌿 Pollen')}</span><strong class="${pollen?.høyt ? 'pollen-hoyt' : ''}">${pollen?.tekst ?? '–'}</strong></div>
      <div class="vær-rad"><span>${t('💧 Luftfuktighet')}</span><strong>${Math.round(nå.instant.details.relative_humidity)}%</strong></div>
      <div class="vær-rad"><span>${t('🌡 Lufttrykk')}</span><strong>${Math.round(nå.instant.details.air_pressure_at_sea_level)} hPa</strong></div>
    </div>
    <div class="vær-timer">
      ${ts.slice(0, 8).map(punkt => {
        const nedbør = punkt.data.next_1_hours?.details.precipitation_amount ?? 0;
        return `<div class="vær-time-kort">
          <span class="vær-time-tid">${new Date(punkt.time).toLocaleTimeString('no', { hour: '2-digit', minute: '2-digit' })}</span>
          <span class="vær-time-emoji">${yrEmoji(punkt.data.next_1_hours?.summary.symbol_code ?? 'cloudy')}</span>
          <span class="vær-time-temp">${Math.round(punkt.data.instant.details.air_temperature)}°</span>
          ${nedbør > 0 ? `<span class="vær-time-nedbør">${nedbør}mm</span>` : '<span></span>'}
        </div>`;
      }).join('')}
    </div>`;

  popup.innerHTML = `
    <div class="vær-sted-topp">
      <span class="vær-sted-navn">📍 ${esc(sted.navn)}</span>
      <span class="vær-sted-kilde">${t(STEDSKILDE_TEKST[sted.kilde] ?? '')}</span>
    </div>
    ${detaljer}
    <div class="vær-sted-verktøy">
      <button class="btn btn-ghost btn-sm w-full" id="btn-vær-posisjon">${t('📍 Bruk min posisjon')}</button>
      <input type="text" id="input-vær-sted" placeholder="${t('…eller søk etter et sted')}" autocomplete="off">
      <div id="vær-sted-treff" class="vær-sted-treff"></div>
    </div>`;

  // Må kobles hver gang: innerHTML kaster de gamle elementene og lytterne deres.
  document.getElementById('btn-vær-posisjon').onclick = () => hentPosisjon(true);
  document.getElementById('input-vær-sted').addEventListener('keydown', e => {
    if (e.key === 'Enter')  søkSted();
    if (e.key === 'Escape') popup.classList.add('hidden');
  });
}

// ===================== Terning =====================
// Id-en til den pågående kast-animasjonen. Ligger utenfor funksjonen så et nytt kast
// kan avbryte et som fortsatt ruller — ellers ville to setInterval-er tegne om hverandre.
let terningAnimasjon = null;

// ===================== Arbeidssymboler og Trafikklys =====================
// To kort. 🤫 Arbeidssymboler viser et stort arbeidssymbol (🤫 Stille arbeid, 👫 Pararbeid ...).
// 🚦 Trafikklys har tre lys. Begge velges per side (s.arbeid_symbol, s.arbeid_lys);
// trykker man på det som alt er valgt, slukkes det. Trafikklyset har bare farger, ingen
// tekst: hva rødt og grønt betyr, avtaler læreren med klassen. Lysfargene er faste
// (rødt, gult, grønt), fordi de er selve beskjeden; resten av kortene følger temaet.

function arbeidSymboler() {
  return [...ARBEID_SYMBOLER.map(x => ({ ...x, tekst: t(x.tekst) })), ...state.arbeid_egne];
}

function renderArbeid() {
  const s = aktivSide();
  const symboler = arbeidSymboler();
  const valgt = symboler.find(x => x.id === s.arbeid_symbol) ?? null;
  const vis = document.getElementById('arbeid-vis');
  vis.innerHTML = valgt
    ? `<div class="arbeid-emoji" aria-hidden="true">${esc(valgt.emoji)}</div><div class="arbeid-tekst">${esc(valgt.tekst)}</div>`
    : `<div class="arbeid-tom">${t('Velg et symbol under')}</div>`;
  vis.classList.toggle('tom', !valgt);
  document.getElementById('arbeid-velger').innerHTML = symboler.map(x =>
    `<button class="arbeid-valg${x.id === s.arbeid_symbol ? ' valgt' : ''}" data-symbol="${esc(x.id)}"
       title="${esc(x.tekst)}" aria-label="${esc(x.tekst)}" aria-pressed="${x.id === s.arbeid_symbol}">${esc(x.emoji)}</button>`).join('') +
    `<button class="arbeid-valg arbeid-nytt" data-symbol="" title="${t('Eget symbol')}" aria-label="${t('Eget symbol')}">＋</button>`;
}

function renderTrafikklys() {
  const s = aktivSide();
  document.querySelectorAll('.lys').forEach(l => {
    const på = l.dataset.lys === s.arbeid_lys;
    l.classList.toggle('på', på);
    l.setAttribute('aria-pressed', på);
  });
}

function velgArbeidSymbol(id) {
  const s = aktivSide();
  s.arbeid_symbol = s.arbeid_symbol === id ? null : id;
  saveState();
  renderArbeid();
}

function velgTrafikklys(farge) {
  const s = aktivSide();
  s.arbeid_lys = s.arbeid_lys === farge ? null : farge;
  saveState();
  renderTrafikklys();
}

// «＋ Eget symbol»: vinduet viser lærerens egne symboler med ✕, og felt for et nytt.
function åpneEgneSymboler() {
  document.getElementById('input-arbeid-emoji').value = '';
  document.getElementById('input-arbeid-tekst').value = '';
  renderEgneSymboler();
  åpneModal('modal-arbeid');
}

function renderEgneSymboler() {
  const liste = document.getElementById('arbeid-egne-liste');
  liste.innerHTML = state.arbeid_egne.length
    ? state.arbeid_egne.map(x => `<div class="modal-list-item"><span>${esc(x.emoji)} ${esc(x.tekst)}</span>
        <button class="liste-knapp liste-slett" data-slett-symbol="${esc(x.id)}" title="${t('Slett')}" aria-label="${t('Slett')}">✕</button></div>`).join('')
    : `<p class="tom-tekst">${t('Ingen egne symboler ennå.')}</p>`;
}

function leggTilEgetSymbol() {
  const emoji = document.getElementById('input-arbeid-emoji').value.trim().slice(0, 8);
  const tekst = document.getElementById('input-arbeid-tekst').value.trim().slice(0, 30);
  if (!tekst) { notify(t('Skriv inn en tekst'), 'warning'); return; }
  if (state.arbeid_egne.length >= 30) { notify(t('Du har nådd grensen på 30 egne symboler'), 'warning'); return; }
  let id;
  do { id = 'eget-' + Math.random().toString(36).slice(2, 8).padEnd(6, '0'); }
  while (state.arbeid_egne.some(x => x.id === id));
  state.arbeid_egne.push({ id, emoji: emoji || '⭐', tekst });
  aktivSide().arbeid_symbol = id; // det nye symbolet vises med en gang
  saveState();
  lukkModal();
  renderArbeid();
}

// Sletter et eget symbol. Sider som viste det, viser ingenting i stedet.
function slettEgetSymbol(id) {
  state.arbeid_egne = state.arbeid_egne.filter(x => x.id !== id);
  for (const side of state.sider) if (side.arbeid_symbol === id) side.arbeid_symbol = null;
  saveState();
  renderEgneSymboler();
  renderArbeid();
}

function setupArbeid() {
  document.getElementById('arbeid-velger').addEventListener('click', e => {
    const knapp = e.target.closest('.arbeid-valg');
    if (!knapp) return;
    if (knapp.classList.contains('arbeid-nytt')) åpneEgneSymboler();
    else velgArbeidSymbol(knapp.dataset.symbol);
  });
  document.getElementById('trafikklys').addEventListener('click', e => {
    const lys = e.target.closest('.lys');
    if (lys) velgTrafikklys(lys.dataset.lys);
  });
  document.getElementById('arbeid-egne-liste').addEventListener('click', e => {
    const k = e.target.closest('[data-slett-symbol]');
    if (k) slettEgetSymbol(k.dataset.slettSymbol);
  });
  document.getElementById('btn-arbeid-lagre').onclick = leggTilEgetSymbol;
  document.getElementById('btn-arbeid-lukk').onclick = lukkModal;
  inputEnter('input-arbeid-tekst', leggTilEgetSymbol);
  renderArbeid();
  renderTrafikklys();
}

// Trekker ett terningkast: et helt tall fra 1 til og med antall sider.
function trilleTall(sider) {
  return Math.floor(Math.random() * sider) + 1;
}

// Bygger SVG-en for én terningflate. d6 får ekte prikker; de øvrige typene tegnes som
// sin egen silhuett med tallet i midten. Begge varianter bruker temavariablene, så
// terningen følger fargetemaet uten egne regler per tema.
function terningSVG(verdi, sider) {
  const flate = sider === 6
    ? '<rect class="terning-kropp" x="6" y="6" width="88" height="88" rx="16" />'
    : `<polygon class="terning-kropp" points="${TERNING_FORMER[sider]}" />` +
      (sider === 20 ? '<polygon class="terning-innerlinje" points="50,22 74,64 26,64" />' : '');

  // Prikkene ligger i et 3×3-rutenett mellom 28 og 72, altså godt innenfor kanten.
  const innhold = sider === 6
    ? (TERNING_PRIKKER[verdi] ?? []).map(([kol, rad]) =>
        `<circle class="terning-prikk" cx="${28 + kol * 22}" cy="${28 + rad * 22}" r="8" />`).join('')
    // d4 har tallet litt lavere enn midten, ellers havner det i den smale toppen
    : `<text class="terning-tall" x="50" y="${sider === 4 ? 64 : 52}">${verdi}</text>`;

  return `<span class="terning-flate"><svg viewBox="0 0 100 100" role="img"
            aria-label="${t('Terning viser {verdi}', { verdi })}">${flate}${innhold}</svg></span>`;
}

// Tegner terningene, summen og antallet. `ruller` skrur på vrikke-klassen som brukes
// mens kastet pågår. Kalles både ved oppstart, under animasjonen og når kastet lander
// — den leser alltid verdiene den får inn, aldri state direkte.
function renderTerninger(verdier, ruller = false) {
  const flater = document.getElementById('terning-flater');
  if (!flater) return; // kortet er slått av for denne siden

  const sider = state.terning_type;
  flater.className = ruller ? 'ruller' : '';
  // Terningene legges i rader som er så kvadratiske som mulig: √n kolonner, rundet
  // opp (4 → 2×2, 6 → 3+3, 7 → 3+3+1). CSS bruker --terning-kol til å begrense
  // bredden, og en ufullstendig siste rad sentreres. Færre kolonner gir større
  // flater; resten tar skaleringen med kortet seg av.
  const kol = Math.ceil(Math.sqrt(verdier.length));
  flater.style.setProperty('--terning-kol', kol);
  flater.style.setProperty('--terning-str',
    kol <= 1 ? '108px' : kol === 2 ? '86px' : kol === 3 ? '68px' : '56px');
  flater.innerHTML = verdier.map(v => terningSVG(v, sider)).join('');

  // Summen er bare interessant når det ligger flere terninger på bordet.
  const sum = document.getElementById('terning-sum');
  if (sum) sum.textContent = verdier.length > 1 ? `Sum: ${verdier.reduce((a, b) => a + b, 0)}` : '';

  const antall = document.getElementById('terning-antall-tall');
  if (antall) antall.textContent = state.terning_antall;
}

// Bygger knapperaden med terningtyper og markerer den aktive. Egen funksjon slik at
// d4…d20 bare står oppført ett sted (TERNING_TYPER).
function renderTerningType() {
  const rad = document.getElementById('terning-type');
  if (!rad) return;
  rad.innerHTML = TERNING_TYPER.map(n =>
    `<button class="terning-type-knapp${n === state.terning_type ? ' aktiv' : ''}"
             data-sider="${n}" title="${t('Bytt til d{n}', { n })}">d${n}</button>`).join('');
  rad.querySelectorAll('.terning-type-knapp').forEach(btn => {
    btn.onclick = () => settTerningType(Number(btn.dataset.sider));
  });
}

// Kaster terningene. Selve resultatet trekkes FØRST, og animasjonen viser bare
// tilfeldige mellomverdier på veien — da kan et avbrutt kast aldri endre utfallet.
function kastTerning() {
  if (!document.getElementById('terning-flater')) return;
  if (terningAnimasjon) clearInterval(terningAnimasjon);

  const antall = state.terning_antall;
  const sider  = state.terning_type;
  const fasit  = Array.from({ length: antall }, () => trilleTall(sider));

  // Noen blir kvalme av bevegelse på skjerm, og nettleseren vet hvem. Da lander
  // kastet med én gang i stedet for å trille.
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
    landTerning(fasit);
    return;
  }

  let igjen = 8; // 8 bilder à 60 ms ≈ et halvt sekund
  terningAnimasjon = setInterval(() => {
    if (--igjen <= 0) {
      clearInterval(terningAnimasjon);
      terningAnimasjon = null;
      landTerning(fasit);
      return;
    }
    renderTerninger(Array.from({ length: antall }, () => trilleTall(sider)), true);
  }, 60);
}

// Lagrer og viser det endelige kastet. Kastet huskes, så kortet står med forrige
// resultat i stedet for tomt etter en omlasting.
function landTerning(verdier) {
  state.terning_kast = verdier;
  saveState();
  renderTerninger(verdier, false);
}

// Bytter terningtype og kaster på nytt med en gang. Et gammelt resultat kan være
// ugyldig for den nye typen (en 17-er hører ikke hjemme på en d6), og en tom flate
// ser ødelagt ut — så et friskt kast er den eneste tilstanden som alltid stemmer.
// Oppsett-endringer lander uten animasjon; det er bare Kast-knappen som skal ha drama.
function settTerningType(sider) {
  state.terning_type = sider;
  renderTerningType();
  landTerning(Array.from({ length: state.terning_antall }, () => trilleTall(sider)));
}

// Endrer antall terninger innenfor 1…MAKS_TERNINGER og kaster på nytt.
function endreTerningAntall(delta) {
  const ny = Math.max(1, Math.min(MAKS_TERNINGER, state.terning_antall + delta));
  if (ny === state.terning_antall) return;
  state.terning_antall = ny;
  landTerning(Array.from({ length: ny }, () => trilleTall(state.terning_type)));
}

// Kobler opp knappene og tegner kortet slik det sto ved forrige besøk.
function setupTerning() {
  const kast = document.getElementById('btn-terning-kast');
  if (!kast) return;
  kast.onclick = kastTerning;
  document.getElementById('btn-terning-minus').onclick = () => endreTerningAntall(-1);
  document.getElementById('btn-terning-pluss').onclick = () => endreTerningAntall(+1);

  renderTerningType();
  // Har vi ikke et lagret kast som passer antallet (helt ny bruker, eller importert
  // fil), trilles et friskt et så kortet aldri står tomt.
  const lagret = state.terning_kast.length === state.terning_antall
    ? state.terning_kast
    : Array.from({ length: state.terning_antall }, () => trilleTall(state.terning_type));
  renderTerninger(lagret, false);
}

// ===================== Klokke =====================
// Tegner strekene og tallene på urskiven. Kjøres én gang ved oppstart — merkene står
// stille, det er bare viserne som beveger seg. 60 minuttstreker, der hver femte er
// lengre og tykkere (timemarkering), pluss tallene 1–12.
// Viser valgt klokkevisning: data-visning på kortet styrer hva som skjules (CSS), og
// overskrifta viser navnet på visningen.
function visKlokkeVisning() {
  const card = document.getElementById('card-klokke');
  card.dataset.visning = state.klokke_visning;
  document.getElementById('btn-klokke-visning').textContent = t(KLOKKE_VISNING_NAVN[state.klokke_visning]);
}

// Går videre til neste visning. Høyden tilpasses den nye visningen hvis læreren ikke
// selv har satt størrelsen (digital alene trenger mye mindre plass enn begge), og
// innholdet skaleres på nytt til å fylle kortet.
function byttKlokkeVisning() {
  const i = KLOKKE_VISNINGER.indexOf(state.klokke_visning);
  state.klokke_visning = KLOKKE_VISNINGER[(i + 1) % KLOKKE_VISNINGER.length];
  visKlokkeVisning();
  const w = aktivSide().widget_layout.find(x => x.id === 'card-klokke');
  if (w) tilpassHøyde(w);
  skalerInnhold(document.querySelector('#card-klokke .kl-skaler'));
  saveState();
}

function setupKlokke() {
  const merker = document.getElementById('klokke-merker');
  const tall   = document.getElementById('klokke-tall');
  if (!merker || !tall) return;

  // Regner om «grader rundt urskiven» til x/y i SVG-ens koordinatsystem (0–100 med
  // sentrum i 50,50). Minus 90 grader fordi 0° skal peke rett opp, ikke mot høyre.
  const punkt = (grader, radius) => {
    const rad = (grader - 90) * Math.PI / 180;
    return [50 + radius * Math.cos(rad), 50 + radius * Math.sin(rad)];
  };

  merker.innerHTML = Array.from({ length: 60 }, (_, i) => {
    const erTime = i % 5 === 0;
    const [x1, y1] = punkt(i * 6, erTime ? 38.5 : 42);
    const [x2, y2] = punkt(i * 6, 45);
    return `<line class="klokke-merke${erTime ? ' time' : ''}" x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}" />`;
  }).join('');

  tall.innerHTML = Array.from({ length: 12 }, (_, i) => {
    const [x, y] = punkt((i + 1) * 30, 30);
    return `<text class="klokke-tall" x="${x.toFixed(2)}" y="${y.toFixed(2)}">${i + 1}</text>`;
  }).join('');
}

// Setter de tre viserne og den digitale tiden. Kjøres hvert sekund fra init().
// Time- og minuttviseren beveger seg jevnt (minutter og sekunder regnes inn i
// vinkelen), slik at klokka viser riktig også mellom hele minutter — en timeviser
// som står bom på 9 når klokka er 09:55 er nettopp det elevene lærer å lese feil.
function oppdaterKlokke() {
  const d = new Date();
  // Ikke kall variabelen t: det er navnet på oversettelsesfunksjonen t().
  const tim = d.getHours(), m = d.getMinutes(), s = d.getSeconds();

  const digital = document.getElementById('klokke-digital');
  if (!digital) return; // kortet er slått av for denne siden
  digital.textContent = `${String(tim).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

  settViser('klokke-viser-time',   (tim % 12) * 30 + m * 0.5);
  settViser('klokke-viser-minutt', m * 6 + s * 0.1);
  settViser('klokke-viser-sekund', s * 6);
}

// Roterer én viser til gitt vinkel (grader fra klokka 12) rundt urskivens sentrum.
function settViser(id, grader) {
  const el = document.getElementById(id);
  if (el) el.setAttribute('transform', `rotate(${grader} 50 50)`);
}

// ===================== Sted for vær og pollen =====================
// Ber nettleseren om brukerens posisjon og gjør koordinatene om til et stedsnavn.
// Kalles bare når læreren ber om det: 📍 Bruk min posisjon i vær-vinduet, eller knappen
// i velkomstmeldingen. Appen spør aldri ved oppstart, og posisjonen lagres i stedet for
// å slås opp på nytt hver gang. `påBegjæring` styrer om det gis beskjed underveis.
//
// Viktige forbehold, i den rekkefølgen de slår til:
//  - Posisjon krever «secure context». Åpner du index.html rett fra maskinen (file://)
//    er API-et utilgjengelig, og vi blir stående på det stedet vi allerede har.
//  - Brukeren kan si nei. Da beholder vi forrige sted i stedet for å mase.
//  - Har brukeren selv søkt opp et sted (kilde 'valgt'), rører vi det ikke ved oppstart.
async function hentPosisjon(påBegjæring = false) {
  if (!påBegjæring && værSted().kilde === 'valgt') return;

  if (!navigator.geolocation || !window.isSecureContext) {
    if (påBegjæring) {
      notify(t('Posisjon krever at siden åpnes over https (eller localhost)'), 'warning');
    }
    return;
  }

  try {
    const pos = await new Promise((ok, nei) =>
      navigator.geolocation.getCurrentPosition(ok, nei, { timeout: 8000, maximumAge: 600_000 }));
    const lat = rundPosisjon(pos.coords.latitude);
    const lon = rundPosisjon(pos.coords.longitude);
    state.vær_sted = { navn: await stedsnavnFor(lat, lon), lat, lon, kilde: 'posisjon' };
    saveState();
    if (påBegjæring) notify(t('Værvarsel hentes nå for {sted}', { sted: state.vær_sted.navn }));
    await hentVær();
  } catch (_) {
    // Avslag, tidsavbrudd eller ingen posisjonstjeneste — vi blir der vi er.
    if (påBegjæring) notify(t('Fikk ikke tak i posisjonen din'), 'warning');
  }
}

// Slår opp hvilket sted et koordinatpar ligger i, slik at vi kan vise et navn i stedet
// for tall. Bruker BigDataCloud sitt åpne klient-endepunkt (ingen nøkkel). Feiler det,
// faller vi tilbake til en nøytral etikett — været virker uansett, siden det er
// koordinatene og ikke navnet som sendes til met.no.
async function stedsnavnFor(lat, lon) {
  try {
    const d = await hentJson(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=no`);
    return d.city || d.locality || d.principalSubdivision || t('Min posisjon');
  } catch (_) {
    return t('Min posisjon');
  }
}

// Søker opp stedsnavnet brukeren skrev inn i vær-popupen og lister treffene som
// klikkbare rader. Treffene mellomlagres i `stedsTreff` og radene refererer til dem med
// indeks — da slipper vi å bake stedsnavn inn i onclick-attributter, der en apostrof
// ville brutt markupen.
async function søkSted() {
  const navn  = document.getElementById('input-vær-sted').value.trim();
  const treff = document.getElementById('vær-sted-treff');
  if (!navn) return;

  treff.innerHTML = `<div class="vær-sted-tom">${t('Søker…')}</div>`;
  try {
    const data = await hentJson(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(navn)}&count=6&language=no&format=json`
    );
    stedsTreff = data.results ?? [];
    if (!stedsTreff.length) {
      treff.innerHTML = `<div class="vær-sted-tom">${t('Fant ingen steder med det navnet')}</div>`;
      return;
    }
    treff.innerHTML = stedsTreff.map((r, i) => {
      // Fylke og land som undertekst, så «Eidsvoll» i Akershus er lett å skille fra
      // et likelydende sted i utlandet.
      const under = [r.admin1, r.country].filter(Boolean).join(', ');
      return `<button class="vær-sted-treff-rad" data-i="${i}">
                <strong>${esc(r.name)}</strong><span>${esc(under)}</span>
              </button>`;
    }).join('');
    treff.querySelectorAll('.vær-sted-treff-rad').forEach(btn => {
      btn.onclick = () => velgSted(stedsTreff[Number(btn.dataset.i)]);
    });
  } catch (_) {
    treff.innerHTML = `<div class="vær-sted-tom">${t('Søket feilet — sjekk nettforbindelsen')}</div>`;
  }
}

// Lagrer et sted brukeren selv har søkt opp. Merkes 'valgt', slik at posisjonsoppslaget
// ved neste oppstart ikke overstyrer det.
function velgSted(r) {
  if (!r) return;
  state.vær_sted = {
    navn:  r.name,
    lat:   rundKoordinat(r.latitude),
    lon:   rundKoordinat(r.longitude),
    kilde: 'valgt',
  };
  saveState();
  notify(t('Værvarsel hentes nå for {sted}', { sted: state.vær_sted.navn }));
  hentVær();
}

// ===================== Students =====================
// Gjør første bokstav i hvert ord stor: «kari nordmann» → «Kari Nordmann».
// NB: \b duger ikke her — den er ASCII-basert, så æ/ø/å teller som ordgrense og
// «håkon» ble til «HåKon». Vi matcher derfor en bokstav som enten står først i
// strengen eller rett etter et tegn som ikke er en bokstav (mellomrom, bindestrek,
// apostrof) — da holder «Anne-Marie» og «O'Brien», mens «Håkon» får være i fred.
function storForbokstav(navn) {
  return navn.trim().replace(/(^|[^\p{L}\p{M}])(\p{L})/gu, (_, før, bokstav) => før + bokstav.toUpperCase());
}

// Navnet til eleven med id-en, på aktiv side eller siden `s`. Tom tekst hvis eleven
// ikke finnes. Alt som viser et trukket navn, en gruppe eller et par, går via denne.
function elevNavn(id, s = aktivSide()) {
  return s.elever.find(e => e.id === id)?.navn ?? '';
}

// Legger en elev til den aktive sidens roster. Returnerer true ved suksess, false
// hvis lista er full eller navnet allerede finnes (kaller-koden bruker det til å
// avgjøre om modalen skal lukkes). Re-rendrer elevliste og trekk etterpå.
function leggTilElev(navn) {
  navn = storForbokstav(navn);
  if (!navn) return;
  const s = aktivSide();
  if (s.elever.length >= 35) {
    notify(t('Klasselisten er full (maks 35 elever)'), 'warning');
    return false;
  }
  if (s.elever.some(e => e.navn.toLowerCase() === navn.toLowerCase())) {
    notify(t('{navn} er allerede inne', { navn }), 'warning');
    return false;
  }
  const elev = { id: nyElevId(new Set(s.elever.map(e => e.id))), navn };
  s.elever = [...s.elever, elev];
  const gruppe = plasserIGruppe(elev.id); // null hvis det ikke finnes grupper
  saveState();
  renderElever();
  renderAlleTrekk();
  if (gruppe === null) {
    notify(t('✓ {navn} lagt til', { navn }));
  } else if (gruppe === -1) {
    notify(t('{navn} er lagt til, men passer ikke i noen gruppe uten å bryte en begrensning. Del inn på nytt.', { navn }), 'warning');
  } else {
    renderGrupper();
    notify(t('✓ {navn} lagt til i gruppe {n}', { navn, n: gruppe + 1 }));
  }
  return true;
}

// Setter en elev (id) inn i gruppeinndelingen som allerede finnes, uten å stokke de
// andre: i den minste gruppen, så gruppene holder seg jevne. Er flere like små,
// velges en av dem tilfeldig. Grupper der eleven ville brutt en «hold fra
// hverandre»-begrensning, hoppes over.
// Returnerer gruppeindeksen, -1 hvis ingen gruppe passer (eleven står da utenfor),
// eller null hvis siden ikke har grupper.
function plasserIGruppe(id) {
  const s = aktivSide();
  if (!s.grupper?.length) return null;
  const sperret = new Set(aktivePar(s)
    .filter(par => par.includes(id))
    .map(([a, b]) => (a === id ? b : a)));
  const lovlige = s.grupper
    .map((g, i) => ({ i, størrelse: g.length, ok: !g.some(n => sperret.has(n)) }))
    .filter(g => g.ok);
  if (!lovlige.length) return -1;
  const minst = Math.min(...lovlige.map(g => g.størrelse));
  const kandidater = lovlige.filter(g => g.størrelse === minst);
  const valgt = kandidater[Math.floor(Math.random() * kandidater.length)].i;
  s.grupper[valgt] = [...s.grupper[valgt], id];
  return valgt;
}

// «🧹 Tøm» i elevkortet: tømmer siden for elever så læreren kan starte en ny klasse.
// Grupper, oppmøte og koblingen til lista forsvinner med elevene. Den lagrede lista
// røres ikke, og trekkene dens blir liggende i den til den lastes igjen. Elever som
// ikke er lagret i en liste, er borte etterpå: derfor sier bekreftelsen fra om det.
function tømElevlista() {
  const s = aktivSide();
  s.elever  = [];
  s.grupper = null;
  s.oppmøte = null;
  s.gruppe_begrensninger = [];
  s.liste   = null;
  tømSidensTrekk(s);
  saveState();
  renderElever();
  renderAlleTrekk();
  renderGrupper();
  renderBegrensninger();
  notify(t('🧹 Elevlista er tømt'));
}

// Er elevene på siden lagret akkurat slik i lista siden er koblet til?
function elevlistaErLagret(s = aktivSide()) {
  const liste = sidensListe(s);
  if (!liste) return false;
  const lagret = state.lister[liste];
  return lagret.length === s.elever.length &&
    lagret.every((e, i) => e.id === s.elever[i].id && e.navn === s.elever[i].navn);
}

// Fjerner én elev ved listeindeks fra aktiv side og oppdaterer visningen.
function fjernElev(idx) {
  const elev = aktivSide().elever[idx];
  if (elev) fjernEleverBatch(new Set([elev.id]));
}

// Fjerner flere elever (et Set med id-er) på én gang, og alt som pekte på dem.
// Brukes av ✕ i lista og av «Fjern elever»-modalen.
function fjernEleverBatch(fjernSett) {
  const s = aktivSide();
  s.elever = s.elever.filter(e => !fjernSett.has(e.id));
  // Er siden koblet til en liste, deler den trekkene med andre sider som bruker lista.
  // Elever som fortsatt står i lista, beholder turen sin der (en side kan være en
  // mindre gruppe av klassen). Trekkene ryddes når lista selv oppdateres (🔄) eller
  // eleven tas ut av den. Elever som ikke står i lista, ryddes med en gang.
  const liste = sidensListe(s);
  if (liste) {
    const iLista = new Set(state.lister[liste].map(e => e.id));
    fjernElevReferanser(s, fjernSett, { medTrekk: false });
    const utenfor = new Set([...fjernSett].filter(id => !iLista.has(id)));
    if (utenfor.size) {
      const r = trekk(s);
      Object.assign(r, kopierTrekk(r, id => !utenfor.has(id)));
    }
  } else {
    fjernElevReferanser(s, fjernSett);
  }
  saveState();
  renderElever();
  renderAlleTrekk();
  renderGrupper();
  renderBegrensninger();
}

// Tar elever (id-er) ut av alt på siden som pekte på dem: grupper, backlogs, trukne,
// «hold fra hverandre»-par og dagens oppmøte. Grupper som blir tomme, forsvinner, og
// er det ingen grupper igjen, er inndelingen borte. De andre elevene blir der de er.
// Lagrer ikke selv: kalleren gjør det.
function fjernElevReferanser(s, fjernSett, { medTrekk = true } = {}) {
  const behold = id => !fjernSett.has(id);
  if (s.grupper) {
    const igjen = s.grupper.map(g => g.filter(behold)).filter(g => g.length);
    s.grupper = igjen.length ? igjen : null;
  }
  if (medTrekk) {
    const r = trekk(s);
    Object.assign(r, kopierTrekk(r, behold));
  }
  s.gruppe_begrensninger = (s.gruppe_begrensninger ?? []).filter(par => par.every(behold));
  if (s.oppmøte) for (const id of fjernSett) delete s.oppmøte.status[id];
}

// Bytter id-er i alt på siden som peker på elever, etter et kart gammel id → ny id.
// Brukes når en lagret liste lastes inn: samme elev kan ha en annen id i lista enn på
// siden (lista og siden ble gjort om hver for seg i v2.37, eller eleven ble lagt til
// for hånd på begge). Da skal gruppene og parene følge eleven, slik de gjorde da
// navnet var nøkkelen. Trekkene byttes av lastListe selv. Lagrer ikke selv.
function byttElevIder(s, kart) {
  const bytt = id => kart.get(id) ?? id;
  if (s.grupper) s.grupper = s.grupper.map(g => g.map(bytt));
  s.gruppe_begrensninger = (s.gruppe_begrensninger ?? []).map(par => par.map(bytt));
}

// ===================== Oppmøte =====================
// Hver elev kan markeres «her» eller «borte» for dagen. Bare «borte» har en virkning:
// de elevene er ute av alle trekk og nye gruppeinndelinger. Umarkert og «her» teller
// likt, så appen virker som før til læreren markerer noen som borte. Markeringene
// lagres med dagens dato og gjelder bare den dagen: neste dag er alle umarkert igjen.
// En ferdig gruppeinndeling røres ikke, men elever som er borte, vises nedtonet i den.

// Dagens dato i lokal tid som 'ÅÅÅÅ-MM-DD'. Ikke toISOString(), som gir UTC og
// dermed feil dag mellom midnatt og kl. 01/02 norsk tid.
function dagensDato() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Vasker et lagret oppmøte-felt. Alt som ikke er gyldig, blir null (ingen markert).
// tilId gjør nøklene om til elev-id-er (gamle data brukte navnet) og forkaster elever
// som ikke finnes. Brukes av normaliserState(), så den må ikke lene seg på konstanter
// lenger ned.
function normaliserOppmøte(o, tilId) {
  if (!erObjekt(o) || typeof o.dato !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(o.dato) ||
      !erObjekt(o.status)) return null;
  const status = {};
  for (const [ref, verdi] of Object.entries(o.status)) {
    const id = tilId(ref);
    if (id && (verdi === 'her' || verdi === 'borte')) status[id] = verdi;
  }
  return { dato: o.dato, status };
}

// Dagens statusoppslag for siden (elev-id → 'her' | 'borte'). Er lagret oppmøte fra en
// annen dag, starter vi blankt. Det skrives til lagring neste gang noe lagres.
function oppmøteIdag(s) {
  const idag = dagensDato();
  if (!s.oppmøte || s.oppmøte.dato !== idag) s.oppmøte = { dato: idag, status: {} };
  return s.oppmøte.status;
}

// Id-ene til elevene som er med i trekk og nye grupper: alle som ikke er markert
// borte i dag. Trekkene og backlogene jobber med id-er; navnet slås opp ved visning.
function tilStede(s) {
  const status = oppmøteIdag(s);
  return s.elever.filter(e => status[e.id] !== 'borte').map(e => e.id);
}

// Trykk på «her» eller «borte» for eleven ved idx. Trykker du på den som alt er
// valgt, blir eleven umarkert igjen. Gruppene tegnes på nytt for nedtoningen.
function settOppmøte(idx, verdi) {
  const s = aktivSide();
  const elev = s.elever[idx];
  if (!elev || (verdi !== 'her' && verdi !== 'borte')) return;
  const { id, navn } = elev;
  const status = oppmøteIdag(s);
  const varBorte = status[id] === 'borte';
  if (status[id] === verdi) delete status[id];
  else status[id] = verdi;
  // Kommer en elev tilbake etter å ha vært borte da gruppene ble laget, står eleven
  // utenfor alle grupper. Da plasseres eleven på samme måte som en ny elev: i den
  // minste gruppa, uten å bryte «hold fra hverandre». Elever som var med i en gruppe
  // fra før, blir bare der de er.
  let gruppe = null;
  if (varBorte && status[id] !== 'borte' && s.grupper?.length &&
      !s.grupper.some(g => g.includes(id))) {
    gruppe = plasserIGruppe(id);
  }
  saveState();
  renderElever();
  renderGrupper();
  if (gruppe === -1) {
    notify(t('{navn} er her, men passer ikke i noen gruppe uten å bryte en begrensning. Del inn på nytt.', { navn }), 'warning');
  } else if (gruppe !== null) {
    notify(t('✓ {navn} er her og er lagt i gruppe {n}', { navn, n: gruppe + 1 }));
  }
}

// Tegner elevlista på nytt: teller, tom-tilstand, og én rad per elev. Elever som
// er fordelt i en gruppe får gruppens farge + en prikk, så listen og gruppe-kortene
// matcher visuelt. Kalles etter enhver endring i roster eller grupper.
function renderElever() {
  const s = aktivSide();
  const liste   = document.getElementById('elev-liste');
  const antall  = s.elever.length;

  const status = oppmøteIdag(s);
  const antallBorte = s.elever.filter(e => status[e.id] === 'borte').length;
  document.getElementById('elev-antall').textContent = antall;
  document.getElementById('elev-tekst').textContent  = antall === 1 ? t('elev inne') : t('elever inne');
  const borteEl = document.getElementById('elev-borte');
  borteEl.textContent = antallBorte ? t('· {antall} borte i dag', { antall: antallBorte }) : '';
  borteEl.classList.toggle('hidden', !antallBorte);

  if (!antall) {
    liste.innerHTML = `<p class="tom-tekst">${t('Ingen elever inne ennå.')}<br>${t('Trykk "+ Legg til elev" for å starte.')}</p>`;
    return;
  }

  // Bygg oppslag: elev-id → gruppeindeks, så vi raskt kan finne fargen per elev under.
  const gruppeKart = new Map();
  if (s.grupper) {
    s.grupper.forEach((g, gi) => g.forEach(id => gruppeKart.set(id, gi)));
  }

  liste.innerHTML = s.elever.map(({ id, navn }, i) => {
    const gi        = gruppeKart.get(id);
    const harGruppe = gi !== undefined;
    const farge     = harGruppe ? GRUPPE_FARGER[gi % GRUPPE_FARGER.length] : null;
    // Eleven som redigeres viser et skrivefelt i stedet for navnet. Enter og «mistet
    // fokus» lagrer, Esc avbryter. Ellers: et klikkbart navn som åpner redigeringen.
    const navnHtml = i === redigerElevIdx
      ? `<input class="elev-rediger-input" type="text" maxlength="60" value="${esc(navn)}"
            data-rediger="elev" data-idx="${i}">`
      : `<span class="elev-navn${harGruppe ? ' gruppe-farget' : ''}"${harGruppe ? ` style="--gf:${farge}"` : ''} data-klikk="rediger-elev" data-idx="${i}" title="${t('Klikk for å redigere')}">${esc(navn)}</span>`;
    // Oppmøteknappene: aria-pressed forteller skjermlesere og CSS hvilken som er valgt.
    const st = status[id];
    const klasse = st === 'borte' ? ' er-borte' : st === 'her' ? ' er-her' : '';
    return `
      <div class="elev-item${klasse}">
        <span class="elev-nr">${i + 1}.</span>
        ${harGruppe ? `<span class="elev-dot gruppe-farget" style="--gf:${farge}"></span>` : ''}
        ${navnHtml}
        <span class="elev-oppmøte">
          <button class="oppmøte-knapp oppmøte-her" data-klikk="oppmøte" data-status="her" data-idx="${i}"
            aria-pressed="${st === 'her'}" title="${t('{navn} er her i dag', { navn: esc(navn) })}">✓</button>
          <button class="oppmøte-knapp oppmøte-borte" data-klikk="oppmøte" data-status="borte" data-idx="${i}"
            aria-pressed="${st === 'borte'}" title="${t('{navn} er borte i dag', { navn: esc(navn) })}">−</button>
        </span>
        <button class="elev-slett" data-klikk="fjern-elev" data-idx="${i}" title="${t('Fjern {navn}', { navn: esc(navn) })}">✕</button>
      </div>`;
  }).join('');
  // Etter at lista er tegnet: fokuser redigeringsfeltet og marker teksten, så læreren
  // kan skrive rett over eller rette en typo uten å klikke i feltet først.
  if (redigerElevIdx !== null) {
    const inp = liste.querySelector('.elev-rediger-input');
    if (inp) { inp.focus(); inp.select(); }
  }
  oppdaterBegrensningSelecter();
}

// Indeksen til eleven som redigeres inline akkurat nå (null = ingen redigering pågår).
// renderElever leser denne for å bytte navnet ut med et skrivefelt.
let redigerElevIdx = null;

// Starter inline-redigering av elev nr. idx og tegner lista på nytt (renderElever
// fokuserer feltet). Ingen guard her: klikker du rett fra én elev til en annen, har
// blur allerede lagret den forrige.
function startRedigerElev(idx) {
  redigerElevIdx = idx;
  renderElever();
}

// Lagrer et redigert elevnavn. Guarden mot null gjør det andre kallet til en no-op —
// både blur som fyrer rett etter Enter, og blur som fyrer etter at vi alt har avbrutt.
function lagreRedigerElev(idx, verdi) {
  if (redigerElevIdx === null) return;
  redigerElevIdx = null;
  endreElevNavn(idx, verdi);
}

// Avbryter redigeringen uten å lagre og tegner lista tilbake til normal visning.
function avbrytRedigerElev() {
  if (redigerElevIdx === null) return;
  redigerElevIdx = null;
  renderElever();
}

// Endrer navnet på eleven ved idx. Samme normalisering (trim + stor forbokstav) og
// duplikat-sjekk som ved ny elev. Tomt eller uendret navn avbryter stille. Grupper,
// backlogs, par og oppmøte peker på elevens id, så de følger med av seg selv.
function endreElevNavn(idx, nyttNavn) {
  const s = aktivSide();
  const elev = s.elever[idx];
  if (!elev) { renderElever(); return; }
  nyttNavn = storForbokstav(nyttNavn);
  if (!nyttNavn || nyttNavn === elev.navn) { renderElever(); return; }
  if (s.elever.some((e, i) => i !== idx && e.navn.toLowerCase() === nyttNavn.toLowerCase())) {
    notify(t('{navn} er allerede inne', { navn: nyttNavn }), 'warning');
    renderElever();
    return;
  }
  s.elever = s.elever.map((e, i) => i === idx ? { ...e, navn: nyttNavn } : e);
  saveState();
  renderElever();
  renderAlleTrekk();
  renderGrupper();
  renderBegrensninger();
  notify(t('✓ Endret til {navn}', { navn: nyttNavn }));
}

// Returnerer en stokket KOPI av arrayet (originalen røres ikke) med Fisher–Yates:
// gå bakfra og bytt hvert element med et tilfeldig element til venstre for det.
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ===================== Draws =====================
// Alle trekk velger bare blant elevene som er til stede (se «Oppmøte»). Er ingen
// til stede, sier denne fra med riktig grunn og returnerer null.
function trekkbareElever(s) {
  const elever = tilStede(s);
  if (elever.length) return elever;
  notify(s.elever.length ? t('Alle elevene er markert borte i dag') : t('Ingen elever inne'), 'error');
  return null;
}

// Melding når backlogen til «Trekk (bl)» er brukt opp. Står noen som er borte i dag igjen, er det
// verdt å si: de er ikke glemt, de venter til de er tilbake.
function backlogTomMelding(s, backlog, tekstAlle) {
  const borteIgjen = s.elever.some(e => !backlog.includes(e.id));
  notify(borteIgjen ? t('Alle som er her i dag, er trukket. Trykk 🔄 på kortet for å starte på nytt.') : tekstAlle, 'warning');
}

// Enkelt tilfeldig trekk: velg én elev. Eneste regel er at man ikke trekker
// samme elev to ganger på rad (med mindre det bare er én elev inne).
// Backlog og trukket for ett Tilfeldig elev-kort. Det første kortet («card-tilfeldig»)
// bruker de gamle feltene, kopiene hvert sitt felt i tilfeldig_flere. Begge deler
// ligger i trekk(s), så de følger klasselista.
function tilfeldigTilstand(r, kort) {
  if (kort === 'card-tilfeldig') {
    return {
      get backlog() { return r.tilfeldig_backlog; }, set backlog(v) { r.tilfeldig_backlog = v; },
      get valgt() { return r.tilfeldig_valgt; },     set valgt(v) { r.tilfeldig_valgt = v; },
    };
  }
  r.tilfeldig_flere ??= {};
  return (r.tilfeldig_flere[kort] ??= { backlog: [], valgt: null });
}

// Kortet r og R gjelder: Tilfeldig elev-kortet musa er over, ellers det første.
// Kortet r og R gjelder: Tilfeldig elev-kortet musa er over, ellers det første synlige
// på siden. Er ingen synlige, null (hurtigtasten sier fra).
function aktivtTilfeldigKort() {
  const side = aktivSide();
  const synlig = id => side.widget_layout.some(w => w.id === id) && !(side.widget_hidden ?? []).includes(id);
  if (sistPekerKort && kortType(sistPekerKort) === 'tilfeldig' && synlig(sistPekerKort)) return sistPekerKort;
  return ['card-tilfeldig', ...side.widget_layout.map(w => w.id)].find(id => kortType(id) === 'tilfeldig' && synlig(id)) ?? null;
}

function trekkTilfeldig(kort = 'card-tilfeldig') {
  const s = aktivSide();
  const x = tilfeldigTilstand(trekk(s), kort);
  const elever = trekkbareElever(s);
  if (!elever) return;
  // Utelat forrige trukne fra utvalget, så vi ikke får samme navn igjen umiddelbart.
  const pool = elever.length > 1
    ? elever.filter(e => e !== x.valgt)
    : elever;
  x.valgt = pool[Math.floor(Math.random() * pool.length)];
  saveState();
  renderTilfeldig(kort);
}

// «Rettferdig» tilfeldig trekk: hver elev trekkes nøyaktig én gang før noen
// gjentas. Backlogen husker hvem som alt er trukket; når alle er brukt opp må
// læreren tømme den (🔄 på kortet). Forskjellen fra trekkTilfeldig er nettopp denne
// sporingen.
function trekkTilfeldigBacklog(kort = 'card-tilfeldig') {
  const s = aktivSide();
  const x = tilfeldigTilstand(trekk(s), kort);
  const elever = trekkbareElever(s);
  if (!elever) return;
  // Trekk kun blant elever som ikke alt står i backlogen.
  const pool = elever.filter(e => !x.backlog.includes(e));
  if (!pool.length) {
    backlogTomMelding(s, x.backlog, t('Alle elever er trukket. Trykk 🔄 på kortet for å starte på nytt.'));
    return;
  }
  x.valgt = pool[Math.floor(Math.random() * pool.length)];
  if (!x.backlog.includes(x.valgt)) x.backlog.push(x.valgt);
  saveState();
  renderTilfeldig(kort);
}

// Trekker `antall` elever blant dem som er her (`elever`), i runder: alle får tur før
// noen får igjen. Brukes av ordenselev og klassebamsen, som aldri stopper:
//  1. Elever som skylder en tur, trekkes først.
//  2. Så elever som ikke har hatt tur i denne runden (ikke i backlogen).
//  3. Mangler det fortsatt elever, er runden ferdig. Backlogen tømmes, og resten
//     trekkes blant alle som er her. Den eller de som nettopp ble trukket som de siste
//     i den gamle runden, telles med i den nye, så de ikke får to turer på rad.
//     Elever som ikke rakk å få tur i den gamle runden (de var borte, eller de var
//     sperret av et par), settes på «skylder»-lista, så de ikke mister turen.
// `passer(valgte, id)` sier om id kan trekkes sammen med de som alt er valgt (brukes
// for «hold fra hverandre»-par). Går det ikke å oppfylle, trekkes det uten den
// regelen, så trekket aldri stopper.
// Endrer r (trekkene) og returnerer { valgt, nyRunde }.
function trekkRunde(r, s, backlogFelt, skyldFelt, antall, elever, passer = () => true) {
  const valgt = [];
  const ta = (kandidater, n, regel = passer) => {
    const ut = [];
    for (const id of shuffle(kandidater)) {
      if (ut.length >= n) break;
      if (regel([...valgt, ...ut], id)) ut.push(id);
    }
    return ut;
  };
  const skyldige = ta(elever.filter(id => r[skyldFelt].includes(id)), antall);
  r[skyldFelt] = r[skyldFelt].filter(id => !skyldige.includes(id));
  valgt.push(...skyldige);
  const fraRunden = ta(elever.filter(id => !r[backlogFelt].includes(id) && !valgt.includes(id)),
    antall - valgt.length);
  valgt.push(...fraRunden);
  r[backlogFelt].push(...fraRunden);
  if (valgt.length >= antall) return { valgt, nyRunde: false };

  const utenTur = s.elever.map(e => e.id).filter(id =>
    !valgt.includes(id) && !r[backlogFelt].includes(id) && !r[skyldFelt].includes(id));
  r[skyldFelt].push(...utenTur);
  // Var det én elev igjen i runden (ingen sperret), telles den med i den nye runden,
  // så den ikke blir ordenselev to ganger på rad. Ble noen sperret av et par, telles
  // den ikke med: da får den sperrede en ekstra tur som skyldig, og den andre ville
  // mistet en tur hver gang det skjer.
  const sperret = utenTur.some(id => elever.includes(id));
  r[backlogFelt] = sperret ? [] : [...fraRunden];
  let resten = ta(elever.filter(id => !valgt.includes(id) && !utenTur.includes(id)), antall - valgt.length);
  if (valgt.length + resten.length < antall) {
    // Bare elever som skylder eller er sperret er igjen: ta dem heller enn å stoppe.
    resten = [...resten, ...ta(elever.filter(id => !valgt.includes(id) && !resten.includes(id)),
      antall - valgt.length - resten.length)];
    r[skyldFelt] = r[skyldFelt].filter(id => !resten.includes(id));
  }
  if (valgt.length + resten.length < antall) {
    resten = [...resten, ...ta(elever.filter(id => !valgt.includes(id) && !resten.includes(id)),
      antall - valgt.length - resten.length, () => true)];
    r[skyldFelt] = r[skyldFelt].filter(id => !resten.includes(id));
  }
  valgt.push(...resten);
  r[backlogFelt].push(...resten.filter(id => !r[backlogFelt].includes(id)));
  return { valgt, nyRunde: true };
}

// Trekker én eller to ordenselever (r.ordenselev_antall, valgt per liste), og sørger
// for at alle har vært ordenselev før noen gjentas. Når alle har hatt tur, starter en
// ny runde av seg selv (se trekkRunde). To elever som skal holdes fra hverandre i
// grupper (aktivePar), blir heller ikke ordenselever sammen.
function trekkOrdenselev() {
  const s = aktivSide();
  const r = trekk(s);
  const elever = tilStede(s);
  const antall = r.ordenselev_antall;
  if (!elever.length && antall === 1) {
    notify(s.elever.length ? t('Alle elevene er markert borte i dag') : t('Ingen elever inne'), 'error');
    return;
  }
  if (elever.length < antall) {
    notify(elever.length < s.elever.length
      ? t('Trenger minst 2 elever som er her i dag ({antall} her)', { antall: elever.length })
      : t('Trenger minst 2 elever ({antall} inne)', { antall: s.elever.length }), 'error');
    return;
  }
  const par = aktivePar(s);
  const passer = (valgte, id) => !valgte.some(v => par.some(([a, b]) => (a === v && b === id) || (a === id && b === v)));
  const { valgt, nyRunde } = trekkRunde(r, s, 'ordenselev_backlog', 'ordenselev_skyldig', antall, elever, passer);
  r.ordenselev_valgte = valgt;
  saveState();
  renderOrdenselev();
  if (nyRunde) notify(t('⭐ Alle har vært ordenselev. Ny runde!'));
}

// 👥/👤 i Ordenselever-kortet: bytter mellom to og én ordenselev per trekk. Valget
// hører til lista (som trekkene), så 7A kan ha én og 8B to.
function byttOrdenselevAntall() {
  const r = trekk();
  r.ordenselev_antall = r.ordenselev_antall === 1 ? 2 : 1;
  saveState();
  renderOrdenselev();
  notify(r.ordenselev_antall === 1 ? t('⭐ Én ordenselev per trekk') : t('⭐ To ordenselever per trekk'));
}

// Trekker hvem som får ta med klassebamsen («ulv») hjem. Alle får tur før noen
// gjentas, og en ny runde starter av seg selv (se trekkRunde). Navnet på bamsen kan
// endres per side (s.ulv_navn).
function trekkUlv() {
  const s = aktivSide();
  const r = trekk(s);
  const elever = trekkbareElever(s);
  if (!elever) return;
  const { valgt, nyRunde } = trekkRunde(r, s, 'ulv_backlog', 'ulv_skyldig', 1, elever);
  r.ulv_valgt = valgt[0];
  saveState();
  renderUlv();
  const bamse = s.ulv_navn.toLowerCase();
  const elev  = elevNavn(r.ulv_valgt, s);
  notify(nyRunde
    ? t('Alle har hatt {bamse}. Ny runde: {elev} tar med {bamse} hjem!', { elev, bamse })
    : t('{elev} tar med {bamse} hjem!', { elev, bamse }));
}

// Viser resultatet av tilfeldig-trekket (eller en oppfordring hvis ingen er trukket),
// og en liten teller over hvor mange som ligger i backlogen.
function renderTilfeldig(kort = 'card-tilfeldig') {
  const card = document.getElementById(kort);
  if (!card) return;
  const s = aktivSide();
  // Kopier på andre sider tegnes ikke mot denne sidens liste (det ville sådd tomme
  // felt i listas trekk for kort som ikke hører hjemme der).
  if (kort !== 'card-tilfeldig' && !s.widget_layout.some(w => w.id === kort)) return;
  const x = tilfeldigTilstand(trekk(s), kort);
  const vis = card.querySelector('.tilfeldig-vis');
  const bl  = card.querySelector('.tilfeldig-backlog-count');
  card.querySelector('.btn-tilfeldig-tom').disabled = !x.backlog.length && !x.valgt;
  if (x.valgt) {
    vis.className   = 'tilfeldig-vis draw-result';
    vis.innerHTML   = `<div class="drawn-name">🙋 ${esc(elevNavn(x.valgt, s))}</div>`;
  } else {
    vis.className   = 'tilfeldig-vis draw-placeholder';
    vis.textContent = t('Trykk Trekk for å velge en tilfeldig elev');
  }
  if (x.backlog.length) {
    bl.className    = 'tilfeldig-backlog-count backlog-count';
    bl.textContent  = t('{antall} trukket (backlog)', { antall: påSiden(s, x.backlog) });
  } else {
    bl.className    = 'tilfeldig-backlog-count backlog-count hidden';
  }
}

function renderAlleTilfeldig() {
  renderTilfeldig('card-tilfeldig');
  Object.keys(state.tilfeldige).forEach(id => renderTilfeldig(`card-${id}`));
}

// Ekstra Tilfeldig elev-kort (v2.48), som notatene: state.tilfeldige har ett felt per
// kopi, kortet står i oppsettet til siden det er laget på. Backlogen ligger i trekkene.
function lagTilfeldigElement(id) {
  const div = document.createElement('div');
  div.className = 'card';
  div.id = `card-${id}`;
  div.innerHTML = `
    <button class="kl-widget-close" data-klikk="fjern-tilfeldig" data-id="${id}" title="${t('Fjern kortet')}">✕</button>
    <div class="card-header">
      <span class="drag-handle" title="${t('Dra for å flytte')}">⠿</span>
      <h2>${t('Tilfeldig elev')}</h2>
      <div class="card-controls">
        <button class="btn btn-ghost btn-sm btn-icon btn-tilfeldig-tom" title="${t('Tøm backlog: alle kan trekkes igjen')}">🔄</button>
      </div>
    </div>
    <div class="tilfeldig-vis draw-placeholder">${t('Trykk Trekk for å velge en tilfeldig elev')}</div>
    <div class="tilfeldig-backlog-count backlog-count hidden"></div>
    <div class="flex gap-2">
      <button class="btn btn-primary flex-1 btn-tilfeldig" title="${t('Trekk tilfeldig (r)')}">${t('Trekk')}</button>
      <button class="btn btn-ghost flex-1 btn-tilfeldig-backlog" title="${t('Trekk uten repetisjon (R)')}">${t('Trekk (bl)')}</button>
    </div>`;
  return div;
}

// Én lytter per kort tar knappene (også det første kortet fra index.html).
function setupTilfeldig(kort) {
  document.getElementById(kort).addEventListener('click', e => {
    if (e.target.closest('.btn-tilfeldig')) trekkTilfeldig(kort);
    else if (e.target.closest('.btn-tilfeldig-backlog')) trekkTilfeldigBacklog(kort);
    else if (e.target.closest('.btn-tilfeldig-tom')) nullstillTilfeldig(kort);
  });
}

function leggTilTilfeldig() {
  const id = `tilfeldig-${++state.tilfeldig_teller}`;
  state.tilfeldige[id] = {};
  aktivSide().widget_layout.push(nyPlassering(`card-${id}`));
  const el = lagTilfeldigElement(id);
  settInnKort(el);
  setupTilfeldig(`card-${id}`);
  pakkSkaler(el);
  applyLayout();
  renderTilfeldig(`card-${id}`);
  renderWidgetMeny();
  saveState();
}

// Sletter en kopi med trekkene dens (fra alle lister og sider), uten å tegne på nytt.
function kastTilfeldig(id) {
  const kort = `card-${id}`;
  for (const s of state.sider) {
    s.widget_layout = s.widget_layout.filter(w => w.id !== kort);
    s.widget_hidden = (s.widget_hidden ?? []).filter(x => x !== kort);
    delete s.kort_navn?.[kort];
    delete s.tilfeldig_flere?.[kort];
  }
  for (const r of Object.values(state.liste_trekk)) delete r.tilfeldig_flere?.[kort];
  delete state.tilfeldige[id];
  if (fokusKort === kort) lukkFokus();
  fjernKortEl(kort);
}

// ✕ på en kopi: kortet og trekkene dets forsvinner.
function fjernTilfeldig(id) {
  kastTilfeldig(id);
  applyLayout();
  renderWidgetMeny();
  saveState();
}

// Viser de to trukne ordenselevene (eller en oppfordring), pluss backlog-teller.
function renderOrdenselev() {
  const s = aktivSide();
  const vis = document.getElementById('ordenselev-vis');
  const bl  = document.getElementById('ordenselev-backlog-count');
  const r   = trekk(s);
  const én  = r.ordenselev_antall === 1;
  const antallKnapp = document.getElementById('btn-ordenselev-antall');
  antallKnapp.textContent = én ? '👤' : '👥';
  antallKnapp.title = én ? t('Én ordenselev per trekk. Trykk for to.') : t('To ordenselever per trekk. Trykk for én.');
  document.getElementById('btn-ordenselev').textContent = én ? t('Trekk ordenselev') : t('Trekk ordenselever');
  if (r.ordenselev_valgte.length) {
    vis.className = 'draw-result';
    vis.innerHTML = `<div class="draw-pair">
      ${r.ordenselev_valgte.map(id => `<div class="draw-pair-item">⭐ ${esc(elevNavn(id, s))}</div>`).join('')}
    </div>`;
  } else {
    vis.className   = 'draw-placeholder';
    vis.textContent = r.ordenselev_antall === 1
      ? t('Trykk Trekk for å velge en ordenselev')
      : t('Trykk Trekk for å velge to ordenselever');
  }
  if (r.ordenselev_backlog.length) {
    bl.className   = 'backlog-count';
    bl.textContent = t('{antall} i backlog', { antall: påSiden(s, r.ordenselev_backlog) });
  } else {
    bl.className   = 'backlog-count hidden';
  }
}

// Viser hvem som har bamsen, og oppdaterer samtidig kort-tittel og knappetekst til
// sidens valgte bamsenavn (s.ulv_navn) — så «Klassebamse» kan hete hva som helst.
function renderUlv() {
  const s = aktivSide();
  const vis  = document.getElementById('ulv-vis');
  const bl   = document.getElementById('ulv-backlog-count');
  const navn = s.ulv_navn || 'Klassebamse';
  const r    = trekk(s);
  document.querySelector('#card-ulv h2').textContent = navn;
  document.getElementById('btn-ulv').textContent = t('Trekk {bamse}', { bamse: navn.toLowerCase() });
  if (r.ulv_valgt) {
    vis.className = 'draw-result ulv-result';
    vis.innerHTML = `<div class="drawn-name">${esc(elevNavn(r.ulv_valgt, s))}</div>`;
  } else {
    vis.className   = 'draw-placeholder';
    vis.textContent = t('Trykk Trekk for å velge hvem som tar med {bamse} hjem', { bamse: navn.toLowerCase() });
  }
  if (r.ulv_backlog.length) {
    bl.className   = 'backlog-count';
    bl.textContent = t('{antall} i backlog', { antall: påSiden(s, r.ulv_backlog) });
  } else {
    bl.className   = 'backlog-count hidden';
  }
}

// Snarvei: tegn alle tre trekk-widgetene på nytt samtidig (etter f.eks. elevendring).
function renderAlleTrekk() {
  renderAlleTilfeldig();
  renderOrdenselev();
  renderUlv();
}

// ===================== Timer =====================
// Flere timere (v2.48). Hver timer er et kort «card-timer-N» som hører til én side,
// slik notatene gjør. Innstillingene ligger i state.timere[id] ({ varighet, modus,
// visning }), navnet i sidens kort_navn (✏️). Den løpende tilstanden (går den, når er
// den ferdig) ligger i timerKjøring og per fane i sessionStorage, så en omlasting ikke
// stopper en timer. Ett felles intervall tikker alle som går, også timere på andre
// sider: de går videre i bakgrunnen og sier fra med navnet sitt når tiden er ute.
//
// Tiden regnes fra klokkeslettet, ikke ved å telle tikk. Nettlesere kaller timere
// sjeldnere i faner som ikke vises (Chrome ned til én gang i minuttet etter fem
// minutter), så en timer som trakk fra ett sekund per tikk, gikk for sakte. Nå huskes
// når nedtellingen er ferdig (slutt) og når stoppeklokka startet (oppStart).
const timerKjøring = new Map(); // id → { remaining, running, slutt, oppKjører, oppStart, oppGått, vistOpp }
let timerInterval = null;
let timerSettMål  = null;       // timeren «Sett tid»-vinduet gjelder

function timerKjør(id) {
  let k = timerKjøring.get(id);
  if (!k) {
    k = { remaining: state.timere[id]?.varighet ?? 300, running: false, slutt: null,
          oppKjører: false, oppStart: null, oppGått: 0, vistOpp: -1 };
    timerKjøring.set(id, k);
  }
  return k;
}

// Sekunder igjen akkurat nå. Rundes opp, så 4,2 s vises som 00:05 og null kommer
// når tiden faktisk er ute.
function timerGjenstår(id) {
  const k = timerKjør(id);
  if (!k.running || k.slutt === null) return k.remaining;
  return Math.max(0, Math.ceil((k.slutt - Date.now()) / 1000));
}

// Sekunder stoppeklokka har gått, uten pausene.
function stoppeklokkeGått(id) {
  const k = timerKjør(id);
  return k.oppKjører ? Math.floor((Date.now() - k.oppStart) / 1000) : k.oppGått;
}

// Intervallet tikker fire ganger i sekundet så lenge minst én timer eller stoppeklokke
// går, og stoppes når ingen gjør det.
function oppdaterTimerIntervall() {
  const noen = [...timerKjøring.values()].some(k => k.running || k.oppKjører);
  if (noen && !timerInterval) timerInterval = setInterval(timerTick, 250);
  else if (!noen && timerInterval) { clearInterval(timerInterval); timerInterval = null; }
}

// Lagrer alle timernes løpende tilstand for denne fanen. Kalles ved hver endring og
// før omlasting.
function lagreTimerØkt() {
  try {
    const timere = {};
    for (const [id, k] of timerKjøring) {
      if (!state.timere[id]) continue;
      timere[id] = { kjører: k.running, slutt: k.slutt, gjenstår: k.remaining, varighet: state.timere[id].varighet,
                     oppKjører: k.oppKjører, oppStart: k.oppStart, oppGått: stoppeklokkeGått(id) };
    }
    sessionStorage.setItem(TIMER_ØKT_KEY, JSON.stringify({ versjon: 2, timere }));
  } catch (_) { /* ingen sessionStorage: timerne starter bare på nytt ved omlasting */ }
}

// Henter timerne tilbake etter en omlasting i samme fane. Er tiden gått ut mens siden
// lastet, vises den som ferdig, uten pip. Lagret med en annen varighet enn den som
// gjelder nå, starter nedtellingen fra den nye. Økter fra før v2.48 (én felles timer)
// gis til den første timeren på siden.
function hentTimerØkt() {
  let økt = null;
  try { økt = JSON.parse(sessionStorage.getItem(TIMER_ØKT_KEY)); } catch (_) { return; }
  if (!erObjekt(økt)) return;
  let timere = økt.versjon === 2 && erObjekt(økt.timere) ? økt.timere : {};
  if (økt.versjon !== 2) {
    const første = sideTimere()[0];
    if (første) timere = { [første]: økt };
  }
  for (const [id, ø] of Object.entries(timere)) {
    if (!state.timere[id] || !erObjekt(ø)) continue;
    const k = timerKjør(id);
    if (ø.oppKjører && Number.isFinite(ø.oppStart)) { k.oppKjører = true; k.oppStart = ø.oppStart; }
    else if (Number.isFinite(ø.oppGått)) k.oppGått = Math.max(0, ø.oppGått);
    if (ø.varighet !== state.timere[id].varighet) continue;
    if (ø.kjører && Number.isFinite(ø.slutt)) {
      if (ø.slutt > Date.now()) { k.running = true; k.slutt = ø.slutt; k.remaining = timerGjenstår(id); }
      else k.remaining = 0;
    } else if (Number.isFinite(ø.gjenstår)) {
      k.remaining = Math.max(0, Math.min(ø.gjenstår, state.timere[id].varighet));
    }
  }
  oppdaterTimerIntervall();
}

// Timerne på aktiv side, i rekkefølgen de står i oppsettet (id-er uten «card-»).
function sideTimere(s = aktivSide()) {
  return s.widget_layout.map(w => w.id).filter(id => /^card-timer-\d+$/.test(id))
    .map(id => id.replace(/^card-/, '')).filter(id => state.timere[id]);
}

// Timeren hurtigtastene (t, s) gjelder: den musa er over, ellers den første på siden.
// Finnes ingen og lag er sann, lages en ny.
function aktivTimer({ lag = false } = {}) {
  const liste = sideTimere();
  const under = sistPekerKort?.replace(/^card-/, '');
  if (under && liste.includes(under)) return under;
  if (liste.length) return liste[0];
  return lag ? leggTilTimer() : null;
}

// Hovedknappen for timeren med tre tilstander avhengig av hvor vi er:
//  - tiden er ute  → nullstill til full varighet (knappen blir «start på nytt»)
//  - kjører        → pause (husk hvor mye som er igjen)
//  - pauset/klar   → start (regn ut når den er ferdig)
function timerToggle(id) {
  if (!state.timere[id]) return;
  if (state.timere[id].modus === 'opp') { stoppeklokkeToggle(id); return; }
  const k = timerKjør(id);
  if (timerGjenstår(id) <= 0) {
    k.remaining = state.timere[id].varighet;
    k.running = false;
    k.slutt = null;
  } else if (k.running) {
    k.remaining = timerGjenstår(id);
    k.running = false;
    k.slutt = null;
  } else {
    k.running = true;
    k.slutt = Date.now() + k.remaining * 1000;
    visTimerKort(id);
  }
  oppdaterTimerIntervall();
  lagreTimerØkt();
  renderTimer(id);
}

// Starter timeren med hurtigtasten t mens kortet ligger under andre kort, ville
// nedtellingen gått uten at noen så den. Da legges kortet øverst, med et lite sprett
// så blikket finner det. I fokus røres ikke bordet bak.
function visTimerKort(id) {
  if (fokusKort) return;
  const cardId = `card-${id}`;
  const w = aktivSide().widget_layout.find(x => x.id === cardId);
  if (!w) return; // timeren står på en annen side
  if (w.z < høyesteZ()) {
    w.z = høyesteZ() + 1;
    saveState();
    applyLayout();
  }
  const kort = document.getElementById(cardId);
  if (!kort) return;
  kort.classList.remove('kort-sprett');
  void kort.offsetWidth; // tving ny layout, så animasjonen starter på nytt
  kort.classList.add('kort-sprett');
  kort.addEventListener('animationend', () => kort.classList.remove('kort-sprett'), { once: true });
}

// Kjøres mens minst én timer går. Regner ut hvor mye som er igjen for hver, og når en
// når null: stopp den, varsle med navnet og spill en pip.
function timerTick() {
  for (const [id, k] of timerKjøring) {
    const oppsett = state.timere[id];
    if (!oppsett) { timerKjøring.delete(id); continue; }
    if (k.oppKjører && oppsett.modus === 'opp') {
      if (stoppeklokkeGått(id) !== k.vistOpp) renderTimer(id); else tegnTimerFramdrift(id);
    }
    if (!k.running) continue;
    const igjen = timerGjenstår(id);
    if (igjen <= 0) {
      k.running = false;
      k.slutt = null;
      k.remaining = 0;
      lagreTimerØkt();
      renderTimer(id);
      notify(timerUteMelding(id), 'warning');
      spillPip();
      continue;
    }
    if (igjen !== k.remaining) { k.remaining = igjen; renderTimer(id); }
    else if (oppsett.modus === 'ned') tegnTimerFramdrift(id); // skiva glir mellom sekundene
  }
  oppdaterTimerIntervall();
}

// «⏰ Tiden er ute!», med timerens navn hvis den har fått et (✏️). Navnet hentes fra
// siden timeren står på, som ikke må være siden som vises.
function timerUteMelding(id) {
  const cardId = `card-${id}`;
  const side = state.sider.find(s => s.widget_layout.some(w => w.id === cardId));
  const navn = side?.kort_navn?.[cardId];
  return navn ? t('⏰ {navn}: tiden er ute!', { navn }) : t('⏰ Tiden er ute!');
}

// Stopper nedtellingen og setter den tilbake til valgt varighet.
function timerReset(id) {
  const k = timerKjør(id);
  k.running = false;
  k.slutt = null;
  k.remaining = state.timere[id].varighet;
  oppdaterTimerIntervall();
  lagreTimerØkt();
  renderTimer(id);
}

// Setter ny varighet (i minutter → sekunder) for én timer, stopper og nullstiller.
function timerSett(id, minutter) {
  state.timere[id].varighet = minutter * 60;
  const k = timerKjør(id);
  k.running = false;
  k.slutt = null;
  k.remaining = state.timere[id].varighet;
  oppdaterTimerIntervall();
  saveState();
  lagreTimerØkt();
  renderTimer(id);
  notify(t('⏱️ Timer satt til {min} min', { min: minutter }));
}

// «Sett tid»: vinduet er felles, timerSettMål sier hvilken timer det gjelder. Fra
// stoppeklokka går timeren over til nedtelling.
function åpneTimerSett(id) {
  if (!id) return;
  timerSettMål = id;
  if (state.timere[id].modus === 'opp') settTimerModus(id, 'ned');
  document.getElementById('input-timer-minutter').value = '';
  åpneModal('modal-timer-sett');
}

// ----- Stoppeklokke -----
function stoppeklokkeToggle(id) {
  const k = timerKjør(id);
  if (k.oppKjører) {
    k.oppGått = stoppeklokkeGått(id);
    k.oppKjører = false;
    k.oppStart = null;
  } else {
    k.oppKjører = true;
    k.oppStart = Date.now() - k.oppGått * 1000; // fortsetter der den ble stoppet
    visTimerKort(id);
  }
  oppdaterTimerIntervall();
  lagreTimerØkt();
  renderTimer(id);
}

function stoppeklokkeReset(id) {
  const k = timerKjør(id);
  k.oppKjører = false;
  k.oppStart = null;
  k.oppGått = 0;
  oppdaterTimerIntervall();
  lagreTimerØkt();
  renderTimer(id);
}

// ⏳/⏱-fanene øverst i kortet. Bytter bare hva kortet viser og styrer: en nedtelling
// som går, fortsetter og piper når tiden er ute, selv om stoppeklokka vises.
function settTimerModus(id, modus) {
  state.timere[id].modus = modus === 'opp' ? 'opp' : 'ned';
  saveState();
  renderTimer(id);
}

// ▬/◔ øverst i kortet: framdriften som bjelke eller som skive (timeglass).
function byttTimerVisning(id) {
  state.timere[id].visning = state.timere[id].visning === 'skive' ? 'bjelke' : 'skive';
  saveState();
  renderTimer(id);
}

// Tid som tekst: MM:SS, og H:MM:SS fra én time (stoppeklokka kan gå lenge).
function formaterTid(sek) {
  const t2 = n => String(n).padStart(2, '0');
  const h = Math.floor(sek / 3600), m = Math.floor((sek % 3600) / 60), x = sek % 60;
  return h ? `${h}:${t2(m)}:${t2(x)}` : `${t2(m)}:${t2(x)}`;
}

// Oppdaterer hele visningen av én timer ut fra modusen (nedtelling eller
// stoppeklokke): fanene, tallene, framdriften (bjelke eller skive), statustekst og
// knappene.
function renderTimer(id) {
  const card = document.getElementById(`card-${id}`);
  const oppsett = state.timere[id];
  if (!card || !oppsett) return;
  const q = sel => card.querySelector(sel);
  const k = timerKjør(id);
  const opp     = oppsett.modus === 'opp';
  const skive   = oppsett.visning === 'skive';
  const kjører  = opp ? k.oppKjører : k.running;
  const ferdig  = !opp && k.remaining === 0;
  const display = q('.timer-display');
  const status  = q('.timer-status');
  const btnToggle = q('.btn-timer-toggle');

  card.querySelectorAll('.timer-fane').forEach(f => {
    const valgt = f.dataset.modus === oppsett.modus;
    f.classList.toggle('valgt', valgt);
    f.setAttribute('aria-selected', valgt);
  });
  const visning = q('.btn-timer-visning');
  visning.textContent = skive ? '▬' : '◔';
  visning.title = skive ? t('Vis som bjelke') : t('Vis som skive');

  k.vistOpp = stoppeklokkeGått(id);
  display.textContent = formaterTid(opp ? k.vistOpp : k.remaining);
  display.classList.toggle('running', kjører);
  display.classList.toggle('ferdig', ferdig && !kjører);

  // Bjelken viser hvor mye som er igjen, og har ingen mening for stoppeklokka. Skiva
  // viser det samme som et timeglass, og for stoppeklokka et sveip per minutt.
  q('.timer-bar-wrap').classList.toggle('hidden', skive || opp);
  q('.timer-skive').classList.toggle('hidden', !skive);
  q('.btn-timer-sett').classList.toggle('hidden', opp);
  // Temaets hovedfarge, også når den går. Rødt bare når tiden er ute (alarm).
  const farge = ferdig ? 'var(--red)' : 'var(--primary)';
  q('.timer-bar').style.background = farge;
  q('.timer-skive').style.setProperty('--skive-farge', farge);
  tegnTimerFramdrift(id);

  if (kjører) {
    status.textContent = t('▶ Kjører');
    status.style.color = 'var(--primary)';
    btnToggle.textContent = t('⏸ Stopp');
  } else if (ferdig) {
    status.textContent = t('⏹ Ferdig!');
    status.style.color = 'var(--red)';
    btnToggle.textContent = t('↺ Start på nytt');
  } else {
    status.textContent = t('⏸ Pauset');
    status.style.color = 'var(--muted)';
    btnToggle.textContent = t('▶ Start');
  }
  // Mens tiden går, får knappen den myke varianten av hovedfargen (se .timer-kjører),
  // så «Stopp» skiller seg fra «Start» og passer i alle temaene.
  btnToggle.classList.toggle('timer-kjører', kjører);
}

function renderAlleTimere() {
  Object.keys(state.timere).forEach(renderTimer);
}

// Tegner bare framdriften (bjelke og skive), med brøkdeler av sekunder, så skiva glir
// i stedet for å hoppe. Kalles fra renderTimer og fra hvert tikk.
function tegnTimerFramdrift(id) {
  const card = document.getElementById(`card-${id}`);
  const oppsett = state.timere[id];
  if (!card || !oppsett) return;
  const k = timerKjør(id);
  let andel;
  if (oppsett.modus === 'opp') {
    const ms = k.oppKjører ? Date.now() - k.oppStart : k.oppGått * 1000;
    andel = (ms % 60_000) / 60_000;
  } else {
    const ms = k.running && k.slutt !== null ? Math.max(0, k.slutt - Date.now()) : k.remaining * 1000;
    andel = oppsett.varighet > 0 ? Math.min(1, ms / (oppsett.varighet * 1000)) : 1;
  }
  card.querySelector('.timer-bar').style.width = `${andel * 100}%`;
  card.querySelector('.timer-skive').style.setProperty('--andel', `${andel * 360}deg`);
}

// Bygger et timerkort. Alle timere er like; navnet kommer fra ✏️ (kort_navn).
function lagTimerElement(id) {
  const div = document.createElement('div');
  div.className = 'card';
  div.id = `card-${id}`;
  div.innerHTML = `
    <button class="kl-widget-close" data-klikk="fjern-timer" data-id="${id}" title="${t('Fjern timeren')}">✕</button>
    <div class="card-header">
      <span class="drag-handle" title="${t('Dra for å flytte')}">⠿</span>
      <h2>${t('Timer')}</h2>
      <div class="card-controls">
        <button class="btn btn-ghost btn-sm btn-icon btn-timer-visning" title="${t('Vis som skive')}">◔</button>
      </div>
    </div>
    <div class="timer-faner" role="tablist">
      <button class="timer-fane" data-modus="ned" role="tab">${t('⏳ Nedtelling')}</button>
      <button class="timer-fane" data-modus="opp" role="tab">${t('⏱ Stoppeklokke')}</button>
    </div>
    <div class="timer-display">05:00</div>
    <div class="timer-bar-wrap"><div class="timer-bar"></div></div>
    <div class="timer-skive hidden" aria-hidden="true"></div>
    <div class="timer-status">${t('⏸ Pauset')}</div>
    <div class="timer-controls">
      <button class="btn btn-primary flex-1 btn-timer-toggle" title="${t('Start/stopp (t)')}">${t('▶ Start')}</button>
      <button class="btn btn-ghost btn-timer-sett" title="${t('Sett tid (s)')}">${t('Sett tid')}</button>
      <button class="btn btn-ghost btn-icon btn-timer-reset" title="${t('Nullstill timer')}">↺</button>
    </div>`;
  return div;
}

// Kobler knappene i ett timerkort. Én lytter på kortet tar alle knappene.
function setupTimer(id) {
  const card = document.getElementById(`card-${id}`);
  card.addEventListener('click', e => {
    const fane = e.target.closest('.timer-fane');
    if (fane) { settTimerModus(id, fane.dataset.modus); return; }
    if (e.target.closest('.btn-timer-toggle')) timerToggle(id);
    else if (e.target.closest('.btn-timer-sett')) åpneTimerSett(id);
    else if (e.target.closest('.btn-timer-reset')) {
      if (state.timere[id].modus === 'opp') stoppeklokkeReset(id); else timerReset(id);
    } else if (e.target.closest('.btn-timer-visning')) byttTimerVisning(id);
  });
}

// «+ ⏱ Timer» i ⊞ Kort (og t/s når siden ikke har noen timer): ny timer på aktiv side.
function leggTilTimer() {
  const id = `timer-${++state.timer_teller}`;
  state.timere[id] = { varighet: 300, modus: 'ned', visning: 'bjelke' };
  aktivSide().widget_layout.push(nyPlassering(`card-${id}`));
  const el = lagTimerElement(id);
  settInnKort(el);
  setupTimer(id);
  pakkSkaler(el);
  applyLayout();
  renderTimer(id);
  renderWidgetMeny();
  saveState();
  return id;
}

// Stopper og sletter en timer, uten å tegne på nytt. Brukes av ✕ og av fjernSide.
function kastTimer(id) {
  const cardId = `card-${id}`;
  for (const s of state.sider) {
    s.widget_layout = s.widget_layout.filter(w => w.id !== cardId);
    s.widget_hidden = (s.widget_hidden ?? []).filter(x => x !== cardId);
    delete s.kort_navn?.[cardId];
  }
  delete state.timere[id];
  timerKjøring.delete(id);
  if (fokusKort === cardId) lukkFokus();
  fjernKortEl(cardId);
  oppdaterTimerIntervall();
  lagreTimerØkt();
}

// ✕ på et timerkort: timeren stoppes og fjernes fra siden og lagringen.
function fjernTimer(id) {
  kastTimer(id);
  applyLayout();
  renderWidgetMeny();
  saveState();
}

// Spiller en kort pipetone via Web Audio når timeren er ute — uten lydfil. Lager en
// 880 Hz sinus som toner ut over 1,4 sek (exponentialRamp gir et naturlig «fade»).
// Pakket i try/catch fordi AudioContext kan være blokkert i enkelte nettlesere.
function spillPip() {
  try {
    const ctx  = new AudioContext();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.28, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.4);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 1.4);
  } catch (_) {}
}

// ===================== Notat =====================
// Lar notat-feltet vokse med innholdet: nullstill høyden, les så scrollHeight
// (full innholdshøyde) og sett den som høyde. Unngår indre scrollbar.
// På flata fyller feltet i tillegg resten av kortet (flex-grow i CSS), så høyden
// herfra er en nedre grense. Fyllingen slås av mens vi måler, ellers ville
// scrollHeight vært hele kortet, og kortet kunne aldri krympet igjen.
function autoResizeNotat(ta) {
  målNotatfelt(ta);
  planleggHøyde(ta.closest('.card'));
}

// Selve målingen, uten å be om ny høydesjekk. Brukes også av høydesjekken, som
// måler feltet på nytt før den regner ut kortets høyde: endres bredden på kortet,
// brytes teksten annerledes, og da må feltet måles igjen.
function målNotatfelt(ta) {
  ta.style.flexGrow = '0';
  ta.style.height = 'auto';
  ta.style.height = ta.scrollHeight + 'px';
  ta.style.flexGrow = '';
}

// Bygger DOM-en for ett notat-kort (uten å sette den inn i siden). Notat er en
// flerinstans-widget, så all id-bruk bakes med instansId (f.eks. «notat-2»).
function lagNotatElement(instansId) {
  const div = document.createElement('div');
  div.className = 'card';
  div.id = `card-${instansId}`;
  div.innerHTML = `
    <button class="kl-widget-close" data-klikk="fjern-notat" data-id="${instansId}" title="${t('Slett dette notatet')}">✕</button>
    <div class="card-header">
      <span class="drag-handle" title="${t('Dra for å flytte')}">⠿</span>
      <h2>${t('Notat')}</h2>
      <div class="card-controls">
        <button class="btn btn-ghost btn-sm btn-icon" id="btn-notat-mindre-${instansId}" title="${t('Mindre tekst')}">A−</button>
        <button class="btn btn-ghost btn-sm btn-icon" id="btn-notat-storre-${instansId}" title="${t('Større tekst')}">A+</button>
        <button class="btn btn-ghost btn-sm btn-icon" id="btn-notat-kursiv-${instansId}" title="${t('Kursiv tekst')}">𝐼</button>
      </div>
    </div>
    <textarea id="notat-textarea-${instansId}" placeholder="${t('Skriv notat her…')}"></textarea>
  `;
  return div;
}

// Kobler et nylig innsatt notat-kort til tilstanden: fyll inn lagret tekst, koble
// kursiv-knappen, og lagre tekstendringer. Lagringen er debouncet (500 ms etter
// siste tastetrykk) så vi ikke skriver til localStorage på hvert eneste tegn.
function setupNotat(instansId) {
  const ta = document.getElementById(`notat-textarea-${instansId}`);
  const btnKursiv = document.getElementById(`btn-notat-kursiv-${instansId}`);
  const data = state.notater[instansId];
  ta.value = data.tekst;
  autoResizeNotat(ta);
  ta.classList.toggle('kursiv', !!data.kursiv);
  btnKursiv.classList.toggle('aktiv', !!data.kursiv);
  btnKursiv.onclick = () => {
    state.notater[instansId].kursiv = !state.notater[instansId].kursiv;
    ta.classList.toggle('kursiv', state.notater[instansId].kursiv);
    btnKursiv.classList.toggle('aktiv', state.notater[instansId].kursiv);
    saveState();
  };

  // Tekststørrelse: A− og A+ går ett trinn i NOTAT_STØRRELSER. Bare teksten i feltet
  // endres; kortet vokser med den (se «Høyde som følger innholdet»).
  const btnMindre = document.getElementById(`btn-notat-mindre-${instansId}`);
  const btnStørre = document.getElementById(`btn-notat-storre-${instansId}`);
  const visStørrelse = () => {
    const f = state.notater[instansId].størrelse ?? 1;
    ta.style.fontSize = f === 1 ? '' : `calc(0.88rem * ${f})`;
    const i = NOTAT_STØRRELSER.indexOf(f);
    btnMindre.disabled = i <= 0;
    btnStørre.disabled = i >= NOTAT_STØRRELSER.length - 1;
    autoResizeNotat(ta);
  };
  const endreStørrelse = steg => {
    const i = NOTAT_STØRRELSER.indexOf(state.notater[instansId].størrelse ?? 1);
    const ny = NOTAT_STØRRELSER[Math.max(0, Math.min(NOTAT_STØRRELSER.length - 1, i + steg))];
    state.notater[instansId].størrelse = ny;
    visStørrelse();
    saveState();
  };
  btnMindre.onclick = () => endreStørrelse(-1);
  btnStørre.onclick = () => endreStørrelse(1);
  visStørrelse();
  let debounce;
  ta.addEventListener('input', () => {
    autoResizeNotat(ta);
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      state.notater[instansId].tekst = ta.value;
      saveState();
    }, 500);
  });
}

// Oppretter et nytt, tomt notat-kort på aktiv side: bump telleren for en unik id,
// registrer i state, bygg og sett inn DOM-en, og koble opp drag + layout på nytt.
function leggTilNotat() {
  state.notat_teller++;
  const id = `notat-${state.notat_teller}`;
  state.notater[id] = { tekst: '', kursiv: false };
  const cardId = `card-${id}`;
  aktivSide().widget_layout.push(nyPlassering(cardId));
  const el = lagNotatElement(id);
  settInnKort(el);
  setupNotat(id);
  applyLayout();
  renderWidgetMeny();
  saveState();
}

// Fjerner et notat-kort fra DENNE siden. Selve notat-dataene slettes kun hvis ingen
// andre sider også bruker kortet — ellers ville vi slette innhold som er synlig et
// annet sted. (Samme mønster som fjernBildeWidget.)
function fjernNotat(instansId) {
  const cardId = `card-${instansId}`;
  const side = aktivSide();
  side.widget_layout = side.widget_layout.filter(w => w.id !== cardId);
  side.widget_hidden  = (side.widget_hidden ?? []).filter(id => id !== cardId);
  // Sjekk om noen side fortsatt har dette kortet i sin layout før vi sletter dataene.
  const ingenSiderBrukerDen = state.sider.every(s => !s.widget_layout.some(w => w.id === cardId));
  if (ingenSiderBrukerDen) {
    delete state.notater[instansId];
    fjernKortEl(cardId);
  }
  applyLayout(); // skjuler kortet om det fortsatt brukes på en annen side
  renderWidgetMeny();
  saveState();
}

// ===================== Dagsplan =====================
// Legger til ett punkt i dagsplanen. Hvert punkt er { tekst, ferdig } — ferdig
// styrer overstrekingen i visningen.
function leggTilDagsplan(tekst) {
  aktivSide().dagsplan.push({ tekst, ferdig: false });
  saveState();
  renderDagsplan();
}

// Fjerner ett dagsplan-punkt ved indeks.
function fjernDagsplan(idx) {
  aktivSide().dagsplan.splice(idx, 1);
  saveState();
  renderDagsplan();
}

// Krysser av / fjerner avkryssing på et dagsplan-punkt (klikk på raden).
function toggleDagsplanFerdig(idx) {
  const p = aktivSide().dagsplan[idx];
  if (!p) return;
  p.ferdig = !p.ferdig;
  saveState();
  renderDagsplan();
}

// Punktet som pågår: det første som ikke er ferdig (-1 når alt er ferdig eller planen
// er tom). Regnes ut, lagres ikke: krysser læreren av punkter for hånd eller endrer
// rekkefølgen, følger uthevingen med av seg selv.
function dagsplanPågår(dagsplan = aktivSide().dagsplan) {
  return dagsplan.findIndex(p => !p.ferdig);
}

// ▶ Neste (tasten p): punktet som pågår, blir ferdig, og neste blir uthevet. Med
// tilbake (Shift+P) angres det siste: punktet før det som pågår, er ikke ferdig likevel.
// Meldingen sier hva som pågår nå, så det virker også når dagsplankortet ikke vises.
function nesteDagsplanPunkt(tilbake = false) {
  const dagsplan = aktivSide().dagsplan;
  if (!dagsplan.length) { notify(t('Dagsplanen er tom'), 'warning'); return; }
  const nå = dagsplanPågår(dagsplan);
  if (tilbake) {
    const forrige = (nå === -1 ? dagsplan.length : nå) - 1;
    if (forrige < 0) return;
    dagsplan[forrige].ferdig = false;
  } else {
    if (nå === -1) { notify(t('📋 Alle punktene er ferdige')); return; }
    dagsplan[nå].ferdig = true;
  }
  saveState();
  renderDagsplan();
  const neste = dagsplanPågår(dagsplan);
  notify(neste === -1
    ? t('📋 Dagsplanen er ferdig!')
    : t('▶ Nå: {punkt}', { punkt: dagsplan[neste].tekst }));
}

// Indeksen til dagsplan-punktet som redigeres inline (null = ingen redigering pågår).
let redigerDagsplanIdx = null;

// Starter inline-redigering av dagsplan-punkt nr. idx.
function startRedigerDagsplan(idx) {
  redigerDagsplanIdx = idx;
  renderDagsplan();
}

// Lagrer redigert dagsplan-tekst. Tom eller uendret tekst lar punktet stå urørt.
// Guarden mot null gjør det andre kallet (blur rett etter Enter) til en no-op.
function lagreRedigerDagsplan(idx, verdi) {
  if (redigerDagsplanIdx === null) return;
  redigerDagsplanIdx = null;
  const tekst = verdi.trim();
  const p = aktivSide().dagsplan[idx];
  if (p && tekst && tekst !== p.tekst) { p.tekst = tekst; saveState(); }
  renderDagsplan();
}

// Avbryter redigeringen uten å lagre.
function avbrytRedigerDagsplan() {
  if (redigerDagsplanIdx === null) return;
  redigerDagsplanIdx = null;
  renderDagsplan();
}

// Tegner dagsplanen på nytt. Prikken (●) toggler ferdig, teksten åpner inline-
// redigering, og ✕ fjerner punktet — tre adskilte klikkmål på samme rad. Punktet som
// redigeres viser et skrivefelt i stedet for teksten.
function renderDagsplan() {
  const dagsplan = aktivSide().dagsplan;
  const liste = document.getElementById('dagsplan-liste');
  const pågår = dagsplanPågår(dagsplan);
  document.getElementById('btn-dagsplan-neste').disabled = pågår === -1;
  if (!dagsplan.length) {
    liste.innerHTML = `<p class="tom-tekst" style="padding:4px">${t('Tom — trykk "+ Legg til punkt"')}</p>`;
    return;
  }
  liste.innerHTML = dagsplan.map((p, i) => {
    const innhold = i === redigerDagsplanIdx
      ? `<input class="dagsplan-rediger-input" type="text" maxlength="80" value="${esc(p.tekst)}"
            data-rediger="dagsplan" data-idx="${i}">`
      : `<span class="dagsplan-tekst" data-klikk="rediger-dagsplan" data-idx="${i}" title="${t('Klikk for å redigere')}">${esc(p.tekst)}</span>`;
    return `
    <div class="dagsplan-item${p.ferdig ? ' ferdig' : ''}${i === pågår ? ' pågår' : ''}" data-idx="${i}"${i === pågår ? ' aria-current="step"' : ''}>
      <span class="dagsplan-prikk" data-klikk="dagsplan-ferdig" data-idx="${i}" title="${t('Marker ferdig')}">●</span>
      ${innhold}
      <button class="dagsplan-slett" data-klikk="fjern-dagsplan" data-idx="${i}" title="${t('Fjern')}">✕</button>
      <span class="dagsplan-handle" title="${t('Dra for å endre rekkefølge')}">⠿</span>
    </div>`;
  }).join('');
  // Fokuser og marker skrivefeltet når et punkt redigeres.
  if (redigerDagsplanIdx !== null) {
    const inp = liste.querySelector('.dagsplan-rediger-input');
    if (inp) { inp.focus(); inp.select(); }
  }
}

// Flytter et dagsplan-punkt fra indeks `fra` til indeks `til` (innsettings-punktet
// regnet ut fra musa). Samme indeks-justering som widget-DnD-en: når vi flytter et
// punkt framover, forskyver fjerningen alle senere indekser ett hakk ned.
function flyttDagsplan(fra, til) {
  const dagsplan = aktivSide().dagsplan;
  if (fra === til || fra == null) { renderDagsplan(); return; }
  const [punkt] = dagsplan.splice(fra, 1);
  if (til > fra) til--;
  dagsplan.splice(til, 0, punkt);
  saveState();
  renderDagsplan();
}

// Kobler dra-og-slipp for å endre rekkefølgen på dagsplan-punkter. Vi bruker IKKE
// native HTML5-drag (drag-spøkelset rendres av nettleseren/OS og var upålitelig — det
// fulgte ikke musa). I stedet styrer vi alt selv med Pointer Events: når man tar tak i
// ⠿-håndtaket lager vi en flytende KOPI av raden som følger pekeren, dimmer originalen
// på plass, og viser en blå strek der punktet havner. Lytterne kobles opp én gang fra
// init — pointerdown er delegert på den faste containeren, move/up ligger på document
// (med peker-fangst) så draget følges selv om pekeren forlater raden.
function setupDagsplanDrag() {
  const liste = document.getElementById('dagsplan-liste');
  if (!liste) return;

  let dragIdx = null;       // indeks for punktet som dras (null = ingen drag)
  let draget = null;        // den ekte rad-noden (dimmes på plass mens kopien flyr)
  let klone = null;         // flytende kopi som følger pekeren
  let indikator = null;     // blå slipp-strek
  let pekerId = null;
  let grepX = 0, grepY = 0; // pekerens offset inni raden da man tok tak
  let startX = 0, startY = 0;
  let aktiv = false;        // har pekeren flyttet seg nok til at draget «teller»?

  // Ta tak: bare på håndtaket, så klikk (prikk/tekst/✕) og inline-redigering er fri.
  liste.addEventListener('pointerdown', e => {
    if (e.button !== 0) return;
    const handle = e.target.closest('.dagsplan-handle');
    if (!handle) return;
    const item = handle.closest('.dagsplan-item');
    if (!item) return;
    e.preventDefault();
    const rect = item.getBoundingClientRect();
    dragIdx = Number(item.dataset.idx);
    draget  = item;
    grepX = e.clientX - rect.left;
    grepY = e.clientY - rect.top;
    startX = e.clientX; startY = e.clientY;
    aktiv = false;
    pekerId = e.pointerId;
    // Peker-fangst holder draget i gang om pekeren forlater vinduet. En bonus, ikke et
    // krav (document-lytterne fanger resten), så vi lar det ikke velte noe om det feiler.
    try { handle.setPointerCapture(pekerId); } catch {}
  });

  document.addEventListener('pointermove', e => {
    if (dragIdx === null || e.pointerId !== pekerId) return;
    // Liten terskel før draget starter — så et lite skjelv ikke flytter noe.
    if (!aktiv) {
      if (Math.abs(e.clientX - startX) + Math.abs(e.clientY - startY) < 4) return;
      startDrag();
    }
    klone.style.left = (e.clientX - grepX) + 'px';
    klone.style.top  = (e.clientY - grepY) + 'px';
    plasserIndikator(e.clientY);
  });

  document.addEventListener('pointerup', e => {
    if (dragIdx === null || e.pointerId !== pekerId) return;
    const fra = dragIdx;
    const til = aktiv ? dropPosisjon(e.clientY, fra) : null;
    avslutt();
    if (til !== null) flyttDagsplan(fra, til);
  });

  document.addEventListener('pointercancel', e => {
    if (dragIdx === null || e.pointerId !== pekerId) return;
    avslutt();
  });

  // Bygg den flytende kopien og dim originalen. Kjøres når terskelen er krysset.
  // VIKTIG: klon FØR vi dimmer originalen — ellers arver kopien dimme-klassen
  // (.dagsplan-dragging, opacity 0.45) og blir nesten usynlig.
  function startDrag() {
    aktiv = true;
    const rect = draget.getBoundingClientRect();
    klone = draget.cloneNode(true);
    klone.classList.add('dagsplan-klone');
    klone.classList.remove('dagsplan-dragging'); // sikring om originalen alt var dimmet
    klone.style.width = rect.width + 'px';
    klone.style.left  = rect.left + 'px';
    klone.style.top   = rect.top + 'px';
    document.body.appendChild(klone);
    draget.classList.add('dagsplan-dragging');   // dim originalen ETTER kloning
    document.body.style.userSelect = 'none';
    indikator = document.createElement('div');
    indikator.className = 'dagsplan-drop-indikator';
  }

  // Sett slipp-streken foran det første punktet pekeren er over øvre halvdel av (hopp
  // over punktet som dras). Ingen treff → legg den nederst.
  function plasserIndikator(clientY) {
    const ref = [...liste.querySelectorAll('.dagsplan-item')]
      .filter(it => Number(it.dataset.idx) !== dragIdx)
      .find(it => { const r = it.getBoundingClientRect(); return clientY < r.top + r.height / 2; }) ?? null;
    if (ref) liste.insertBefore(indikator, ref);
    else liste.appendChild(indikator);
  }

  // Innsettings-indeksen ut fra pekerens y. Punktet som dras (hopp) telles ikke med.
  function dropPosisjon(clientY, hopp) {
    let insertAt = aktivSide().dagsplan.length;
    for (const it of liste.querySelectorAll('.dagsplan-item')) {
      const idx = Number(it.dataset.idx);
      if (idx === hopp) continue;
      const r = it.getBoundingClientRect();
      if (clientY < r.top + r.height / 2) { insertAt = idx; break; }
    }
    return insertAt;
  }

  function avslutt() {
    if (klone) { klone.remove(); klone = null; }
    if (indikator) { indikator.remove(); indikator = null; }
    if (draget) { draget.classList.remove('dagsplan-dragging'); draget = null; }
    document.body.style.userSelect = '';
    dragIdx = null; pekerId = null; aktiv = false;
  }
}

// ===================== Grupper =====================
// Deler elevene inn i `antall` tilfeldige grupper, og respekterer «hold fra hverandre»-
// begrensninger (par som ikke skal havne sammen). Vi har ingen smart løser: vi stokker
// og fordeler reihum, og prøver inntil 200 ganger til vi treffer et oppsett som ikke
// bryter noen begrensning. Klarer vi ikke det, sier vi fra i stedet for å bryte reglene.
function lagGrupper(antall) {
  const s = aktivSide();
  // Bare elever som er til stede, fordeles. De som er borte i dag, står utenfor.
  const elever = tilStede(s);
  if (elever.length < 2) {
    notify(elever.length < s.elever.length
      ? t('Trenger minst 2 elever som er her i dag ({antall} her)', { antall: elever.length })
      : t('Trenger minst 2 elever'), 'warning');
    return;
  }
  if (antall > elever.length) {
    notify(t('For mange grupper — bare {antall} elever inne', { antall: elever.length }), 'warning');
    return;
  }
  const begrensninger = aktivePar(s);
  let grupper = null;
  for (let forsøk = 0; forsøk < 200; forsøk++) {
    const shufflet = shuffle(elever);
    const kandidat = Array.from({ length: antall }, () => []);
    // Del ut elevene reihum (i % antall) — gir jevnest mulig gruppestørrelse.
    shufflet.forEach((e, i) => kandidat[i % antall].push(e));
    // Godkjenn kun hvis ingen gruppe inneholder begge i et forbudt par.
    const ok = begrensninger.every(([a, b]) =>
      !kandidat.some(g => g.includes(a) && g.includes(b))
    );
    if (ok) { grupper = kandidat; break; }
  }
  if (!grupper) {
    notify(t('Klarte ikke lage grupper uten å bryte begrensningene — prøv færre par eller flere grupper'), 'warning');
    return;
  }
  s.grupper = grupper;
  saveState();
  renderGrupper();
  renderElever();
  const størrelser = grupper.map(g => g.length);
  notify(t('🎲 {antall} grupper ({min}–{maks} elever)', { antall, min: Math.min(...størrelser), maks: Math.max(...størrelser) }));
}

// Sletter den aktive gruppeinndelingen og oppdaterer både gruppe- og elevvisning
// (elevlista mister da fargemarkeringen sin).
function fjernGrupper() {
  aktivSide().grupper = null;
  saveState();
  renderGrupper();
  renderElever();
}

// Tegner gruppe-kortene, ett per gruppe, med en fargetone fra GRUPPE_FARGER (modulo, så
// det går rundt hvis det er flere grupper enn farger). Tonen settes som --gf, og CSS-en
// blander den med temaets farger.
function renderGrupper() {
  const vis = document.getElementById('grupper-vis');
  if (!aktivSide().grupper) {
    vis.innerHTML = `<p class="tom-tekst">${t('Ingen grupper aktive — trykk')} <kbd>${t('🎲 Del inn')}</kbd></p>`;
    return;
  }
  const status = oppmøteIdag(aktivSide());
  vis.innerHTML = aktivSide().grupper.map((gruppe, gi) => {
    const f = GRUPPE_FARGER[gi % GRUPPE_FARGER.length];
    return `<div class="gruppe-kort gruppe-farget" style="--gf:${f}">
      <div class="gruppe-tittel">${t('Gruppe {n}', { n: gi + 1 })}</div>
      <div class="gruppe-elever">${gruppe.map(id => status[id] === 'borte'
        ? `<span class="gruppe-borte" title="${t('Borte i dag')}">${esc(elevNavn(id))}</span>`
        : esc(elevNavn(id))).join(', ')}</div>
    </div>`;
  }).join('');
}

// ===================== Lister =====================
// Lagrede klasselister er GLOBALE (deles av alle sider), mens elevlista er per side.
// Å laste eller lagre en liste kopierer elevene; lista og siden endres hver for seg
// etterpå. Id-ene følger med, så backlogs og par finner eleven igjen. «Hold fra
// hverandre»-parene bor i lista (state.liste_begrensninger), og siden husker lista
// den kom fra (s.liste). Se «Gruppebegrensning».

// Lagrer aktiv sides elevliste som en navngitt liste, og kobler siden til den.
// Parene siden bruker nå, blir med inn i lista og slås sammen med listas egne.
function lagreListe(navn) {
  const s = aktivSide();
  if (!s.elever.length) { notify(t('Ingen elever inne å lagre'), 'warning'); return false; }
  navn = navn.slice(0, 60);
  if (FARLIGE_NØKLER.has(navn)) { notify(t('Det navnet kan ikke brukes'), 'warning'); return false; }
  const erNy = !Object.hasOwn(state.lister, navn);
  const ider = new Set(s.elever.map(e => e.id));
  // Listas gamle par peker på listas gamle id-er. Samme elev kan ha en annen id på
  // siden, så de oversettes via navnet før de slås sammen.
  const fraNavn = new Map(s.elever.map(e => [e.navn.toLowerCase(), e.id]));
  const gammelId = new Map((state.lister[navn] ?? []).map(e => [e.id, fraNavn.get(e.navn.toLowerCase())]));
  const gamlePar = (state.liste_begrensninger[navn] ?? []).map(par => par.map(id => gammelId.get(id)));
  const innenfor = par => par.filter(p => p.every(id => ider.has(id)));
  const nyePar = slåSammenPar(innenfor(gamlePar), innenfor(aktivePar(s)));
  // Trekkene siden bruker nå (sine egne eller lista den kom fra), blir listas trekk.
  // Lagres siden over en annen liste, erstattes den listas trekk, akkurat som elevene.
  const nyeTrekk = kopierTrekk(trekk(s), id => ider.has(id));
  state.lister[navn] = s.elever.map(e => ({ ...e })); // kopi: lista og siden endres hver for seg
  state.liste_begrensninger[navn] = nyePar;
  state.liste_trekk[navn] = nyeTrekk;
  if (erNy) state.liste_oppsett.push(navn); // nye lister havner nederst i menyen
  s.liste = navn;
  s.gruppe_begrensninger = [];
  tømSidensTrekk(s);
  saveState();
  beOmVarigLagring();
  notify((erNy ? t("📋 '{navn}' lagret ({antall} elever)", { navn, antall: s.elever.length })
        : t("📋 '{navn}' oppdatert ({antall} elever)", { navn, antall: s.elever.length })));
  return true;
}

// Laster en lagret liste inn i aktiv sides roster. Overskriver dagens roster og
// nullstiller grupper og oppmøte (de hører til den gamle elevsammensetningen).
// Siden husker lista etterpå, så listas trekk og «hold fra hverandre»-par gjelder.
// Trekkene til lista siden kom fra, blir liggende i den lista til den lastes igjen
// (se «Trekk per liste»). Har den nye lista ingen trekk ennå, starter den tom, med
// ett unntak: en side uten liste gir trekkene sine til lista for elever som også står
// i den, så ingen mister backlogen ved overgangen til v2.39. Samme elev kan
// ha en annen id i lista enn på siden, så de matches på navn.
function lastListe(navn) {
  const elever = state.lister[navn];
  if (!elever) return;
  const s = aktivSide();
  const nye = elever.map(e => ({ ...e })); // kopi av den globale lista
  const fraNavn = new Map(nye.map(e => [e.navn.toLowerCase(), e.id]));
  const kart = new Map();
  for (const e of s.elever) {
    const nyId = fraNavn.get(e.navn.toLowerCase());
    if (nyId && nyId !== e.id) kart.set(e.id, nyId);
  }
  const nyeIder = new Set(nye.map(e => e.id));
  const gamleTrekk = trekk(s); // før koblingen byttes
  if (!state.liste_trekk[navn]) {
    // Bare en side uten liste gir trekkene sine videre (overgangen fra før v2.39).
    // Kommer siden fra en annen liste, hører trekkene til den, og den nye lista
    // starter tom: ellers ville bamsen og ordenselevene fulgt siden, ikke lista.
    state.liste_trekk[navn] = sidensListe(s)
      ? tomtTrekk()
      : kopierTrekk(gamleTrekk, id => nyeIder.has(id), id => kart.get(id) ?? id);
  }
  byttElevIder(s, kart);
  // Trekkene røres ikke her: de gamle hører til den forrige lista (eller er tatt med
  // over), og en delt liste skal ikke miste elever fordi en side bytter liste.
  fjernElevReferanser(s, new Set(s.elever.map(e => kart.get(e.id) ?? e.id).filter(id => !nyeIder.has(id))),
    { medTrekk: false });
  // Sidens egne par (fra før parene hørte til lista) flyttes inn i lista, så de ikke
  // forsvinner. fjernElevReferanser har allerede tatt bort par med elever som ikke
  // står i lista.
  state.liste_begrensninger[navn] = slåSammenPar(state.liste_begrensninger[navn] ?? [], s.gruppe_begrensninger ?? []);
  s.gruppe_begrensninger = [];
  tømSidensTrekk(s);       // sidens egne trekk er tatt med inn i lista over
  s.liste   = navn;
  s.elever  = nye;
  s.grupper = null;
  s.oppmøte = null;        // markeringene hørte til den gamle lista
  saveState();
  renderElever();
  renderAlleTrekk();
  renderGrupper();
  renderBegrensninger();
  beOmVarigLagring();
  notify(t("📋 '{navn}' lastet ({antall} elever)", { navn, antall: elever.length }));
}

// Sletter en lagret liste. Elevene på sidene røres ikke. Sider som var koblet til
// lista, beholder parene og trekkene som sine egne, så Del inn og trekkene virker
// som før.
function slettListe(navn) {
  const par = state.liste_begrensninger[navn] ?? [];
  const listeTrekk = state.liste_trekk[navn] ?? tomtTrekk();
  for (const side of state.sider) {
    if (side.liste !== navn) continue;
    const ider = new Set(side.elever.map(e => e.id));
    side.gruppe_begrensninger = slåSammenPar(side.gruppe_begrensninger ?? [],
      par.filter(p => p.every(id => ider.has(id))));
    Object.assign(side, kopierTrekk(listeTrekk, id => ider.has(id)));
    side.liste = null;
  }
  delete state.lister[navn];
  delete state.liste_begrensninger[navn];
  delete state.liste_trekk[navn];
  state.liste_oppsett = normaliserOppsett(state.liste_oppsett, state.lister);
  saveState();
  notify(t("🗑️ '{navn}' slettet", { navn }));
  renderListerModal();
}

// Gir en lagret liste nytt navn. Rekkefølgen i menyen beholdes, parene følger med,
// og sider som er koblet til lista, får det nye navnet. Returnerer true ved suksess.
function endreListenavn(gammelt, nytt) {
  nytt = (nytt ?? '').trim().slice(0, 60);
  if (!nytt || nytt === gammelt || !state.lister[gammelt]) return false;
  if (FARLIGE_NØKLER.has(nytt) ||
      Object.keys(state.lister).some(n => n !== gammelt && n.toLowerCase() === nytt.toLowerCase())) {
    notify(t('Det finnes allerede en liste som heter {navn}', { navn: nytt }), 'warning');
    return false;
  }
  const bytt = obj => Object.fromEntries(Object.entries(obj).map(([k, v]) => [k === gammelt ? nytt : k, v]));
  state.lister = bytt(state.lister);
  state.liste_begrensninger = bytt(state.liste_begrensninger);
  state.liste_trekk = bytt(state.liste_trekk);
  // Lista beholder plassen sin i menyen, også inni en gruppe.
  const nyttNavn = x => (x === gammelt ? nytt : x);
  state.liste_oppsett = state.liste_oppsett.map(x => {
    if (typeof x === 'string') return nyttNavn(x);
    x.lister = x.lister.map(nyttNavn);
    return x;
  });
  for (const side of state.sider) if (side.liste === gammelt) side.liste = nytt;
  saveState();
  notify(t('✓ Lista heter nå {navn}', { navn: nytt }));
  return true;
}

// Laster ned én liste med parene sine som en fil. Formatet er det samme som en full
// backup, bare med én liste og uten resten, så fila kan importeres både med
// «📥 Importer liste» her og med «Flett inn bare klasselister» i den vanlige importen.
// Fila inneholder elevnavn: det er læreren som bestemmer hvem den gis til.
function eksporterListe(navn) {
  const elever = state.lister[navn];
  if (!elever) return;
  const data = {
    app: 'klasserom-dashboard',
    format_versjon: EKSPORT_FORMAT_VERSJON,
    eksportert: new Date().toISOString(),
    innhold: {
      klasselister: { [navn]: elever },
      klasseliste_begrensninger: { [navn]: state.liste_begrensninger[navn] ?? [] },
    },
  };
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url;
  // Filnavnet får bare trygge tegn; æøå beholdes.
  const filnavn = navn.replace(/[^\p{L}\p{N} _-]/gu, '').trim().replace(/\s+/g, '-') || 'liste';
  a.download = `skoledash-liste-${filnavn}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  notify(t("📤 '{navn}' lastet ned", { navn }));
}

// Leser en liste- eller backupfil og fletter listene inn (se flettInnLister). Rører
// verken sider, kort eller innstillinger.
function importerListeFil(input) {
  const fil = input.files?.[0];
  input.value = ''; // tillat å velge samme fil igjen
  if (!fil) return;
  const reader = new FileReader();
  reader.onload = e => {
    let data;
    try {
      data = trygtJsonParse(e.target.result);
    } catch (_) {
      notify(t('Kunne ikke lese fila — er det en gyldig JSON-fil?'), 'error');
      return;
    }
    if (!data || data.app !== 'klasserom-dashboard' || !data.innhold) {
      notify(t('Dette ser ikke ut som en Skoledash-backup'), 'error');
      return;
    }
    if (data.format_versjon > EKSPORT_FORMAT_VERSJON) {
      notify(t('Fila er laget av en nyere versjon av Skoledash. Last siden på nytt og prøv igjen.'), 'error');
      return;
    }
    const n = flettInnLister(data.innhold);
    if (!n) { notify(t('Fant ingen lister i fila'), 'warning'); return; }
    saveState();
    renderListerModal();
    notify(t('📥 {antall} liste(r) flettet inn', { antall: n }));
  };
  reader.readAsText(fil);
}

// Lista som står med skrivefelt i menyen akkurat nå (nytt navn), eller null.
let redigerListeNavn = null;
let redigerGruppe = null;   // gruppa (objektet) som har skrivefeltet for navn åpent

// ===================== Oppsett i Lister-menyen =====================
// state.liste_oppsett bestemmer rekkefølgen i menyen. Hvert element er enten et
// listenavn eller en gruppe { gruppe: navn, lister: [listenavn], åpen }. Grupper ligger
// bare på øverste nivå (ingen grupper i grupper). Læreren drar lister for å flytte dem,
// og slipper en liste midt på en annen for å lage en gruppe, som i Windows' startmeny.
//
// Gyldig oppsett: hver liste i state.lister står nøyaktig én gang. Lister som mangler
// (lagret av en eldre versjon, eller importert), legges nederst. Ukjente navn og tomme
// grupper forsvinner. Gruppeobjektene beholdes (samme objekt), så redigerGruppe og
// referanser fra et drag fortsatt peker riktig.
function normaliserOppsett(oppsett, lister) {
  const finnes = new Set(Object.keys(lister));
  const brukt = new Set();
  const ny = navn => typeof navn === 'string' && finnes.has(navn) && !brukt.has(navn) && brukt.add(navn);
  const ut = [];
  for (const x of Array.isArray(oppsett) ? oppsett : []) {
    if (typeof x === 'string') {
      if (ny(x)) ut.push(x);
    } else if (erObjekt(x) && Array.isArray(x.lister)) {
      x.lister = x.lister.filter(ny);
      // Fast tekst, ikke t(): kjører også fra loadState(), før state finnes.
      x.gruppe = typeof x.gruppe === 'string' && x.gruppe.trim() ? x.gruppe.trim().slice(0, 40) : 'Gruppe';
      x.åpen = x.åpen !== false;
      if (x.lister.length) ut.push(x);
    }
  }
  for (const navn of finnes) if (!brukt.has(navn)) ut.push(navn);
  return ut;
}

// Hvor en liste står: beholderen (oppsettet selv eller en gruppes lister) og plassen.
function finnIOppsett(oppsett, navn) {
  const i = oppsett.indexOf(navn);
  if (i !== -1) return { beholder: oppsett, idx: i };
  for (const x of oppsett) {
    if (typeof x !== 'string') {
      const j = x.lister.indexOf(navn);
      if (j !== -1) return { beholder: x.lister, idx: j };
    }
  }
  return null;
}

// Utfører et slipp. `dra` er { navn } (en liste) eller { gruppe } (et gruppeobjekt).
// `mål` er { type: 'før' | 'etter' | 'inn', navn } eller { type, gruppe }:
//  - før/etter en liste: samme beholder som lista (i gruppa hvis den står i en).
//  - før/etter en gruppe: på øverste nivå.
//  - inn i en liste på øverste nivå: de to blir en ny gruppe (returneres, så den kan
//    få navn med en gang). Inn i en liste i en gruppe: legges i den gruppa.
//  - inn i en gruppe: nederst i gruppa, og gruppa åpnes.
// En gruppe kan bare flyttes før/etter, aldri inn i noe.
function flyttIOppsett(dra, mål) {
  const o = state.liste_oppsett;
  const element = dra.gruppe ?? dra.navn;
  if (dra.gruppe) o.splice(o.indexOf(dra.gruppe), 1);
  else {
    const fra = finnIOppsett(o, dra.navn);
    if (fra) fra.beholder.splice(fra.idx, 1); // en gruppe som blir tom, ryddes av normaliseringen
  }
  let nyGruppe = null;
  if (mål.navn !== undefined) {
    const til = finnIOppsett(o, mål.navn);
    if (til) {
      if (mål.type === 'inn' && !dra.gruppe) {
        if (til.beholder === o) {
          nyGruppe = { gruppe: t('Ny gruppe'), lister: [mål.navn, dra.navn], åpen: true };
          o.splice(til.idx, 1, nyGruppe);
        } else {
          til.beholder.splice(til.idx + 1, 0, dra.navn);
        }
      } else {
        til.beholder.splice(mål.type === 'før' ? til.idx : til.idx + 1, 0, element);
      }
    }
  } else if (mål.gruppe) {
    if (mål.type === 'inn' && !dra.gruppe) {
      mål.gruppe.lister.push(dra.navn);
      mål.gruppe.åpen = true;
    } else {
      const idx = o.indexOf(mål.gruppe);
      o.splice(mål.type === 'før' ? idx : idx + 1, 0, element);
    }
  }
  state.liste_oppsett = normaliserOppsett(o, state.lister);
  // Ble ikke det som ble dratt, plassert (målet fantes ikke), legger normaliseringen
  // en liste nederst. En gruppe må legges tilbake for hånd.
  if (dra.gruppe && !state.liste_oppsett.includes(dra.gruppe) && dra.gruppe.lister.length) {
    state.liste_oppsett.push(dra.gruppe);
  }
  saveState();
  return nyGruppe;
}

// Dra og slipp i Lister-menyen. Samme grep som dagsplanen (se setupDagsplanDrag):
// Pointer Events i stedet for HTML5-drag, en flytende kopi som følger pekeren, og
// originalen dimmet på plass. Virker med mus, penn og finger. Her finnes tre slags
// slipp, vist med hver sin markering på målet:
//  - øvre/nedre del av en rad: før/etter (strek over/under)
//  - midt på en rad: lag gruppe, eller legg i gruppa raden står i (stiplet ramme)
//  - midt på en gruppeoverskrift: legg i gruppa
// Nær kanten av lista ruller den, så lange lister kan ordnes. Lyttes på én gang fra
// init: pointerdown delegeres fra #lister-innhold, som står fast mens innholdet tegnes
// på nytt.
function setupListeDra() {
  const innhold = document.getElementById('lister-innhold');
  let økt = null; // { element, dra, erGruppe, pekerId, startX, startY, grepX, grepY, aktiv, klone, mål, rull }

  innhold.addEventListener('pointerdown', e => {
    if (e.button !== 0) return;
    const håndtak = e.target.closest('.liste-dra');
    if (!håndtak) return;
    const gruppeEl = håndtak.closest('.liste-gruppe-topp')?.closest('.liste-gruppe');
    const element = gruppeEl ?? håndtak.closest('.liste-rad');
    if (!element) return;
    e.preventDefault();
    const r = element.getBoundingClientRect();
    økt = {
      element,
      erGruppe: !!gruppeEl,
      dra: gruppeEl ? { gruppe: state.liste_oppsett[Number(gruppeEl.dataset.gidx)] } : { navn: element.dataset.navn },
      pekerId: e.pointerId, startX: e.clientX, startY: e.clientY,
      grepX: e.clientX - r.left, grepY: e.clientY - r.top,
      aktiv: false, klone: null, mål: null, rull: 0,
    };
    try { håndtak.setPointerCapture(e.pointerId); } catch {}
  });

  document.addEventListener('pointermove', e => {
    if (!økt || e.pointerId !== økt.pekerId) return;
    if (!økt.aktiv) {
      if (Math.abs(e.clientX - økt.startX) + Math.abs(e.clientY - økt.startY) < 4) return;
      start();
    }
    økt.klone.style.left = (e.clientX - økt.grepX) + 'px';
    økt.klone.style.top  = (e.clientY - økt.grepY) + 'px';
    // Rull lista når pekeren er nær øvre eller nedre kant.
    const boks = innhold.querySelector('.liste-oppsett');
    const kant = boks.getBoundingClientRect();
    økt.rull = e.clientY < kant.top + 28 ? -10 : e.clientY > kant.bottom - 28 ? 10 : 0;
    if (økt.rull) boks.scrollTop += økt.rull;
    marker(finnMål(e.clientX, e.clientY));
  });

  const slutt = e => {
    if (!økt || e.pointerId !== økt.pekerId) return;
    const { aktiv, mål, dra } = økt;
    avslutt();
    if (!aktiv || !mål) return;
    const nyGruppe = flyttIOppsett(dra, mål);
    if (nyGruppe) redigerGruppe = nyGruppe; // ny gruppe får navnefeltet med en gang
    renderListerModal();
  };
  document.addEventListener('pointerup', slutt);
  document.addEventListener('pointercancel', e => {
    if (!økt || e.pointerId !== økt.pekerId) return;
    avslutt();
  });

  function start() {
    økt.aktiv = true;
    const r = økt.element.getBoundingClientRect();
    const klone = økt.element.cloneNode(true);
    klone.classList.add('liste-klone');
    klone.style.width = r.width + 'px';
    document.body.appendChild(klone);
    økt.klone = klone;
    økt.element.classList.add('liste-drar');
    document.body.style.userSelect = 'none';
  }

  // Finner målet under pekeren. Kopien slipper pekeren gjennom (pointer-events: none),
  // så elementFromPoint ser lista under.
  function finnMål(x, y) {
    const under = document.elementFromPoint(x, y);
    const rad  = under?.closest('#lister-innhold .liste-rad');
    const topp = under?.closest('#lister-innhold .liste-gruppe-topp');
    const kandidat = rad ?? topp;
    if (!kandidat || økt.element.contains(kandidat)) return null;
    const r = kandidat.getBoundingClientRect();
    const andel = (y - r.top) / r.height;
    const halv = andel < 0.5 ? 'før' : 'etter';
    if (topp) {
      const gEl = topp.closest('.liste-gruppe');
      const g = state.liste_oppsett[Number(gEl.dataset.gidx)];
      if (!økt.erGruppe && andel > 0.25 && andel < 0.75) return { type: 'inn', gruppe: g, el: topp };
      // Etter en åpen gruppe betyr etter hele gruppa: streken under gruppa, ikke overskriften.
      return { type: halv, gruppe: g, el: halv === 'etter' ? gEl : topp };
    }
    const iGruppe = rad.closest('.liste-gruppe');
    if (økt.erGruppe) {
      // En gruppe kan ikke ligge i en gruppe: bruk gruppa raden står i som mål.
      if (iGruppe) return { type: halv, gruppe: state.liste_oppsett[Number(iGruppe.dataset.gidx)], el: iGruppe };
      return { type: halv, navn: rad.dataset.navn, el: rad };
    }
    if (andel > 0.3 && andel < 0.7) return { type: 'inn', navn: rad.dataset.navn, el: rad };
    return { type: halv, navn: rad.dataset.navn, el: rad };
  }

  function marker(mål) {
    innhold.querySelectorAll('.slipp-før, .slipp-etter, .slipp-inn')
      .forEach(el => el.classList.remove('slipp-før', 'slipp-etter', 'slipp-inn'));
    økt.mål = mål;
    if (mål) mål.el.classList.add(`slipp-${mål.type}`);
  }

  function avslutt() {
    økt.klone?.remove();
    økt.element.classList.remove('liste-drar');
    innhold.querySelectorAll('.slipp-før, .slipp-etter, .slipp-inn')
      .forEach(el => el.classList.remove('slipp-før', 'slipp-etter', 'slipp-inn'));
    document.body.style.userSelect = '';
    økt = null;
  }
}

// Gir en gruppe nytt navn. Tomt navn beholder det gamle.
function endreGruppenavn(gruppe, nytt) {
  nytt = (nytt ?? '').trim().slice(0, 40);
  if (!nytt || nytt === gruppe.gruppe) return;
  gruppe.gruppe = nytt;
  saveState();
}

// Tegner innholdet i Lister-menyen: én rad per liste med antall elever og par, og
// knapper for nytt navn, par, eksport og sletting. Klikk på selve raden laster lista.
// Listenavnet ligger i data-navn (escapet) og leses av lyttere; det settes aldri inn
// i en onclick, der et navn fra en delt fil kunne blitt til kode.
// Knapp som må trykkes to ganger. Første trykk viser spørsmålet (klassen «bekreft»),
// andre trykk utfører. spørsmål og tittel kan være funksjoner, så teksten kan avhenge
// av situasjonen når knappen trykkes. Etter 3 sekunder uten nytt trykk går knappen tilbake.
function toTrykk(knapp, { spørsmål, tittel, utfør }) {
  const tekst = knapp.textContent;
  const vanligTittel = knapp.title;
  let tidtaker = null;
  // Tilbake til vanlig knapp. Skjer etter 3 sekunder, og rett etter at handlingen er
  // utført: knapper som står fast på kortet (🧹 Tøm), skal spørre igjen neste gang.
  const tilbake = () => {
    clearTimeout(tidtaker);
    knapp.classList.remove('bekreft');
    knapp.textContent = tekst;
    knapp.title = vanligTittel;
  };
  knapp.addEventListener('click', () => {
    if (knapp.classList.contains('bekreft')) { tilbake(); utfør(); return; }
    knapp.classList.add('bekreft');
    knapp.textContent = typeof spørsmål === 'function' ? spørsmål() : spørsmål;
    knapp.title = tittel();
    tidtaker = setTimeout(() => { if (knapp.isConnected) tilbake(); }, 3000);
  });
}

function renderListerModal() {
  const innhold = document.getElementById('lister-innhold');
  if (!Object.keys(state.lister).length) {
    innhold.innerHTML = `<p class="tom-tekst" style="padding:12px">${t('Ingen lagrede lister ennå.')}</p>`;
    return;
  }
  state.liste_oppsett = normaliserOppsett(state.liste_oppsett, state.lister);
  const denne = sidensListe();
  const dra = `<span class="liste-dra" title="${t('Dra for å flytte. Slipp på en annen liste for å lage en gruppe.')}" aria-hidden="true">⠿</span>`;
  const rad = navn => {
    const elever = state.lister[navn];
    const antPar = (state.liste_begrensninger[navn] ?? []).length;
    const navnHtml = navn === redigerListeNavn
      ? `<input class="liste-navn-input" type="text" maxlength="60" value="${esc(navn)}" aria-label="${t('Nytt navn på lista')}">`
      : `<span class="liste-navn">📋 ${esc(navn)}${navn === denne ? ` <span class="liste-denne">${t('(denne siden)')}</span>` : ''}</span>`;
    return `
      <div class="modal-list-item liste-rad" data-navn="${esc(navn)}">
        ${dra}
        ${navnHtml}
        <div class="liste-handlinger">
          <span class="item-meta">${elever.length === 1 ? t('1 elev') : t('{antall} elever', { antall: elever.length })}${antPar ? ` · ${t('{antall} par', { antall: antPar })}` : ''}</span>
          <button class="liste-knapp" data-liste="endre" title="${t('Gi nytt navn')}" aria-label="${t('Gi nytt navn')}">✏️</button>
          <button class="liste-knapp" data-liste="par" title="${t('Par som ikke skal i samme gruppe')}" aria-label="${t('Par som ikke skal i samme gruppe')}">⛔</button>
          <button class="liste-knapp" data-liste="eksport" title="${t('Last ned lista som fil')}" aria-label="${t('Last ned lista som fil')}">📤</button>
          <button class="liste-knapp liste-oppdater" data-liste="oppdater" title="${t('Erstatt elevene i lista med elevene på siden')}" aria-label="${t('Erstatt elevene i lista med elevene på siden')}">🔄</button>
          <button class="liste-knapp liste-slett" data-liste="slett" title="${t('Slett lista')}" aria-label="${t('Slett lista')}">✕</button>
        </div>
      </div>`;
  };
  const gruppe = (g, gi) => {
    const navnHtml = g === redigerGruppe
      ? `<input class="gruppe-navn-input" type="text" maxlength="40" value="${esc(g.gruppe)}" aria-label="${t('Nytt navn på gruppa')}">`
      : `<span class="liste-gruppe-navn">${g.åpen ? '▾' : '▸'} 📁 ${esc(g.gruppe)}</span>`;
    return `
      <div class="liste-gruppe${g.åpen ? ' åpen' : ''}" data-gidx="${gi}">
        <div class="modal-list-item liste-gruppe-topp" role="button" aria-expanded="${g.åpen}">
          ${dra}
          ${navnHtml}
          <div class="liste-handlinger">
            <span class="item-meta">${g.lister.length === 1 ? t('1 liste') : t('{antall} lister', { antall: g.lister.length })}</span>
            <button class="liste-knapp" data-gruppe="endre" title="${t('Gi gruppa nytt navn')}" aria-label="${t('Gi gruppa nytt navn')}">✏️</button>
          </div>
        </div>
        ${g.åpen ? `<div class="liste-gruppe-innhold">${g.lister.map(rad).join('')}</div>` : ''}
      </div>`;
  };
  innhold.innerHTML = `<div class="modal-list liste-oppsett">
    ${state.liste_oppsett.map((x, i) => (typeof x === 'string' ? rad(x) : gruppe(x, i))).join('')}
  </div>`;

  // Gruppeoverskriftene: klikk folder sammen/åpner, ✏️ gir nytt navn.
  innhold.querySelectorAll('.liste-gruppe').forEach(el => {
    const g = state.liste_oppsett[Number(el.dataset.gidx)];
    const topp = el.querySelector('.liste-gruppe-topp');
    topp.addEventListener('click', e => {
      if (e.target.closest('.liste-knapp, .liste-dra, .gruppe-navn-input')) return;
      g.åpen = !g.åpen;
      saveState();
      renderListerModal();
    });
    topp.querySelector('[data-gruppe="endre"]').addEventListener('click', () => {
      redigerGruppe = g;
      renderListerModal();
    });
  });
  const ginp = innhold.querySelector('.gruppe-navn-input');
  if (ginp) {
    const g = redigerGruppe;
    let ferdig = false;
    const avslutt = lagre => {
      if (ferdig) return;
      ferdig = true;
      if (lagre) endreGruppenavn(g, ginp.value);
      redigerGruppe = null;
      renderListerModal();
    };
    ginp.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); avslutt(true); }
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); avslutt(false); }
    });
    ginp.addEventListener('blur', () => avslutt(true));
    ginp.focus();
    ginp.select();
  }

  innhold.querySelectorAll('.liste-rad').forEach(rad => {
    const navn = rad.dataset.navn;
    rad.addEventListener('click', e => {
      if (e.target.closest('.liste-knapp, .liste-navn-input, .liste-dra')) return;
      lastListe(navn);
      lukkModal();
    });
    rad.querySelector('[data-liste="endre"]').addEventListener('click', () => {
      redigerListeNavn = navn;
      renderListerModal();
    });
    rad.querySelector('[data-liste="par"]').addEventListener('click', () => {
      lukkModal();
      åpneBegrensningModal(navn);
    });
    rad.querySelector('[data-liste="eksport"]').addEventListener('click', () => eksporterListe(navn));
    // Oppdater og slett krever to trykk: det første gjør knappen om til et spørsmål,
    // og den går tilbake av seg selv etter noen sekunder hvis du ikke trykker igjen.
    toTrykk(rad.querySelector('[data-liste="oppdater"]'), {
      spørsmål: t('Overskriv?'),
      tittel: () => t('Trykk igjen for å erstatte elevene i {navn} med de {antall} elevene på siden', { navn, antall: aktivSide().elever.length }),
      utfør: () => { if (lagreListe(navn)) renderListerModal(); },
    });
    toTrykk(rad.querySelector('[data-liste="slett"]'), {
      spørsmål: t('Slett?'),
      tittel: () => t('Trykk igjen for å slette {navn}', { navn }),
      utfør: () => slettListe(navn),
    });
  });

  // Skrivefeltet for nytt navn: Enter og «mistet fokus» lagrer, Esc avbryter.
  const inp = innhold.querySelector('.liste-navn-input');
  if (inp) {
    const gammelt = redigerListeNavn;
    let ferdig = false;
    const avslutt = lagre => {
      if (ferdig) return;
      ferdig = true;
      if (lagre) endreListenavn(gammelt, inp.value);
      redigerListeNavn = null;
      renderListerModal();
    };
    inp.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); avslutt(true); }
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); avslutt(false); }
    });
    inp.addEventListener('blur', () => avslutt(true));
    inp.focus();
    inp.select();
  }
}

// ===================== Fri flate (layout) =====================
// Hvert kort på en side har { id, x, y, b, h, z } i widget_layout. x og b er prosent
// av flatas bredde, y og h prosent av høyden, og z er hvilket kort som ligger øverst.
// Prosent gjør at bordet beholder komposisjonen fra laptop til tavle. Under et drag
// regner vi i piksler (det er det pekeren gir oss), og gjør om til prosent ved slipp.
//
// `col` står også i hver oppføring. Den brukes ikke lenger, men gjør at en eldre
// versjon av appen fortsatt finner et fornuftig oppsett om vi må rulle tilbake.
//
// DOM: hvert .card pakkes i en .kl-plass som eier posisjon, z-index og håndtakene for
// størrelse. Kortet fyller plassen og scroller selv.

// «card-notat-3» → «notat», «card-klokke» → «klokke».
function kortType(id) {
  return id.replace(/^card-/, '').replace(/-\d+$/, '');
}

function klampTall(v, min, maks) { return Math.max(min, Math.min(maks, v)); }
function rundPst(v) { return Math.round(v * 100) / 100; }

// Plukker ut en gyldig plassering fra en lagret oppføring, eller null. Brukes av
// normaliserState(), så rare verdier fra en importert fil ikke sprenger flata.
function gyldigPlassering(w) {
  const tall = ['x', 'y', 'b', 'h'].map(k => w[k]);
  if (!tall.every(v => typeof v === 'number' && Number.isFinite(v))) return null;
  const b = klampTall(w.b, 5, 100);
  const h = klampTall(w.h, 5, 100);
  return {
    x: klampTall(w.x, 0, 100 - b),
    y: klampTall(w.y, 0, 100 - h),
    b, h,
    z: Number.isInteger(w.z) && w.z > 0 ? w.z : 1,
    ...(w.fast === true && { fast: true }),
    ...(w.anker === 'bunn' && { anker: 'bunn' }),
    ...(typeof w.hMin === 'number' && Number.isFinite(w.hMin) && { hMin: klampTall(w.hMin, 5, 100) }),
  };
}

// Gjør et kolonneoppsett ({ id, col } + kolonner/kol_bredder) om til fri plassering.
// Regnes ut, ikke måles: da virker det likt for alle sider (også de som ikke vises)
// og for importerte filer. Kolonnebreddene blir x og b. Synlige kort i hver kolonne
// deler høyden etter HØYDEVEKT, i samme rekkefølge som før. Skjulte kort får en
// standardstørrelse øverst i kolonnen; de får uansett ny plass når de slås på.
function migrerTilFlate(side) {
  const n = side.kolonner;
  const bredder = side.kol_bredder;
  const sum = bredder.reduce((a, v) => a + v, 0);
  const skjult = new Set(side.widget_hidden);
  let venstre = 0;
  for (let col = 1; col <= n; col++) {
    const andel = bredder[col - 1] / sum * 100;
    const x = venstre + (col > 1 ? LUFT_PST / 2 : 0);
    const b = andel - (col > 1 ? LUFT_PST / 2 : 0) - (col < n ? LUFT_PST / 2 : 0);
    venstre += andel;

    const iKol = side.widget_layout.filter(w => Math.min(w.col, n) === col);
    const synlige = iKol.filter(w => !skjult.has(w.id));
    const vektSum = synlige.reduce((a, w) => a + (HØYDEVEKT[kortType(w.id)] ?? 1.5), 0);
    const tilgjengelig = 100 - LUFT_PST * 1.5 * Math.max(0, synlige.length - 1);
    let y = 0;
    synlige.forEach(w => {
      const h = tilgjengelig * (HØYDEVEKT[kortType(w.id)] ?? 1.5) / vektSum;
      Object.assign(w, { x: rundPst(x), y: rundPst(y), b: rundPst(b), h: rundPst(h) });
      y += h + LUFT_PST * 1.5;
    });
    iKol.filter(w => skjult.has(w.id)).forEach(w => {
      const [, sh] = STANDARD_STØRRELSE[kortType(w.id)] ?? [26, 30];
      Object.assign(w, { x: rundPst(x), y: 0, b: rundPst(b), h: sh });
    });
  }
  side.widget_layout.forEach((w, i) => {
    w.z = i + 1;
    // Kort med fast innhold beholder den utregnede høyden og skalerer innholdet i
    // stedet. Ellers ville de krympet til innholdet ved første lasting og laget hull.
    if (erSkalerKort(w.id)) w.fast = true;
  });
}

function overlapper(a, b, luft = 0) {
  return a.x < b.x + b.b + luft && b.x < a.x + a.b + luft &&
         a.y < b.y + b.h + luft && b.y < a.y + a.h + luft;
}

// Første ledige flate (ovenfra, så fra venstre) med plass til et kort på b × h
// prosent, med litt luft rundt. Bare synlige kort på aktiv side teller. Finnes ingen
// ledig flate, legges kortet litt forskjøvet oppå de andre.
function ledigPlass(b, h, unntattId = null) {
  const side = aktivSide();
  const skjult = side.widget_hidden ?? [];
  const opptatt = side.widget_layout.filter(w => w.id !== unntattId && !skjult.includes(w.id));
  for (let y = 0; y + h <= 100; y += 2) {
    for (let x = 0; x + b <= 100; x += 2) {
      const kandidat = { x, y, b, h };
      if (!opptatt.some(w => overlapper(kandidat, w, LUFT_PST))) return { x, y };
    }
  }
  const n = opptatt.length % 8;
  return { x: klampTall(8 + n * 3, 0, 100 - b), y: klampTall(8 + n * 3, 0, 100 - h) };
}

function høyesteZ() {
  return Math.max(0, ...aktivSide().widget_layout.map(w => w.z ?? 0));
}

// Ny oppføring for et kort som legges til på aktiv side: standardstørrelse, første
// ledige flate, øverst. `col` regnes ut fra x for eldre versjoner (se toppen).
function nyPlassering(id) {
  const [b, h] = STANDARD_STØRRELSE[kortType(id)] ?? [26, 30];
  const { x, y } = ledigPlass(b, h);
  return { id, col: Math.min(3, Math.floor(x / 33.4) + 1), x, y, b, h, z: høyesteZ() + 1 };
}

// Setter et nytt kort-element inn på flata. applyLayout() pakker det i en plass.
function settInnKort(el) {
  document.getElementById('flate').appendChild(el);
}

// Fjerner et kort fra DOM-en, med plassen rundt.
function fjernKortEl(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const plass = el.parentElement?.classList.contains('kl-plass') ? el.parentElement : el;
  plass.remove();
}

// Returnerer .kl-plass rundt kortet, og lager den første gang.
function plassFor(card) {
  if (card.parentElement?.classList.contains('kl-plass')) return card.parentElement;
  const plass = document.createElement('div');
  plass.className = 'kl-plass';
  plass.dataset.kort = card.id;
  plass.innerHTML = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw']
    .map(k => `<div class="kl-kant" data-kant="${k}"></div>`).join('');
  document.getElementById('flate').appendChild(plass);
  plass.appendChild(card);
  return plass;
}

// ===================== Fokusmodus =====================
// ⛶ i overskriften (eller f med musa over kortet) lar ett kort fylle hele vinduet over
// en dempet bakgrunn, med innholdet skalert opp. Esc, f, klikk utenfor eller ✕ lukker.
// Ingenting lagres: plassen (.kl-plass) blir fast over vinduet med en CSS-klasse, og
// kortet skaleres med transform, så x/y/b/h i widget_layout står urørt. Mens fokus er
// på, står høydejusteringen, skaleringen og flyttingen av kort over for dette kortet
// (se fokusKort i planleggHøyde, skalerInnhold og flatas pointerdown), ellers ville de
// målt kortet i fullskjerm og lagret det som ny størrelse.
let fokusKort = null;      // id-en til kortet i fokus, eller null
let sistPekerKort = null;  // kortet musa sist var over, for tasten f
let fokusObservatør = null;

// Legger ✏️ (nytt navn) og ⛶ (fokus) i overskriften på et kort (én gang). Kortet får
// .card-controls om det ikke har det fra før. Klokka får ikke ✏️: overskriften der er
// knappen som bytter visning.
function leggTilFokusKnapp(card) {
  const topp = card.querySelector(':scope > .card-header');
  if (!topp || GUIDE_KORT.includes(card.id) || topp.querySelector('.kl-fokus')) return;
  let kontroller = topp.querySelector('.card-controls');
  if (!kontroller) {
    kontroller = document.createElement('div');
    kontroller.className = 'card-controls';
    topp.appendChild(kontroller);
  }
  const h2 = topp.querySelector('h2');
  if (h2 && card.id !== 'card-klokke') {
    h2.dataset.standard ??= h2.textContent.trim(); // allerede oversatt (oversettStatisk/t)
    const navnKnapp = document.createElement('button');
    navnKnapp.className = 'btn btn-ghost btn-sm btn-icon kl-gi-navn';
    navnKnapp.textContent = '✏️';
    navnKnapp.title = t('Gi kortet et navn');
    navnKnapp.setAttribute('aria-label', navnKnapp.title);
    navnKnapp.addEventListener('click', e => { e.stopPropagation(); startKortNavn(card.id); });
    kontroller.appendChild(navnKnapp);
  }
  const knapp = document.createElement('button');
  knapp.className = 'btn btn-ghost btn-sm btn-icon kl-fokus';
  knapp.textContent = '⛶';
  knapp.title = t('Fokus: fyll skjermen (f)');
  knapp.setAttribute('aria-label', knapp.title);
  knapp.addEventListener('click', e => { e.stopPropagation(); byttFokus(card.id); });
  kontroller.appendChild(knapp);
}

// ===================== Navn på kortene =====================
// ✏️ i overskriften gjør tittelen om til et skrivefelt. Navnet lagres per side i
// s.kort_navn; tomt navn gir standardnavnet tilbake. Klassebamse lagrer i ulv_navn,
// fordi navnet også står i meldingene («Bo tar med Teddy hjem»).
function kortNavn(id, s = aktivSide()) {
  if (id === 'card-ulv') return s.ulv_navn || t('Klassebamse');
  const h2 = document.querySelector(`#${id} > .card-header h2`);
  return s.kort_navn[id] || h2?.dataset.standard || '';
}

// Setter titlene på kortene på aktiv side. Kalles fra applyLayout (sidebytte).
function visKortNavn() {
  document.querySelectorAll('#flate .card > .card-header h2[data-standard]').forEach(h2 => {
    const id = h2.closest('.card').id;
    if (id !== 'card-ulv' && !h2.querySelector('input')) h2.textContent = kortNavn(id);
  });
}

function startKortNavn(id) {
  const h2 = document.querySelector(`#${id} > .card-header h2`);
  if (!h2 || h2.querySelector('input')) return;
  const inp = document.createElement('input');
  inp.type = 'text';
  inp.className = 'kort-navn-input';
  inp.maxLength = 40;
  inp.value = kortNavn(id);
  inp.setAttribute('aria-label', t('Navn på kortet'));
  h2.replaceChildren(inp);
  let ferdig = false;
  const avslutt = lagre => {
    if (ferdig) return;
    ferdig = true;
    const s = aktivSide();
    const nytt = inp.value.trim().slice(0, 40);
    if (lagre) {
      if (id === 'card-ulv') {
        s.ulv_navn = nytt || 'Klassebamse';
      } else if (!nytt || nytt === h2.dataset.standard) {
        delete s.kort_navn[id];
      } else {
        s.kort_navn[id] = nytt;
      }
      saveState();
      renderWidgetStørrelseMeny(); // Skriftstørrelse-menyen viser kortnavnene
    }
    if (id === 'card-ulv') renderUlv();
    else h2.textContent = kortNavn(id);
  };
  inp.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); avslutt(true); }
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); avslutt(false); }
  });
  inp.addEventListener('blur', () => avslutt(true));
  inp.focus();
  inp.select();
}

function byttFokus(id) {
  if (fokusKort === id) lukkFokus();
  else åpneFokus(id);
}

function åpneFokus(id) {
  const card = document.getElementById(id);
  const plass = card?.parentElement;
  if (!plass?.classList.contains('kl-plass') || plass.style.display === 'none') return;
  if (fokusKort) lukkFokus();
  fokusKort = id;
  plass.classList.add('fokus');
  document.body.classList.add('fokus-modus');
  document.getElementById('fokus-bakgrunn').classList.remove('hidden');
  document.getElementById('btn-fokus-lukk').classList.remove('hidden');
  card.querySelector('.kl-skaler')?.style.setProperty('zoom', '');
  skalerFokus();
  // Innholdet kan endre seg i fokus (ny elev, neste punkt, nytt trekk): skaler på nytt.
  let planlagt = false;
  fokusObservatør = new MutationObserver(() => {
    if (planlagt) return;
    planlagt = true;
    requestAnimationFrame(() => { planlagt = false; skalerFokus(); });
  });
  fokusObservatør.observe(card, { childList: true, subtree: true, characterData: true });
}

function lukkFokus() {
  if (!fokusKort) return;
  const card = document.getElementById(fokusKort);
  fokusKort = null;
  fokusObservatør?.disconnect();
  fokusObservatør = null;
  document.body.classList.remove('fokus-modus');
  document.getElementById('fokus-bakgrunn').classList.add('hidden');
  document.getElementById('btn-fokus-lukk').classList.add('hidden');
  if (!card) return;
  card.parentElement?.classList.remove('fokus');
  card.style.width = card.style.height = card.style.transform = card.style.transformOrigin = '';
  // Tilbake på flata: la den vanlige skaleringen og høyden måle kortet på nytt.
  const boks = card.querySelector('.kl-skaler');
  if (boks) skalerInnhold(boks);
  planleggHøyde(card);
}

// Finner største skala der hele kortet får plass i vinduet: kortet legges ut i et
// område på (bredde / z) × (høyde / z) og skaleres med z. Binærsøk som skalerInnhold,
// mellom 0,5 (lange lister i et lavt vindu) og 6.
function skalerFokus() {
  if (!fokusKort) return;
  const card = document.getElementById(fokusKort);
  const plass = card?.parentElement;
  if (!plass) return;
  const B = plass.clientWidth, H = plass.clientHeight;
  card.style.transformOrigin = 'top left';
  const passer = z => {
    card.style.width  = `${B / z}px`;
    card.style.height = `${H / z}px`;
    card.style.transform = `scale(${z})`;
    return card.scrollHeight <= card.clientHeight + 1 && card.scrollWidth <= card.clientWidth + 1;
  };
  let lav = MIN_SKALERING, høy = MAKS_SKALERING;
  if (passer(1)) lav = 1; else høy = 1;
  for (let i = 0; i < 10; i++) {
    const midt = (lav + høy) / 2;
    if (passer(midt)) lav = midt; else høy = midt;
  }
  passer(lav);
}

function settPlassStil(plass, w) {
  plass.style.left   = `${w.x}%`;
  plass.style.top    = `${w.y}%`;
  plass.style.width  = `${w.b}%`;
  plass.style.height = `${w.h}%`;
  plass.style.zIndex = w.z;
}

// Rekkefølgen kortene stables i på smal skjerm: ovenfra og ned, så venstre mot høyre.
function settStabelRekkefølge() {
  [...aktivSide().widget_layout]
    .sort((a, b) => a.y - b.y || a.x - b.x)
    .forEach((w, i) => {
      const plass = document.getElementById(w.id)?.parentElement;
      if (plass?.classList.contains('kl-plass')) plass.style.order = i;
    });
}

// Plasserer hvert widget-kort på flata for aktiv side, og skjuler dem som står i
// widget_hidden eller ikke hører til siden. Kjøres ved sidebytte, slipp og
// widget-endringer.
function applyLayout() {
  const side = aktivSide();
  // Forsikre at de faste (singleton) widgetene finnes (for gamle lagrede states).
  // notat/bilde utelates med vilje: de er flerinstans og eies per side, så de skal
  // IKKE tvinges inn på en side som har sine egne (eller har fjernet dem).
  // Hentes fra nySide(), ikke defaultState(): der ligger guidekortene, og de skal
  // aldri tvinges inn hos noen.
  const defaults = nySide('').widget_layout
    .filter(def => !def.id.startsWith('card-notat-') && !def.id.startsWith('card-bilde-'));
  defaults.forEach(def => {
    if (!side.widget_layout.find(w => w.id === def.id)) {
      side.widget_layout.push(nyPlassering(def.id));
      if (!side.widget_hidden.includes(def.id)) side.widget_hidden.push(def.id);
    }
  });

  lukkFokus(); // sidebytte, kort som skjules osv.: fokus hører til bordet som var
  const skjult = side.widget_hidden ?? [];
  const iLayout = new Map(side.widget_layout.map(w => [w.id, w]));
  document.querySelectorAll('main .card').forEach(card => {
    const plass = plassFor(card);
    const w = iLayout.get(card.id);
    if (!w || skjult.includes(card.id)) { plass.style.display = 'none'; return; }
    plass.style.display = '';
    settPlassStil(plass, w);
    følgInnhold(card);
    leggTilFokusKnapp(card);
  });
  visKortNavn();
  settStabelRekkefølge();

  // Skriftstørrelse-menyen viser bare widgets som er synlige på denne siden.
  renderWidgetStørrelseMeny();
}

// Setter høyden på et kort til det innholdet faktisk trenger, målt i nettleseren og
// regnet om til prosent av flata. Brukes når et kort vises og læreren ikke selv har
// endret størrelsen (w.fast). Da blir klokka akkurat så høy som urskive og tall
// krever, både på en liten laptop og på en stor tavle, i stedet for en fast prosent
// som er for lite på den ene og for mye på den andre.
// Kort som står helt nede (og ikke fra toppen), beholder bunnkanten; ellers står
// toppkanten fast. Med { flytt: false } står toppen alltid fast, og kortet stopper ved
// bunnen av flata i stedet for å skyves opp. Det brukes når høyden følger innholdet
// (følgInnhold), så kortet ikke vandrer mens læreren skriver eller legger til elever.
function tilpassHøyde(w, { flytt = true } = {}) {
  const følger = FØLGER_INNHOLD.includes(kortType(w.id));
  const media = MEDIA_KORT.includes(kortType(w.id));
  if ((w.fast && !følger && !media) || smalSkjerm()) return false;
  const card = document.getElementById(w.id);
  const plass = card?.parentElement;
  if (!plass?.classList.contains('kl-plass') || plass.style.display === 'none') return;
  const flateH = document.getElementById('flate').getBoundingClientRect().height;
  if (!flateH) return;

  const før = plass.style.height;
  const boks = card.querySelector('.kl-skaler');
  if (boks) boks.style.zoom = ''; // mål naturlig størrelse; ResizeObserver skalerer igjen
  plass.style.height = 'auto';
  const innhold = card.getBoundingClientRect().height;
  plass.style.height = før;

  const [, minH] = MIN_STØRRELSE[kortType(w.id)] ?? [160, 100];
  let h = rundPst(klampTall(Math.max(innhold, minH) / flateH * 100, 5, 100));
  if (w.hMin && !media) h = Math.max(h, w.hMin); // aldri lavere enn læreren har dratt det til
  let nyY;
  if (!flytt) {
    // Kortet får vokse i den ledige plassen mellom kortet over og kortet under (med
    // vanlig luft), eller flatekantene. Ellers ville en lang elevliste lagt seg over
    // nabokortene.
    //  - Er det plass under, vokser det nedover (toppen står fast).
    //  - Er det stopp under, vokser det oppover så langt det er plass.
    //  - Står kortet mot det under, holder det bunnkanten også når det krymper, så
    //    det ikke slipper taket og etterlater et tomrom.
    const side = aktivSide();
    const luft = AVSTAND_PX / flateH * 100;
    const naboer = side.widget_layout.filter(o => o !== w && !side.widget_hidden.includes(o.id) &&
      o.x < w.x + w.b && w.x < o.x + o.b);                       // overlapper i bredden
    const bunnGrense = naboer
      .filter(o => o.y >= w.y + w.h - 0.5)                        // står under
      .reduce((min, o) => Math.min(min, o.y - luft), 100);
    const toppGrense = naboer
      .filter(o => o.y + o.h <= w.y + 0.5)                        // står over
      .reduce((maks, o) => Math.max(maks, o.y + o.h + luft), 0);
    const ledig = bunnGrense - toppGrense;
    h = rundPst(Math.min(h, Math.max(ledig, 5)));
    // Ankeret sier hvilken kant som står fast når kortet krymper. Rører kortet bare
    // det under, er det «bunn»; ellers «topp». Rører det begge (det har fylt hele
    // plassen), vet vi ikke ut fra posisjonen, så da gjelder ankeret det hadde før.
    const motBunnen = w.y + w.h >= bunnGrense - 0.5;
    const motToppen = w.y <= toppGrense + 0.5;
    const anker = motBunnen && motToppen ? (w.anker ?? 'topp') : (motBunnen ? 'bunn' : 'topp');
    nyY = anker === 'bunn' || w.y + h > bunnGrense ? bunnGrense - h : w.y;
    nyY = rundPst(klampTall(nyY, toppGrense, Math.max(toppGrense, bunnGrense - h)));
    if (anker === 'bunn') w.anker = 'bunn'; else delete w.anker;
  } else {
    const iBunnen = w.y > 1 && w.y + w.h >= 99;
    nyY = iBunnen ? rundPst(Math.max(0, 100 - h)) : Math.min(w.y, rundPst(100 - h));
  }
  // Mediekort som ikke får plass i høyden: gjør kortet smalere i stedet, så mediet
  // krymper og proporsjonene holder (et høyt bilde skal ikke scrolles).
  let nyB = w.b;
  if (media) {
    const hPx = h / 100 * flateH;
    const medium = card.querySelector('.youtube-media, img[id^="bilde-img"]');
    const mediumH = medium?.offsetParent ? medium.getBoundingClientRect().height : 0;
    if (mediumH && innhold > hPx + 1) {
      const rest = innhold - mediumH;               // overskrift, knapper, luft
      const faktor = Math.max(0.1, (hPx - rest) / mediumH);
      const [minB] = MIN_STØRRELSE[kortType(w.id)] ?? [160, 100];
      const flateB = document.getElementById('flate').getBoundingClientRect().width;
      nyB = rundPst(Math.max(w.b * faktor, minB / flateB * 100));
    }
  }
  if (Math.abs(h - w.h) < 0.05 && Math.abs(nyY - w.y) < 0.05 && Math.abs(nyB - w.b) < 0.05) return false;
  w.h = h;
  w.y = nyY;
  w.b = nyB;
  settPlassStil(plass, w);
  return true;
}

// ===================== Høyde som følger innholdet =====================
// Widgets med voksende innhold (elever, dagsplan, grupper, notat) får høyden til å
// følge innholdet. Har læreren dratt i størrelsen, er den høyden en minstehøyde
// (w.hMin): kortet krymper ikke under den, men vokser når innholdet ikke får plass.
// En ny elev gjør kortet høyere, en slettet gjør det lavere. Er det stopp under, vokser det
// oppover (se tilpassHøyde). Når det ikke er mer ledig plass, stopper det, og
// innholdet scroller.
//
// Vi observerer barna i kortet med ResizeObserver: de er så høye som innholdet sitt,
// også når kortet scroller, så de endrer størrelse når innholdet gjør det. Under et
// drag (pågårOperasjon) står vi over, ellers ville tilpasningen slåss med læreren.
let pågårOperasjon = false;
const observerteKort = new WeakSet();
let følgerVenter = new Set();
let følgerPlanlagt = false;

const følgerObserver = new ResizeObserver(oppføringer =>
  oppføringer.forEach(o => planleggHøyde(o.target.closest('.card'))));

// Ber om at kortets høyde vurderes på nytt i neste bilde. Kalles av observeren, og
// direkte fra notatfeltet: det fyller kortet, så størrelsen endrer seg ikke når
// teksten blir kortere, og observeren ville aldri merket det.
function planleggHøyde(card) {
  if (card) følgerVenter.add(card.id);
  if (følgerPlanlagt) return;
  følgerPlanlagt = true;
  requestAnimationFrame(() => {
    følgerPlanlagt = false;
    const ider = følgerVenter;
    følgerVenter = new Set();
    if (pågårOperasjon || smalSkjerm()) return;
    let endret = false;
    ider.forEach(id => {
      if (id === fokusKort) return; // i fokus måles kortet i fullskjerm: ikke lagre det
      const ta = document.querySelector(`#${id} > textarea[id^="notat-textarea"]`);
      if (ta) målNotatfelt(ta);
      const w = aktivSide().widget_layout.find(x => x.id === id);
      if (w) endret = tilpassHøyde(w, { flytt: false }) || endret;
    });
    if (endret) saveState();
  });
}

// Høyden lagres i prosent av flata. Blir flata lavere (backup-stripa nederst dukker
// opp, eller vinduet blir mindre), blir kortet like mange prosent, men færre piksler,
// og innholdet får ikke plass. Barna i kortet endrer ikke størrelse, så observeren
// over merker ingenting. Derfor følger vi også med på flata selv og måler alle
// voksende kort på nytt når høyden endrer seg. Første måling ved oppstart retter
// kort som ble lagret for lave før denne observeren fantes.
let sistFlateH = 0;
const flateObserver = new ResizeObserver(([o]) => {
  const h = o.contentRect.height;
  if (!h || Math.abs(h - sistFlateH) < 1) return;
  sistFlateH = h;
  document.querySelectorAll('#flate .card').forEach(card => {
    if (FØLGER_INNHOLD.includes(kortType(card.id))) planleggHøyde(card);
  });
});

// Starter observasjonen for et kort med voksende innhold (én gang per kort).
function følgInnhold(card) {
  const type = kortType(card.id);
  if (observerteKort.has(card) || !(FØLGER_INNHOLD.includes(type) || MEDIA_KORT.includes(type))) return;
  observerteKort.add(card);
  [...card.children]
    .filter(el => !el.classList.contains('kl-widget-close'))
    .forEach(el => følgerObserver.observe(el));
}

// ===================== Skalering med kortet =====================
// For widgetene i SKALER_MED_KORT pakkes alt under overskrifta i en .kl-skaler. Når
// kortet er større enn innholdet trenger, får boksen CSS-zoom slik at innholdet fyller
// plassen. Overskrifta skaleres ikke.
//
// To regler, samme skille som for voksende kort:
//  - Har ikke læreren satt størrelsen (w.fast), følger høyden innholdet og zoomen er 1.
//    Da blir trekket høyere når backlog-linja dukker opp.
//  - Har læreren satt størrelsen, finnes zoomen med binærsøk: største faktor der
//    innholdet får plass i både høyde og bredde, mellom MIN_SKALERING og
//    MAKS_SKALERING. Bredden må sjekkes for seg, fordi zoom gjør plassen innholdet ser
//    smalere, og et navn eller en knapperad kan da bryte over flere linjer.
//
// Kjøres når kortet endrer størrelse (ResizeObserver) og når innholdet endrer seg
// (MutationObserver, f.eks. et nytt navn i trekket), samlet til én gang per bilde.
const MAKS_SKALERING = 6;
const MIN_SKALERING = 0.5; // så langt ned skaleres innholdet i et for lite kort

// Observatørene lages én gang (settOppSkalering). pakkSkaler kobler et kort til dem,
// også kort som lages senere (en ny timer eller Tilfeldig elev).
let skalerObservere = null;

function settOppSkalering() {
  const venter = new Set();
  let planlagt = false;
  const planlegg = boks => {
    venter.add(boks);
    if (planlagt) return;
    planlagt = true;
    requestAnimationFrame(() => {
      planlagt = false;
      venter.forEach(skalerInnhold);
      venter.clear();
    });
  };
  skalerObservere = {
    størrelse: new ResizeObserver(oppføringer =>
      oppføringer.forEach(o => planlegg(o.target.querySelector('.kl-skaler')))),
    innhold: new MutationObserver(endringer =>
      endringer.forEach(e => {
        const boks = (e.target.nodeType === 1 ? e.target : e.target.parentElement)?.closest('.kl-skaler');
        if (boks) planlegg(boks);
      })),
  };
  document.querySelectorAll('.card[id]').forEach(card => { if (erSkalerKort(card.id)) pakkSkaler(card); });
}

// Pakker alt under overskrifta i en .kl-skaler og følger med på størrelse og innhold.
function pakkSkaler(card) {
  if (!card || !skalerObservere || card.querySelector('.kl-skaler')) return;
  const boks = document.createElement('div');
  boks.className = 'kl-skaler';
  [...card.children]
    .filter(el => !el.classList.contains('card-header') && !el.classList.contains('kl-widget-close'))
    .forEach(el => boks.appendChild(el));
  card.appendChild(boks);
  skalerObservere.størrelse.observe(card);
  // class/hidden fanger innhold som vises og skjules med en klasse (f.eks.
  // backlog-linja i trekket). Ikke style: det er der vi selv setter zoomen.
  skalerObservere.innhold.observe(boks, { childList: true, subtree: true, characterData: true,
                                          attributes: true, attributeFilter: ['class', 'hidden'] });
}

function skalerInnhold(boks) {
  if (!boks) return;
  boks.style.zoom = '';
  if (boks.closest('.card')?.id === fokusKort) return; // fokus skalerer hele kortet
  if (smalSkjerm() || !boks.offsetParent) return;
  const card = boks.closest('.card');
  const w = aktivSide().widget_layout.find(x => x.id === card.id);
  const passer = z => {
    boks.style.zoom = String(z);
    return boks.scrollHeight <= boks.clientHeight + 1 && boks.scrollWidth <= boks.clientWidth + 1;
  };

  let lav, høy;
  if (w && !w.fast) {
    // Ikke satt av læreren: høyden følger innholdet (tilpassHøyde endrer plassen med
    // én gang, så vi kan måle rett etterpå). Får kortet ikke vokse nok fordi det
    // treffer andre kort, skaleres innholdet ned i stedet. Aldri opp.
    if (!pågårOperasjon && tilpassHøyde(w, { flytt: false })) saveState();
    if (passer(1)) { boks.style.zoom = ''; return; }
    lav = MIN_SKALERING; høy = 1;
  } else if (passer(1)) {
    // Satt av læreren og plass til overs: skaler opp.
    lav = 1; høy = MAKS_SKALERING;
  } else {
    // Satt av læreren og for lite: skaler ned, så knappene aldri kuttes.
    lav = MIN_SKALERING; høy = 1;
  }
  for (let i = 0; i < 8; i++) {
    const midt = (lav + høy) / 2;
    if (passer(midt)) lav = midt; else høy = midt;
  }
  // Små oppskaleringer (under 2 %) hoppes over, så innholdet ikke hopper av støy.
  // Nedskalering brukes alltid: der teller hver piksel, ellers kuttes knappene.
  boks.style.zoom = lav < 1 || lav > 1.02 ? String(lav) : '';
}

// Gir kortet høyest z, og nummererer de andre 1..n på nytt så tallene ikke vokser
// for evig. Lagrer ikke selv: kalleren gjør det.
function løftFram(id) {
  const layout = aktivSide().widget_layout;
  const kort = layout.find(w => w.id === id);
  if (!kort || kort.z === høyesteZ()) return false;
  const sortert = layout.filter(w => w !== kort).sort((a, b) => a.z - b.z);
  sortert.push(kort);
  sortert.forEach((w, i) => {
    w.z = i + 1;
    const plass = document.getElementById(w.id)?.parentElement;
    if (plass?.classList.contains('kl-plass')) plass.style.zIndex = w.z;
  });
  return true;
}

// Finner den nærmeste magneten for en av kantene. Returnerer { delta, linje } for
// kanten som er nærmest (innenfor MAGNET_PX), eller null.
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

// Magnetkandidater langs én akse: for «start»-kanten (venstre/topp) og «slutt»-
// kanten (høyre/bunn). Flatekanten, flukt med et annet kort, eller rett ved siden av
// det med AVSTAND_PX luft. pos/str er 'x','b' eller 'y','h'.
function magnetKandidater(andre, pos, str, total) {
  const start = [0];
  const slutt = [total];
  andre.forEach(o => {
    start.push(o[pos], o[pos] + o[str] + AVSTAND_PX);
    slutt.push(o[pos] + o[str], o[pos] - AVSTAND_PX);
  });
  return { start, slutt };
}

function visHjelpelinjer(loddrett, vannrett) {
  const flate = document.getElementById('flate');
  flate.querySelectorAll('.kl-hjelpelinje').forEach(l => l.remove());
  for (const [verdi, retning, egenskap] of [[loddrett, 'loddrett', 'left'], [vannrett, 'vannrett', 'top']]) {
    if (verdi == null) continue;
    const l = document.createElement('div');
    l.className = `kl-hjelpelinje ${retning}`;
    l.style[egenskap] = `${verdi}px`;
    flate.appendChild(l);
  }
}

const smalSkjerm = () => window.matchMedia('(max-width: 960px)').matches;

// Kobler flytting og størrelse for alle kort med én lytter på flata, så nye kort
// virker uten ny oppkobling. Overskrifta er dra-sona (knapper og felt i den virker
// som før), og kantene endrer størrelse. Peker-hendelser, så det virker med mus,
// penn og touch-tavle.
function settOppFlate() {
  const flate = document.getElementById('flate');
  flate.addEventListener('pointerdown', e => {
    const plass = e.target.closest('.kl-plass');
    if (!plass || e.button !== 0 || fokusKort) return; // i fokus flyttes ingenting
    const id = plass.dataset.kort;
    if (løftFram(id)) saveState();
    if (smalSkjerm()) return;

    const kant = e.target.closest('.kl-kant')?.dataset.kant ?? null;
    const iOverskrift = e.target.closest('.card-header') &&
      !e.target.closest('button, input, select, textarea, a, label, [contenteditable="true"]');
    if (!kant && !iOverskrift) return;
    startOperasjon(e, plass, id, kant);
  });
}

// kant = null betyr flytt hele kortet; ellers en av n, s, e, w, ne, nw, se, sw.
function startOperasjon(e, plass, id, kant) {
  const w = aktivSide().widget_layout.find(x => x.id === id);
  if (!w) return;
  // Mediekort: bare bredden kan endres. Hjørnene blir rene sidekanter, og høyden
  // følger innholdet underveis (height: auto) og måles ved slipp.
  const media = MEDIA_KORT.includes(kortType(id));
  if (media && kant) {
    kant = kant.replace(/[ns]/g, '');
    if (!kant) return;
  }
  if (kant) e.preventDefault(); // flytting venter på terskelen, så klikk virker

  const flate = document.getElementById('flate');
  const fr = flate.getBoundingClientRect();
  const W = fr.width;
  const H = fr.height;
  const skjult = aktivSide().widget_hidden ?? [];
  const tilPx = k => ({ x: k.x / 100 * W, y: k.y / 100 * H, b: k.b / 100 * W, h: k.h / 100 * H });
  const start = tilPx(w);
  const andre = aktivSide().widget_layout
    .filter(k => k !== w && !skjult.includes(k.id) && document.getElementById(k.id))
    .map(tilPx);
  const kx = magnetKandidater(andre, 'x', 'b', W);
  const ky = magnetKandidater(andre, 'y', 'h', H);
  const [minB0, minH0] = MIN_STØRRELSE[kortType(id)] ?? [160, 100];
  const minB = Math.min(minB0, W);
  const minH = Math.min(minH0, H);
  const startX = e.clientX;
  const startY = e.clientY;
  const pekerId = e.pointerId;
  let i_gang = !!kant;   // flytting starter først etter DRA_TERSKEL_PX
  let r = { ...start };

  const begynn = () => {
    i_gang = true;
    pågårOperasjon = true;
    try { flate.setPointerCapture(pekerId); } catch { /* pekeren kan være borte */ }
    plass.classList.add('kl-aktiv');
    document.body.classList.add(kant ? 'kl-endrer-storrelse' : 'kl-flytter');
  };
  if (kant) begynn();

  function vedFlytt(ev) {
    if (ev.pointerId !== pekerId) return;
    const dx = ev.clientX - startX;
    const dy = ev.clientY - startY;
    if (!i_gang) {
      if (Math.hypot(dx, dy) < DRA_TERSKEL_PX) return;
      begynn();
    }
    ev.preventDefault();
    const magnet = !ev.altKey;
    let linjeX = null;
    let linjeY = null;

    if (!kant) {
      r = { ...start, x: start.x + dx, y: start.y + dy };
      if (magnet) {
        const mx = nærmesteMagnet([r.x, r.x + r.b], [kx.start, kx.slutt]);
        if (mx) { r.x += mx.delta; linjeX = mx.linje; }
        const my = nærmesteMagnet([r.y, r.y + r.h], [ky.start, ky.slutt]);
        if (my) { r.y += my.delta; linjeY = my.linje; }
      }
      r.x = klampTall(r.x, 0, Math.max(0, W - r.b));
      r.y = klampTall(r.y, 0, Math.max(0, H - r.h));
    } else {
      // Bare kantene man drar i, flytter seg. Den motsatte kanten står fast, så kortet
      // ikke «vandrer» når det treffer minstestørrelsen.
      const høyre = start.x + start.b;
      const bunn  = start.y + start.h;
      r = { ...start };
      if (kant.includes('e')) {
        let ny = høyre + dx;
        const m = magnet && nærmesteMagnet([ny], [kx.slutt]);
        if (m) { ny += m.delta; linjeX = m.linje; }
        r.b = klampTall(ny - start.x, minB, W - start.x);
      }
      if (kant.includes('w')) {
        let ny = start.x + dx;
        const m = magnet && nærmesteMagnet([ny], [kx.start]);
        if (m) { ny += m.delta; linjeX = m.linje; }
        r.x = klampTall(ny, 0, høyre - minB);
        r.b = høyre - r.x;
      }
      if (kant.includes('s')) {
        let ny = bunn + dy;
        const m = magnet && nærmesteMagnet([ny], [ky.slutt]);
        if (m) { ny += m.delta; linjeY = m.linje; }
        r.h = klampTall(ny - start.y, minH, H - start.y);
      }
      if (kant.includes('n')) {
        let ny = start.y + dy;
        const m = magnet && nærmesteMagnet([ny], [ky.start]);
        if (m) { ny += m.delta; linjeY = m.linje; }
        r.y = klampTall(ny, 0, bunn - minH);
        r.h = bunn - r.y;
      }
    }

    plass.style.left   = `${r.x}px`;
    plass.style.top    = `${r.y}px`;
    plass.style.width  = `${r.b}px`;
    plass.style.height = media && kant ? 'auto' : `${r.h}px`;
    visHjelpelinjer(linjeX, linjeY);
  }

  function vedSlipp(ev) {
    if (ev.pointerId !== pekerId) return;
    document.removeEventListener('pointermove', vedFlytt);
    document.removeEventListener('pointerup', vedSlipp);
    document.removeEventListener('pointercancel', vedSlipp);
    if (!i_gang) return; // bare et klikk i overskrifta
    pågårOperasjon = false;
    plass.classList.remove('kl-aktiv');
    document.body.classList.remove('kl-flytter', 'kl-endrer-storrelse');
    visHjelpelinjer(null, null);

    w.x = rundPst(r.x / W * 100);
    w.y = rundPst(r.y / H * 100);
    w.b = rundPst(r.b / W * 100);
    w.h = rundPst(r.h / H * 100);
    w.col = Math.min(3, Math.floor(w.x / 33.4) + 1);
    if (kant) {
      // Læreren har valgt størrelsen selv. For voksende kort er høyden en minstehøyde
      // (de vokser fortsatt når innholdet ikke får plass); for de andre står den fast.
      w.fast = true;
      if (FØLGER_INNHOLD.includes(kortType(w.id))) w.hMin = w.h;
    }
    delete w.anker;          // ny plass: ankeret regnes ut på nytt fra posisjonen
    settPlassStil(plass, w); // tilbake til prosent
    if (media) tilpassHøyde(w, { flytt: false });
    settStabelRekkefølge();
    saveState();
  }

  document.addEventListener('pointermove', vedFlytt);
  document.addEventListener('pointerup', vedSlipp);
  document.addEventListener('pointercancel', vedSlipp);
}

// Bygger innholdet i ⊞ Widgets-nedtrekket: av/på-avkrysning for enkeltinstans-
// widgets, og «+»-knapper for å legge til flere notat-/bilde-kort (med antall vist).
function renderWidgetMeny() {
  const dropdown = document.getElementById('widget-dropdown');
  const skjult = aktivSide().widget_hidden ?? [];

  // Single-instance widgets: av/på-checkbox (per side, som før)
  const statiske = Object.entries(WIDGET_NAVN).map(([id, navn]) => `
    <label class="widget-meny-rad">
      <input type="checkbox" ${skjult.includes(id) ? '' : 'checked'}
             data-endring="widget-synlig" data-widget="${id}">
      <span class="widget-meny-ikon" aria-hidden="true">${WIDGET_IKON[id]}</span>
      <span>${t(navn)}</span>
    </label>`).join('');

  // Fler-instans widgets: ingen checkbox, bare "+". Tell hvor mange siden har.
  const aktivIds = aktivSide().widget_layout.map(w => w.id);
  const antNotat   = aktivIds.filter(id => id.startsWith('card-notat-')).length;
  const antTimer   = aktivIds.filter(id => id.startsWith('card-timer-')).length;
  const antTilf    = aktivIds.filter(id => id.startsWith('card-tilfeldig-')).length;
  const antBilde   = aktivIds.filter(id => id.startsWith('card-bilde-')).length;
  const antYoutube = aktivIds.filter(id => id.startsWith('card-youtube-')).length;
  const leggTil = `
    <div class="widget-meny-sep"></div>
    <div class="widget-meny-tittel">${t('Legg til flere')}</div>
    <div class="widget-meny-rad" style="gap:6px;flex-wrap:wrap">
      <button class="btn btn-ghost btn-sm" data-klikk="ny-tilfeldig">${t('+ 🙋 Tilfeldig elev')}${antTilf ? ` (${antTilf})` : ''}</button>
      <button class="btn btn-ghost btn-sm" data-klikk="ny-timer">${t('+ ⏱ Timer')}${antTimer ? ` (${antTimer})` : ''}</button>
      <button class="btn btn-ghost btn-sm" data-klikk="ny-notat">${t('+ 📝 Notat')}${antNotat ? ` (${antNotat})` : ''}</button>
      <button class="btn btn-ghost btn-sm" data-klikk="ny-bilde">${t('+ 🖼 Bilde')}${antBilde ? ` (${antBilde})` : ''}</button>
      <button class="btn btn-ghost btn-sm" data-klikk="ny-youtube">+ ▶️ YouTube${antYoutube ? ` (${antYoutube})` : ''}</button>
    </div>`;

  dropdown.innerHTML = statiske + leggTil;
}

// Skrur en widget av/på for aktiv side ved å legge id-en til eller fjerne den fra
// widget_hidden.
//
// Når et kort slås PÅ, kommer det tilbake der det sto hvis plassen er ledig. Er den
// dekket av andre kort, beholder det størrelsen, men flyttes til første ledige flate.
// Uansett legges det øverst. Slik får nye brukere klokka nederst til venstre, og en
// lærer som skrur et kort av og på, finner det igjen der det var.
// Fjerner et guidekort for godt: ut av oppsettet og ut av DOM-en.
function fjernGuide(id) {
  if (!GUIDE_KORT.includes(id)) return;
  for (const side of state.sider) {
    side.widget_layout = side.widget_layout.filter(w => w.id !== id);
    side.widget_hidden = side.widget_hidden.filter(h => h !== id);
  }
  fjernKortEl(id);
  saveState();
}

function toggleWidgetSynlighet(id, synlig) {
  const skjult = aktivSide().widget_hidden ?? [];
  aktivSide().widget_hidden = synlig
    ? skjult.filter(h => h !== id)
    : [...skjult, id];

  let w = null;
  if (synlig) {
    w = aktivSide().widget_layout.find(x => x.id === id);
    if (w) {
      // Vis kortet først, så høyden kan måles, og velg plass etterpå.
      applyLayout();
      tilpassHøyde(w);
      const andre = aktivSide().widget_layout
        .filter(x => x.id !== id && !aktivSide().widget_hidden.includes(x.id));
      if (andre.some(x => overlapper(w, x))) Object.assign(w, ledigPlass(w.b, w.h, id));
      w.z = høyesteZ() + 1;
    }
  }

  saveState();
  applyLayout();
  renderWidgetMeny();
}

// ===================== Sider =====================
// Manuell dobbeltklikk-deteksjon: fanene bygges på nytt ved hvert klikk
// (byttSide → renderSiderNav), så de to klikkene i et dobbeltklikk lander på
// ulike DOM-noder og nettleserens dblclick-event fyrer ikke pålitelig. Vi måler
// derfor selv tiden mellom to klikk på samme fane — andre klikk åpner omdøping.
let sisteSideKlikk = { idx: -1, tid: 0 };
function håndterSideKlikk(idx) {
  const nå = Date.now();
  if (sisteSideKlikk.idx === idx && nå - sisteSideKlikk.tid < 400) {
    sisteSideKlikk = { idx: -1, tid: 0 };
    startSideRename(idx);
  } else {
    sisteSideKlikk = { idx, tid: nå };
    byttSide(idx);
  }
}

// Tegner fane-raden for sidene: én knapp per side (aktiv side markert), en ✕ for å
// slette (vises kun når det finnes mer enn én side), og en «+» for å legge til side.
function renderSiderNav() {
  const nav = document.getElementById('sider-nav');
  if (!nav) return;
  nav.innerHTML = '';
  state.sider.forEach((side, idx) => {
    const btn = document.createElement('button');
    btn.className = 'side-tab' + (idx === state.aktiv_side ? ' aktiv' : '');
    btn.textContent = side.navn;
    btn.onclick = () => håndterSideKlikk(idx);
    btn.title = t('Dobbeltklikk for å gi nytt navn');
    if (state.sider.length > 1) {
      const x = document.createElement('span');
      x.className = 'side-slett';
      x.textContent = '✕';
      x.onclick = e => { e.stopPropagation(); fjernSide(idx); };
      btn.appendChild(x);
    }
    nav.appendChild(btn);
  });
  const leggTil = document.createElement('button');
  leggTil.className = 'side-legg-til';
  leggTil.textContent = '+';
  leggTil.title = t('Legg til side');
  leggTil.onclick = leggTilSide;
  nav.appendChild(leggTil);
}

// Inline omdøping: dobbeltklikk på en fane bytter den til et tekstfelt.
// Enter / klikk utenfor lagrer, Esc avbryter, tomt navn beholder det gamle.
function startSideRename(idx) {
  const nav = document.getElementById('sider-nav');
  // Klikkene som inngår i dobbeltklikket har allerede kjørt byttSide() →
  // renderSiderNav(), så den opprinnelige fane-knappen er løsrevet fra DOM.
  // Finn derfor den LEVENDE fanen på nytt før vi bytter den ut med tekstfeltet.
  const tab = nav && nav.children[idx];
  if (!tab) return;
  const input = document.createElement('input');
  input.className = 'side-tab-input';
  input.value = state.sider[idx].navn;
  input.maxLength = 30;
  tab.replaceWith(input);
  input.focus();
  input.select();
  let ferdig = false;
  const avslutt = lagre => {
    if (ferdig) return;
    ferdig = true;
    if (lagre) {
      const nytt = input.value.trim();
      if (nytt) { state.sider[idx].navn = nytt; saveState(); }
    }
    renderSiderNav();
  };
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter')  { e.preventDefault(); avslutt(true); }
    if (e.key === 'Escape') { e.preventDefault(); avslutt(false); }
  });
  input.addEventListener('blur', () => avslutt(true));
}

// Bytter til side `idx`: setter aktiv side, plasserer kortene på nytt og re-rendrer
// ALT per-side-innhold for den nye siden. Timeren røres ikke — den er global.
function byttSide(idx) {
  state.aktiv_side = idx;
  saveState();
  applyLayout();
  // Re-rendre all per-side data for den nye siden (timerne går videre i bakgrunnen)
  renderElever();
  renderAlleTrekk();
  renderGrupper();
  renderDagsplan();
  renderArbeid();
  renderTrafikklys();
  oppdaterBegrensningSelecter();
  renderWidgetMeny();
  renderSiderNav();
}

// Oppretter en ny, tom side og bytter til den. Den får egne notat- og bilde-
// instanser (ellers ville den delt innhold med side 1), og starter med alle widgets
// skjult — læreren henter fram det hun trenger via ⊞ Widgets.
function leggTilSide() {
  const nr = state.sider.length + 1;
  const side = nySide(`Side ${nr}`);
  // Gi den nye siden sin EGEN notat-instans, ellers ville den delt card-notat-1
  // (og dermed innholdet) med side 1. Bildekort lages ikke her: de er opt-in via
  // «+ 🖼 Bilde», og en instans uten plass i widget_layout ville blitt foreldreløs.
  const notatId = `notat-${++state.notat_teller}`;
  state.notater[notatId] = { tekst: '', kursiv: false };
  side.widget_layout = side.widget_layout.map(w =>
    w.id === 'card-notat-1' ? { ...w, id: `card-${notatId}` } : w
  );
  // Ny side starter tom: alle widgets skjules som default. Læreren henter dem
  // fram igjen via ⊞ Widgets-menyen, og de havner da på første ledige flate.
  side.widget_hidden = side.widget_layout.map(w => w.id);
  state.sider.push(side);
  // Opprett DOM-elementene for de nye instansene (applyLayout plasserer/skjuler dem ved byttSide)
  const notatEl = lagNotatElement(notatId);
  settInnKort(notatEl);
  setupNotat(notatId);
  byttSide(state.sider.length - 1);
}

// Sletter en side. Siste side kan ikke slettes (det må alltid finnes minst én).
// Etterpå byttes det til en gyldig nabo-side, som re-rendrer alt.
function fjernSide(idx) {
  if (state.sider.length <= 1) return;
  // Timere og Tilfeldig elev-kopier hører til siden: de må stoppes og slettes, ellers
  // tikker en timer videre uten kort og piper når tiden er ute.
  for (const w of state.sider[idx].widget_layout) {
    const id = w.id.replace(/^card-/, '');
    if (kortType(w.id) === 'timer' && state.timere[id]) kastTimer(id);
    if (kortType(w.id) === 'tilfeldig' && state.tilfeldige[id]) kastTilfeldig(id);
  }
  state.sider.splice(idx, 1);
  // byttSide lagrer og re-rendrer alt (layout + per-side data) for den nye aktive siden
  byttSide(Math.min(state.aktiv_side, state.sider.length - 1));
}

// ===================== Reset =====================
// Hver nullstill*-funksjon tømmer ett enkelt trekk/widget på aktiv side: tøm
// valgt + backlog, lagre, tegn på nytt og varsle. Brukes fra knappene på kortene.
function nullstillTilfeldig(kort = 'card-tilfeldig') { const x = tilfeldigTilstand(trekk(), kort); x.valgt = null; x.backlog = []; saveState(); renderTilfeldig(kort); notify(t('🙋 Tilfeldig-trekk nullstilt')); }
function nullstillOrdenselev()  { const r = trekk(); r.ordenselev_valgte = []; r.ordenselev_backlog = []; r.ordenselev_skyldig = []; saveState(); renderOrdenselev(); notify(t('⭐ Ordenselever-trekk nullstilt')); }
function nullstillUlv()         { const r = trekk(); r.ulv_valgt = null; r.ulv_backlog = []; r.ulv_skyldig = []; saveState(); renderUlv(); notify(t('{bamse}-trekket er nullstilt', { bamse: aktivSide().ulv_navn })); }
function nullstillDagsplan()    { aktivSide().dagsplan = []; saveState(); renderDagsplan(); notify(t('📋 Dagsplan nullstilt')); }

// ===================== Info modal =====================
// Ferdig HTML som vises i info-modalen via åpneInfoModal(). Disse to strengene er
// «innholdet» bak Klasserom-menyens to lenker. NB (se CLAUDE.md): når en brukersynlig
// funksjon endres, skal OPPDATERINGSLOGG_HTML og BRUKERVEILEDNING_HTML oppdateres i
// samme commit. Nyeste versjonsblokk legges øverst.
const OPPDATERINGSLOGG_HTML = `
  <!-- Kort utgave av ROADMAP.md. Endres planen, oppdater begge stedene. -->
  <details class="logg-roadmap">
    <summary>🗺️ Hva kommer? Se planen videre</summary>
    <p>Dette er ideer, ikke løfter. Rekkefølgen kan endre seg. Savner du noe? Si fra via <strong>💬 Tilbakemelding</strong>.</p>
    <strong>Neste</strong>
    <ul>
      <li>🔢 <strong>Teller, instruksjonskort, nedtelling til en dato og ukenummer</strong></li>
      <li>📑 <strong>Maler for sider,</strong> og deling av en side med en kollega, uten elevnavn</li>
    </ul>
    <strong>Senere</strong>
    <ul>
      <li>🔊 Lydnivåmåler med rekord og mål for klassen</li>
      <li>👀 «Øyne hit»-beskjed over hele skjermen, med din egen tekst</li>
      <li>🪑 Klassekart og 🗓 ukeplan</li>
      <li>🎡 Lykkehjul som valg i Tilfeldig elev</li>
      <li>🃏 Kortbunke med forside og bakside</li>
      <li>🏆 Poengtavle, 🙂 exit-avstemning og rask håndsopprekning</li>
      <li>🎂 Bursdager i toppfeltet, 🤸 bevegelsespause og lydeffekter</li>
      <li>✏️ Tegnebrett, 🔳 QR-kode og skjermteppe</li>
    </ul>
  </details>
  <div class="logg-entry">
    <div class="logg-versjon">v2.49</div>
    <div class="logg-dato">4. november 2026</div>
    <ul>
      <li>Fikset: slettet du en side med en timer som gikk, fortsatte den å gå uten kort og pep når tiden var ute</li>
      <li>Fikset: tok du en elev ut av en side som er koblet til en klasseliste, mistet eleven turen sin i trekkene på alle sider med samme liste. Nå beholder lista turen så lenge eleven står i lista. Telleren «i backlog» teller bare elever som står på siden</li>
      <li>Fikset: med Skoledash i to faner kunne den synlige fanen få varselet «endret i en annen fane» uten at noe var endret. En fane som ikke vises, venter nå med å lagre til den vises igjen</li>
      <li>Fikset: <kbd>r</kbd> trakk i et skjult Tilfeldig elev-kort uten beskjed. Nå gjelder tasten det første synlige kortet, og sier fra hvis det ikke finnes noe</li>
      <li>Fikset: <kbd>t</kbd> i fokus på en side uten timer lukket fokus og startet en ny timer i det stille</li>
      <li>Fikset: «Slett alle data» i én fane kunne bli angret av en annen fane som lagret rett etterpå</li>
      <li>På tavler uten mus står knappene øverst i kortene (✏️ ⛶ 🔄 🧹) alltid framme</li>
    </ul>
  </div>
  <div class="logg-entry">
    <div class="logg-versjon">v2.48</div>
    <div class="logg-dato">4. november 2026</div>
    <ul>
      <li><strong>Flere timere:</strong> <strong>+ ⏱ Timer</strong> under ⊞ Kort legger til så mange timere du vil. De hører til siden de er laget på, har hver sin tid og går videre i bakgrunnen når du bytter side. Den gamle felles timeren er blitt en vanlig timer på hver side der den var i bruk</li>
      <li><strong>Flere Tilfeldig elev:</strong> <strong>+ 🙋 Tilfeldig elev</strong> gir et kort til, med sin egen backlog</li>
      <li><strong>✏️ Gi kortene egne navn,</strong> for eksempel «Gruppearbeid» på en timer. Navnet gjelder siden, og varselet sier hvilken timer som er ferdig</li>
      <li>Overskriftene på kortene er uten emoji, så de er roligere å se på. Ikonene står fortsatt i ⊞ Kort</li>
    </ul>
  </div>
  <div class="logg-entry">
    <div class="logg-versjon">v2.47</div>
    <div class="logg-dato">4. november 2026</div>
    <ul>
      <li><strong>Nytt kort: 🤫 Arbeidssymboler.</strong> Vis et stort arbeidssymbol: Stille arbeid, Hviskestemme, Pararbeid, Gruppearbeid, Rekk opp hånda eller Se hit. Lag egne symboler med ＋</li>
      <li><strong>Nytt kort: 🚦 Trafikklys</strong> med rødt, gult og grønt. Hva fargene betyr, avtaler du med klassen</li>
      <li>Begge finnes under ⊞ Kort</li>
    </ul>
  </div>
  <div class="logg-entry">
    <div class="logg-versjon">v2.46</div>
    <div class="logg-dato">4. november 2026</div>
    <ul>
      <li><strong>🔍 Fokus:</strong> ⛶ øverst i et kort, eller tasten <kbd>f</kbd>, lar kortet fylle hele skjermen med stort innhold. Alt virker som vanlig i fokus, og <kbd>Esc</kbd> lukker. Kortet beholder plassen og størrelsen sin på bordet</li>
    </ul>
  </div>
  <div class="logg-entry">
    <div class="logg-versjon">v2.45</div>
    <div class="logg-dato">4. november 2026</div>
    <ul>
      <li><strong>Alle kortene følger temaet:</strong> Ordenselever, Klassebamse og Timer brukte faste gule, brune og grønne farger. Nå bruker de temaets farger, som resten av appen</li>
      <li>Knappene øverst i kortene (som 📝 og 🔄) legger seg oppå tittelen når du holder musa over kortet, i stedet for å ta plass fra den. Lange titler som «⭐ Ordenselever» står nå på én linje</li>
      <li>Fikset: i et smalt elevkort ble <strong>🧹 Tøm</strong> kuttet. Knappene brytes nå til en ny linje</li>
    </ul>
  </div>
  <div class="logg-entry">
    <div class="logg-versjon">v2.44</div>
    <div class="logg-dato">4. november 2026</div>
    <ul>
      <li><strong>Dagsplanen viser hvor dere er:</strong> punktet som pågår, er uthevet. <strong>▶ Neste</strong> eller tasten <kbd>p</kbd> krysser det av og går videre, og <kbd>Shift</kbd>+<kbd>P</kbd> angrer</li>
      <li>⏸ Stopp-knappen i timeren følger temaets farge i stedet for å være oransje (brun i noen temaer)</li>
      <li>Fikset: hadde en annen fane nettopp lagret, kunne en lagring som lå i kø i denne fanen skrive over den. Nå sjekker Skoledash hva som ligger lagret før den skriver</li>
    </ul>
  </div>
  <div class="logg-entry">
    <div class="logg-versjon">v2.43</div>
    <div class="logg-dato">4. november 2026</div>
    <ul>
      <li><strong>⏱ Stoppeklokke:</strong> fanene øverst i timerkortet bytter mellom nedtelling og stoppeklokke. Stoppeklokka teller oppover, også forbi en time, og går videre selv om du ser på nedtellingen</li>
      <li><strong>◔ Timeglass-skive:</strong> vis tiden som en skive som krymper i stedet for bjelken. Valget huskes</li>
      <li>Fikset: mens siden lastet inn på nytt, kunne den lagre den gamle tilstanden over data som nettopp var skrevet. Nå lagrer siden ingenting mens den lukkes</li>
    </ul>
  </div>
  <div class="logg-entry">
    <div class="logg-versjon">v2.42</div>
    <div class="logg-dato">4. november 2026</div>
    <ul>
      <li><strong>Ordne klasselistene:</strong> dra i ⠿ for å endre rekkefølgen i Lister-menyen</li>
      <li><strong>Grupper av lister:</strong> slipp en liste midt på en annen, så blir de en gruppe du kan gi navn, folde sammen og flytte. Som mapper i startmenyen i Windows</li>
      <li>Fikset: lister med tall som navn (som «8») havnet alltid øverst</li>
    </ul>
  </div>
  <div class="logg-entry">
    <div class="logg-versjon">v2.41</div>
    <div class="logg-dato">4. november 2026</div>
    <ul>
      <li><strong>⚙️ Nullstill heter nå 💾 Data</strong> og samler 📤 Eksporter backup, 📥 Importer backup og 🗑 Slett alle data. Eksport og import er flyttet hit fra 🏫-menyen</li>
      <li><strong>Nullstill rett på kortet:</strong> 🔄 på Ordenselever og Klassebamse, 🧹 på Dagsplan. De spør først, så ingenting forsvinner ved et uhell. «Fjern elever…» er erstattet av ✕ per elev og 🧹 Tøm i elevkortet</li>
    </ul>
  </div>
  <div class="logg-entry">
    <div class="logg-versjon">v2.40</div>
    <div class="logg-dato">4. november 2026</div>
    <ul>
      <li><strong>Trygt med flere faner:</strong> har du Skoledash åpen i to faner, skriver de ikke lenger over hverandres endringer. En fane som er utdatert, slutter å lagre og lastes inn på nytt når du går tilbake til den</li>
      <li><strong>Timeren går riktig i bakgrunnen:</strong> den regner ut tiden fra klokka, så den ikke går for sakte mens du viser noe i en annen fane. Den fortsetter også etter at siden er lastet inn på nytt</li>
      <li><strong>Du får beskjed hvis lagringen feiler,</strong> i stedet for at endringene forsvinner i det stille</li>
      <li><strong>«● Ueksporterte endringer»</strong> viser hvor lenge det er siden forrige backup, og Skoledash ber nettleseren om å ikke rydde bort dataene</li>
      <li>Lagringen har fått et versjonsnummer, så en eldre versjon av appen aldri lagrer over data fra en nyere</li>
    </ul>
  </div>
  <div class="logg-entry">
    <div class="logg-versjon">v2.39</div>
    <div class="logg-dato">4. november 2026</div>
    <ul>
      <li><strong>Trekkene huskes per klasseliste.</strong> Hvem som har vært ordenselev, hatt klassebamsen og blitt trukket, følger lista. Bytter du til en annen liste og tilbake, er alt der fortsatt, og to sider med samme liste deler trekkene</li>
      <li><strong>Ordenselever og klassebamsen går i runder av seg selv.</strong> Når alle har hatt tur, starter en ny runde, og du får beskjed. Er det én ordenselev igjen, kommer den eleven med i første trekk i den nye runden</li>
      <li><strong>Par som ikke skal i samme gruppe, blir heller ikke ordenselever sammen.</strong> Blir en elev sperret på slutten av en runde, får eleven turen sin i neste trekk</li>
      <li><strong>Én eller to ordenselever:</strong> 👥 øverst i Ordenselever-kortet bytter til 👤 for én ordenselev per trekk. Valget følger lista</li>
      <li><strong>Ingen mister turen sin ved fravær:</strong> er en elev borte når runden er ferdig, trekkes eleven først når hen er tilbake</li>
      <li><strong>🔄 på Tilfeldig elev</strong> tømmer backlogen rett fra kortet</li>
      <li><strong>🧹 Tøm i elevkortet</strong> tømmer siden for elever, så du kan starte en ny klasse. Lagrede lister røres ikke, og knappen sier fra hvis elevene ikke er lagret</li>
    </ul>
  </div>
  <div class="logg-entry">
    <div class="logg-versjon">v2.38</div>
    <div class="logg-dato">3. november 2026</div>
    <ul>
      <li><strong>📋 Klasselister har fått egen plass i 🏫 Skoledash-menyen,</strong> i tillegg til knappen i elevkortet. ⛔ Gruppebegrensning er tatt ut av menyen, den finner du nå ved hver liste</li>
      <li><strong>Gi en liste nytt navn</strong> med ✏️</li>
      <li><strong>Oppdater en liste</strong> med 🔄: elevene på siden erstatter elevene i lista, så nye og fjernede elever blir husket. Knappen må trykkes to ganger</li>
      <li><strong>Sletting krever to trykk:</strong> ✕ blir til «Slett?», så en liste ikke forsvinner ved et uhell</li>
      <li><strong>Del én liste med en vikar:</strong> 📤 laster ned lista som en fil, og 📥 Importer liste henter den inn hos mottakeren</li>
      <li><strong>Parene som ikke skal i samme gruppe, lagres nå i klasselista,</strong> så de følger lista til vikaren og til hver side lista lastes inn på. Par du har fra før, flyttes inn i lista neste gang du lagrer eller laster den</li>
      <li>Fikset: menyvalg som åpner et vindu (som 💬 Tilbakemelding), lot menyen stå åpen bak vinduet</li>
      <li>Fikset: når backup-varselet dukket opp nederst (for eksempel etter at du lagret en liste), ble elevkortet og de andre voksende kortene for lave, og de nederste knappene ble kuttet. Kortene måles nå på nytt når plassen endrer seg, også når du endrer størrelse på vinduet</li>
    </ul>
  </div>
  <div class="logg-entry">
    <div class="logg-versjon">v2.37</div>
    <div class="logg-dato">3. november 2026</div>
    <ul>
      <li><strong>Elevlistene lagres på en ny måte.</strong> Hver elev har fått et eget nummer bak kulissene, så appen kan huske mer om eleven senere, som bursdager og plass i klassekartet. Du merker ingen forskjell: listene, gruppene og trekkene dine er gjort om av seg selv første gang du åpner Skoledash</li>
      <li>Fjerner du en elev, forsvinner eleven nå også fra trekk-backlogene og gruppebegrensningene, ikke bare fra lista og gruppene</li>
      <li>Laster du inn en lagret liste på nytt, husker trekkene fortsatt hvem som har vært ordenselev og hatt bamsen</li>
      <li>Backupfiler fra før denne versjonen kan fortsatt importeres. En backup tatt nå kan ikke leses av eldre versjoner av Skoledash</li>
    </ul>
  </div>
  <div class="logg-entry">
    <div class="logg-versjon">v2.36</div>
    <div class="logg-dato">3. november 2026</div>
    <ul>
      <li><strong>Hvem er her i dag?</strong> Hver elev i lista har fått to små knapper: ✓ for her og − for borte</li>
      <li><strong>Elever som er borte, er ute av trekkene og gruppeinndelingen.</strong> Tilfeldig elev, ordenselever og klassebamse trekker bare blant dem som er her, og 🎲 Del inn fordeler bare dem</li>
      <li>Ferdige grupper blir stående, men den som er borte, vises nedtonet. Under elevlista står det hvor mange som er borte</li>
      <li>Var en elev borte da gruppene ble laget og kommer senere, havner eleven i den minste gruppa når du fjerner borte-markeringen</li>
      <li>Markeringene gjelder bare i dag. Neste dag starter alle umarkert</li>
      <li><strong>«Widgets» heter nå «Kort»:</strong> menyknappen oppe til høyre heter <strong>⊞ Kort</strong>, og det samme ordet brukes i hele appen</li>
      <li><strong>⊞ Kort-menyen</strong> har fått ikon på alle kortene, og navnene står på linje</li>
      <li>Tilfeldig elev har fått 🙋 i stedet for 🎲, så det ikke forveksles med terningen</li>
      <li>Fikset: skjulte kort blinket fram et øyeblikk hver gang siden ble lastet, og mørke temaer blinket lyst</li>
      <li><strong>Timeren spretter fram:</strong> starter du timeren med tasten <kbd>t</kbd> mens timerkortet er skjult eller ligger bak andre kort, hentes det fram og legges øverst</li>
    </ul>
  </div>
  <div class="logg-entry">
    <div class="logg-versjon">v2.35</div>
    <div class="logg-dato">2. november 2026</div>
    <ul>
      <li><strong>Flytt kortene fritt:</strong> kolonnene er borte. Ta tak i overskriften på et kort og dra det dit du vil, og dra i kantene eller hjørnene for å endre størrelsen. Kortene kan ligge oppå hverandre, og kortet du tar i, legger seg øverst</li>
      <li><strong>Magnetiske kanter</strong> gjør det lett å få kortene på rad. Hold <kbd>Alt</kbd> mens du drar for å plassere helt fritt</li>
      <li><strong>Samme oppsett på laptop og tavle:</strong> plasseringen huskes som andeler av skjermen, så oppsettet ser likt ut uansett skjermstørrelse, og alt får plass uten at siden må scrolles</li>
      <li><strong>Oppsettet ditt er tatt vare på:</strong> kortene står omtrent der de sto i kolonnene da du sist brukte Skoledash</li>
      <li><strong>Et kort du skrur av og på igjen, kommer tilbake der det sto,</strong> så sant plassen er ledig. Ellers havner det på første ledige plass</li>
      <li><strong>Bilde- og YouTube-kort holder proporsjonene:</strong> høyden følger bildet eller videoen, og <strong>Kun lyd</strong> krymper kortet til lydlinja. Du endrer størrelsen med sidene eller hjørnene</li>
      <li><strong>Tekststørrelse i notatet:</strong> <strong>A−</strong> og <strong>A+</strong> øverst i hvert notat gjør teksten mindre eller større, opp til fire ganger standard. Hvert notat husker sin egen størrelse</li>
      <li><strong>Skrivefeltet i notatet fyller hele kortet,</strong> så du kan klikke hvor som helst i kortet og skrive. Lang tekst gjør kortet høyere</li>
      <li><strong>Terningene legges i kvadratiske rader</strong> (fire blir 2×2, seks blir 3+3), og du kan kaste opptil 36 om gangen</li>
      <li><strong>Innholdet følger kortet:</strong> drar du klokka, timeren, tilfeldig elev, ordenselever, klassebamsen eller terningen større, blir tall, urskive og knapper større også, og mindre hvis du gjør kortet mindre enn innholdet trenger. Disse seks har derfor ikke lenger egen prosent under <strong>📏 Skriftstørrelse → Enkelt widget</strong></li>
      <li>Fikset: en elev du fjernet, ble stående i gruppa si. Nå forsvinner eleven fra gruppa også, og en gruppe som blir tom, fjernes</li>
      <li><strong>En ny elev havner rett i en gruppe</strong> når gruppene allerede er laget: i den minste gruppen, uten at de andre stokkes om. Gruppebegrensningene følges</li>
      <li><strong>Elevlista, dagsplanen, gruppene og notatene vokser med innholdet:</strong> nedover, og oppover når det er stopp under, så langt det er ledig plass. Høyden du drar et slikt kort til, blir en minstehøyde</li>
      <li><strong>Klokka kan vise analog, digital eller begge:</strong> klikk på overskriften i klokkekortet for å bytte</li>
      <li><strong>Nye brukere møter et tomt bord</strong> med tre små guidekort som forklarer Skoledash-menyen, ⊞ Widgets og hurtigtastene. Klokka står nå nederst til venstre når du henter den fram, og er høy nok til at både urskiva og tallene synes</li>
    </ul>
  </div>
  <div class="logg-entry">
    <div class="logg-versjon">v2.34</div>
    <div class="logg-dato">2. november 2026</div>
    <ul>
      <li><strong>Skoledash finnes nå på nynorsk:</strong> velg <strong>🗣 Målform</strong> i Skoledash-menyen. Menyer, knapper, meldinger, værvarselet og brukerveiledningen følger målformen. Denne loggen står på bokmål. Ser du en nynorsk formulering som skurrer, si gjerne fra via <strong>💬 Tilbakemelding</strong></li>
    </ul>
  </div>
  <div class="logg-entry">
    <div class="logg-versjon">v2.33</div>
    <div class="logg-dato">2. november 2026</div>
    <ul>
      <li><strong>Gruppefargene følger temaet:</strong> gruppekortene og fargene i elevlista tilpasser seg nå temaet du har valgt, i stedet for å lyse opp med faste pastellfarger i mørke temaer. Teksten er lett å lese i alle temaer</li>
    </ul>
  </div>
  <div class="logg-entry">
    <div class="logg-versjon">v2.32</div>
    <div class="logg-dato">2. november 2026</div>
    <ul>
      <li><strong>Gruppebegrensning har fått nytt utseende</strong> som passer med resten av appen og temaet ditt, og en kort forklaring øverst. Velger du samme elev to ganger, får du nå beskjed i stedet for at ingenting skjer. Dialogen lukkes også med <kbd>Esc</kbd> eller klikk utenfor</li>
      <li>Fikset: med stor skrift brøt noen valg i 🏫-menyen over to linjer, med ikonet alene på første linje</li>
    </ul>
  </div>
  <div class="logg-entry">
    <div class="logg-versjon">v2.31</div>
    <div class="logg-dato">2. november 2026</div>
    <ul>
      <li><strong>Posisjon bare når du ber om det:</strong> appen spør ikke lenger om posisjonen din når du åpner den. Vil du ha været der du er, trykk <strong>📍 Vis været der du er</strong> i velkomstmeldingen eller <strong>📍 Bruk min posisjon</strong> i vær-vinduet. Posisjonen rundes av til omtrent en kilometer og huskes til du bytter</li>
      <li><strong>Slett alle data på denne maskinen:</strong> nytt valg under <strong>Nullstill…</strong>. Nyttig når du har brukt Skoledash på en maskin andre også bruker</li>
    </ul>
  </div>
  <div class="logg-entry">
    <div class="logg-versjon">v2.30</div>
    <div class="logg-dato">2. november 2026</div>
    <ul>
      <li><strong>YouTube-kortet</strong> viser nå videoen i en egen ramme som er helt adskilt fra resten av appen. YouTube får ikke lenger kjøre kode i Skoledash, og kan dermed ikke se klasselistene dine. Video, kun lyd, volum og spill/pause virker som før</li>
    </ul>
  </div>
  <div class="logg-entry">
    <div class="logg-versjon">v2.29</div>
    <div class="logg-dato">2. november 2026</div>
    <ul>
      <li><strong>Mer robust import av backupfiler:</strong> en skadet eller ufullstendig fil kan ikke lenger ødelegge appen. Det som ikke kan brukes, hoppes over, og resten kommer inn som før</li>
      <li>Skulle appen likevel ikke klare å starte, får du en melding med mulighet til å laste ned dataene dine før du begynner på nytt</li>
    </ul>
  </div>
  <div class="logg-entry">
    <div class="logg-versjon">v2.28</div>
    <div class="logg-dato">2. november 2026</div>
    <ul>
      <li>Fikset: når du ga klassebamsen nytt navn, sto det gamle navnet igjen under <strong>📏 Skriftstørrelse → Enkelt widget</strong> til siden ble lastet på nytt</li>
    </ul>
  </div>
  <div class="logg-entry">
    <div class="logg-versjon">v2.27</div>
    <div class="logg-dato">2. november 2026</div>
    <ul>
      <li><strong>Brukerveiledningen forteller nå nøyaktig hva som sendes ut av appen:</strong> værdata, posisjonsoppslag og YouTube. Elevdata blir alltid på maskinen din. Før sto det at ingenting ble sendt til internett, og det var ikke helt riktig. Se <strong>Lagring og personvern</strong> i brukerveiledningen. Det samme står nå i vilkårene for gaver</li>
    </ul>
  </div>
  <div class="logg-entry">
    <div class="logg-versjon">v2.26</div>
    <div class="logg-dato">2. november 2026</div>
    <ul>
      <li><strong>Jonatan spesial har fått nye navn:</strong> 🦋 Fluttershy, ✨ Twilight og 💎 Rarity. Twilight er det som het Cosmic v2, og Rarity er det som het Cute. Hadde du valgt ett av dem, beholder du det</li>
      <li><strong>Fluttershy</strong> erstatter Equestria: blek gul bakgrunn, rosa toppfelt og knapper, turkise detaljer og små sommerfugler i bakgrunnen</li>
    </ul>
  </div>
  <div class="logg-entry">
    <div class="logg-versjon">v2.25</div>
    <div class="logg-dato">2. november 2026</div>
    <ul>
      <li><strong>Temaene er gått over:</strong> Høy kontrast, Under vann, På fjellet, I skogen, I en vulkan og Equestria har nye farger. Alle er sjekket for kontrast, så teksten kan leses fra bakerste rad</li>
      <li><strong>Mørkt tema:</strong> knappene har fått mørk tekst, så «Trekk ordenselever», «Start» og de andre lyse knappene kan leses fra bakerste rad</li>
      <li><strong>Høy kontrast er nå hvit tekst på svart</strong>, med gule knapper. Det skåner øynene i mørke rom</li>
      <li><strong>Mønstre:</strong> flere temaer har et svakt mønster i bakgrunnen, for eksempel bølger, trær, glør eller stjerner. Kortene er fortsatt ensfargede, så teksten står rolig</li>
      <li><strong>Knappene kan leses i alle temaer:</strong> før hadde knappene alltid hvit tekst, og i lyse farger ble den nesten borte. Nå har hvert tema sin egen knappetekst</li>
      <li><strong>To nye temaer:</strong> 🌌 Cosmic v2 (mørk lilla med stjerner) og 🎀 Cute (lavendel med skyer). De ligger under <strong>Jonatan spesial</strong> sammen med Equestria</li>
      <li>I eventyrland, Matrix og Cyberspace er tatt ut. Hadde du valgt ett av dem, bruker appen nå Lyst. Velg et nytt under <strong>🎨 Tema</strong></li>
    </ul>
  </div>
  <div class="logg-entry">
    <div class="logg-versjon">v2.24</div>
    <div class="logg-dato">2. november 2026</div>
    <ul>
      <li><strong>Nye fonter:</strong> Lexend, Outfit, Sniglet, Kalam og JetBrains Mono. Lexend er laget for å gjøre lesing lettere. I fontmenyen står hvert navn i sin egen font, så du ser hvordan den ser ut før du velger</li>
      <li><strong>Størrelse på én widget i prosent:</strong> under <strong>📏 Skriftstørrelse → Enkelt widget</strong> skriver du nå et tall i stedet for å velge S/M/L/XL. 0 er samme som alle, -20 er 20 % mindre og 30 er 30 % større. Størrelsene du hadde fra før, er gjort om og ser like ut</li>
      <li>Lista under <strong>Enkelt widget</strong> viser bare widgetene som er på siden. Størrelsen huskes også når en widget er tatt bort</li>
      <li><strong>Større tekst overalt:</strong> alle fire valgene under <strong>📏 Skriftstørrelse → Alle widgets</strong> er gjort større, så appen leses bedre på store tavler. Normal er nå omtrent like stor som Stor var før. Synes du det blir for stort på din skjerm, velg Liten</li>
      <li><strong>Ingen kontakt med Google:</strong> fontene ligger nå på skoledash.app. Før ble de hentet fra Google Fonts, og da fikk Google vite IP-adressen din</li>
      <li>Victor Mono, Inter, Nunito, Roboto Slab, Playfair Display og Caveat er tatt ut. Hadde du valgt en av dem, bruker appen nå systemfonten. Velg en ny under <strong>🔤 Font</strong> i Skoledash-menyen</li>
    </ul>
  </div>
  <div class="logg-entry">
    <div class="logg-versjon">v2.23</div>
    <div class="logg-dato">1. november 2026</div>
    <ul>
      <li><strong>Roligere toppfelt i det lyse temaet:</strong> toppfeltet er nå ensfarget lilla i stedet for å gå over i rosa. De andre temaene er som før</li>
    </ul>
  </div>
  <div class="logg-entry">
    <div class="logg-versjon">v2.22</div>
    <div class="logg-dato">1. november 2026</div>
    <ul>
      <li><strong>Skoledash har fått sin egen adresse: <a href="https://skoledash.app" target="_blank" rel="noopener">skoledash.app</a>.</strong> Har du brukt appen på den gamle adressen, ligger dataene dine fortsatt der. Gå til den gamle adressen, trykk <strong>📤 Eksporter og åpne skoledash.app</strong> i banneret øverst, og velg <strong>📥 Importer data</strong> i 🏫-menyen her</li>
    </ul>
  </div>
  <div class="logg-entry">
    <div class="logg-versjon">v2.21</div>
    <div class="logg-dato">1. november 2026</div>
    <ul>
      <li><strong>Appen heter nå Skoledash!</strong> Alt du har lagret, er der fortsatt akkurat som før. Nye backupfiler heter <code>skoledash-backup-(dato).json</code>, og gamle backupfiler kan fortsatt importeres</li>
      <li><strong>Velkomstmelding</strong> første gang du åpner Skoledash i en nettleser</li>
      <li><strong>☕ Støtt utviklingen:</strong> Skoledash er gratis, uten innlogging og uten abonnement. Vil du gi et lite bidrag, finner du ☕ helt øverst til høyre</li>
      <li><strong>Se planen videre:</strong> øverst i denne loggen ligger en boks som viser hva som kommer</li>
    </ul>
  </div>
  <div class="logg-entry">
    <div class="logg-versjon">v2.20</div>
    <div class="logg-dato">25. august 2026</div>
    <ul>
      <li><strong>Ny terning-widget:</strong> kast <strong>d4, d6, d8, d10, d12 eller d20</strong>, og <strong>1 til 6 terninger</strong> om gangen. Ligger klar under <strong>⊞ Widgets → 🎲 Terning</strong></li>
      <li><strong>Ekte terningflater:</strong> d6 tegnes med prikker slik elevene kjenner den igjen, mens de andre får sin egen form — trekant, rombe, femkant og tjuekant — med tallet i midten</li>
      <li>Kaster du flere terninger, vises <strong>summen</strong> under. Hurtigtast: <kbd>k</kbd> for å kaste</li>
      <li><strong>Nye kort finner selv en ledig plass.</strong> Legger du til et kort — enten ved å krysse det av i <strong>⊞ Widgets</strong> eller med <strong>+ Notat</strong>, <strong>+ Bilde</strong> eller <strong>+ YouTube</strong> — havner det nederst i den kolonnen som har mest ledig plass akkurat da. Slipper du å lete etter hvor det ble av, og kolonnene holder seg jevne. Du kan flytte det dit du vil etterpå, som før</li>
      <li><strong>Været finner stedet ditt selv.</strong> Første gang du åpner appen spør nettleseren om posisjonen din, og værvarselet settes til stedet du faktisk er. Sier du nei — eller åpner fila rett fra maskinen, der posisjon ikke er tillatt — brukes Eidsvoll som nødløsning. Har du selv søkt opp et sted, blir det stående</li>
      <li><strong>Alt været på ett sted:</strong> klokke-kortet viser nå bare tiden. Trykk i stedet på været oppe til høyre, så får du <strong>vind, nedbør de neste 6 timene, pollen, luftfuktighet og lufttrykk</strong> — pluss varselet time for time. Der bytter du også sted, med <strong>📍 Bruk min posisjon</strong> eller et søk</li>
      <li><strong>Roligere start for nye brukere:</strong> førstegangsoppsettet viser nå bare <strong>klokke, tilfeldig elev, dagsplan, notat og elevliste</strong>. Da får hele siden plass på skjermen — inkludert hurtigtast-raden nederst — uten å scrolle. Ordenselever, klassebamse, terning, timer og grupper ligger ett klikk unna i <strong>⊞ Widgets</strong>, og dukker opp på sin faste plass når du slår dem på. <em>Har du brukt appen før, beholder du oppsettet ditt akkurat som det er</em></li>
      <li>Bildekortet er ikke lenger med fra start — legg det til med <strong>⊞ Widgets → + 🖼 Bilde</strong> når du trenger det, på samme måte som YouTube-kortet</li>
      <li>Terningen «triller» et lite øyeblikk før den lander. Har du slått på <strong>redusert bevegelse</strong> i systeminnstillingene, lander den med én gang i stedet</li>
    </ul>
  </div>
  <div class="logg-entry">
    <div class="logg-versjon">v2.19</div>
    <div class="logg-dato">25. august 2026</div>
    <ul>
      <li><strong>Ny klokke-widget:</strong> en <strong>analog urskive</strong> med tallene 1–12, og den digitale tiden rett under. Fin å ha framme for klasser som øver på å lese klokka. Hent den fram via <strong>⊞ Widgets → 🕐 Klokke</strong></li>
      <li><strong>Vær under klokka:</strong> temperatur, <strong>vind</strong> og <strong>nedbør for de neste 6 timene</strong> — alt du trenger for å avgjøre om det blir uteskole eller innefri</li>
      <li><strong>Pollenvarsel:</strong> kortet viser hvilken pollentype som er høyest akkurat nå (or, bjørk, gress eller burot) og hvor kraftig det er. Er nivået <strong>høyt</strong>, lyser teksten rødt</li>
      <li><strong>Fikset: været virker nå i Firefox og Zen.</strong> Værvarselet i toppen har aldri lastet i disse nettleserne — appen ba met.no om dataene på en måte som Firefox blokkerte av sikkerhetsgrunner, mens Chrome og Brave lot den passere. Nå henter alle nettlesere været likt, også når du åpner fila rett fra maskinen</li>
      <li><strong>Velg ditt eget sted:</strong> klikk på stedsnavnet nederst i klokke-kortet, søk opp stedet ditt og velg det fra lista. Både klokke-kortet og været i toppen følger valget, og det huskes til neste gang</li>
    </ul>
  </div>
  <div class="logg-entry">
    <div class="logg-versjon">v2.18</div>
    <div class="logg-dato">17. august 2026</div>
    <ul>
      <li><strong>Fikset: store bokstaver midt i navn.</strong> Navn med <strong>æ, ø eller å</strong> fikk feilaktig stor bokstav rett etter — «Bjørn» ble til «BjøRn» og «Håkon» til «HåKon». Nye og redigerte navn skrives nå riktig. (Navn som allerede ligger i lista må rettes én gang: klikk på navnet, skriv det på nytt og trykk Enter)</li>
      <li><strong>Fikset: hurtigtasten <kbd>a</kbd> skrev seg selv inn.</strong> Trykket du <kbd>a</kbd> for å legge til en elev, dukket bokstaven «a» opp i skrivefeltet som åpnet seg. Feltet er nå tomt fra start — det samme gjelder <kbd>s</kbd>, <kbd>d</kbd> og <kbd>g</kbd></li>
      <li>Hurtigtastene utløses ikke lenger sammen med <kbd>Cmd</kbd>/<kbd>Ctrl</kbd>/<kbd>Alt</kbd>, så nettleserens egne snarveier (som <kbd>Cmd</kbd>+<kbd>R</kbd> for å laste siden på nytt) virker som de skal</li>
    </ul>
  </div>
  <div class="logg-entry">
    <div class="logg-versjon">v2.17</div>
    <div class="logg-dato">9. juni 2026</div>
    <ul>
      <li><strong>Volum­kontroll i kun lyd-modus:</strong> YouTube-kort i <strong>🎵 Kun lyd</strong> har nå en volum­glider ved siden av play-knappen. Volumet huskes til neste gang</li>
    </ul>
  </div>
  <div class="logg-entry">
    <div class="logg-versjon">v2.16</div>
    <div class="logg-dato">8. juni 2026</div>
    <ul>
      <li><strong>Ny YouTube-widget:</strong> legg til så mange YouTube-kort du vil via <strong>⊞ Widgets → + ▶️ YouTube</strong>. Lim inn en YouTube-lenke, så spilles videoen rett i kortet</li>
      <li><strong>Kun lyd-modus:</strong> bytt et YouTube-kort til <strong>🎵 Kun lyd</strong> — bildet skjules og du får en kompakt play/pause-linje. Perfekt for bakgrunnsmusikk eller lydklipp uten at videoen tar plass</li>
    </ul>
  </div>
  <div class="logg-entry">
    <div class="logg-versjon">v2.15</div>
    <div class="logg-dato">8. juni 2026</div>
    <ul>
      <li><strong>Mye større bilder:</strong> grensa er hevet fra 2 MB til <strong>50 MB</strong> per bilde. Bilder lagres nå i nettleserens IndexedDB i stedet for det vesle localStorage-lageret — mer plass, og de stjeler ikke lenger plass fra sider, elever og notater</li>
      <li>Eksisterende bilder flyttes automatisk over til det nye lageret første gang du åpner appen — du trenger ikke gjøre noe</li>
      <li>Backup-fila (eksporter/importer) virker som før og er kryss-kompatibel med eldre versjoner</li>
      <li>(Teknisk: åpner du appen som en lokal fil i en Firefox-basert nettleser, faller bildene tilbake til 2 MB — på den nettpubliserte versjonen gjelder alltid 50 MB)</li>
    </ul>
  </div>
  <div class="logg-entry">
    <div class="logg-versjon">v2.14</div>
    <div class="logg-dato">8. juni 2026</div>
    <ul>
      <li><strong>Endre rekkefølge i dagsplanen:</strong> hold inne dra-håndtaket <strong>⠿</strong> helt til høyre på et punkt (dukker opp når du holder musa over raden) og dra punktet opp eller ned. En blå strek viser hvor det havner</li>
    </ul>
  </div>
  <div class="logg-entry">
    <div class="logg-versjon">v2.13</div>
    <div class="logg-dato">8. juni 2026</div>
    <ul>
      <li><strong>Rediger elever og dagsplan-punkter med ett klikk:</strong> klikk på et elevnavn eller en dagsplan-tekst for å rette den direkte i lista. <kbd>Enter</kbd> lagrer, <kbd>Esc</kbd> avbryter</li>
      <li>Endrer du et elevnavn, følger det automatisk med til grupper, trekk-backlogs og gruppebegrensninger — ingenting blir hengende på det gamle navnet</li>
      <li>I dagsplanen markerer du nå et punkt som ferdig ved å klikke på <strong>prikken</strong> (●) — teksten er reservert for redigering</li>
    </ul>
  </div>
  <div class="logg-entry">
    <div class="logg-versjon">v2.12</div>
    <div class="logg-dato">2. juni 2026</div>
    <ul>
      <li>Varselet <strong>«● Ueksporterte endringer»</strong> ligger nå nederst, rett over hurtigtast-baren — der blikket havner når du er ferdig for dagen — i stedet for oppe i toppen</li>
    </ul>
  </div>
  <div class="logg-entry">
    <div class="logg-versjon">v2.11</div>
    <div class="logg-dato">30. mai 2026</div>
    <ul>
      <li>At man nå kan gi hver side sitt eget navn ved å dobbeltklikke på fanen (f.eks. «1A» eller «Mattegruppe»)</li>
    </ul>
  </div>
  <div class="logg-entry">
    <div class="logg-versjon">v2.10</div>
    <div class="logg-dato">30. mai 2026</div>
    <ul>
      <li>Appen har fått sitt eget faneikon (🏫) som vises i nettleserfanen — lettere å kjenne den igjen blant mange åpne faner</li>
      <li>Nye sider starter nå helt tomme — ingen kort er synlige fra start. Du henter selv fram akkurat de widgetene du vil ha via <strong>⊞ Widgets</strong>-menyen</li>
    </ul>
  </div>
  <div class="logg-entry">
    <div class="logg-versjon">v2.9</div>
    <div class="logg-dato">30. mai 2026</div>
    <ul>
      <li><strong>📤 Eksporter data</strong> i Klasserom-menyen lagrer alt — klasselister, sider (med elever, grupper, trekk-backlogs og begrensninger), innstillinger, notater og bilder — til én backup-fil på maskinen din</li>
      <li><strong>📥 Importer data</strong> henter alt tilbake fra en slik fil. Du kan enten erstatte alt, eller bare slå sammen de lagrede klasselistene (nyttig for å dele lister mellom lærere)</li>
      <li>Et lite varsel <strong>«● Ueksporterte endringer»</strong> dukker opp når du har laget nye lister eller endret backlog siden forrige eksport. Klikk på det for å ta en ny backup</li>
    </ul>
  </div>
  <div class="logg-entry">
    <div class="logg-versjon">v2.8</div>
    <div class="logg-dato">30. mai 2026</div>
    <ul>
      <li>Fikset: notatfeltet følger nå valgt font (og fikk tilbake riktig ramme og bakgrunn) — det hadde blitt stående på nettleserens standardfont</li>
    </ul>
  </div>
  <div class="logg-entry">
    <div class="logg-versjon">v2.7</div>
    <div class="logg-dato">30. mai 2026</div>
    <ul>
      <li>Hver side er nå et eget klasse-arbeidsbord: elevliste, grupper, trekk (med backlogs), dagsplan, gruppebegrensninger og klassebamse-navn er <strong>per side</strong>. Lag én side per klasse — 1A på side 1, 1B på side 2 — og bytt fritt mellom dem uten å miste noe</li>
      <li>Globalt på tvers av alle sider: lagrede klasselister, tema, font, skriftstørrelse og timeren</li>
      <li>Timeren fortsetter å telle ned selv om du bytter side — lag gjerne en egen side for å vise bilder mens nedtellingen går videre</li>
      <li>Hver side får egne notat- og bildekort — innholdet deles ikke lenger mellom sider</li>
      <li>Fjern et kort direkte med <strong>✕</strong> i kortets øverste høyre hjørne (dukker opp når du holder musen over). Faste widgets skjules (hent dem tilbake i ⊞ Widgets), notat/bilde-kort slettes</li>
      <li>⊞ Widgets-menyen: faste widgets har av/på-avkryssing, mens notat og bilde har «+» for å legge til så mange du vil</li>
    </ul>
  </div>
  <div class="logg-entry">
    <div class="logg-versjon">v2.6</div>
    <div class="logg-dato">29. mai 2026</div>
    <ul>
      <li>Juster kolonnebredden fritt: dra i de tynne skillelinjene mellom kolonnene. Bredden lagres per side</li>
      <li>Endre antall kolonner (1–4) med <strong>⊞ Kolonner − / +</strong> nederst i verktøylinja. Når du fjerner en kolonne flyttes kortene til den siste. Lagres per side</li>
      <li>Fjernet den gamle <strong>●○○</strong>-breddeknappen på hvert kort — den hadde ingen effekt lenger, og kolonnebredden styres nå med dra-linjene mellom kolonnene</li>
      <li>Fikset: skriftstørrelse-valgene gjorde ingenting før. Nå skalerer <strong>Alle widgets</strong> hele grensesnittet, og <strong>Enkelt widget</strong>-knappene forstørrer faktisk kortet</li>
      <li>💬 Tilbakemelding henviser nå til e-post og GitHub i stedet for et innebygd skjema</li>
    </ul>
  </div>
  <div class="logg-entry">
    <div class="logg-versjon">v2.5</div>
    <div class="logg-dato">20. mai 2026</div>
    <ul>
      <li>Klikk på et dagsplan-punkt for å markere det som ferdig — prikken blir grønn og teksten får gjennomstreking. Klikk igjen for å angre</li>
    </ul>
  </div>
  <div class="logg-entry">
    <div class="logg-versjon">v2.4</div>
    <div class="logg-dato">14. mai 2026</div>
    <ul>
      <li>Temaene «På fjellet», «I eventyrland» og «Equestria» har fått mer karakter — saturert bakgrunn, tonet kort og egen header-gradient så de skiller seg tydelig fra lys modus</li>
    </ul>
  </div>
  <div class="logg-entry">
    <div class="logg-versjon">v2.3</div>
    <div class="logg-dato">13. mai 2026</div>
    <ul>
      <li>Fikset: lagrede lister kunne ikke hentes opp ved klikk — skyldes en feil i HTML-attributt-formatering av listenavn</li>
    </ul>
  </div>
  <div class="logg-entry">
    <div class="logg-versjon">v2.2</div>
    <div class="logg-dato">12. mai 2026</div>
    <ul>
      <li>Fikset: grupper-trekk bruker nå riktig tilfeldig fordeling — tidligere var fordelingen statistisk skjevt mot visse kombinasjoner</li>
    </ul>
  </div>
  <div class="logg-entry">
    <div class="logg-versjon">v2.1</div>
    <div class="logg-dato">12. mai 2026</div>
    <ul>
      <li>Notat- og bilde-widgets er nå per side — legg til et notat på side 1 uten at det dukker opp på side 2</li>
      <li>Fjerner du et notat/bilde-kort på én side, forsvinner det bare der — de andre sidene er upåvirket</li>
    </ul>
  </div>
  <div class="logg-entry">
    <div class="logg-versjon">v2.0</div>
    <div class="logg-dato">10. mai 2026</div>
    <ul>
      <li>Flerinstans-notat: legg til så mange notatkort du vil via widget-menyen (+ Notat)</li>
      <li>Flerinstans-bilde: legg til så mange bildekort du vil via widget-menyen (+ Bilde)</li>
      <li>Hvert notat og bilde kan slettes individuelt med ✕-knappen i kortets header</li>
      <li>Alle instanser huskes etter reload og vises på alle sider</li>
    </ul>
  </div>
  <div class="logg-entry">
    <div class="logg-versjon">v1.9</div>
    <div class="logg-dato">8. mai 2026</div>
    <ul>
      <li>Ny funksjon: Sider — lag flere dashboard-sider med ulike widget-oppsett (midten av headeren)</li>
    </ul>
  </div>
  <div class="logg-entry">
    <div class="logg-versjon">v1.8</div>
    <div class="logg-dato">8. mai 2026</div>
    <ul>
      <li>Fikset: widgets forsvant etter drag-and-drop</li>
      <li>Fikset: backlogs ble slettet når elever ble fjernet — backlogs lever nå uavhengig av elevlisten</li>
      <li>Ny funksjon: Gruppebegrensning — legg inn navnepar som aldri skal havne i samme gruppe (⛔ Par)</li>
      <li>Ny widget: Bilde — last opp bilde fra disk eller lim inn fra utklippstavle</li>
      <li>Ny funksjon: Send tilbakemelding direkte til utvikler fra menyen</li>
    </ul>
  </div>
  <div class="logg-entry">
    <div class="logg-versjon">v1.7</div>
    <div class="logg-dato">8. mai 2026</div>
    <ul>
      <li>Kolonnene stables nå helt uavhengig av hverandre — et høyt kort i kol 2 blokkerer ikke lenger kol 1 og 3</li>
      <li>Ny breddefordeling: 30% / 40% / 30%</li>
    </ul>
  </div>
  <div class="logg-entry">
    <div class="logg-versjon">v1.6</div>
    <div class="logg-dato">8. mai 2026</div>
    <ul>
      <li>Full DnD-frihet: alle widgets kan nå plasseres i hvilken som helst rekkefølge og kolonne</li>
      <li>Visuell drop-indikator viser nøyaktig hvor widgeten plasseres</li>
    </ul>
  </div>
  <div class="logg-entry">
    <div class="logg-versjon">v1.5</div>
    <div class="logg-dato">7. mai 2026</div>
    <ul>
      <li>Backlog-editor for ordenselev og klassebamse: klikk 📝 for å markere hvem som allerede er brukt</li>
      <li>Widgeten "Ulv" heter nå "Klassebamse" som standard</li>
      <li>Tilpassbart bamse-navn: klikk ✏️ i Klassebamse-kortet for å gi bamsen et eget navn</li>
    </ul>
  </div>
  <div class="logg-entry">
    <div class="logg-versjon">v1.4</div>
    <div class="logg-dato">7. mai 2026</div>
    <ul>
      <li>Tema-velger med hover-sub-meny: 3 standard + 8 eventyr/digital-temaer</li>
      <li>Fontvelger med 6 Google Fonts (Victor Mono, Inter, Nunito, m.fl.)</li>
      <li>Kursiv-toggle i Notat-kortet</li>
      <li>Global skriftstørrelse (Liten / Normal / Stor / Ekstra stor)</li>
      <li>Per-widget skriftstørrelse med S/M/L/XL-knapper</li>
    </ul>
  </div>
  <div class="logg-entry">
    <div class="logg-versjon">v1.3</div>
    <div class="logg-dato">7. mai 2026</div>
    <ul>
      <li>Vær-popup med detaljer og timesforecast fra Yr.no</li>
      <li>Klasserom-meny med oppdateringslogg og brukerveiledning</li>
    </ul>
  </div>
  <div class="logg-entry">
    <div class="logg-versjon">v1.2</div>
    <div class="logg-dato">7. mai 2026</div>
    <ul>
      <li>Widget-synlighetsmeny — skjul/vis kort fra headeren</li>
      <li>Elevliste ekspanderer automatisk uten scrollbar</li>
      <li>Notat-felt vokser med innholdet</li>
    </ul>
  </div>
  <div class="logg-entry">
    <div class="logg-versjon">v1.1</div>
    <div class="logg-dato">7. mai 2026</div>
    <ul>
      <li>Dra-og-slipp for å flytte widgets til valgfri kolonne</li>
      <li>Span-knapp for å strekke et kort over 2–3 kolonner</li>
      <li>Layout lagres og gjenopprettes automatisk</li>
    </ul>
  </div>
  <div class="logg-entry">
    <div class="logg-versjon">v1.0</div>
    <div class="logg-dato">7. mai 2026</div>
    <ul>
      <li>Elevliste med legg til/fjern og lagrede lister</li>
      <li>Tilfeldig-trekk, ordenselever og ulv — alle med backlog</li>
      <li>Nedtellingstimer med lyd</li>
      <li>Notat og dagsplan</li>
      <li>Tilfeldig gruppeinndeling</li>
      <li>Tavlemodus (svart skjerm)</li>
    </ul>
  </div>`;

// Brukerveiledningen som vises i info-modalen (se note over OPPDATERINGSLOGG_HTML).
const BRUKERVEILEDNING_HTML = `
  <h4>📦 Flytte fra den gamle adressen</h4>
  <p>Skoledash lå tidligere på <em>knitresletta.github.io/klasserom-dashboard</em> og bor nå på <strong>skoledash.app</strong>. Nettleseren holder data fra hver adresse adskilt, så klasselister og sider blir ikke med av seg selv. Åpne den gamle adressen, trykk <strong>📤 Eksporter og åpne skoledash.app</strong> i banneret øverst, og velg <strong>📥 Importer backup</strong> under <strong>💾 Data</strong> nederst til venstre på den nye siden.</p>
  <h4>☕ Gratis, uten innlogging</h4>
  <p>Skoledash er gratis å bruke. Du trenger verken konto eller abonnement, og alt du legger inn blir liggende i nettleseren din. Vil du støtte utviklingen, trykker du på <strong>☕</strong> helt øverst til høyre. Da åpnes en side for donasjoner i en ny fane. Hva som kommer framover, ser du øverst i <strong>📋 Oppdateringslogg</strong>.</p>
  <h4>Sider — ett arbeidsbord per klasse</h4>
  <p>Klikk <strong>+</strong> i midten av headeren for å legge til en ny side, klikk på et sidenavn for å bytte, og <strong>✕</strong> på en fane for å slette. Tanken er at <strong>hver side er sin egen klasse</strong>: lag side 1 for 1A og side 2 for 1B, og bytt fritt mellom dem gjennom dagen uten at noe blandes.</p>
  <p><strong>Gi en side nytt navn</strong> ved å dobbeltklikke på fanen. Da blir den til et lite skrivefelt — skriv inn navnet (f.eks. «1A» eller «Mattegruppe») og trykk <kbd>Enter</kbd> for å lagre. <kbd>Esc</kbd> avbryter uten å endre navnet.</p>
  <p><strong>Per side</strong> (egen for hver klasse): elevlisten, grupper, dagsplanen, klassebamsens navn, pluss oppsettet av kortene, notater og bilder.</p>
  <p><strong>Delt mellom alle sider:</strong> lagrede klasselister (📋 Lister — et felles bibliotek du kan laste inn i hvilken som helst side) med sine trekk, tema, font og skriftstørrelse.</p>
  <p>Timere hører til siden de er laget på, men fortsetter å gå når du bytter side. Vil du f.eks. vise et bilde på en egen side mens nedtellingen ruller, går det helt fint, og du får beskjed når tiden er ute.</p>
  <p>En <strong>ny side starter helt tom</strong> — ingen kort er synlige ennå. Du henter selv fram akkurat de kortene du vil ha via <strong>⊞ Kort</strong>-menyen, så hver side blir nøyaktig slik du ønsker den.</p>
  <p><strong>Side 1 starter med et lite utvalg</strong> første gang du åpner appen: klokke og tilfeldig elev til venstre, dagsplan og notat i midten, og elevlisten til høyre. Det er med vilje få kort — da får hele siden plass på skjermen med én gang. Ordenselever, klassebamse, terning og grupper ligger klare i <strong>⊞ Kort</strong> og dukker opp på sin faste plass når du krysser dem av.</p>

  <h4>Kom i gang</h4>
  <p>Trykk <strong>+ Legg til elev</strong> (eller tasten <kbd>a</kbd>) for å legge inn elevene i klassen din. Du kan ha opptil 35 elever inne samtidig.</p>
  <p><strong>Rette et navn:</strong> klikk rett på elevnavnet i lista — det blir til et lite skrivefelt. Rett opp og trykk <kbd>Enter</kbd> for å lagre, eller <kbd>Esc</kbd> for å avbryte. Endrer du navnet, oppdateres det automatisk overalt eleven er brukt — i grupper, trekk-backlogs og gruppebegrensninger. (Vil du fjerne eleven i stedet, bruk <strong>✕</strong> til høyre.)</p>
  <p><strong>Fjerne en elev:</strong> trykk <strong>✕</strong> til høyre for navnet (vises når du holder musa over), eller <strong>🧹 Tøm</strong> nederst i kortet for å tømme hele lista. Eleven forsvinner da også fra gruppene, trekk-backlogene og gruppebegrensningene.</p>
  <p><strong>Stor forbokstav kommer av seg selv:</strong> skriver du «kari nordmann», lagres det som «Kari Nordmann». Det samme gjelder etter bindestrek («Anne-Marie»), og navn med æ, ø og å behandles riktig.</p>
  <p>Vil du spare tid neste gang? Lagre elevlisten din under <strong>📋 Lister</strong>, og last den inn igjen med ett klikk.</p>
  <p><strong>Starte en ny klasse:</strong> trykk <strong>🧹 Tøm</strong> nederst i elevkortet, og trykk igjen når knappen spør. Elevene, gruppene og oppmøtet forsvinner fra siden, og <strong>+ Legg til elev</strong> åpnes. Lagrede lister røres ikke. Står det <strong>Ikke lagret. Tøm?</strong> på knappen, er elevene ikke lagret i en liste og blir borte.</p>

  <h4>📋 Klasselister</h4>
  <p>Åpne <strong>📋 Lister</strong> i elevkortet, eller <strong>📋 Klasselister</strong> i 🏫 Skoledash-menyen. <strong>💾 Lagre nåværende</strong> lagrer elevlista på siden du står på. Klikk på en liste for å laste den inn. Lagrede lister deles av alle sidene dine.</p>
  <p>Hver liste har fem knapper: <strong>✏️</strong> gir lista nytt navn (<kbd>Enter</kbd> lagrer, <kbd>Esc</kbd> avbryter), <strong>⛔</strong> åpner parene som ikke skal i samme gruppe, <strong>📤</strong> laster ned lista som en fil, <strong>🔄</strong> erstatter elevene i lista med elevene på siden, og <strong>✕</strong> sletter den. 🔄 bruker du når du har lagt til eller fjernet elever og vil at lista skal huske det. Både 🔄 og ✕ må trykkes to ganger: første trykk gjør knappen om til <strong>Overskriv?</strong> eller <strong>Slett?</strong>.</p>
  <p><strong>Del en liste med en vikar eller kollega:</strong> trykk <strong>📤</strong> og send fila. Mottakeren trykker <strong>📥 Importer liste</strong> nederst i Klasselister. Parene følger med. Fila inneholder elevnavn, så tenk over hvem du gir den til. Har mottakeren en liste med samme navn fra før, blir den erstattet.</p>
  <p>Står det <em>(denne siden)</em> bak en liste, er det den lista siden sist ble lastet fra eller lagret som. Lista og siden er ellers hver sin kopi: endrer du elever på siden, havner det i lista først når du lagrer den på nytt.</p>
  <p><strong>Ordne listene:</strong> ta tak i <strong>⠿</strong> til venstre og dra lista dit du vil ha den. Slipper du den midt på en annen liste, blir de to en gruppe, som i startmenyen i Windows, og du kan gi gruppa et navn med en gang (for eksempel «Trinn 7»). Dra flere lister inn på gruppa, eller dra dem ut igjen. Klikk på gruppa for å folde den sammen eller åpne den. En gruppe som blir tom, forsvinner av seg selv.</p>
  <p><strong>Trekkene følger lista.</strong> Hvem som har vært ordenselev, hatt bamsen og blitt trukket, huskes per liste. Bytter du til en annen liste og tilbake, er trekkene der fortsatt. Bruker to sider samme liste, deler de trekkene.</p>

  <h4>✓ Hvem er her i dag?</h4>
  <p>Hver elev i lista har to små runde knapper: <strong>✓</strong> betyr at eleven er her, og <strong>−</strong> betyr at eleven er borte. Trykk på samme knapp en gang til for å fjerne markeringen.</p>
  <p><strong>Elever som er borte, er ikke med i trekkene</strong> (tilfeldig elev, ordenselever og klassebamse) <strong>eller når du deler inn i grupper.</strong> Navnet blir grått og gjennomstreket i lista, og under lista står det hvor mange som er borte. Elever du ikke har markert, er med som vanlig, så du trenger bare å markere dem som mangler. ✓ er der for deg som vil krysse av hele klassen.</p>
  <p><strong>Har du allerede laget grupper,</strong> blir de stående som de er. En elev som er borte, vises nedtonet i gruppa si, og er utelatt neste gang du trykker <strong>🎲 Del inn</strong>.</p>
  <p><strong>Kommer en elev etter at gruppene er laget?</strong> Var eleven markert borte da du delte inn, står eleven utenfor gruppene. Trykk <strong>✓</strong> (eller − igjen for å fjerne borte-markeringen), så havner eleven i den minste gruppa, akkurat som en ny elev. Gruppebegrensningene følges.</p>
  <p>Markeringene gjelder <strong>bare i dag</strong>. Neste dag er alle umarkert igjen, så ingen blir hengende som borte. Hver side har sitt eget oppmøte.</p>

  <h4>Trekke elever</h4>
  <p><strong>🙋 Tilfeldig elev</strong> — trykk <strong>Trekk</strong> for å velge en tilfeldig elev fra listen. Vanlig trekk unngår å velge samme elev to ganger på rad.</p>
  <p><strong>Flere Tilfeldig elev:</strong> <strong>+ 🙋 Tilfeldig elev</strong> under ⊞ Kort lager et kort til, med sin egen backlog, for eksempel «Leser høyt» og «Svarer på tavla». <kbd>r</kbd> og <kbd>R</kbd> trekker i kortet musa er over.</p>
  <p><strong>Trekk (bl)</strong> — trekker uten repetisjon (backlog). Hver elev trekkes én gang før noen trekkes på nytt. Antall trukket vises under knappen. Når alle er trukket, trykker du <strong>🔄</strong> øverst i kortet (vises når du holder musa over) for å starte på nytt.</p>
  <p><strong>⭐ Ordenselever</strong> — velger to elever som har ordenselev-ansvar. Alle får tur før noen gjentas, og når alle har vært ordenselev, starter en ny runde av seg selv, med en melding om det. Er det én elev igjen, kommer den eleven med i første trekk i den nye runden. To elever som ikke skal i samme gruppe (⛔), blir heller aldri ordenselever sammen. Vil du bare ha én ordenselev, trykker du <strong>👥</strong> øverst i kortet, så blir den til <strong>👤</strong>. Valget gjelder lista, som trekkene.</p>
  <p><strong>Klassebamse</strong> — velger hvem som får bamsen (eller en annen gjenstand) med hjem. Går også i runder av seg selv.</p>
  <p><strong>Borte når runden er ferdig?</strong> En elev som er markert borte og ikke har hatt tur, mister den ikke: eleven trekkes først når hen er tilbake.</p>
  <p>Vil du nullstille et trekk for hånd? Hold musa over kortet og trykk <strong>🔄</strong> øverst. På Ordenselever og Klassebamse må du trykke to ganger, så ingen runde forsvinner ved et uhell.</p>

  <h4>📝 Redigere backlog for ordenselev / klassebamse</h4>
  <p>Trykk på blyant-ikonet (📝) i kortets hjørne. Du ser alle elevene som chips — grå chips er allerede «brukt». Trykk på en elev for å sette eller fjerne «brukt»-markeringen. Nyttig hvis du har mistet lokal data og trenger å rekonstruere hvem som har vært ordenselev eller hatt med bamsen.</p>

  <h4>✏️ Gi et kort et eget navn</h4>
  <p>Hold musa over kortet og trykk <strong>✏️</strong> øverst. Tittelen blir et skrivefelt: skriv navnet og trykk <kbd>Enter</kbd>, eller <kbd>Esc</kbd> for å avbryte. Tømmer du feltet, får kortet standardnavnet tilbake. Navnet gjelder den siden du er på. Gir du Klassebamse et navn, brukes det også i meldingene («Bo tar med Teddy hjem»). Klokka har ikke ✏️, fordi overskriften der bytter visning.</p>

  <h4>Grupper</h4>
  <p>Trykk <strong>🎲 Del inn</strong> i Grupper-kortet (eller tasten <kbd>g</kbd>). Skriv inn antall grupper, og elevene fordeles tilfeldig. Gruppefarger vises også i elevlisten. Trykk <strong>✕</strong> for å fjerne gruppeinndelingen.</p>
  <p><strong>Ny elev når gruppene er laget:</strong> eleven havner i den minste gruppen, og de andre blir der de er. Er flere grupper like små, velges en av dem tilfeldig. Gruppebegrensninger følges: passer eleven ikke i noen gruppe uten å bryte en, står eleven utenfor til du deler inn på nytt.</p>

  <h4>⛔ Gruppebegrensning</h4>
  <p>Klikk <strong>⛔</strong> ved en liste i <strong>📋 Klasselister</strong>, eller <strong>⛔ Par</strong> i Grupper-kortets hjørne. Velg to elever fra nedtrekksmenyene og klikk <strong>Legg til</strong>. Paret vil aldri havne i samme gruppe. Du kan legge til så mange par du vil. Fjern et par ved å klikke <strong>✕</strong> ved siden av det.</p>
  <p><strong>Parene lagres i klasselista,</strong> ikke på siden. Da blir de med når du deler lista med en vikar, og de gjelder på hver side du laster lista inn på. Har siden ingen lagret liste ennå, ber ⛔ deg lagre lista først. Par du laget før dette, virker som før og flyttes inn i lista neste gang du lagrer eller laster den.</p>

  <h4>🎲 Terning</h4>
  <p>Trykk <strong>🎲 Kast</strong> (eller tasten <kbd>k</kbd>) for å kaste. Terningen triller et lite øyeblikk før den lander, så klassen rekker å bli spent.</p>
  <p><strong>Velg terningtype</strong> i knapperaden: <strong>d4, d6, d8, d10, d12</strong> eller <strong>d20</strong> — tallet forteller hvor mange sider terningen har. Den vanlige sekssidede (d6) vises med prikker, slik elevene kjenner den igjen fra brettspill. De andre har tall på flatene, akkurat som ekte terninger av den typen.</p>
  <p><strong>Flere terninger:</strong> bruk <strong>−</strong> og <strong>+</strong> ved siden av kast-knappen for å kaste opptil 36 om gangen. Terningene legges i rader som er så kvadratiske som mulig, og kortet tilpasser seg. Da vises <strong>summen</strong> under terningene. Det er nyttig i matte, eller når to terninger skal gi et tall mellom 2 og 12.</p>
  <p>Bytter du type eller antall, kastes det automatisk på nytt, slik at det aldri ligger et gammelt resultat igjen som ikke passer terningen. Siste kast huskes til neste gang du åpner siden.</p>
  <p>Terningoppsettet er <strong>felles for alle sider</strong>.</p>

  <h4>🕐 Klokke</h4>
  <p>Viser en <strong>analog urskive</strong> med tallene 1–12 og tre visere, og den <strong>digitale tiden</strong> rett under. Time- og minuttviseren glir jevnt slik ekte klokker gjør — er den 09:55, står timeviseren nesten på 10, ikke rett på 9. Det gjør kortet trygt å bruke når klassen øver på å lese klokka.</p>
  <p><strong>Velg visning:</strong> klikk på overskriften i kortet (der det står <strong>Begge</strong>, <strong>Analog</strong> eller <strong>Digital</strong>) for å bytte mellom urskive og tall, bare urskive eller bare tall. Valget huskes.</p>
  <p>Kortet viser bare tiden. <strong>Været finner du oppe til høyre</strong> i toppen av siden — se avsnittet under.</p>
  <p>Klokka går uansett om nettet er nede: den henter tiden fra maskinen din.</p>

  <h4>🌦 Været</h4>
  <p>Oppe til høyre står dagens vær med symbol, temperatur og stedsnavn. <strong>Klikk på det</strong> for å åpne detaljene: vind, <strong>nedbør de neste 6 timene</strong>, <strong>pollenvarsel</strong>, luftfuktighet og lufttrykk — pluss varselet time for time de neste åtte timene.</p>
  <p><strong>Pollenvarselet</strong> viser hvilken pollentype som er høyest akkurat nå (or, bjørk, gress eller burot) og hvor kraftig det er. Er nivået høyt, blir teksten rød — nyttig å oppdage før friminuttet hvis du har allergikere i klassen.</p>
  <p><strong>Velg sted for været.</strong> Første gang kan du trykke <strong>📍 Vis været der du er</strong> i velkomstmeldingen. Da spør nettleseren om å få bruke posisjonen din, og været settes til stedet du er. Under stedsnavnet står det hvor stedet kom fra, så du aldri er i tvil.</p>
  <p><strong>Vil du bytte sted?</strong> Nederst i vær-vinduet ligger <strong>📍 Bruk min posisjon</strong>, og et søkefelt der du kan skrive inn et hvilket som helst sted og trykke <kbd>Enter</kbd>. Fylke og land står under hvert treff, så du ikke havner i feil land. Stedet blir stående til du bytter det selv. Appen spør ikke om posisjonen din hver gang du åpner den.</p>
  <p>Har du ikke valgt noe sted, eller sier nei til posisjon, brukes <strong>Eidsvoll</strong> til du velger noe annet. Har du valgt et sted tidligere, brukes det.</p>

  <h4>🤫 Arbeidssymboler</h4>
  <p>Hent kortet fram under <strong>⊞ Kort</strong>. Trykk på et symbol i raden nederst for å vise det stort: 🤫 Stille arbeid, 🗣️ Hviskestemme, 👫 Pararbeid, 👥 Gruppearbeid, 🙋 Rekk opp hånda eller 👀 Se hit. Trykk på det samme symbolet igjen for å fjerne det.</p>
  <p><strong>＋</strong> lager et eget symbol med emoji og tekst, for eksempel «📖 Lesestund». Egne symboler finnes på alle sidene dine, og slettes med ✕ i det samme vinduet. Hver side husker sitt eget symbol.</p>

  <h4>🚦 Trafikklys</h4>
  <p>Et eget kort under <strong>⊞ Kort</strong>, med rødt, gult og grønt lys og ingen tekst. Hva fargene betyr, avtaler du med klassen. Trykk på et lys for å tenne det, og igjen for å slukke. Hver side husker sitt eget lys.</p>

  <h4>🔍 Fokus: ett kort på hele skjermen</h4>
  <p>Hold musa over et kort og trykk <strong>⛶</strong> øverst i kortet, eller tasten <kbd>f</kbd>. Kortet fyller hele vinduet, og innholdet blir så stort det får plass til: timeren for hele klassen, elevlista, dagsplanen eller trekket. Alt virker som vanlig inne i fokus, så du kan starte timeren og krysse av dagsplanen der.</p>
  <p>Lukk med <kbd>Esc</kbd>, <kbd>f</kbd>, <strong>✕ Lukk fokus</strong> øverst til høyre eller et klikk utenfor kortet. Kortet ligger der det lå på bordet, med samme størrelse. Vil du ha hele skjermen uten fanene og adressefeltet, trykker du <kbd>F11</kbd> i tillegg.</p>

  <h4>Timer</h4>
  <p>Legg til en timer med <strong>+ ⏱ Timer</strong> under <strong>⊞ Kort</strong>. Du kan ha så mange du vil på en side, for eksempel én for gruppearbeidet og én for pausen. Gi dem navn med ✏️, så sier varselet hvilken som er ferdig. Hver timer har sin egen tid, og ✕ fjerner den.</p>
  <p>Standard er 5 minutter. Trykk <strong>Sett tid</strong> (eller <kbd>s</kbd>) for å velge en annen varighet (1–60 min). Start og stopp med <strong>▶ Start</strong> (eller <kbd>t</kbd>). En lyd spilles av når tiden er ute.</p>
  <p>Med flere timere gjelder <kbd>t</kbd> og <kbd>s</kbd> timeren musa er over, ellers den første på siden. Har siden ingen timer, lager <kbd>t</kbd> en ny og starter den.</p>
  <p>Starter du timeren med <kbd>t</kbd> mens timerkortet ikke er framme, hentes kortet fram av seg selv og legges øverst, så klassen ser nedtellingen.</p>
  <p>Timeren går riktig selv om du viser noe i en annen fane en stund, og laster du siden inn på nytt, fortsetter den der den var.</p>
  <p><strong>⏱ Stoppeklokke:</strong> velg fanen øverst i kortet for å telle oppover i stedet. Start og stopp på samme måte, og ↺ setter den tilbake til null. Nedtellingen og stoppeklokka går hver for seg: en nedtelling du har startet, fortsetter og piper når tiden er ute, selv om du ser på stoppeklokka.</p>
  <p><strong>◔ Skive:</strong> hold musa over kortet og trykk ◔ øverst for å vise tiden som en skive som krymper, som et timeglass. ▬ bytter tilbake til bjelken. På stoppeklokka går skiva rundt én gang i minuttet.</p>

  <h4>Notat</h4>
  <p>Et fritekst-felt som vokser automatisk med innholdet. Lagres automatisk i nettleseren — du mister ikke notatet ved omlasting.</p>
  <p>Du kan ha <strong>flere notatkort</strong>: åpne <strong>⊞ Kort</strong>-menyen og klikk <strong>+ Notat</strong>. Hvert notat kan flyttes uavhengig av de andre. Slett et notat med <strong>✕</strong> i kortets øverste høyre hjørne. Notater er per side — side 1 og side 2 har helt forskjellige notatkort.</p>

  <h4>Dagsplan</h4>
  <p>Legg til punkter med <strong>+ Legg til punkt</strong> (eller <kbd>d</kbd>). Fjern enkeltpunkter med <strong>✕</strong> ved siden av hvert punkt, eller tøm hele planen med <strong>🧹</strong> øverst i kortet (to trykk).</p>
  <p><strong>Gjennom dagen:</strong> punktet som pågår, er uthevet. Trykk <strong>▶ Neste</strong> (eller <kbd>p</kbd>) når dere er ferdige med det, så krysses det av og neste punkt blir uthevet. <kbd>Shift</kbd>+<kbd>P</kbd> angrer. Krysser du av for hånd med prikken, følger uthevingen med.</p>
  <p>Hvert punkt har tre klikkmål: <strong>prikken</strong> (●) markerer punktet ferdig — den blir grønn og teksten får en strek over (klikk igjen for å angre). <strong>Teksten</strong> åpner redigering — klikk på den, rett opp og trykk <kbd>Enter</kbd> for å lagre eller <kbd>Esc</kbd> for å avbryte. <strong>✕</strong> fjerner punktet.</p>
  <p><strong>Endre rekkefølge:</strong> hold inne dra-håndtaket <strong>⠿</strong> helt til høyre på punktet (vises når du holder musa over raden) og dra det opp eller ned. En blå strek viser hvor punktet havner når du slipper.</p>

  <h4>🖼 Bildekort</h4>
  <p>Bildekortet er ikke med fra start. Legg det til via <strong>⊞ Kort → + 🖼 Bilde</strong> — du kan ha så mange bildekort du vil.</p>
  <p>Klikk på bilde-kortet for å velge en bildefil fra datamaskinen (maks 50 MB). Du kan også lime inn et bilde direkte med <kbd>Ctrl+V</kbd> (f.eks. et skjermbilde) — klikk først på kortet du vil lime inn i. Bildet lagres i nettleseren (IndexedDB) og vises igjen ved neste besøk. Trykk <strong>Fjern bilde</strong> for å slette bildeinnholdet.</p>
  <p>Du kan ha <strong>flere bildekort</strong>: åpne <strong>⊞ Kort</strong>-menyen og klikk <strong>+ Bilde</strong>. Slett et bildekort med <strong>✕</strong> i kortets øverste høyre hjørne. Bildekort er per side — forskjellige sider har forskjellige bilder.</p>

  <h4>▶️ YouTube-kort</h4>
  <p>Legg til et YouTube-kort via <strong>⊞ Kort</strong>-menyen og <strong>+ ▶️ YouTube</strong>. Lim inn en YouTube-lenke (vanlig lenke, <em>youtu.be</em> eller <em>Shorts</em> funker alle) og trykk <strong>Vis</strong> — videoen spilles rett i kortet.</p>
  <p><strong>🎵 Kun lyd:</strong> bytt mellom <strong>▶ Video</strong> og <strong>🎵 Kun lyd</strong> øverst i kortet. I lyd-modus skjules bildet og du får en liten play/pause-linje med en <strong>volum­glider</strong> (🔊) til høyre — fint for bakgrunnsmusikk eller et lydklipp uten at videoen tar plass. Volumet du stiller inn huskes til neste gang. Lyden spiller videre uavbrutt når du bytter modus. Trykk <strong>↻</strong> for å bytte til en annen lenke, og <strong>✕</strong> for å slette kortet.</p>
  <p>Du kan ha <strong>flere YouTube-kort</strong>, og de er per side som de andre kortene.</p>

  <h4>Tilpasse layouten</h4>
  <p><strong>Flytte et kort:</strong> ta tak i overskriften på kortet og dra det dit du vil. Kortene kan ligge hvor som helst på skjermen, også delvis oppå hverandre. Kortet du tar i, legger seg øverst.</p>
  <p><strong>Endre størrelse:</strong> dra i en kant eller et hjørne av kortet. Er innholdet større enn kortet, kan du scrolle inni det.</p>
  <p><strong>Bilde og YouTube</strong> har alltid høyden mediet trenger, så proporsjonene holder. Du endrer størrelsen ved å dra i sidene eller hjørnene, og høyden følger med. Bytter du YouTube til <strong>Kun lyd</strong>, krymper kortet til lydlinja.</p>
  <p><strong>Kort som vokser selv:</strong> elever, dagsplan, grupper og notat blir høyere når innholdet vokser og lavere når det krymper. De vokser nedover, og er det stopp under (et annet kort eller bunnen av skjermen), vokser de oppover så langt det er plass. Er det ikke mer plass, scroller de. Drar du et slikt kort større selv, blir den høyden en minstehøyde: kortet krymper ikke under den, men vokser fortsatt når innholdet ikke får plass.</p>
  <p><strong>Magnetiske kanter:</strong> når en kant kommer nær kanten av skjermen eller et annet kort, smekker den på plass, og en blå linje viser hva den festet seg til. Da blir det lett å få kortene på rad. Hold <kbd>Alt</kbd> mens du drar hvis du vil plassere helt fritt.</p>
  <p><strong>Samme oppsett på tavla:</strong> plassering og størrelse huskes som andeler av skjermen, ikke i piksler. Lager du oppsettet på laptopen, ser det likt ut på tavla, bare større. Oppsettet lagres per side.</p>
  <p><strong>Fjerne et kort:</strong> hold musen over kortet og klikk <strong>✕</strong> øverst i høyre hjørne. Faste kort (elever, grupper, trekk, timer, dagsplan) blir bare skjult — du henter dem tilbake i <strong>⊞ Kort</strong>-menyen. Notat- og bildekort slettes helt.</p>
  <p><strong>⊞ Kort-menyen</strong> (øverst til høyre) viser de faste kortene med av/på-avkryssing per side. Notat, bilde og YouTube har i stedet en <strong>«+»</strong> — trykk for å legge til så mange du vil. Hvert nytt kort er eget for den siden du står på.</p>
  <p><strong>Hvor havner et nytt kort?</strong> På første ledige plass, regnet ovenfra og fra venstre, enten du krysser det av i menyen eller trykker «+». Er skjermen full, legges det litt forskjøvet oppå de andre, så du ser det med en gang. Et kort du skrur av og på igjen, kommer tilbake der det sto hvis plassen er ledig. Ellers beholder det størrelsen sin og havner på første ledige plass.</p>
  <p><strong>Liten skjerm:</strong> på smale skjermer (nettbrett på høykant, mobil) stables kortene under hverandre, ovenfra og ned i samme rekkefølge som på den store skjermen.</p>

  <h4>Tema</h4>
  <p>Åpne <strong>Skoledash-menyen</strong> (🏫 Skoledash øverst til venstre) og hold musen over <strong>🎨 Tema</strong>. Velg blant tre standardtemaer (Lyst, Mørkt, Høy kontrast) eller sju kreative temaer: Under vann, På fjellet, I skogen og I en vulkan under <strong>Eventyr</strong>, og Fluttershy, Twilight og Rarity under <strong>Jonatan spesial</strong>. Høy kontrast er hvit tekst på svart bakgrunn, laget for å leses på avstand. Flere temaer har et svakt mønster i bakgrunnen. Temaet lagres automatisk.</p>

  <h4>Font</h4>
  <p>Hold musen over <strong>🔤 Font</strong> i Skoledash-menyen. Velg blant systemstandard og fem andre: <em>Lexend</em> (laget for å gjøre lesing lettere), <em>Outfit</em> (ren og moderne), <em>Sniglet</em> (rund og leken), <em>Kalam</em> (håndskrift) og <em>JetBrains Mono</em> (alle tegn like brede). Valget lagres til neste gang.</p>
  <p>Fontene ligger på skoledash.app, så appen henter ingenting fra Google eller andre fonttjenester.</p>

  <h4>Målform (bokmål eller nynorsk)</h4>
  <p>Hold musen over <strong>🗣 Målform</strong> i Skoledash-menyen og velg <strong>Bokmål</strong> eller <strong>Nynorsk</strong>. Siden lastes på nytt med den nye målformen, og valget huskes. Alt du har lagt inn, som elevnavn og notater, blir stående som du skrev det.</p>

  <h4>Skriftstørrelse</h4>
  <p>Hold musen over <strong>📏 Skriftstørrelse</strong> i Skoledash-menyen. Under <strong>Alle kort</strong> skalerer du hele grensesnittet (Liten → Ekstra stor), der Normal er standardstørrelsen. Under <strong>Enkelt kort</strong> står hvert kort som er på siden, med et tall i prosent. <strong>0</strong> betyr samme størrelse som alle de andre. Skriv for eksempel <strong>-20</strong> for å gjøre kortet 20 % mindre, eller <strong>30</strong> for å gjøre det 30 % større. Du kan også bruke piltastene. Tallet kan være fra -50 til 100.</p>
  <p><strong>Klokke, timer, tilfeldig elev, ordenselever, klassebamse og terning</strong> står ikke i lista. Så lenge du ikke har endret størrelsen selv, er kortet akkurat så høyt som innholdet trenger, og det vokser hvis det dukker opp mer (for eksempel backlog-telleren i trekket). Drar du kortet større, blir tall, urskive og knapper større. Gjør du det mindre enn innholdet trenger, krymper innholdet så alt fortsatt får plass.</p>
  <p>Størrelsen huskes selv om du tar bort kortet. Slår du det på igjen senere, har det samme størrelse som før.</p>

  <h4>Tekststørrelse og kursiv i Notat</h4>
  <p>Trykk <strong>A−</strong> og <strong>A+</strong> øverst i Notat-kortet for å gjøre teksten mindre eller større, fra 75 % opp til fire ganger standardstørrelsen. Hvert notat husker sin egen størrelse, og kortet vokser med teksten.</p>
  <p>Trykk <strong><em>𝐼</em></strong>-knappen for å slå kursiv tekst av og på. Innstillingene lagres automatisk.</p>

  <h4>Tavlemodus</h4>
  <p>Trykk <strong>🖥 Tavle</strong> (eller <kbd>b</kbd>) for en helt svart skjerm — nyttig når du vil fokusere elevoppmerksomheten. Klikk hvor som helst eller trykk <kbd>Esc</kbd> for å avslutte.</p>

  <h4>Tastatursnarveger</h4>
  <ul>
    <li><kbd>a</kbd> — Legg til elev</li>
    <li><kbd>r</kbd> — Trekk tilfeldig elev</li>
    <li><kbd>R</kbd> — Trekk tilfeldig (backlog)</li>
    <li><kbd>o</kbd> — Trekk ordenselever</li>
    <li><kbd>u</kbd> — Trekk klassebamse</li>
    <li><kbd>t</kbd> — Start/stopp timer</li>
    <li><kbd>s</kbd> — Sett timer-tid</li>
    <li><kbd>g</kbd> — Del inn i grupper</li>
    <li><kbd>d</kbd> — Legg til dagsplan-punkt</li>
    <li><kbd>p</kbd> — Neste punkt i dagsplanen (<kbd>Shift</kbd>+<kbd>P</kbd> angrer)</li>
    <li><kbd>f</kbd> — Fokus: kortet musa er over, fyller skjermen (<kbd>Esc</kbd> lukker)</li>
    <li><kbd>k</kbd> — Kast terning</li>
    <li><kbd>l</kbd> — Vis klasselister</li>
    <li><kbd>b</kbd> — Tavlemodus</li>
    <li><kbd>n</kbd> — 💾 Data (backup og sletting)</li>
    <li><kbd>Esc</kbd> — Lukk åpne vinduer</li>
  </ul>
  <p>Snarveiene virker bare når du <em>ikke</em> står og skriver i et tekstfelt, og de utløses ikke sammen med <kbd>Cmd</kbd>/<kbd>Ctrl</kbd>/<kbd>Alt</kbd>.</p>

  <h4>💬 Tilbakemelding & kontakt</h4>
  <p>Klikk <strong>💬 Tilbakemelding</strong> i Skoledash-menyen (🏫 Skoledash øverst til venstre). Der finner du to måter å nå utvikleren på: send en e-post til <strong>knitresletta@pm.me</strong>, eller opprett en sak (issue) på GitHub for å melde en feil eller foreslå en ny funksjon.</p>

  <h4>Lagring og personvern</h4>
  <p>Alt du legger inn, lagres automatisk i nettleseren din: elevnavn, klasselister, grupper, notater og bilder. <strong>Ingen elevdata forlater maskinen.</strong> Ulike nettlesere eller private vinduer har hver sin lagring.</p>
  <p>Noen funksjoner henter likevel data fra andre tjenester. Det som sendes, er aldri elevdata, men tjenesten ser IP-adressen din, slik alle nettsider gjør:</p>
  <ul>
    <li><strong>Selve appen</strong> lastes fra skoledash.app. Fontene ligger også der, og hentes ikke fra Google eller andre fonttjenester.</li>
    <li><strong>Vær og pollen</strong> hentes når appen starter og hvert tiende minutt. Koordinatene til stedet sendes til Meteorologisk institutt (api.met.no) og open-meteo.com. Søker du opp et sted, sendes stedsnavnet til open-meteo.com.</li>
    <li><strong>Posisjon</strong> brukes bare når du ber om det, med <strong>📍 Vis været der du er</strong> eller <strong>📍 Bruk min posisjon</strong>. Koordinatene rundes av til omtrent en kilometer, sendes én gang til bigdatacloud.net for å finne stedsnavnet, og lagres. Deretter er det disse avrundede koordinatene som brukes til været.</li>
    <li><strong>YouTube-kortet</strong> viser videoer fra youtube-nocookie.com i en egen ramme. Rammen er adskilt fra resten av appen, så YouTube kan ikke lese elevdataene dine. Spilleren lastes når appen åpnes, så lenge et YouTube-kort har en video, også om kortet ligger på en annen side. YouTube ser at videoen vises på skoledash.app, og kan sette egne informasjonskapsler inne i spilleren.</li>
  </ul>
  <p><strong>Delte maskiner:</strong> elevdataene blir liggende i nettleseren til du sletter dem. Bruker andre den samme maskinen og nettleseren, kan de se klasselistene dine. Når du er ferdig på en slik maskin, velg <strong>💾 Data → 🗑 Slett alle data på denne maskinen</strong>. Ta gjerne en backup først.</p>
  <p>Backupfila du eksporterer, inneholder alt, også notater og bilder. Ta vare på den like trygt som en klasseliste.</p>

  <h4>💾 Backup: eksportere og importere</h4>
  <p>Siden data kun bor i nettleseren din, er det lurt å ta en <strong>backup</strong>. Trykk <strong>💾 Data</strong> nederst til venstre og velg <strong>📤 Eksporter backup</strong> — da lastes det ned én fil som inneholder alt: klasselister, alle sider (med elever, grupper, trekk-backlogs og begrensninger), innstillinger, notater og bilder.</p>
  <p>For å hente data tilbake — eller flytte alt til en annen maskin eller nettleser — velg <strong>📥 Importer backup</strong> under 💾 Data og pek på fila. Du får velge mellom <strong>«Erstatt alt»</strong> (full gjenoppretting som overskriver det som ligger der nå) og <strong>«Slå sammen kun klasselister»</strong> (behold alt ditt, men hent inn de lagrede listene fra fila — fint for å dele klasselister mellom lærere).</p>
  <p>Når du har laget nye lister eller endret en backlog siden forrige eksport, dukker det opp et lite <strong>«● Ueksporterte endringer»</strong>-merke nederst, rett over hurtigtast-baren. Klikk på det for å ta en ny backup. Merket viser også hvor lenge det er siden forrige backup. Tips: eksporter med jevne mellomrom, så er du trygg om nettleserdata skulle bli tømt.</p>
  <p><strong>Safari rydder bort data</strong> fra nettsider som ikke er brukt på sju dager. Bruker du Safari på Mac eller iPad, er det særlig lurt å ta en backup før ferier. Skoledash ber nettleseren om å ta vare på dataene, men Safari bestemmer selv.</p>
  <p><strong>Åpen i flere faner?</strong> Endrer du noe i én fane, slutter de andre fanene å lagre, så de ikke skriver over endringen. Går du tilbake til en slik fane, lastes den inn på nytt med det nyeste. Står fanen framme på skjermen, ser du et rødt varsel med knappen <strong>↻ Last inn på nytt</strong>.</p>`;

// Åpner info-overlayet med gitt tittel og ferdig HTML-innhold (logg eller guide).
// Oppdateringsloggen står på bokmål. På nynorsk får den en merknad øverst, og den
// korte planen («Hva kommer?») byttes med nynorskutgaven fra tekster.js.
function oppdateringsloggHtml() {
  if (state.språk !== 'nn') return OPPDATERINGSLOGG_HTML;
  return LOGG_MERKNAD_NN +
    OPPDATERINGSLOGG_HTML.replace(/<details class="logg-roadmap">[\s\S]*?<\/details>/, ROADMAP_KORT_NN);
}

// Brukerveiledningen på nynorsk når den finnes; ellers bokmål med en merknad øverst.
function brukerveiledningHtml() {
  if (state.språk !== 'nn') return BRUKERVEILEDNING_HTML;
  return BRUKERVEILEDNING_NN ?? (BRUKERVEILEDNING_MERKNAD_NN + BRUKERVEILEDNING_HTML);
}

function åpneInfoModal(tittel, innholdHtml) {
  document.getElementById('info-modal-tittel').textContent = tittel;
  document.getElementById('info-modal-innhold').innerHTML = innholdHtml;
  document.getElementById('info-overlay').classList.remove('hidden');
}

// Lukker info-overlayet.
function lukkInfoModal() {
  document.getElementById('info-overlay').classList.add('hidden');
}

// ===================== Modals =====================
let aktivModal = null;

// Åpner modalen med gitt id: vis overlayet, skjul alle modaler og vis kun den ene.
// Husker hvilken som er åpen i `aktivModal` (brukes av Esc-tasten). Fokuserer et
// eventuelt input-felt etter en liten forsinkelse, så feltet er klart til å skrive i.
function åpneModal(id) {
  document.getElementById('modal-overlay').classList.remove('hidden');
  document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
  aktivModal = id;
  const input = document.querySelector(`#${id} input`);
  if (input) setTimeout(() => input.focus(), 60);
}

// Lukker den åpne modalen og nullstiller aktivModal.
function lukkModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
  aktivModal = null;
}

// ===================== Notifications =====================
// Viser en liten «toast»-melding nede i hjørnet som fjerner seg selv etter 3,2 sek.
// `type` (success/warning/error) styrer fargen via CSS-klassen.
function notify(melding, type = 'success') {
  const container = document.getElementById('notif-container');
  const el = document.createElement('div');
  el.className   = `notif ${type}`;
  el.textContent = melding;
  container.appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

// ===================== Utils =====================
// Escaper HTML-spesialtegn i brukerinnhold (elevnavn osv.) før det settes inn via
// innerHTML. Hindrer at f.eks. et navn med < eller " bryter markupen / injiserer HTML.
// & må escapes først, ellers ville den doble-escape de andre erstatningene.
function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ===================== Språk (bokmål / nynorsk) =====================
// Bokmål står i koden. t() slår opp bokmålsteksten i NYNORSK (tekster.js) når nynorsk
// er valgt, og fyller inn plassholdere: t('{navn} er allerede inne', { navn }).
// Finnes ikke teksten i ordboka, brukes bokmål, så ingenting blir tomt.
// Verdier som settes inn i HTML, må være escapet av den som kaller (esc()).
function t(tekst, verdier) {
  let ut = state.språk === 'nn' && Object.hasOwn(NYNORSK, tekst) ? NYNORSK[tekst] : tekst;
  if (verdier) ut = ut.replace(/\{(\w+)\}/g, (hel, nøkkel) => (nøkkel in verdier ? String(verdier[nøkkel]) : hel));
  return ut;
}

// Normaliserer tekst til oppslag: mellomrom og linjeskift slås sammen.
const normaliserTekst = s => s.replace(/\s+/g, ' ').trim();

// Oversetter den faste teksten i index.html. Kjøres én gang, først i init(), før noe
// annet tegnes, så bare tekst som står i HTML-fila berøres, aldri elevnavn eller annet
// lærerne har skrevet. Bytte av språk laster siden på nytt (settSpråk).
//  - Elementer med data-t-html: hele innholdet oversettes som ett avsnitt (for tekst
//    med <strong>, <kbd> o.l. inni). Teksten kommer fra tekster.js, ikke fra brukere.
//  - Ellers: hver tekstnode og attributtene title, placeholder og aria-label.
function oversettStatisk() {
  document.documentElement.lang = state.språk === 'nn' ? 'nn' : 'nb';
  if (state.språk !== 'nn') return;
  for (const el of document.querySelectorAll('[data-t-html]')) {
    const nøkkel = normaliserTekst(el.innerHTML);
    if (Object.hasOwn(NYNORSK, nøkkel)) el.innerHTML = NYNORSK[nøkkel];
  }
  const gå = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode: n => (n.parentElement.closest('script, style, [data-t-html]')
      ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
  });
  for (let node = gå.nextNode(); node; node = gå.nextNode()) {
    const nøkkel = normaliserTekst(node.nodeValue);
    if (!nøkkel || !Object.hasOwn(NYNORSK, nøkkel)) continue;
    // Behold mellomrommet rundt, så tekst ved siden av ikoner og tagger ikke klistres sammen.
    const [, før, , etter] = node.nodeValue.match(/^(\s*)([\s\S]*?)(\s*)$/);
    node.nodeValue = før + NYNORSK[nøkkel] + etter;
  }
  for (const attr of ['title', 'placeholder', 'aria-label']) {
    for (const el of document.querySelectorAll(`[${attr}]`)) {
      const nøkkel = normaliserTekst(el.getAttribute(attr));
      if (Object.hasOwn(NYNORSK, nøkkel)) el.setAttribute(attr, NYNORSK[nøkkel]);
    }
  }
}

// Bytter målform. Lagrer valget og laster siden på nytt, så alt tegnes på nytt med
// riktig tekst. Enklere og tryggere enn å oppdatere alt som allerede står på skjermen.
function settSpråk(språk) {
  if (språk !== 'nb' && språk !== 'nn') return;
  if (state.språk === språk) return;
  state.språk = språk;
  saveState();
  location.reload();
}

// Snarvei for modal-input: Enter kjører bekreft-funksjonen, Esc lukker modalen.
function inputEnter(inputId, bekreftFn) {
  document.getElementById(inputId).addEventListener('keydown', e => {
    if (e.key === 'Enter')  bekreftFn();
    if (e.key === 'Escape') lukkModal();
  });
}

// ===================== Tema =====================
// Bytter fargetema. Selve fargene ligger i CSS, knyttet til data-theme på <html>;
// her setter vi bare attributtet, lagrer valget og markerer det aktive valget i menyen.
// Temaer som finnes. Et lagret tema som er tatt ut (eventyrland, matrix og cyberspace
// forsvant i v2.25), eller et ukjent navn fra en importfil, faller tilbake til «lyst».
const TEMAER = ['lyst', 'mørkt', 'kontrast', 'under-vann', 'fjellet', 'skogen', 'vulkan',
  'fluttershy', 'twilight', 'rarity'];

// Temaer som har byttet navn (v2.26). Gamle nøkler fra lagring eller importfiler
// gjøres om, så brukeren beholder temaet sitt.
const GAMLE_TEMANAVN = { 'equestria': 'fluttershy', 'cosmic': 'twilight', 'cute': 'rarity' };

function settTema(tema) {
  tema = GAMLE_TEMANAVN[tema] ?? tema;
  if (!TEMAER.includes(tema)) tema = 'lyst';
  state.tema = tema;
  document.documentElement.setAttribute('data-theme', tema);
  saveState();
  document.querySelectorAll('.tema-valg').forEach(el => {
    el.classList.toggle('aktiv', el.dataset.tema === tema);
  });
}

// ===================== Font =====================
// Tilgjengelige fonter. `css` er font-family-verdien som settes. Webfontene er
// deklarert med @font-face i style.css og ligger i fonts/, så appen henter ingenting
// fra Google. Nøkkelen lagres i state.font og i eksportfiler: ikke gi nytt navn til en
// nøkkel, da faller brukerens valg tilbake til system.
const FONTER = {
  'system':         { css: 'system-ui,-apple-system,"Segoe UI",sans-serif' },
  'lexend':         { css: '"Lexend",sans-serif' },
  'outfit':         { css: '"Outfit",sans-serif' },
  'sniglet':        { css: '"Sniglet",sans-serif' },
  'kalam':          { css: '"Kalam",cursive' },
  'jetbrains-mono': { css: '"JetBrains Mono",monospace' },
};

// Bytter skrifttype via CSS-variabelen --font. Nettleseren laster selv ned fontfila
// første gang tekst bruker familien, så her trengs ingen egen lastelogikk.
// En ukjent nøkkel (f.eks. en font som er fjernet, fra gammel lagring eller en
// importert backup) blir til 'system', og det er det som lagres.
function settFont(fontKey) {
  const nøkkel = Object.hasOwn(FONTER, fontKey) ? fontKey : 'system';
  document.documentElement.style.setProperty('--font', FONTER[nøkkel].css);
  state.font = nøkkel;
  saveState();
  document.querySelectorAll('.font-valg').forEach(el => {
    el.classList.toggle('aktiv', el.dataset.font === nøkkel);
  });
}

// Rot-skriftstørrelser (px). Alt i grensesnittet måles i rem, så dette ene tallet
// skalerer hele appen. Skalaen ble flyttet 3px opp i v2.24 (var 14/16/18/20), fordi
// appen mest brukes på store tavler. Nøklene er uendret, så lagrede valg virker.
// Standarden (19px) står også i style.css, så siden ikke hopper før JS har kjørt.
const STØRRELSER = {
  'liten':  '17px',
  'normal': '19px',
  'stor':   '21px',
  'xl':     '23px',
};

// Setter global skriftstørrelse ved å endre rot-størrelsen (--font-size). Siden alt
// måles i rem skalerer hele grensesnittet proporsjonalt med dette ene tallet.
function settSkriftstørrelse(key) {
  const px = STØRRELSER[key] ?? STØRRELSER['normal'];
  document.documentElement.style.setProperty('--font-size', px);
  state.skrift_størrelse = key;
  saveState();
  document.querySelectorAll('.størrelse-valg').forEach(el => {
    el.classList.toggle('aktiv', el.dataset.størrelse === key);
  });
}

// Setter størrelsen for ETT widget-kort, oppå den globale størrelsen. 0 lagres ikke
// (slettes fra state), så «som alle» er standard. Verdien ligger i state også når
// widgeten er skjult, så den er den samme neste gang widgeten slås på.
function settWidgetSkriftstørrelse(widgetId, prosent) {
  const pst = klemWidgetProsent(prosent);
  // Bruker zoom (ikke font-size), ellers ignorerer kortets rem-baserte tekst endringen.
  const card = document.getElementById(widgetId);
  if (card) card.style.zoom = pst ? String(1 + pst / 100) : '';
  if (!state.widget_størrelser) state.widget_størrelser = {};
  if (pst) {
    state.widget_størrelser[widgetId] = pst;
  } else {
    delete state.widget_størrelser[widgetId];
  }
  saveState();
}

// Gjenoppretter alle lagrede per-widget-størrelser ved oppstart.
function applyWidgetStørrelser() {
  const map = state.widget_størrelser ?? {};
  // Widgets som skalerer med kortet, har ikke prosent lenger (se SKALER_MED_KORT).
  Object.keys(map).filter(erSkalerKort).forEach(id => delete map[id]);
  Object.entries(map).forEach(([id, pst]) => settWidgetSkriftstørrelse(id, pst));
}

// Bygger «Enkelt widget»-delen av Skriftstørrelse-menyen: én rad med tallfelt per
// widget som er synlig på aktiv side. Kalles fra applyLayout(), så lista følger med
// når widgets slås av og på eller man bytter side.
function renderWidgetStørrelseMeny() {
  const liste = document.getElementById('widget-str-liste');
  if (!liste) return;
  // Innstillingen gjelder alle sider, så de tre kortene står alltid her, også når de
  // er skjult på siden som vises.
  const synlige = Object.keys(WIDGET_NAVN).filter(id => !erSkalerKort(id));
  // Forklarer hvorfor klokka og de andre ikke står i lista.
  const skalerHint = `<div class="widget-str-tom">${t('Bare kort som vokser med innholdet (elever, grupper, dagsplan) har prosent. De andre blir større når du drar kortet større, og notat har A− og A+ i kortet.')}</div>`;
  liste.innerHTML = synlige.map(id => {
    // Kortet kan ha fått eget navn på siden (✏️).
    const navn = kortNavn(id) || t(WIDGET_NAVN[id]);
    const pst = state.widget_størrelser?.[id] ?? 0;
    return `
      <label class="widget-str-rad" for="str-${id}">
        <span>${esc(navn)}</span>
        <span class="widget-str-felt">
          <input type="number" id="str-${id}" data-widget="${id}" value="${pst}"
                 min="${WIDGET_PROSENT_MIN}" max="${WIDGET_PROSENT_MAKS}" step="5"
                 title="${t('0 = samme som alle kort. Negativt tall krymper, positivt forstørrer')}">
          %
        </span>
      </label>`;
  }).join('') + skalerHint;
}

// ===================== Event setup =====================
// Kobler alle klikk-, tastatur- og overlay-hendelser i grensesnittet til funksjonene
// sine. Kjøres én gang ved oppstart (fra init). Delene under er gruppert per widget/
// meny med egne kommentarer. Hver «bekreft»-funksjon valideres før modalen lukkes.
function settOppHendelser() {
  // Legg til elev
  document.getElementById('btn-legg-til').onclick = () => {
    document.getElementById('input-elev-navn').value = '';
    åpneModal('modal-legg-til');
  };
  const bekreftLeggTil = () => {
    const navn = document.getElementById('input-elev-navn').value;
    if (leggTilElev(navn)) lukkModal();
  };
  document.getElementById('btn-legg-til-bekreft').onclick = bekreftLeggTil;
  // 🧹 Tøm: to trykk. Er ikke elevene lagret i en liste, sier spørsmålet fra om det.
  // Etterpå åpnes «Legg til elev», så læreren kan skrive inn den nye klassen.
  toTrykk(document.getElementById('btn-tom-elever'), {
    spørsmål: () => elevlistaErLagret() || !aktivSide().elever.length ? t('Tøm?') : t('Ikke lagret. Tøm?'),
    tittel: () => elevlistaErLagret()
      ? t('Trykk igjen for å tømme. Lista {navn} er lagret og røres ikke.', { navn: sidensListe() })
      : t('Trykk igjen for å tømme. Elevene er ikke lagret i en liste og blir borte.'),
    utfør: () => {
      tømElevlista();
      document.getElementById('btn-legg-til').click();
    },
  });
  document.getElementById('btn-lagring-last').onclick = lastInnPåNytt;
  document.getElementById('btn-fokus-lukk').onclick = lukkFokus;
  document.getElementById('fokus-bakgrunn').onclick = lukkFokus;
  window.addEventListener('resize', () => { if (fokusKort) skalerFokus(); });
  // Husk kortet musa er over, så f vet hva som skal i fokus.
  document.getElementById('flate').addEventListener('pointermove', e => {
    const plass = e.target.closest('.kl-plass');
    if (plass) sistPekerKort = plass.dataset.kort;
  });
  document.getElementById('btn-ordenselev-antall').onclick = byttOrdenselevAntall;
  document.getElementById('btn-dagsplan-neste').onclick = () => nesteDagsplanPunkt();
  document.getElementById('btn-legg-til-avbryt').onclick  = lukkModal;
  inputEnter('input-elev-navn', bekreftLeggTil);

  // Timer
  const bekreftTimerSett = () => {
    const m = parseInt(document.getElementById('input-timer-minutter').value);
    if (m >= 1 && m <= 60) { if (state.timere[timerSettMål]) timerSett(timerSettMål, m); lukkModal(); }
    else notify(t('Skriv inn 1–60 minutter'), 'warning');
  };
  document.getElementById('btn-timer-sett-bekreft').onclick = bekreftTimerSett;
  document.getElementById('btn-timer-sett-avbryt').onclick  = lukkModal;
  inputEnter('input-timer-minutter', bekreftTimerSett);

  // Draws
  setupTilfeldig('card-tilfeldig');
  document.getElementById('btn-ordenselev').onclick       = trekkOrdenselev;
  document.getElementById('btn-ulv').onclick              = trekkUlv;

  // Backlog-editor
  document.getElementById('btn-rediger-ordenselev').onclick = () => åpneRedigerBacklog('ordenselev');
  document.getElementById('btn-rediger-ulv').onclick        = () => åpneRedigerBacklog('ulv');
  document.getElementById('btn-rediger-backlog-lukk').onclick = lukkModal;

  // Dagsplan
  document.getElementById('btn-dagsplan-legg-til').onclick = () => {
    document.getElementById('input-dagsplan-punkt').value = '';
    åpneModal('modal-dagsplan');
  };
  const bekreftDagsplan = () => {
    const tekst = document.getElementById('input-dagsplan-punkt').value.trim();
    if (tekst) { leggTilDagsplan(tekst); lukkModal(); }
  };
  document.getElementById('btn-dagsplan-bekreft').onclick = bekreftDagsplan;
  document.getElementById('btn-dagsplan-avbryt').onclick  = lukkModal;
  inputEnter('input-dagsplan-punkt', bekreftDagsplan);

  // Grupper
  document.getElementById('btn-grupper-ny').onclick  = () => {
    document.getElementById('input-grupper-antall').value = '';
    åpneModal('modal-grupper');
  };
  document.getElementById('btn-grupper-fjern').onclick = fjernGrupper;
  const bekreftGrupper = () => {
    const n = parseInt(document.getElementById('input-grupper-antall').value);
    if (n >= 2) { lagGrupper(n); lukkModal(); }
    else notify(t('Skriv inn minst 2'), 'warning');
  };
  document.getElementById('btn-grupper-bekreft').onclick = bekreftGrupper;
  document.getElementById('btn-grupper-avbryt').onclick  = lukkModal;
  inputEnter('input-grupper-antall', bekreftGrupper);

  // Lister
  document.getElementById('btn-lister').onclick = () => {
    renderListerModal();
    åpneModal('modal-lister');
  };
  document.getElementById('btn-lister-lukk').onclick = lukkModal;
  document.getElementById('btn-lister-importer').onclick = () => document.getElementById('importer-liste-fil').click();
  document.getElementById('importer-liste-fil').addEventListener('change', e => importerListeFil(e.target));
  document.getElementById('btn-lister-lagre').onclick = () => {
    if (!aktivSide().elever.length) { notify(t('Ingen elever inne å lagre'), 'warning'); return; }
    lukkModal();
    document.getElementById('input-liste-navn').value = '';
    åpneModal('modal-lagre-liste');
  };
  const bekreftLagreListe = () => {
    const navn = document.getElementById('input-liste-navn').value.trim();
    if (navn) { lagreListe(navn); lukkModal(); }
    else notify(t('Skriv inn et navn'), 'warning');
  };
  document.getElementById('btn-lagre-liste-bekreft').onclick = bekreftLagreListe;
  document.getElementById('btn-lagre-liste-avbryt').onclick  = lukkModal;
  inputEnter('input-liste-navn', bekreftLagreListe);

  // 💾 Data (nederst til venstre): backup og sletting. Det som før lå i Nullstill-
  // menyen for hvert kort, har fått egne knapper på kortene (🔄 og 🧹).
  document.getElementById('btn-data').onclick      = () => åpneModal('modal-data');
  document.getElementById('btn-data-lukk').onclick = lukkModal;
  document.getElementById('data-liste').addEventListener('click', e => {
    const item = e.target.closest('[data-action]');
    if (!item) return;
    lukkModal();
    switch (item.dataset.action) {
      case 'eksporter': eksporterData(); break;
      case 'importer':  document.getElementById('import-fil').click(); break;
      case 'slett_alt': åpneSlettAltModal(); break;
    }
  });
  // Nullstilling på kortene. Ordenselev og bamse mister hvem som har hatt tur, og
  // dagsplanen alt som er skrevet, så de krever to trykk. Tilfeldig-backlogen er
  // billig å miste og tømmes med ett.
  toTrykk(document.getElementById('btn-ordenselev-tom'), {
    spørsmål: t('Nullstille?'), tittel: () => t('Trykk igjen: alle kan bli ordenselev igjen'), utfør: nullstillOrdenselev });
  toTrykk(document.getElementById('btn-ulv-tom'), {
    spørsmål: t('Nullstille?'), tittel: () => t('Trykk igjen: alle kan få bamsen igjen'), utfør: nullstillUlv });
  toTrykk(document.getElementById('btn-dagsplan-tom'), {
    spørsmål: t('Tømme?'), tittel: () => t('Trykk igjen for å slette alle punktene i dagsplanen'), utfør: nullstillDagsplan });

  // Slett alle data på denne maskinen (to klikk på «Slett alt»)
  document.getElementById('btn-slett-alt-avbryt').onclick    = lukkModal;
  document.getElementById('btn-slett-alt-eksporter').onclick = () => eksporterData();
  document.getElementById('btn-slett-alt-bekreft').onclick   = e => {
    const knapp = e.currentTarget;
    if (knapp.dataset.bekreft !== '1') {
      knapp.dataset.bekreft = '1';
      knapp.textContent = t('Trykk igjen for å slette alt');
      return;
    }
    slettAlleData();
  };


  // Blackboard
  document.getElementById('btn-blackboard').onclick = () =>
    document.getElementById('blackboard-overlay').classList.remove('hidden');
  document.getElementById('blackboard-overlay').onclick = () =>
    document.getElementById('blackboard-overlay').classList.add('hidden');


  // Widget-synlighetsmeny
  const btnWidgetMeny   = document.getElementById('btn-widget-meny');
  const widgetDropdown  = document.getElementById('widget-dropdown');
  btnWidgetMeny.onclick = e => {
    e.stopPropagation();
    renderWidgetMeny();
    widgetDropdown.classList.toggle('hidden');
  };
  widgetDropdown.addEventListener('click', e => e.stopPropagation());

  // Klasserom-meny
  const btnKlasserom  = document.getElementById('btn-klasserom-meny');
  const klasseromDrop = document.getElementById('klasserom-dropdown');
  btnKlasserom.onclick = e => {
    e.stopPropagation();
    klasseromDrop.classList.toggle('hidden');
  };
  klasseromDrop.addEventListener('click', e => {
    e.stopPropagation();
    // Valg som går via data-klikk (Tilbakemelding, Klasselister) åpner et vindu.
    // Menyen lukkes, så den ikke blir hengende åpen bak vinduet. Selve handlingen
    // kjøres av den felles data-klikk-lytteren.
    if (e.target.closest('[data-klikk]')) klasseromDrop.classList.add('hidden');
  });
  document.getElementById('btn-åpne-logg').onclick  = () => {
    klasseromDrop.classList.add('hidden');
    åpneInfoModal(t('📋 Oppdateringslogg'), oppdateringsloggHtml());
  };
  document.getElementById('btn-åpne-guide').onclick = () => {
    klasseromDrop.classList.add('hidden');
    åpneInfoModal(t('❓ Brukerveiledning'), brukerveiledningHtml());
  };
  document.getElementById('import-fil').addEventListener('change', e => håndterImportFil(e.target));
  document.getElementById('btn-import-bekreft').onclick = bekreftImport;
  document.getElementById('btn-import-avbryt').onclick  = () => { ventendeImport = null; lukkModal(); };
  document.getElementById('eksport-varsel').onclick = e => { e.stopPropagation(); eksporterData(); };
  document.querySelectorAll('.tema-valg').forEach(el => {
    el.onclick = () => {
      settTema(el.dataset.tema);
      klasseromDrop.classList.add('hidden');
    };
  });
  document.querySelectorAll('.font-valg').forEach(el => {
    // Hvert valg vises i sin egen font, hentet fra FONTER så det bare finnes ett sted
    // å endre. Pris: når menyen åpnes, laster nettleseren alle fontene (ca. 170 kB,
    // én gang). Mens menyen er skjult, lastes ingenting.
    el.style.fontFamily = (FONTER[el.dataset.font] ?? FONTER['system']).css;
    el.onclick = () => {
      settFont(el.dataset.font);
      klasseromDrop.classList.add('hidden');
    };
  });
  // Målform: markér det valgte, og bytt (siden lastes på nytt i settSpråk).
  document.querySelectorAll('.språk-valg').forEach(el => {
    el.classList.toggle('aktiv', el.dataset.språk === state.språk);
    el.onclick = () => {
      klasseromDrop.classList.add('hidden');
      settSpråk(el.dataset.språk);
    };
  });
  document.querySelectorAll('.størrelse-valg').forEach(el => {
    el.onclick = () => {
      settSkriftstørrelse(el.dataset.størrelse);
      klasseromDrop.classList.add('hidden');
    };
  });
  // Tallfeltene bygges på nytt av renderWidgetStørrelseMeny(), så vi lytter på
  // beholderen. «input» gir endring mens man skriver eller bruker piltastene.
  // «change» (Enter eller når feltet forlates) retter feltet til lagret verdi, slik at
  // f.eks. 500 vises som 100 og tomt felt som 0.
  const strListe = document.getElementById('widget-str-liste');
  strListe.addEventListener('input', e => {
    const felt = e.target.closest('input[data-widget]');
    if (felt) settWidgetSkriftstørrelse(felt.dataset.widget, felt.value);
  });
  strListe.addEventListener('change', e => {
    const felt = e.target.closest('input[data-widget]');
    if (felt) felt.value = state.widget_størrelser?.[felt.dataset.widget] ?? 0;
  });

  // Info-modal lukk
  document.getElementById('btn-info-lukk').onclick = lukkInfoModal;
  document.getElementById('info-overlay').addEventListener('click', e => {
    if (e.target === document.getElementById('info-overlay')) lukkInfoModal();
  });

  // Vær-popup
  document.getElementById('header-ver').onclick = e => {
    e.stopPropagation();
    visVærPopup();
  };
  document.getElementById('vær-popup').addEventListener('click', e => e.stopPropagation());

  // Lukk alle dropdowns ved klikk utenfor
  document.addEventListener('click', () => {
    widgetDropdown.classList.add('hidden');
    klasseromDrop.classList.add('hidden');
    document.getElementById('vær-popup').classList.add('hidden');
  });

  // Lukk modal ved klikk på overlay
  document.getElementById('modal-overlay').addEventListener('click', e => {
    if (e.target === document.getElementById('modal-overlay')) lukkModal();
  });

  // Globale hurtigtaster
  document.addEventListener('keydown', e => {
    const blackboard = document.getElementById('blackboard-overlay');
    if (!blackboard.classList.contains('hidden')) {
      if (e.key === 'Escape') blackboard.classList.add('hidden');
      return;
    }
    if (!document.getElementById('info-overlay').classList.contains('hidden')) {
      if (e.key === 'Escape') lukkInfoModal();
      return;
    }
    if (aktivModal) {
      if (e.key === 'Escape') lukkModal();
      return;
    }
    if (fokusKort && e.key === 'Escape') { lukkFokus(); return; }
    // Ikke utløs hurtigtaster mens man skriver i et tekstfelt — da skal «a», «r» osv.
    // bli vanlige bokstaver, ikke kommandoer.
    const tag = document.activeElement?.tagName;
    if (tag === 'TEXTAREA' || tag === 'INPUT') return;

    // La nettleserens egne snarveier (Cmd/Ctrl/Alt + tast) være i fred — ellers ville
    // f.eks. Cmd+R både trekke en elev og laste siden på nytt.
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    // Enkelt-tast → handling. Speiler knappene i grensesnittet.
    const hurtigtaster = {
      a: () => document.getElementById('btn-legg-til').click(),
      r: () => { const k = aktivtTilfeldigKort(); if (k) trekkTilfeldig(k); else notify(t('Ingen Tilfeldig elev-kort på siden'), 'warning'); },
      R: () => { const k = aktivtTilfeldigKort(); if (k) trekkTilfeldigBacklog(k); else notify(t('Ingen Tilfeldig elev-kort på siden'), 'warning'); },
      o: () => trekkOrdenselev(),
      u: () => trekkUlv(),
      // I fokus lages det ingen ny timer (det ville lukket fokus); da sier tasten fra.
      t: () => { const id = aktivTimer({ lag: !fokusKort }); if (id) timerToggle(id); else notify(t('Ingen timer på siden'), 'warning'); },
      s: () => { const id = aktivTimer({ lag: !fokusKort }); if (id) åpneTimerSett(id); else notify(t('Ingen timer på siden'), 'warning'); },
      d: () => document.getElementById('btn-dagsplan-legg-til').click(),
      p: () => nesteDagsplanPunkt(),
      P: () => nesteDagsplanPunkt(true),
      f: () => {
        if (fokusKort) lukkFokus();
        else if (sistPekerKort && document.getElementById(sistPekerKort)) åpneFokus(sistPekerKort);
        else notify(t('Hold musa over et kort og trykk f'), 'warning');
      },
      g: () => document.getElementById('btn-grupper-ny').click(),
      k: () => kastTerning(),
      l: () => document.getElementById('btn-lister').click(),
      b: () => document.getElementById('btn-blackboard').click(),
      n: () => document.getElementById('btn-data').click(),
    };
    const handling = hurtigtaster[e.key];
    if (!handling) return;
    // Må stoppe standardoppførselen FØR handlingen: flere av snarveiene åpner en modal
    // og fokuserer et tekstfelt, og uten dette ville tasten («a») bli skrevet inn i
    // feltet den nettopp åpnet.
    e.preventDefault();
    handling();
  });
}

// ===================== Init =====================
// ===================== Backlog-editor =====================
// Åpner backlog-editoren for ordenselev eller ulv (`type` velger hvilken). Viser én
// «chip» per elev; klikk på en chip legger eleven til / fjerner den fra backlogen
// manuelt — nyttig for å rette opp hvis noen var syk e.l. Re-rendrer trekket fortløpende.
function åpneRedigerBacklog(type) {
  const s = aktivSide();
  const erOrden   = type === 'ordenselev';
  const backlogKey = erOrden ? 'ordenselev_backlog' : 'ulv_backlog';
  const tittel     = erOrden ? t('Rediger ordenselev-backlog') : t('Rediger {bamse}-backlog', { bamse: s.ulv_navn || 'Klassebamse' });

  document.getElementById('rediger-backlog-tittel').textContent = tittel;

  const chips = document.getElementById('rediger-backlog-chips');
  chips.innerHTML = '';
  (s.elever || []).forEach(({ id, navn }) => {
    const r = trekk(s);
    const erBrukt = r[backlogKey].includes(id);
    const chip = document.createElement('div');
    chip.className = 'chip' + (erBrukt ? ' brukt' : '');
    chip.textContent = navn;
    chip.onclick = () => {
      if (r[backlogKey].includes(id)) {
        r[backlogKey] = r[backlogKey].filter(n => n !== id);
        chip.classList.remove('brukt');
      } else {
        r[backlogKey].push(id);
        chip.classList.add('brukt');
      }
      saveState();
      if (erOrden) renderOrdenselev(); else renderUlv();
    };
    chips.appendChild(chip);
  });

  åpneModal('modal-rediger-backlog');
}

// ===================== Bilde-widget =====================
// Hvilket bilde-kort som sist ble klikket. Brukes av lim-inn (Ctrl+V): innliming
// uten et tydelig «mål» går til det sist fokuserte bildekortet.
let fokusertBildeId = null;

// Maks bildestørrelse: 50 MB med IndexedDB. Uten IDB (lokal fallback i localStorage)
// gjelder fortsatt 2 MB pga det delte ~5 MB-taket.
const BILDE_MAKS_IDB      = 50 * 1024 * 1024;
const BILDE_MAKS_FALLBACK =  2 * 1024 * 1024;

// Objekt-URL-er (blob:…) vi har laget per bildekort. Må revokes når kortet tegnes på
// nytt eller fjernes, ellers lekker vi minne.
const bildeUrler = {};

// Bilde-lager: binære Blob-er i IndexedDB (stor kvote, ingen base64-skatt). På file://
// i Firefox-baserte nettlesere (Zen) er IDB blokkert — da faller vi tilbake til data-URL
// i state/localStorage (med 2 MB-grense). Den utrullede siden (GitHub Pages, https) får
// alltid IDB. ALL bildetilgang går gjennom dette objektet, så resten av koden slipper å
// vite hvilket lager som faktisk brukes.
const BildeLager = (() => {
  const DB_NAVN = 'klasserom';
  const STORE   = 'bilder';
  let db = null;
  let idbAktiv = false;
  let klarPromise = null;

  // Åpner (eller oppretter) databasen én gang. Feiler det — typisk file:// i Firefox —
  // markerer vi fallback i stedet for å kaste.
  function klar() {
    if (klarPromise) return klarPromise;
    klarPromise = new Promise(resolve => {
      if (typeof indexedDB === 'undefined' || !indexedDB) { idbAktiv = false; resolve(false); return; }
      let req;
      try { req = indexedDB.open(DB_NAVN, 1); }
      catch (_) { idbAktiv = false; resolve(false); return; }
      req.onupgradeneeded = () => req.result.createObjectStore(STORE);
      req.onsuccess = () => { db = req.result; idbAktiv = true;  resolve(true);  };
      req.onerror   = () => { idbAktiv = false; resolve(false); };
      req.onblocked = () => { idbAktiv = false; resolve(false); };
    });
    return klarPromise;
  }

  const store     = mode => db.transaction(STORE, mode).objectStore(STORE);
  const somPromise = req => new Promise((res, rej) => {
    req.onsuccess = () => res(req.result); req.onerror = () => rej(req.error);
  });
  const filTilDataUrl = fil => new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result); r.onerror = () => rej(r.error);
    r.readAsDataURL(fil);
  });

  return {
    klar,
    get idbAktiv() { return idbAktiv; },

    // Lagre en valgt fil for et kort.
    async sett(id, fil) {
      await klar();
      if (idbAktiv) { await somPromise(store('readwrite').put(fil, id)); return; }
      state.bilder[id] = { data: await filTilDataUrl(fil) }; // fallback: data-URL i state
    },

    // Lagre en ferdig Blob direkte i IDB (migrering/import).
    async settBlob(id, blob) {
      await klar();
      if (idbAktiv) await somPromise(store('readwrite').put(blob, id));
    },

    // Vis-URL for et kort: blob:-URL (IDB) eller data-URL (fallback). null = ingen bilde.
    async hentUrl(id) {
      await klar();
      if (idbAktiv) { const b = await somPromise(store('readonly').get(id)); return b ? URL.createObjectURL(b) : null; }
      return state.bilder[id]?.data ?? null;
    },

    // Data-URL for et kort (brukes til eksport, så backup-fila blir selvstendig).
    async hentDataUrl(id) {
      await klar();
      if (idbAktiv) { const b = await somPromise(store('readonly').get(id)); return b ? filTilDataUrl(b) : null; }
      return state.bilder[id]?.data ?? null;
    },

    // Tøm bildet for ett kort (behold selve kortet).
    async slett(id) {
      await klar();
      if (idbAktiv) { await somPromise(store('readwrite').delete(id)); return; }
      if (state.bilder[id]) state.bilder[id] = {};
    },

    // Slett bilde-blob direkte i IDB (foreldreløs-opprydding).
    async slettBlob(id) {
      await klar();
      if (idbAktiv) await somPromise(store('readwrite').delete(id));
    },

    // Alle lagrede bilde-IDer (foreldreløs-opprydding).
    async alleNøkler() {
      await klar();
      if (idbAktiv) return somPromise(store('readonly').getAllKeys());
      return Object.keys(state.bilder);
    },

    // Tøm hele bilde-lageret (brukes ved «erstatt alt»-import).
    async tøm() {
      await klar();
      if (idbAktiv) await somPromise(store('readwrite').clear());
    },
  };
})();

// Flytter bilder lagret i gammelt format (data-URL i state.bilder[id].data, fra
// localStorage-tiden) over i IndexedDB, og fjerner de tunge data-URL-ene fra state —
// det krymper localStorage betydelig. Kjøres én gang ved oppstart. I fallback-modus
// (ingen IDB) lar vi dem ligge i state, der de fortsatt virker.
async function migrerGamleBilder() {
  if (!BildeLager.idbAktiv) return;
  let migrert = 0;
  for (const [id, obj] of Object.entries(state.bilder)) {
    if (obj && typeof obj.data === 'string' && obj.data.startsWith('data:')) {
      try {
        const blob = await (await fetch(obj.data)).blob();
        await BildeLager.settBlob(id, blob);
        state.bilder[id] = {}; // strip data-URL-en ut av state
        migrert++;
      } catch (e) { console.warn('Bilde-migrering feilet for', id, e); }
    }
  }
  if (migrert) saveState();
}

// Sletter «foreldreløse» bilder: blob-er i IDB som ikke lenger har et kort i state.bilder
// (kan oppstå etter import, migrering eller en feil). Trygt — rører aldri bilder i bruk.
async function ryddForeldreløseBilder() {
  if (!BildeLager.idbAktiv) return;
  const gyldige = new Set(Object.keys(state.bilder));
  for (const id of await BildeLager.alleNøkler()) {
    if (!gyldige.has(id)) {
      await BildeLager.slettBlob(id);
      console.info('Ryddet foreldreløst bilde:', id);
    }
  }
}

// Async bilde-oppstart: åpne lageret, migrer gammelt format, rydd foreldreløse, og tegn
// alle bildekort. Kalles fra init etter at kortene er bygd.
async function initBilder() {
  await BildeLager.klar();
  await migrerGamleBilder();
  await ryddForeldreløseBilder();
  for (const id of Object.keys(state.bilder)) renderBilde(id);
}

// Bygger DOM-en for ett bilde-kort (flerinstans, som notat). Inneholder opplastings-
// flate, <img> for visning og en fjern-knapp — alle skjult/vist av renderBilde.
function lagBildeElement(instansId) {
  const div = document.createElement('div');
  div.className = 'card';
  div.id = `card-${instansId}`;
  div.innerHTML = `
    <button class="kl-widget-close" data-klikk="fjern-bilde-widget" data-id="${instansId}" title="${t('Slett dette bildekortet')}">✕</button>
    <div class="card-header">
      <span class="drag-handle" title="${t('Dra for å flytte')}">⠿</span>
      <h2>${t('Bilde')}</h2>
    </div>
    <div class="card-body">
      <div id="bilde-vis-${instansId}" class="bilde-vis">
        <label id="bilde-label-${instansId}" class="bilde-slipp">
          <span>${t('Klikk for å laste opp, eller lim inn (Ctrl+V)')}</span>
          <input type="file" id="bilde-fil-${instansId}" accept="image/*" style="display:none" data-endring="last-opp-bilde" data-id="${instansId}">
        </label>
        <img id="bilde-img-${instansId}" style="display:none; max-width:100%; border-radius:6px" alt="">
        <button id="bilde-fjern-${instansId}" style="display:none" data-klikk="fjern-bilde-data" data-id="${instansId}">${t('Fjern bilde')}</button>
      </div>
    </div>
  `;
  return div;
}

// Kobler et bilde-kort: klikk på kortet gjør det til «fokusert» (lim-inn-mål). Selve
// tegningen skjer via renderBilde (kalt fra initBilder ved oppstart og etter endringer);
// et nytt, tomt kort viser opplastingsflaten allerede fra HTML-en.
function setupBilde(instansId) {
  document.getElementById(`card-${instansId}`)?.addEventListener('click', () => {
    fokusertBildeId = instansId;
  });
}

// Veksler bilde-kortet mellom to tilstander: har kortet et bilde i lageret viser vi det
// + fjern-knappen; ellers viser vi opplastingsflaten. Async fordi bildet hentes fra
// IndexedDB. Gamle objekt-URL-er revokes så vi ikke lekker minne.
async function renderBilde(instansId) {
  const img    = document.getElementById(`bilde-img-${instansId}`);
  const label  = document.getElementById(`bilde-label-${instansId}`);
  const fjernK = document.getElementById(`bilde-fjern-${instansId}`);
  if (!img) return;
  if (bildeUrler[instansId]) { URL.revokeObjectURL(bildeUrler[instansId]); delete bildeUrler[instansId]; }
  const url = await BildeLager.hentUrl(instansId);
  if (url) {
    if (url.startsWith('blob:')) bildeUrler[instansId] = url; // bare objekt-URL-er må revokes
    img.src = url;
    img.style.display = '';
    label.style.display = 'none';
    fjernK.style.display = '';
  } else {
    img.removeAttribute('src');
    img.style.display = 'none';
    label.style.display = '';
    fjernK.style.display = 'none';
  }
}

// Tar imot en fil valgt via fil-velgeren og sender den videre til lesBildefil.
function lastOppBilde(input, instansId) {
  const fil = input.files?.[0];
  if (fil) lesBildefil(fil, instansId);
}

// Leser en bildefil og lagrer den i bilde-lageret (Blob i IndexedDB, eller data-URL i
// fallback). Grensa er 50 MB med IDB, 2 MB i fallback (det delte ~5 MB-taket).
async function lesBildefil(fil, instansId) {
  if (!fil.type.startsWith('image/')) { notify(t('Det ser ikke ut som en bildefil'), 'warning'); return; }
  await BildeLager.klar();
  const maks = BildeLager.idbAktiv ? BILDE_MAKS_IDB : BILDE_MAKS_FALLBACK;
  if (fil.size > maks) {
    notify(BildeLager.idbAktiv
      ? t('Bildet er for stort — maks 50 MB')
      : 'Lokalt uten IndexedDB er grensa 2 MB. På den utrullede siden gjelder 50 MB.', 'warning');
    return;
  }
  await BildeLager.sett(instansId, fil);
  if (!state.bilder[instansId]) state.bilder[instansId] = {}; // sørg for register-oppføring
  saveState();
  renderBilde(instansId);
}

// Tømmer bildet fra et kort (men beholder selve kortet — klar for et nytt bilde).
async function fjernBildeData(instansId) {
  await BildeLager.slett(instansId);
  saveState();
  renderBilde(instansId);
}

// Fjerner hele bilde-kortet fra denne siden. Bildedataene slettes kun hvis ingen
// andre sider bruker kortet (samme mønster som fjernNotat).
async function fjernBildeWidget(instansId) {
  const cardId = `card-${instansId}`;
  const side = aktivSide();
  side.widget_layout = side.widget_layout.filter(w => w.id !== cardId);
  side.widget_hidden  = (side.widget_hidden ?? []).filter(id => id !== cardId);
  const ingenSiderBrukerDen = state.sider.every(s => !s.widget_layout.some(w => w.id === cardId));
  if (ingenSiderBrukerDen) {
    delete state.bilder[instansId];
    await BildeLager.slett(instansId);
    if (bildeUrler[instansId]) { URL.revokeObjectURL(bildeUrler[instansId]); delete bildeUrler[instansId]; }
    fjernKortEl(cardId);
  }
  applyLayout(); // skjuler kortet om det fortsatt brukes på en annen side
  renderWidgetMeny();
  saveState();
}

// Oppretter et nytt, tomt bilde-kort på aktiv side (speiler leggTilNotat). Plasseres
// i kolonne 3 hvis den finnes, ellers i siste kolonne på smalere sider.
function leggTilBilde() {
  state.bilde_teller++;
  const id = `bilde-${state.bilde_teller}`;
  state.bilder[id] = {};
  const cardId = `card-${id}`;
  aktivSide().widget_layout.push(nyPlassering(cardId));
  const el = lagBildeElement(id);
  settInnKort(el);
  setupBilde(id);
  applyLayout();
  renderWidgetMeny();
  saveState();
}

// ===================== YouTube-widget =====================
// Flerinstans, speiler bilde-kortet. state.youtube[id] = { url, videoId, start, modus, volum }.
//
// Personvern: appen lager iframen selv og styrer den med postMessage. Vi laster IKKE
// YouTube sitt IFrame API-skript (www.youtube.com/iframe_api). Det skriptet ville kjørt
// inne i Skoledash sin egen side, med tilgang til localStorage og dermed elevdataene, og
// det setter sporingscookies fra youtube.com. Nå kjører all YouTube-kode inne i
// iframen fra youtube-nocookie.com, som nettleseren holder adskilt fra appens data.
//
// Protokollen er den samme som IFrame API-et bruker under panseret: vi sender
// {"event":"listening"} til iframen til den svarer, og kommandoer som
// {"event":"command","func":"playVideo"}. Iframen svarer med onReady, onStateChange og
// infoDelivery (der videotittel og avspillingsstatus står).
//
// Spiller-objektene holdes her, ikke i state (de peker på DOM-elementer), og rives ned
// når et kort fjernes eller bytter lenke.
const ytPlayers = {};
const YT_OPPRINNELSE = 'https://www.youtube-nocookie.com';

// Én felles lytter for svar fra alle YouTube-iframer. Meldinger fra andre opprinnelser,
// eller som ikke kommer fra en av våre iframer, ignoreres.
window.addEventListener('message', e => {
  if (e.origin !== YT_OPPRINNELSE || typeof e.data !== 'string') return;
  const [instansId, spiller] = Object.entries(ytPlayers).find(([, s]) => s.iframe.contentWindow === e.source) ?? [];
  if (!spiller) return;
  let melding;
  try { melding = JSON.parse(e.data); } catch (_) { return; }
  spiller.mottatt(instansId, melding);
});

// Plukker ut 11-tegns video-ID fra de vanlige YouTube-lenkeformatene (watch?v=, youtu.be,
// /embed/, /shorts/, /live/) — eller en rå ID. Returnerer null hvis ingenting matcher.
function parseYoutubeId(url) {
  if (!url) return null;
  url = url.trim();
  if (/^[\w-]{11}$/.test(url)) return url;
  let m;
  if ((m = url.match(/youtu\.be\/([\w-]{11})/)))            return m[1];
  if ((m = url.match(/[?&]v=([\w-]{11})/)))                 return m[1];
  if ((m = url.match(/\/(?:embed|shorts|v|live)\/([\w-]{11})/))) return m[1];
  return null;
}

// Starttid i sekunder fra en lenke (?t=90 eller ?start=90). Bare hele sekunder.
function parseYoutubeStart(url) {
  const m = (url || '').match(/[?&](?:t|start)=(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}

// Bygger DOM-en for ett YouTube-kort. Selve innholdet (lenke-felt eller spiller) tegnes
// av renderYoutube, som kalles fra setupYoutube.
function lagYoutubeElement(instansId) {
  const div = document.createElement('div');
  div.className = 'card';
  div.id = `card-${instansId}`;
  div.innerHTML = `
    <button class="kl-widget-close" data-klikk="fjern-youtube-widget" data-id="${instansId}" title="${t('Slett dette YouTube-kortet')}">✕</button>
    <div class="card-header">
      <span class="drag-handle" title="${t('Dra for å flytte')}">⠿</span>
      <h2>YouTube</h2>
    </div>
    <div id="youtube-body-${instansId}" class="youtube-body"></div>
  `;
  return div;
}

function setupYoutube(instansId) {
  renderYoutube(instansId);
}

// Tegner kortet etter tilstand: uten videoId vises et lenke-felt; med videoId vises
// modus-bryteren + spilleren (16:9 i video-modus, kompakt lyd-bar i lyd-modus). Lyd-
// panelet ligger alltid i DOM-en (skjult av CSS i video-modus), så bytte mellom modus
// bare veksler en klasse — spilleren rives ALDRI ned ved modusbytte, så lyden er
// sømløs. En ny spiller opprettes kun når selve videoen settes/endres.
function renderYoutube(instansId) {
  const body = document.getElementById(`youtube-body-${instansId}`);
  if (!body) return;
  // Riv ned evt. eksisterende spiller før vi bygger om body (innerHTML fjerner iframen).
  if (ytPlayers[instansId]) { try { ytPlayers[instansId].destroy(); } catch (_) {} delete ytPlayers[instansId]; }

  const data = state.youtube[instansId] ?? {};
  if (!data.videoId) {
    body.innerHTML = `
      <div class="youtube-input">
        <input type="text" id="youtube-url-${instansId}" placeholder="${t('Lim inn YouTube-lenke…')}" autocomplete="off">
        <button class="btn btn-primary btn-sm" data-klikk="youtube-vis" data-id="${instansId}">${t('Vis')}</button>
      </div>`;
    const inp = document.getElementById(`youtube-url-${instansId}`);
    inp?.addEventListener('keydown', e => { if (e.key === 'Enter') settYoutubeUrlFraFelt(instansId); });
    return;
  }

  const erLyd = data.modus === 'lyd';
  body.innerHTML = `
    <div class="youtube-modus">
      <button class="yt-modus-knapp video ${erLyd ? '' : 'aktiv'}" data-klikk="youtube-modus" data-modus="video" data-id="${instansId}">▶ Video</button>
      <button class="yt-modus-knapp lyd ${erLyd ? 'aktiv' : ''}" data-klikk="youtube-modus" data-modus="lyd" data-id="${instansId}">${t('🎵 Kun lyd')}</button>
      <button class="yt-bytt-lenke" data-klikk="youtube-bytt" data-id="${instansId}" title="${t('Bytt lenke')}">↻</button>
    </div>
    <div class="youtube-media ${erLyd ? 'youtube-lyd' : ''}" id="youtube-media-${instansId}">
      <div id="youtube-player-${instansId}" class="youtube-player"></div>
      <div class="youtube-lyd-panel">
        <button class="yt-spill" id="yt-spill-${instansId}" data-klikk="youtube-spill" data-id="${instansId}" title="${t('Spill / pause')}">▶</button>
        <span class="yt-lyd-tittel" id="yt-tittel-${instansId}">${t('🎵 Laster…')}</span>
        <span class="yt-volum-ikon" aria-hidden="true">🔊</span>
        <input type="range" class="yt-volum" id="yt-volum-${instansId}" min="0" max="100"
               value="${data.volum ?? 100}" title="${t('Volum')}" aria-label="${t('Volum')}"
               data-input="youtube-volum" data-id="${instansId}">
      </div>
    </div>`;
  opprettYoutubePlayer(instansId, data.videoId, data.start || 0);
}

// Lager iframen i mål-diven og et lite spiller-objekt med de samme metodene resten av
// koden bruker (playVideo, pauseVideo, setVolume, unMute, getPlayerState, destroy).
// videoId er allerede sjekket mot [\w-]{11} (parseYoutubeId og normaliserState).
function opprettYoutubePlayer(instansId, videoId, start) {
  const mål = document.getElementById(`youtube-player-${instansId}`);
  if (!mål || !state.youtube[instansId] || !YOUTUBE_VIDEO_ID.test(videoId)) return;

  const parametre = new URLSearchParams({
    enablejsapi: '1',
    origin: location.origin, // iframen sender bare svar til denne opprinnelsen
    rel: '0',
    playsinline: '1',
    start: String(start || 0),
  });
  const iframe = document.createElement('iframe');
  iframe.id = mål.id;
  iframe.className = mål.className;
  iframe.title = 'YouTube-video';
  iframe.src = `${YT_OPPRINNELSE}/embed/${videoId}?${parametre}`;
  iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
  iframe.allowFullscreen = true;
  iframe.referrerPolicy = 'strict-origin-when-cross-origin'; // YouTube krever Referer
  mål.replaceWith(iframe);

  const spiller = {
    iframe,
    tilstand: -1,      // YouTube sitt skjema: -1 ikke startet, 1 spiller, 2 pause, 0 ferdig
    klar: false,
    kø: [],            // kommandoer som kommer før iframen er klar
    lytteTimer: null,
    send(func, args = []) {
      const melding = JSON.stringify({ event: 'command', func, args, id: instansId, channel: 'widget' });
      if (!this.klar) { this.kø.push(melding); return; }
      iframe.contentWindow?.postMessage(melding, YT_OPPRINNELSE);
    },
    playVideo()   { this.send('playVideo'); },
    pauseVideo()  { this.send('pauseVideo'); },
    setVolume(v)  { this.send('setVolume', [v]); },
    unMute()      { this.send('unMute'); },
    getPlayerState() { return this.tilstand; },
    destroy() {
      clearInterval(this.lytteTimer);
      iframe.remove();
    },
    mottatt(id, melding) {
      if (!this.klar && (melding.event === 'onReady' || melding.event === 'initialDelivery')) {
        this.klar = true;
        clearInterval(this.lytteTimer);
        this.kø.forEach(m => iframe.contentWindow?.postMessage(m, YT_OPPRINNELSE));
        this.kø = [];
        const v = state.youtube[id]?.volum;
        if (typeof v === 'number') { this.setVolume(v); if (v > 0) this.unMute(); }
      }
      if (melding.event === 'onStateChange' && Number.isInteger(melding.info)) {
        this.tilstand = melding.info;
        oppdaterSpillKnapp(id, this.tilstand);
      }
      const info = melding.info;
      if (melding.event === 'infoDelivery' || melding.event === 'initialDelivery') {
        if (info && Number.isInteger(info.playerState)) {
          this.tilstand = info.playerState;
          oppdaterSpillKnapp(id, this.tilstand);
        }
        const tittel = info?.videoData?.title;
        const felt = document.getElementById(`yt-tittel-${id}`);
        if (felt && typeof tittel === 'string' && tittel) felt.textContent = '🎵 ' + tittel;
      }
    },
  };
  ytPlayers[instansId] = spiller;

  // Iframen begynner ikke å sende før vi har sagt at vi lytter. Gjenta til den svarer,
  // slik IFrame API-et også gjør. Gi opp etter 20 sekunder.
  iframe.addEventListener('load', () => {
    let forsøk = 0;
    const lytt = () => {
      if (spiller.klar || ++forsøk > 80) { clearInterval(spiller.lytteTimer); return; }
      iframe.contentWindow?.postMessage(
        JSON.stringify({ event: 'listening', id: instansId, channel: 'widget' }), YT_OPPRINNELSE);
    };
    lytt();
    spiller.lytteTimer = setInterval(lytt, 250);
  });
}

// Veksler video/lyd uten å røre spilleren: bare en CSS-klasse + knappemarkering. Lyden
// fortsetter uavbrutt fordi iframen aldri fjernes (CSS klipper bare bildet bort).
function settYoutubeModus(instansId, modus) {
  const d = state.youtube[instansId];
  if (!d) return;
  d.modus = modus;
  saveState();
  const erLyd = modus === 'lyd';
  document.getElementById(`youtube-media-${instansId}`)?.classList.toggle('youtube-lyd', erLyd);
  const body = document.getElementById(`youtube-body-${instansId}`);
  body?.querySelector('.yt-modus-knapp.video')?.classList.toggle('aktiv', !erLyd);
  body?.querySelector('.yt-modus-knapp.lyd')?.classList.toggle('aktiv', erLyd);
}

// Spill/pause via API-et (1 = spiller av i YouTube sitt state-skjema).
function ytSpillPause(instansId) {
  const p = ytPlayers[instansId];
  if (!p) return;
  if (p.getPlayerState?.() === 1) p.pauseVideo(); else p.playVideo();
}
function oppdaterSpillKnapp(instansId, playerState) {
  const b = document.getElementById(`yt-spill-${instansId}`);
  if (b) b.textContent = playerState === 1 ? '⏸' : '▶';
}

// Volum (0–100) for lyd-modus. Lagres i state så det huskes ved reload, og settes
// direkte på spilleren. Skrur av mute hvis brukeren drar volumet opp fra null.
function settYoutubeVolum(instansId, verdi) {
  const v = Math.max(0, Math.min(100, parseInt(verdi, 10) || 0));
  const d = state.youtube[instansId];
  if (d) { d.volum = v; saveState(); }
  const p = ytPlayers[instansId];
  if (p) { p.setVolume?.(v); if (v > 0) p.unMute?.(); }
}

// Leser lenke-feltet og setter videoen.
function settYoutubeUrlFraFelt(instansId) {
  const inp = document.getElementById(`youtube-url-${instansId}`);
  if (inp) settYoutubeUrl(instansId, inp.value);
}
function settYoutubeUrl(instansId, url) {
  const videoId = parseYoutubeId(url);
  if (!videoId) { notify(t('Fant ingen gyldig YouTube-lenke'), 'warning'); return; }
  state.youtube[instansId] = {
    url: url.trim(),
    videoId,
    start: parseYoutubeStart(url),
    modus: state.youtube[instansId]?.modus || 'video',
    volum: state.youtube[instansId]?.volum ?? 100,
  };
  saveState();
  renderYoutube(instansId);
}

// Tilbake til lenke-feltet (behold valgt modus). Rydder spilleren.
function byttYoutubeLenke(instansId) {
  if (ytPlayers[instansId]) { try { ytPlayers[instansId].destroy(); } catch (_) {} delete ytPlayers[instansId]; }
  const modus = state.youtube[instansId]?.modus || 'video';
  state.youtube[instansId] = { modus };
  saveState();
  renderYoutube(instansId);
}

// Nytt, tomt YouTube-kort på aktiv side (speiler leggTilBilde).
function leggTilYoutube() {
  state.youtube_teller++;
  const id = `youtube-${state.youtube_teller}`;
  state.youtube[id] = { modus: 'video' };
  const cardId = `card-${id}`;
  aktivSide().widget_layout.push(nyPlassering(cardId));
  const el = lagYoutubeElement(id);
  settInnKort(el);
  setupYoutube(id);
  applyLayout();
  renderWidgetMeny();
  saveState();
}

// Fjerner et YouTube-kort fra denne siden. Data + spiller slettes kun hvis ingen andre
// sider bruker kortet (samme mønster som fjernBildeWidget).
function fjernYoutubeWidget(instansId) {
  const cardId = `card-${instansId}`;
  const side = aktivSide();
  side.widget_layout = side.widget_layout.filter(w => w.id !== cardId);
  side.widget_hidden  = (side.widget_hidden ?? []).filter(id => id !== cardId);
  const ingenSiderBrukerDen = state.sider.every(s => !s.widget_layout.some(w => w.id === cardId));
  if (ingenSiderBrukerDen) {
    if (ytPlayers[instansId]) { try { ytPlayers[instansId].destroy(); } catch (_) {} delete ytPlayers[instansId]; }
    delete state.youtube[instansId];
    fjernKortEl(cardId);
  }
  applyLayout(); // skjuler kortet om det fortsatt brukes på en annen side
  renderWidgetMeny();
  saveState();
}

// ===================== Gruppebegrensning =====================
// «Hold fra hverandre»-par lagres i den lagrede klasselista (state.liste_begrensninger:
// listenavn → par av elev-id-er), så de følger med når lista eksporteres til en vikar
// eller en kollega. En side husker lista den kom fra (s.liste), og da gjelder listas
// par når siden deler inn i grupper.
// Sider kunne ha egne par før v2.38 (s.gruppe_begrensninger). De virker fortsatt, men
// det kan ikke legges til nye. De flyttes inn i lista når siden lagres som liste, eller
// når en liste lastes inn på siden.

// Lista siden er koblet til, hvis den fortsatt finnes. Ellers null.
function sidensListe(s = aktivSide()) {
  return s.liste && Object.hasOwn(state.lister, s.liste) ? s.liste : null;
}

// Parene som gjelder for Del inn og for nye elever på siden.
function aktivePar(s = aktivSide()) {
  const liste = sidensListe(s);
  return liste ? (state.liste_begrensninger[liste] ?? []) : (s.gruppe_begrensninger ?? []);
}

// Slår sammen lister med par til én, uten like par (A+B er det samme som B+A) og uten
// par der begge er samme elev. Brukes også av normaliserState(), så den må ikke lene
// seg på konstanter lenger ned.
function slåSammenPar(...lister) {
  const sett = new Set();
  const ut = [];
  for (const [a, b] of lister.flat()) {
    if (typeof a !== 'string' || typeof b !== 'string' || a === b) continue;
    const nøkkel = [a, b].sort().join('|');
    if (sett.has(nøkkel)) continue;
    sett.add(nøkkel);
    ut.push([a, b]);
  }
  return ut;
}

// Lista par-dialogen redigerer akkurat nå, eller null: da viser den sidens gamle par
// (bare for å fjerne dem) og ber læreren lagre en liste først.
let parDialogListe = null;

// Parene og elevene dialogen jobber med.
function parIDialog() {
  if (!parDialogListe) return aktivSide().gruppe_begrensninger ?? [];
  return (state.liste_begrensninger[parDialogListe] ??= []);
}
function eleverIDialog() {
  return parDialogListe ? (state.lister[parDialogListe] ?? []) : aktivSide().elever;
}

// Legger til et par i lista dialogen gjelder. a og b er elev-id-er (verdiene i
// nedtrekkslistene). Hopper over tomt/likt par og duplikater.
function leggTilBegrensning(a, b) {
  if (!parDialogListe || !a || !b) return;
  if (a === b) { notify(t('Velg to forskjellige elever'), 'warning'); return; }
  const par = parIDialog();
  if (slåSammenPar(par, [[a, b]]).length === par.length) {
    notify(t('Dette paret er allerede lagt til'), 'warning');
    return;
  }
  par.push([a, b]);
  saveState();
  renderBegrensninger();
}

// Fjerner et par ved indeks fra det dialogen viser.
function fjernBegrensning(idx) {
  parIDialog().splice(idx, 1);
  saveState();
  renderBegrensninger();
}

// Tegner par-dialogen: forklaring, skrivefeltene og lista over par med en slett-knapp
// per par. Navnene settes med textContent, aldri som HTML.
function renderBegrensninger() {
  const liste = document.getElementById('begrensning-liste');
  if (!liste) return;
  const elever = eleverIDialog();
  const navnPå = id => elever.find(e => e.id === id)?.navn ?? '';
  const par = parIDialog();
  const forklaring = document.getElementById('begrensning-forklaring');
  forklaring.innerHTML = parDialogListe
    ? t('Velg to elever som ikke skal havne i samme gruppe når du trykker <strong>Del inn</strong>. Parene lagres i lista <strong>{liste}</strong>, så de blir med når lista deles.', { liste: esc(parDialogListe) })
    : t('Parene lagres i en klasseliste, så de blir med når lista deles med en vikar. Lagre elevlista under <strong>📋 Lister</strong> først, så kan du legge til par her.');
  document.querySelector('.begrensning-input').classList.toggle('hidden', !parDialogListe);

  liste.replaceChildren(...par.map(([idA, idB], i) => {
    const a = navnPå(idA);
    const b = navnPå(idB);
    const li = document.createElement('li');
    const navn = document.createElement('span');
    navn.className = 'begrensning-par';
    const forste = document.createElement('strong');
    forste.textContent = a;
    const andre = document.createElement('strong');
    andre.textContent = b;
    navn.append(forste, ` ${t('og')} `, andre);
    const slett = document.createElement('button');
    slett.type = 'button';
    slett.className = 'begrensning-slett';
    slett.textContent = '✕';
    slett.title = t('Fjern {a} og {b}', { a, b });
    slett.setAttribute('aria-label', t('Fjern {a} og {b}', { a, b }));
    slett.onclick = () => fjernBegrensning(i);
    li.append(navn, slett);
    return li;
  }));

  const forFå = elever.length < 2;
  document.getElementById('btn-begr-legg-til').disabled = forFå || !parDialogListe;
  document.getElementById('begrensning-tom').textContent =
    !parDialogListe ? '' :
    forFå ? t('Lista har færre enn to elever.') :
    par.length ? '' : t('Ingen par ennå.');
}

// Kobler opp knappene i begrensnings-dialogen. Klikk utenfor boksen eller Esc lukker.
function settOppBegrensning() {
  const modal = document.getElementById('begrensning-modal');
  const lukk  = () => { modal.style.display = 'none'; };
  document.getElementById('btn-begr-legg-til').onclick = () =>
    leggTilBegrensning(document.getElementById('begr-navn1').value, document.getElementById('begr-navn2').value);
  document.getElementById('btn-begr-lukk').onclick = lukk;
  modal.addEventListener('click', e => { if (e.target === modal) lukk(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.style.display !== 'none') lukk();
  });
}

// Åpner par-dialogen for en lagret liste. Uten navn gjelder den lista siden er
// koblet til (⛔ i Grupper-kortet), eller sidens gamle par hvis siden ikke har liste.
function åpneBegrensningModal(listenavn = sidensListe()) {
  parDialogListe = listenavn && state.lister[listenavn] ? listenavn : null;
  document.getElementById('begrensning-modal').style.display = 'flex';
  oppdaterBegrensningSelecter();
  renderBegrensninger();
}

// Fyller de to nedtrekkslistene i begrensnings-modalen med dagens elever, og prøver
// å beholde det allerede valgte navnet hvis eleven fortsatt er inne.
function oppdaterBegrensningSelecter() {
  ['begr-navn1', 'begr-navn2'].forEach(id => {
    const sel = document.getElementById(id);
    if (!sel) return;
    const val = sel.value;
    const elever = eleverIDialog();
    // new Option() setter navnet som ren tekst. Bygget som HTML-tekst ville et elevnavn
    // med f.eks. «<img onerror=...>» blitt til kode. Verdien er elevens id.
    sel.replaceChildren(...elever.map(e => new Option(e.navn, e.id)));
    if (elever.some(e => e.id === val)) sel.value = val;
  });
}

// ===================== Tilbakemelding & kontakt =====================
// Modalen viser kontaktvalg (e-post + GitHub issues) — ingen innebygd
// skjemainnsending. Lenkene ligger direkte i index.html.
function åpneTilbakemeldingModal() {
  document.getElementById('feedback-modal').style.display = 'flex';
}

// ===================== Eksport / import av data =====================
// 2 (v2.37): elever er { id, navn }, og alt på sidene peker på id-en. Filer med
// versjon 1 (bare navn) gjøres om ved import, av normaliserState(). Eldre versjoner
// av appen avviser versjon 2-filer i stedet for å miste elevene stille.
const EKSPORT_FORMAT_VERSJON = 2;

// Fingeravtrykk av det brukeren ville mistet uten eksport: lagrede lister + alle
// siders backlogs. Brukes til endrings-varselet (punkt 3).
function beregnEksportSignatur(s = state) {
  return JSON.stringify({
    lister: s.lister ?? {},
    par: s.liste_begrensninger ?? {},
    trekk: s.liste_trekk ?? {},
    backlogs: (s.sider ?? []).map(side => [
      side.tilfeldig_backlog, side.ordenselev_backlog, side.ulv_backlog,
    ]),
  });
}

// Viser/skjuler «du har ulagrede endringer»-varselet. Vises kun når det finnes data
// verdt å sikre (lister eller backlogs) OG signaturen avviker fra siste eksport.
function oppdaterEksportVarsel() {
  const el = document.getElementById('eksport-varsel');
  if (!el) return;
  const harData = Object.keys(state.lister ?? {}).length > 0 ||
    [...(state.sider ?? []), ...Object.values(state.liste_trekk ?? {})].some(r =>
      r.tilfeldig_backlog.length || r.ordenselev_backlog.length || r.ulv_backlog.length);
  const endret = state.eksport_signatur !== beregnEksportSignatur();
  el.classList.toggle('hidden', !(harData && endret));
  // Hvor gammel siste backup er, så læreren ser om det haster.
  const dager = state.eksport_tid ? Math.floor((Date.now() - state.eksport_tid) / 86_400_000) : null;
  const når = dager === null ? t('ingen ennå')
    : dager === 0 ? t('i dag')
    : dager === 1 ? t('i går')
    : t('for {antall} dager siden', { antall: dager });
  el.textContent = t('● Ueksporterte endringer (siste backup: {alder})', { alder: når });
}

// Skriver hele tilstanden til en JSON-fil og laster den ned som backup. Vi pakker
// en versjon + app-navn rundt innholdet så import kan kjenne igjen og validere fila.
// Trikset for nedlasting: lag en Blob, lag en midlertidig <a download>, klikk den
// programmatisk, og rydd opp. Etterpå markeres dataene som «eksportert».
async function eksporterData() {
  // Bygg bilder med data-URL-er (hentet fra IndexedDB, eller state i fallback) så
  // backup-fila blir selvstendig og beholder samme format som før — gamle/nye
  // backups er kryss-kompatible.
  const bilderEksport = {};
  for (const id of Object.keys(state.bilder)) {
    bilderEksport[id] = { data: await BildeLager.hentDataUrl(id) };
  }
  const nå = new Date();
  const data = {
    // App-ID-en beholdes etter navnebyttet, så gamle og nye backuper kan importeres om hverandre.
    app: 'klasserom-dashboard',
    format_versjon: EKSPORT_FORMAT_VERSJON,
    eksportert: nå.toISOString(),
    innhold: {
      preferanser: {
        tema:              state.tema,
        font:              state.font,
        skrift_størrelse:  state.skrift_størrelse,
        språk:             state.språk,
        widget_størrelser: state.widget_størrelser,
        timer_varighet:    state.timer_varighet,
      },
      klasselister: state.lister,
      klasseliste_begrensninger: state.liste_begrensninger,
      klasseliste_trekk: state.liste_trekk,
      klasseliste_oppsett: state.liste_oppsett,
      sider:        state.sider,
      aktiv_side:   state.aktiv_side,
      widgetinnhold: {
        notater:        state.notater,
        bilder:         bilderEksport,
        youtube:        state.youtube,
        notat_teller:   state.notat_teller,
        bilde_teller:   state.bilde_teller,
        youtube_teller: state.youtube_teller,
        arbeid_egne:    state.arbeid_egne,
        timere:         state.timere,
        timer_teller:   state.timer_teller,
        tilfeldige:     state.tilfeldige,
        tilfeldig_teller: state.tilfeldig_teller,
      },
    },
  };
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  const dato = `${nå.getFullYear()}-${String(nå.getMonth() + 1).padStart(2, '0')}-${String(nå.getDate()).padStart(2, '0')}`;
  a.href = url;
  a.download = `skoledash-backup-${dato}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);

  // Marker som eksportert → endrings-varselet forsvinner til neste endring
  state.eksport_signatur = beregnEksportSignatur();
  state.eksport_tid = Date.now();
  saveState();
  beOmVarigLagring();
  notify(t('📤 Data eksportert'));
}

let ventendeImport = null; // parsed fil mellom valg av fil og bekreftelse av modus

// Steg 1 av import: les og valider den valgte fila. Selve sammenslåingen skjer ikke
// her — vi parser, sjekker at det faktisk er en klasserom-backup, fyller infoteksten
// og åpner import-modalen der brukeren velger modus. Resultatet venter i ventendeImport.
function håndterImportFil(input) {
  const fil = input.files?.[0];
  input.value = ''; // tillat å velge samme fil igjen senere
  if (!fil) return;
  const reader = new FileReader();
  reader.onload = e => {
    let data;
    try {
      data = trygtJsonParse(e.target.result); // fjerner __proto__ o.l. allerede her
    } catch (_) {
      notify(t('Kunne ikke lese fila — er det en gyldig JSON-fil?'), 'error');
      return;
    }
    if (!data || data.app !== 'klasserom-dashboard' || !data.innhold) {
      notify(t('Dette ser ikke ut som en Skoledash-backup'), 'error');
      return;
    }
    if (data.format_versjon > EKSPORT_FORMAT_VERSJON) {
      notify(t('Fila er laget i en nyere versjon — importerer det jeg kjenner igjen'), 'warning');
    }
    ventendeImport = data;
    const antL = Object.keys(data.innhold.klasselister ?? {}).length;
    const antS = (data.innhold.sider ?? []).length;
    document.getElementById('import-info').textContent =
      t('Fil fra {dato} — {sider} side(r), {lister} lagret liste(r).', { dato: (data.eksportert || '').slice(0, 10) || t('ukjent dato'), sider: antS, lister: antL });
    document.querySelector('input[name="import-modus"][value="erstatt"]').checked = true;
    åpneModal('modal-import');
  };
  reader.readAsText(fil);
}

// Legger listene (og parene deres) fra en backup- eller listefil inn i de lagrede
// listene. Alt annet røres ikke. En liste med samme navn som en du har, blir erstattet.
// Fila kan komme fra en kollega, så alt vaskes med samme regler som normaliserState().
// Returnerer antall lister. Lagrer ikke selv.
function flettInnLister(innhold) {
  const innkommende = erObjekt(innhold?.klasselister) ? innhold.klasselister : {};
  const alleP = erObjekt(innhold?.klasseliste_begrensninger) ? innhold.klasseliste_begrensninger : {};
  let n = 0;
  for (const [navn, elever] of Object.entries(innkommende)) {
    if (!Array.isArray(elever) || FARLIGE_NØKLER.has(navn)) continue;
    const listenavn = navn.slice(0, 60);
    if (!Object.hasOwn(state.lister, listenavn)) state.liste_oppsett.push(listenavn); // ny: nederst
    state.lister[listenavn] = normaliserElever(elever);
    // Parene følger lista, så en vikar som får lista, får parene også. Bare par
    // mellom elever som faktisk står i lista, slipper inn.
    const ider = new Set(state.lister[listenavn].map(e => e.id));
    const par = alleP[navn];
    state.liste_begrensninger[listenavn] = slåSammenPar((Array.isArray(par) ? par : [])
      .filter(p => Array.isArray(p) && p.length === 2 && p.every(id => ider.has(id))));
    n++;
  }
  return n;
}

// Steg 2 av import: utfør den etter at brukeren har valgt modus.
//  - «flett_lister»: behold alt nåværende, bare legg til/oppdater lagrede lister.
//  - «erstatt»: bygg en helt ny tilstand fra fila (tolerant — manglende felt får
//    dagens defaults), skriv den rett til localStorage og last siden på nytt.
async function bekreftImport() {
  const data  = ventendeImport;
  if (!data) { lukkModal(); return; }
  const modus = document.querySelector('input[name="import-modus"]:checked')?.value ?? 'erstatt';
  const innhold = data.innhold ?? {};

  if (modus === 'flett_lister') {
    const n = flettInnLister(innhold);
    saveState();
    lukkModal();
    ventendeImport = null;
    notify(t('📥 {antall} liste(r) flettet inn', { antall: n }));
    return;
  }

  // Erstatt alt: bygg en ny tilstand tolerant (manglende felt → dagens defaults)
  const ny   = defaultState();
  const pref = innhold.preferanser ?? {};
  if (pref.tema              !== undefined) ny.tema = pref.tema;
  if (pref.font              !== undefined) ny.font = pref.font;
  if (pref.skrift_størrelse  !== undefined) ny.skrift_størrelse = pref.skrift_størrelse;
  if (pref.språk             !== undefined) ny.språk = pref.språk;
  if (pref.widget_størrelser !== undefined) ny.widget_størrelser = pref.widget_størrelser;
  if (pref.timer_varighet    !== undefined) ny.timer_varighet = pref.timer_varighet;
  if (innhold.klasselister   !== undefined) ny.lister = innhold.klasselister;
  if (innhold.klasseliste_begrensninger !== undefined) ny.liste_begrensninger = innhold.klasseliste_begrensninger;
  if (innhold.klasseliste_trekk !== undefined) ny.liste_trekk = innhold.klasseliste_trekk;
  if (innhold.klasseliste_oppsett !== undefined) ny.liste_oppsett = innhold.klasseliste_oppsett;
  if (Array.isArray(innhold.sider) && innhold.sider.length) ny.sider = innhold.sider;
  const wi = innhold.widgetinnhold ?? {};
  if (wi.notater        !== undefined) ny.notater = wi.notater;
  if (wi.bilder         !== undefined) ny.bilder = wi.bilder;
  if (wi.youtube        !== undefined) ny.youtube = wi.youtube;
  if (wi.notat_teller   !== undefined) ny.notat_teller = wi.notat_teller;
  if (wi.bilde_teller   !== undefined) ny.bilde_teller = wi.bilde_teller;
  if (wi.youtube_teller !== undefined) ny.youtube_teller = wi.youtube_teller;
  if (wi.arbeid_egne    !== undefined) ny.arbeid_egne = wi.arbeid_egne;
  if (wi.timere         !== undefined) ny.timere = wi.timere;
  if (wi.timer_teller   !== undefined) ny.timer_teller = wi.timer_teller;
  if (wi.tilfeldige     !== undefined) ny.tilfeldige = wi.tilfeldige;
  if (wi.tilfeldig_teller !== undefined) ny.tilfeldig_teller = wi.tilfeldig_teller;
  ny.aktiv_side = Math.min(
    typeof innhold.aktiv_side === 'number' ? innhold.aktiv_side : 0,
    ny.sider.length - 1,
  );

  // Flytt importerte bilde-data-URL-er ut av state-blobben og inn i IndexedDB. Ellers
  // kan store bilder sprenge localStorage-taket idet vi skriver hele staten under. Ved
  // «erstatt alt» tømmer vi lageret først, så det matcher nøyaktig det importerte.
  await BildeLager.klar();
  if (BildeLager.idbAktiv && ny.bilder) {
    await BildeLager.tøm();
    for (const id of Object.keys(ny.bilder)) {
      const d = ny.bilder[id]?.data;
      if (typeof d === 'string' && d.startsWith('data:')) {
        try { await BildeLager.settBlob(id, await (await fetch(d)).blob()); }
        catch (e) { console.warn('Import-bilde feilet for', id, e); }
      }
      ny.bilder[id] = {}; // lett register i state
    }
  }

  // En nettopp importert backup regnes som «eksportert» (ingen ulagrede endringer)
  ny.eksport_signatur = beregnEksportSignatur(ny);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ny));
    sidenLukkes = true; // ingenting skal lagre den gamle tilstanden over importen før omlastingen
  } catch (e) {
    console.warn('Import-lagring feilet:', e);
    notify(t('Klarte ikke lagre importen — for mye data for nettleseren'), 'error');
    return;
  }
  ventendeImport = null;
  location.reload(); // enkleste, sikreste vei til full re-render fra ny tilstand
}

// Appens oppstart (kjøres når DOM-en er klar, se nederst i fila). Tegner all data fra
// lagret tilstand, oppretter DOM for flerinstans-widgets (notat/bilde), kobler opp
// hendelser og dra-og-slipp, og setter i gang dato-/vær-oppdatering på timer.
// ===================== Velkomst og donasjon =====================
// Gir alle [data-donasjon]-lenker (☕ i headeren + knappen i velkomstmodalen) samme
// adresse, og viser velkomstmodalen én gang per nettleser. Lukkes den, huskes det i
// VELKOMMEN_KEY. Eksisterende brukere har ikke nøkkelen, så de ser den også én gang.
function setupVelkommen() {
  document.querySelectorAll('[data-donasjon]').forEach(a => { a.href = DONASJON_URL; });

  const modal = document.getElementById('velkommen-modal');
  const lukk = () => {
    modal.style.display = 'none';
    localStorage.setItem(VELKOMMEN_KEY, '1');
  };
  document.getElementById('btn-velkommen-lukk').onclick = lukk;
  document.getElementById('btn-velkommen-posisjon').onclick = () => { lukk(); hentPosisjon(true); };
  // Klikk på donasjonslenka teller også som «sett», ellers dukker meldingen opp igjen.
  modal.querySelector('[data-donasjon]').addEventListener('click', lukk);

  if (!localStorage.getItem(VELKOMMEN_KEY)) modal.style.display = 'flex';
}

function init() {
  oversettStatisk(); // først, før noe tegnes (se kommentaren ved funksjonen)
  // Gamle navnelister ble gjort om til elever med id i loadState(). Lagre det nye
  // formatet nå, ellers fikk elevene nye id-er ved hver lasting til noe annet ble
  // lagret. Rådataene fra før ligger trygt under FØR_ELEV_ID_KEY.
  if (elevFormatMigrert) saveState();
  oppdaterDato();
  setupKlokke();
  visKlokkeVisning();
  oppdaterKlokke();
  // Hent været for stedet vi har lagret. Posisjonen spørres det ikke om her: det skjer
  // bare når læreren selv ber om det (velkomstmeldingen eller 📍 i vær-vinduet).
  hentVær();
  setInterval(oppdaterDato,   60_000);
  setInterval(oppdaterKlokke,  1_000);
  setInterval(hentVær,       600_000);

  renderElever();
  renderAlleTrekk();
  renderGrupper();
  renderDagsplan();

  for (const instansId of Object.keys(state.notater)) {
    const el = lagNotatElement(instansId);
    settInnKort(el);
    setupNotat(instansId);
  }

  for (const id of Object.keys(state.timere)) {
    settInnKort(lagTimerElement(id));
    setupTimer(id);
  }
  for (const id of Object.keys(state.tilfeldige)) {
    settInnKort(lagTilfeldigElement(id));
    setupTilfeldig(`card-${id}`);
  }
  renderAlleTilfeldig();
  hentTimerØkt(); // timere som gikk før omlastingen, fortsetter
  renderAlleTimere();
  setupTerning();
  setupArbeid();
  følgAndreFaner();
  setupListeDra();
  visLagringVarsel(); // bare synlig hvis dataene er fra en nyere versjon

  // Guidekortene ligger i markupen for alle, men hører bare hjemme hos en ny bruker
  // som ikke har fjernet dem ennå.
  GUIDE_KORT
    .filter(id => !state.sider.some(s => s.widget_layout.some(w => w.id === id)))
    .forEach(id => document.getElementById(id)?.remove());

  for (const instansId of Object.keys(state.bilder)) {
    const el = lagBildeElement(instansId);
    settInnKort(el);
    setupBilde(instansId);
  }

  for (const instansId of Object.keys(state.youtube ?? {})) {
    const el = lagYoutubeElement(instansId);
    settInnKort(el);
    setupYoutube(instansId);
  }

  // Lim inn bilde (Ctrl+V): går til det sist fokuserte bildekortet. Vi leter gjennom
  // utklippstavlas elementer etter det første som er en bildefil.
  document.addEventListener('paste', e => {
    if (!fokusertBildeId) return;
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        lesBildefil(item.getAsFile(), fokusertBildeId);
        break;
      }
    }
  });

  applyLayout();
  flateObserver.observe(document.getElementById('flate'));
  settTema(state.tema ?? 'lyst');
  settFont(state.font ?? 'system');
  settSkriftstørrelse(state.skrift_størrelse ?? 'normal');
  applyWidgetStørrelser();
  // Notatfeltene ble målt før kortene sto på flata (og hadde riktig bredde).
  document.querySelectorAll('textarea[id^="notat-textarea"]').forEach(autoResizeNotat);
  // Guidekortene får høyden innholdet trenger på denne skjermen. Vent på fontene,
  // ellers måles teksten med reservefonten og kortet blir litt for lavt eller høyt.
  document.fonts.ready.then(() => {
    const guider = aktivSide().widget_layout.filter(w => GUIDE_KORT.includes(w.id) && !w.fast);
    if (!guider.length) return;
    guider.forEach(tilpassHøyde);
    saveState();
  });
  settOppHendelser();
  settOppBegrensning();
  settOppFlate();
  settOppSkalering();
  setupDagsplanDrag();
  renderSiderNav();
  oppdaterEksportVarsel();
  setupVelkommen();

  // Async bilde-oppstart: åpne IndexedDB, migrer gammelt localStorage-format, rydd
  // foreldreløse blober og tegn bildekortene. Blokkerer ikke resten av oppstarten.
  initBilder();
}

// Åpner bekreftelsen for «Slett alle data». Knappen nullstilles hver gang, så to
// klikk alltid trengs.
function åpneSlettAltModal() {
  const knapp = document.getElementById('btn-slett-alt-bekreft');
  delete knapp.dataset.bekreft;
  knapp.textContent = t('Slett alt');
  åpneModal('modal-slett-alt');
}

// Sletter alt Skoledash har lagret i denne nettleseren: tilstanden, reservekopien,
// velkomstmerket og bildedatabasen. Laster deretter siden på nytt, som for en ny bruker.
// Tenkt for delte skolemaskiner. sletterAlt hindrer at noe lagres tilbake underveis.
async function slettAlleData() {
  sletterAlt = true;
  for (const nøkkel of [STORAGE_KEY, RESERVE_KEY, FØR_ELEV_ID_KEY, VELKOMMEN_KEY]) {
    try { localStorage.removeItem(nøkkel); } catch (_) {}
  }
  try { await BildeLager.tøm(); } catch (_) {}
  // Selve databasen slettes også. Den er åpen akkurat nå, så slettingen fullføres når
  // siden lastes på nytt og forbindelsen lukkes. Vi venter ikke på den.
  try { indexedDB.deleteDatabase('klasserom'); } catch (_) {}
  location.reload();
}

// ===================== Hendelser fra HTML (uten inline-kode) =====================
// HTML-en inneholder ingen onclick="..." eller lignende. Elementene sier i stedet hva de
// gjør med data-attributter, f.eks. <button data-klikk="fjern-elev" data-idx="3">, og
// lytterne under slår opp i lister over TILLATTE handlinger. Det gir to ting:
//  - CSP-en kan forby inline-skript ('unsafe-inline'), så nettleseren nekter å kjøre
//    kode som skulle snike seg inn i HTML-en, f.eks. <img onerror="...">.
//  - Et data-attributt kan bare utløse en handling som står i lista, aldri en vilkårlig
//    funksjon.
// Lytterne ligger i capture-fasen (true), fordi enkelte menyer stopper klikk fra å boble
// videre (stopPropagation). Da ville en vanlig lytter på document aldri sett dem.

const KLIKK_HANDLINGER = {
  'tilbakemelding':       () => åpneTilbakemeldingModal(),
  'lukk-tilbakemelding':  () => { document.getElementById('feedback-modal').style.display = 'none'; },
  'begrensning':          () => åpneBegrensningModal(),
  'lister':               () => { renderListerModal(); åpneModal('modal-lister'); },
  'skjul-widget':         el => toggleWidgetSynlighet(el.dataset.widget, false),
  'klokke-visning':       () => byttKlokkeVisning(),
  'fjern-guide':          el => fjernGuide(el.dataset.widget),
  'rediger-elev':         el => startRedigerElev(Number(el.dataset.idx)),
  'fjern-elev':           el => fjernElev(Number(el.dataset.idx)),
  'oppmøte':              el => settOppmøte(Number(el.dataset.idx), el.dataset.status),
  'rediger-dagsplan':     el => startRedigerDagsplan(Number(el.dataset.idx)),
  'dagsplan-ferdig':      el => toggleDagsplanFerdig(Number(el.dataset.idx)),
  'fjern-dagsplan':       el => fjernDagsplan(Number(el.dataset.idx)),
  'ny-notat':             () => leggTilNotat(),
  'ny-bilde':             () => leggTilBilde(),
  'ny-youtube':           () => leggTilYoutube(),
  'fjern-notat':          el => fjernNotat(el.dataset.id),
  'ny-timer':             () => { leggTilTimer(); },
  'ny-tilfeldig':         () => leggTilTilfeldig(),
  'fjern-tilfeldig':      el => fjernTilfeldig(el.dataset.id),
  'fjern-timer':          el => fjernTimer(el.dataset.id),
  'fjern-bilde-widget':   el => fjernBildeWidget(el.dataset.id),
  'fjern-bilde-data':     el => fjernBildeData(el.dataset.id),
  'fjern-youtube-widget': el => fjernYoutubeWidget(el.dataset.id),
  'youtube-vis':          el => settYoutubeUrlFraFelt(el.dataset.id),
  'youtube-modus':        el => settYoutubeModus(el.dataset.id, el.dataset.modus === 'lyd' ? 'lyd' : 'video'),
  'youtube-bytt':         el => byttYoutubeLenke(el.dataset.id),
  'youtube-spill':        el => ytSpillPause(el.dataset.id),
};
const ENDRING_HANDLINGER = {
  'widget-synlig':  el => toggleWidgetSynlighet(el.dataset.widget, el.checked),
  'last-opp-bilde': el => lastOppBilde(el, el.dataset.id),
};
const INPUT_HANDLINGER = {
  'youtube-volum': el => settYoutubeVolum(el.dataset.id, el.value),
};
// Skrivefelt for inline-redigering: Enter og «mistet fokus» lagrer, Esc avbryter.
const REDIGERING = {
  elev:     { lagre: (i, v) => lagreRedigerElev(i, v),     avbryt: () => avbrytRedigerElev() },
  dagsplan: { lagre: (i, v) => lagreRedigerDagsplan(i, v), avbryt: () => avbrytRedigerDagsplan() },
};

function kobleHendelse(type, attributt, handlinger) {
  document.addEventListener(type, e => {
    const el = e.target.closest?.(`[${attributt}]`);
    if (!el) return;
    const handling = handlinger[el.getAttribute(attributt)];
    if (handling) handling(el, e);
  }, true);
}
kobleHendelse('click',  'data-klikk',   KLIKK_HANDLINGER);
kobleHendelse('change', 'data-endring', ENDRING_HANDLINGER);
kobleHendelse('input',  'data-input',   INPUT_HANDLINGER);

document.addEventListener('keydown', e => {
  const el = e.target.closest?.('[data-rediger]');
  const r = el && REDIGERING[el.dataset.rediger];
  if (!r) return;
  if (e.key === 'Enter') r.lagre(Number(el.dataset.idx), el.value);
  else if (e.key === 'Escape') r.avbryt();
}, true);
// blur bobler ikke, men focusout gjør det.
document.addEventListener('focusout', e => {
  const el = e.target.closest?.('[data-rediger]');
  const r = el && REDIGERING[el.dataset.rediger];
  if (r) r.lagre(Number(el.dataset.idx), el.value);
}, true);

// Starter appen, og fanger det hvis oppstarten krasjer. Uten dette ville en feil i
// lagret data gitt en død side der verken menyer, eksport eller nullstilling virker.
// Da vises i stedet en enkel melding som lar læreren redde dataene og starte på nytt.
// Bygges med DOM og textContent, uten innerHTML, så den virker uansett hva som ligger
// i lagringen.
function startOppTrygt() {
  try {
    init();
  } catch (feil) {
    console.error('Oppstart feilet:', feil);
    visNødmelding();
  }
}

function visNødmelding() {
  const boks = document.createElement('div');
  boks.setAttribute('role', 'alertdialog');
  boks.style.cssText = 'position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;' +
    'background:rgba(15,23,42,0.85);font-family:system-ui,sans-serif;padding:20px';
  const kort = document.createElement('div');
  kort.style.cssText = 'background:#fff;color:#1e293b;max-width:520px;border-radius:12px;padding:24px;' +
    'display:grid;gap:12px;line-height:1.5';
  const tittel = document.createElement('h2');
  tittel.textContent = t('Skoledash klarte ikke å starte');
  tittel.style.margin = '0';
  const tekst = document.createElement('p');
  tekst.style.margin = '0';
  tekst.textContent = t('De lagrede dataene i denne nettleseren kunne ikke leses. Last dem ned først, så går ingenting tapt. Deretter kan du starte med en tom app og importere en tidligere backup.');
  const knapp = (etikett, farge) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = etikett;
    b.style.cssText = `font:inherit;font-weight:600;padding:10px 14px;border:0;border-radius:8px;cursor:pointer;color:#fff;background:${farge}`;
    return b;
  };
  const lastNed = knapp(t('📤 Last ned lagrede data'), '#4f46e5');
  lastNed.onclick = () => {
    const data = {};
    for (const nøkkel of [STORAGE_KEY, RESERVE_KEY, FØR_ELEV_ID_KEY]) {
      try { data[nøkkel] = localStorage.getItem(nøkkel); } catch (_) {}
    }
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `skoledash-redning-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  let bekreft = false;
  const nullstill = knapp(t('Start med tom app'), '#b91c1c');
  nullstill.onclick = () => {
    if (!bekreft) {
      bekreft = true;
      nullstill.textContent = t('Trykk igjen for å bekrefte');
      return;
    }
    // Det gamle flyttes til reservenøkkelen, så det fortsatt kan reddes.
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) localStorage.setItem(RESERVE_KEY, raw);
      localStorage.removeItem(STORAGE_KEY);
    } catch (_) {}
    location.reload();
  };
  kort.append(tittel, tekst, lastNed, nullstill);
  boks.appendChild(kort);
  document.body.appendChild(boks);
}

// Start appen når DOM-en er ferdig parset (skriptet ligger i <head> uten defer).
document.addEventListener('DOMContentLoaded', startOppTrygt);
