/* CafeLoop customer MVP — local, interactive prototype (no payment or backend). */
(function () {
  "use strict";

  var STORAGE_KEY = "cafeloop-mvp-v1";
  var POINT_VALUE = 100; // each point is worth 100 toman in this demo
  var MILESTONE = 1000;
  var NUMBER = new Intl.NumberFormat("fa-IR");
  var root = document.getElementById("mvpApp");
  var viewRoot = document.getElementById("appView");
  var modalRoot = document.getElementById("modalRoot");
  var modalDialog = document.getElementById("modalDialog");
  var modalContent = document.getElementById("modalContent");
  var drawer = document.getElementById("cartDrawer");
  var drawerContent = document.getElementById("cartDrawerContent");
  var toastNode = document.getElementById("toast");
  var toastTimer = null;
  var returnFocus = null;
  var state;

  var MENU = [
    { id: "americano", name: "آمریکانو دوبل", en: "Double Americano", desc: "اسپرسوی دوشات با آب داغ؛ قوی و شفاف.", category: "coffee", price: 145000, icon: "☕", tags: ["بدون شکر", "کم‌کالری"], filters: ["vegan", "dairyFree", "lowSugar"], calories: 12, rating: 4.9, badge: "پرفروش", customizable: true, popular: 98 },
    { id: "latte", name: "لاته وانیل", en: "Vanilla Latte", desc: "اسپرسو، شیر بخار داده‌شده و وانیل طبیعی.", category: "coffee", price: 175000, icon: "🥛", tags: ["شیر جو دوسر", "محبوب"], filters: ["vegetarian"], calories: 185, rating: 4.9, badge: "محبوب شما", customizable: true, popular: 96 },
    { id: "cappuccino", name: "کاپوچینو", en: "Cappuccino", desc: "اسپرسوی متعادل با فوم شیر لطیف.", category: "coffee", price: 165000, icon: "☕", tags: ["فوم شیر", "بدون شکر"], filters: ["vegetarian", "lowSugar"], calories: 120, rating: 4.8, badge: "", customizable: true, popular: 91 },
    { id: "mocha", name: "موکا شکلات تلخ", en: "Dark Mocha", desc: "ترکیب قهوه و شکلات تلخ ۷۰٪.", category: "coffee", price: 195000, icon: "🍫", tags: ["شکلات تلخ"], filters: ["vegetarian"], calories: 230, rating: 4.8, badge: "جدید", customizable: true, popular: 84 },
    { id: "espresso", name: "اسپرسو دوپیو", en: "Espresso Doppio", desc: "دو شات اسپرسوی تازه‌ آسیاب‌شده.", category: "coffee", price: 115000, icon: "🫘", tags: ["بدون شکر", "کم‌کالری"], filters: ["vegan", "dairyFree", "lowSugar"], calories: 8, rating: 4.8, badge: "", customizable: true, popular: 88 },
    { id: "matcha", name: "ماچا لاته", en: "Matcha Latte", desc: "ماچای ژاپنی بافت‌دار و شیر انتخابی.", category: "coffee", price: 215000, icon: "🍵", tags: ["ماچای ژاپنی", "آنتی‌اکسیدان"], filters: ["vegetarian"], calories: 160, rating: 4.7, badge: "ویژه", customizable: true, popular: 82 },
    { id: "iced-latte", name: "آیس لاته", en: "Iced Latte", desc: "اسپرسو و شیر سرد با یخ شفاف.", category: "cold", price: 185000, icon: "🧋", tags: ["خنک", "شیر جو دوسر"], filters: ["vegetarian"], calories: 145, rating: 4.8, badge: "", customizable: true, popular: 89 },
    { id: "cold-brew", name: "کلد برو", en: "Cold Brew", desc: "قهوه‌ی دم‌سرد ۱۸ ساعته؛ نرم و کم‌تلخ.", category: "cold", price: 195000, icon: "🧊", tags: ["دم‌آوری ۱۸ ساعته", "بدون شکر"], filters: ["vegan", "dairyFree", "lowSugar"], calories: 15, rating: 4.9, badge: "", customizable: true, popular: 93 },
    { id: "lemonade", name: "لیموناد ریحان", en: "Basil Lemonade", desc: "لیموترش تازه، ریحان و شربت کم‌شیرین.", category: "cold", price: 135000, icon: "🍋", tags: ["بدون لبنیات", "تازه"], filters: ["vegan", "dairyFree", "caffeineFree"], calories: 95, rating: 4.6, badge: "بدون کافئین", customizable: false, popular: 77 },
    { id: "croissant", name: "کروسان کره‌ای", en: "Butter Croissant", desc: "خمیر لایه‌ای، کره‌ی فرانسوی و پخت روز.", category: "dessert", price: 130000, icon: "🥐", tags: ["پخت روز", "گیاهی"], filters: ["vegetarian"], calories: 255, rating: 4.8, badge: "", customizable: false, popular: 86 },
    { id: "cheesecake", name: "چیزکیک نیویورکی", en: "New York Cheesecake", desc: "بافت خامه‌ای با بیس بیسکویتی دست‌ساز.", category: "dessert", price: 225000, icon: "🍰", tags: ["محبوب", "تازه"], filters: ["vegetarian"], calories: 340, rating: 4.9, badge: "پیشنهاد سرآشپز", customizable: false, popular: 95 },
    { id: "cookie", name: "کوکی شکلاتی", en: "Chocolate Cookie", desc: "کوکی نرم با تکه‌های شکلات تلخ.", category: "dessert", price: 95000, icon: "🍪", tags: ["تازه", "گیاهی"], filters: ["vegetarian"], calories: 210, rating: 4.7, badge: "", customizable: false, popular: 80 }
  ];

  var CATEGORIES = [
    { id: "all", label: "همه‌ی منو", icon: "✦" },
    { id: "coffee", label: "قهوه و گرم", icon: "☕" },
    { id: "cold", label: "نوشیدنی سرد", icon: "🧊" },
    { id: "dessert", label: "شیرینی و دسر", icon: "🥐" }
  ];

  var OFFERS = [
    { id: "return-20", title: "قهوه‌ی همیشگی‌ات، با ۲۰٪ تخفیف", description: "برای برگشت این هفته؛ روی یک نوشیدنی گرم. یک‌بار قابل استفاده در نسخه‌ی آزمایشی.", code: "BACK20", discount: 20, minimum: 100000, icon: "☕", expires: "اعتبار نمایشی تا پایان هفته", kind: "شخصی‌سازی‌شده" },
    { id: "coffee-cake", title: "قهوه + شیرینی، ۳۰ هزار تومان کمتر", description: "با انتخاب هم‌زمان یک نوشیدنی و یک شیرینی، تخفیف روی جمع سفارش اعمال می‌شود.", code: "PAUSE30", discount: 0, fixed: 30000, minimum: 200000, icon: "🍰", expires: "ویژه‌ی سفارش بعدی", kind: "پیشنهاد کافه" },
    { id: "quiet-hour", title: "یک سورپرایز برای ساعت‌های خلوت", description: "پیشنهاد روزهای کاری بین ساعت ۱۴ تا ۱۷؛ برای یک سفارش بالای ۱۵۰ هزار تومان.", code: "CALM15", discount: 15, minimum: 150000, icon: "🌿", expires: "روزهای کاری · ۱۴ تا ۱۷", kind: "ساعت خوش" }
  ];

  var REWARDS = [
    { id: "cookie", title: "۵۰ هزار تومان اعتبار", description: "اعتبار وفاداری برای سفارش بعدی‌ات.", points: 500, discount: 50000, icon: "🎁" },
    { id: "americano", title: "آمریکانو رایگان", description: "یک آمریکانو دوبل، مهمان Cafe Noir.", points: 1450, discount: 145000, icon: "☕" },
    { id: "coffee-pair", title: "اعتبار ۲۲۰ هزار تومانی", description: "از اعتبارت برای سفارش دلخواه استفاده کن.", points: 2200, discount: 220000, icon: "🎁" }
  ];

  var LOCATIONS = [
    { id: "jordan", name: "کافه نوآر · جردن", address: "تهران، بلوار نلسون ماندلا · میز ۷", wait: "آماده‌سازی حدود ۱۲ دقیقه" },
    { id: "fereshteh", name: "کافه نوآر · فرشته", address: "تهران، خیابان فرشته · سالن اصلی", wait: "آماده‌سازی حدود ۱۵ دقیقه" },
    { id: "vanak", name: "کافه نوآر · ونک", address: "تهران، میدان ونک · فضای باز", wait: "آماده‌سازی حدود ۱۰ دقیقه" }
  ];

  var DEFAULT_STATE = {
    profile: { name: "امیر رضایی", phone: "0912 345 6789", birthday: "", preference: "all" },
    location: "jordan",
    points: 740,
    favorites: ["latte", "cheesecake"],
    cart: [],
    cartOffer: "",
    cartReward: "",
    usePoints: false,
    claimedOffers: [],
    usedOffers: [],
    redeemedRewards: [],
    orders: [
      { id: "CL-2048", date: "دیروز · ۱۸:۲۰", status: "completed", fulfillment: "بیرون‌بر", total: 370000, discount: 0, pointsEarned: 37, sample: true, items: [
        { productId: "americano", name: "آمریکانو دوبل", icon: "☕", qty: 1, unitPrice: 145000, options: { size: "regular", milk: "regular", extraShot: false, sugar: 2 } },
        { productId: "cheesecake", name: "چیزکیک نیویورکی", icon: "🍰", qty: 1, unitPrice: 225000, options: {} }
      ] }
    ],
    transactions: [
      { label: "امتیاز خوش‌آمدگویی", date: "عضویت در CafeLoop", delta: 50 },
      { label: "خریدهای قبلی", date: "خریدهای نمونه‌ی کافه نوآر", delta: 320 },
      { label: "بازگشت مشتری", date: "پاداش فعالیت", delta: 370 }
    ],
    settings: { orderUpdates: true, offers: true },
    menuFilters: { category: "all", query: "", sort: "featured", onlyFavorites: false, vegetarian: false, caffeineFree: false, under200: false },
    theme: "dark"
  };

  var VIEWS = {
    home: "خانه",
    menu: "منوی کافه",
    favorites: "علاقه‌مندی‌ها",
    loyalty: "باشگاه امتیاز",
    offers: "پیشنهادهای من",
    orders: "سفارش‌های من",
    profile: "پروفایل و تنظیمات"
  };

  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char];
    });
  }
  function num(value) { return NUMBER.format(Math.max(0, Math.round(Number(value) || 0))); }
  function money(value) { return num(value) + " تومان"; }
  function moneyMarkup(value) { return '<span class="money-number">' + money(value) + "</span>"; }
  function getProduct(id) { return MENU.find(function (item) { return item.id === id; }); }
  function getOffer(id) { return OFFERS.find(function (item) { return item.id === id; }); }
  function getReward(id) { return REWARDS.find(function (item) { return item.id === id; }); }
  function getLocation() { return LOCATIONS.find(function (item) { return item.id === state.location; }) || LOCATIONS[0]; }
  function initials(name) {
    var words = String(name || "").trim().split(/\s+/).filter(Boolean);
    return words.slice(0, 2).map(function (part) { return part.charAt(0); }).join("") || "م";
  }
  function safeArray(value, fallback) { return Array.isArray(value) ? value : fallback; }

  function loadState() {
    var saved = null;
    try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"); } catch (error) { saved = null; }
    var next = clone(DEFAULT_STATE);
    if (!saved || typeof saved !== "object") return next;
    if (saved.profile && typeof saved.profile === "object") next.profile = Object.assign(next.profile, saved.profile);
    if (LOCATIONS.some(function (item) { return item.id === saved.location; })) next.location = saved.location;
    if (Number.isFinite(Number(saved.points))) next.points = Math.max(0, Number(saved.points));
    next.favorites = safeArray(saved.favorites, next.favorites).filter(function (id) { return !!getProduct(id); });
    next.cart = safeArray(saved.cart, []).filter(function (line) {
      return line && getProduct(line.productId) && Number(line.qty) > 0;
    }).map(function (line) {
      var product = getProduct(line.productId);
      var options = Object.assign({ size: "regular", milk: "regular", extraShot: false, sugar: 2 }, line.options || {});
      return { key: line.key || lineKey(product.id, options), productId: product.id, qty: Math.min(20, Number(line.qty) || 1), options: options };
    });
    next.cartOffer = typeof saved.cartOffer === "string" ? saved.cartOffer : "";
    next.cartReward = typeof saved.cartReward === "string" ? saved.cartReward : "";
    next.usePoints = !!saved.usePoints;
    next.claimedOffers = safeArray(saved.claimedOffers, []).filter(function (id) { return !!getOffer(id); });
    next.usedOffers = safeArray(saved.usedOffers, []).filter(function (id) { return !!getOffer(id); });
    next.redeemedRewards = safeArray(saved.redeemedRewards, []).filter(function (item) { return item && getReward(item.rewardId); });
    next.orders = safeArray(saved.orders, next.orders).filter(function (order) { return order && order.id && Array.isArray(order.items); });
    next.transactions = safeArray(saved.transactions, next.transactions).slice(0, 30);
    if (saved.settings && typeof saved.settings === "object") next.settings = Object.assign(next.settings, saved.settings);
    if (saved.menuFilters && typeof saved.menuFilters === "object") next.menuFilters = Object.assign(next.menuFilters, saved.menuFilters);
    if (saved.theme === "light" || saved.theme === "dark") next.theme = saved.theme;
    return next;
  }

  function saveState() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (error) { /* Storage can be disabled; the demo still works in memory. */ }
  }

  function digitsToLatin(value) {
    return String(value || "").replace(/[۰-۹٠-٩]/g, function (digit) {
      var code = digit.charCodeAt(0);
      return String(code >= 1776 && code <= 1785 ? code - 1776 : code - 1632);
    });
  }

  function formatDate(date) {
    try { return date.toLocaleString("fa-IR", { dateStyle: "short", timeStyle: "short" }); }
    catch (error) { return date.toLocaleString(); }
  }

  function getViewFromHash() {
    var view = (window.location.hash || "").replace(/^#/, "");
    return Object.prototype.hasOwnProperty.call(VIEWS, view) ? view : "home";
  }

  function navigate(view, addHistory) {
    if (!Object.prototype.hasOwnProperty.call(VIEWS, view)) return;
    var changed = state.view !== view;
    state.view = view;
    if (addHistory !== false && window.location.hash !== "#" + view) {
      window.history.pushState({ mvpView: view }, "", "#" + view);
    }
    render();
    if (changed && window.matchMedia && window.matchMedia("(max-width: 860px)").matches) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function updateChrome() {
    var locationNode = document.getElementById("currentLocation");
    var countNode = document.getElementById("cartCount");
    var initialNode = document.getElementById("headerInitials");
    var sidebarPoints = document.getElementById("sidebarPoints");
    var sidebarProgress = document.getElementById("sidebarProgress");
    var sidebarText = document.getElementById("sidebarProgressText");
    var themeIcon = document.getElementById("themeIcon");
    var headingCartCount = document.getElementById("headingCartCount");
    var count = state.cart.reduce(function (total, line) { return total + Number(line.qty || 0); }, 0);
    var progress = Math.min(100, state.points / MILESTONE * 100);
    var remaining = Math.max(0, MILESTONE - state.points);
    if (locationNode) locationNode.textContent = getLocation().name;
    if (countNode) countNode.textContent = num(count);
    if (headingCartCount) headingCartCount.textContent = num(count);
    if (initialNode) initialNode.textContent = initials(state.profile.name);
    if (sidebarPoints) sidebarPoints.textContent = num(state.points);
    if (sidebarProgress) sidebarProgress.style.width = progress + "%";
    if (sidebarText) sidebarText.textContent = remaining ? num(remaining) + " امتیاز تا پاداش بعدی" : "پاداش بعدی آماده است";
    if (themeIcon) themeIcon.textContent = state.theme === "dark" ? "☼" : "☾";
    document.documentElement.setAttribute("data-mvp-theme", state.theme);
    root.dataset.theme = state.theme;
    document.querySelectorAll("[data-view]").forEach(function (button) {
      var active = button.dataset.view === state.view;
      button.classList.toggle("is-active", active);
      if (active) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    });
    document.title = VIEWS[state.view] + " — CafeLoop";
  }

  function render() {
    if (!viewRoot || !state) return;
    updateChrome();
    var content = "";
    if (state.view === "home") content = renderHome();
    else if (state.view === "menu") content = renderMenu();
    else if (state.view === "favorites") content = renderFavorites();
    else if (state.view === "loyalty") content = renderLoyalty();
    else if (state.view === "offers") content = renderOffers();
    else if (state.view === "orders") content = renderOrders();
    else content = renderProfile();
    viewRoot.innerHTML = content;
    if (state.view === "menu") renderMenuResults();
    saveState();
  }

  function viewHeading(eyebrow, title, description, actions) {
    return '<div class="view-heading"><div><span class="view-eyebrow">' + eyebrow + '</span><h1>' + title + '</h1><p>' + description + '</p></div>' +
      (actions ? '<div class="view-heading-actions">' + actions + '</div>' : "") + '</div>';
  }

  function progressText() {
    return state.points >= MILESTONE ? "پاداش بعدی آماده‌ی دریافت است ✨" : num(MILESTONE - state.points) + " امتیاز تا پاداش بعدی";
  }

  function renderHome() {
    var name = escapeHtml(String(state.profile.name || "دوست کافه").split(/\s+/)[0]);
    var topPicks = ["americano", "latte", "cheesecake"].map(getProduct).filter(Boolean);
    var categoryMarkup = [
      { id: "coffee", title: "قهوه و نوشیدنی گرم", note: "اسپرسوهای تازه", icon: "☕" },
      { id: "cold", title: "نوشیدنی‌های سرد", note: "خنک و دست‌ساز", icon: "🧊" },
      { id: "dessert", title: "شیرینی و دسر", note: "هر روز تازه", icon: "🥐" },
      { id: "all", title: "تمام منو", note: "۱۲ انتخاب خوشمزه", icon: "✦" }
    ].map(function (category) {
      return '<button class="category-tile" type="button" data-action="pick-category" data-category="' + category.id + '"><span class="category-emoji">' + category.icon + '</span><span><b>' + category.title + '</b><small>' + category.note + '</small></span></button>';
    }).join("");
    var shortcuts = [
      { view: "menu", icon: "☕", title: "سفارش تازه", note: "انتخاب از منو" },
      { view: "loyalty", icon: "✦", title: "امتیازهای من", note: num(state.points) + " امتیاز" },
      { view: "orders", icon: "▤", title: "پیگیری سفارش", note: state.orders.some(isActiveOrder) ? "یک سفارش در جریان" : "تاریخچه‌ی سفارش‌ها" },
      { view: "favorites", icon: "♡", title: "علاقه‌مندی‌ها", note: num(state.favorites.length) + " انتخاب ذخیره‌شده" }
    ].map(function (item) {
      return '<button type="button" class="shortcut-card" data-view="' + item.view + '"><span class="shortcut-icon">' + item.icon + '</span><span><b>' + item.title + '</b><small>' + item.note + '</small></span></button>';
    }).join("");
    return '<section>' +
      '<div class="welcome-grid">' +
        '<article class="welcome-card"><button class="welcome-tag branch-home-button" type="button" data-action="choose-location"><span class="online-dot"></span> 📍 سفارش از ' + escapeHtml(getLocation().name) + ' · تغییر شعبه</button>' +
          '<h1>سلام ' + name + '،<br><span>قهوه‌ی بعدی</span> با ماست.</h1>' +
          '<p>منو را ببین، سفارش آزمایشی ثبت کن و با هر خرید امتیاز جمع کن. انتخاب امروزت را برایت آماده کرده‌ایم.</p>' +
          '<div class="welcome-actions"><button class="app-button" type="button" data-view="menu">دیدن منو <span aria-hidden="true">←</span></button><button class="app-button app-button--quiet" type="button" data-view="offers">پیشنهادهای من</button></div>' +
        '</article>' +
        '<article class="points-card"><div class="points-card-head"><span>امتیاز وفاداری تو</span><span class="level-pill">عضو طلایی</span></div>' +
          '<div><div class="points-balance">' + num(state.points) + '<small>امتیاز</small></div><div class="points-caption">' + progressText() + '</div>' +
          '<div class="progress-track"><span style="width:' + Math.min(100, state.points / MILESTONE * 100) + '%"></span></div>' +
          '<div class="points-card-foot"><span>۰</span><span><b>' + num(MILESTONE) + '</b> امتیاز</span></div></div>' +
          '<button class="text-button" type="button" data-view="loyalty">باشگاه و پاداش‌ها <span aria-hidden="true">←</span></button>' +
        '</article>' +
      '</div>' +
      '<div class="section-block"><div class="section-block-head"><div><h2>دسترسی سریع</h2><p>هر چیزی که برای تجربه‌ی امروز نیاز داری</p></div></div><div class="shortcut-grid">' + shortcuts + '</div></div>' +
      '<div class="section-block"><div class="section-block-head"><div><h2>از کجا شروع کنیم؟</h2><p>دسته‌بندی موردعلاقه‌ات را انتخاب کن</p></div><button class="text-button" type="button" data-view="menu">کل منو <span aria-hidden="true">←</span></button></div><div class="category-tiles">' + categoryMarkup + '</div></div>' +
      '<div class="section-block"><div class="feature-offer"><div><span class="view-eyebrow">پیشنهاد مخصوص تو · ۲۰٪</span><h3>آمریکانوی همیشگی‌ات منتظرته</h3><p>این هفته یک نوشیدنی گرم با کد BACK20، در این نسخه‌ی آزمایشی.</p></div><span class="offer-symbol" aria-hidden="true">🎁</span><button class="app-button app-button--small" type="button" data-action="claim-offer" data-offer-id="return-20">فعال‌سازی پیشنهاد</button></div></div>' +
      '<div class="section-block"><div class="section-block-head"><div><h2>پیشنهادهای بارستا</h2><p>چند انتخاب محبوب برای همین لحظه</p></div><button class="text-button" type="button" data-view="menu">دیدن همه <span aria-hidden="true">←</span></button></div><div class="product-grid">' + topPicks.map(productCard).join("") + '</div></div>' +
      renderRecentOrder() +
    '</section>';
  }

  function renderRecentOrder() {
    var order = state.orders[state.orders.length - 1];
    if (!order) return "";
    return '<div class="section-block"><div class="section-block-head"><div><h2>آخرین سفارش</h2><p>هر وقت خواستی دوباره همان را سفارش بده</p></div><button class="text-button" type="button" data-view="orders">سفارش‌های من <span aria-hidden="true">←</span></button></div><div class="order-list">' + orderCard(order, false) + '</div></div>';
  }

  function categoryLabel(id) {
    var item = CATEGORIES.find(function (category) { return category.id === id; });
    return item ? item.label : "همه‌ی منو";
  }

  function productCard(item) {
    var favorite = state.favorites.indexOf(item.id) !== -1;
    var artClass = item.category === "cold" ? "product-art--cold" : item.category === "dessert" ? "product-art--bakery" : item.id === "matcha" ? "product-art--tea" : "";
    var tags = item.tags.slice(0, 2).map(function (tag) { return '<span class="mini-tag">' + escapeHtml(tag) + '</span>'; }).join("");
    return '<article class="product-card">' +
      '<div class="product-art ' + artClass + '"><button class="product-art-emoji" type="button" data-action="product-detail" data-product-id="' + item.id + '" aria-label="جزئیات ' + escapeHtml(item.name) + '">' + item.icon + '</button>' +
      (item.badge ? '<span class="product-label">' + escapeHtml(item.badge) + '</span>' : '') +
      '<button class="favorite-button' + (favorite ? ' is-favorite' : '') + '" type="button" data-action="toggle-favorite" data-product-id="' + item.id + '" aria-label="' + (favorite ? 'حذف از' : 'افزودن به') + ' علاقه‌مندی‌ها" aria-pressed="' + favorite + '">' + (favorite ? "♥" : "♡") + '</button></div>' +
      '<div class="product-info"><div class="product-meta"><span>' + categoryLabel(item.category) + '</span><span class="rating">★ ' + item.rating.toFixed(1) + '</span></div>' +
      '<h3>' + escapeHtml(item.name) + '</h3><p>' + escapeHtml(item.desc) + '</p><div class="product-tags">' + tags + '</div>' +
      '<div class="product-bottom"><span class="product-price">' + money(item.price) + '<small>' + (item.customizable ? 'از قیمت پایه' : 'قیمت نهایی') + '</small></span>' +
      '<button class="add-product" type="button" data-action="quick-add" data-product-id="' + item.id + '" aria-label="افزودن ' + escapeHtml(item.name) + ' به سفارش">+</button></div></div>' +
      '</article>';
  }

  function renderMenu() {
    var categories = CATEGORIES.map(function (item) {
      return '<button class="category-chip' + (state.menuFilters.category === item.id ? ' is-active' : '') + '" type="button" data-action="select-category" data-category="' + item.id + '" aria-pressed="' + (state.menuFilters.category === item.id) + '">' + item.icon + ' ' + item.label + '</button>';
    }).join("");
    var filterCount = [state.menuFilters.vegetarian, state.menuFilters.caffeineFree, state.menuFilters.under200, state.menuFilters.onlyFavorites].filter(Boolean).length;
    return viewHeading("منوی دیجیتال · به‌روز امروز", "یه انتخاب خوشمزه، همین‌جاست.", "جست‌وجو کن، فیلترهای پیشرفته را باز کن و نوشیدنی‌ات را با اندازه، نوع شیر و شات اضافه شخصی‌سازی کن.", '<button class="app-button" type="button" data-action="open-cart">🛍 سبد <span id="headingCartCount">' + num(state.cart.reduce(function (total, line) { return total + line.qty; }, 0)) + '</span></button>') +
      '<div class="menu-toolbar"><label class="search-field"><span aria-hidden="true">⌕</span><input id="menuSearch" type="search" placeholder="جست‌وجو در منو..." value="' + escapeHtml(state.menuFilters.query) + '" autocomplete="off" aria-label="جست‌وجو در منو"></label>' +
        '<select class="select-control" id="menuSort" aria-label="مرتب‌سازی منو"><option value="featured"' + (state.menuFilters.sort === "featured" ? " selected" : "") + '>پیشنهادی</option><option value="price-low"' + (state.menuFilters.sort === "price-low" ? " selected" : "") + '>ارزان‌تر</option><option value="price-high"' + (state.menuFilters.sort === "price-high" ? " selected" : "") + '>گران‌تر</option><option value="rating"' + (state.menuFilters.sort === "rating" ? " selected" : "") + '>محبوب‌تر</option></select>' +
        '<button class="filter-toggle' + (filterCount ? ' is-open' : '') + '" type="button" data-action="toggle-filters" aria-expanded="false" aria-controls="advancedFilters">☷ فیلترهای بیشتر' + (filterCount ? '<span class="filter-count">' + num(filterCount) + '</span>' : '') + '</button></div>' +
      '<div class="category-chips" role="group" aria-label="دسته‌بندی منو">' + categories + '</div>' +
      '<div class="advanced-filters" id="advancedFilters">' +
        '<label class="filter-option"><input type="checkbox" data-filter="vegetarian"' + (state.menuFilters.vegetarian ? ' checked' : '') + '> گیاهی</label>' +
        '<label class="filter-option"><input type="checkbox" data-filter="caffeineFree"' + (state.menuFilters.caffeineFree ? ' checked' : '') + '> بدون کافئین</label>' +
        '<label class="filter-option"><input type="checkbox" data-filter="under200"' + (state.menuFilters.under200 ? ' checked' : '') + '> زیر ۲۰۰ هزار تومان</label>' +
        '<label class="filter-option"><input type="checkbox" data-filter="onlyFavorites"' + (state.menuFilters.onlyFavorites ? ' checked' : '') + '> فقط علاقه‌مندی‌ها</label>' +
        '<button class="filter-clear" type="button" data-action="clear-menu-filters">پاک کردن فیلترها</button>' +
      '</div>' +
      '<div class="results-caption" id="menuResultsCaption" aria-live="polite"></div><div class="product-grid" id="productGrid"></div>' +
      '<p class="privacy-note" style="margin-top:16px">سفارش‌ها و پرداخت در این نسخه آزمایشی به کافه ارسال نمی‌شوند. افزودن به سبد، تغییرها را فقط در مرورگر ذخیره می‌کند.</p>';
  }

  function filteredProducts(favoritesOnly) {
    var filters = state.menuFilters;
    var query = String(filters.query || "").trim().toLocaleLowerCase("fa");
    var result = MENU.filter(function (item) {
      if (favoritesOnly && state.favorites.indexOf(item.id) === -1) return false;
      if (!favoritesOnly && filters.category !== "all" && item.category !== filters.category) return false;
      if (filters.onlyFavorites && state.favorites.indexOf(item.id) === -1) return false;
      if (filters.vegetarian && item.filters.indexOf("vegetarian") === -1 && item.filters.indexOf("vegan") === -1) return false;
      if (filters.caffeineFree && item.filters.indexOf("caffeineFree") === -1) return false;
      if (filters.under200 && item.price >= 200000) return false;
      if (query) {
        var text = [item.name, item.en, item.desc, item.tags.join(" ")].join(" ").toLocaleLowerCase("fa");
        if (text.indexOf(query) === -1) return false;
      }
      return true;
    });
    if (filters.sort === "price-low") result.sort(function (a, b) { return a.price - b.price; });
    else if (filters.sort === "price-high") result.sort(function (a, b) { return b.price - a.price; });
    else if (filters.sort === "rating") result.sort(function (a, b) { return b.rating - a.rating; });
    else result.sort(function (a, b) { return b.popular - a.popular; });
    return result;
  }

  function renderMenuResults() {
    var grid = document.getElementById("productGrid");
    if (!grid) return;
    var products = filteredProducts(false);
    var caption = document.getElementById("menuResultsCaption");
    grid.innerHTML = products.length ? products.map(productCard).join("") : emptyState("⌕", "چیزی پیدا نشد", "عبارت یا فیلترها را تغییر بده تا انتخاب‌های بیشتری ببینی.", '<button class="app-button app-button--small" type="button" data-action="clear-menu-filters">پاک کردن فیلترها</button>');
    if (caption) caption.textContent = num(products.length) + " انتخاب در " + categoryLabel(state.menuFilters.category);
    var filterCount = [state.menuFilters.vegetarian, state.menuFilters.caffeineFree, state.menuFilters.under200, state.menuFilters.onlyFavorites].filter(Boolean).length;
    var toggle = document.querySelector('[data-action="toggle-filters"]');
    if (toggle) {
      toggle.classList.toggle("is-open", filterCount > 0);
      toggle.innerHTML = "☷ فیلترهای بیشتر" + (filterCount ? '<span class="filter-count">' + num(filterCount) + '</span>' : "");
    }
  }

  function renderFavorites() {
    var products = MENU.filter(function (item) { return state.favorites.indexOf(item.id) !== -1; });
    return viewHeading("انتخاب‌هایی که دوست داری", "علاقه‌مندی‌های من", "با لمس قلب کنار هر محصول، انتخاب‌هایت را برای مراجعه‌ی بعدی نگه دار.", '<button class="app-button app-button--quiet" type="button" data-view="menu">رفتن به منو</button>') +
      (products.length ? '<div class="product-grid">' + products.map(productCard).join("") + '</div>' : emptyState("♡", "هنوز انتخابی ذخیره نکردی", "منو را بگرد و با قلب، نوشیدنی‌ها و شیرینی‌های محبوبت را اینجا نگه دار.", '<button class="app-button app-button--small" type="button" data-view="menu">دیدن منو</button>'));
  }

  function renderLoyalty() {
    var rewardCards = REWARDS.map(function (reward) {
      var unlocked = state.points >= reward.points;
      return '<article class="reward-card' + (unlocked ? "" : " is-locked") + '"><div class="reward-head"><span class="reward-emoji">' + reward.icon + '</span><span class="reward-cost">✦ ' + num(reward.points) + ' امتیاز</span></div>' +
        '<h3>' + escapeHtml(reward.title) + '</h3><p>' + escapeHtml(reward.description) + '</p>' +
        '<button class="app-button ' + (unlocked ? "" : "app-button--quiet") + ' app-button--small" type="button" data-action="redeem-reward" data-reward-id="' + reward.id + '"' + (unlocked ? "" : " disabled") + '>' + (unlocked ? "دریافت پاداش" : num(reward.points - state.points) + " امتیاز دیگر نیاز داری") + '</button></article>';
    }).join("");
    var transactions = state.transactions.slice(0, 8).map(function (item) {
      var positive = Number(item.delta) >= 0;
      return '<div class="history-row"><span class="history-row-icon">' + (positive ? "✦" : "↘") + '</span><span class="history-row-copy"><b>' + escapeHtml(item.label) + '</b><small>' + escapeHtml(item.date) + '</small></span><span class="history-delta' + (positive ? "" : " is-minus") + '">' + (positive ? "+" : "−") + num(Math.abs(Number(item.delta))) + '</span></div>';
    }).join("");
    var progress = Math.min(100, state.points / MILESTONE * 100);
    return viewHeading("هر بازگشت، یک قدم نزدیک‌تر", "امتیازهایت را خرج خاطره‌ی بعدی کن.", "با هر ۱۰ هزار تومان خرید، یک امتیاز می‌گیری. هر امتیاز در این دمو معادل ۱۰۰ تومان اعتبار است.", "") +
      '<div class="points-hero"><article class="points-total-card"><span class="view-eyebrow">باشگاه وفاداری CafeLoop</span><h2>موجودی امتیاز تو</h2><div class="points-total-number">' + num(state.points) + ' <small>امتیاز</small></div><p>' + progressText() + '</p><div class="progress-track"><span style="width:' + progress + '%"></span></div><div class="points-card-foot"><span>نقطه‌ی شروع</span><span>' + num(MILESTONE) + ' امتیاز = پاداش بعدی</span></div></article>' +
      '<article class="points-visual-card"><div class="points-ring" style="--progress:' + progress + '%"><b>' + num(Math.round(progress)) + '%</b><span>تا هدف بعدی</span></div><p>هر خرید، امتیازت را بیشتر می‌کند.<br>امتیاز قابل استفاده در همین مرورگر است.</p></article></div>' +
      '<div class="section-block"><div class="section-block-head"><div><h2>پاداش‌های قابل دریافت</h2><p>هر وقت امتیازت رسید، پاداش را فعال کن.</p></div></div><div class="reward-grid">' + rewardCards + '</div></div>' +
      '<div class="section-block"><div class="section-block-head"><div><h2>تاریخچه امتیاز</h2><p>تراکنش‌های نمونه‌ی حساب مشتری</p></div><span class="welcome-tag">' + num(state.transactions.length) + ' رویداد</span></div><div class="history-list">' + (transactions || '<div class="empty-state">هنوز تراکنشی ثبت نشده است.</div>') + '</div></div>' +
      '<p class="privacy-note" style="margin-top:16px">این موجودی نمونه است و ارزش نقدی واقعی ندارد. هیچ پرداختی انجام نمی‌شود؛ داده‌ی آزمایشی را هر زمان از تنظیمات حساب پاک کن.</p>';
  }

  function renderOffers() {
    var cards = OFFERS.map(function (offer) {
      var claimed = state.claimedOffers.indexOf(offer.id) !== -1;
      var used = state.usedOffers.indexOf(offer.id) !== -1;
      var status = used ? "استفاده‌شده" : claimed ? "فعال برای سفارش" : offer.kind;
      return '<article class="offer-card"><div class="offer-card-head"><span class="offer-sticker">' + offer.icon + '</span><span class="offer-status' + (claimed && !used ? " is-ready" : "") + '">' + status + '</span></div>' +
        '<h3>' + escapeHtml(offer.title) + '</h3><p>' + escapeHtml(offer.description) + '</p>' +
        '<div class="offer-card-foot">' + (claimed ? '<span class="offer-code">' + offer.code + '</span><button class="text-button" type="button" data-action="copy-code" data-code="' + offer.code + '">کپی کد</button>' : '<span class="offer-expiry">' + escapeHtml(offer.expires) + '</span><button class="app-button app-button--small" type="button" data-action="claim-offer" data-offer-id="' + offer.id + '"' + (used ? " disabled" : "") + '>فعال‌سازی</button>') + '</div></article>';
    }).join("");
    var readyCount = state.claimedOffers.filter(function (id) { return state.usedOffers.indexOf(id) === -1; }).length;
    return viewHeading("پیشنهادهای شخصی‌سازی‌شده", "پیشنهادهایی برای بازگشت بعدی.", "پیشنهاد را فعال کن، کد را در سبد سفارش انتخاب کن و تخفیف را به‌صورت نمایشی ببین.", '<span class="welcome-tag">' + num(readyCount) + ' پیشنهاد فعال</span>') +
      '<div class="offer-grid">' + cards + '</div>' +
      '<div class="section-block"><div class="feature-offer"><div><span class="view-eyebrow">شفاف و بدون پیام اضافه</span><h3>کنترل پیشنهادها دست خودت است.</h3><p>هیچ پیام واقعی ارسال نمی‌شود؛ پیشنهادهای این نسخه فقط برای نمایش تجربه‌ی مشتری هستند.</p></div><span class="offer-symbol" aria-hidden="true">🔒</span></div></div>';
  }

  function isActiveOrder(order) { return order && (order.status === "preparing" || order.status === "confirmed"); }

  function renderOrders() {
    var sorted = state.orders.slice().reverse();
    var active = sorted.filter(isActiveOrder);
    var past = sorted.filter(function (order) { return !isActiveOrder(order); });
    var activeMarkup = active.length ? '<div class="order-list">' + active.map(function (order) { return orderCard(order, true); }).join("") + '</div>' : emptyState("☕", "سفارشی در مسیر نیست", "وقتی سفارشی ثبت کنی، وضعیتش را همین‌جا دنبال می‌کنی.", '<button class="app-button app-button--small" type="button" data-view="menu">رفتن به منو</button>');
    var pastMarkup = past.length ? '<div class="order-list">' + past.map(function (order) { return orderCard(order, false); }).join("") + '</div>' : '<p class="privacy-note">بعد از اولین سفارش، سابقه‌ی خریدت اینجا نمایش داده می‌شود.</p>';
    return viewHeading("همه‌چیز مرتب و قابل پیگیری", "سفارش‌های من", "وضعیت سفارش آزمایشی، جزئیات خرید و گزینه‌ی سفارش مجدد را از این صفحه مدیریت کن.", '<button class="app-button app-button--quiet" type="button" data-view="menu">سفارش تازه</button>') +
      '<div class="section-block" style="margin-top:0"><div class="section-block-head"><div><h2>در حال آماده‌سازی</h2><p>سفارش‌های در جریان</p></div></div>' + activeMarkup + '</div>' +
      '<div class="section-block"><div class="section-block-head"><div><h2>تاریخچه سفارش‌ها</h2><p>' + num(past.length) + ' سفارش ثبت‌شده در این مرورگر</p></div></div>' + pastMarkup + '</div>' +
      '<p class="privacy-note" style="margin-top:15px">وضعیت‌ها و شماره سفارش‌ها نمایشی‌اند؛ این نسخه به آشپزخانه یا صندوق کافه وصل نیست.</p>';
  }

  function orderCard(order, active) {
    var items = safeArray(order.items, []);
    var summary = items.slice(0, 3).map(function (item) { return '<span class="order-item-emoji" title="' + escapeHtml(item.name || "محصول") + '">' + (item.icon || "☕") + '</span>'; }).join("");
    var names = items.map(function (item) { return escapeHtml(item.name) + " × " + num(item.qty || 1); }).join("، ");
    var statusLabel = active ? "در حال آماده‌سازی" : "تحویل‌شده";
    var status = active ? '<span class="order-status"><span class="online-dot"></span>' + statusLabel + '</span>' : '<span class="offer-status">' + statusLabel + '</span>';
    var progress = active ? '<div class="order-timeline"><span class="order-step is-done">ثبت سفارش</span><span class="order-step is-current">آماده‌سازی</span><span class="order-step">آماده‌ی تحویل</span></div>' : "";
    return '<article class="order-card' + (active ? " is-active-order" : "") + '"><div class="order-card-head"><span class="order-number"><b>' + escapeHtml(order.id) + '</b><small>' + escapeHtml(order.date || "سفارش ثبت‌شده") + ' · ' + escapeHtml(order.fulfillment || "بیرون‌بر") + '</small></span>' + status + '</div>' +
      '<div class="order-items-preview">' + summary + '<span>' + (names || "جزئیات سفارش") + '</span></div>' + progress +
      '<div class="order-card-foot"><b>' + money(order.total || 0) + '</b><div class="order-actions"><button class="app-button app-button--quiet app-button--small" type="button" data-action="order-detail" data-order-id="' + escapeHtml(order.id) + '">جزئیات</button>' +
      (!active ? '<button class="app-button app-button--small" type="button" data-action="reorder" data-order-id="' + escapeHtml(order.id) + '">سفارش مجدد</button>' : '<span class="tiny muted">زمان آماده‌سازی: حدود ۱۲ دقیقه</span>') + '</div></div></article>';
  }

  function renderProfile() {
    var preference = state.profile.preference || "all";
    return viewHeading("حساب مشتری و حریم خصوصی", "پروفایل تو، به انتخاب خودت.", "اطلاعات و ترجیحات را ویرایش کن؛ همه‌ی تغییرها فقط در همین مرورگر ذخیره می‌شوند.", '<span class="welcome-tag">عضو از ۴ ماه پیش</span>') +
      '<div class="profile-grid"><div class="profile-card"><h2>اطلاعات حساب</h2><div class="profile-banner"><span class="profile-avatar">' + escapeHtml(initials(state.profile.name)) + '</span><span><b>' + escapeHtml(state.profile.name) + '</b><small>عضو CafeLoop · سطح طلایی</small></span></div>' +
      '<form id="profileForm"><div class="profile-form-grid"><div class="form-field"><label for="profileName">نام نمایشی</label><input class="form-control" id="profileName" name="name" maxlength="40" required value="' + escapeHtml(state.profile.name) + '"></div>' +
      '<div class="form-field"><label for="profilePhone">شماره موبایل</label><input class="form-control" id="profilePhone" name="phone" type="tel" inputmode="tel" autocomplete="tel" value="' + escapeHtml(state.profile.phone) + '" placeholder="۰۹۱۲۱۲۳۴۵۶۷" required><small class="form-hint">برای نسخه‌ی دمو، شماره فقط روی دستگاه می‌ماند.</small></div>' +
      '<div class="form-field"><label for="profileBirthday">تاریخ تولد (اختیاری)</label><input class="form-control" id="profileBirthday" name="birthday" type="date" value="' + escapeHtml(state.profile.birthday) + '"></div>' +
      '<div class="form-field"><label for="profilePreference">ترجیح غذایی</label><select class="form-control" id="profilePreference" name="preference"><option value="all"' + (preference === "all" ? " selected" : "") + '>بدون محدودیت</option><option value="vegetarian"' + (preference === "vegetarian" ? " selected" : "") + '>گیاه‌خواری</option><option value="dairyFree"' + (preference === "dairyFree" ? " selected" : "") + '>بدون لبنیات</option><option value="caffeineFree"' + (preference === "caffeineFree" ? " selected" : "") + '>بدون کافئین</option></select></div></div>' +
      '<div class="row" style="justify-content:flex-start;margin-top:15px"><button class="app-button app-button--small" type="submit">ذخیره تغییرات</button><button class="app-button app-button--quiet app-button--small" type="button" data-view="orders">سفارش‌های من</button></div></form></div>' +
      '<div class="profile-card"><h2>تنظیمات تجربه</h2>' + settingRow("orderUpdates", "به‌روزرسانی سفارش", "نمایش وضعیت سفارش در همین صفحه") + settingRow("offers", "پیشنهادهای شخصی", "نمایش آفرهای کافه در حساب تو") +
      '<div class="setting-row"><span class="setting-copy"><b>پوسته‌ی برنامه</b><small>' + (state.theme === "dark" ? "تاریک · شیشه‌ای" : "روشن · شیشه‌ای") + '</small></span><button class="switch" type="button" data-action="toggle-theme" role="switch" aria-checked="' + (state.theme === "light") + '" aria-label="تغییر پوسته"></button></div>' +
      '<div class="setting-row"><span class="setting-copy"><b>علاقه‌مندی‌های ذخیره‌شده</b><small>' + num(state.favorites.length) + ' محصول در فهرست تو</small></span><button class="text-button" type="button" data-view="favorites">مدیریت <span aria-hidden="true">←</span></button></div>' +
      '<div style="margin-top:14px"><button class="app-button app-button--danger app-button--small" type="button" data-action="confirm-reset">پاک‌کردن داده‌های آزمایشی</button></div></div></div>' +
      '<div class="section-block"><p class="privacy-note">🔒 <b>حریم خصوصی:</b> این MVP به سرور، پیامک یا درگاه بانکی متصل نیست. شماره موبایل، امتیاز، علاقه‌مندی‌ها و سفارش‌های نمایشی در localStorage همین مرورگر ذخیره می‌شوند؛ پاک‌کردن داده‌ها، همه را حذف می‌کند.</p></div>';
  }

  function settingRow(id, title, description) {
    var checked = !!state.settings[id];
    return '<div class="setting-row"><span class="setting-copy"><b>' + title + '</b><small>' + description + '</small></span><button class="switch" type="button" data-action="toggle-setting" data-setting="' + id + '" role="switch" aria-checked="' + checked + '" aria-label="' + title + '"></button></div>';
  }

  function emptyState(icon, title, description, action) {
    return '<div class="empty-state"><div><div class="empty-icon">' + icon + '</div><h3>' + title + '</h3><p>' + description + '</p>' + (action ? '<div style="margin-top:14px">' + action + '</div>' : "") + '</div></div>';
  }

  function lineKey(productId, options) {
    return [productId, options.size || "regular", options.milk || "regular", options.extraShot ? "shot" : "no-shot", options.sugar == null ? 2 : options.sugar].join("-");
  }

  function unitPrice(product, options) {
    var price = product.price;
    if (product.customizable) {
      if (options.size === "small") price -= 15000;
      if (options.size === "large") price += 40000;
      if (options.milk === "oat") price += 30000;
      if (options.milk === "lactoseFree") price += 20000;
      if (options.extraShot) price += 25000;
    }
    return Math.max(0, price);
  }

  function itemOptionsLabel(product, options) {
    if (!product || !product.customizable || !options) return "";
    var sizes = { small: "کوچک", regular: "متوسط", large: "بزرگ" };
    var milks = { regular: "شیر معمولی", oat: "شیر جو دوسر", lactoseFree: "شیر بدون لاکتوز" };
    var pieces = [sizes[options.size] || "متوسط", milks[options.milk] || "شیر معمولی", "شکر " + (options.sugar == null ? 2 : options.sugar)];
    if (options.extraShot) pieces.push("شات اضافه");
    return pieces.join(" · ");
  }

  function addToCart(productId, options, qty) {
    var product = getProduct(productId);
    if (!product) return;
    var chosen = Object.assign({ size: "regular", milk: "regular", extraShot: false, sugar: 2 }, options || {});
    if (!product.customizable) chosen = {};
    var key = lineKey(product.id, chosen);
    var line = state.cart.find(function (item) { return item.key === key; });
    var amount = Math.max(1, Math.min(10, Number(qty) || 1));
    if (line) line.qty = Math.min(20, line.qty + amount);
    else state.cart.push({ key: key, productId: product.id, qty: amount, options: chosen });
    saveState();
    updateChrome();
    if (drawer.classList.contains("is-open")) renderCartDrawer();
  }

  function cartCount() { return state.cart.reduce(function (sum, line) { return sum + Number(line.qty || 0); }, 0); }
  function cartSubtotal() {
    return state.cart.reduce(function (sum, line) {
      var product = getProduct(line.productId);
      return sum + (product ? unitPrice(product, line.options || {}) * Number(line.qty || 0) : 0);
    }, 0);
  }

  function offerEligible(offer) {
    if (!offer || cartSubtotal() < offer.minimum) return false;
    if (offer.id === "coffee-cake") {
      var hasDrink = state.cart.some(function (line) {
        var product = getProduct(line.productId);
        return product && (product.category === "coffee" || product.category === "cold");
      });
      var hasDessert = state.cart.some(function (line) {
        var product = getProduct(line.productId);
        return product && product.category === "dessert";
      });
      return hasDrink && hasDessert;
    }
    return true;
  }

  function availableOffers() {
    return state.claimedOffers.filter(function (id) { return state.usedOffers.indexOf(id) === -1; }).map(getOffer).filter(offerEligible);
  }

  function availableRewards() {
    return state.redeemedRewards.filter(function (item) { return item && !item.used; });
  }

  function cartTotals() {
    var subtotal = cartSubtotal();
    var rest = subtotal;
    var offer = getOffer(state.cartOffer);
    if (!offer || state.claimedOffers.indexOf(offer.id) === -1 || state.usedOffers.indexOf(offer.id) !== -1 || !offerEligible(offer)) offer = null;
    var offerDiscount = offer ? (offer.discount ? Math.round(subtotal * offer.discount / 100) : Number(offer.fixed || 0)) : 0;
    offerDiscount = Math.min(rest, offerDiscount);
    rest -= offerDiscount;
    var reward = state.redeemedRewards.find(function (item) { return item.code === state.cartReward && !item.used; }) || null;
    var rewardDiscount = reward ? Math.min(rest, Number(reward.discount || 0)) : 0;
    rest -= rewardDiscount;
    var pointsUsed = state.usePoints ? Math.min(state.points, Math.floor(rest * 0.3 / POINT_VALUE)) : 0;
    var pointsDiscount = pointsUsed * POINT_VALUE;
    rest -= pointsDiscount;
    return { subtotal: subtotal, offerDiscount: offerDiscount, rewardDiscount: rewardDiscount, pointsUsed: pointsUsed, pointsDiscount: pointsDiscount, total: Math.max(0, rest), offer: offer, reward: reward };
  }

  function renderCartDrawer() {
    if (!drawerContent) return;
    var totalItems = cartCount();
    if (!totalItems) {
      drawerContent.innerHTML = '<div class="empty-cart"><div><div class="empty-icon">🛍</div><h3>سبدت هنوز خالی است</h3><p>از منوی Cafe Noir چیزی انتخاب کن تا سفارش آزمایشی‌ات را بسازیم.</p><button class="app-button app-button--small" type="button" data-action="close-cart" style="margin-top:15px">ادامه‌ی گشت‌وگذار</button></div></div>';
      return;
    }
    var lines = state.cart.map(function (line) {
      var product = getProduct(line.productId);
      if (!product) return "";
      var options = itemOptionsLabel(product, line.options || {});
      return '<article class="cart-line"><span class="cart-line-emoji">' + product.icon + '</span><div class="cart-line-main"><b>' + escapeHtml(product.name) + '</b><small>' + (options ? escapeHtml(options) : "بدون تغییر") + '</small><div class="qty-controls"><button type="button" data-action="cart-quantity" data-line-key="' + escapeHtml(line.key) + '" data-delta="-1" aria-label="کم کردن تعداد">−</button><b>' + num(line.qty) + '</b><button type="button" data-action="cart-quantity" data-line-key="' + escapeHtml(line.key) + '" data-delta="1" aria-label="زیاد کردن تعداد">+</button></div></div><span class="cart-line-price">' + money(unitPrice(product, line.options || {}) * line.qty) + '<button class="text-button" type="button" data-action="remove-line" data-line-key="' + escapeHtml(line.key) + '" style="display:flex;margin-top:5px;font-size:.63rem">حذف</button></span></article>';
    }).join("");
    var offers = availableOffers();
    var rewards = availableRewards();
    if (state.cartOffer && !offers.some(function (item) { return item.id === state.cartOffer; })) state.cartOffer = "";
    if (state.cartReward && !rewards.some(function (item) { return item.code === state.cartReward; })) state.cartReward = "";
    var totals = cartTotals();
    var offerOptions = offers.map(function (offer) { return '<option value="' + offer.id + '"' + (state.cartOffer === offer.id ? " selected" : "") + '>' + escapeHtml(offer.code + " · " + (offer.discount ? offer.discount + "٪ تخفیف" : money(offer.fixed) + " تخفیف")) + '</option>'; }).join("");
    var rewardOptions = rewards.map(function (reward) { return '<option value="' + escapeHtml(reward.code) + '"' + (state.cartReward === reward.code ? " selected" : "") + '>' + escapeHtml(reward.name + " · " + reward.code) + '</option>'; }).join("");
    drawerContent.innerHTML = '<div class="cart-lines">' + lines + '</div>' +
      '<div class="cart-options"><div class="cart-options-title">تنظیم‌های پیشرفته‌ی سفارش</div>' +
      '<label class="cart-select-row"><span>کد تخفیف</span><select class="select-control" data-cart-field="offer"><option value="">بدون کد</option>' + offerOptions + '</select></label>' +
      '<label class="cart-select-row"><span>پاداش امتیازی</span><select class="select-control" data-cart-field="reward"><option value="">بدون پاداش</option>' + rewardOptions + '</select></label>' +
      '<label class="cart-check"><input type="checkbox" data-cart-field="usePoints"' + (state.usePoints ? " checked" : "") + ' ' + (state.points ? "" : "disabled") + '> استفاده از امتیازها (هر امتیاز ' + money(POINT_VALUE) + '؛ حداکثر ۳۰٪ سفارش)</label>' +
      ((!offers.length && !rewards.length) ? '<small class="muted">برای انتخاب تخفیف، اول یک پیشنهاد را از صفحه‌ی پیشنهادها فعال کن.</small>' : "") + '</div>' +
      '<div class="cart-summary"><div class="summary-row"><span>جمع سفارش · ' + num(totalItems) + ' آیتم</span><b>' + money(totals.subtotal) + '</b></div>' +
      (totals.offerDiscount ? '<div class="summary-row is-discount"><span>تخفیف پیشنهاد</span><b>− ' + money(totals.offerDiscount) + '</b></div>' : "") +
      (totals.rewardDiscount ? '<div class="summary-row is-discount"><span>پاداش باشگاه</span><b>− ' + money(totals.rewardDiscount) + '</b></div>' : "") +
      (totals.pointsDiscount ? '<div class="summary-row is-discount"><span>اعتبار امتیاز (' + num(totals.pointsUsed) + ')</span><b>− ' + money(totals.pointsDiscount) + '</b></div>' : "") +
      '<div class="summary-row total"><span>مبلغ نهایی نمایشی</span><b>' + money(totals.total) + '</b></div></div>' +
      '<div class="cart-footer"><button class="app-button" type="button" data-action="checkout">ادامه و ثبت سفارش آزمایشی <span aria-hidden="true">←</span></button><p class="cart-disclaimer">پرداختی انجام نمی‌شود و سفارش به کافه ارسال نخواهد شد.</p></div>';
  }

  function openCart() {
    renderCartDrawer();
    returnFocus = document.activeElement;
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    document.body.classList.add("drawer-open");
    var closeButton = drawer.querySelector('[data-action="close-cart"]');
    if (closeButton) closeButton.focus({ preventScroll: true });
  }

  function closeCart() {
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    document.body.classList.remove("drawer-open");
    if (returnFocus && typeof returnFocus.focus === "function") returnFocus.focus({ preventScroll: true });
  }

  function openModal(html, wide) {
    returnFocus = document.activeElement;
    modalContent.innerHTML = html;
    modalDialog.classList.toggle("modal-dialog--wide", !!wide);
    modalRoot.hidden = false;
    document.body.classList.add("modal-open");
    var focusable = modalRoot.querySelector("input, select, textarea, button");
    if (focusable) setTimeout(function () { focusable.focus({ preventScroll: true }); }, 20);
  }

  function closeModal() {
    modalRoot.hidden = true;
    modalContent.innerHTML = "";
    document.body.classList.remove("modal-open");
    if (returnFocus && typeof returnFocus.focus === "function") returnFocus.focus({ preventScroll: true });
  }

  function productModal(productId) {
    var product = getProduct(productId);
    if (!product) return;
    var options = product.customizable ? '<div class="customize-grid"><div class="modal-field"><label for="drinkSize">اندازه</label><select class="select-control" id="drinkSize" name="size"><option value="small">کوچک · ۱۵٬۰۰۰ تومان کمتر</option><option value="regular" selected>متوسط · قیمت پایه</option><option value="large">بزرگ · ۴۰٬۰۰۰ تومان بیشتر</option></select></div>' +
      '<div class="modal-field"><label for="drinkMilk">نوع شیر</label><select class="select-control" id="drinkMilk" name="milk"><option value="regular">شیر معمولی</option><option value="oat">شیر جو دوسر · ۳۰٬۰۰۰ تومان</option><option value="lactoseFree">بدون لاکتوز · ۲۰٬۰۰۰ تومان</option></select></div>' +
      '<div class="modal-field"><label for="drinkSugar">میزان شکر</label><select class="select-control" id="drinkSugar" name="sugar"><option value="0">بدون شکر</option><option value="1">کم · ۱</option><option value="2" selected>معمولی · ۲</option><option value="3">شیرین · ۳</option></select></div>' +
      '<label class="filter-option" style="align-self:end;padding:10px 0"><input type="checkbox" name="extraShot"> افزودن یک شات اسپرسو · ۲۵٬۰۰۰ تومان</label></div>' : '<p class="modal-info">این محصول به‌صورت استاندارد آماده می‌شود. تعداد را می‌توانی در سبد تغییر بدهی.</p>';
    openModal('<div class="modal-head"><div><span class="view-eyebrow">شخصی‌سازی محصول</span><h2 id="modalTitle">' + escapeHtml(product.name) + '</h2><p>' + escapeHtml(product.desc) + '</p></div><button class="modal-close" type="button" data-action="close-modal" aria-label="بستن">×</button></div>' +
      '<div class="product-detail-art">' + product.icon + '</div><div class="row" style="justify-content:space-between"><span class="welcome-tag">★ ' + product.rating.toFixed(1) + ' · ' + escapeHtml(product.tags.join(" · ")) + '</span><span class="tiny muted">حدود ' + num(product.calories) + ' کالری</span></div>' +
      '<form id="productCustomizeForm" data-product-id="' + product.id + '">' + options + '<div class="modal-add-row"><strong id="detailPrice">' + money(product.price) + '</strong><button class="app-button" type="button" data-action="modal-add-product" data-product-id="' + product.id + '">افزودن به سبد</button></div></form>', true);
  }

  function detailPriceFromForm(form, product) {
    if (!product || !product.customizable || !form) return product ? product.price : 0;
    var data = new FormData(form);
    return unitPrice(product, { size: data.get("size") || "regular", milk: data.get("milk") || "regular", extraShot: data.has("extraShot"), sugar: Number(data.get("sugar") || 2) });
  }

  function checkoutModal() {
    if (!cartCount()) { showToast("سبد سفارش خالی است."); return; }
    var totals = cartTotals();
    var count = cartCount();
    closeCart();
    openModal('<div class="modal-head"><div><span class="view-eyebrow">مرحله‌ی آخر · بدون پرداخت</span><h2 id="modalTitle">ثبت سفارش آزمایشی</h2><p>روش تحویل را انتخاب کن؛ هیچ اطلاعاتی به کافه فرستاده نمی‌شود.</p></div><button class="modal-close" type="button" data-action="close-modal" aria-label="بستن">×</button></div>' +
      '<div class="checkout-summary"><span>' + num(count) + ' آیتم · ' + escapeHtml(getLocation().name) + '</span><b>' + money(totals.total) + '</b></div>' +
      '<form id="checkoutForm" class="checkout-form"><div class="form-field"><label>روش دریافت سفارش</label><div class="checkout-methods"><label class="checkout-method"><input type="radio" name="fulfillment" value="dinein" checked><span>🍽️ سرو در کافه · میز ۷</span></label><label class="checkout-method"><input type="radio" name="fulfillment" value="takeaway"><span>🥡 بیرون‌بر</span></label></div></div>' +
      '<div class="form-field"><label for="orderNote">یادداشت برای سفارش (اختیاری)</label><textarea class="form-control checkout-note" id="orderNote" name="note" maxlength="180" placeholder="مثلاً شیر جو دوسر را جداگانه اضافه کنید..."></textarea></div>' +
      '<div class="modal-info">ثبت سفارش فقط یک رویداد نمایشی در مرورگر است. پرداخت آنلاین، رزرو واقعی و اتصال به صندوق فعال نیست.</div>' +
      '<div class="modal-actions"><button class="app-button app-button--quiet" type="button" data-action="close-modal">بازگشت</button><button class="app-button" type="submit">تأیید سفارش آزمایشی</button></div></form>', false);
  }

  function locationModal() {
    var html = LOCATIONS.map(function (location) {
      var selected = state.location === location.id;
      return '<button class="location-option' + (selected ? " is-selected" : "") + '" type="button" data-action="select-location" data-location-id="' + location.id + '"><span><b>' + escapeHtml(location.name) + '</b><small>' + escapeHtml(location.address) + ' · ' + escapeHtml(location.wait) + '</small></span><span>' + (selected ? "✓" : "←") + '</span></button>';
    }).join("");
    openModal('<div class="modal-head"><div><span class="view-eyebrow">انتخاب شعبه</span><h2 id="modalTitle">از کدام کافه سفارش می‌دهی؟</h2><p>شعبه‌ی انتخابی فقط برای نمایش منو و زمان نمونه استفاده می‌شود.</p></div><button class="modal-close" type="button" data-action="close-modal" aria-label="بستن">×</button></div><div class="location-list">' + html + '</div>', false);
  }

  function orderDetails(orderId) {
    var order = state.orders.find(function (item) { return String(item.id) === String(orderId); });
    if (!order) return;
    var lines = safeArray(order.items, []).map(function (item) {
      return '<div class="order-modal-line"><span>' + (item.icon || "☕") + ' ' + escapeHtml(item.name) + ' × ' + num(item.qty || 1) + '</span><b>' + money((item.unitPrice || 0) * (item.qty || 1)) + '</b></div>';
    }).join("");
    var active = isActiveOrder(order);
    openModal('<div class="modal-head"><div><span class="view-eyebrow">' + (active ? "در حال آماده‌سازی" : "سفارش تحویل‌شده") + '</span><h2 id="modalTitle">سفارش ' + escapeHtml(order.id) + '</h2><p>' + escapeHtml(order.date || "سفارش نمونه") + ' · ' + escapeHtml(order.fulfillment || "بیرون‌بر") + '</p></div><button class="modal-close" type="button" data-action="close-modal" aria-label="بستن">×</button></div>' +
      '<div class="order-modal-lines">' + lines + '</div><div class="summary-row"><span>تخفیف</span><b>' + (order.discount ? "− " + money(order.discount) : money(0)) + '</b></div><div class="summary-row total" style="padding-top:10px;border-top:1px solid var(--app-border)"><span>جمع نهایی</span><b>' + money(order.total || 0) + '</b></div>' +
      (order.note ? '<div class="modal-info" style="margin-top:12px">یادداشت: ' + escapeHtml(order.note) + '</div>' : "") +
      (active ? '<div class="order-timeline"><span class="order-step is-done">ثبت سفارش</span><span class="order-step is-current">آماده‌سازی</span><span class="order-step">آماده‌ی تحویل</span></div>' : '<p class="modal-info" style="margin-top:13px">امتیاز دریافتی در این سفارش: ' + num(order.pointsEarned || 0) + ' · اطلاعات این سفارش نمونه است.</p>'), false);
  }

  function confirmResetModal() {
    openModal('<div class="modal-head"><div><span class="view-eyebrow">بازنشانی حساب دمو</span><h2 id="modalTitle">همه‌ی داده‌های آزمایشی پاک شود؟</h2><p>امتیازها، سفارش‌ها، علاقه‌مندی‌ها، تنظیمات و سبد خرید از همین مرورگر حذف می‌شوند.</p></div><button class="modal-close" type="button" data-action="close-modal" aria-label="بستن">×</button></div><div class="modal-info">این کار فقط داده‌های محلی CafeLoop را پاک می‌کند و قابل بازگشت نیست.</div><div class="modal-actions"><button class="app-button app-button--quiet" type="button" data-action="close-modal">انصراف</button><button class="app-button app-button--danger" type="button" data-action="reset-demo">بله، پاک کن</button></div>', false);
  }

  function showToast(message) {
    if (!toastNode) return;
    toastNode.textContent = message;
    toastNode.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastNode.classList.remove("is-visible"); }, 2900);
  }

  function toggleFavorite(productId) {
    var index = state.favorites.indexOf(productId);
    if (index === -1) {
      state.favorites.push(productId);
      showToast("به علاقه‌مندی‌ها اضافه شد ♥");
    } else {
      state.favorites.splice(index, 1);
      showToast("از علاقه‌مندی‌ها حذف شد.");
    }
    render();
  }

  function claimOffer(offerId) {
    var offer = getOffer(offerId);
    if (!offer) return;
    if (state.usedOffers.indexOf(offerId) !== -1) { showToast("این پیشنهاد قبلاً استفاده شده است."); return; }
    if (state.claimedOffers.indexOf(offerId) === -1) state.claimedOffers.push(offerId);
    saveState();
    render();
    showToast("کد " + offer.code + " فعال شد؛ آن را در سبد انتخاب کن.");
  }

  function redeemReward(rewardId) {
    var reward = getReward(rewardId);
    if (!reward) return;
    if (state.points < reward.points) { showToast("امتیاز کافی برای این پاداش نداری."); return; }
    state.points -= reward.points;
    var code = "GIFT-" + reward.id.toUpperCase() + "-" + Math.floor(1000 + Math.random() * 9000);
    state.redeemedRewards.unshift({ rewardId: reward.id, name: reward.title, code: code, discount: reward.discount, used: false, date: formatDate(new Date()) });
    state.transactions.unshift({ label: "دریافت پاداش: " + reward.title, date: "امتیاز مصرف‌شده: " + num(reward.points), delta: -reward.points });
    state.cartReward = code;
    saveState();
    render();
    showToast("پاداش فعال شد؛ " + code + " را در سبد سفارش انتخاب کن.");
  }

  function reorder(orderId) {
    var order = state.orders.find(function (item) { return String(item.id) === String(orderId); });
    if (!order) return;
    safeArray(order.items, []).forEach(function (item) {
      var product = getProduct(item.productId);
      if (!product) return;
      addToCart(product.id, item.options || {}, item.qty || 1);
    });
    state.view = "menu";
    if (window.location.hash !== "#menu") window.history.pushState({ mvpView: "menu" }, "", "#menu");
    render();
    openCart();
  }

  function updateCartLine(key, delta) {
    var line = state.cart.find(function (item) { return item.key === key; });
    if (!line) return;
    line.qty += Number(delta);
    if (line.qty <= 0) state.cart = state.cart.filter(function (item) { return item.key !== key; });
    saveState();
    updateChrome();
    renderCartDrawer();
  }

  function copyCode(code) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code).then(function () { showToast("کد " + code + " کپی شد."); }).catch(function () { showToast("کد: " + code); });
    } else showToast("کد: " + code);
  }

  function handleClick(event) {
    var nav = event.target.closest("[data-view]");
    if (nav) {
      event.preventDefault();
      navigate(nav.dataset.view);
      return;
    }
    var actionNode = event.target.closest("[data-action]");
    if (!actionNode) {
      if (event.target === modalRoot) closeModal();
      return;
    }
    var action = actionNode.dataset.action;
    if (action === "open-cart") { openCart(); return; }
    if (action === "close-cart") { closeCart(); return; }
    if (action === "close-modal") { closeModal(); return; }
    if (action === "choose-location") { locationModal(); return; }
    if (action === "select-location") {
      if (LOCATIONS.some(function (item) { return item.id === actionNode.dataset.locationId; })) state.location = actionNode.dataset.locationId;
      saveState(); updateChrome(); closeModal(); showToast("شعبه‌ی سفارش تغییر کرد."); return;
    }
    if (action === "toggle-theme") {
      state.theme = state.theme === "dark" ? "light" : "dark";
      saveState(); updateChrome();
      if (state.view === "profile") render();
      showToast(state.theme === "dark" ? "پوسته‌ی تیره فعال شد." : "پوسته‌ی روشن فعال شد."); return;
    }
    if (action === "toggle-setting") {
      var setting = actionNode.dataset.setting;
      if (Object.prototype.hasOwnProperty.call(state.settings, setting)) state.settings[setting] = !state.settings[setting];
      render(); showToast("تنظیمات ذخیره شد."); return;
    }
    if (action === "toggle-favorite") { toggleFavorite(actionNode.dataset.productId); return; }
    if (action === "quick-add") {
      var item = getProduct(actionNode.dataset.productId);
      if (!item) return;
      addToCart(item.id, {}, 1);
      showToast(item.name + " به سبد اضافه شد."); return;
    }
    if (action === "product-detail") { productModal(actionNode.dataset.productId); return; }
    if (action === "modal-add-product") {
      var form = document.getElementById("productCustomizeForm");
      var product = getProduct(actionNode.dataset.productId);
      if (!product) return;
      var data = form ? new FormData(form) : null;
      var options = product.customizable ? {
        size: data ? data.get("size") || "regular" : "regular",
        milk: data ? data.get("milk") || "regular" : "regular",
        sugar: data ? Number(data.get("sugar") || 2) : 2,
        extraShot: data ? data.has("extraShot") : false
      } : {};
      addToCart(product.id, options, 1);
      closeModal(); showToast(product.name + " با تنظیم انتخابی به سبد اضافه شد."); return;
    }
    if (action === "toggle-filters") {
      var filterPanel = document.getElementById("advancedFilters");
      if (filterPanel) {
        var open = !filterPanel.classList.contains("is-open");
        filterPanel.classList.toggle("is-open", open);
        actionNode.setAttribute("aria-expanded", String(open));
      }
      return;
    }
    if (action === "select-category" || action === "pick-category") {
      state.menuFilters.category = actionNode.dataset.category || "all";
      state.menuFilters.onlyFavorites = false;
      state.view = "menu";
      if (window.location.hash !== "#menu") window.history.pushState({ mvpView: "menu" }, "", "#menu");
      render(); return;
    }
    if (action === "clear-menu-filters") {
      state.menuFilters = Object.assign({}, DEFAULT_STATE.menuFilters);
      render(); showToast("فیلترهای منو پاک شدند."); return;
    }
    if (action === "claim-offer") { claimOffer(actionNode.dataset.offerId); return; }
    if (action === "copy-code") { copyCode(actionNode.dataset.code || ""); return; }
    if (action === "redeem-reward") { redeemReward(actionNode.dataset.rewardId); return; }
    if (action === "cart-quantity") { updateCartLine(actionNode.dataset.lineKey, actionNode.dataset.delta); return; }
    if (action === "remove-line") {
      state.cart = state.cart.filter(function (line) { return line.key !== actionNode.dataset.lineKey; });
      saveState(); updateChrome(); renderCartDrawer(); showToast("محصول از سبد حذف شد."); return;
    }
    if (action === "checkout") { checkoutModal(); return; }
    if (action === "order-detail") { orderDetails(actionNode.dataset.orderId); return; }
    if (action === "reorder") { reorder(actionNode.dataset.orderId); return; }
    if (action === "confirm-reset") { confirmResetModal(); return; }
    if (action === "reset-demo") {
      try { localStorage.removeItem(STORAGE_KEY); } catch (error) {}
      state = clone(DEFAULT_STATE);
      state.view = "home";
      closeModal();
      if (window.location.hash !== "#home") window.history.pushState({ mvpView: "home" }, "", "#home");
      render(); showToast("داده‌های دمو پاک و نمونه‌ی اولیه بازیابی شد."); return;
    }
  }

  function handleInput(event) {
    if (event.target && event.target.id === "menuSearch") {
      state.menuFilters.query = event.target.value;
      renderMenuResults();
      saveState();
    }
    if (event.target && event.target.closest("#productCustomizeForm")) {
      var form = event.target.closest("#productCustomizeForm");
      var product = getProduct(form.dataset.productId);
      var priceNode = document.getElementById("detailPrice");
      if (priceNode && product) priceNode.textContent = money(detailPriceFromForm(form, product));
    }
  }

  function handleChange(event) {
    var target = event.target;
    if (!target) return;
    if (target.dataset.filter) {
      state.menuFilters[target.dataset.filter] = target.checked;
      renderMenuResults(); saveState(); return;
    }
    if (target.id === "menuSort") {
      state.menuFilters.sort = target.value;
      renderMenuResults(); saveState(); return;
    }
    if (target.dataset.cartField) {
      if (target.dataset.cartField === "offer") state.cartOffer = target.value;
      if (target.dataset.cartField === "reward") state.cartReward = target.value;
      if (target.dataset.cartField === "usePoints") state.usePoints = target.checked;
      saveState(); renderCartDrawer(); return;
    }
  }

  function handleSubmit(event) {
    var form = event.target;
    if (!form || !form.id) return;
    if (form.id === "profileForm") {
      event.preventDefault();
      var data = new FormData(form);
      var name = String(data.get("name") || "").trim();
      var phoneRaw = String(data.get("phone") || "").trim();
      var phoneDigits = digitsToLatin(phoneRaw).replace(/[\s()-]/g, "");
      var normalizedPhone = phoneDigits.replace(/^\+98/, "0").replace(/^98(?=9)/, "0");
      if (name.length < 2) { showToast("نام نمایشی باید حداقل دو حرف داشته باشد."); return; }
      if (!/^09\d{9}$/.test(normalizedPhone)) { showToast("شماره موبایل را به‌شکل ۰۹۱۲۱۲۳۴۵۶۷ وارد کن."); return; }
      state.profile = { name: name, phone: normalizedPhone, birthday: String(data.get("birthday") || ""), preference: String(data.get("preference") || "all") };
      saveState(); render(); showToast("پروفایل با موفقیت در همین مرورگر ذخیره شد."); return;
    }
    if (form.id === "checkoutForm") {
      event.preventDefault();
      if (!cartCount()) { closeModal(); showToast("سبد سفارش خالی است."); return; }
      var formData = new FormData(form);
      var totals = cartTotals();
      var items = state.cart.map(function (line) {
        var product = getProduct(line.productId);
        return { productId: line.productId, name: product ? product.name : "محصول", icon: product ? product.icon : "☕", qty: line.qty, unitPrice: product ? unitPrice(product, line.options || {}) : 0, options: clone(line.options || {}) };
      });
      var pointsEarned = Math.floor(totals.total / 10000);
      var allDiscount = totals.offerDiscount + totals.rewardDiscount + totals.pointsDiscount;
      var newOrder = {
        id: "CL-" + String(Date.now()).slice(-6),
        date: formatDate(new Date()),
        status: "preparing",
        fulfillment: formData.get("fulfillment") === "takeaway" ? "بیرون‌بر" : "سرو در کافه · میز ۷",
        total: totals.total,
        subtotal: totals.subtotal,
        discount: allDiscount,
        pointsEarned: pointsEarned,
        note: String(formData.get("note") || "").trim(),
        sample: true,
        items: items
      };
      state.points = Math.max(0, state.points - totals.pointsUsed) + pointsEarned;
      if (pointsEarned) state.transactions.unshift({ label: "امتیاز سفارش " + newOrder.id, date: "۱ امتیاز به‌ازای هر ۱۰ هزار تومان", delta: pointsEarned });
      if (totals.pointsUsed) state.transactions.unshift({ label: "اعتبار مصرف‌شده در سفارش " + newOrder.id, date: "امتیاز استفاده‌شده", delta: -totals.pointsUsed });
      if (totals.offer) state.usedOffers.push(totals.offer.id);
      if (totals.reward) {
        var usedReward = state.redeemedRewards.find(function (item) { return item.code === totals.reward.code; });
        if (usedReward) usedReward.used = true;
      }
      state.orders.push(newOrder);
      state.cart = [];
      state.cartOffer = "";
      state.cartReward = "";
      state.usePoints = false;
      saveState();
      closeModal();
      state.view = "orders";
      if (window.location.hash !== "#orders") window.history.pushState({ mvpView: "orders" }, "", "#orders");
      render();
      showToast("سفارش آزمایشی " + newOrder.id + " ثبت شد؛ " + num(pointsEarned) + " امتیاز گرفتی.");
    }
  }

  function handleKeydown(event) {
    if (event.key === "Escape") {
      if (!modalRoot.hidden) closeModal();
      else if (drawer.classList.contains("is-open")) closeCart();
    }
  }

  function init() {
    state = loadState();
    state.view = getViewFromHash();
    render();
    document.addEventListener("click", handleClick);
    document.addEventListener("input", handleInput);
    document.addEventListener("change", handleChange);
    document.addEventListener("submit", handleSubmit);
    document.addEventListener("keydown", handleKeydown);
    window.addEventListener("popstate", function () {
      state.view = getViewFromHash();
      render();
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
