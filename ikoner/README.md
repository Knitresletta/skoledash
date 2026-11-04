# Ikoner

Emojiene i grensesnittet tegnes som bilder herfra (fra v2.60), så appen ser lik ut på Mac, Windows og Chromebook. Settet er **Fluent Emoji** fra Microsoft, variant *Flat*, hentet fra https://github.com/microsoft/fluentui-emoji (commit `1ffb34c`, 24. august 2026). Lisensen er MIT og ligger i `LICENSE`.

- `<kodepunkt>.svg`: ett bilde per emoji, navngitt med kodepunktene i heksadesimal uten FE0F, flere bundet med `-` (`1f382.svg` er 🎂).
- `liste.js`: settet `IKONER` med nøklene som finnes her. Lastes før `app.js`.
- `hent.py`: lager alt over fra en klone av Fluent-repoet. Kjøres når en ny emoji tas i bruk i grensesnittet: `python3 -I ikoner/hent.py <sti til klonen>` fra repoets rot. Se docstringen for tynn kloning.

Koden i `app.js` (`tegnIkoner`, `setupIkoner`) bytter emoji i tekstnodene etter at de er tegnet. Emoji som ikke har en fil her, vises med nettleserens egne som før. `README.md` og `hent.py` publiseres ikke (`.assetsignore`).
