/*
  Cambio lingua IT / EN.
  Tutti i testi sono in index.html: per aggiornare il sito non serve modificare questo file.
*/
(function () {
  "use strict";

  var root = document.documentElement;
  var HTML_LANG = { it: "it", en: "en-GB" };
  var ANNOUNCE = { it: "Versione italiana", en: "English version" };
  var meta = document.querySelector('meta[name="description"]');

  if (meta && !meta.hasAttribute("data-it")) {
    meta.setAttribute("data-it", meta.getAttribute("content"));
  }

  function current() {
    return root.lang === HTML_LANG.en ? "en" : "it";
  }

  function apply(lang) {
    root.lang = HTML_LANG[lang];

    if (meta && meta.getAttribute("data-" + lang)) {
      meta.setAttribute("content", meta.getAttribute("data-" + lang));
    }

    document.querySelectorAll("[data-aria-it]").forEach(function (node) {
      node.setAttribute("aria-label", node.getAttribute("data-aria-" + lang));
    });

    document.querySelectorAll("[data-alt-it]").forEach(function (img) {
      img.setAttribute("alt", img.getAttribute("data-alt-" + lang));
    });

    document.querySelectorAll("[data-setlang]").forEach(function (link) {
      if (link.getAttribute("data-setlang") === lang) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
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

  apply(current());
})();
