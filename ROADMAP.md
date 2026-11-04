# Roadmap

Funksjoner Skoledash ikke har ennå, rangert av Jonatan 2. november 2026 (Må ha, Gira, Kanskje, Nei takk). Kildene er Classroomscreen, Pekpinne (svensk klasseromstavle) og egne ideer. Classroomscreen-funksjonene er satt opp etter hukommelse og er **ikke verifisert** mot nettsiden deres.

En kort, lærervennlig utgave av lista vises i appen, øverst i `OPPDATERINGSLOGG_HTML` (`app.js`). Endres planen, oppdater begge stedene.

Prinsipp: alt skal fungere uten server og uten innlogging. Ingen elevdata forlater maskinen.

## Må ha, i rekkefølge

Gruppert så det som hører til samme kort eller samme mekanisme, bygges sammen.

| # | Funksjon | Hva det er | Innsats | Merknad |
|---|---|---|---|---|
| 1 | Stoppeklokke | Teller oppover, med rundetider | Lett | Modus i Timer-kortet |
| 1 | Timeglass-visning | Timeren som en farget skive som krymper, så de yngste ser tiden uten å lese klokka | Lett | Visning i Timer-kortet, ikke ny widget |
| 2 | Hurtigtast for neste punkt | Én tast krysser av første punkt i dagsplanen som ikke er ferdig | Lett | Gir et «aktivt punkt» som også utheves. Erstatter Nå/etterpå som egen widget |
| 3 | Fokusmodus | Ett kort fyller hele skjermen. Esc går tilbake | Lett | Gjør at poengtavle, tegnebrett og dokumentkamera kan være vanlige widgets |
| 4 | Teller | Ett stort tall med pluss og minus | Lett | |
| 4 | Arbeidssymboler og trafikklys | «Hvisk», «Stille», «Spør en venn», «Jobb sammen», eller rødt, gult og grønt | Lett | Én widget med bryter mellom symboler og trafikklys |
| 4 | Instruksjonskort | Nummererte steg i stor skrift, som kan krysses av | Lett | Ligner Notat, men med struktur |
| 4 | Nedtelling til dato | «12 dager til juleferie» | Lett | |
| 4 | Ukenummer og kalender | Ukenummer i toppfeltet, eventuelt liten månedskalender | Lett | |
| 5 | Maler for sider | Lagre en side som mal og lag nye sider fra den | Middels | Ferdig i v2.51 (4. november 2026). Malen er oppsettet uten elevdata, samme grunnlag som deling |
| 5 | Del en side med en kollega | Eksporter én side uten elevnavn til en fil som kan importeres | Lett-middels | Ferdig i v2.52 (4. november 2026). En delt side er en mal i en fil |

## Gira

| Funksjon | Hva det er | Innsats | Merknad |
|---|---|---|---|
| Lydnivåmåler | Mikrofonen viser hvor høyt det er i rommet | Middels | Skal være sjarmerende, med gjennomsnitt, rekord og et mål klassen kan nå. Lyden behandles lokalt |
| «Øyne hit»-signal | Stor beskjed over hele skjermen med en mild lyd | Lett | Ferdig i v2.57 (4. november 2026) som hurtigtasten ø (dialog med beskjeden, Enter viser; Shift+Ø viser rett på), nederst i hurtigtast-raden. Ingen knapp i toppfeltet: plassen er holdt av til bursdager |
| Skjermteppe | Dekk til deler av skjermen og avdekk litt etter litt | Middels | |
| Klassekart | Pultene i rommet med elevnavn, flytt eller trekk ny plassering | Stor | Ferdig i v2.54 (4. november 2026) som eget kort: rutenett av pulter, klikk-klikk-flytting, trekk med «hold fra hverandre»-par, fokusmodus fyller skjermen |
| Ukeplan | Én dagsplan per ukedag, viser dagens når appen åpnes | Middels | Ferdig i v2.53 (4. november 2026), som 🗓-bryter i Dagsplan-kortet. Bytter aldri plan midt i en dag |
| Lykkehjul | Tilfeldig elev som et hjul som snurrer | Middels | Bryter i Tilfeldig elev-kortet: «Enkel» (som i dag) eller «Hjul» |
| Poengtavle | Poeng per gruppe eller lag | Lett | Vanlig widget + fokusmodus. Kan hente gruppene fra Grupper |
| Kortbunke | Flashcards: egne kort trekkes ett om gangen, uten å gjenta | Lett-middels | Kortene har forside og bakside (spørsmål og svar) |
| Bevegelsespause | Tilfeldig aktivitet og en kort timer | Lett | Aktivitetslista kan endres |
| Bursdager | Fødselsdato per elev, gratulasjon på dagen | Lett | Ferdig i v2.59 (4. november 2026): 🎂 på eleven, 👑 og fornavn i toppfeltet mellom fanene og været. Bare dag og måned, vises bare for lista på siden som er framme |
| Lydeffekter | Trommevirvel før trekk, gong, applaus | Lett | Kan slås av |
| Tegnebrett | Tegn med finger eller mus | Middels | Widget + fokusmodus, eller egen sidetype |
| QR-kode | Lim inn en lenke, få en stor QR-kode | Middels | QR-bibliotek må ligge på skoledash.app, ikke ekstern tjeneste |
| Exit-avstemning | Emoji-skala på tavla, tavla teller | Lett | |
| Rask håndsopprekning | Spørsmål med to til fire svar, skriv inn antall hender, tavla viser søyler | Lett | |

