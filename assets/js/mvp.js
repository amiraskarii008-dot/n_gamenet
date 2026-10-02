/* CafeLoop customer MVP — local, interactive prototype (no payment or backend). */
(function () {
  "use strict";

  // Versioned namespace: never import or display data left by the earlier MVP demo.
  var STORAGE_KEY = "cafeloop-mvp-workspace-v2";
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
  var pendingConfirm = null;
  var adminSearch = { menu: "", customers: "" };
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
    mode: "customer",
    profile: { id: "", name: "", phone: "", birthday: "", preference: "all" },
    cafe: { name: "کافه نوآر", branch: "جردن", pointsPerSpend: 10000, pointValue: 100 },
    location: "jordan",
    points: 0,
    favorites: [],
    menuItems: clone(MENU),
    customers: [],
    offers: [],
    cart: [],
    cartOffer: "",
    cartReward: "",
    usePoints: false,
    claimedOffers: [],
    usedOffers: [],
    redeemedRewards: [],
    orders: [],
    transactions: [],
    settings: { orderUpdates: true, offers: true },
    menuFilters: { category: "all", query: "", sort: "featured", onlyFavorites: false, vegetarian: false, caffeineFree: false, under200: false },
    theme: "dark",
    sampleDataAdded: false
  };

  var CUSTOMER_VIEWS = ["home", "menu", "favorites", "loyalty", "offers", "orders", "profile"];
  var ADMIN_VIEWS = ["dashboard", "adminMenu", "adminOrders", "adminCustomers", "adminOffers", "adminSettings"];
  var VIEWS = {
    home: "خانه مشتری",
    menu: "منوی کافه",
    favorites: "علاقه‌مندی‌ها",
    loyalty: "باشگاه امتیاز",
    offers: "پیشنهادهای من",
    orders: "سفارش‌های من",
    profile: "پروفایل مشتری",
    dashboard: "داشبورد مدیریت",
    adminMenu: "مدیریت منو",
    adminOrders: "مدیریت سفارش‌ها",
    adminCustomers: "مدیریت مشتریان",
    adminOffers: "مدیریت پیشنهادها",
    adminSettings: "تنظیمات و داده‌ها"
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
  function getProduct(id) {
    var list = state && Array.isArray(state.menuItems) ? state.menuItems : MENU;
    return list.find(function (item) { return item.id === id; });
  }
  function getOffer(id) { return state && Array.isArray(state.offers) ? state.offers.find(function (item) { return item.id === id; }) : undefined; }
  function isAvailable(product) { return !!product && product.available !== false; }
  function currentCustomer() { return state.customers.find(function (customer) { return customer.id === state.profile.id; }) || null; }
  function isAdminView(view) { return ADMIN_VIEWS.indexOf(view) !== -1; }
  function getReward(id) { return REWARDS.find(function (item) { return item.id === id; }); }
  function getLocation() {
    var location = LOCATIONS.find(function (item) { return item.id === state.location; }) || LOCATIONS[0];
    var branch = String(state.cafe && state.cafe.branch || location.name.split("·").pop()).trim();
    return Object.assign({}, location, { name: String(state.cafe && state.cafe.name || "کافه نوآر").trim() + " · " + branch });
  }
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
    if (saved.cafe && typeof saved.cafe === "object") next.cafe = Object.assign(next.cafe, saved.cafe);
    if (LOCATIONS.some(function (item) { return item.id === saved.location; })) next.location = saved.location;
    if (Number.isFinite(Number(saved.points))) next.points = Math.max(0, Number(saved.points));
    if (saved.mode === "admin" || saved.mode === "customer") next.mode = saved.mode;
    next.menuItems = safeArray(saved.menuItems, next.menuItems).filter(function (item) {
      return item && item.id && typeof item.name === "string" && Number(item.price) >= 0;
    });
    next.customers = safeArray(saved.customers, []).filter(function (item) { return item && item.id && typeof item.name === "string"; });
    next.offers = safeArray(saved.offers, []).filter(function (item) { return item && item.id && typeof item.title === "string"; });
    var productExists = function (id) { return next.menuItems.some(function (item) { return item.id === id; }); };
    next.favorites = safeArray(saved.favorites, []).filter(function (id) { return productExists(id); });
    next.cart = safeArray(saved.cart, []).filter(function (line) {
      return line && productExists(line.productId) && Number(line.qty) > 0;
    }).map(function (line) {
      var options = Object.assign({ size: "regular", milk: "regular", extraShot: false, sugar: 2 }, line.options || {});
      return { key: line.key || lineKey(line.productId, options), productId: line.productId, qty: Math.min(20, Number(line.qty) || 1), options: options };
    });
    next.cartOffer = typeof saved.cartOffer === "string" ? saved.cartOffer : "";
    next.cartReward = typeof saved.cartReward === "string" ? saved.cartReward : "";
    next.usePoints = !!saved.usePoints;
    next.claimedOffers = safeArray(saved.claimedOffers, []).filter(function (id) { return next.offers.some(function (offer) { return offer.id === id; }); });
    next.usedOffers = safeArray(saved.usedOffers, []).filter(function (id) { return next.offers.some(function (offer) { return offer.id === id; }); });
    next.redeemedRewards = safeArray(saved.redeemedRewards, []).filter(function (item) { return item && getReward(item.rewardId); });
    next.orders = safeArray(saved.orders, []).filter(function (order) { return order && order.id && Array.isArray(order.items); });
    next.transactions = safeArray(saved.transactions, []).slice(0, 50);
    if (saved.settings && typeof saved.settings === "object") next.settings = Object.assign(next.settings, saved.settings);
    if (saved.menuFilters && typeof saved.menuFilters === "object") next.menuFilters = Object.assign(next.menuFilters, saved.menuFilters);
    if (saved.theme === "light" || saved.theme === "dark") next.theme = saved.theme;
    next.sampleDataAdded = !!saved.sampleDataAdded;
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
    state.mode = isAdminView(view) ? "admin" : "customer";
    if (addHistory !== false && window.location.hash !== "#" + view) window.history.pushState({ mvpView: view }, "", "#" + view);
    render();
    if (changed && window.matchMedia && window.matchMedia("(max-width: 860px)").matches) window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function switchMode(mode) {
    navigate(mode === "admin" ? "dashboard" : "home");
  }

  function renderNavigation() {
    var customerItems = [
      ["home", "⌂", "خانه"], ["menu", "☕", "منوی کافه"], ["favorites", "♡", "علاقه‌مندی‌ها"],
      ["loyalty", "✦", "باشگاه امتیاز"], ["offers", "♧", "پیشنهادها"], ["orders", "▤", "سفارش‌ها"], ["profile", "◎", "پروفایل"]
    ];
    var adminItems = [
      ["dashboard", "▦", "داشبورد"], ["adminMenu", "☕", "منو"], ["adminOrders", "▤", "سفارش‌ها"],
      ["adminCustomers", "♙", "مشتری‌ها"], ["adminOffers", "♧", "پیشنهادها"], ["adminSettings", "⚙", "تنظیمات"]
    ];
    var items = state.mode === "admin" ? adminItems : customerItems;
    var sideNav = document.getElementById("sideNav");
    var mobileNav = document.getElementById("mobileNav");
    var label = document.getElementById("sidebarLabel");
    var member = document.getElementById("sidebarMember");
    var modeButtons = document.querySelectorAll("[data-mode]");
    if (sideNav) sideNav.innerHTML = items.map(function (item) {
      return '<button type="button" data-view="' + item[0] + '"><span class="nav-icon" aria-hidden="true">' + item[1] + '</span><span>' + item[2] + '</span><span class="nav-arrow" aria-hidden="true">←</span></button>';
    }).join("");
    if (mobileNav) {
      var mobileItems = state.mode === "admin" ? adminItems : [customerItems[0], customerItems[1], customerItems[3], customerItems[4], customerItems[5], customerItems[6]];
      mobileNav.style.gridTemplateColumns = "repeat(" + mobileItems.length + ",minmax(0,1fr))";
      mobileNav.innerHTML = mobileItems.map(function (item) {
        return '<button type="button" data-view="' + item[0] + '"><span aria-hidden="true">' + item[1] + '</span><small>' + item[2] + '</small></button>';
      }).join("");
    }
    if (label) label.textContent = state.mode === "admin" ? "فضای مدیریت" : "فضای مشتری";
    if (member) member.hidden = state.mode === "admin";
    modeButtons.forEach(function (button) {
      var active = button.dataset.mode === state.mode;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-selected", String(active));
    });
  }

  function updateChrome() {
    renderNavigation();
    var locationNode = document.getElementById("currentLocation");
    var countNode = document.getElementById("cartCount");
    var initialNode = document.getElementById("headerInitials");
    var sidebarPoints = document.getElementById("sidebarPoints");
    var sidebarProgress = document.getElementById("sidebarProgress");
    var sidebarText = document.getElementById("sidebarProgressText");
    var sidebarLabel = document.getElementById("sidebarMemberLabel");
    var themeIcon = document.getElementById("themeIcon");
    var cartButton = document.getElementById("headerCartButton");
    var avatarButton = document.getElementById("headerAvatarButton");
    var workspaceStatus = document.getElementById("workspaceStatus");
    var headerSubtitle = document.getElementById("headerSubtitle");
    var count = state.cart.reduce(function (total, line) { return total + Number(line.qty || 0); }, 0);
    var progress = Math.min(100, state.points / MILESTONE * 100);
    var remaining = Math.max(0, MILESTONE - state.points);
    if (locationNode) locationNode.textContent = getLocation().name;
    if (countNode) countNode.textContent = num(count);
    if (initialNode) initialNode.textContent = initials(state.profile.name);
    if (sidebarPoints) sidebarPoints.textContent = num(state.points);
    if (sidebarProgress) sidebarProgress.style.width = progress + "%";
    if (sidebarText) sidebarText.textContent = state.profile.id ? (remaining ? num(remaining) + " امتیاز تا پاداش بعدی" : "پاداش بعدی آماده است") : "پروفایل بساز و امتیاز جمع کن";
    if (sidebarLabel) sidebarLabel.textContent = state.profile.id ? "امتیاز مشتری" : "شروع بدون حساب قبلی";
    if (themeIcon) themeIcon.textContent = state.theme === "dark" ? "☼" : "☾";
    if (cartButton) cartButton.hidden = state.mode === "admin";
    if (avatarButton) { avatarButton.dataset.view = state.mode === "admin" ? "adminSettings" : "profile"; avatarButton.setAttribute("aria-label", state.mode === "admin" ? "تنظیمات مدیریت" : "پروفایل مشتری"); }
    if (workspaceStatus) workspaceStatus.textContent = state.mode === "admin" ? state.cafe.name + " · مدیریت محلی · ذخیره خودکار" : state.cafe.name + " · منوی نمونه · حساب و سفارش‌ها از صفر شروع می‌شوند";
    if (headerSubtitle) headerSubtitle.textContent = state.mode === "admin" ? "داشبورد مدیریت" : "تجربه‌ی مشتری";
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
    else if (state.view === "profile") content = renderProfile();
    else if (state.view === "dashboard") content = renderAdminDashboard();
    else if (state.view === "adminMenu") content = renderAdminMenu();
    else if (state.view === "adminOrders") content = renderAdminOrders();
    else if (state.view === "adminCustomers") content = renderAdminCustomers();
    else if (state.view === "adminOffers") content = renderAdminOffers();
    else content = renderAdminSettings();
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

  function customerOrders() {
    if (!state.profile.id) return state.orders.filter(function (order) { return !order.customerId; });
    return state.orders.filter(function (order) { return order.customerId === state.profile.id; });
  }

  function renderHomeOffer() {
    if (state.settings.offers === false) return "";
    var offer = state.offers.find(function (item) { return item.active !== false && state.usedOffers.indexOf(item.id) === -1; });
    if (!offer) return '<div class="section-block"><div class="empty-inline"><span>🎁</span><b>فعلاً پیشنهادی ثبت نشده</b><small>مدیر می‌تواند از داشبورد یک پیشنهاد تازه بسازد.</small></div></div>';
    var claimed = state.claimedOffers.indexOf(offer.id) !== -1;
    return '<div class="section-block"><div class="feature-offer"><div><span class="view-eyebrow">پیشنهاد مشتری · ' + (offer.discount ? num(offer.discount) + '٪' : money(offer.fixed || 0)) + '</span><h3>' + escapeHtml(offer.title) + '</h3><p>' + escapeHtml(offer.description || "برای سفارش بعدی فعالش کن.") + '</p></div><span class="offer-symbol" aria-hidden="true">' + (offer.icon || "🎁") + '</span><button class="app-button app-button--small" type="button" data-action="claim-offer" data-offer-id="' + escapeHtml(offer.id) + '">' + (claimed ? "کد فعال است · دیدن پیشنهادها" : "فعال‌سازی پیشنهاد") + '</button></div></div>';
  }

  function renderHome() {
    var name = escapeHtml(String(state.profile.name || "دوست کافه").split(/\s+/)[0]);
    var topPicks = ["americano", "latte", "cheesecake"].map(getProduct).filter(isAvailable);
    var myOrders = customerOrders();
    var categoryMarkup = [
      { id: "coffee", title: "قهوه و نوشیدنی گرم", note: "اسپرسوهای تازه", icon: "☕" },
      { id: "cold", title: "نوشیدنی‌های سرد", note: "خنک و دست‌ساز", icon: "🧊" },
      { id: "dessert", title: "شیرینی و دسر", note: "هر روز تازه", icon: "🥐" },
      { id: "all", title: "تمام منو", note: num(state.menuItems.filter(isAvailable).length) + " انتخاب" , icon: "✦" }
    ].map(function (category) {
      return '<button class="category-tile" type="button" data-action="pick-category" data-category="' + category.id + '"><span class="category-emoji">' + category.icon + '</span><span><b>' + category.title + '</b><small>' + category.note + '</small></span></button>';
    }).join("");
    var shortcuts = [
      { view: "menu", icon: "☕", title: "سفارش تازه", note: "انتخاب از منوی نمونه" },
      { view: "loyalty", icon: "✦", title: "امتیازهای من", note: num(state.points) + " امتیاز" },
      { view: "orders", icon: "▤", title: "پیگیری سفارش", note: myOrders.some(isActiveOrder) ? "یک سفارش در جریان" : "" + num(myOrders.length) + " سفارش" },
      { view: "favorites", icon: "♡", title: "علاقه‌مندی‌ها", note: num(state.favorites.length) + " انتخاب ذخیره‌شده" }
    ].map(function (item) {
      return '<button type="button" class="shortcut-card" data-view="' + item.view + '"><span class="shortcut-icon">' + item.icon + '</span><span><b>' + item.title + '</b><small>' + item.note + '</small></span></button>';
    }).join("");
    return '<section>' +
      '<div class="welcome-grid">' +
        '<article class="welcome-card"><button class="welcome-tag branch-home-button" type="button" data-action="choose-location"><span class="online-dot"></span> 📍 سفارش از ' + escapeHtml(getLocation().name) + ' · تغییر شعبه</button>' +
          '<h1>سلام ' + name + '،<br><span>قهوه‌ی بعدی</span> با ماست.</h1>' +
          '<p>منو را ببین، سفارش آزمایشی ثبت کن و با هر خرید امتیاز جمع کن. انتخاب امروزت را برایت آماده کرده‌ایم.</p>' +
          '<div class="welcome-actions"><button class="app-button" type="button" data-view="menu">دیدن منو <span aria-hidden="true">←</span></button>' +
          (state.profile.id ? '<button class="app-button app-button--quiet" type="button" data-view="offers">پیشنهادهای من</button>' : '<button class="app-button app-button--quiet" type="button" data-view="profile">ساخت پروفایل مشتری</button>') + '</div>' +
        '</article>' +
        '<article class="points-card"><div class="points-card-head"><span>امتیاز وفاداری تو</span><span class="level-pill">' + (state.profile.id ? "عضو CafeLoop" : "مهمان") + '</span></div>' +
          '<div><div class="points-balance">' + num(state.points) + '<small>امتیاز</small></div><div class="points-caption">' + progressText() + '</div>' +
          '<div class="progress-track"><span style="width:' + Math.min(100, state.points / MILESTONE * 100) + '%"></span></div>' +
          '<div class="points-card-foot"><span>۰</span><span><b>' + num(MILESTONE) + '</b> امتیاز</span></div></div>' +
          '<button class="text-button" type="button" data-view="loyalty">باشگاه و پاداش‌ها <span aria-hidden="true">←</span></button>' +
        '</article>' +
      '</div>' +
      '<div class="section-block"><div class="section-block-head"><div><h2>دسترسی سریع</h2><p>هر چیزی که برای تجربه‌ی امروز نیاز داری</p></div></div><div class="shortcut-grid">' + shortcuts + '</div></div>' +
      '<div class="section-block"><div class="section-block-head"><div><h2>از کجا شروع کنیم؟</h2><p>دسته‌بندی موردعلاقه‌ات را انتخاب کن</p></div><button class="text-button" type="button" data-view="menu">کل منو <span aria-hidden="true">←</span></button></div><div class="category-tiles">' + categoryMarkup + '</div></div>' +
      renderHomeOffer() +
      (topPicks.length ? '<div class="section-block"><div class="section-block-head"><div><h2>پیشنهادهای بارستا</h2><p>چند انتخاب از منوی ساختگی کافه</p></div><button class="text-button" type="button" data-view="menu">دیدن همه <span aria-hidden="true">←</span></button></div><div class="product-grid">' + topPicks.map(productCard).join("") + '</div></div>' : '') +
      renderRecentOrder() +
    '</section>';
  }

  function renderRecentOrder() {
    var myOrders = customerOrders();
    var order = myOrders[myOrders.length - 1];
    if (!order) return '';
    return '<div class="section-block"><div class="section-block-head"><div><h2>آخرین سفارش تو</h2><p>سفارش‌ها پس از ثبت در همین مرورگر می‌مانند</p></div><button class="text-button" type="button" data-view="orders">سفارش‌های من <span aria-hidden="true">←</span></button></div><div class="order-list">' + orderCard(order, isActiveOrder(order)) + '</div></div>';
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
    var result = state.menuItems.filter(function (item) {
      if (!isAvailable(item)) return false;
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
    var products = state.menuItems.filter(function (item) { return isAvailable(item) && state.favorites.indexOf(item.id) !== -1; });
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
    return viewHeading("باشگاه مشتریان · حساب محلی", "امتیازهایت را خرج خاطره‌ی بعدی کن.", "با هر " + money(state.cafe.pointsPerSpend || 10000) + " خرید، یک امتیاز می‌گیری. هر امتیاز در این نسخه معادل " + money(state.cafe.pointValue || POINT_VALUE) + " اعتبار است.", "") +
      '<div class="points-hero"><article class="points-total-card"><span class="view-eyebrow">باشگاه وفاداری CafeLoop</span><h2>موجودی امتیاز تو</h2><div class="points-total-number">' + num(state.points) + ' <small>امتیاز</small></div><p>' + progressText() + '</p><div class="progress-track"><span style="width:' + progress + '%"></span></div><div class="points-card-foot"><span>نقطه‌ی شروع</span><span>' + num(MILESTONE) + ' امتیاز = پاداش بعدی</span></div></article>' +
      '<article class="points-visual-card"><div class="points-ring" style="--progress:' + progress + '%"><b>' + num(Math.round(progress)) + '%</b><span>تا هدف بعدی</span></div><p>هر خرید، امتیازت را بیشتر می‌کند.<br>امتیاز قابل استفاده در همین مرورگر است.</p></article></div>' +
      '<div class="section-block"><div class="section-block-head"><div><h2>پاداش‌های قابل دریافت</h2><p>هر وقت امتیازت رسید، پاداش را فعال کن.</p></div></div><div class="reward-grid">' + rewardCards + '</div></div>' +
      '<div class="section-block"><div class="section-block-head"><div><h2>تاریخچه امتیاز</h2><p>تراکنش‌های نمونه‌ی حساب مشتری</p></div><span class="welcome-tag">' + num(state.transactions.length) + ' رویداد</span></div><div class="history-list">' + (transactions || '<div class="empty-state">هنوز تراکنشی ثبت نشده است.</div>') + '</div></div>' +
      '<p class="privacy-note" style="margin-top:16px">این موجودی نمونه است و ارزش نقدی واقعی ندارد. هیچ پرداختی انجام نمی‌شود؛ داده‌ی آزمایشی را هر زمان از تنظیمات حساب پاک کن.</p>';
  }

  function renderOffers() {
    var offersEnabled = state.settings.offers !== false;
    var activeOffers = offersEnabled ? state.offers.filter(function (offer) { return offer.active !== false; }) : [];
    var cards = activeOffers.map(function (offer) {
      var claimed = state.claimedOffers.indexOf(offer.id) !== -1;
      var used = state.usedOffers.indexOf(offer.id) !== -1;
      var status = used ? "استفاده‌شده" : claimed ? "فعال برای سفارش" : (offer.kind || "پیشنهاد تازه");
      var value = offer.discount ? num(offer.discount) + "٪ تخفیف" : money(offer.fixed || 0) + " اعتبار";
      return '<article class="offer-card"><div class="offer-card-head"><span class="offer-sticker">' + escapeHtml(offer.icon || "🎁") + '</span><span class="offer-status' + (claimed && !used ? " is-ready" : "") + '">' + escapeHtml(status) + '</span></div>' +
        '<h3>' + escapeHtml(offer.title) + '</h3><p>' + escapeHtml(offer.description || "برای سفارش بعدی فعالش کن.") + ' · ' + value + '</p>' +
        '<div class="offer-card-foot">' + (claimed ? '<span class="offer-code">' + escapeHtml(offer.code) + '</span><button class="text-button" type="button" data-action="copy-code" data-code="' + escapeHtml(offer.code) + '">کپی کد</button>' : '<span class="offer-expiry">حداقل سفارش ' + money(offer.minimum || 0) + '</span><button class="app-button app-button--small" type="button" data-action="claim-offer" data-offer-id="' + escapeHtml(offer.id) + '"' + (used ? " disabled" : "") + '>فعال‌سازی</button>') + '</div></article>';
    }).join("");
    var readyCount = offersEnabled ? state.claimedOffers.filter(function (id) { return state.usedOffers.indexOf(id) === -1; }).length : 0;
    var body = activeOffers.length ? '<div class="offer-grid">' + cards + '</div>' : offersEnabled ? emptyState("🎁", "هنوز پیشنهادی ثبت نشده", "به محض اینکه مدیر یک پیشنهاد فعال کند، اینجا می‌بینی.", '<button class="app-button app-button--small" type="button" data-view="menu">رفتن به منو</button>') : emptyState("🔕", "نمایش پیشنهادها خاموش است", "از بخش پروفایل، پیشنهادهای کافه را دوباره فعال کن.", '<button class="app-button app-button--small" type="button" data-view="profile">رفتن به تنظیمات حساب</button>');
    return viewHeading("پیشنهادهای همین کافه", "پیشنهادهای بعدی از همین‌جا فعال می‌شوند.", "کدهای فعال را در سبد وارد کن. هیچ پیامک یا کمپین واقعی ارسال نمی‌شود.", '<span class="welcome-tag">' + num(readyCount) + ' فعال</span>') + body +
      '<div class="section-block"><div class="feature-offer"><div><span class="view-eyebrow">محیط محلی</span><h3>مدیر کافه پیشنهادها را از پنل مدیریت می‌سازد.</h3><p>این صفحه به سرور متصل نیست؛ تغییرها فقط در همین مرورگر می‌مانند.</p></div><span class="offer-symbol" aria-hidden="true">🔒</span></div></div>';
  }

  function isActiveOrder(order) { return order && (order.status === "preparing" || order.status === "confirmed" || order.status === "ready"); }

  function renderOrders() {
    var sorted = customerOrders().slice().reverse();
    var active = sorted.filter(isActiveOrder);
    var past = sorted.filter(function (order) { return !isActiveOrder(order); });
    var activeMarkup = state.settings.orderUpdates === false ? emptyState("🔕", "نمایش وضعیت سفارش خاموش است", "از تنظیمات پروفایل، پیگیری سفارش را دوباره فعال کن.", '<button class="app-button app-button--small" type="button" data-view="profile">رفتن به تنظیمات حساب</button>') : active.length ? '<div class="order-list">' + active.map(function (order) { return orderCard(order, true); }).join("") + '</div>' : emptyState("☕", "سفارشی در مسیر نیست", "وقتی سفارشی ثبت کنی، وضعیتش را همین‌جا دنبال می‌کنی.", '<button class="app-button app-button--small" type="button" data-view="menu">رفتن به منو</button>');
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
    var orderLabels = { confirmed: "ثبت‌شده", preparing: "در حال آماده‌سازی", ready: "آماده تحویل", completed: "تحویل‌شده", cancelled: "لغوشده" };
    var statusLabel = orderLabels[order.status] || (active ? "در جریان" : "تحویل‌شده");
    var status = active ? '<span class="order-status"><span class="online-dot"></span>' + statusLabel + '</span>' : '<span class="offer-status">' + statusLabel + '</span>';
    var progress = active ? '<div class="order-timeline"><span class="order-step is-done">ثبت سفارش</span><span class="order-step' + (order.status === "preparing" ? " is-current" : order.status === "ready" ? " is-done" : "") + '">آماده‌سازی</span><span class="order-step' + (order.status === "ready" ? " is-current" : "") + '">آماده‌ی تحویل</span></div>' : "";
    return '<article class="order-card' + (active ? " is-active-order" : "") + '"><div class="order-card-head"><span class="order-number"><b>' + escapeHtml(order.id) + '</b><small>' + escapeHtml(order.date || "سفارش ثبت‌شده") + ' · ' + escapeHtml(order.fulfillment || "بیرون‌بر") + '</small></span>' + status + '</div>' +
      '<div class="order-items-preview">' + summary + '<span>' + (names || "جزئیات سفارش") + '</span></div>' + progress +
      '<div class="order-card-foot"><b>' + money(order.total || 0) + '</b><div class="order-actions"><button class="app-button app-button--quiet app-button--small" type="button" data-action="order-detail" data-order-id="' + escapeHtml(order.id) + '">جزئیات</button>' +
      (!active ? '<button class="app-button app-button--small" type="button" data-action="reorder" data-order-id="' + escapeHtml(order.id) + '">سفارش مجدد</button>' : '<span class="tiny muted">زمان آماده‌سازی: حدود ۱۲ دقیقه</span>') + '</div></div></article>';
  }

  function renderProfile() {
    var preference = state.profile.preference || "all";
    return viewHeading("حساب مشتری و حریم خصوصی", "پروفایل تو، به انتخاب خودت.", "پروفایل تازه را ثبت کن؛ اطلاعات قبلی اینجا وارد نشده و هر تغییر در همین مرورگر ذخیره می‌شود.", '<span class="welcome-tag">' + (state.profile.id ? "پروفایل ثبت‌شده" : "شروع از صفر") + '</span>') +
      '<div class="profile-grid"><div class="profile-card"><h2>اطلاعات حساب</h2><div class="profile-banner"><span class="profile-avatar">' + escapeHtml(initials(state.profile.name)) + '</span><span><b>' + escapeHtml(state.profile.name || "مهمان") + '</b><small>' + (state.profile.id ? "عضو CafeLoop · " + num(state.points) + " امتیاز" : "هنوز پروفایلی ثبت نشده") + '</small></span></div>' +
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

  function upsertCustomerProfile(profile) {
    var existing = state.customers.find(function (customer) { return customer.id === profile.id || customer.phone === profile.phone; });
    if (!existing) {
      existing = { id: "customer-" + Date.now(), name: profile.name, phone: profile.phone, birthday: profile.birthday || "", preference: profile.preference || "all", points: 0, orderCount: 0, totalSpend: 0, joinedAt: formatDate(new Date()), active: true };
      state.customers.unshift(existing);
    } else {
      existing.name = profile.name;
      existing.phone = profile.phone;
      existing.birthday = profile.birthday || "";
      existing.preference = profile.preference || "all";
      existing.active = existing.active !== false;
    }
    profile.id = existing.id;
    return existing;
  }

  function settingRow(id, title, description) {
    var checked = !!state.settings[id];
    return '<div class="setting-row"><span class="setting-copy"><b>' + title + '</b><small>' + description + '</small></span><button class="switch" type="button" data-action="toggle-setting" data-setting="' + id + '" role="switch" aria-checked="' + checked + '" aria-label="' + title + '"></button></div>';
  }

  function adminStat(label, value, note, icon, tone) {
    return '<article class="admin-stat ' + (tone || "") + '"><span class="admin-stat-icon">' + icon + '</span><span class="admin-stat-label">' + label + '</span><b>' + value + '</b><small>' + note + '</small></article>';
  }

  function renderAdminDashboard() {
    var realOrders = state.orders.filter(function (order) { return order.status !== "cancelled"; });
    var revenue = realOrders.reduce(function (sum, order) { return sum + Number(order.total || 0); }, 0);
    var repeatCustomers = state.customers.filter(function (customer) { return Number(customer.orderCount || customer.orders || 0) > 1; }).length;
    var repeatRate = state.customers.length ? Math.round(repeatCustomers / state.customers.length * 100) : 0;
    var productCounts = {};
    state.orders.forEach(function (order) { (order.items || []).forEach(function (line) { productCounts[line.productId] = (productCounts[line.productId] || 0) + Number(line.qty || 0); }); });
    var topItems = Object.keys(productCounts).sort(function (a, b) { return productCounts[b] - productCounts[a]; }).slice(0, 4).map(function (id) {
      var product = getProduct(id);
      return product ? '<div class="admin-bar-row"><span>' + escapeHtml(product.name) + '</span><span class="admin-bar-track"><i style="width:' + Math.max(8, productCounts[id] / Math.max.apply(Math, Object.values(productCounts)) * 100) + '%"></i></span><b>' + num(productCounts[id]) + '</b></div>' : "";
    }).join("");
    var latest = state.orders.slice().reverse().slice(0, 3).map(adminOrderCard).join("");
    var noData = !state.orders.length && !state.customers.length ? '<div class="empty-inline"><span>📊</span><b>داده‌ی مدیریتی هنوز خالی است</b><small>سفارش مشتری، ثبت پروفایل یا داده‌ی نمونه اضافه کن؛ اعداد از همین ورودی‌ها محاسبه می‌شوند.</small><div class="admin-inline-actions"><button class="app-button app-button--small" type="button" data-view="adminMenu">افزودن منو</button><button class="app-button app-button--quiet app-button--small" type="button" data-action="seed-sample-data">ساخت داده‌ی نمونه</button></div></div>' : "";
    return viewHeading("پنل مدیریت · داده‌ی همین مرورگر", "سلام مدیر، اینجا همه‌چیز قابل پیگیری است.", "آمار فقط از سفارش‌ها و مشتری‌هایی ساخته می‌شود که در همین نسخه ثبت شده‌اند؛ دیتای قدیمی وارد نشده است.", '<button class="app-button app-button--quiet" type="button" data-mode="customer">رفتن به نمای مشتری</button>') +
      '<div class="admin-stat-grid">' +
        adminStat("فروش ثبت‌شده", money(revenue), num(realOrders.length) + " سفارش غیرلغوشده", "↗", "is-gold") +
        adminStat("مشتری‌ها", num(state.customers.length), "پروفایل ثبت‌شده", "♙", "is-green") +
        adminStat("سفارش‌ها", num(state.orders.length), num(state.orders.filter(isActiveOrder).length) + " در جریان", "▤", "is-violet") +
        adminStat("نرخ بازگشت", num(repeatRate) + "٪", repeatCustomers ? num(repeatCustomers) + " مشتری با خرید تکراری" : "بعد از ثبت خرید محاسبه می‌شود", "⟳", "is-blue") +
      '</div>' + noData +
      '<div class="admin-content-grid"><section class="admin-panel"><div class="admin-panel-head"><div><span class="view-eyebrow">عملکرد</span><h2>محصول‌های پرفروش</h2></div><button class="text-button" type="button" data-view="adminMenu">مدیریت منو <span>←</span></button></div>' +
        (topItems ? '<div class="admin-bars">' + topItems + '</div>' : '<div class="empty-mini">با سفارش‌های ثبت‌شده، پرفروش‌ها اینجا نمایش داده می‌شوند.</div>') +
      '</section><section class="admin-panel"><div class="admin-panel-head"><div><span class="view-eyebrow">آخرین فعالیت</span><h2>سفارش‌های جدید</h2></div><button class="text-button" type="button" data-view="adminOrders">همه <span>←</span></button></div>' +
        (latest ? '<div class="admin-order-list">' + latest + '</div>' : '<div class="empty-mini">هنوز سفارشی ثبت نشده است.</div>') +
      '</section></div>' +
      '<div class="section-block"><div class="section-block-head"><div><h2>میانبرهای مدیریت</h2><p>محتوا و داده‌های آزمایشی کافه را کنترل کن</p></div></div><div class="admin-shortcut-grid">' +
        '<button class="admin-shortcut" type="button" data-view="adminMenu"><span>☕</span><b>مدیریت منو</b><small>افزودن، ویرایش و موجودی</small></button>' +
        '<button class="admin-shortcut" type="button" data-view="adminCustomers"><span>♙</span><b>مشتری‌ها</b><small>پروفایل‌ها و امتیازها</small></button>' +
        '<button class="admin-shortcut" type="button" data-view="adminOffers"><span>🎁</span><b>پیشنهادها</b><small>ساخت کد و تخفیف</small></button>' +
        '<button class="admin-shortcut" type="button" data-view="adminSettings"><span>⚙</span><b>تنظیمات و داده‌ها</b><small>پشتیبان و بازنشانی</small></button>' +
      '</div></div>';
  }

  function renderAdminMenu() {
    var query = (adminSearch.menu || "").toLocaleLowerCase("fa");
    var items = state.menuItems.filter(function (item) { return !query || [item.name, item.desc, item.category].join(" ").toLocaleLowerCase("fa").indexOf(query) !== -1; });
    var cards = items.map(adminProductCard).join("");
    return viewHeading("مدیریت محتوا · منو", "منوی کافه را خودت بساز.", "محصول، قیمت، توضیح و موجودی را ویرایش کن. هر تغییر به‌صورت محلی ذخیره می‌شود و بلافاصله در نمای مشتری می‌آید.", '<button class="app-button" type="button" data-action="open-product-form">＋ افزودن محصول</button>') +
      '<div class="admin-toolbar"><label class="search-field"><span>⌕</span><input id="adminMenuSearch" type="search" aria-label="جست‌وجوی محصول در منوی مدیریت" placeholder="جست‌وجوی محصول..." value="' + escapeHtml(adminSearch.menu || "") + '"></label><span class="welcome-tag">' + num(state.menuItems.length) + ' محصول · ' + num(state.menuItems.filter(isAvailable).length) + ' فعال</span></div>' +
      '<div id="adminProductArea">' + (cards ? '<div class="admin-product-grid">' + cards + '</div>' : emptyState("☕", "محصولی مطابق جست‌وجو نیست", "جست‌وجو را پاک کن یا محصول تازه‌ای بساز.", '<button class="app-button app-button--small" type="button" data-action="open-product-form">افزودن محصول</button>')) + '</div>';
  }

  function adminProductCard(item) {
    return '<article class="admin-product-card"><div class="admin-product-top"><span class="admin-product-emoji">' + escapeHtml(item.icon || "☕") + '</span><span class="admin-state-pill ' + (isAvailable(item) ? "is-on" : "is-off") + '">' + (isAvailable(item) ? "نمایش در منو" : "مخفی") + '</span></div><h3>' + escapeHtml(item.name) + '</h3><p>' + escapeHtml(item.desc || "بدون توضیح") + '</p><div class="admin-product-meta"><span>' + escapeHtml(categoryLabel(item.category)) + '</span><b>' + money(item.price) + '</b></div><div class="admin-card-actions"><button class="app-button app-button--quiet app-button--small" type="button" data-action="edit-product" data-product-id="' + escapeHtml(item.id) + '">ویرایش</button><button class="app-button app-button--quiet app-button--small" type="button" data-action="toggle-product" data-product-id="' + escapeHtml(item.id) + '">' + (isAvailable(item) ? "مخفی‌کردن" : "فعال‌کردن") + '</button><button class="app-button app-button--danger app-button--small" type="button" data-action="confirm-delete-product" data-product-id="' + escapeHtml(item.id) + '" aria-label="حذف ' + escapeHtml(item.name) + '">حذف</button></div></article>';
  }

  function renderAdminOrders() {
    var orders = state.orders.slice().reverse();
    return viewHeading("مدیریت عملیات", "سفارش‌ها را از یک‌جا مدیریت کن.", "وضعیت هر سفارش در نمای مشتری نیز به‌روزرسانی می‌شود. همه‌ی سفارش‌ها محلی و آزمایشی هستند.", '<span class="welcome-tag">' + num(orders.length) + ' سفارش</span>') +
      (orders.length ? '<div class="admin-order-list">' + orders.map(adminOrderCard).join("") + '</div>' : emptyState("▤", "هنوز سفارشی ثبت نشده", "یک سفارش آزمایشی از نمای مشتری بساز؛ اینجا برای تغییر وضعیت ظاهر می‌شود.", '<button class="app-button app-button--small" type="button" data-mode="customer">رفتن به نمای مشتری</button>'));
  }

  function adminOrderCard(order) {
    var customerName = order.customerName || "مهمان";
    var statusOptions = [["confirmed", "ثبت‌شده"], ["preparing", "در حال آماده‌سازی"], ["ready", "آماده تحویل"], ["completed", "تحویل‌شده"], ["cancelled", "لغوشده"]].map(function (pair) {
      return '<option value="' + pair[0] + '"' + (order.status === pair[0] ? " selected" : "") + '>' + pair[1] + '</option>';
    }).join("");
    var preview = (order.items || []).map(function (item) { return (item.icon || "☕") + " " + escapeHtml(item.name) + " × " + num(item.qty || 1); }).join(" · ");
    return '<article class="admin-order-card"><div class="admin-order-primary"><span class="admin-order-id">' + escapeHtml(order.id) + '</span><span class="admin-order-date">' + escapeHtml(order.date || "سفارش") + '</span><h3>' + escapeHtml(customerName) + '</h3><p>' + (preview || "بدون آیتم") + '</p></div><div class="admin-order-secondary"><b>' + money(order.total || 0) + '</b><label><span>وضعیت</span><select class="select-control" data-order-status data-order-id="' + escapeHtml(order.id) + '">' + statusOptions + '</select></label></div></article>';
  }

  function renderAdminCustomers() {
    var query = (adminSearch.customers || "").toLocaleLowerCase("fa");
    var customers = state.customers.filter(function (customer) { return !query || [customer.name, customer.phone].join(" ").toLocaleLowerCase("fa").indexOf(query) !== -1; });
    var cards = customers.map(adminCustomerCard).join("");
    return viewHeading("Customer Passport · مدیریت", "مشتری‌ها، شفاف و قابل ویرایش.", "عضویت مشتری در نمای مشتری یا ثبت از این صفحه، به همین فهرست اضافه می‌شود.", '<button class="app-button" type="button" data-action="open-customer-form">＋ افزودن مشتری</button>') +
      '<div class="admin-toolbar"><label class="search-field"><span>⌕</span><input id="adminCustomerSearch" type="search" aria-label="جست‌وجوی نام یا شماره مشتری" placeholder="جست‌وجوی نام یا شماره..." value="' + escapeHtml(adminSearch.customers || "") + '"></label><span class="welcome-tag">' + num(state.customers.length) + ' پروفایل</span></div>' +
      '<div id="adminCustomerArea">' + (cards ? '<div class="admin-customer-grid">' + cards + '</div>' : emptyState("♙", "هنوز مشتری‌ای ثبت نشده", "با ثبت پروفایل یا سفارش از نمای مشتری، رکورد اول اینجا ساخته می‌شود.", '<button class="app-button app-button--small" type="button" data-action="open-customer-form">افزودن مشتری</button>')) + '</div>';
  }

  function adminCustomerCard(customer) {
    var spent = Number(customer.totalSpend || customer.spend || 0);
    var orders = Number(customer.orderCount || customer.orders || 0);
    return '<article class="admin-customer-card"><div class="admin-customer-head"><span class="profile-avatar">' + escapeHtml(initials(customer.name)) + '</span><div><h3>' + escapeHtml(customer.name) + '</h3><small>' + escapeHtml(customer.phone || "بدون شماره") + '</small></div><span class="admin-state-pill ' + (customer.active === false ? "is-off" : "is-on") + '">' + (customer.active === false ? "غیرفعال" : "فعال") + '</span></div><div class="admin-customer-stats"><span><b>' + num(orders) + '</b> سفارش</span><span><b>' + money(spent) + '</b> خرید</span><span><b>' + num(customer.points || 0) + '</b> امتیاز</span></div><div class="admin-card-actions"><button class="app-button app-button--quiet app-button--small" type="button" data-action="edit-customer" data-customer-id="' + escapeHtml(customer.id) + '">ویرایش</button><button class="app-button app-button--danger app-button--small" type="button" data-action="confirm-delete-customer" data-customer-id="' + escapeHtml(customer.id) + '">حذف رکورد</button></div></article>';
  }

  function renderAdminOffers() {
    var offers = state.offers.map(adminOfferCard).join("");
    return viewHeading("ارتباط با مشتری · کمپین محلی", "پیشنهاد بساز، نه فقط پیام.", "کد تخفیف جدید بساز و فعال یا غیرفعالش کن. پیام واقعی فرستاده نمی‌شود؛ پیشنهاد در نمای مشتری دیده می‌شود.", '<button class="app-button" type="button" data-action="open-offer-form">＋ ساخت پیشنهاد</button>') +
      (offers ? '<div class="admin-offer-grid">' + offers + '</div>' : emptyState("🎁", "هنوز پیشنهادی نساخته‌ای", "یک تخفیف درصدی یا اعتبار ثابت ثبت کن تا در صفحه‌ی پیشنهادهای مشتری نمایش داده شود.", '<button class="app-button app-button--small" type="button" data-action="open-offer-form">ساخت اولین پیشنهاد</button>'));
  }

  function adminOfferCard(offer) {
    var uses = state.usedOffers.filter(function (id) { return id === offer.id; }).length;
    return '<article class="admin-offer-card"><div class="admin-product-top"><span class="admin-product-emoji">' + escapeHtml(offer.icon || "🎁") + '</span><span class="admin-state-pill ' + (offer.active === false ? "is-off" : "is-on") + '">' + (offer.active === false ? "غیرفعال" : "فعال") + '</span></div><h3>' + escapeHtml(offer.title) + '</h3><p>' + escapeHtml(offer.description || "بدون توضیح") + '</p><div class="offer-code admin-offer-code">' + escapeHtml(offer.code) + '</div><div class="admin-product-meta"><span>' + (offer.discount ? num(offer.discount) + '٪ تخفیف' : money(offer.fixed || 0) + ' اعتبار') + '</span><b>' + num(uses) + ' بار استفاده</b></div><div class="admin-card-actions"><button class="app-button app-button--quiet app-button--small" type="button" data-action="edit-offer" data-offer-id="' + escapeHtml(offer.id) + '">ویرایش</button><button class="app-button app-button--quiet app-button--small" type="button" data-action="toggle-offer" data-offer-id="' + escapeHtml(offer.id) + '">' + (offer.active === false ? "فعال‌کردن" : "غیرفعال‌کردن") + '</button><button class="app-button app-button--danger app-button--small" type="button" data-action="confirm-delete-offer" data-offer-id="' + escapeHtml(offer.id) + '">حذف</button></div></article>';
  }

  function renderAdminSettings() {
    return viewHeading("تنظیمات محیط آزمایشی", "اطلاعات کافه و داده‌ها.", "این تنظیمات فقط برای نسخه‌ی نمایشی ذخیره می‌شوند. برای پشتیبان یا پاک‌سازی، کنترل کامل دست خودت است.", "") +
      '<div class="admin-settings-grid"><section class="admin-panel"><h2>تنظیمات کافه</h2><form id="cafeSettingsForm" class="profile-form-grid"><div class="form-field"><label for="cafeName">نام نمایشی کافه</label><input class="form-control" id="cafeName" name="name" maxlength="50" required value="' + escapeHtml(state.cafe.name) + '"></div><div class="form-field"><label for="cafeBranch">نام شعبه</label><input class="form-control" id="cafeBranch" name="branch" maxlength="50" value="' + escapeHtml(state.cafe.branch) + '"></div><div class="form-field"><label for="pointsPerSpend">هر چند تومان = ۱ امتیاز</label><input class="form-control" id="pointsPerSpend" name="pointsPerSpend" type="number" min="1000" step="1000" value="' + Number(state.cafe.pointsPerSpend || 10000) + '"></div><div class="form-field"><label for="pointValue">ارزش هر امتیاز به تومان</label><input class="form-control" id="pointValue" name="pointValue" type="number" min="10" step="10" value="' + Number(state.cafe.pointValue || POINT_VALUE) + '"></div><div class="form-field settings-submit"><button class="app-button app-button--small" type="submit">ذخیره تنظیمات</button></div></form></section>' +
      '<section class="admin-panel"><h2>پشتیبان و داده‌ی نمونه</h2><p class="admin-panel-description">مشتری‌ها، منو، پیشنهادها و سفارش‌های واردشده روی همین دستگاه نگهداری می‌شوند.</p><div class="admin-settings-actions"><button class="app-button app-button--quiet" type="button" data-action="export-data">دانلود پشتیبان JSON</button><button class="app-button app-button--quiet" type="button" data-action="seed-sample-data"' + (state.sampleDataAdded ? ' disabled' : '') + '>' + (state.sampleDataAdded ? "داده‌ی نمونه اضافه شده" : "افزودن داده‌ی نمونه (اختیاری)") + '</button><button class="app-button app-button--danger" type="button" data-action="confirm-reset">پاک‌کردن همه‌ی داده‌های این MVP</button></div><p class="privacy-note" style="margin-top:14px">دیتای قبلی سایت/دمو خوانده نمی‌شود. داده‌ی نمونه فقط با انتخاب خودت اضافه می‌شود؛ خروجی JSON هم از داده‌های فعلی همین مرورگر ساخته می‌شود.</p></section></div>' +
      '<div class="section-block"><div class="admin-panel"><h2>اتصال‌ها</h2><div class="integration-list"><div><span>درگاه پرداخت</span><b>غیرفعال · سفارش‌ها آزمایشی‌اند</b></div><div><span>پیامک و کمپین</span><b>غیرفعال · فقط پیشنهاد داخل صفحه</b></div><div><span>ذخیره‌سازی</span><b>localStorage همین مرورگر</b></div></div></div></div>';
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
    return !!offer && offer.active !== false && cartSubtotal() >= Number(offer.minimum || 0);
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
    var pointValue = Math.max(1, Number(state.cafe.pointValue || POINT_VALUE));
    var pointsUsed = state.usePoints && state.profile.id ? Math.min(state.points, Math.floor(rest * 0.3 / pointValue)) : 0;
    var pointsDiscount = pointsUsed * pointValue;
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
      '<label class="cart-check"><input type="checkbox" data-cart-field="usePoints"' + (state.usePoints ? " checked" : "") + ' ' + (state.points && state.profile.id ? "" : "disabled") + '> استفاده از امتیازها (هر امتیاز ' + money(state.cafe.pointValue || POINT_VALUE) + '؛ حداکثر ۳۰٪ سفارش)</label>' +
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
      '<div class="product-detail-art">' + escapeHtml(product.icon || "☕") + '</div><div class="row" style="justify-content:space-between"><span class="welcome-tag">★ ' + product.rating.toFixed(1) + ' · ' + escapeHtml(product.tags.join(" · ")) + '</span><span class="tiny muted">حدود ' + num(product.calories) + ' کالری</span></div>' +
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
    var customerFields = state.profile.id ? '<div class="modal-info">سفارش به نام ' + escapeHtml(state.profile.name) + ' ثبت می‌شود و امتیازش به حساب همین دمو اضافه خواهد شد.</div>' : '<div class="profile-form-grid"><div class="form-field"><label for="guestName">نام (اختیاری)</label><input class="form-control" id="guestName" name="guestName" maxlength="50" placeholder="نام مشتری"></div><div class="form-field"><label for="guestPhone">شماره موبایل (اختیاری)</label><input class="form-control" id="guestPhone" name="guestPhone" type="tel" inputmode="tel" placeholder="۰۹۱۲۱۲۳۴۵۶۷"></div></div>';
    closeCart();
    openModal('<div class="modal-head"><div><span class="view-eyebrow">مرحله‌ی آخر · بدون پرداخت</span><h2 id="modalTitle">ثبت سفارش آزمایشی</h2><p>روش تحویل را انتخاب کن؛ هیچ اطلاعاتی به کافه فرستاده نمی‌شود.</p></div><button class="modal-close" type="button" data-action="close-modal" aria-label="بستن">×</button></div>' +
      '<div class="checkout-summary"><span>' + num(count) + ' آیتم · ' + escapeHtml(getLocation().name) + '</span><b>' + money(totals.total) + '</b></div>' +
      '<form id="checkoutForm" class="checkout-form">' + customerFields + '<div class="form-field"><label>روش دریافت سفارش</label><div class="checkout-methods"><label class="checkout-method"><input type="radio" name="fulfillment" value="dinein" checked><span>🍽️ سرو در کافه · میز ۷</span></label><label class="checkout-method"><input type="radio" name="fulfillment" value="takeaway"><span>🥡 بیرون‌بر</span></label></div></div>' +
      '<div class="form-field"><label for="orderNote">یادداشت برای سفارش (اختیاری)</label><textarea class="form-control checkout-note" id="orderNote" name="note" maxlength="180" placeholder="مثلاً شیر جو دوسر را جداگانه اضافه کنید..."></textarea></div>' +
      '<div class="modal-info">ثبت سفارش فقط یک رویداد نمایشی در مرورگر است. پرداخت آنلاین، رزرو واقعی و اتصال به صندوق فعال نیست.</div>' +
      '<div class="modal-actions"><button class="app-button app-button--quiet" type="button" data-action="close-modal">بازگشت</button><button class="app-button" type="submit">تأیید سفارش آزمایشی</button></div></form>', false);
  }

  function locationModal() {
    var html = LOCATIONS.map(function (location) {
      var selected = state.location === location.id;
      var branchName = location.name.split("·").pop().trim();
      var displayName = String(state.cafe.name || "کافه نوآر").trim() + " · " + branchName;
      return '<button class="location-option' + (selected ? " is-selected" : "") + '" type="button" data-action="select-location" data-location-id="' + location.id + '"><span><b>' + escapeHtml(displayName) + '</b><small>' + escapeHtml(location.address) + ' · ' + escapeHtml(location.wait) + '</small></span><span>' + (selected ? "✓" : "←") + '</span></button>';
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
    var member = currentCustomer();
    if (member) member.points = state.points;
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

  function openProductForm(productId) {
    var item = productId ? getProduct(productId) : null;
    var filters = item ? item.filters || [] : [];
    var categories = CATEGORIES.filter(function (category) { return category.id !== "all"; }).map(function (category) {
      return '<option value="' + category.id + '"' + (item && item.category === category.id ? " selected" : !item && category.id === "coffee" ? " selected" : "") + '>' + category.label + '</option>';
    }).join("");
    openModal('<div class="modal-head"><div><span class="view-eyebrow">مدیریت منوی کافه</span><h2 id="modalTitle">' + (item ? "ویرایش محصول" : "افزودن محصول تازه") + '</h2><p>تغییرها بلافاصله در منوی مشتری ثبت می‌شوند.</p></div><button class="modal-close" type="button" data-action="close-modal" aria-label="بستن">×</button></div>' +
      '<form id="adminProductForm" data-product-id="' + (item ? escapeHtml(item.id) : "") + '" class="admin-modal-form"><div class="profile-form-grid"><div class="form-field"><label for="productName">نام محصول</label><input class="form-control" id="productName" name="name" maxlength="60" required value="' + escapeHtml(item ? item.name : "") + '"></div><div class="form-field"><label for="productPrice">قیمت به تومان</label><input class="form-control" id="productPrice" name="price" type="number" min="0" step="1000" required value="' + (item ? Number(item.price) : "") + '"></div><div class="form-field"><label for="productCategory">دسته‌بندی</label><select class="form-control" id="productCategory" name="category">' + categories + '</select></div><div class="form-field"><label for="productIcon">آیکن / ایموجی</label><input class="form-control" id="productIcon" name="icon" maxlength="8" value="' + escapeHtml(item ? item.icon : "☕") + '"></div></div><div class="form-field" style="margin-top:12px"><label for="productDescription">توضیح کوتاه</label><textarea class="form-control checkout-note" id="productDescription" name="description" maxlength="160">' + escapeHtml(item ? item.desc : "") + '</textarea></div><div class="form-field" style="margin-top:12px"><label for="productTags">برچسب‌ها (با ویرگول جدا کن)</label><input class="form-control" id="productTags" name="tags" value="' + escapeHtml(item ? (item.tags || []).join("، ") : "") + '" placeholder="گیاهی، بدون شکر"></div><div class="admin-check-grid"><label class="filter-option"><input type="checkbox" name="vegetarian"' + (filters.indexOf("vegetarian") !== -1 ? " checked" : "") + '> گیاهی</label><label class="filter-option"><input type="checkbox" name="vegan"' + (filters.indexOf("vegan") !== -1 ? " checked" : "") + '> وگان</label><label class="filter-option"><input type="checkbox" name="dairyFree"' + (filters.indexOf("dairyFree") !== -1 ? " checked" : "") + '> بدون لبنیات</label><label class="filter-option"><input type="checkbox" name="caffeineFree"' + (filters.indexOf("caffeineFree") !== -1 ? " checked" : "") + '> بدون کافئین</label><label class="filter-option"><input type="checkbox" name="customizable"' + (item && item.customizable ? " checked" : "") + '> قابل شخصی‌سازی</label><label class="filter-option"><input type="checkbox" name="available"' + (!item || isAvailable(item) ? " checked" : "") + '> نمایش در منوی مشتری</label></div><div class="modal-actions"><button class="app-button app-button--quiet" type="button" data-action="close-modal">انصراف</button><button class="app-button" type="submit">ذخیره محصول</button></div></form>', true);
  }

  function openCustomerForm(customerId) {
    var customer = customerId ? state.customers.find(function (item) { return item.id === customerId; }) : null;
    if (customerId && !customer) return;
    openModal('<div class="modal-head"><div><span class="view-eyebrow">مدیریت مشتری</span><h2 id="modalTitle">' + (customer ? "ویرایش پروفایل" : "ثبت مشتری تازه") + '</h2><p>این رکورد فقط در همین MVP محلی نگهداری می‌شود.</p></div><button class="modal-close" type="button" data-action="close-modal" aria-label="بستن">×</button></div><form id="adminCustomerForm" data-customer-id="' + (customer ? escapeHtml(customer.id) : "") + '" class="admin-modal-form"><div class="profile-form-grid"><div class="form-field"><label for="customerName">نام مشتری</label><input class="form-control" id="customerName" name="name" maxlength="50" required value="' + escapeHtml(customer ? customer.name : "") + '"></div><div class="form-field"><label for="customerPhone">شماره موبایل</label><input class="form-control" id="customerPhone" name="phone" type="tel" inputmode="tel" required value="' + escapeHtml(customer ? customer.phone : "") + '" placeholder="۰۹۱۲۱۲۳۴۵۶۷"></div><div class="form-field"><label for="customerPoints">امتیاز</label><input class="form-control" id="customerPoints" name="points" type="number" min="0" step="1" value="' + (customer ? Number(customer.points || 0) : 0) + '"></div><div class="form-field"><label>وضعیت حساب</label><label class="filter-option"><input type="checkbox" name="active"' + (!customer || customer.active !== false ? " checked" : "") + '> فعال</label></div></div><div class="modal-actions"><button class="app-button app-button--quiet" type="button" data-action="close-modal">انصراف</button><button class="app-button" type="submit">ذخیره مشتری</button></div></form>', false);
  }

  function openOfferForm(offerId) {
    var offer = offerId ? getOffer(offerId) : null;
    if (offerId && !offer) return;
    openModal('<div class="modal-head"><div><span class="view-eyebrow">ساخت تخفیف محلی</span><h2 id="modalTitle">' + (offer ? "ویرایش پیشنهاد" : "پیشنهاد تازه") + '</h2><p>پیشنهاد فعال بلافاصله در صفحه‌ی مشتری نمایش داده می‌شود.</p></div><button class="modal-close" type="button" data-action="close-modal" aria-label="بستن">×</button></div><form id="adminOfferForm" data-offer-id="' + (offer ? escapeHtml(offer.id) : "") + '" class="admin-modal-form"><div class="profile-form-grid"><div class="form-field"><label for="offerTitle">عنوان پیشنهاد</label><input class="form-control" id="offerTitle" name="title" maxlength="70" required value="' + escapeHtml(offer ? offer.title : "") + '"></div><div class="form-field"><label for="offerCode">کد لاتین</label><input class="form-control" id="offerCode" name="code" maxlength="18" required value="' + escapeHtml(offer ? offer.code : "") + '" placeholder="CAFE15"></div><div class="form-field"><label for="offerDiscount">درصد تخفیف (۰ تا ۱۰۰)</label><input class="form-control" id="offerDiscount" name="discount" type="number" min="0" max="100" value="' + Number(offer && offer.discount || 0) + '"></div><div class="form-field"><label for="offerFixed">یا اعتبار ثابت به تومان</label><input class="form-control" id="offerFixed" name="fixed" type="number" min="0" step="1000" value="' + Number(offer && offer.fixed || 0) + '"></div><div class="form-field"><label for="offerMinimum">حداقل سفارش به تومان</label><input class="form-control" id="offerMinimum" name="minimum" type="number" min="0" step="1000" value="' + Number(offer && offer.minimum || 0) + '"></div><div class="form-field"><label for="offerIcon">آیکن</label><input class="form-control" id="offerIcon" name="icon" maxlength="8" value="' + escapeHtml(offer && offer.icon || "🎁") + '"></div></div><div class="form-field" style="margin-top:12px"><label for="offerDescription">توضیح برای مشتری</label><textarea class="form-control checkout-note" id="offerDescription" name="description" maxlength="180">' + escapeHtml(offer ? offer.description : "") + '</textarea></div><div class="admin-check-grid"><label class="filter-option"><input type="checkbox" name="active"' + (!offer || offer.active !== false ? " checked" : "") + '> فعال و قابل مشاهده برای مشتری</label></div><div class="modal-actions"><button class="app-button app-button--quiet" type="button" data-action="close-modal">انصراف</button><button class="app-button" type="submit">ذخیره پیشنهاد</button></div></form>', true);
  }

  function confirmAction(kind, id, title) {
    pendingConfirm = { kind: kind, id: id };
    openModal('<div class="modal-head"><div><span class="view-eyebrow">تأیید عملیات</span><h2 id="modalTitle">' + title + '</h2><p>این تغییر در همین مرورگر ثبت می‌شود.</p></div><button class="modal-close" type="button" data-action="close-modal" aria-label="بستن">×</button></div><div class="modal-actions"><button class="app-button app-button--quiet" type="button" data-action="close-modal">انصراف</button><button class="app-button app-button--danger" type="button" data-action="confirm-pending">تأیید و ادامه</button></div>', false);
  }

  function seedSampleData() {
    if (state.sampleDataAdded) { showToast("داده‌ی نمونه قبلاً اضافه شده است."); return; }
    var sampleCustomers = [
      ["demo-c1", "رها نادری", "09000001001", 680], ["demo-c2", "ماهان رضایی", "09000001002", 320],
      ["demo-c3", "سارا کیانی", "09000001003", 1120], ["demo-c4", "آرین مرادی", "09000001004", 150],
      ["demo-c5", "نیلوفر راد", "09000001005", 940], ["demo-c6", "پارسا زمانی", "09000001006", 430]
    ].map(function (row, index) { return { id: row[0], name: row[1], phone: row[2], points: row[3], orderCount: [4, 2, 6, 1, 3, 2][index], totalSpend: [980000, 420000, 1530000, 175000, 760000, 510000][index], joinedAt: "نمونه‌ی تازه", preference: "all", active: true, sample: true }; });
    var sampleOffers = [
      { id: "demo-offer-1", title: "۲۰٪ تخفیف نوشیدنی امروز", description: "برای سفارش بعدی از منوی نوشیدنی استفاده کن.", code: "FRESH20", discount: 20, fixed: 0, minimum: 100000, icon: "☕", active: true, kind: "نمونه" },
      { id: "demo-offer-2", title: "اعتبار شیرینی عصرانه", description: "اعتبار ثابت برای سفارش‌های بالای ۲۰۰ هزار تومان.", code: "SWEET40", discount: 0, fixed: 40000, minimum: 200000, icon: "🍰", active: true, kind: "نمونه" }
    ];
    var sampleProducts = state.menuItems.slice(0, 4);
    var sampleOrders = [];
    if (sampleProducts.length) {
      var sampleProduct = function (index) { return sampleProducts[index % sampleProducts.length]; };
      var sampleLine = function (product, qty) { return { productId: product.id, name: product.name, icon: product.icon || "☕", qty: qty, unitPrice: Number(product.price || 0), options: {} }; };
      var firstProduct = sampleProduct(0);
      var secondProduct = sampleProduct(1);
      var thirdProduct = sampleProduct(2);
      var fourthProduct = sampleProduct(3);
      sampleOrders = [
        { id: "DEMO-3101", customerId: sampleCustomers[0].id, customerName: sampleCustomers[0].name, customerPhone: sampleCustomers[0].phone, date: "امروز · ۰۹:۲۰", status: "completed", fulfillment: "بیرون‌بر", items: [sampleLine(firstProduct, 1)], total: Number(firstProduct.price || 0), discount: 0, pointsEarned: 17 },
        { id: "DEMO-3102", customerId: sampleCustomers[2].id, customerName: sampleCustomers[2].name, customerPhone: sampleCustomers[2].phone, date: "امروز · ۱۰:۰۵", status: "preparing", fulfillment: "سرو در کافه · میز ۴", items: [sampleLine(thirdProduct, 1), sampleLine(secondProduct, 1)], total: Number(thirdProduct.price || 0) + Number(secondProduct.price || 0), discount: 0, pointsEarned: 29 },
        { id: "DEMO-3103", customerId: sampleCustomers[1].id, customerName: sampleCustomers[1].name, customerPhone: sampleCustomers[1].phone, date: "دیروز · ۱۷:۴۰", status: "ready", fulfillment: "بیرون‌بر", items: [sampleLine(fourthProduct, 2)], total: Number(fourthProduct.price || 0) * 2, discount: 0, pointsEarned: 29 }
      ];
    }
    state.customers = state.customers.concat(sampleCustomers);
    state.offers = state.offers.concat(sampleOffers);
    state.orders = state.orders.concat(sampleOrders);
    state.sampleDataAdded = true;
    state.transactions = state.transactions.concat(sampleOrders.map(function (order) { return { label: "نمونه سفارش " + order.id, date: order.date, delta: order.pointsEarned }; }));
    saveState(); render(); showToast("داده‌ی ساختگی تازه به محیط آزمایشی اضافه شد.");
  }

  function exportData() {
    var payload = { exportedAt: new Date().toISOString(), app: "CafeLoop MVP", storageKey: STORAGE_KEY, demoOnly: true, data: clone(state) };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url; link.download = "cafeloop-mvp-local-data.json"; link.click();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    showToast("فایل پشتیبان JSON آماده شد.");
  }

  function finishPendingAction() {
    if (!pendingConfirm) return;
    var task = pendingConfirm;
    pendingConfirm = null;
    if (task.kind === "product") {
      state.menuItems = state.menuItems.filter(function (item) { return item.id !== task.id; });
      state.favorites = state.favorites.filter(function (id) { return id !== task.id; });
      state.cart = state.cart.filter(function (line) { return line.productId !== task.id; });
      closeModal(); render(); showToast("محصول حذف شد.");
    } else if (task.kind === "customer") {
      state.customers = state.customers.filter(function (customer) { return customer.id !== task.id; });
      if (state.profile.id === task.id) { state.profile = clone(DEFAULT_STATE.profile); state.points = 0; }
      closeModal(); render(); showToast("پروفایل مشتری حذف شد.");
    } else if (task.kind === "offer") {
      state.offers = state.offers.filter(function (offer) { return offer.id !== task.id; });
      state.claimedOffers = state.claimedOffers.filter(function (id) { return id !== task.id; });
      state.usedOffers = state.usedOffers.filter(function (id) { return id !== task.id; });
      if (state.cartOffer === task.id) state.cartOffer = "";
      closeModal(); render(); showToast("پیشنهاد حذف شد.");
    } else if (task.kind === "reset") {
      try { localStorage.removeItem(STORAGE_KEY); } catch (error) {}
      state = clone(DEFAULT_STATE);
      state.view = "dashboard";
      state.mode = "admin";
      closeModal();
      if (window.location.hash !== "#dashboard") window.history.pushState({ mvpView: "dashboard" }, "", "#dashboard");
      render(); showToast("داده‌های همین MVP پاک شد؛ برنامه از صفر آماده است.");
    }
  }

  function handleClick(event) {
    var modeButton = event.target.closest("[data-mode]");
    if (modeButton) { event.preventDefault(); switchMode(modeButton.dataset.mode); return; }
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
      var selectedLocation = LOCATIONS.find(function (item) { return item.id === actionNode.dataset.locationId; });
      if (selectedLocation) { state.location = selectedLocation.id; state.cafe.branch = selectedLocation.name.split("·").pop().trim(); }
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
    if (action === "open-product-form") { openProductForm(""); return; }
    if (action === "edit-product") { openProductForm(actionNode.dataset.productId); return; }
    if (action === "toggle-product") {
      var toggleProduct = getProduct(actionNode.dataset.productId);
      if (toggleProduct) toggleProduct.available = !isAvailable(toggleProduct);
      saveState(); render(); showToast(toggleProduct && isAvailable(toggleProduct) ? "محصول در منوی مشتری فعال شد." : "محصول از منوی مشتری مخفی شد."); return;
    }
    if (action === "confirm-delete-product") { confirmAction("product", actionNode.dataset.productId, "این محصول از منو حذف شود؟"); return; }
    if (action === "open-customer-form") { openCustomerForm(""); return; }
    if (action === "edit-customer") { openCustomerForm(actionNode.dataset.customerId); return; }
    if (action === "confirm-delete-customer") { confirmAction("customer", actionNode.dataset.customerId, "پروفایل مشتری حذف شود؟"); return; }
    if (action === "open-offer-form") { openOfferForm(""); return; }
    if (action === "edit-offer") { openOfferForm(actionNode.dataset.offerId); return; }
    if (action === "toggle-offer") {
      var toggleOffer = getOffer(actionNode.dataset.offerId);
      if (toggleOffer) toggleOffer.active = toggleOffer.active === false;
      saveState(); render(); showToast(toggleOffer && toggleOffer.active ? "پیشنهاد برای مشتری فعال شد." : "پیشنهاد غیرفعال شد."); return;
    }
    if (action === "confirm-delete-offer") { confirmAction("offer", actionNode.dataset.offerId, "این پیشنهاد حذف شود؟"); return; }
    if (action === "confirm-pending") { finishPendingAction(); return; }
    if (action === "seed-sample-data") { seedSampleData(); return; }
    if (action === "export-data") { exportData(); return; }
    if (action === "confirm-reset") { confirmAction("reset", "", "همه‌ی داده‌های این MVP از همین مرورگر پاک شود؟"); return; }
    if (action === "reset-demo") { confirmAction("reset", "", "همه‌ی داده‌های این MVP از همین مرورگر پاک شود؟"); return; }
  }

  function handleInput(event) {
    var target = event.target;
    if (target && target.id === "menuSearch") {
      state.menuFilters.query = target.value;
      renderMenuResults(); saveState();
    }
    if (target && target.id === "adminMenuSearch") {
      adminSearch.menu = target.value;
      var menuPosition = target.selectionStart;
      render();
      var menuInput = document.getElementById("adminMenuSearch");
      if (menuInput) { menuInput.focus(); if (menuInput.setSelectionRange) menuInput.setSelectionRange(menuPosition, menuPosition); }
    }
    if (target && target.id === "adminCustomerSearch") {
      adminSearch.customers = target.value;
      var customerPosition = target.selectionStart;
      render();
      var customerInput = document.getElementById("adminCustomerSearch");
      if (customerInput) { customerInput.focus(); if (customerInput.setSelectionRange) customerInput.setSelectionRange(customerPosition, customerPosition); }
    }
    if (target && target.closest && target.closest("#productCustomizeForm")) {
      var form = target.closest("#productCustomizeForm");
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
    if (target.hasAttribute && target.hasAttribute("data-order-status")) {
      var order = state.orders.find(function (item) { return String(item.id) === String(target.dataset.orderId); });
      if (order) { order.status = target.value; saveState(); render(); showToast("وضعیت سفارش " + order.id + " به‌روز شد."); }
    }
  }

  function handleSubmit(event) {
    var form = event.target;
    if (!form || !form.id) return;
    if (form.id === "adminProductForm") {
      event.preventDefault();
      var productData = new FormData(form);
      var productName = String(productData.get("name") || "").trim();
      var productPrice = Number(productData.get("price"));
      if (productName.length < 2 || !Number.isFinite(productPrice) || productPrice < 0) { showToast("نام و قیمت معتبر محصول را وارد کن."); return; }
      var productId = form.dataset.productId || "item-" + Date.now();
      var oldProduct = getProduct(productId);
      var filterFlags = ["vegetarian", "vegan", "dairyFree", "caffeineFree"].filter(function (flag) { return productData.has(flag); });
      if (productData.has("vegan") && filterFlags.indexOf("vegetarian") === -1) filterFlags.push("vegetarian");
      var newProduct = {
        id: productId, name: productName, en: oldProduct && oldProduct.en || "", desc: String(productData.get("description") || "").trim(), category: String(productData.get("category") || "coffee"),
        price: Math.round(productPrice), icon: String(productData.get("icon") || "☕").trim() || "☕",
        tags: String(productData.get("tags") || "").split(/[،,]/).map(function (tag) { return tag.trim(); }).filter(Boolean).slice(0, 5),
        filters: filterFlags, calories: oldProduct && oldProduct.calories || 0, rating: oldProduct && oldProduct.rating || 4.8,
        badge: oldProduct && oldProduct.badge || "جدید", customizable: productData.has("customizable"), available: productData.has("available"), popular: oldProduct && oldProduct.popular || 50
      };
      var productIndex = state.menuItems.findIndex(function (item) { return item.id === productId; });
      if (productIndex === -1) state.menuItems.unshift(newProduct); else state.menuItems[productIndex] = newProduct;
      saveState(); closeModal(); render(); showToast("محصول در منوی محلی ذخیره شد."); return;
    }
    if (form.id === "adminCustomerForm") {
      event.preventDefault();
      var customerData = new FormData(form);
      var customerName = String(customerData.get("name") || "").trim();
      var customerPhone = digitsToLatin(String(customerData.get("phone") || "")).replace(/[\s()-]/g, "").replace(/^\+98/, "0").replace(/^98(?=9)/, "0");
      var customerPoints = Number(customerData.get("points") || 0);
      var customerId = form.dataset.customerId || "customer-" + Date.now();
      if (customerName.length < 2 || !/^09\d{9}$/.test(customerPhone) || !Number.isFinite(customerPoints) || customerPoints < 0) { showToast("نام، شماره‌ی معتبر و امتیاز صفر یا بیشتر وارد کن."); return; }
      customerPoints = Math.floor(customerPoints);
      var duplicatePhone = state.customers.some(function (item) { return item.id !== customerId && item.phone === customerPhone; });
      if (duplicatePhone) { showToast("این شماره قبلاً در فهرست مشتری‌ها ثبت شده است."); return; }
      var customer = state.customers.find(function (item) { return item.id === customerId; });
      if (!customer) {
        customer = { id: customerId, orderCount: 0, totalSpend: 0, joinedAt: formatDate(new Date()) };
        state.customers.unshift(customer);
      }
      customer.name = customerName; customer.phone = customerPhone; customer.points = customerPoints; customer.active = customerData.has("active");
      if (state.profile.id === customer.id) { state.profile.name = customer.name; state.profile.phone = customer.phone; state.points = customer.points; }
      saveState(); closeModal(); render(); showToast("رکورد مشتری ذخیره شد."); return;
    }
    if (form.id === "adminOfferForm") {
      event.preventDefault();
      var offerData = new FormData(form);
      var offerTitle = String(offerData.get("title") || "").trim();
      var offerCode = String(offerData.get("code") || "").toUpperCase().replace(/[^A-Z0-9_-]/g, "");
      var offerDiscount = Number(offerData.get("discount") || 0);
      var offerFixed = Number(offerData.get("fixed") || 0);
      var offerMinimum = Number(offerData.get("minimum") || 0);
      var offerId = form.dataset.offerId || "offer-" + Date.now();
      if (offerTitle.length < 3 || offerCode.length < 3 || !Number.isFinite(offerDiscount) || !Number.isFinite(offerFixed) || !Number.isFinite(offerMinimum) || offerDiscount < 0 || offerDiscount > 100 || offerFixed < 0 || offerMinimum < 0 || (!offerDiscount && !offerFixed)) { showToast("عنوان، کد سه‌حرفی و مقدار معتبرِ درصد یا اعتبار تخفیف را وارد کن."); return; }
      if (state.offers.some(function (item) { return item.id !== offerId && item.code === offerCode; })) { showToast("این کد تخفیف قبلاً استفاده شده است."); return; }
      var offer = state.offers.find(function (item) { return item.id === offerId; });
      if (!offer) { offer = { id: offerId }; state.offers.unshift(offer); }
      offer.title = offerTitle; offer.code = offerCode; offer.description = String(offerData.get("description") || "").trim();
      offer.discount = Math.round(offerDiscount); offer.fixed = offerDiscount ? 0 : Math.round(offerFixed); offer.minimum = Math.round(offerMinimum);
      offer.icon = String(offerData.get("icon") || "🎁"); offer.active = offerData.has("active"); offer.kind = "ساخته‌شده توسط مدیر";
      saveState(); closeModal(); render(); showToast("پیشنهاد و کد تخفیف ذخیره شد."); return;
    }
    if (form.id === "cafeSettingsForm") {
      event.preventDefault();
      var cafeData = new FormData(form);
      var cafeName = String(cafeData.get("name") || "").trim();
      var cafeBranch = String(cafeData.get("branch") || "").trim();
      var pointsPerSpend = Number(cafeData.get("pointsPerSpend"));
      var pointValue = Number(cafeData.get("pointValue"));
      if (cafeName.length < 2 || !Number.isFinite(pointsPerSpend) || pointsPerSpend < 1000 || !Number.isFinite(pointValue) || pointValue < 10) { showToast("نام کافه و تنظیمات عددی معتبر را وارد کن."); return; }
      state.cafe.name = cafeName;
      state.cafe.branch = cafeBranch;
      state.cafe.pointsPerSpend = Math.round(pointsPerSpend);
      state.cafe.pointValue = Math.round(pointValue);
      saveState(); render(); showToast("تنظیمات کافه ذخیره شد."); return;
    }
    if (form.id === "profileForm") {
      event.preventDefault();
      var data = new FormData(form);
      var name = String(data.get("name") || "").trim();
      var phoneRaw = String(data.get("phone") || "").trim();
      var phoneDigits = digitsToLatin(phoneRaw).replace(/[\s()-]/g, "");
      var normalizedPhone = phoneDigits.replace(/^\+98/, "0").replace(/^98(?=9)/, "0");
      if (name.length < 2) { showToast("نام نمایشی باید حداقل دو حرف داشته باشد."); return; }
      if (!/^09\d{9}$/.test(normalizedPhone)) { showToast("شماره موبایل را به‌شکل ۰۹۱۲۱۲۳۴۵۶۷ وارد کن."); return; }
      if (state.customers.some(function (customer) { return customer.id !== state.profile.id && customer.phone === normalizedPhone; })) { showToast("این شماره به پروفایل مشتری دیگری متصل است."); return; }
      var profile = { id: state.profile.id, name: name, phone: normalizedPhone, birthday: String(data.get("birthday") || ""), preference: String(data.get("preference") || "all") };
      var savedCustomer = upsertCustomerProfile(profile);
      state.profile = profile;
      state.points = Number(savedCustomer.points || 0);
      saveState(); render(); showToast("پروفایل ثبت شد و به فهرست مشتریان مدیریت اضافه شد."); return;
    }
    if (form.id === "checkoutForm") {
      event.preventDefault();
      if (!cartCount()) { closeModal(); showToast("سبد سفارش خالی است."); return; }
      var formData = new FormData(form);
      var customerId = state.profile.id || "";
      var customerName = state.profile.name || "مهمان";
      var customerPhone = state.profile.phone || "";
      if (!customerId) {
        var guestName = String(formData.get("guestName") || "").trim();
        var guestPhoneRaw = String(formData.get("guestPhone") || "").trim();
        if (guestName || guestPhoneRaw) {
          var normalizedGuestPhone = digitsToLatin(guestPhoneRaw).replace(/[\s()-]/g, "").replace(/^\+98/, "0").replace(/^98(?=9)/, "0");
          if (guestName.length < 2 || !/^09\d{9}$/.test(normalizedGuestPhone)) { showToast("برای ثبت مشتری، نام و شماره‌ی معتبر ۰۹۱۲۱۲۳۴۵۶۷ را هر دو وارد کن؛ یا هر دو را خالی بگذار."); return; }
          var guestProfile = { id: "", name: guestName, phone: normalizedGuestPhone, birthday: "", preference: "all" };
          var matchedCustomer = upsertCustomerProfile(guestProfile);
          state.profile = guestProfile;
          state.points = Number(matchedCustomer.points || 0);
          customerId = matchedCustomer.id;
          customerName = matchedCustomer.name;
          customerPhone = matchedCustomer.phone;
        }
      }
      var totals = cartTotals();
      var items = state.cart.map(function (line) {
        var product = getProduct(line.productId);
        return { productId: line.productId, name: product ? product.name : "محصول", icon: product ? product.icon : "☕", qty: line.qty, unitPrice: product ? unitPrice(product, line.options || {}) : 0, options: clone(line.options || {}) };
      });
      var pointThreshold = Math.max(1000, Number(state.cafe.pointsPerSpend || 10000));
      var pointsEarned = customerId ? Math.floor(totals.total / pointThreshold) : 0;
      var allDiscount = totals.offerDiscount + totals.rewardDiscount + totals.pointsDiscount;
      var newOrder = {
        id: "CL-" + String(Date.now()).slice(-6),
        date: formatDate(new Date()),
        status: "preparing",
        customerId: customerId,
        customerName: customerName,
        customerPhone: customerPhone,
        fulfillment: formData.get("fulfillment") === "takeaway" ? "بیرون‌بر" : "سرو در کافه · میز ۷",
        total: totals.total,
        subtotal: totals.subtotal,
        discount: allDiscount,
        pointsEarned: pointsEarned,
        note: String(formData.get("note") || "").trim(),
        sample: true,
        items: items
      };
      if (customerId) {
        state.points = Math.max(0, state.points - totals.pointsUsed) + pointsEarned;
        var orderCustomer = state.customers.find(function (customer) { return customer.id === customerId; });
        if (orderCustomer) {
          orderCustomer.points = state.points;
          orderCustomer.orderCount = Number(orderCustomer.orderCount || orderCustomer.orders || 0) + 1;
          orderCustomer.totalSpend = Number(orderCustomer.totalSpend || orderCustomer.spend || 0) + totals.total;
          orderCustomer.lastOrder = newOrder.date;
        }
        if (pointsEarned) state.transactions.unshift({ label: "امتیاز سفارش " + newOrder.id, date: "۱ امتیاز به‌ازای هر " + num(pointThreshold) + " تومان", delta: pointsEarned });
        if (totals.pointsUsed) state.transactions.unshift({ label: "اعتبار مصرف‌شده در سفارش " + newOrder.id, date: "امتیاز استفاده‌شده", delta: -totals.pointsUsed });
      }
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
      showToast("سفارش آزمایشی " + newOrder.id + " ثبت شد." + (pointsEarned ? " " + num(pointsEarned) + " امتیاز گرفتی." : ""));
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
    state.mode = isAdminView(state.view) ? "admin" : "customer";
    render();
    document.addEventListener("click", handleClick);
    document.addEventListener("input", handleInput);
    document.addEventListener("change", handleChange);
    document.addEventListener("submit", handleSubmit);
    document.addEventListener("keydown", handleKeydown);
    window.addEventListener("popstate", function () {
      state.view = getViewFromHash();
      state.mode = isAdminView(state.view) ? "admin" : "customer";
      render();
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
