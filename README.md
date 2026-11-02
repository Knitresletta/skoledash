# 🏫 Skoledash

Et digitalt klasseromsdashboard for lærere: navnetrekning, gruppeinndeling, timer, dagsplan og mer, rett i nettleseren. Ingen innlogging, ingen installasjon, og elevdata blir på din maskin.

**👉 Prøv den her: [skoledash.app](https://skoledash.app)**

![Skjermbilde av klasserom-dashbordet](og-image.png)

## Widgets

| Widget | Hva den gjør |
|---|---|
| **Elever** | Elevliste med tilstedeværelse og lagrede klasselister |
| **Grupper** | Tilfeldig gruppeinndeling — med begrensninger for hvem som ikke bør havne sammen |
| **🎲 Tilfeldig elev** | Trekk en tilfeldig elev, med eller uten repetisjon (backlog) |
| **⭐ Ordenselever** | Trekk to ordenselever — alle får før noen får igjen |
| **Klassebamse** | Trekk hvem som tar med klassebamsen hjem (bamsen kan hete hva som helst) |
| **⏱ Timer** | Nedtelling med fremdriftslinje — fortsetter selv om du bytter side |
| **🕐 Klokke** | Analog urskive med tallene 1–12, og digital tid under |
| **🎲 Terning** | Kast d4–d20, 1–6 terninger om gangen, med sum |
| **📋 Dagsplan** | Dagens punkter — marker ferdig, dra for å endre rekkefølge |
| **Notat** | Fritekstkort — legg til så mange du vil |
| **Bilde** | Bildekort med bilder opptil 50 MB (lagres i IndexedDB) |
| **▶️ YouTube** | Spill video i kortet, eller bytt til 🎵 kun lyd med volumkontroll |

## Sider og tilpasning

- **Én side per klasse:** hver side har egen elevliste, grupper, dagsplan og trekk-historikk. Gi fanene egne navn (f.eks. «1A», «Mattegruppe») og bytt fritt mellom dem.
- **Fleksibel layout:** 1–4 kolonner med justerbar bredde, dra-og-slipp av kort, og en ⊞ Widgets-meny der du henter fram akkurat de kortene du trenger.
- **Utseende:** ti temaer (blant dem lys, mørk, høy kontrast, Under vann, På fjellet og Twilight), noen med mønster i bakgrunnen, valgfri font og skriftstørrelse.
- **Hurtigtaster:** de vanligste handlingene har egne taster — se baren nederst i appen.

## Lagring og personvern

Alt lagres lokalt i nettleseren din (localStorage + IndexedDB). Ingen elevdata forlater maskinen.

Noen funksjoner henter data fra andre tjenester. Det som sendes, er aldri elevdata, men tjenesten ser IP-adressen din, slik alle nettsider gjør:

- **Selve siden** lastes fra skoledash.app, som leveres av Cloudflare.
- **Vær og pollen** hentes når appen starter og hvert tiende minutt. Stedets koordinater sendes til api.met.no (Meteorologisk institutt) og open-meteo.com. Søker du opp et sted, sendes stedsnavnet til open-meteo.com.
- **Posisjon:** første gang du åpner appen, spør nettleseren om posisjonen din. Sier du ja, eller trykker 📍 Bruk min posisjon, sendes koordinatene til bigdatacloud.net for å finne stedsnavnet. Sier du nei, brukes Eidsvoll.
- **YouTube-widgeten** viser videoer fra youtube-nocookie.com i en egen ramme, som er adskilt fra appen og ikke kan lese elevdataene. Appen laster ikke YouTube sitt JavaScript-API; iframen styres med `postMessage`. Spilleren lastes når appen åpnes, så lenge et YouTube-kort har en video.

Bruk **📤 Eksporter data** for å ta backup av alt — klasselister, sider, innstillinger, notater og bilder — til én fil, og **📥 Importer data** for å hente det tilbake eller dele klasselister med en kollega. Et lite varsel minner deg på å eksportere når du har ulagrede endringer.

## Kjør lokalt

Ingen byggesteg — appen er én HTML-fil, én CSS-fil og én JS-fil.

```bash
# Enkleste vei: åpne index.html direkte i nettleseren.

# Anbefalt for testing (IndexedDB krever secure context i enkelte nettlesere,
# og serveren skrur av caching så du alltid ser nyeste versjon):
python3 serve.py          # http://localhost:8000
python3 serve.py 5500     # egen port

# Syntaks-sjekk av JS uten å kjøre appen:
node --check app.js
```

## Gratis, uten innlogging

Skoledash er gratis å bruke, uten konto og uten abonnement. Vil du støtte utviklingen, finner du ☕ øverst til høyre i appen. Hva som er planlagt framover, står i [ROADMAP.md](ROADMAP.md).

## Tilbakemeldinger

Funnet en feil, eller savner du noe? Åpne gjerne et [issue](https://github.com/Knitresletta/skoledash/issues) — eller bruk 💬 Tilbakemelding-knappen i appen.