## Kanskje

| Funksjon | Hva det er | Merknad |
|---|---|---|
| Nå/etterpå | Stort felt med hva som skjer nå og etterpå | Løses heller som oppgradering av dagsplanen (aktivt punkt, se Må ha 2). Egen widget bare hvis det viser seg å trenges |
| Dokumentkamera | Webkamera i et kort | Widget + fokusmodus, eller egen sidetype. Trenger kameratilgang |

## Avgjort: kort, ikke sidetyper

Spørsmålet var om klassekart og ukeplan skulle være egne sidetyper («dashbord», «klassekart», «ukeplan»). Avgjort 4. november 2026: de bygges som kort. Fokusmodus fyller skjermen med ett kort, så «klassekartet er et rom» løses der, og maler, deling, backup, kortnavn og fanene følger med uten ombygging av lagring og sidefaner. Ukeplanen ble en bryter i Dagsplan-kortet (v2.53), klassekartet blir et eget kort med rutenett av pulter. Tegnebrett og dokumentkamera følger samme spor: kort pluss fokusmodus.

## Avgjort: Fluent Emoji Flat som ikonsett

Avgjort 4. november 2026 etter sammenligning av ti sett i Rarity-temaet (artefakt «Ikonsett for Skoledash»). Appen bruker 104 ulike emoji og symboler i grensesnittet, og de ser forskjellige ut på Mac, Windows og Chromebook, og fargeemoji står side om side med tekstsymboler (✕ ⠿ ▾ →). Jonatan valgte Twemoji-familien (flat farge), og av de tre levende settene der (Twemoji, Noto Color, Fluent Flat) vant **Fluent Emoji Flat** (Microsoft, MIT).

Bygd samme kveld som v2.60, med en DOM-vandrer (`tegnIkoner()` i `app.js`) i stedet for 300 håndendringer: koden skriver fortsatt emoji som tekst, så `t()`-nøklene og nynorsken er urørt. Planen som ble lagt:

1. **Mapping** fra kodepunkt til Fluent-fil lages én gang med et script mot `microsoft/fluentui-emoji` (filene heter engelske CLDR-navn, ikke kodepunkt). Resultatet er `ikoner/<kodepunkt>.svg` for de tegnene appen bruker, pluss MIT-lisensen i mappa. Omtrent 150 KB.
2. **Visning:** én funksjon, `ikon(tegn)`, gir `<img class="ik" src="ikoner/<kodepunkt>.svg" alt="tegn">`. Alternativet er en DOM-vandrer (som twemoji.parse) som bytter emoji i tekstnoder etter hver tegning, men bare i grensesnittet, aldri i notater, elevnavn, kortnavn eller tekstfelt. Velges når arbeidet starter.
3. **Tekstsymbolene** ✕ ▾ ⠿ → ✓ ● finnes ikke i noe emojisett. De blir stående som tekst, med samme farge og tykkelse som teksten rundt.
4. **Lærerens egen tekst** (notater, elevnavn, bamsens navn) beholder nettleserens emoji.
5. Emoji-velgeren U+FE0F spiller ingen rolle for bilder, men ryddes likevel så samme tegn alltid er skrevet likt.
6. Kontaktark i alle ti temaene før push.

Filene hentes med `python3 -I ikoner/hent.py <sti til klone av microsoft/fluentui-emoji>`, som leser emojiene i `index.html`, `app.js` og `tekster.js` og skriver `ikoner/<kodepunkt>.svg`, `ikoner/LICENSE` og `ikoner/liste.js`. 👫 (Pararbeid) finnes ikke i Fluent og ble byttet til 🤝.

## Vurdert, ikke planlagt

| Funksjon | Hvorfor ikke |
|---|---|
| Egne bakgrunnsbilder | Hvert bilde blir med i backupfila, som fort blir flere MB. Temaene med mønstre dekker behovet |
| Klokkestyrt dagsplan | Appen skal ikke drive tempoet eller bytte punkt av seg selv. Det er læreren som styrer dagen |
| Svar fra elevenes egne enheter | Krever server, og elevdata ville forlatt maskinen |
| Innebygd nettside (iframe) | Mange sider blokkerer innbygging, så det fungerer dårlig i praksis |
