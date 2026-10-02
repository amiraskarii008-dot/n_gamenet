/* ==========================================================================
   CafeLoop — customer-side demo (web app preview inside the phone mockup)
   ========================================================================== */
(function () {
  "use strict";

  var MENU = [
    { id: "americano", name: "Americano",      desc: "دوبل، اسپرسو + آب گرم",   price: 145000, icon: "☕" },
    { id: "latte",     name: "Latte",          desc: "شیر مخملی، بدون شکر",     price: 175000, icon: "🥛" },
    { id: "matcha",    name: "Matcha Latte",   desc: "چای سبز ژاپنی",           price: 215000, icon: "🍵" },
    { id: "coldbrew",  name: "Cold Brew",      desc: "دم سرد ۱۸ ساعته",         price: 195000, icon: "🧊" },
    { id: "cheesecake",name: "Cheesecake",     desc: "برش نیویورکی",            price: 225000, icon: "🍰" },
    { id: "croissant", name: "Croissant",      desc: "کره‌ای، تازه",             price: 130000, icon: "🥐" }
  ];

  var state = {
    tab: "menu",
    joined: false,
    points: 0,
    cart: {}
  };

  /* ------------------------------------------------------------- persistence */
  function save() {
    try { localStorage.setItem("cafeloop-demo", JSON.stringify(state)); } catch (e) {}
  }
  function load() {
    try {
      var raw = localStorage.getItem("cafeloop-demo");
      if (!raw) return;
      var parsed = JSON.parse(raw);
      state.joined = !!parsed.joined;
      state.points = Number(parsed.points) || 0;
      state.cart = parsed.cart || {};
    } catch (e) {}
  }

  function toman(n) { return Number(n).toLocaleString("en-US"); }

  function cartCount() {
    return Object.keys(state.cart).reduce(function (s, k) { return s + state.cart[k]; }, 0);
  }
  function cartTotal() {
    return Object.keys(state.cart).reduce(function (s, k) {
      var item = MENU.filter(function (m) { return m.id === k; })[0];
      return s + (item ? item.price * state.cart[k] : 0);
    }, 0);
  }

  /* --------------------------------------------------------------- rendering */
  function render() {
    var body = document.getElementById("phoneBody");
    if (!body) return;

    var html = "";
    if (state.tab === "menu") html = viewMenu();
    else if (state.tab === "loyalty") html = state.joined ? viewLoyalty() : viewJoinPrompt("برای دیدن امتیازها اول عضو شو");
    else if (state.tab === "offer") html = viewOffer();
    else html = state.joined ? viewProfile() : viewJoinPrompt("برای ساختن پروفایل، یک کلیک فاصله داری");

    body.innerHTML = html;
    bind(body);
    save();
  }

  function viewMenu() {
    var items = MENU.map(function (m) {
      var qty = state.cart[m.id] || 0;
      return '<div class="menu-item' + (qty ? " is-selected" : "") + '" data-item="' + m.id + '">' +
        '<span class="menu-item__thumb">' + m.icon + "</span>" +
        "<div style=\"flex:1\">" +
          "<h5>" + m.name + (qty ? ' <span class="tiny" style="color:var(--brand-600)">×' + qty + "</span>" : "") + "</h5>" +
          '<span>' + m.desc + "</span>" +
        "</div>" +
        '<span class="price">' + toman(m.price) + "<br><span class=\"tiny faint\">تومان</span></span>" +
      "</div>";
    }).join("");

    var total = cartTotal();
    var footer = cartCount() ? (
      '<div class="points-badge" style="flex-direction:column;align-items:stretch;gap:10px">' +
        '<div class="row row--between"><span class="small">' + cartCount() + ' آیتم در سفارش</span><b class="mono">' + toman(total) + "</b></div>" +
        (state.joined
          ? '<div class="tiny muted">امتیاز این سفارش: <b class="mono">' + earnPoints() + "</b></div>"
          : '<button class="btn btn--sm btn--block" data-action="join">عضویت و گرفتن ۱۵٪ امتیاز این سفارش</button>') +
        '<button class="btn btn--sm btn--block" data-action="order">ثبت سفارش (نمایشی)</button>' +
      "</div>"
    ) : "";

    return '<div class="pill pill--brand tiny" style="align-self:flex-start">منوی کافه · به‌روزرسانی امروز</div>' +
      items + footer;
  }

  function earnPoints() { return Math.round(cartTotal() * 0.15 / 1000); }

  function viewJoinPrompt(text) {
    return '<div class="points-badge" style="flex-direction:column;align-items:stretch;text-align:center;gap:12px;padding:22px 16px">' +
      '<div style="font-size:2rem">🪪</div>' +
      "<b>" + text + "</b>" +
      '<p class="tiny muted">فقط شماره موبایل. بدون رمز، بدون اپ. هر زمان بخواهی می‌توانی حذفش کنی.</p>' +
      '<button class="btn btn--sm btn--block" data-action="join">عضویت یک‌کلیکی در CafeLoop</button>' +
      "</div>";
  }

  function ring(points) {
    var next = 1000;
    var pct = Math.min(1, points / next);
    var circ = 2 * Math.PI * 46;
    var off = circ * (1 - pct);
    return '<div class="progress-ring">' +
      '<svg width="108" height="108" viewBox="0 0 108 108" aria-hidden="true">' +
        '<circle cx="54" cy="54" r="46" fill="none" stroke="var(--cream-200)" stroke-width="11"/>' +
        '<circle cx="54" cy="54" r="46" fill="none" stroke="url(#cring)" stroke-width="11" stroke-linecap="round" ' +
          'stroke-dasharray="' + circ.toFixed(0) + '" stroke-dashoffset="' + off.toFixed(0) + '"/>' +
        '<defs><linearGradient id="cring" x1="0" y1="0" x2="1" y2="1">' +
          '<stop offset="0" stop-color="#e0b169"/><stop offset="1" stop-color="#c8773c"/></linearGradient></defs>' +
      "</svg>" +
      '<div class="progress-ring__value"><b>' + state.points + '</b><span>امتیاز</span></div>' +
    "</div>";
  }

  function viewLoyalty() {
    var next = 1000;
    var remain = Math.max(0, next - state.points);
    return ring(state.points) +
      '<p class="small center muted">' + (remain > 0
        ? "<b class=\"mono\">" + remain + "</b> امتیاز تا پاداش بعدی: یک قهوه‌ی رایگان ☕"
        : "پاداش تو آماده است: یک قهوه‌ی رایگان ☕") + "</p>" +
      '<div class="points-badge"><span class="small">پاداش فعال</span><b>۱۰٪ تخفیف</b></div>' +
      '<div class="panel" style="padding:14px">' +
        '<div class="tiny muted" style="margin-bottom:8px">تاریخچه‌ی امتیاز</div>' +
        '<div class="row row--between small"><span>سفارش امروز</span><b class="mono">+' + Math.max(1, earnPoints()) + "</b></div>" +
        '<div class="row row--between small" style="margin-top:6px"><span>سفارش ۳ روز پیش</span><b class="mono">+42</b></div>' +
        '<div class="row row--between small" style="margin-top:6px"><span>سفارش ۸ روز پیش</span><b class="mono">+38</b></div>' +
      "</div>";
  }

  function viewOffer() {
    return '<div class="panel" style="background:linear-gradient(160deg,#2a1c17,#150d0a);color:#f7efe8;border:0;padding:18px">' +
        '<div class="row row--between"><b>مخصوص تو 🎁</b><span class="pill pill--ghost-light tiny">۱۲ ساعت اعتبار</span></div>' +
        '<p class="small" style="margin-top:10px;color:rgba(247,239,232,.82)">' +
          "امیر جان، <b>Americano</b> همیشگی‌ات این هفته با <b>۲۰٪ تخفیف</b> — چون معمولاً این ساعت‌ها می‌آمدی ☕" +
        "</p>" +
        '<div class="row row--between" style="margin-top:14px">' +
          '<span class="mono" style="color:#e0b169">CAFE-AMIR-20</span>' +
          '<button class="btn btn--sm btn--light" data-action="claim">فعال کردن</button>' +
        "</div>" +
      "</div>" +
      '<div class="points-badge"><span class="small">چرا این پیشنهاد؟</span><b class="mono">' + (state.joined ? "8 روز" : "—") + "</b></div>" +
      '<p class="tiny muted">این پیام بر اساس رفتار واقعی همین مشتری ساخته شده، نه یک پیامک گروهی. ' +
      "همین یک تفاوت، نرخ بازگشت را از ۲٪ به ۱۵٪ می‌برد.</p>" +
      '<div class="menu-item"><span class="menu-item__thumb">⏰</span><div style="flex:1"><h5>زمان مناسب ارسال</h5>' +
      "<span>بین ۱۶:۰۰ تا ۱۸:۰۰ — کم‌ترافیک‌ترین بازه</span></div></div>";
  }

  function viewProfile() {
    return '<div class="panel" style="padding:16px">' +
        '<div class="row"><span class="avatar">A</span><div><b>AMIR</b>' +
        '<div class="tiny muted">Cafe Noir · عضو از ۴ ماه پیش</div></div>' +
        '<span class="pill pill--ok" style="margin-inline-start:auto">فعال</span></div>' +
        '<div class="stack" style="margin-top:14px" >' +
          '<div class="row row--between small"><span>☕ تعداد مراجعه</span><b class="mono">7</b></div>' +
          '<div class="row row--between small"><span>💰 مجموع خرید</span><b class="mono">4.2M</b></div>' +
          '<div class="row row--between small"><span>❤️ محصول محبوب</span><b>Americano</b></div>' +
          '<div class="row row--between small"><span>🔥 ساعت محبوب</span><b class="mono">18:00–21:00</b></div>' +
          '<div class="row row--between small"><span>⭐ امتیاز</span><b class="mono">' + (740 + state.points) + "</b></div>" +
        "</div>" +
      "</div>" +
      '<button class="btn btn--sm btn--ghost btn--block" data-action="reset">پاک کردن داده‌ی این دمو</button>' +
      '<p class="tiny faint center">در محصول واقعی، مشتری می‌تواند پروفایلش را کامل حذف کند.</p>';
  }

  /* ------------------------------------------------------------------ events */
  function bind(root) {
    root.querySelectorAll("[data-item]").forEach(function (el) {
      el.addEventListener("click", function () {
        var id = el.dataset.item;
        var item = MENU.filter(function (m) { return m.id === id; })[0];
        state.cart[id] = (state.cart[id] || 0) + 1;
        render();
        window.cafeLoopToast && window.cafeLoopToast("به سفارش اضافه شد: " + (item ? item.name : id));
      });
    });

    root.querySelectorAll("[data-action]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var action = btn.dataset.action;

        if (action === "join") {
          state.joined = true;
          state.points += 50;
          render();
          window.cafeLoopToast && window.cafeLoopToast("خوش آمدی! ۵۰ امتیاز شروع + ۱۵٪ این سفارش 🎉");
        }

        if (action === "order") {
          if (!cartCount()) return;
          var earned = state.joined ? earnPoints() : 0;
          state.points += earned;
          state.cart = {};
          render();
          window.cafeLoopToast && window.cafeLoopToast(
            "سفارش ثبت شد" + (earned ? " — " + earned + " امتیاز گرفتی" : " (بدون عضویت، بدون امتیاز)")
          );
        }

        if (action === "claim") {
          window.cafeLoopToast && window.cafeLoopToast("آفر فعال شد — کد CAFE-AMIR-20 برای صندوق.");
        }

        if (action === "reset") {
          state.joined = false;
          state.points = 0;
          state.cart = {};
          state.tab = "menu";
          var tabs = document.getElementById("phoneTabs");
          tabs && tabs.querySelectorAll("[data-tab]").forEach(function (b) {
            b.classList.toggle("is-active", b.dataset.tab === "menu");
          });
          render();
          window.cafeLoopToast && window.cafeLoopToast("داده‌ی دمو پاک شد.");
        }
      });
    });
  }

  function bindTabs() {
    var tabs = document.getElementById("phoneTabs");
    if (!tabs) return;
    tabs.querySelectorAll("[data-tab]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        state.tab = btn.dataset.tab;
        tabs.querySelectorAll("[data-tab]").forEach(function (b) {
          b.classList.toggle("is-active", b === btn);
        });
        render();
      });
    });
  }

  /* --------------------------------------------------------------------- QR */
  function drawQr() {
    var canvas = document.getElementById("qrCanvas");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var size = 25, cell = canvas.width / size;
    var seed = 20261002;

    function rnd() { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; }

    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#150d0a";

    function finder(x, y) {
      ctx.fillRect(x * cell, y * cell, 7 * cell, 7 * cell);
      ctx.fillStyle = "#fff";
      ctx.fillRect((x + 1) * cell, (y + 1) * cell, 5 * cell, 5 * cell);
      ctx.fillStyle = "#150d0a";
      ctx.fillRect((x + 2) * cell, (y + 2) * cell, 3 * cell, 3 * cell);
    }

    for (var y = 0; y < size; y++) {
      for (var x = 0; x < size; x++) {
        var inFinder =
          (x < 8 && y < 8) || (x > size - 9 && y < 8) || (x < 8 && y > size - 9);
        if (inFinder) continue;
        if (rnd() > 0.52) ctx.fillRect(x * cell, y * cell, cell - 0.6, cell - 0.6);
      }
    }
    finder(0, 0);
    finder(size - 7, 0);
    finder(0, size - 7);
  }

  document.addEventListener("DOMContentLoaded", function () {
    load();
    bindTabs();
    render();
    drawQr();
  });
})();
