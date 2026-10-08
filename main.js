/*
  Cambio lingua IT / EN, barra degli indirizzi e pulsanti del finto browser.
  Tutti i testi sono in index.html: per aggiornare i contenuti non serve modificare questo file.
*/
(function () {
  "use strict";

  var root = document.documentElement;
  var HTML_LANG = { it: "it", en: "en-GB" };
  var ANNOUNCE = { it: "Versione italiana", en: "English version" };
  var meta = document.querySelector('meta[name="description"]');
  var urlPath = document.getElementById("url-path");

  if (meta && !meta.hasAttribute("data-it")) {
    meta.setAttribute("data-it", meta.getAttribute("content"));
  }

  function current() {
    return root.lang === HTML_LANG.en ? "en" : "it";
  }

  /* Mostra nella barra degli indirizzi il percorso attuale: ?lang=en e la sezione (#...) */
  function showAddress() {
    if (!urlPath) return;
    var path = "/";
    if (current() === "en") path += "?lang=en";
    if (window.location.hash && window.location.hash.length > 1) path += window.location.hash;
    urlPath.textContent = path;
  }

  function apply(lang) {
    root.lang = HTML_LANG[lang];

    if (meta && meta.getAttribute("data-" + lang)) {
      meta.setAttribute("content", meta.getAttribute("data-" + lang));
    }

    document.querySelectorAll("[data-aria-it]").forEach(function (node) {
      node.setAttribute("aria-label", node.getAttribute("data-aria-" + lang));
    });

    document.querySelectorAll("[data-title-it]").forEach(function (node) {
      node.setAttribute("title", node.getAttribute("data-title-" + lang));
    });

    document.querySelectorAll("[data-alt-it]").forEach(function (img) {
      img.setAttribute("alt", img.getAttribute("data-alt-" + lang));
    });

    document.querySelectorAll("[data-setlang]").forEach(function (link) {
      if (link.getAttribute("data-setlang") === lang) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });

    showAddress();
  }

  function rememberInAddress(lang) {
    try {
      var url = new URL(window.location.href);
      if (lang === "it") url.searchParams.delete("lang");
      else url.searchParams.set("lang", lang);
      window.history.replaceState(null, "", url.pathname + url.search + url.hash);
    } catch (e) {
      /* in alcune anteprime l'indirizzo non si può modificare: il cambio lingua funziona comunque */
    }
  }

  document.querySelectorAll("[data-setlang]").forEach(function (link) {
    link.addEventListener("click", function (event) {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
      event.preventDefault();
      var next = link.getAttribute("data-setlang");
      if (next === current()) return;
      apply(next);
      rememberInAddress(next);
      var live = document.getElementById("announce");
      if (live) live.textContent = ANNOUNCE[next];
    });
  });

  /* Pulsanti Indietro, Avanti, Ricarica: fanno quello che fanno nel browser */
  document.querySelectorAll("[data-action]").forEach(function (button) {
    button.addEventListener("click", function () {
      var action = button.getAttribute("data-action");
      if (action === "back") window.history.back();
      else if (action === "forward") window.history.forward();
      else if (action === "reload") window.location.reload();
    });
  });

  window.addEventListener("hashchange", showAddress);

  apply(current());
})();
