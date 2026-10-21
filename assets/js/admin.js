/* ==========================================================================
   CafeLoop — پنل مدیریت کافه (admin.html)
   داشبورد، سفارش‌های زنده، مدیریت منو (متصل به اپ مشتری)، مشتریان، کمپین، تنظیمات.
   داده‌ها در localStorage همین مرورگر می‌مانند (بدون سرور):
     cafeloop-admin-menu-v1       منوی ویرایش‌شده  ← اپ مشتری (mvp.js) همین را می‌خواند
     cafeloop-admin-orders-v1     سفارش‌های زنده ← اپ مشتری هنگام ثبت سفارش اینجا می‌نویسد
     cafeloop-admin-cafe-v1       تنظیمات کافه
     cafeloop-admin-campaigns-v1  کمپین‌های ساخته‌شده در پنل
   ⚠️ ورود (admin / noir1234) فقط نمایشی و سمت مرورگر است؛ برای استفاده‌ی واقعی
   باید احراز هویت سمت سرور جایگزین شود.
   ========================================================================== */
(function () {
  "use strict";

  var MENU_KEY = "cafeloop-admin-menu-v1";
  var ORDERS_KEY = "cafeloop-admin-orders-v1";
  var CAFE_KEY = "cafeloop-admin-cafe-v1";
  var CAMP_KEY = "cafeloop-admin-campaigns-v1";
  var SESSION = "cafeloop-admin-session";
  var DEMO_USER = "admin", DEMO_PASS = "noir1234";

  var MVP = window.MVP_DATA || { items: [], categories: [], cafe: {} };
  var CRM = window.CAFE_LOOP_DATA || { customers: [], campaigns: [], kpis: {}, charts: { hourly: { labels: [], values: [] } }, ai: {} };
  var FA = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

  function digits(s) { return String(s).replace(/[0-9]/g, function (m) { return FA[+m]; }); }
  function money(n) { return digits(Number(n || 0).toLocaleString("en-US")); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function byId(id) { return document.getElementById(id); }
  function all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function toast(msg) { if (window.cafeLoopToast) window.cafeLoopToast(msg); }
  function getJSON(key, fallback) { try { var v = JSON.parse(localStorage.getItem(key) || "null"); return v == null ? fallback : v; } catch (e) { return fallback; } }
  function setJSON(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { toast("فضای ذخیره‌سازی مرورگر پر است — عکس‌های آپلودی را کمتر کن"); } }
  function hhmm(ts) { var d = new Date(ts); return digits(("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2)); }
  function ageMin(ts) { return Math.max(0, Math.round((Date.now() - ts) / 60000)); }
  function download(name, text, type) {
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: type || "text/plain" }));
    a.download = name; document.body.appendChild(a); a.click(); a.remove();
  }

  /* ---------------------------------------------------------------- state */
  var state = { view: "dashboard", orderFilter: "all", menuQ: "", menuCat: "all", custQ: "", custStatus: "all", editingId: null };

  function normItem(x) {
    if (!x || !x.id || !x.fa) return null;
    return {
      id: String(x.id), name: String(x.name || x.fa), fa: String(x.fa), cat: x.cat || "hot",
      desc: String(x.desc || ""), ingredients: String(x.ingredients || ""), allergens: String(x.allergens || "—"),
      img: String(x.img || ""), price: Math.max(0, +x.price || 0), icon: x.icon || "☕",
      rating: +x.rating || 4.5, sold: +x.sold || 0, kcal: +x.kcal || 0, caf: +x.caf || 0,
      prep: +x.prep || 5, tags: Array.isArray(x.tags) ? x.tags : [], spicy: +x.spicy || 0,
      available: x.available !== false
    };
  }
  function loadMenu() {
    var saved = getJSON(MENU_KEY, null);
    if (Array.isArray(saved) && saved.length) return saved.map(normItem).filter(Boolean);
    return JSON.parse(JSON.stringify(MVP.items)).map(normItem).filter(Boolean);
  }
  var menu = loadMenu();
  function saveMenu(msg) { setJSON(MENU_KEY, menu); if (msg) toast(msg); }
  function catName(id) { var c = MVP.categories.filter(function (x) { return x.id === id; })[0]; return c ? c.name : id; }
  function itemById(id) { return menu.filter(function (i) { return i.id === id; })[0]; }

  function seedOrders() {
    var now = Date.now();
    return [
      { id: "seed1", code: "۱۰۴۲", table: 3, total: 410000, status: 1, placedAt: now - 6 * 60000, sample: true,
        items: [{ id: "latte", name: "لاته", qty: 2, summary: "متوسط · شیر پرچرب" }, { id: "croissant", name: "کروسان کره‌ای", qty: 1, summary: "" }] },
      { id: "seed2", code: "۱۰۴۳", table: 9, total: 195000, status: 0, placedAt: now - 2 * 60000, sample: true,
        items: [{ id: "coldbrew", name: "کلد برو", qty: 1, summary: "بدون شکر" }] },
      { id: "seed3", code: "۱۰۳۹", table: 1, total: 580000, status: 3, placedAt: now - 48 * 60000, sample: true,
        items: [{ id: "club", name: "کلاب ساندویچ مرغ", qty: 1, summary: "" }, { id: "tea", name: "چای سیاه ایرانی", qty: 2, summary: "" }] }
    ];
  }
  function loadOrders() {
    var list = getJSON(ORDERS_KEY, null);
    if (!Array.isArray(list)) { list = seedOrders(); setJSON(ORDERS_KEY, list); }
    return list;
  }
  function cafe() {
    return Object.assign({}, MVP.cafe, getJSON(CAFE_KEY, {}));
  }

  /* ---------------------------------------------------------------- auth */
  function isIn() { try { return sessionStorage.getItem(SESSION) === "1"; } catch (e) { return false; } }
  function showApp() {
    byId("loginView").classList.add("hidden");
    byId("adminApp").classList.remove("hidden");
    renderAll();
  }
  function showLogin() {
    byId("adminApp").classList.add("hidden");
    byId("loginView").classList.remove("hidden");
  }
  byId("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var u = byId("loginUser").value.trim(), p = byId("loginPass").value;
    if (u === DEMO_USER && p === DEMO_PASS) {
      try { sessionStorage.setItem(SESSION, "1"); } catch (err) {}
      byId("loginErr").textContent = "";
      showApp(); toast("خوش آمدی 👋 وارد پنل مدیریت شدی");
    } else {
      byId("loginErr").textContent = "نام کاربری یا رمز درست نیست. برای تست: admin / noir1234";
    }
  });
  function logout() { try { sessionStorage.removeItem(SESSION); } catch (e) {} showLogin(); }
  byId("logoutBtn").addEventListener("click", logout);
  byId("logoutBtn2").addEventListener("click", logout);

  /* ---------------------------------------------------------------- nav */
  all(".admin-nav [data-view]").forEach(function (b) {
    b.addEventListener("click", function () { setView(b.dataset.view); });
  });
  function setView(v) {
    state.view = v;
    all(".admin-nav [data-view]").forEach(function (b) { b.classList.toggle("is-active", b.dataset.view === v); });
    all(".admin-view").forEach(function (s) { s.classList.toggle("is-active", s.dataset.view === v); });
    window.scrollTo({ top: 0 });
    renderAll();
  }

  /* ------------------------------------------------------------- dashboard */
  var STATUS = ["ثبت‌شده", "در حال آماده‌سازی", "آماده‌ی تحویل", "تحویل‌شده"];
  function renderDashboard(orders) {
    var c = cafe();
    byId("sideCafeName").textContent = c.name || "کافه";
    byId("topCafeName").textContent = "پنل " + (c.name || "کافه");
    var today = new Date().toDateString();
    var todayOrders = orders.filter(function (o) { return new Date(o.placedAt).toDateString() === today; });
    var liveSales = todayOrders.reduce(function (s, o) { return s + (+o.total || 0); }, 0);
    var open = orders.filter(function (o) { return o.status < 3; }).length;
    var risk = CRM.customers.filter(function (x) { return x.status === "risk"; }).length;
    var k = CRM.kpis || {};
    byId("dashSub").textContent = (c.name || "") + " · " + (c.city || "") + " · ساعت کاری " + (c.open || "—") +
      " · امروز " + digits(new Date().toLocaleDateString("fa-IR"));
    byId("kpiRow").innerHTML = [
      ["💰 فروش نمونه‌ی ماه", money(k.revenue || 0) + " تومان", "<em>" + esc(k.revenueDelta || "") + "</em> + زنده‌ی امروز: " + money(liveSales)],
      ["🧾 سفارش‌های باز", digits(open), digits(todayOrders.length) + " سفارش امروز ثبت شده"],
      ["👥 مشتری این ماه", digits(k.customers || 0) + " نفر", "<em>" + esc(k.customersDelta || "") + "</em> نسبت به ماه قبل"],
      ["↩️ نرخ بازگشت", digits(k.repeatRate || 0) + "٪", "<em>" + esc(k.repeatDelta || "") + "</em> · " + digits(risk) + " نفر در معرض ریزش"]
    ].map(function (t) { return "<div class='kpi-tile'><span>" + t[0] + "</span><b>" + t[1] + "</b><span>" + t[2] + "</span></div>"; }).join("");

    byId("aiCard").innerHTML = "<h3>🤖 دستیار درآمد — پیشنهاد امروز</h3><p class='small'>" + esc((CRM.ai || {}).note || "") + "</p>" +
      "<p class='small' style='margin-top:8px'><b>آفر پیشنهادی:</b> " + esc((CRM.ai || {}).offer || "") + " <span class='muted'>" + esc((CRM.ai || {}).reason || "") + "</span></p>" +
      "<div class='row' style='margin-top:12px'><button class='btn btn--sm' type='button' data-goto='campaigns'>ساخت این کمپین</button>" +
      "<button class='btn btn--ghost btn--sm' type='button' data-goto='customers'>دیدن مشتریان در معرض ریزش</button></div>";

    var top = menu.slice().sort(function (a, b) { return b.sold - a.sold; }).slice(0, 5);
    var max = top.length ? top[0].sold : 1;
    byId("topProducts").innerHTML = top.map(function (i) {
      return "<div class='top-row'>" + (i.img ? "<img src='" + esc(i.img) + "' alt='' loading='lazy' onerror='this.style.visibility=\"hidden\"'>" : "<span style='font-size:1.3rem'>" + i.icon + "</span>") +
        "<div><b style='font-size:.9rem'>" + esc(i.fa) + "</b> <span class='tiny faint'>" + money(i.price) + "</span><div class='bar'><i style='width:" + Math.round(i.sold / max * 100) + "%'></i></div></div>" +
        "<b>" + digits(i.sold) + "</b></div>";
    }).join("") || "<p class='muted small'>آیتمی در منو نیست.</p>";

    byId("dashOrders").innerHTML = orders.slice(0, 5).map(function (o) {
      return "<div class='order-line'><span>سفارش #" + esc(o.code) + " · میز " + digits(o.table) + (o.sample ? " <span class='tiny faint'>(نمونه)</span>" : "") + "</span>" +
        "<span class='pill status-p" + o.status + "'>" + STATUS[o.status] + "</span><b>" + money(o.total) + "</b></div>";
    }).join("") || "<p class='muted small'>هنوز سفارشی نیست؛ از <a href='mvp.html'>اپ مشتری</a> یکی ثبت کن.</p>";

    drawChart();
    updateBadge(orders);
  }
  function drawChart() {
    var cv = byId("hourChart"); if (!cv || !cv.getContext) return;
    var ctx = cv.getContext("2d");
    var h = (CRM.charts || {}).hourly || { labels: [], values: [] };
    var W = cv.width, H = cv.height, pad = 34, max = Math.max.apply(null, h.values.concat([1]));
    ctx.clearRect(0, 0, W, H);
    ctx.font = "12px Vazirmatn, Tahoma"; ctx.fillStyle = "#554134"; ctx.textAlign = "center";
    var bw = (W - pad * 2) / h.values.length;
    h.values.forEach(function (v, i) {
      var bh = (H - pad * 2) * (v / max), x = W - pad - bw * (i + 1) + bw * 0.18, y = H - pad - bh;
      ctx.fillStyle = i === 3 ? "#2fa98c" : "#c8773c";
      if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(x, y, bw * 0.64, bh, 6); ctx.fill(); } else { ctx.fillRect(x, y, bw * 0.64, bh); }
      ctx.fillStyle = "#554134"; ctx.fillText(digits(v), x + bw * 0.32, y - 6);
      ctx.fillText(h.labels[i] || "", x + bw * 0.32, H - 10);
    });
    ctx.strokeStyle = "rgba(34,23,19,.18)"; ctx.beginPath(); ctx.moveTo(pad, H - pad); ctx.lineTo(W - pad, H - pad); ctx.stroke();
  }

  /* --------------------------------------------------------------- orders */
  function updateBadge(orders) {
    var n = orders.filter(function (o) { return o.status === 0; }).length;
    var b = byId("ordersBadge"); b.textContent = digits(n); b.classList.toggle("hidden", !n);
  }
  function renderOrders(orders) {
    var filters = [["all", "همه"], ["0", "ثبت‌شده"], ["1", "در حال آماده‌سازی"], ["2", "آماده"], ["3", "تحویل‌شده"]];
    byId("orderChips").innerHTML = filters.map(function (f) {
      var n = f[0] === "all" ? orders.length : orders.filter(function (o) { return String(o.status) === f[0]; }).length;
      return "<button type='button' data-ofilter='" + f[0] + "' class='" + (state.orderFilter === f[0] ? "is-active" : "") + "'>" + f[1] + " (" + digits(n) + ")</button>";
    }).join("");
    var list = orders.filter(function (o) { return state.orderFilter === "all" || String(o.status) === state.orderFilter; });
    byId("ordersList").innerHTML = list.length ? list.map(function (o) {
      var lines = (o.items || []).map(function (l) {
        return "<div class='order-line'><span>" + esc(l.name) + " ×" + digits(l.qty) + (l.summary ? " <span class='tiny faint'>" + esc(l.summary) + "</span>" : "") + "</span></div>";
      }).join("");
      var next = o.status < 3 ? "<button class='btn btn--sm' type='button' data-advance='" + o.id + "'>" + (o.status === 0 ? "▶ شروع آماده‌سازی" : o.status === 1 ? "✓ آماده شد" : "🎉 تحویل به مشتری") + "</button>" : "";
      var cancel = o.status < 3 ? "<button class='btn btn--ghost btn--sm' type='button' data-cancelorder='" + o.id + "'>حذف سفارش</button>" : "";
      return "<article class='admin-card order-card'>" +
        "<div class='row row--between'><div><h3 style='margin:0'>سفارش #" + esc(o.code) + " · میز " + digits(o.table) + (o.sample ? " <span class='pill'>نمونه</span>" : " <span class='pill pill--brand'>از اپ مشتری</span>") + "</h3>" +
        "<p class='tiny faint'>ساعت " + hhmm(o.placedAt) + " · " + digits(ageMin(o.placedAt)) + " دقیقه پیش</p></div>" +
        "<span class='pill status-p" + o.status + "'>" + STATUS[o.status] + "</span></div>" + lines +
        "<div class='row row--between'><b>جمع: " + money(o.total) + " تومان</b><span class='row'>" + next + cancel + "</span></div></article>";
    }).join("") : "<div class='admin-card center'><p style='font-size:1.6rem'>🧾</p><b>سفارشی با این وضعیت نیست</b><p class='muted small'>از <a href='mvp.html'>اپ مشتری</a> سفارش ثبت کن تا همین‌جا بیاید.</p></div>";
    updateBadge(orders);
  }
  function changeOrder(id, fn) {
    var orders = loadOrders().map(function (o) { return o.id === id ? fn(o) : o; }).filter(Boolean);
    setJSON(ORDERS_KEY, orders); renderAll();
  }
  byId("clearDoneBtn").addEventListener("click", function () {
    setJSON(ORDERS_KEY, loadOrders().filter(function (o) { return o.status < 3; }));
    renderAll(); toast("سفارش‌های تحویل‌شده پاک شدند");
  });

  /* ----------------------------------------------------------------- menu */
  function fillCats(sel, withAll) {
    sel.innerHTML = (withAll ? "<option value='all'>همه‌ی دسته‌ها</option>" : "") +
      MVP.categories.map(function (c) { return "<option value='" + c.id + "'>" + c.icon + " " + esc(c.name) + "</option>"; }).join("");
  }
  fillCats(byId("menuCat"), true); fillCats(byId("fCat"), false);
  byId("menuCat").value = state.menuCat;

  function renderMenu() {
    var q = state.menuQ.trim().toLowerCase();
    var list = menu.filter(function (i) {
      if (state.menuCat !== "all" && i.cat !== state.menuCat) return false;
      if (q && (i.fa + " " + i.name + " " + i.desc + " " + i.ingredients).toLowerCase().indexOf(q) < 0) return false;
      return true;
    });
    var off = menu.filter(function (i) { return !i.available; }).length;
    byId("menuCount").textContent = digits(list.length) + " آیتم از " + digits(menu.length) + (off ? " · " + digits(off) + " آیتم ناموجود" : "") + " · تغییرات خودکار در اپ مشتری ذخیره می‌شود.";
    byId("menuGrid").innerHTML = list.map(function (i) {
      return "<article class='menu-item" + (i.available ? "" : " is-out") + "'>" +
        (i.img ? "<img src='" + esc(i.img) + "' alt='" + esc(i.fa) + "' loading='lazy' onerror='this.remove()'>" : "<span style='font-size:2rem;align-self:center'>" + i.icon + "</span>") +
        "<div class='menu-item__body'><h4>" + esc(i.fa) + " <span class='tiny faint'>" + esc(i.name) + "</span></h4>" +
        "<span class='pill pill--brand'>" + esc(catName(i.cat)) + "</span> <span class='pill'>⭐ " + digits(i.rating) + "</span> <span class='pill'>" + digits(i.sold) + " فروش</span>" +
        "<p>" + esc(i.desc) + "</p>" +
        "<div class='menu-item__row'><input class='price-input' type='number' min='0' step='1000' value='" + i.price + "' data-price='" + i.id + "' aria-label='قیمت تومان'><span class='tiny faint'>تومان</span>" +
        "<button class='switch' type='button' role='switch' aria-checked='" + i.available + "' aria-label='موجودی' data-avail='" + i.id + "' title='موجود/ناموجود'></button>" +
        "<span class='tiny'>" + (i.available ? "موجود" : "ناموجود") + "</span>" +
        "<button class='btn btn--ghost btn--sm' type='button' data-edit='" + i.id + "'>ویرایش</button></div></div></article>";
    }).join("") || "<div class='admin-card'>آیتمی پیدا نشد.</div>";
  }
  byId("menuSearch").addEventListener("input", function (e) { state.menuQ = e.target.value; renderMenu(); });
  byId("menuCat").addEventListener("change", function (e) { state.menuCat = e.target.value; renderMenu(); });
  byId("resetMenuBtn").addEventListener("click", function () {
    if (!confirm("منو به نسخه‌ی پیش‌فرض (داخل سایت) برگردد و همه‌ی ویرایش‌های پنل پاک شود؟")) return;
    try { localStorage.removeItem(MENU_KEY); } catch (e) {}
    menu = loadMenu(); renderAll(); toast("منو به حالت پیش‌فرض برگشت");
  });
  byId("exportMenuBtn").addEventListener("click", function () {
    download("cafeloop-menu.json", JSON.stringify(menu, null, 2), "application/json"); toast("فایل منو دانلود شد");
  });
  byId("importMenuFile").addEventListener("change", function (e) {
    var f = e.target.files[0]; if (!f) return;
    var r = new FileReader();
    r.onload = function () {
      try {
        var arr = JSON.parse(r.result).map(normItem).filter(Boolean);
        if (!arr.length) throw new Error("empty");
        menu = arr; saveMenu("منوی جدید وارد و در اپ مشتری اعمال شد ✓"); renderAll();
      } catch (err) { toast("فایل خوانده نشد — باید JSON فهرست آیتم‌های منو باشد"); }
    };
    r.readAsText(f); e.target.value = "";
  });

  /* ویرایش آیتم */
  var uploadedDataUrl = "";
  function openItem(id) {
    state.editingId = id;
    uploadedDataUrl = "";
    var i = id ? itemById(id) : { fa: "", name: "", cat: "hot", price: 150000, desc: "", ingredients: "", allergens: "—", kcal: 0, caf: 0, prep: 5, icon: "☕", img: "", tags: [], available: true };
    byId("itemModalTitle").textContent = id ? "ویرایش «" + i.fa + "»" : "آیتم جدید در منو";
    byId("fFa").value = i.fa; byId("fName").value = i.name; byId("fCat").value = i.cat;
    byId("fPrice").value = i.price; byId("fDesc").value = i.desc;
    byId("fIngredients").value = i.ingredients; byId("fAllergens").value = i.allergens;
    byId("fKcal").value = i.kcal; byId("fCaf").value = i.caf; byId("fPrep").value = i.prep;
    byId("fIcon").value = i.icon; byId("fImg").value = i.img && i.img.indexOf("data:") !== 0 ? i.img : "";
    byId("fAvailable").checked = !!i.available;
    all(".fTag").forEach(function (c) { c.checked = (i.tags || []).indexOf(c.value) >= 0; });
    preview(i.img);
    byId("itemDeleteBtn").style.display = id ? "" : "none";
    byId("itemModal").classList.add("is-open");
  }
  function preview(src) { var p = byId("fImgPreview"); if (src) { p.src = src; p.style.display = ""; } else { p.removeAttribute("src"); p.style.display = "none"; } }
  function closeItem() { byId("itemModal").classList.remove("is-open"); }
  byId("itemModalX").addEventListener("click", closeItem);
  byId("itemModal").addEventListener("click", function (e) { if (e.target === this) closeItem(); });
  byId("newItemBtn").addEventListener("click", function () { openItem(null); });
  byId("fImg").addEventListener("input", function (e) { preview(e.target.value.trim()); });
  byId("fImgFile").addEventListener("change", function (e) {
    var f = e.target.files[0]; if (!f) return;
    var img = new Image(), url = URL.createObjectURL(f);
    img.onload = function () {
      var cv = document.createElement("canvas"); cv.width = 800; cv.height = 600;
      var ctx = cv.getContext("2d");
      var s = Math.max(800 / img.width, 600 / img.height);
      ctx.drawImage(img, (800 - img.width * s) / 2, (600 - img.height * s) / 2, img.width * s, img.height * s);
      uploadedDataUrl = cv.toDataURL("image/jpeg", 0.78);
      URL.revokeObjectURL(url); preview(uploadedDataUrl);
      toast("عکس کافه آماده شد — با ذخیره روی آیتم می‌نشیند 📸");
    };
    img.src = url;
  });
  byId("itemForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var old = state.editingId ? itemById(state.editingId) : null;
    var it = normItem({
      id: old ? old.id : "item-" + Date.now().toString(36),
      fa: byId("fFa").value.trim(), name: byId("fName").value.trim() || byId("fFa").value.trim(),
      cat: byId("fCat").value, price: +byId("fPrice").value || 0, desc: byId("fDesc").value.trim(),
      ingredients: byId("fIngredients").value.trim(), allergens: byId("fAllergens").value.trim() || "—",
      kcal: +byId("fKcal").value || 0, caf: +byId("fCaf").value || 0, prep: +byId("fPrep").value || 5,
      icon: byId("fIcon").value.trim() || "☕",
      img: uploadedDataUrl || byId("fImg").value.trim() || (old ? old.img : ""),
      tags: all(".fTag").filter(function (c) { return c.checked; }).map(function (c) { return c.value; }),
      available: byId("fAvailable").checked,
      rating: old ? old.rating : 4.5, sold: old ? old.sold : 0
    });
    if (!it.fa || !it.price) { toast("نام فارسی و قیمت لازم است"); return; }
    if (old) menu = menu.map(function (x) { return x.id === it.id ? it : x; }); else menu.unshift(it);
    saveMenu("«" + it.fa + "» ذخیره شد و در اپ مشتری به‌روز شد ✓");
    closeItem(); renderAll();
  });
  byId("itemDeleteBtn").addEventListener("click", function () {
    if (!state.editingId || !confirm("این آیتم از منوی مشتری حذف شود؟")) return;
    menu = menu.filter(function (x) { return x.id !== state.editingId; });
    saveMenu("آیتم حذف شد"); closeItem(); renderAll();
  });

  /* ------------------------------------------------------------- customers */
  function renderCustomers() {
    var q = state.custQ.trim().toLowerCase();
    var rows = CRM.customers.filter(function (c) {
      if (state.custStatus !== "all" && c.status !== state.custStatus) return false;
      if (q && (c.name + " " + c.last + " " + c.fav).toLowerCase().indexOf(q) < 0) return false;
      return true;
    });
    var st = { active: ["فعال", "pill--ok"], fading: ["کم‌رنگ", "pill--warn"], risk: ["در معرض ریزش", "pill--danger"] };
    byId("custTable").innerHTML = "<thead><tr><th>مشتری</th><th>مراجعه</th><th>مجموع خرید</th><th>محبوبش</th><th>ساعتش</th><th>امتیاز</th><th>آخرین مراجعه</th><th>وضعیت</th></tr></thead><tbody>" +
      rows.map(function (c) {
        var s = st[c.status] || st.active;
        return "<tr><td data-label='مشتری'><span><b>" + esc(c.name) + "</b><br><span class='tiny faint mono'>" + esc(c.last) + "</span></span></td>" +
          "<td data-label='مراجعه'>" + digits(c.visits) + " بار</td><td data-label='مجموع خرید'>" + money(c.spend) + "</td>" +
          "<td data-label='محبوبش'>" + esc(c.fav) + "</td><td data-label='ساعتش' class='mono'>" + esc(c.hour) + "</td>" +
          "<td data-label='امتیاز'>" + digits(c.points) + "</td><td data-label='آخرین مراجعه'>" + digits(c.out) + " روز پیش</td>" +
          "<td data-label='وضعیت'><span class='pill " + s[1] + "'>" + s[0] + "</span></td></tr>";
      }).join("") + "</tbody>";
  }
  byId("custSearch").addEventListener("input", function (e) { state.custQ = e.target.value; renderCustomers(); });
  byId("custStatus").addEventListener("change", function (e) { state.custStatus = e.target.value; renderCustomers(); });
  byId("exportCustomersBtn").addEventListener("click", function () {
    var rows = [["name", "phone", "visits", "spend_toman", "favourite", "usual_hour", "points", "days_away", "status"]]
      .concat(CRM.customers.map(function (c) { return [c.name, c.last, c.visits, c.spend, c.fav, c.hour, c.points, c.out, c.status]; }));
    download("cafeloop-customers.csv", "﻿" + rows.map(function (r) { return r.map(function (x) { return '"' + String(x).replace(/"/g, '""') + '"'; }).join(","); }).join("\n"), "text/csv");
    toast("فهرست مشتریان دانلود شد");
  });

  /* ------------------------------------------------------------- campaigns */
  function segCount(seg) {
    if (seg === "points") return CRM.customers.filter(function (c) { return c.points >= 600; }).length;
    return CRM.customers.filter(function (c) { return c.status === seg; }).length;
  }
  function renderCampaigns() {
    var mine = getJSON(CAMP_KEY, []);
    var olds = (CRM.campaigns || []).map(function (c) {
      return "<div class='order-line' style='margin-bottom:8px'><span><b>" + esc(c.name) + "</b><br><span class='tiny faint'>" + esc(c.segment) + " · " + esc(c.when) + "</span></span>" +
        "<span class='tiny'>ارسال " + digits(c.sent) + " · بازگشت " + digits(c.returned) + "<br><b>" + money(c.revenue) + " تومان</b></span></div>";
    }).join("");
    var news = mine.map(function (c) {
      return "<div class='order-line' style='margin-bottom:8px'><span><b>" + esc(c.name) + "</b> <span class='pill pill--ok'>فعال</span><br><span class='tiny faint'>" + digits(c.count) + " نفر · تخفیف " + digits(c.off) + "٪ · ساخته‌شده در پنل</span></span>" +
        "<button class='btn btn--ghost btn--sm' type='button' data-delcamp='" + c.id + "'>حذف</button></div>";
    }).join("");
    byId("campaignList").innerHTML = news + olds || "<p class='muted small'>هنوز کمپینی نیست.</p>";
    var seg = byId("campSegment").value;
    byId("campCount").textContent = "مخاطب این سگمنت در داده‌ی نمونه: " + digits(segCount(seg)) + " نفر · متن پیامک: " + digits(byId("campMsg").value.length) + " نویسه";
  }
  byId("campSegment").addEventListener("change", renderCampaigns);
  byId("campMsg").addEventListener("input", renderCampaigns);
  byId("campaignForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var mine = getJSON(CAMP_KEY, []);
    mine.unshift({ id: "c" + Date.now(), name: byId("campName").value.trim(), segment: byId("campSegment").value, off: +byId("campOff").value || 0, msg: byId("campMsg").value.trim(), count: segCount(byId("campSegment").value), at: Date.now() });
    setJSON(CAMP_KEY, mine); e.target.reset(); byId("campOff").value = 20;
    byId("campMsg").value = "جای خالیت حس می‌شه! امروز ۱۶ تا ۱۸ با کد برگشت، نوشیدنی محبوبت ۲۰٪ مهمون ماست. Cafe Noir";
    renderCampaigns(); toast("کمپین ساخته و فعال شد 🎁");
  });

  /* -------------------------------------------------------------- settings */
  function renderSettings() {
    var c = cafe();
    byId("cafeName").value = c.name || ""; byId("cafeCity").value = c.city || "";
    byId("cafeOpen").value = c.open || ""; byId("cafeWifi").value = c.wifi || "";
    byId("cafeTables").value = c.tables || c.table || ""; byId("cafePhone").value = c.phone || "";
  }
  byId("cafeForm").addEventListener("submit", function (e) {
    e.preventDefault();
    setJSON(CAFE_KEY, {
      name: byId("cafeName").value.trim(), city: byId("cafeCity").value.trim(),
      open: byId("cafeOpen").value.trim(), wifi: byId("cafeWifi").value.trim(),
      tables: +byId("cafeTables").value || "", phone: byId("cafePhone").value.trim()
    });
    renderAll(); toast("تنظیمات کافه ذخیره شد — در اپ مشتری هم دیده می‌شود ✓");
  });
  byId("wipeBtn").addEventListener("click", function () {
    if (!confirm("همه‌ی داده‌های پنل روی این دستگاه (منوی ویرایش‌شده، سفارش‌ها، کمپین‌ها و تنظیمات) پاک شود؟")) return;
    [MENU_KEY, ORDERS_KEY, CAFE_KEY, CAMP_KEY].forEach(function (k) { try { localStorage.removeItem(k); } catch (e) {} });
    menu = loadMenu(); renderAll(); toast("داده‌های پنل پاک و به حالت اول برگشت");
  });

  /* --------------------------------------------------------------- events */
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-advance],[data-cancelorder],[data-ofilter],[data-edit],[data-avail],[data-goto],[data-delcamp]");
    if (!t) return;
    var d = t.dataset;
    if (d.ofilter !== undefined && t.hasAttribute("data-ofilter")) { state.orderFilter = d.ofilter; renderAll(); }
    if (d.advance) changeOrder(d.advance, function (o) { o.status = Math.min(3, o.status + 1); toast("سفارش #" + o.code + ": " + STATUS[o.status]); return o; });
    if (d.cancelorder && confirm("این سفارش حذف شود؟")) changeOrder(d.cancelorder, function () { return null; });
    if (d.edit) openItem(d.edit);
    if (d.goto) setView(d.goto);
    if (d.delcamp) { setJSON(CAMP_KEY, getJSON(CAMP_KEY, []).filter(function (c) { return c.id !== d.delcamp; })); renderCampaigns(); }
    if (d.avail) {
      var i = itemById(d.avail); if (!i) return;
      i.available = !i.available; saveMenu(i.available ? "«" + i.fa + "» موجود شد" : "«" + i.fa + "» ناموجود شد — در اپ مشتری هم قفل می‌شود");
      renderAll();
    }
  });
  document.addEventListener("change", function (e) {
    var p = e.target.closest("[data-price]"); if (!p) return;
    var i = itemById(p.dataset.price); if (!i) return;
    i.price = Math.max(0, +p.value || 0);
    saveMenu("قیمت «" + i.fa + "» شد " + money(i.price) + " تومان — در اپ مشتری به‌روز شد");
  });

  /* سفارش تازه از تبِ اپ مشتری بیاید، بدون رفرش نشان بده */
  window.addEventListener("storage", function (e) {
    if (e.key === ORDERS_KEY) { renderAll(); toast("🧾 سفارش تازه رسید!"); }
    if (e.key === MENU_KEY) { menu = loadMenu(); renderAll(); }
  });
  setInterval(function () { if (isIn() && (state.view === "orders" || state.view === "dashboard")) renderAll(); }, 20000);

  function renderAll() {
    var orders = loadOrders();
    renderDashboard(orders); renderOrders(orders); renderMenu(); renderCustomers(); renderCampaigns(); renderSettings();
  }

  if (isIn()) showApp(); else showLogin();
})();
