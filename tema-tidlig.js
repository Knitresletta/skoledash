// tema-tidlig.js: setter lagret tema før siden tegnes første gang.
//
// Lastes i <head>, før stilarket, uten defer. Uten denne starter siden alltid i
// «lyst» (data-theme i index.html) og bytter først når app.js har lastet, så alle med
// et annet tema ser et lyst blink ved hver lasting. Må være en egen fil: CSP-en i
// _headers tillater ikke skript skrevet rett inn i HTML-en.
//
// Fila bare LESER. app.js (settTema) er fortsatt den som bestemmer temaet, sjekker
// navnet mot TEMAER og lagrer. Et ukjent navn her gjør ingen skade: da finnes ingen
// [data-theme]-regel for det i style.css, og siden ser ut som «lyst» til app.js retter
// det. Nøkkelen må være den samme som STORAGE_KEY i app.js.
(function () {
  try {
    const lagret = JSON.parse(localStorage.getItem('klasserom_state_v1'));
    const tema = lagret && lagret.tema;
    if (typeof tema === 'string' && tema) {
      document.documentElement.setAttribute('data-theme', tema);
    }
  } catch (_) {
    // Ingen lagring, privat modus eller ødelagt JSON: behold «lyst».
  }
})();
