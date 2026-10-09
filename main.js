/*
  Cambio lingua IT / EN, barra degli indirizzi, pulsanti e schede del finto browser.
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
    if (tabbed()) docTitle(currentView());
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

  /* ---------- Schede: sugli schermi larghi si vede una sezione alla volta ---------- */
  var wide = window.matchMedia ? window.matchMedia("(min-width: 761px)") : null;
  var views = Array.prototype.slice.call(document.querySelectorAll("[data-panel]"));
  var tabs = Array.prototype.slice.call(document.querySelectorAll("[data-tab]"));
  var home = document.getElementById("home");
  var baseTitle = document.title;

  function tabbed() { return root.classList.contains("tabbed"); }

  function viewOf(el) { return el && el.closest ? el.closest("[data-panel]") : null; }

  function targetOf(hash) {
    if (!hash || hash.length < 2 || hash.charAt(0) !== "#") return null;
    try { return document.getElementById(decodeURIComponent(hash.slice(1))); } catch (e) { return null; }
  }

  function markTab(id, withCurrent) {
    tabs.forEach(function (t) {
      var on = t.getAttribute("data-tab") === id;
      t.classList.toggle("tab-active", on);
      if (on && withCurrent) t.setAttribute("aria-current", "page");
      else t.removeAttribute("aria-current");
    });
  }

  function docTitle(view) {
    var t = tabbed() && view ? view.getAttribute("data-doc-" + current()) : null;
    document.title = t || baseTitle;
  }

  function show(view) {
    if (!view) view = home;
    views.forEach(function (v) { v.classList.toggle("is-current", v === view); });
    markTab(view.id, true);
    docTitle(view);
  }

  function currentView() {
    for (var i = 0; i < views.length; i++) if (views[i].classList.contains("is-current")) return views[i];
    return home;
  }

  /* Allinea la scheda aperta all'indirizzo (#sezione); con scroll=true porta anche il punto giusto in vista */
  function syncFromLocation(scroll) {
    if (!tabbed() || !home) return;
    var target = targetOf(window.location.hash);
    var view = viewOf(target);
    if (target && !view) return; /* #top o #main: resta la scheda già aperta */
    show(view || home);
    if (!scroll) return;
    if (!target || target === view) window.scrollTo(0, 0);
    else target.scrollIntoView();
  }

  function layout(initial) {
    var on = !!(wide && wide.matches && home);
    root.classList.toggle("tabbed", on);
    if (on) {
      syncFromLocation(initial === true);
    } else {
      markTab("home", false);
      document.title = baseTitle;
    }
  }

  /* Un link verso un'altra sezione apre prima la sua scheda, poi il browser ci arriva da solo */
  document.addEventListener("click", function (event) {
    if (!tabbed()) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    var link = event.target && event.target.closest ? event.target.closest('a[href^="#"]') : null;
    if (!link) return;
    var view = viewOf(targetOf(link.getAttribute("href")));
    if (view && view !== currentView()) show(view);
  }, true);

  window.addEventListener("hashchange", function () {
    syncFromLocation(true);
    showAddress();
  });

  if (wide) {
    if (wide.addEventListener) wide.addEventListener("change", function () { layout(false); });
    else if (wide.addListener) wide.addListener(function () { layout(false); });
  }

  apply(current());
  layout(true);
})();
