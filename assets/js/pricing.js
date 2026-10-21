/* ==========================================================================
   CafeLoop — pricing page: billing switch + ROI calculator
   Everything is computed in the browser. Nothing is sent anywhere.
   ========================================================================== */
(function () {
  "use strict";

  var fa = function (n) {
    try { return Number(n).toLocaleString("fa-IR"); } catch (e) { return String(n); }
  };

  /* --------------------------------------------------- billing switch */
  function initBilling() {
    var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-billing]"));
    var prices = Array.prototype.slice.call(document.querySelectorAll("[data-price]"));
    var notes = Array.prototype.slice.call(document.querySelectorAll("[data-price-note]"));
    var badge = document.querySelector("[data-save-badge]");
    if (!buttons.length || !prices.length) return;

    var render = function (mode) {
      buttons.forEach(function (b) {
        var active = b.dataset.billing === mode;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-pressed", active ? "true" : "false");
      });

      prices.forEach(function (el) {
        var value = mode === "annual" ? el.dataset.annual : el.dataset.monthly;
        el.textContent = value;
      });

      notes.forEach(function (el, i) {
        var annual = parseFloat(prices[i] ? prices[i].dataset.annual : "0");
        var total = annual * 12;
        var totalText = (Math.round(total * 10) / 10).toString().replace(/\.0$/, "") + "M";
        el.textContent = mode === "annual"
          ? "صورتحساب سالانه: " + totalText + " تومان — ۲ ماه هدیه"
          : "با پرداخت سالانه: " + totalText + " تومان در سال";
      });

      if (badge) {
        badge.textContent = mode === "annual"
          ? "۲ ماه هدیه فعال شد"
          : "۲ ماه هدیه با پرداخت سالانه";
      }
    };

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () { render(btn.dataset.billing); });
    });

    render("monthly");
  }

  /* --------------------------------------------------- ROI calculator */
  function initCalculator() {
    var host = document.getElementById("calcCustomers");
    if (!host) return;

    var customers = document.getElementById("calcCustomers");
    var ticket = document.getElementById("calcTicket");
    var repeat = document.getElementById("calcRepeat");
    var customersOut = document.getElementById("calcCustomersOut");
    var ticketOut = document.getElementById("calcTicketOut");
    var repeatOut = document.getElementById("calcRepeatOut");
    var monthlyOut = document.getElementById("calcMonthly");
    var annualOut = document.getElementById("calcAnnual");
    var visitsOut = document.getElementById("calcVisits");

    var ONE_TIME_SHARE = 0.65;   /* share of visitors who never come back */
    var RECOVERY_RATE = 0.10;    /* conservative share we can bring back */

    var money = function (toman) {
      var m = toman / 1000000;
      if (m >= 1000) return fa((m / 1000).toFixed(1)) + "B";
      return (Math.round(m * 10) / 10).toString().replace(/\.0$/, "") + "M";
    };

    var update = function () {
      var c = Number(customers.value);
      var t = Number(ticket.value) * 1000;
      var r = Number(repeat.value) / 100;

      customersOut.textContent = fa(c);
      ticketOut.textContent = fa(Number(ticket.value));
      repeatOut.textContent = fa(Number(repeat.value)) + "٪";

      var oneTime = c * (1 - r);
      var recovered = oneTime * RECOVERY_RATE;
      var revenue = recovered * t;

      monthlyOut.textContent = money(revenue);
      annualOut.textContent = money(revenue * 12);
      visitsOut.textContent = fa(Math.round(recovered));
    };

    [customers, ticket, repeat].forEach(function (input) {
      input.addEventListener("input", update);
    });

    update();
  }

  document.addEventListener("DOMContentLoaded", function () {
    initBilling();
    initCalculator();
  });
})();
