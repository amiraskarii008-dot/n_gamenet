/* ==========================================================================
   CafeLoop MVP — customer web app (vanilla JS, no build, no server)
   بخش‌های مشتری: منو + سفارش + سبد، پیگیری سفارش و سرویس میز، وفاداری،
   پیشنهاد شخصی (Smart Return)، پروفایل/Passport و گزینه‌های پیشرفته.
   همه‌چیز در localStorage مرورگر می‌ماند؛ هیچ داده‌ای جایی ارسال نمی‌شود.
   ========================================================================== */
(function () {
  "use strict";

  var D = window.MVP_DATA;
  var KEY = "cafeloop-mvp-v1";
  var FA_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

  /* ----------------------------------------------------------------- state */
  var defaults = {
    view: "menu",
    cat: "all",
    q: "",
    sort: "popular",
    diet: { vegan: false, sugarfree: false, decaf: false, glutenfree: false },
    onlyFav: false,
    maxPrice: 0,           /* 0 = بدون سقف */
    cart: {},              /* key -> {id, qty, opts} */
    orders: [],            /* سفارش فعال */
    history: [],           /* سفارش‌های تحویل‌شده */
    serviceLog: [],
    joined: false,
    name: D.seed.name,
    phone: "",
    points: D.seed.basePoints,
    visits: D.seed.visits,
    spend: D.seed.spend,
    ledger: [
      { label: "سفارش ۳ روز پیش", delta: 42 },
      { label: "سفارش ۸ روز پیش", delta: 38 },
      { label: "هدیه‌ی عضویت", delta: 50 }
    ],
    coupons: [],           /* {id, code, off, kind, title, from} */
    coupon: null,          /* کد انتخاب‌شده برای این سفارش */
    tip: 0,
    when: "now",
    claimed: [],
    favs: [],
    redeemed: [],
    notify: true,
    settings: {
      theme: "dark",
      glass: 58,
      big: false,
      hc: false,
      motion: true,
      digits: "fa",
      advanced: true,
      haptics: true,
      doublePoints: false
    },
    defaults2: { size: "m", milk: "whole", sugar: "2", temp: "hot", extras: [] },
    seen: false,
    table: null
  };

  var state = JSON.parse(JSON.stringify(defaults));

  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(stripCart(state))); } catch (e) {}
  }
  function stripCart(s) {
    var c = JSON.parse(JSON.stringify(s));
    /* سفارش‌ها را کوتاه نگه می‌داریم */
    c.history = (c.history || []).slice(0, 24);
    c.serviceLog = (c.serviceLog || []).slice(0, 12);
    return c;
  }
  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return;
      var p = JSON.parse(raw);
      Object.keys(defaults).forEach(function (k) {
        if (p[k] === undefined) return;
        if (k === "settings" || k === "defaults2" || k === "diet") {
          state[k] = Object.assign({}, defaults[k], p[k] || {});
        } else {
          state[k] = p[k];
        }
      });
    } catch (e) {}
  }

  /* --------------------------------------------------------------- helpers */
  function digits(s) {
    if (state.settings.digits !== "fa") return String(s);
    return String(s).replace(/[0-9]/g, function (m) { return FA_DIGITS[+m]; });
  }
  function money(n) { return digits(Number(n).toLocaleString("en-US")); }
  function short(n) {
    if (n >= 1000000) return digits((n / 1000000).toFixed(1).replace(/\.0$/, "")) + "M";
    if (n >= 1000) return digits(Math.round(n / 1000)) + "K";
    return digits(n);
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function byId(id) { return document.getElementById(id); }
  function all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function find(id) { return D.items.filter(function (i) { return i.id === id; })[0]; }
  function catName(id) {
    var c = D.categories.filter(function (x) { return x.id === id; })[0];
    return c ? c.name : id;
  }
  function now() { return Date.now(); }
  function hhmm(ts) {
    var d = new Date(ts);
    return digits(("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2));
  }
  function faDate(ts) {
    try {
      return new Intl.DateTimeFormat("fa-IR", { month: "long", day: "numeric" }).format(new Date(ts));
    } catch (e) { return digits(new Date(ts).toLocaleDateString("en-GB")); }
  }
  function buzz(ms) {
    if (state.settings.haptics && navigator.vibrate) { try { navigator.vibrate(ms || 12); } catch (e) {} }
  }
  function toast(msg) { if (window.cafeLoopToast) window.cafeLoopToast(msg); }

  /* ----------------------------------------------------------- pricing math */
  function linePrice(line) {
    var item = find(line.id);
    if (!item) return 0;
    var p = item.price;
    var size = D.sizes.filter(function (s) { return s.id === line.opts.size; })[0];
    if (size) p += size.delta;
    var milk = D.milks.filter(function (m) { return m.id === line.opts.milk; })[0];
    if (milk && item.cat !== "cake" && item.cat !== "food") p += milk.delta;
    (line.opts.extras || []).forEach(function (x) {
      var e = D.extras.filter(function (y) { return y.id === x; })[0];
      if (e) p += e.price;
    });
    if (line.opts.sugar === "3") p += 8000;
    return Math.max(0, p);
  }
  function sig(line) {
    return line.id + "|" + line.opts.size + "|" + line.opts.milk + "|" + line.opts.sugar + "|" +
      line.opts.temp + "|" + (line.opts.extras || []).slice().sort().join(",");
  }
  function cartLines() { return Object.keys(state.cart).map(function (k) { return state.cart[k]; }); }
  function cartCount() { return cartLines().reduce(function (s, l) { return s + l.qty; }, 0); }
  function cartSubtotal() { return cartLines().reduce(function (s, l) { return s + linePrice(l) * l.qty; }, 0); }
  function bestCoupon() {
    if (!state.coupons.length) return null;
    var pct = state.coupons.filter(function (c) { return c.kind === "percent"; }).sort(function (a, b) { return b.off - a.off; })[0];
    return pct || null;
  }
  function cartDiscount() {
    if (state.coupon === "") return { coupon: null, amount: 0 };   /* «بدون کد» */
    var c = state.coupons.filter(function (x) { return x.id === state.coupon; })[0] || bestCoupon();
    if (!c || !c.off) return { coupon: c, amount: 0 };
    return { coupon: c, amount: Math.round(cartSubtotal() * c.off / 100) };
  }
  function cartTotal() { return Math.max(0, cartSubtotal() - cartDiscount().amount) + (state.tip || 0); }
  function pointsMultiplier() {
    var t = currentTier();
    return t.id === "diamond" ? 2 : t.id === "gold" ? 1.5 : t.id === "silver" ? 1.25 : 1;
  }
  function pointsFor(total) {
    var base = (total * 0.15 / 1000) * pointsMultiplier();
    if (state.settings.doublePoints) base *= 2;
    if (!(total > 0)) return 0;
    return Math.max(1, Math.round(base));
  }
  function currentTier() {
    var t = D.tiers[0];
    D.tiers.forEach(function (x) { if (state.points >= x.need) t = x; });
    return t;
  }
  function nextTier() {
    for (var i = 0; i < D.tiers.length; i++) if (state.points < D.tiers[i].need) return D.tiers[i];
    return null;
  }

  /* ------------------------------------------------------- behavior / CRM++ */
  function favItem() {
    var tally = {};
    state.history.forEach(function (o) {
      o.items.forEach(function (l) { tally[l.id] = (tally[l.id] || 0) + l.qty; });
    });
    var best = null, n = 0;
    Object.keys(tally).forEach(function (k) { if (tally[k] > n) { n = tally[k]; best = k; } });
    if (best) return find(best) || { name: D.seed.fav, fa: D.seed.fav, icon: "☕" };
    var f = D.items.filter(function (i) { return i.name === D.seed.fav; })[0];
    return f || D.items[0];
  }
  function lastOrderAt() {
    if (state.history.length) return state.history[0].doneAt || state.history[0].placedAt;
    return null;
  }
  function daysAway() {
    var t = lastOrderAt();
    if (t) return Math.max(0, Math.round((now() - t) / 86400000));
    return D.seed.daysAway;
  }
  function churnRisk() {
    var gap = D.seed.gapDays;
    var away = daysAway();
    var pct = clamp(Math.round((away / gap) * 45), 4, 96);
    var label = pct > 66 ? "پرریسک" : pct > 40 ? "در حال سرد شدن" : "سالم";
    var cls = pct > 66 ? "gpill--berry" : pct > 40 ? "gpill--gold" : "gpill--mint";
    return { pct: pct, label: label, cls: cls, away: away, gap: gap };
  }
  function hourHistogram() {
    var h = {};
    Object.keys(D.seed.hourHistogram).forEach(function (k) { h[k] = D.seed.hourHistogram[k]; });
    state.history.forEach(function (o) {
      var hr = new Date(o.placedAt).getHours();
      var bucket = hr < 10 ? "۸–۱۰" : hr < 12 ? "۱۰–۱۲" : hr < 14 ? "۱۲–۱۴" : hr < 16 ? "۱۴–۱۶" :
        hr < 18 ? "۱۶–۱۸" : hr < 21 ? "۱۸–۲۱" : "۲۱–۲۳";
      h[bucket] = (h[bucket] || 0) + 1;
    });
    return h;
  }
  function myRepeatRate() {
    var months = {};
    state.history.forEach(function (o) {
      var d = new Date(o.placedAt);
      var k = d.getFullYear() + "-" + d.getMonth();
      months[k] = (months[k] || 0) + 1;
    });
    var own = Object.keys(months).length;
    var seeded = own ? 34 + own * 3 : 34;
    return { value: clamp(seeded, 22, 92), visitsThisMonth: own ? Math.max.apply(null, Object.keys(months).map(function (k) { return months[k]; })) : 2 };
  }

  /* =============================================================== RENDER */
  function applySettings() {
    var s = state.settings;
    var theme = s.theme;
    if (theme === "auto") {
      theme = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    }
    document.documentElement.setAttribute("data-theme", theme);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "light" ? "#f7ece0" : "#150d0a");
    document.body.classList.toggle("g-big", !!s.big);
    document.body.classList.toggle("g-hc", !!s.hc);
    document.body.classList.toggle("g-nomotion", !s.motion);
    document.documentElement.style.setProperty("--glass-a", String(clamp(s.glass, 10, 96) / 100));
    document.documentElement.style.setProperty("--glass-blur", Math.round(6 + clamp(s.glass, 10, 96) / 4) + "px");
    document.documentElement.style.setProperty("--glass-sat", String(1 + clamp(s.glass, 10, 96) / 120));
  }

  function render() {
    applySettings();
    var adv = state.settings.advanced;
    all("[data-adv]").forEach(function (el) { el.style.display = adv ? "" : "none"; });
    all("[data-view]").forEach(function (v) { v.classList.toggle("is-active", v.dataset.view === state.view); });
    all(".gdock__btn").forEach(function (b) { b.classList.toggle("is-active", b.dataset.view === state.view); });

    if (state.view === "menu") renderMenu();
    if (state.view === "orders") renderOrders();
    if (state.view === "loyalty") renderLoyalty();
    if (state.view === "offers") renderOffers();
    if (state.view === "profile") renderProfile();

    renderDockBadges();
    renderCartBar();
    renderBarMeta();
    byId("tablePill").textContent = "میز " + digits(state.table || D.cafe.table) + " · " + D.cafe.name;
    save();
  }

  function renderBarMeta() {
    var t = currentTier();
    var pts = byId("barPoints");
    if (pts) pts.textContent = digits(state.points) + " امتیاز · " + t.name;
    var clk = byId("liveClock");
    if (clk) clk.textContent = hhmm(now()) + " · " + faDate(now());
  }

  function renderDockBadges() {
    var c = byId("badgeCart");
    if (c) { c.textContent = digits(cartCount()); c.classList.toggle("is-zero", !cartCount()); }
    var o = byId("badgeOrder");
    if (o) { o.classList.toggle("is-zero", !state.orders.length); o.textContent = state.orders.length ? "●" : ""; }
    var f = byId("badgeOffer");
    if (f) {
      var fresh = D.offers.filter(function (x) { return state.claimed.indexOf(x.id) < 0; }).length;
      f.textContent = digits(fresh);
      f.classList.toggle("is-zero", !fresh || !state.joined);
    }
  }

  function renderCartBar() {
    var bar = byId("cartBar");
    var n = cartCount();
    if (!n) { bar.classList.remove("is-up"); return; }
    bar.classList.add("is-up");
    byId("cartBarText").innerHTML =
      "<b>" + money(cartTotal()) + " <span style='font-size:.7rem'>تومان</span></b>" +
      "<span>" + digits(n) + " آیتم · " + cartLines().length + " خط سفارش" +
      (cartDiscount().amount ? " · تخفیف " + digits(cartDiscount().coupon.off) + "٪ فعال" : "") + "</span>";
  }

  /* ------------------------------------------------------------ menu view */
  function filtered() {
    var q = state.q.trim().toLowerCase();
    var list = D.items.filter(function (i) {
      if (state.cat !== "all" && i.cat !== state.cat) return false;
      if (state.onlyFav && state.favs.indexOf(i.id) < 0) return false;
      if (state.maxPrice && i.price > state.maxPrice) return false;
      var k;
      for (k in state.diet) if (state.diet[k] && i.tags.indexOf(k) < 0) return false;
      if (q) {
        var hay = (i.name + " " + i.fa + " " + i.desc).toLowerCase();
        if (hay.indexOf(q) < 0) return false;
      }
      return true;
    });
    var s = state.sort;
    list = list.slice().sort(function (a, b) {
      if (s === "price-asc") return a.price - b.price;
      if (s === "price-desc") return b.price - a.price;
      if (s === "rating") return b.rating - a.rating;
      if (s === "fast") return a.prep - b.prep;
      return b.sold - a.sold;
    });
    return list;
  }

  function tagPill(tag) {
    var map = { vegan: ["🌱 گیاهی", "gpill--mint"], sugarfree: ["بدون شکر", ""], decaf: ["بدون کافئین", ""], glutenfree: ["بدون گلوتن", ""] };
    var m = map[tag];
    if (!m) return "";
    return "<span class='gpill " + m[1] + "'>" + m[0] + "</span>";
  }

  function cartQtyOf(id) {
    return cartLines().reduce(function (s, l) { return s + (l.id === id ? l.qty : 0); }, 0);
  }

  function itemCard(it) {
    var qty = cartQtyOf(it.id);
    var isFav = state.favs.indexOf(it.id) >= 0;
    var adv = state.settings.advanced;
    var meta = "<span class='gpill'>⭐ " + digits(it.rating.toFixed(1)) + "</span>" +
      "<span class='gpill'>🔥 " + digits(it.sold) + " فروش</span>" +
      it.tags.map(tagPill).join("");
    if (adv) {
      meta += "<span class='gpill'>⏱ " + digits(it.prep) + "′</span><span class='gpill'>📈 " + digits(it.kcal) + " kcal</span>" +
        (it.caf ? "<span class='gpill'>⚡ " + digits(it.caf) + "mg</span>" : "") +
        (it.spicy ? "<span class='gpill gpill--berry'>🌶 " + digits(it.spicy) + "</span>" : "");
    }
    return "<div class='gitem glass gcard" + (qty ? " is-in" : "") + "' data-open='" + it.id + "' role='button' tabindex='0'>" +
      "<span class='gitem__thumb'>" + it.icon +
        "<button class='gitem__fav" + (isFav ? " is-on" : "") + "' data-fav='" + it.id + "' aria-label='علاقه‌مندی'>" + (isFav ? "♥" : "♡") + "</button>" +
      "</span>" +
      "<div class='gitem__body'>" +
        "<h4>" + esc(it.fa) + " <span style='font-weight:600;color:var(--g-ink-faint);font-size:.8rem'>" + esc(it.name) + "</span></h4>" +
        "<p>" + esc(it.desc) + "</p>" +
        "<div class='gitem__meta'>" + meta + "</div>" +
      "</div>" +
      "<div class='gitem__side'>" +
        "<span class='gitem__price'>" + money(it.price) + "<small>تومان</small></span>" +
        (qty
          ? "<span class='gitem__qty'><button data-dec='" + it.id + "' aria-label='کم کردن'>−</button><b>" + digits(qty) + "</b><button data-inc='" + it.id + "' aria-label='اضافه کردن'>+</button></span>"
          : "<span class='gitem__add' data-add='" + it.id + "' aria-label='افزودن به سفارش'>+</span>") +
      "</div>" +
    "</div>";
  }

  function renderMenu() {
    /* chips */
    var chips = byId("catChips");
    var counts = {};
    D.categories.forEach(function (c) { counts[c.id] = D.items.filter(function (i) { return i.cat === c.id; }).length; });
    chips.innerHTML =
      "<button class='gchip" + (state.cat === "all" ? " is-active" : "") + "' data-cat='all'><i>✨</i>همه<span class='gpill'>" + digits(D.items.length) + "</span></button>" +
      D.categories.map(function (c) {
        return "<button class='gchip" + (state.cat === c.id ? " is-active" : "") + "' data-cat='" + c.id + "'><i>" + c.icon + "</i>" +
          c.name + "<span class='gpill'>" + digits(counts[c.id]) + "</span></button>";
      }).join("");

    var list = filtered();
    var activeFilters = Object.keys(state.diet).filter(function (k) { return state.diet[k]; })
      .concat(state.onlyFav ? ["علاقه‌مندی"] : [])
      .concat(state.maxPrice ? ["زیر " + short(state.maxPrice)] : [])
      .concat(list.length !== D.items.length ? ["«" + catName(state.cat) + "»"] : []);

    byId("menuCount").innerHTML = "<b>" + digits(list.length) + "</b> آیتم" +
      (activeFilters.length ? " · فیلترها: " + esc(activeFilters.filter(function (x, i, a) { return a.indexOf(x) === i; }).slice(0, 3).join("، ")) : "");

    /* فیلترهای سریعِ داخل صفحه با وضعیت منوی فیلتر همگام می‌مانند */
    all("#quickDiet [data-diet]").forEach(function (b) {
      b.classList.toggle("is-on", !!state.diet[b.dataset.diet]);
    });

    byId("menuList").innerHTML = list.length
      ? list.map(itemCard).join("")
      : "<div class='gempty glass gcard'><span>🔍</span><b>چیزی با این فیلترها پیدا نشد</b>" +
        "<p class='gsmall gmuted'>از منوی فیلتر (⚙︎ بالای صفحه) گزینه‌ها را کم کن یا جست‌وجو را پاک کن.</p>" +
        "<button class='gbtn gbtn--glass gbtn--sm' data-clear='1' style='margin-top:12px'>پاک کردن فیلترها</button></div>";
  }

  /* ---------------------------------------------------------- orders view */
  var STEPS = [
    { t: "سفارش ثبت شد", d: "پیشخدمت روی تبلت دید" },
    { t: "در حال آماده‌سازی", d: "بار / آشپزخانه" },
    { t: "آماده — روی میز", d: "بررسی و تقدیم" }
  ];

  function orderCard(o, isHistory) {
    var done = isHistory || o.status >= STEPS.length;
    var html = "<div class='gcard glass'" + (isHistory ? "" : " data-order='" + o.id + "'") + ">" +
      "<div class='gcard__head'>" +
        "<div><h3>سفارش #" + esc(o.code) + " · میز " + digits(o.table) + "</h3>" +
        "<p>" + faDate(o.placedAt) + " · ساعت " + hhmm(o.placedAt) +
          (o.coupon ? " · کد " + esc(o.coupon) : "") + (o.tip ? " · تیپ " + short(o.tip) : "") + "</p></div>" +
        (isHistory
          ? "<span class='gpill gpill--mint'>✓ تحویل شد</span>"
          : "<span class='gpill gpill--gold'>" + (o.status >= STEPS.length ? "آماده" : STEPS[o.status].t) + "</span>") +
      "</div>";

    if (!isHistory) {
      html += "<div class='gtrack' style='margin-bottom:14px'>" + STEPS.map(function (s, i) {
        var cls = o.status > i ? "is-done" : o.status === i ? "is-now" : "";
        return "<div class='gtrack__step " + cls + "'><span class='gtrack__dot'>" + (o.status > i ? "✓" : digits(i + 1)) + "</span>" +
          "<div><b>" + s.t + "</b><span>" + s.d + (o.status === i ? " · " + etaText(o) : "") + "</span></div></div>";
      }).join("") + "</div>";
    }

    html += "<div class='gsub'>" + o.items.map(function (l) {
      var it = find(l.id) || { fa: l.name, icon: "🍽" };
      return "<div class='gsub__row'><span>" + it.icon + "</span><div style='min-width:0'>" + esc(l.name) +
        " <span class='gfaint gtiny'>×" + digits(l.qty) + (l.summary ? " · " + esc(l.summary) : "") + "</span></div>" +
        "<b>" + money(linePrice(l) * l.qty) + "</b></div>";
    }).join("") + "</div>";

    html += "<div class='gsub' style='margin-top:10px'>" +
      "<div class='gsub__row'><span>جمع</span><b>" + money(o.subtotal) + "</b></div>" +
      (o.discount ? "<div class='gsub__row'><span>تخفیف</span><b style='color:var(--g-mint)'>-" + money(o.discount) + "</b></div>" : "") +
      (o.tip ? "<div class='gsub__row'><span>تیپ به تیم</span><b>" + money(o.tip) + "</b></div>" : "") +
      "<div class='gsub__row'><span><b>قابل پرداخت</b></span><b style='color:var(--g-accent)'>" + money(o.total) + "</b></div>" +
      "<div class='gsub__row'><span>امتیاز گرفته‌شده</span><b>+" + digits(o.points) + "</b></div>" +
    "</div>";

    html += "<div class='grow-flex' style='margin-top:14px'>";
    if (isHistory) {
      html += "<button class='gbtn gbtn--glass gbtn--sm' data-reorder='" + o.id + "'>↻ سفارش مجدد</button>" +
        "<div class='grow-flex' style='gap:2px' data-rate='" + o.id + "' role='group' aria-label='امتیاز به سفارش'>" +
        [1, 2, 3, 4, 5].map(function (n) {
          return "<button class='gbtn gbtn--glass gbtn--sm' data-rate-set='" + o.id + ":" + n + "' style='padding:4px 8px'>" +
            (n <= (o.rating || 0) ? "★" : "☆") + "</button>";
        }).join("") + "</div>" +
        (o.rating ? "<span class='gpill gpill--gold'>ثبت شد — ممنون!</span>" : "<span class='gfaint gtiny'>به این سفارش امتیاز بده</span>");
    } else {
      html += "<button class='gbtn gbtn--sm' data-deliver='" + o.id + "'>✓ تحویل شد / تسویه</button>" +
        "<button class='gbtn gbtn--glass gbtn--sm' data-cancel='" + o.id + "'>لغو سفارش</button>" +
        "<button class='gbtn gbtn--glass gbtn--sm' data-menu='service'>🙋 درخواست از میز</button>" +
        "<span class='gfaint gtiny' data-eta>زمان باقی‌مانده: " + etaText(o) + "</span>";
    }
    html += "</div></div>";
    return html;
  }

  function etaText(o) {
    var left = Math.max(0, Math.round((o.eta - now()) / 1000));
    if (o.status >= STEPS.length) return "آماده است ☕";
    if (left <= 0) return "همین حالا";
    return digits(left) + " ثانیه";
  }

  function renderOrders() {
    var wrap = byId("ordersWrap");
    var html = "";
    if (!state.orders.length) {
      html += "<div class='gempty glass gcard'><span>🧾</span><b>سفارش فعالی نداری</b>" +
        "<p class='gsmall gmuted'>از تب «منو» آیتم اضافه کن و سفارش را ثبت کن — وضعیت اینجا زنده به‌روز می‌شود.</p>" +
        "<button class='gbtn gbtn--sm' data-goto='menu' style='margin-top:12px'>رفتن به منو ←</button></div>";
    } else {
      html += state.orders.map(function (o) { return orderCard(o, false); }).join("");
    }

    /* service requests */
    var adv = state.settings.advanced;
    html += "<div class='gcard glass gcard--hero' style='margin-top:12px'>" +
      "<div class='gcard__head'><div><h3>🙋 سرویس میز</h3><p>درخواست به تبلت پیشخدمت می‌رود؛ بدون بلند کردن دست.</p></div>" +
      "<span class='gpill'>" + digits(state.serviceLog.length) + " درخواست امروز</span></div>" +
      "<div class='opt-grid'>" + D.service.map(function (s) {
        return "<button class='opt' data-service='" + s.id + "'><i style='font-style:normal'>" + s.icon + "</i> " + s.name +
          (adv ? "<small>" + s.note + "</small>" : "") + "</button>";
      }).join("") + "</div>" +
      (state.serviceLog.length
        ? "<div class='gsub' style='margin-top:12px'>" + state.serviceLog.slice(0, adv ? 6 : 2).map(function (l) {
            var s = D.service.filter(function (x) { return x.id === l.id; })[0] || { name: l.id, icon: "•" };
            return "<div class='gsub__row'><span>" + s.icon + "</span><div>" + esc(s.name) + "</div><b>" + hhmm(l.at) + "</b></div>";
          }).join("") + "</div>"
        : "") +
      "</div>";

    /* history */
    html += "<div class='gcard glass' style='margin-top:12px'>" +
      "<div class='gcard__head'><div><h3>📜 تاریخچه‌ی سفارش</h3><p>همین داده، پایه‌ی پروفایل رفتاری و کمپین بازگشت است.</p></div>" +
      (state.history.length && adv ? "<button class='gbtn gbtn--glass gbtn--sm' data-export='csv'>⬇ CSV</button>" : "") + "</div>";
    html += state.history.length
      ? state.history.map(function (o) { return orderCard(o, true); }).join("")
      : "<p class='gsmall gfaint'>هنوز سفارشی تحویل نشده.</p>";
    html += "</div>";

    wrap.innerHTML = html;
  }

  /* ---------------------------------------------------------- loyalty view */
  function ring(p, next) {
    var pct = clamp(p / next, 0, 1);
    var circ = 2 * Math.PI * 62;
    return "<div class='gring'><svg viewBox='0 0 140 140' aria-hidden='true'>" +
      "<circle cx='70' cy='70' r='62' fill='none' stroke='rgba(255,255,255,.16)' stroke-width='13'/>" +
      "<circle cx='70' cy='70' r='62' fill='none' stroke='url(#gGrad)' stroke-width='13' stroke-linecap='round' " +
      "stroke-dasharray='" + circ.toFixed(0) + "' stroke-dashoffset='" + (circ * (1 - pct)).toFixed(0) + "'/>" +
      "<defs><linearGradient id='gGrad' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#f0c684'/><stop offset='1' stop-color='#c8773c'/></linearGradient></defs>" +
      "</svg><div class='gring__val'><b>" + digits(p) + "</b><span>از " + digits(next) + " امتیاز</span></div></div>";
  }

  function renderLoyalty() {
    var wrap = byId("loyaltyWrap");
    if (!state.joined) { wrap.innerHTML = joinCard("برای دیدن امتیاز، تراز وفاداری و پاداش‌ها، عضو شو — فقط یک شماره."); return; }

    var goal = 1000;
    var t = currentTier();
    var nt = nextTier();
    var remainReward = Math.max(0, goal - (state.points % goal || (state.points ? goal : 0)));
    if (state.points >= goal && state.points % goal === 0) remainReward = 0;

    var html = "<div class='gcard glass gcard--hero'>" +
      "<div class='gcard__head'><div><h3>⭐ تراز وفاداری</h3><p>هر ۱۰۰۰ امتیاز = یک نوشیدنی رایگان · ضریب سطح: " + digits(pointsMultiplier()) + "×</p></div>" +
      "<span class='gpill gpill--gold'>" + t.icon + " " + t.name + "</span></div>" +
      ring(state.points % goal || (state.points >= goal ? goal : 0), goal) +
      "<p class='gcenter gsmall gmuted' style='margin-top:10px'>" +
      (remainReward > 0
        ? "<b class='gmono'>" + digits(remainReward) + "</b> امتیاز تا پاداش بعدی"
        : "🎉 پاداش بعدی آماده‌ی دریافت است") +
      "</p>" +
      (nt ? "<div class='gbar' style='margin-top:10px'><span>تا " + nt.name + "</span><span class='gbar__t'><span class='gbar__f' style='width:" + clamp(state.points / nt.need * 100, 2, 100) + "%'></span></span><span class='gbar__v'>" + digits(Math.round(state.points / nt.need * 100)) + "%</span></div>" : "") +
      "</div>";

    html += "<div class='gtiers' style='margin-top:12px'>" + D.tiers.map(function (x) {
      var isNow = x.id === t.id;
      var locked = state.points < x.need;
      return "<div class='gtier " + (isNow ? "is-now" : locked ? "is-locked" : "") + "'><span class='gtier__ico'>" + x.icon + "</span>" +
        "<b>" + x.name + "</b><span>" + digits(x.need) + "+</span>" +
        "<div class='gtiny gfaint' style='margin-top:6px'>" + x.perk + "</div></div>";
    }).join("") + "</div>";

    /* rewards */
    html += "<div class='gcard glass' style='margin-top:12px'>" +
      "<div class='gcard__head'><div><h3>🎁 پاداش‌ها</h3><p>با امتیازت بخر؛ کد برای صندوق صادر می‌شود.</p></div></div>" +
      "<div class='ggrid ggrid-2'>" + D.rewards.map(function (r) {
        var can = state.points >= r.cost;
        var used = state.redeemed.filter(function (x) { return r.id === x; }).length;
        return "<div class='gcard glass flat' style='padding:14px'>" +
          "<div class='grow-flex grow-flex--between'><b style='font-size:.95rem'>" + r.icon + " " + r.name + "</b>" +
          "<span class='gpill " + (can ? "gpill--mint" : "") + "'>" + digits(r.cost) + "</span></div>" +
          "<p class='gtiny gfaint' style='margin:6px 0 10px'>" + r.note + (used ? " · " + digits(used) + " بار قبلی" : "") + "</p>" +
          "<button class='gbtn " + (can ? "" : "gbtn--glass") + " gbtn--sm gbtn--block' data-redeem='" + r.id + "'" + (can ? "" : " disabled") + ">" +
          (can ? "دریافت پاداش" : "کم آوردی: " + digits(r.cost - state.points)) + "</button></div>";
      }).join("") + "</div></div>";

    /* ledger + advanced analytics */
    html += "<div class='gcard glass' style='margin-top:12px' data-adv>" +
      "<div class='gcard__head'><div><h3>📊 تحلیل رفتار خودت (پیشرفته)</h3><p>همین اعداد را کافه در پنل خودش می‌بیند.</p></div></div>" +
      "<div class='ggrid ggrid-2'>" +
        "<div class='gsub'>" +
          row("☕ تعداد مراجعه", digits(state.visits)) +
          row("💰 مجموع خرید", short(state.spend) + " تومان") +
          row("❤️ محصول محبوب", esc(favItem().fa)) +
          row("🔁 میانگین فاصله", digits(D.seed.gapDays) + " روز") +
          row("📉 ریسک ریزش", digits(churnRisk().pct) + "%") +
        "</div>" +
        "<div class='gbars'>" + Object.keys(hourHistogram()).map(function (k) {
          var v = hourHistogram()[k];
          var max = Math.max.apply(null, Object.keys(hourHistogram()).map(function (x) { return hourHistogram()[x]; })) || 1;
          return "<div class='gbar'><span>" + k + "</span><span class='gbar__t'><span class='gbar__f gbar__f--mint' data-w='" + (v / max * 100) + "'></span></span><span class='gbar__v'>" + digits(v) + "</span></div>";
        }).join("") + "</div>" +
      "</div>" +
      "<canvas class='spark' id='sparkCanvas' width='600' height='120' style='width:100%;height:96px;margin-top:14px' aria-label='روند خرج ماهانه'></canvas>" +
      "</div>";

    html += "<div class='gcard glass' style='margin-top:12px'>" +
      "<div class='gcard__head'><div><h3>🧾 دفتر امتیاز</h3><p>جامعه‌ی هدف: شفافیت = اعتماد.</p></div></div>" +
      "<div class='gledger'>" + state.ledger.map(function (l) {
        return "<div class='gledger__row " + (l.delta >= 0 ? "plus" : "minus") + "'><span>" + (l.delta >= 0 ? "▲" : "▼") + "</span>" +
          "<div>" + esc(l.label) + (l.at ? " <span class='gfaint gtiny'>" + hhmm(l.at) + "</span>" : "") + "</div>" +
          "<b>" + (l.delta >= 0 ? "+" : "") + digits(l.delta) + "</b></div>";
      }).join("") + "</div></div>";

    wrap.innerHTML = html;
    all("[data-w]", wrap).forEach(function (el) { requestAnimationFrame(function () { el.style.width = el.dataset.w + "%"; }); });
    drawSpark();
  }

  function row(a, b) { return "<div class='gsub__row'><span>" + a + "</span><b>" + b + "</b></div>"; }

  function joinCard(text) {
    return "<div class='gempty glass gcard'><span>🪪</span><b>" + esc(text) + "</b>" +
      "<p class='gsmall gmuted'>بدون اپ، بدون رمز، بدون فرم طولانی. هر زمان خواستی می‌توانی پروفایل را حذف کنی.</p>" +
      "<button class='gbtn' data-join='1' style='margin-top:12px'>عضویت یک‌کلیکی CafeLoop</button></div>";
  }

  /* ----------------------------------------------------------- offers view */
  function renderOffers() {
    var wrap = byId("offersWrap");
    if (!state.joined) { wrap.innerHTML = joinCard("پیشنهاد شخصی فقط برای عضوهای CafeLoop ساخته می‌شود — چون باید بدانی ما رفتارت را می‌بینیم."); return; }

    var fav = favItem();
    var risk = churnRisk();
    var rr = myRepeatRate();

    var html = "<div class='gcard glass gcard--hero'>" +
      "<div class='gcard__head'><div><h3>🔔 Smart Return — چرا همین حالا؟</h3><p>سیستم چرخه‌ی همیشگی تو را می‌شناسد.</p></div>" +
      "<span class='gpill " + risk.cls + "'>" + risk.label + " · " + digits(risk.pct) + "%</span></div>" +
      "<div class='ggrid ggrid-3'>" +
        mini("فاصله از آخرین مراجعه", digits(risk.away) + " روز", "چرخه‌ی تو: " + digits(risk.gap) + " روز") +
        mini("محصول محبوب", esc(fav.fa), "پیشنهاد حول همین ساخته می‌شود") +
        mini("نرخ بازگشت تو", digits(rr.value) + "%", digits(rr.visitsThisMonth) + " مراجعه در این ماه") +
      "</div>" +
      "<label class='grow' style='margin-top:12px'><span class='grow__label'>پیامک یادآوری<small>فقط وقتی واقعاً چیزی برای گفتن داریم — نه پیام انبوه.</small></span>" +
      "<button class='switch' role='switch' aria-checked='" + (state.notify ? "true" : "false") + "' data-notify='1' aria-label='یادآوری پیامکی'></button></label>" +
      "</div>";

    html += "<div class='ggrid ggrid-2' style='margin-top:12px'>" + D.offers.map(function (o) {
      var claimed = state.claimed.indexOf(o.id) >= 0;
      var body = o.id === "comeback" ? o.body.replace("Americanano", esc(fav.fa)) : o.body;
      return "<div class='goffer glass " + (claimed ? "is-claimed" : "") + "'>" +
        "<div class='grow-flex grow-flex--between'><b style='font-size:1rem'>" + o.icon + " " + esc(o.title) + "</b>" +
        "<span class='gpill " + (claimed ? "gpill--mint" : "gpill--gold") + "'>" + (claimed ? "✓ فعال شد" : digits(o.expiresIn) + " اعتبار") + "</span></div>" +
        "<p>" + body + "</p>" +
        "<div class='gitem__meta' style='margin-top:10px'><span class='gpill'>🕓 " + esc(o.window) + "</span>" +
        (o.off ? "<span class='gpill gpill--berry'>−" + digits(o.off) + "٪</span>" : "<span class='gpill'>🎁 هدیه</span>") + "</div>" +
        "<div class='gnote' style='margin-top:12px'><b>چرا این پیشنهاد؟</b> " + esc(o.why) + "</div>" +
        "<div class='grow-flex' style='margin-top:12px'>" +
          (claimed
            ? "<span class='goffer__code'>" + esc(o.code) + "</span><button class='gbtn gbtn--glass gbtn--sm' data-copy='" + esc(o.code) + "'>کپی</button>"
            : "<button class='gbtn gbtn--sm' data-claim='" + o.id + "'>دریافت و فعال کردن</button>") +
        "</div></div>";
    }).join("") + "</div>";

    /* wallet */
    html += "<div class='gcard glass' style='margin-top:12px'>" +
      "<div class='gcard__head'><div><h3>👛 کیف پول کد تخفیف</h3><p>کد فعال در لحظه‌ی ثبت سفارش اعمال می‌شود.</p></div></div>" +
      (state.coupons.length
        ? "<div class='gsub'>" + state.coupons.map(function (c) {
            return "<div class='gsub__row'><span>🏷️</span><div>" + esc(c.title) + " <span class='goffer__code' style='margin:0'>" + esc(c.code) + "</span></div>" +
              "<b>" + (c.off ? digits(c.off) + "٪" : "هدیه") + "</b></div>";
          }).join("") + "</div>"
        : "<p class='gsmall gfaint'>هنوز کدی نداری — یکی از پیشنهادها بالا را فعال کن.</p>") +
      "</div>";

    wrap.innerHTML = html;
  }

  function mini(a, b, c) {
    return "<div class='gcard glass' style='padding:14px;border-radius:18px'>" +
      "<div class='gtiny gfaint'>" + a + "</div><div style='font-size:1.15rem;font-weight:800;margin-top:2px'>" + b + "</div>" +
      "<div class='gtiny gmuted' style='margin-top:2px'>" + c + "</div></div>";
  }

  /* ---------------------------------------------------------- profile view */
  function renderProfile() {
    var wrap = byId("profileWrap");
    var t = currentTier();
    var fav = favItem();
    var risk = churnRisk();

    var html = "<div class='gcard glass gcard--hero'>" +
      "<div class='grow-flex' style='align-items:center'>" +
      "<span class='gitem__thumb' style='width:56px;height:56px;font-size:1.5rem'>" + (state.joined ? "🪪" : "👤") + "</span>" +
      "<div style='flex:1'><h3 style='margin:0'>" + esc(state.joined ? state.name : "مشتری مهمان") + "</h3>" +
      "<p style='margin:0'>" + D.cafe.name + " · " + (state.joined ? "عضو از " + D.seed.memberSince + " · " + esc(D.seed.phoneMasked) : "هنوز عضو نشده") + "</p></div>" +
      (state.joined ? "<span class='gpill gpill--gold'>" + t.icon + " " + t.name + "</span>" : "<button class='gbtn gbtn--sm' data-join='1'>عضویت</button>") +
      "</div></div>";

    html += "<div class='ggrid ggrid-4' style='margin-top:12px'>" +
      stat("امتیاز", digits(state.points)) +
      stat("مراجعه", digits(state.visits)) +
      stat("مجموع خرید", short(state.spend) + "T") +
      stat("کد فعال", digits(state.coupons.length)) +
      "</div>";

    html += "<div class='gcard glass' style='margin-top:12px'>" +
      "<div class='gcard__head'><div><h3>🎯 Customer Passport</h3><p>پروفایل رفتاری که کافه با آن تصمیم می‌گیرد — نسخه‌ای که خودت می‌بینی.</p></div>" +
      "<span class='gpill'>به‌روز: " + faDate(now()) + "</span></div>" +
      "<div class='ggrid ggrid-2'>" +
        "<div class='gsub'>" +
          row("❤️ محصول محبوب", esc(fav.fa)) +
          row("🕗 ساعت محبوب", esc(D.seed.hour)) +
          row("🔁 میانگین فاصله", digits(D.seed.gapDays) + " روز") +
          row("📅 روزهای غیبت", digits(risk.away) + " روز") +
          row("🧾 سفارش این دمو", digits(state.history.length + state.orders.length)) +
        "</div>" +
        "<div class='gstack'>" +
          "<div class='goffer glass'>" +
            "<b>پیش‌بینی بازگشت</b>" +
            "<p class='gtiny gmuted'>بر اساس فاصله‌ی مراجعه‌ی خودت: اگر تا " + digits(Math.max(1, risk.gap - risk.away)) + " روز آینده بیایی، در چرخه می‌مانی.</p>" +
            "<div class='gbar' style='margin-top:10px'><span>ریسک</span><span class='gbar__t'><span class='gbar__f' style='width:" + risk.pct + "%'></span></span><span class='gbar__v'>" + digits(risk.pct) + "%</span></div>" +
          "</div>" +
          "<div class='gnote'>در نسخه‌ی واقعی این داده فقط به همان کافه نشان داده می‌شود و هر زمان خواستی قابل حذف است.</div>" +
        "</div>" +
      "</div></div>";

    /* favourites + QR + settings */
    html += "<div class='ggrid ggrid-2' style='margin-top:12px'>" +
      "<div class='gcard glass'>" +
        "<div class='gcard__head'><div><h3>♥ علاقه‌مندی‌ها</h3><p>ستاره‌ی روی آیتم‌ها این لیست را می‌سازد.</p></div></div>" +
        (state.favs.length
          ? "<div class='gsub'>" + state.favs.map(function (id) {
              var it = find(id); if (!it) return "";
              return "<div class='gsub__row'><span>" + it.icon + "</span><div>" + esc(it.fa) + " <span class='gfaint gtiny'>" + money(it.price) + "</span></div>" +
                "<b><button class='gbtn gbtn--glass gbtn--sm' data-add='" + it.id + "'>+</button></b></div>";
            }).join("") + "</div>"
          : "<p class='gsmall gfaint'>هنوز چیزی نشان نکرده‌ای.</p>") +
      "</div>" +
      "<div class='gcard glass gcenter'>" +
        "<div class='gcard__head'><div><h3>🔳 QR میز</h3><p>اسکن = ورود به همین صفحه با شماره‌ی میز.</p></div></div>" +
        "<span class='gqr'><canvas id='qrCanvas' width='180' height='180'></canvas></span>" +
        "<p class='gtiny gfaint' style='margin-top:8px'>cafeloop.ir/noir/t" + digits(state.table || D.cafe.table) + "</p>" +
        "<div class='grow-flex' style='justify-content:center;margin-top:6px'>" +
          "<button class='gbtn gbtn--glass gbtn--sm' data-copy='cafeloop.ir/noir/t" + digits(state.table || D.cafe.table) + "'>کپی لینک میز</button>" +
        "</div>" +
      "</div>" +
      "</div>";

    /* advanced settings, mirrored from top menu */
    html += "<div class='gcard glass' style='margin-top:12px'>" +
      "<div class='gcard__head'><div><h3>⚙️ گزینه‌های پیشرفته</h3><p>تم، شیشه، دسترس‌پذیری، داده‌ی شخصی.</p></div></div>" +
      settingsHtml() +
      "<div class='gmenu__sep'></div>" +
      "<div class='opt-row'><span>پیش‌فرض سفارش‌ها (روی همه‌ی آیتم‌های بعدی اعمال می‌شود)</span>" +
        "<div class='opt-grid'>" +
          D.milks.map(function (m) {
            return "<button class='opt" + (state.defaults2.milk === m.id ? " is-on" : "") + "' data-defmilk='" + m.id + "'>" + m.name + "</button>";
          }).join("") +
        "</div>" +
        "<div class='opt-grid'>" +
          D.sizes.map(function (s) {
            return "<button class='opt' data-defsize='" + s.id + "'>" + s.name + "</button>";
          }).join("") +
        "</div>" +
      "</div>" +
      "<div class='grow-flex'>" +
        "<button class='gbtn gbtn--glass gbtn--sm' data-export='json'>⬇ خروجی JSON داده‌ی من</button>" +
        "<button class='gbtn gbtn--glass gbtn--sm' data-export='csv'>⬇ CSV سفارش‌ها</button>" +
        "<button class='gbtn gbtn--danger gbtn--sm' data-reset='1'>🗑 پاک کردن همه‌ی داده‌ی دمو</button>" +
      "</div>" +
      "</div>";

    wrap.innerHTML = html;
    wireSettings(wrap);
    drawQr();
  }

  function stat(a, b) {
    return "<div class='gcard glass' style='padding:12px;text-align:center;border-radius:18px'>" +
      "<div class='gtiny gfaint'>" + a + "</div><div style='font-family:var(--font-mono);direction:ltr;font-size:1.2rem;font-weight:800'>" + b + "</div></div>";
  }

  /* -------------------------------------------------- settings (shared UI) */
  function settingsHtml() {
    var s = state.settings;
    return "<div class='opt-row'><span>تم</span>" +
        "<div class='segmented' data-seg='theme'>" +
          ["dark", "light", "auto"].map(function (k) {
            return "<button class='" + (s.theme === k ? "is-active" : "") + "' data-theme-set='" + k + "'>" +
              (k === "dark" ? "🌙 تاریک" : k === "light" ? "☀︎ روشن" : "🖥 خودکار") + "</button>";
          }).join("") + "</div></div>" +
      "<div class='opt-row'><span>شدت شیشه — " + digits(s.glass) + "% <span class='gfaint gtiny'>(محو و شفافیت منوهای شیشه‌ای)</span></span>" +
        "<input type='range' min='10' max='96' step='2' value='" + s.glass + "' data-glass='1' aria-label='شدت شیشه'></div>" +
      "<div class='grow'><span class='grow__label'>حالت پیشرفته<small>کالری، کافئین، زمان آماده‌سازی، تیپ، تحلیل و خروجی داده</small></span>" +
        "<button class='switch' role='switch' aria-checked='" + (s.advanced ? "true" : "false") + "' data-toggle='advanced' aria-label='حالت پیشرفته'></button></div>" +
      "<div class='grow'><span class='grow__label'>فونت بزرگ‌تر<small>برای خوانایی روی گوشی در نور زیاد</small></span>" +
        "<button class='switch' role='switch' aria-checked='" + (s.big ? "true" : "false") + "' data-toggle='big' aria-label='فونت بزرگ'></button></div>" +
      "<div class='grow'><span class='grow__label'>کنتراست بالا<small>حاشیه‌های پررنگ‌تر و شیشه‌ی کدرتر</small></span>" +
        "<button class='switch' role='switch' aria-checked='" + (s.hc ? "true" : "false") + "' data-toggle='hc' aria-label='کنتراست بالا'></button></div>" +
      "<div class='grow'><span class='grow__label'>حذف انیمیشن<small>برای حساسیت به حرکت</small></span>" +
        "<button class='switch' role='switch' aria-checked='" + (!s.motion ? "true" : "false") + "' data-toggle='motion-off' aria-label='حذف انیمیشن'></button></div>" +
      "<div class='grow'><span class='grow__label'>بازخورد لرزشی<small>هنگام افزودن به سفارش</small></span>" +
        "<button class='switch' role='switch' aria-checked='" + (s.haptics ? "true" : "false") + "' data-toggle='haptics' aria-label='لرزش'></button></div>" +
      "<div class='opt-row'><span>ارقام</span><div class='segmented'>" +
        "<button class='" + (s.digits === "fa" ? "is-active" : "") + "' data-digits='fa'>فارسی ۱۲۳</button>" +
        "<button class='" + (s.digits === "en" ? "is-active" : "") + "' data-digits='en'>English 123</button></div></div>" +
      "<div class='grow'><span class='grow__label'>امتیاز دوبرابر (رویداد شب)<small>فقط در نسخه‌ی دمو برای تست منطق وفاداری</small></span>" +
        "<button class='switch' role='switch' aria-checked='" + (s.doublePoints ? "true" : "false") + "' data-toggle='doublePoints' aria-label='امتیاز دوبرابر'></button></div>";
  }

  function wireSettings(root) {
    var rng = root.querySelector("[data-glass]");
    if (rng) {
      rng.addEventListener("input", function () {
        state.settings.glass = +rng.value;
        applySettings();
        var lbl = rng.closest(".opt-row").querySelector("span");
        if (lbl) lbl.innerHTML = "شدت شیشه — " + digits(state.settings.glass) + "% <span class='gfaint gtiny'>(محو و شفافیت منوهای شیشه‌ای)</span>";
      });
      rng.addEventListener("change", save);
    }
  }

  /* ================================================================ MENUS */
  function menuContent(which) {
    if (which === "cats") {
      return "<h6>منوی دسته‌بندی</h6><div class='gmenu__list'>" +
        "<button class='gmenu__item" + (state.cat === "all" ? " is-active" : "") + "' data-cat='all'>✨ همه‌ی منو<span class='k'>" + digits(D.items.length) + "</span></button>" +
        D.categories.map(function (c) {
          var n = D.items.filter(function (i) { return i.cat === c.id; }).length;
          return "<button class='gmenu__item" + (state.cat === c.id ? " is-active" : "") + "' data-cat='" + c.id + "'>" + c.icon + " " + c.name +
            "<span class='k'>" + digits(n) + "</span></button>";
        }).join("") +
        "<div class='gmenu__sep'></div>" +
        D.tiers.map(function (t) {
          return "<button class='gmenu__item' data-goto='loyalty'>" + t.icon + " سطح " + t.name + "<span class='k'>" + digits(t.need) + "</span></button>";
        }).join("") +
        "</div><p class='gmenu__hint'>دسته‌بندی‌ها همان‌جا که هستی عوض می‌شوند — منو شیشه‌ای، سریع، بدون ریلود.</p>";
    }

    if (which === "filters") {
      var maxP = 330000;
      return "<h6>فیلتر و مرتب‌سازی</h6>" +
        "<div class='opt-row'><span>رژیم و حساسیت</span><div class='opt-grid'>" +
          [["vegan", "🌱 گیاهی"], ["sugarfree", "🚫 بدون شکر"], ["decaf", "😴 بدون کافئین"], ["glutenfree", "🌾 بدون گلوتن"]].map(function (x) {
            return "<button class='opt" + (state.diet[x[0]] ? " is-on" : "") + "' data-diet='" + x[0] + "'>" + x[1] + "</button>";
          }).join("") + "</div></div>" +
        "<div class='grow'><span class='grow__label'>فقط علاقه‌مندی‌ها</span>" +
          "<button class='switch' role='switch' aria-checked='" + (state.onlyFav ? "true" : "false") + "' data-favonly='1'></button></div>" +
        "<div class='opt-row'><span>سقف قیمت — " + (state.maxPrice ? money(state.maxPrice) + " تومان" : "بدون سقف") + "</span>" +
          "<input type='range' min='0' max='" + maxP + "' step='5000' value='" + (state.maxPrice || 0) + "' data-price='1' aria-label='سقف قیمت'></div>" +
        "<h6>مرتب‌سازی</h6><div class='gmenu__list'>" +
          [["popular", "🔥 محبوب‌ترین"], ["price-asc", "💸 ارزان‌ترین"], ["price-desc", "💎 گران‌ترین"], ["rating", "⭐ بالاترین امتیاز"], ["fast", "⚡ سریع‌ترین آماده‌سازی"]].map(function (x) {
            return "<button class='gmenu__item" + (state.sort === x[0] ? " is-active" : "") + "' data-sort='" + x[0] + "'>" + x[1] + "</button>";
          }).join("") + "</div>" +
        "<div class='row' style='margin-top:10px'><button class='gbtn gbtn--glass gbtn--sm' data-clear='1'>پاک کردن فیلترها</button>" +
        "<span class='gmenu__hint' data-fcount></span></div>";
    }

    if (which === "advanced") {
      return "<h6>گزینه‌های پیشرفته</h6>" + settingsHtml() +
        "<div class='gmenu__sep'></div><h6>میان‌بر</h6><div class='gmenu__list'>" +
        "<button class='gmenu__item' data-goto='profile'>🪪 پروفایل و داده‌ی من</button>" +
        "<button class='gmenu__item' data-service-open='1'>🙋 درخواست از پیشخدمت</button>" +
        "<button class='gmenu__item' data-export='csv'>⬇ خروجی CSV سفارش‌ها</button>" +
        "<button class='gmenu__item' data-reset='1'>🗑 ریست داده‌ی دمو</button>" +
        "</div><p class='gmenu__hint'>تنظیمات فقط روی همین مرورگر ذخیره می‌شود.</p>";
    }

    if (which === "account") {
      var t = currentTier();
      return "<h6>حساب کاربری</h6>" +
        "<div class='gcard glass' style='padding:12px;border-radius:16px;box-shadow:none'>" +
          "<div class='grow-flex'><span class='gitem__thumb' style='width:40px;height:40px;font-size:1.1rem'>" + (state.joined ? t.icon : "👤") + "</span>" +
          "<div style='flex:1'><b>" + esc(state.joined ? state.name : "مشتری مهمان") + "</b>" +
          "<div class='gtiny gfaint'>" + (state.joined ? t.name + " · " + digits(state.points) + " امتیاز" : "عضویت = ۵۰ امتیاز هدیه") + "</div></div></div>" +
          (state.joined
            ? "<div class='opt-grid' style='margin-top:10px'><button class='opt' data-goto='loyalty'>⭐ امتیازها</button>" +
              "<button class='opt' data-goto='offers'>🎁 پیشنهاد</button><button class='opt' data-goto='orders'>🧾 سفارش‌ها</button></div>"
            : "<button class='gbtn gbtn--sm gbtn--block' data-join='1' style='margin-top:10px'>عضویت یک‌کلیکی</button>") +
        "</div>" +
        "<div class='gmenu__sep'></div><div class='gmenu__list'>" +
        "<button class='gmenu__item' data-menu='service'>🙋 سرویس میز<span class='k'>۸ گزینه</span></button>" +
        "<a class='gmenu__item' href='customer.html'>📱 نسخه‌ی دمو در ماکت موبایل</a>" +
        "<a class='gmenu__item' href='demo.html'>📊 دموی پنل کافه</a>" +
        "<a class='gmenu__item' href='index.html'>🏠 بازگشت به سایت<span class='k'>ESC</span></a>" +
        "</div>";
    }

    if (which === "service") {
      return "<h6>درخواست از میز " + digits(state.table || D.cafe.table) + "</h6><div class='gmenu__list'>" +
        D.service.map(function (s) {
          return "<button class='gmenu__item' data-service='" + s.id + "'>" + s.icon + " " + s.name + "<span class='k'>" + s.note + "</span></button>";
        }).join("") + "</div>" +
        "<div class='gmenu__sep'></div>" +
        "<div class='gmenu__list'>" +
        (state.orders.length
          ? state.orders.map(function (o) {
              return "<button class='gmenu__item' data-goto='orders'>⏱ سفارش #" + esc(o.code) + " · " + (o.status >= STEPS.length ? "آماده" : STEPS[o.status].t) + "</button>";
            }).join("")
          : "<button class='gmenu__item' data-goto='menu'>☕ هنوز سفارشی ثبت نشده — رفتن به منو</button>") +
        "</div>";
    }
    return "";
  }

  function renderMenuPanels(openWhich) {
    all(".gmenu").forEach(function (m) {
      var which = m.dataset.menu;
      var panel = m.querySelector(".gmenu__panel");
      var btn = m.querySelector(".gmenu__btn");
      var open = panel.classList.contains("is-open");
      if (open || which === openWhich) {
        panel.innerHTML = menuContent(which);
        var fcount = panel.querySelector("[data-fcount]");
        if (fcount) fcount.textContent = digits(filtered().length) + " نتیجه";
        var rng = panel.querySelector("[data-price]");
        if (rng) {
          rng.addEventListener("input", function () {
            state.maxPrice = +rng.value;
            renderMenu();
            renderCartBar();
            var lbl = rng.closest(".opt-row").querySelector("span");
            lbl.textContent = "سقف قیمت — " + (state.maxPrice ? money(state.maxPrice) + " تومان" : "بدون سقف");
            save();
          });
        }
        var gl = panel.querySelector("[data-glass]");
        if (gl) wireSettings(panel);
      }
      if (btn && which === "filters") btn.querySelector(".gmenu__count").textContent = digits(filtered().length);
    });
  }

  function closeMenus(except) {
    all(".gmenu").forEach(function (m) {
      if (m === except) return;
      var p = m.querySelector(".gmenu__panel");
      p.classList.remove("is-open");
      m.querySelector(".gmenu__btn").setAttribute("aria-expanded", "false");
    });
  }
  function toggleMenu(which) {
    var m = document.querySelector(".gmenu[data-menu='" + which + "']");
    if (!m) return;
    var p = m.querySelector(".gmenu__panel");
    var btn = m.querySelector(".gmenu__btn");
    var willOpen = !p.classList.contains("is-open");
    closeMenus(m);
    p.classList.toggle("is-open", willOpen);
    btn.setAttribute("aria-expanded", willOpen ? "true" : "false");
    if (willOpen) renderMenuPanels(which);
  }

  /* ================================================================ SHEETS */
  var sheetOpen = false;
  function openSheet(html) {
    var ov = byId("overlay");
    byId("sheet").innerHTML = html;
    ov.classList.add("is-open");
    sheetOpen = true;
    var first = byId("sheet").querySelector("button, input, select, [tabindex]");
    if (first) setTimeout(function () { first.focus(); }, 60);
  }
  function closeSheet() {
    byId("overlay").classList.remove("is-open");
    sheetOpen = false;
    byId("sheet").innerHTML = "";
  }

  /* item detail sheet with options */
  var draft = null;
  function summaryOf(o) {
    var bits = [];
    var sz = D.sizes.filter(function (s) { return s.id === o.size; })[0];
    if (sz) bits.push(sz.name);
    var mk = D.milks.filter(function (m) { return m.id === o.milk; })[0];
    if (mk) bits.push(mk.name);
    var su = D.sugars.filter(function (s) { return s.id === o.sugar; })[0];
    if (su) bits.push(su.name);
    var tp = D.temps.filter(function (t) { return t.id === o.temp; })[0];
    if (tp) bits.push(tp.name);
    (o.extras || []).forEach(function (x) {
      var e = D.extras.filter(function (y) { return y.id === x; })[0];
      if (e) bits.push(e.name);
    });
    return bits.join("، ");
  }

  function openItem(id) {
    var it = find(id);
    if (!it) return;
    draft = {
      id: id, qty: 1,
      opts: JSON.parse(JSON.stringify({
        size: state.defaults2.size, milk: state.defaults2.milk, sugar: state.defaults2.sugar,
        temp: state.defaults2.temp, extras: state.defaults2.extras.slice(), note: ""
      }))
    };
    /* food/cake items don't take milk/sugar */
    if (it.cat === "cake" || it.cat === "food") { draft.opts.milk = "none"; draft.opts.sugar = "0"; }
    renderSheetItem();
  }

  function renderSheetItem() {
    var it = draft && find(draft.id);
    if (!it) return;
    var drink = it.cat === "hot" || it.cat === "cold" || it.cat === "tea";
    var priceEach = linePrice({ id: it.id, qty: 1, opts: draft.opts });
    var isFav = state.favs.indexOf(it.id) >= 0;
    var html = "<span class='gsheet__grab'></span><div class='gsheet__head'>" +
      "<span class='gitem__thumb' style='width:62px;height:62px;font-size:1.9rem'>" + it.icon + "</span>" +
      "<div><h3>" + esc(it.fa) + " <span class='gfaint' style='font-size:.8rem;font-weight:600'>" + esc(it.name) + "</span></h3>" +
      "<p>" + esc(it.desc) + " · " + catName(it.cat) + "</p></div>" +
      "<button class='gsheet__x' data-x='1' aria-label='بستن'>✕</button></div>";

    html += "<div class='gitem__meta' style='margin-bottom:14px'>" +
      "<span class='gpill gpill--gold'>⭐ " + digits(it.rating.toFixed(1)) + "</span>" +
      "<span class='gpill'>🔥 " + digits(it.sold) + " فروش این ماه</span>" +
      it.tags.map(tagPill).join("") +
      (state.settings.advanced
        ? "<span class='gpill'>⏱ " + digits(it.prep) + " دقیقه</span><span class='gpill'>📈 " + digits(it.kcal) + " kcal</span>" +
          (it.caf ? "<span class='gpill'>⚡ " + digits(it.caf) + "mg کافئین</span>" : "")
        : "") + "</div>";

    if (drink) {
      html += "<div class='opt-row'><span>سایز</span><div class='opt-grid'>" + D.sizes.map(function (s) {
        return "<button class='opt" + (draft.opts.size === s.id ? " is-on" : "") + "' data-opt='size:" + s.id + "'>" + s.name +
          (s.delta ? "<small>" + (s.delta > 0 ? "+" : "−") + short(Math.abs(s.delta)) + "</small>" : "<small>قیمت پایه</small>") + "</button>";
      }).join("") + "</div></div>";
      html += "<div class='opt-row'><span>شیر</span><div class='opt-grid'>" + D.milks.map(function (m) {
        return "<button class='opt" + (draft.opts.milk === m.id ? " is-on" : "") + "' data-opt='milk:" + m.id + "'>" + m.name +
          (m.delta ? "<small>" + (m.delta > 0 ? "+" : "−") + short(Math.abs(m.delta)) + "</small>" : "") + "</button>";
      }).join("") + "</div></div>";
      html += "<div class='opt-row'><span>شکر</span><div class='opt-grid'>" + D.sugars.map(function (s) {
        return "<button class='opt" + (draft.opts.sugar === s.id ? " is-on" : "") + "' data-opt='sugar:" + s.id + "'>" + s.name + "</button>";
      }).join("") + "</div>";
      html += "<div class='opt-row'><span>دما</span><div class='opt-grid'>" + D.temps.map(function (t) {
        return "<button class='opt" + (draft.opts.temp === t.id ? " is-on" : "") + "' data-opt='temp:" + t.id + "'>" + t.name + "</button>";
      }).join("") + "</div>";
      html += "<div class='opt-row'><span>اضافه‌ها (extras)</span><div class='opt-grid'>" + D.extras.map(function (e) {
        var on = draft.opts.extras.indexOf(e.id) >= 0;
        return "<button class='opt" + (on ? " is-on" : "") + "' data-ex='" + e.id + "'>＋ " + e.name +
          (e.price ? "<small>+" + short(e.price) + "</small>" : "<small>رایگان</small>") + "</button>";
      }).join("") + "</div></div>";
    }

    html += "<div class='opt-row'><span>یادداشت برای بار (اختیاری)</span>" +
      "<input class='ginput' id='noteField' placeholder='مثلاً: کم‌یخ، فوم محکم، لیوان من' value='" + esc(draft.opts.note || "") + "'></div>";

    html += "<div class='grow-flex grow-flex--between' style='margin-top:6px'>" +
      "<div class='gitem__qty'><button data-dqty='-1' aria-label='کم'>−</button><b>" + digits(draft.qty) + "</b><button data-dqty='1' aria-label='زیاد'>+</button></div>" +
      "<div style='text-align:end'><span class='gitem__price' style='font-size:1.15rem'>" + money(priceEach * draft.qty) + "</span>" +
      "<div class='gtiny gfaint'>تومان · " + digits(draft.qty) + " عدد</div></div></div>";

    if (state.settings.advanced) {
      var savedFor = state.history.reduce(function (n, o) {
        return n + o.items.filter(function (l) { return l.id === it.id; }).length;
      }, 0);
      if (savedFor) html += "<div class='gnote' style='margin-top:12px'>تا حالا <b>" + digits(savedFor) + "</b> بار همین را سفارش داده‌ای — برای «بدون شکر» عجله نکنیم؟ 😌</div>";
    }

    html += "<div class='grow-flex' style='margin-top:16px'>" +
      "<button class='gbtn' style='flex:1' data-dadd='1'>افزودن به سفارش · " + money(priceEach * draft.qty) + "</button>" +
      "<button class='gbtn gbtn--glass' data-fav='" + it.id + "'>" + (isFav ? "♥" : "♡") + "</button>" +
      "<button class='gbtn gbtn--glass' data-def-save='1' title='این گزینه‌ها پیش‌فرض همه‌ی سفارش‌های بعدی شود'>📌 پیش‌فرض کن</button>" +
      "</div>" +
      "<p class='gtiny gfaint' style='margin-top:10px'>ثبت سفارش در این نسخه نمایشی است؛ پولی رد و بدل نمی‌شود.</p>";

    openSheet(html);
    var note = byId("noteField");
    if (note) note.addEventListener("input", function () { draft.opts.note = note.value; });
  }

  /* cart / checkout sheet */
  function openCart() {
    if (!cartCount()) { toast("سبد خالی است — اول از منو اضافه کن"); return; }
    var lines = cartLines();
    var disc = cartDiscount();
    var html = "<span class='gsheet__grab'></span><div class='gsheet__head'>" +
      "<div><h3>🧺 سبد و ثبت سفارش</h3><p>میز " + digits(state.table || D.cafe.table) + " · " + D.cafe.name + " · " + digits(lines.length) + " خط</p></div>" +
      "<button class='gsheet__x' data-x='1' aria-label='بستن'>✕</button></div>";

    html += "<div class='gstack'>" + lines.map(function (l) {
      var it = find(l.id) || { fa: l.name, icon: "🍽" };
      var key = sig(l);
      return "<div class='gcard glass' style='padding:12px;border-radius:18px;box-shadow:none'>" +
        "<div class='grow-flex' style='align-items:center'><span style='font-size:1.4rem'>" + it.icon + "</span>" +
        "<div style='flex:1;min-width:0'><b>" + esc(it.fa) + "</b>" +
        "<div class='gtiny gfaint'>" + esc(l.summary || "") + "</div></div>" +
        "<div style='text-align:end'><b class='gmono'>" + money(linePrice(l) * l.qty) + "</b></div></div>" +
        "<div class='grow-flex grow-flex--between' style='margin-top:8px'>" +
        "<div class='gitem__qty'><button data-qty='" + key + ":-1'>−</button><b>" + digits(l.qty) + "</b><button data-qty='" + key + ":1'>+</button></div>" +
        "<button class='gbtn gbtn--danger gbtn--sm' data-qty='" + key + ":-99'>حذف</button></div></div>";
    }).join("") + "</div>";

    /* coupon + tip + schedule */
    html += "<div class='opt-row' style='margin-top:16px'><span>کد تخفیف (از پیشنهاد شخصی)</span>" +
      (state.coupons.length
        ? "<div class='opt-grid'>" +
          "<button class='opt" + (!state.coupon ? " is-on" : "") + "' data-coupon=''>بدون کد</button>" +
          state.coupons.map(function (c) {
            return "<button class='opt" + (state.coupon === c.id ? " is-on" : "") + "' data-coupon='" + c.id + "'>" + esc(c.code) + " · " + digits(c.off) + "٪</button>";
          }).join("") + "</div>"
        : "<div class='gnote'>کدی نداری. از تب «پیشنهاد» یکی را فعال کن تا همین‌جا اعمال شود.</div>") +
      "</div>";

    if (state.settings.advanced) {
      html += "<div class='opt-row'><span>تیپ به تیم (پیشرفته)</span><div class='opt-grid'>" +
        [0, 5, 10, 15].map(function (p) {
          var v = Math.round(cartSubtotal() * p / 100);
          return "<button class='opt" + ((state.tip || 0) === v ? " is-on" : "") + "' data-tip='" + v + "'>" +
            (p === 0 ? "بدون تیپ" : digits(p) + "٪ · " + short(v)) + "</button>";
        }).join("") + "</div></div>" +
        "<div class='opt-row'><span>زمان سرو</span><div class='opt-grid'>" +
        [["now", "همین حالا"], ["15", "۱۵ دقیقه بعد"], ["30", "۳۰ دقیقه بعد"], ["pre", "قبل از خروج"]].map(function (x) {
          return "<button class='opt" + (state.when === x[0] || (!state.when && x[0] === "now") ? " is-on" : "") + "' data-when='" + x[0] + "'>" + x[1] + "</button>";
        }).join("") + "</div></div>";
    }

    var pts = pointsFor(cartSubtotal() - disc.amount);
    html += "<div class='gcard glass' style='margin-top:14px;padding:14px;box-shadow:none'>" +
      "<div class='gsub'>" +
      "<div class='gsub__row'><span>جمع سفارش</span><b>" + money(cartSubtotal()) + "</b></div>" +
      (disc.amount ? "<div class='gsub__row'><span>تخفیف " + esc(disc.coupon ? disc.coupon.code : "") + "</span><b style='color:var(--g-mint)'>-" + money(disc.amount) + "</b></div>" : "") +
      (state.tip ? "<div class='gsub__row'><span>تیپ</span><b>" + money(state.tip) + "</b></div>" : "") +
      "<div class='gsub__row'><span><b>قابل پرداخت</b></span><b style='color:var(--g-accent)'>" + money(cartTotal()) + "</b></div>" +
      (state.joined
        ? "<div class='gsub__row'><span>امتیاز این سفارش</span><b>+" + digits(pts) + (state.settings.doublePoints ? " (دوبرابر)" : "") + "</b></div>" +
          "<div class='gsub__row'><span>ضریب سطح " + currentTier().name + "</span><b>" + digits(pointsMultiplier()) + "×</b></div>"
        : "<div class='gsub__row'><span>امتیاز</span><b style='color:var(--g-berry)'>۰ — عضو نیستی</b></div>") +
      "</div></div>";

    html += "<div class='grow-flex' style='margin-top:14px'>" +
      "<button class='gbtn' style='flex:1' data-place='1'>ثبت سفارش برای میز " + digits(state.table || D.cafe.table) + "</button>" +
      (state.joined ? "" : "<button class='gbtn gbtn--glass' data-join='1'>عضویت و گرفتن " + digits(pts) + " امتیاز</button>") +
      "</div>" +
      "<p class='gtiny gfaint center' style='margin-top:10px'>پرداخت در میز انجام می‌شود (نسخه‌ی MVP بدون درگاه پرداخت).</p>";

    openSheet(html);
  }

  function openJoin() {
    var html = "<span class='gsheet__grab'></span><div class='gsheet__head'>" +
      "<div><h3>🪪 عضویت یک‌کلیکی</h3><p>بدون اپ، بدون رمز. فقط شماره‌ای که کافه با آن تو را می‌شناسد.</p></div>" +
      "<button class='gsheet__x' data-x='1' aria-label='بستن'>✕</button></div>" +
      "<div class='gfield'><label for='joinName'>نام (همین‌طور که صدا می‌زنی)</label>" +
      "<input class='ginput' id='joinName' value='" + esc(state.name) + "' placeholder='مثلاً امیر'></div>" +
      "<div class='gfield' style='margin-top:12px'><label for='joinPhone'>شماره موبایل</label>" +
      "<input class='ginput' id='joinPhone' inputmode='numeric' placeholder='0912…' value='" + esc(state.phone) + "'></div>" +
      "<div class='grow' style='margin-top:12px'><span class='grow__label'>۵۰ امتیاز خوش‌آمد + ۱۵٪ امتیاز همین سفارش</span>" +
      "<span class='gpill gpill--gold'>+50 ⭐</span></div>" +
      "<div class='grow' style='margin-top:6px'><span class='grow__label'>اجازه‌ی پیامک یادآوری در لحظه‌ی ریزش<small>هر زمان قابل لغو است — تب «پیشنهاد».</small></span>" +
      "<button class='switch' role='switch' aria-checked='" + (state.notify ? "true" : "false") + "' data-notify='1'></button></div>" +
      "<button class='gbtn gbtn--block' data-do-join='1' style='margin-top:16px'>ساخت پروفایل و ورود به CafeLoop</button>" +
      "<p class='gtiny gfaint center' style='margin-top:10px'>در این دمو شماره جایی نمی‌رود؛ همه‌چیز در همین مرورگر می‌ماند.</p>";
    openSheet(html);
  }

  function openService() {
    var html = "<span class='gsheet__grab'></span><div class='gsheet__head'>" +
      "<div><h3>🙋 درخواست از میز " + digits(state.table || D.cafe.table) + "</h3><p>مستقیم روی تبلت پیشخدمت؛ بدون داد زدن.</p></div>" +
      "<button class='gsheet__x' data-x='1' aria-label='بستن'>✕</button></div>" +
      "<div class='ggrid ggrid-2'>" + D.service.map(function (s) {
        return "<button class='gcard glass' data-service='" + s.id + "' style='cursor:pointer;color:inherit;font:inherit;text-align:start'>" +
          "<b>" + s.icon + " " + s.name + "</b><div class='gtiny gfaint'>" + s.note + "</div></button>";
      }).join("") + "</div>" +
      (state.serviceLog.length
        ? "<div class='gsub' style='margin-top:14px'>" + state.serviceLog.slice(0, 4).map(function (l) {
            var s = D.service.filter(function (x) { return x.id === l.id; })[0] || { name: l.id, icon: "•" };
            return "<div class='gsub__row'><span>" + s.icon + "</span><div>" + esc(s.name) + "</div><b>" + hhmm(l.at) + "</b></div>";
          }).join("") + "</div>"
        : "");
    openSheet(html);
  }

  /* ================================================================ ACTIONS */
  function addToCart(id, opts) {
    var it = find(id);
    if (!it) return;
    var o = opts || {
      size: state.defaults2.size, milk: it.cat === "cake" || it.cat === "food" ? "none" : state.defaults2.milk,
      sugar: it.cat === "cake" || it.cat === "food" ? "0" : state.defaults2.sugar,
      temp: state.defaults2.temp, extras: [], note: ""
    };
    var line = { id: id, name: it.fa, qty: 1, opts: o, summary: summaryOf(o) };
    var k = sig(line);
    if (state.cart[k]) state.cart[k].qty += 1; else state.cart[k] = line;
    buzz(14);
  }
  function addDraft() {
    var line = { id: draft.id, name: (find(draft.id) || {}).fa, qty: draft.qty, opts: draft.opts, summary: summaryOf(draft.opts) + (draft.opts.note ? " · " + draft.opts.note : "") };
    var k = sig(line);
    if (state.cart[k]) state.cart[k].qty += draft.qty; else state.cart[k] = line;
    draft = null;
    closeSheet();
    render();
    toast("به سفارش اضافه شد ✚");
  }
  function placeOrder() {
    var sub = cartSubtotal();
    var disc = cartDiscount();
    var pts = state.joined ? pointsFor(sub - disc.amount) : 0;
    var maxPrep = Math.max.apply(null, cartLines().map(function (l) { return (find(l.id) || { prep: 5 }).prep; }));
    var o = {
      id: "o" + now(),
      code: digits(1000 + Math.floor(Math.random() * 8999)),
      table: state.table || D.cafe.table,
      items: cartLines(),
      subtotal: sub,
      discount: disc.amount,
      tip: state.tip || 0,
      coupon: disc.coupon ? disc.coupon.code : "",
      couponId: disc.coupon ? disc.coupon.id : "",
      total: cartTotal(),
      points: pts,
      when: state.when || "now",
      status: 0,
      placedAt: now(),
      eta: now() + 6000,
      step2At: now() + 6000,
      step3At: now() + 6000 + maxPrep * 1400,
      rating: 0
    };
    state.orders.push(o);
    state.cart = {};
    state.tip = 0;
    state.when = "now";
    if (disc.coupon) {
      state.coupons = state.coupons.filter(function (c) { return c.id !== o.couponId; });
      state.claimed = state.claimed; /* کد مصرف شد */
    }
    if (state.joined) {
      state.points += pts;
      state.ledger.unshift({ label: "سفارش #" + o.code, delta: pts, at: now() });
      state.visits += 1;
      state.spend += o.total;
    }
    closeSheet();
    state.view = "orders";
    render();
    toast("سفارش #" + o.code + " ثبت شد" + (pts ? " · +" + digits(pts) + " امتیاز" : " · با عضویت امتیاز می‌گرفتی"));
  }
  function deliverOrder(o) {
    o.doneAt = now();
    o.status = STEPS.length;
    state.orders = state.orders.filter(function (x) { return x.id !== o.id; });
    state.history.unshift(o);
    render();
    toast("تحویل شد ✓ — حالا به سفارش امتیاز بده تا سلیقه‌ات دقیق‌تر شود");
  }

  /* order status ticking */
  function tick() {
    var changed = false;
    state.orders.forEach(function (o) {
      var next = o.status;
      if (o.status === 0 && now() >= o.step2At) next = 1;
      if (o.status < 2 && now() >= o.step3At) next = 2;
      if (next !== o.status) {
        o.status = next;
        changed = true;
        buzz(20);
        toast("سفارش #" + o.code + ": " + STEPS[next].t);
      }
      o.eta = o.status === 0 ? o.step2At : o.status === 1 ? o.step3At : o.eta;
    });

    if (changed) { renderDockBadges(); renderCartBar(); if (state.view === "orders") renderOrders(); }
    else if (state.view === "orders" && state.orders.length) {
      /* فقط برچسب زمان را عوض می‌کنیم تا صفحه ری‌رندر نشود */
      all("[data-order]").forEach(function (el) {
        var o = state.orders.filter(function (x) { return x.id === el.dataset.order; })[0];
        if (!o) return;
        var live = el.querySelector(".gtrack__step.is-now span:last-child");
        if (live) live.textContent = STEPS[o.status].d + " · " + etaText(o);
        var foot = el.querySelector("[data-eta]");
        if (foot) foot.textContent = "زمان باقی‌مانده: " + etaText(o);
      });
    }
    renderBarMeta();
  }

  /* ------------------------------------------------------------ data tools */
  function exportData(kind) {
    var payload = {
      exportedAt: new Date().toISOString(),
      customer: { name: state.name, joined: state.joined, points: state.points, visits: state.visits },
      orders: state.history.map(function (o) {
        return {
          code: o.code, table: o.table, when: new Date(o.placedAt).toISOString(),
          total: o.total, points: o.points, rating: o.rating || "",
          items: o.items.map(function (l) { return l.name + " ×" + l.qty + (l.summary ? " (" + l.summary + ")" : ""); })
        };
      })
    };
    if (kind === "json") {
      download("cafeloop-" + state.name + ".json", JSON.stringify(payload, null, 2), "application/json");
      return;
    }
    var rows = [["code", "table", "date", "time", "items", "subtotal", "discount", "tip", "total", "points", "rating"]];
    state.history.forEach(function (o) {
      rows.push([o.code, o.table, faDate(o.placedAt), hhmm(o.placedAt),
        o.items.map(function (l) { return l.name + " x" + l.qty; }).join(" | "),
        o.subtotal, o.discount || 0, o.tip || 0, o.total, o.points, o.rating || ""]);
    });
    download("cafeloop-orders.csv", "\uFEFF" + rows.map(function (r) {
      return r.map(function (c) { return '"' + String(c).replace(/"/g, '""') + '"'; }).join(",");
    }).join("\n"), "text/csv");
  }
  function download(name, text, type) {
    var a = document.createElement("a");
    var ok = false;
    try {
      if (window.Blob && window.URL && URL.createObjectURL) {
        a.href = URL.createObjectURL(new Blob([text], { type: type + ";charset=utf-8" }));
        ok = true;
      }
    } catch (e) { ok = false; }
    if (!ok) a.href = "data:" + type + ";charset=utf-8," + encodeURIComponent(text);
    a.download = name;
    a.rel = "noopener";
    document.body.appendChild(a);
    try { a.click(); } catch (e) {}
    setTimeout(function () { if (a.remove) a.remove(); }, 400);
    toast("فایل " + name + " ساخته شد (داده‌ی محلی همین مرورگر)");
  }
  function resetAll() {
    state = JSON.parse(JSON.stringify(defaults));
    try { localStorage.removeItem(KEY); } catch (e) {}
    state.view = "menu";
    render();
    renderMenuPanels();
    toast("داده‌ی دمو پاک شد — از صفر شروع کن");
  }

  /* --------------------------------------------------------------- drawing */
  function ctx2d(canvas) {
    /* در محیط‌هایی که canvas پشتیبانی نمی‌شود (یا jsdom) بی‌سروصدا رد می‌شویم */
    if (!canvas || !canvas.getContext) return null;
    try { return canvas.getContext("2d") || null; } catch (e) { return null; }
  }

  function drawSpark() {
    var c = byId("sparkCanvas");
    var ctx = ctx2d(c);
    if (!ctx) return;
    var dpr = window.devicePixelRatio || 1;
    var w = c.clientWidth || 600, h = c.clientHeight || 96;
    c.width = w * dpr; c.height = h * dpr;
    ctx = ctx2d(c) || ctx;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    var vals = D.seed.spendTrend.slice();
    state.history.forEach(function (o) { vals.push(Math.round(o.total / 1000)); });
    vals = vals.slice(-10);
    var max = Math.max.apply(null, vals) || 1;
    var stepX = w / (vals.length - 1 || 1);

    var grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "rgba(224,177,105,.45)");
    grad.addColorStop(1, "rgba(224,177,105,0)");

    ctx.beginPath();
    vals.forEach(function (v, i) {
      var x = i * stepX, y = h - 8 - (v / max) * (h - 22);
      if (!i) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = "#e0b169";
    ctx.lineWidth = 2.5;
    ctx.lineJoin = "round";
    ctx.stroke();
    ctx.lineTo((vals.length - 1) * stepX, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    vals.forEach(function (v, i) {
      var x = i * stepX, y = h - 8 - (v / max) * (h - 22);
      ctx.beginPath();
      ctx.arc(x, y, i === vals.length - 1 ? 4 : 2.6, 0, Math.PI * 2);
      ctx.fillStyle = i === vals.length - 1 ? "#f0c684" : "rgba(240,198,132,.6)";
      ctx.fill();
    });
  }

  function drawQr() {
    var c = byId("qrCanvas");
    var ctx = ctx2d(c);
    if (!ctx) return;
    var size = 25, cell = c.width / size, seed = 20261002 + (state.table || D.cafe.table);
    function rnd() { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; }
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height);
    ctx.fillStyle = "#150d0a";
    for (var y = 0; y < size; y++) {
      for (var x = 0; x < size; x++) {
        if ((x < 8 && y < 8) || (x > size - 9 && y < 8) || (x < 8 && y > size - 9)) continue;
        if (rnd() > 0.52) ctx.fillRect(x * cell, y * cell, cell - 0.6, cell - 0.6);
      }
    }
    [[0, 0], [size - 7, 0], [0, size - 7]].forEach(function (p) {
      ctx.fillStyle = "#150d0a"; ctx.fillRect(p[0] * cell, p[1] * cell, 7 * cell, 7 * cell);
      ctx.fillStyle = "#fff"; ctx.fillRect((p[0] + 1) * cell, (p[1] + 1) * cell, 5 * cell, 5 * cell);
      ctx.fillStyle = "#150d0a"; ctx.fillRect((p[0] + 2) * cell, (p[1] + 2) * cell, 3 * cell, 3 * cell);
    });
  }

  /* ================================================================ EVENTS */
  function onClick(e) {
    var src = e.target && e.target.nodeType === 1 ? e.target : (e.target && e.target.parentElement);
    if (!src || !src.closest) return;
    var t = src.closest("[data-open],[data-opencart],[data-clearcart],[data-add],[data-inc],[data-dec],[data-fav],[data-cat],[data-goto],[data-view],[data-opt],[data-ex],[data-dqty],[data-dadd],[data-def-save],[data-x],[data-clear],[data-sort],[data-diet],[data-favonly],[data-toggle],[data-theme-set],[data-digits],[data-join],[data-do-join],[data-claim],[data-copy],[data-coupon],[data-tip],[data-when],[data-place],[data-deliver],[data-cancel],[data-reorder],[data-rate-set],[data-service],[data-service-open],[data-redeem],[data-menu],[data-export],[data-reset],[data-qty],[data-defmilk],[data-defsize],[data-notify],[data-closemenu]");
    if (!t) return;
    var d = t.dataset;

    function stop() { e.preventDefault(); }

    /* dock + navigation */
    if (d.view) { stop(); state.view = d.view; render(); closeMenus(); window.scrollTo({ top: 0, behavior: state.settings.motion ? "smooth" : "auto" }); return; }
    if (d.goto) { stop(); state.view = d.goto; render(); closeMenus(); closeSheet(); return; }

    /* glass menus */
    if (d.menu) { stop(); toggleMenu(d.menu); return; }
    if (d.serviceOpen) { stop(); closeMenus(); openService(); return; }
    if (d.closemenu) { stop(); closeMenus(); return; }

    /* categories / filters */
    if (d.cat) { stop(); state.cat = d.cat; state.view = "menu"; render(); closeMenus(); renderMenuPanels("filters"); return; }
    if (d.sort) { stop(); state.sort = d.sort; renderMenu(); closeMenus(); return; }
    if (d.diet) { stop(); state.diet[d.diet] = !state.diet[d.diet]; renderMenu(); renderMenuPanels("filters"); return; }
    if (d.favonly) { stop(); state.onlyFav = !state.onlyFav; renderMenu(); renderMenuPanels("filters"); return; }
    if (d.clear) {
      stop();
      state.cat = "all"; state.q = ""; state.diet = { vegan: false, sugarfree: false, decaf: false, glutenfree: false };
      state.onlyFav = false; state.maxPrice = 0; state.sort = "popular";
      var si = byId("searchField"); if (si) si.value = "";
      render(); closeMenus(); return;
    }

    /* settings */
    if (d.themeSet) { stop(); state.settings.theme = d.themeSet; applySettings(); renderMenuPanels("advanced"); save(); return; }
    if (d.digits) { stop(); state.settings.digits = d.digits; render(); renderMenuPanels("advanced"); return; }
    if (d.toggle) {
      stop();
      var k = d.toggle;
      if (k === "motion-off") state.settings.motion = !state.settings.motion;
      else state.settings[k] = !state.settings[k];
      applySettings(); render(); renderMenuPanels("advanced"); renderMenuPanels("filters");
      return;
    }

    /* favourites */
    if (d.fav) {
      stop();
      var fid = d.fav;
      var i = state.favs.indexOf(fid);
      if (i >= 0) state.favs.splice(i, 1); else state.favs.push(fid);
      if (sheetOpen) { renderSheetItem(); save(); } else render();
      toast(i >= 0 ? "از علاقه‌مندی‌ها حذف شد" : "به علاقه‌مندی‌ها اضافه شد ♥");
      return;
    }

    /* menu items */
    if (d.open) { stop(); openItem(d.open); return; }
    if (d.opencart) { stop(); openCart(); return; }
    if (d.clearcart) {
      stop();
      state.cart = {}; state.tip = 0; state.coupon = null;
      closeSheet(); render();
      toast("سبد خالی شد");
      return;
    }
    if (d.add) { stop(); addToCart(d.add); render(); toast("به سفارش اضافه شد: " + (find(d.add) || {}).fa); return; }
    if (d.inc) { stop(); incByItem(d.inc, 1); return; }
    if (d.dec) { stop(); incByItem(d.dec, -1); return; }

    /* sheet: item options */
    if (d.opt) {
      stop();
      var parts = d.opt.split(":");
      draft.opts[parts[0]] = parts[1];
      renderSheetItem();
      return;
    }
    if (d.ex) {
      stop();
      var arr = draft.opts.extras;
      var idx = arr.indexOf(d.ex);
      if (idx >= 0) arr.splice(idx, 1); else arr.push(d.ex);
      renderSheetItem();
      return;
    }
    if (d.dqty) { stop(); draft.qty = clamp(draft.qty + (+d.dqty), 1, 20); renderSheetItem(); return; }
    if (d.dadd) { stop(); addDraft(); return; }
    if (d.defSave) {
      stop();
      state.defaults2.size = draft.opts.size;
      state.defaults2.milk = draft.opts.milk;
      state.defaults2.sugar = draft.opts.sugar;
      state.defaults2.temp = draft.opts.temp;
      state.defaults2.extras = draft.opts.extras.slice();
      save();
      toast("این گزینه‌ها پیش‌فرض سفارش‌های بعدی شد 📌");
      return;
    }
    if (d.defmilk) { stop(); state.defaults2.milk = d.defmilk; render(); return; }
    if (d.defsize) { stop(); state.defaults2.size = d.defsize; render(); return; }
    if (d.x) { stop(); closeSheet(); return; }

    /* cart sheet */
    if (d.qty) {
      stop();
      var q = d.qty.split(":");
      var line = state.cart[q[0]];
      if (line) {
        var delta = +q[1] === -99 ? -999 : +q[1];
        line.qty += delta;
        if (line.qty <= 0) delete state.cart[q[0]];
      }
      render();
      if (cartCount()) openCart(); else closeSheet();
      return;
    }
    if (d.coupon !== undefined && t.closest(".gsheet")) {
      stop();
      state.coupon = d.coupon || null;
      openCart(); render();
      return;
    }
    if (d.tip !== undefined && t.closest(".gsheet")) { stop(); state.tip = +d.tip; openCart(); render(); return; }
    if (d.when !== undefined && t.closest(".gsheet")) { stop(); state.when = d.when; openCart(); render(); return; }
    if (d.place) { stop(); placeOrder(); return; }

    /* orders */
    if (d.deliver) {
      stop();
      var o = state.orders.filter(function (x) { return x.id === d.deliver; })[0];
      if (o) deliverOrder(o);
      return;
    }
    if (d.cancel) {
      stop();
      var oc = state.orders.filter(function (x) { return x.id === d.cancel; })[0];
      state.orders = state.orders.filter(function (x) { return x.id !== d.cancel; });
      if (oc) {
        /* آیتم‌ها به سبد برمی‌گردند تا سفارش از دست نرود */
        oc.items.forEach(function (l) {
          var kk = sig(l);
          if (state.cart[kk]) state.cart[kk].qty += l.qty; else state.cart[kk] = l;
        });
      }
      render();
      toast(oc ? "سفارش #" + oc.code + " لغو شد — آیتم‌ها به سبد برگشت" : "سفارش لغو شد");
      return;
    }
    if (d.reorder) {
      stop();
      var oh = state.history.filter(function (x) { return x.id === d.reorder; })[0];
      if (oh) {
        oh.items.forEach(function (l) { var kk = sig(l); if (state.cart[kk]) state.cart[kk].qty += l.qty; else state.cart[kk] = l; });
        state.view = "menu";
        render();
        toast("سفارش قبلی به سبد اضافه شد ↻");
      }
      return;
    }
    if (d.rateSet) {
      stop();
      var rp = d.rateSet.split(":");
      var or = state.history.filter(function (x) { return x.id === rp[0]; })[0];
      if (or) { or.rating = +rp[1]; render(); toast("ممنون! " + digits(or.rating) + " ستاره — کافه این را در گزارش کیفیت می‌بیند"); }
      return;
    }
    if (d.service) {
      stop();
      var sv = d.service;
      var last = state.serviceLog.filter(function (x) { return x.id === sv; })[0];
      if (last && now() - last.at < 20000) { toast("این درخواست " + digits(Math.ceil((20000 - (now() - last.at)) / 1000)) + " ثانیه پیش ثبت شد — صبر کن 🙂"); return; }
      state.serviceLog.unshift({ id: sv, at: now() });
      buzz(18);
      var sName = (D.service.filter(function (x) { return x.id === sv; })[0] || {}).name;
      render(); renderMenuPanels("service"); if (sheetOpen) openService();
      toast("درخواست ارسال شد: " + sName + " — پیشخدمت اطلاع دارد");
      return;
    }

    /* loyalty */
    if (d.redeem) {
      stop();
      var r = D.rewards.filter(function (x) { return x.id === d.redeem; })[0];
      if (r && state.points >= r.cost) {
        state.points -= r.cost;
        state.ledger.unshift({ label: "پاداش: " + r.name, delta: -r.cost, at: now() });
        state.redeemed.push(r.id);
        var code = "NOIR-RW-" + r.id.slice(0, 3).toUpperCase() + "-" + (100 + Math.floor(Math.random() * 899));
        var isPct = r.id === "ten";
        state.coupons.push({ id: "rw" + now(), code: code, off: isPct ? 10 : 0, kind: isPct ? "percent" : "gift", title: r.name });
        render();
        toast("🎁 پاداش فعال شد: " + r.name + " — کد " + code);
      }
      return;
    }

    /* offers */
    if (d.claim) {
      stop();
      var of = D.offers.filter(function (x) { return x.id === d.claim; })[0];
      if (of) {
        state.claimed.push(of.id);
        state.coupons.push({ id: of.id + "-" + now(), code: of.code, off: of.off, kind: of.kind, title: of.title });
        state.ledger.unshift({ label: "فعال کردن آفر " + of.code, delta: 5, at: now() });
        state.points += 5;
        render();
        toast("آفر فعال شد · " + of.code + " — در سبد اعمال می‌شود");
      }
      return;
    }
    if (d.notify !== undefined && (t.classList.contains("switch") || t.dataset.notify)) {
      stop();
      state.notify = !state.notify;
      render(); renderMenuPanels("account");
      toast(state.notify ? "یادآوری روشن شد — فقط در لحظه‌ی ریزش پیام می‌دهی" : "یادآوری خاموش شد");
      return;
    }
    if (d.copy) {
      stop();
      var txt = d.copy;
      if (navigator.clipboard) navigator.clipboard.writeText(txt).then(function () { toast("کپی شد: " + txt); }, function () { toast(txt); });
      else toast(txt);
      return;
    }

    /* account / join */
    if (d.join) { stop(); closeMenus(); openJoin(); return; }
    if (d.doJoin) {
      stop();
      var nm = byId("joinName"), ph = byId("joinPhone");
      var phone = (ph && ph.value ? ph.value : "").replace(/[۰-۹]/g, function (ch) { return String(FA_DIGITS.indexOf(ch)); });
      if (phone.replace(/\D/g, "").length < 10) {
        ph && ph.focus();
        toast("یک شماره ۱۱ رقمی وارد کن (در دمو فقط برای شکل کار است)");
        return;
      }
      state.joined = true;
      state.name = (nm && nm.value.trim()) || D.seed.name;
      state.phone = phone;
      state.points += 50;
      state.ledger.unshift({ label: "هدیه‌ی عضویت", delta: 50, at: now() });
      closeSheet();
      render();
      toast("خوش آمدی " + state.name + " 🎉 ۵۰ امتیاز گرفتی");
      return;
    }

    /* misc */
    if (d.export) { stop(); exportData(d.export); return; }
    if (d.reset) { stop(); resetAll(); return; }
  }

  function incByItem(id, delta) {
    /* اگر همان آیتم با گزینه‌های مختلف چند خط داشت، روی اولین خط اثر می‌گذارد */
    var key = Object.keys(state.cart).filter(function (k) { return state.cart[k].id === id; })[0];
    if (!key) { if (delta > 0) addToCart(id); render(); return; }
    var l = state.cart[key];
    l.qty += delta;
    if (l.qty <= 0) delete state.cart[key];
    render();
    if (sheetOpen) openCart();
  }

  /* -------------------------------------------------------------- keyboard */
  function onKey(e) {
    if (e.key === "Escape") {
      if (sheetOpen) { closeSheet(); return; }
      closeMenus();
      return;
    }
    if (e.key === "Enter" || e.key === " ") {
      var t = document.activeElement;
      if (t && t.dataset && t.dataset.open) { e.preventDefault(); openItem(t.dataset.open); }
      return;
    }
    var map = { "1": "menu", "2": "orders", "3": "loyalty", "4": "offers", "5": "profile" };
    if (map[e.key] && !/INPUT|TEXTAREA|SELECT/.test((document.activeElement || {}).tagName || "")) {
      state.view = map[e.key];
      render();
    }
  }

  /* ------------------------------------------------------------------ init */
  document.addEventListener("DOMContentLoaded", function () {
    load();

    /* deep link: ?table=12  #menu */
    var qs = new URLSearchParams(location.search);
    var qTable = parseInt(qs.get("table") || qs.get("t") || "", 10);
    if (qTable) state.table = clamp(qTable, 1, 60);
    var hash = (location.hash || "").replace("#", "");
    var views = ["menu", "orders", "loyalty", "offers", "profile"];
    if (views.indexOf(hash) >= 0) state.view = hash;
    var priceMax = parseInt(qs.get("max") || "", 10);
    if (priceMax) state.maxPrice = priceMax;

    /* top bar: build glass menus */
    buildBar();

    /* search */
    var search = byId("searchField");
    search.addEventListener("input", function () { state.q = search.value; renderMenu(); });
    search.addEventListener("search", function () { state.q = search.value; renderMenu(); });

    var reset = byId("searchClear");
    if (reset) reset.addEventListener("click", function () { search.value = ""; state.q = ""; renderMenu(); search.focus(); });

    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", function (e) {
      if (!e.target.closest(".gmenu")) closeMenus();
    });
    byId("overlay").addEventListener("click", function (e) { if (e.target === byId("overlay")) closeSheet(); });
    window.addEventListener("resize", function () { if (state.view === "loyalty") drawSpark(); if (state.view === "profile") drawQr(); });

    applySettings();
    render();
    setInterval(tick, 1000);
    setInterval(function () { renderBarMeta(); }, 30000);

    /* first-visit: QR landing sheet */
    if (!state.seen) {
      state.seen = true;
      save();
      setTimeout(function () {
        openSheet("<span class='gsheet__grab'></span>" +
          "<div class='gsheet__head'><span class='gitem__thumb' style='width:56px;height:56px;font-size:1.7rem'>📱</span>" +
          "<div><h3>QR اسکن شد — خوش آمدی</h3><p>میز " + digits(state.table || D.cafe.table) + " · " + D.cafe.name + " · " + D.cafe.city + "</p>" +
          "<button class='gsheet__x' data-x='1' aria-label='بستن'>✕</button></div></div>" +
          "<div class='gsub'>" +
          "<div class='gsub__row'><span>🕗 ساعت کاری</span><b>" + D.cafe.open + "</b></div>" +
          "<div class='gsub__row'><span>⏱ میانگین آماده‌سازی</span><b>" + digits(D.cafe.wait) + " دقیقه</b></div>" +
          "<div class='gsub__row'><span>📶 وای‌فای</span><b class='gmono'>" + D.cafe.wifi + "</b></div>" +
          "<div class='gsub__row'><span>👤 وضعیت</span><b>" + (state.joined ? "عضو " + state.name : "مهمان — عضویت ۵۰ امتیاز دارد") + "</b></div>" +
          "</div>" +
          "<div class='gnote' style='margin-top:14px'>هیچ اپی نصب نمی‌شود. منو همین‌جاست و اگر عضو شوی، امتیاز و پیشنهاد شخصی هم همین‌جا.</div>" +
          "<div class='grow-flex' style='margin-top:16px'>" +
          "<button class='gbtn' style='flex:1' data-goto='menu'>باز کردن منو ←</button>" +
          (state.joined ? "" : "<button class='gbtn gbtn--glass' data-join='1'>عضویت یک‌کلیکی</button>") +
          "</div>");
      }, 520);
    }
  });

  function buildBar() {
    var bar = byId("glassMenus");
    var menus = [
      { id: "cats", icon: "📖", label: "دسته‌بندی", count: false },
      { id: "filters", icon: "⚗︎", label: "فیلتر", count: true },
      { id: "advanced", icon: "⚙︎", label: "پیشرفته", count: false },
      { id: "service", icon: "🙋", label: "سرویس", count: false },
      { id: "account", icon: "🪪", label: "حساب", count: false }
    ];
    bar.innerHTML = menus.map(function (m) {
      return "<div class='gmenu' data-menu='" + m.id + "'>" +
        "<button class='gmenu__btn' type='button' aria-expanded='false' data-menu='" + m.id + "'>" +
        "<i>" + m.icon + "</i><span class='gmenu__label'>" + m.label + "</span>" +
        (m.count ? "<span class='gmenu__count'>0</span>" : "") +
        "<span class='caret'>▼</span></button>" +
        "<div class='gmenu__panel glass glass--strong glass--sheen'></div></div>";
    }).join("");
  }
})();
