/* ==========================================================================
   CafeLoop — shared UI behaviour
   Vanilla JS, no dependencies.
   ========================================================================== */
(function () {
  "use strict";

  /* ---------- Mobile nav ---------- */
  function initNav() {
    var toggle = document.querySelector(".nav__toggle");
    var links = document.querySelector(".nav__links");
    if (!toggle || !links) return;

    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    links.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        links.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- Active nav link (by current file) ---------- */
  function initActiveLink() {
    var file = (location.pathname.split("/").pop() || "index.html").toLowerCase();
    document.querySelectorAll(".nav__links a").forEach(function (a) {
      var href = (a.getAttribute("href") || "").toLowerCase();
      if (href === file) a.classList.add("is-active");
    });
  }

  /* ---------- Scroll reveal ---------- */
  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;

    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var delay = Number(el.dataset.delay || i * 60);
        setTimeout(function () { el.classList.add("is-in"); }, Math.min(delay, 600));
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Animated bars ---------- */
  function initBars() {
    var bars = document.querySelectorAll(".bar-fill[data-value]");
    if (!bars.length) return;

    var run = function () {
      bars.forEach(function (bar) {
        bar.style.width = Math.max(0, Math.min(100, Number(bar.dataset.value))) + "%";
      });
    };

    if (!("IntersectionObserver" in window)) return run();

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        setTimeout(run, 180);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.3 });

    io.observe(bars[0].closest(".bar-list") || bars[0]);
  }

  /* ---------- Count-up numbers ---------- */
  function initCounters() {
    var els = document.querySelectorAll("[data-count]");
    if (!els.length) return;

    var format = function (n, decimals) {
      return n.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      });
    };

    var animate = function (el) {
      var target = parseFloat(el.dataset.count);
      var decimals = Number(el.dataset.decimals || 0);
      var suffix = el.dataset.suffix || "";
      var prefix = el.dataset.prefix || "";
      var dur = 900;
      var start = performance.now();

      var step = function (now) {
        var p = Math.min(1, (now - start) / dur);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = prefix + format(target * eased, decimals) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    if (!("IntersectionObserver" in window)) {
      els.forEach(function (el) {
        el.textContent = (el.dataset.prefix || "") +
          format(parseFloat(el.dataset.count), Number(el.dataset.decimals || 0)) +
          (el.dataset.suffix || "");
      });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        animate(entry.target);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.4 });

    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- FAQ accordion ---------- */
  function initFaq() {
    document.querySelectorAll(".faq__item").forEach(function (item) {
      var q = item.querySelector(".faq__q");
      if (!q) return;
      q.addEventListener("click", function () {
        var isOpen = item.classList.contains("is-open");
        var group = item.closest(".faq");
        if (group) {
          group.querySelectorAll(".faq__item.is-open").forEach(function (other) {
            other.classList.remove("is-open");
            var oq = other.querySelector(".faq__q");
            if (oq) oq.setAttribute("aria-expanded", "false");
          });
        }
        item.classList.toggle("is-open", !isOpen);
        q.setAttribute("aria-expanded", String(!isOpen));
      });
    });
  }

  /* ---------- Toast ---------- */
  window.cafeLoopToast = function (message) {
    var el = document.querySelector(".toast");
    if (!el) {
      el = document.createElement("div");
      el.className = "toast";
      document.body.appendChild(el);
    }
    el.textContent = message;
    requestAnimationFrame(function () { el.classList.add("is-visible"); });
    clearTimeout(el._t);
    el._t = setTimeout(function () { el.classList.remove("is-visible"); }, 3600);
  };

  /* ---------- Footer year ---------- */
  function initYear() {
    document.querySelectorAll("[data-year]").forEach(function (el) {
      el.textContent = String(new Date().getFullYear());
    });
  }

  /* ---------- Tabs (generic: [data-tabs] > [data-tab] + [data-panel]) ---------- */
  function initTabs() {
    document.querySelectorAll("[data-tabs]").forEach(function (group) {
      var buttons = group.querySelectorAll("[data-tab]");
      var panels = group.querySelectorAll("[data-panel]");
      buttons.forEach(function (btn) {
        btn.addEventListener("click", function () {
          buttons.forEach(function (b) { b.classList.toggle("is-active", b === btn); });
          panels.forEach(function (p) {
            p.classList.toggle("hidden", p.dataset.panel !== btn.dataset.tab);
          });
        });
      });
    });
  }

  /* ---------- Set active demo tab style for button groups ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    initNav();
    initActiveLink();
    initReveal();
    initBars();
    initCounters();
    initFaq();
    initYear();
    initTabs();
  });
})();
