# Fonter

Skoledash serverer fontene selv, så appen kontakter aldri Google eller andre fonttjenester. Hver font har sin egen mappe med woff2-filene og lisensen.

Fontene tas i bruk med `@font-face` øverst i `style.css`. Nettleseren laster bare ned fonten som faktisk er valgt.

| Mappe | Font | Lisens | Fil | Kilde |
|---|---|---|---|---|
| `lexend/` | Lexend | SIL OFL 1.1 | Hele fonten, uendret, konvertert fra TTF til woff2 | `google/fonts`: `ofl/lexend/Lexend[wght].ttf` |
| `outfit/` | Outfit | SIL OFL 1.1 | Latin-subset, variabel (400-700) | Google Fonts, latin-filen Google selv serverer |
| `sniglet/` | Sniglet | SIL OFL 1.1 | Latin-subset, bare vekt 400 | Google Fonts, latin-filen Google selv serverer |
| `kalam/` | Kalam | SIL OFL 1.1 | Latin-subset, vekt 400 og 700 | Google Fonts, latin-filen Google selv serverer |
| `jetbrains-mono/` | JetBrains Mono | SIL OFL 1.1 | Latin-subset, variabel (400-700) | Google Fonts, latin-filen Google selv serverer |

Filene ble hentet 2. november 2026. Lisensene er hentet fra `google/fonts`-repoet på GitHub.

## Subset og reserverte navn

Latin-subsettene er Googles egne og dekker æøå. Et subset regnes som en endret versjon av fonten (OFL-FAQ 2.6). Det er tillatt, men bare når fonten ikke har et reservert navn (Reserved Font Name).

- Outfit, Sniglet, Kalam og JetBrains Mono har ingen reserverte navn.
- Lexend har det reserverte navnet «RevReading Lexend». Det er ikke verifisert om det også dekker «Lexend». For å være sikre bruker vi derfor hele fonten, uendret. Ren konvertering til woff2 regnes ikke som endring (OFL-FAQ 2.2).

## Ny font

Sjekk lisensen og om det finnes et reservert navn (`grep -i "reserved font name" OFL.txt`) før du tar en font inn. Har fonten et reservert navn, bruk hele fila uendret, ikke et subset.
