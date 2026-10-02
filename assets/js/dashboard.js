/* ==========================================================================
   CafeLoop — demo dashboard engine
   Renders the cafe dashboard from CAFE_LOOP_DATA: KPIs, charts, Smart Return
   list, campaign builder and campaign results. Pure vanilla JS.
   ========================================================================== */
(function () {
  "use strict";

  var D = window.CAFE_LOOP_DATA;
  if (!D) return;

  var H = D.helper;

  /* ---------------------------------------------------------------- utils */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function svgEl(name, attrs) {
    var el = document.createElementNS("http://www.w3.org/2000/svg", name);
    Object.keys(attrs || {}).forEach(function (k) { el.setAttribute(k, attrs[k]); });
    return el;
  }

  function fitCanvas(canvas) {
    var dpr = window.devicePixelRatio || 1;
    var rect = canvas.getBoundingClientRect();
    var w = Math.max(220, rect.width);
    var h = Math.max(140, rect.height || 200);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    var ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx: ctx, w: w, h: h };
  }

  function css(name, fallback) {
    var v = getComputedStyle(document.documentElement).getPropertyValue(name);
    return (v || "").trim() || fallback;
  }

  /* ------------------------------------------------------------- line chart */
  function lineChart(canvas, labels, series) {
    var c = fitCanvas(canvas);
    var ctx = c.ctx, w = c.w, h = c.h;
    var pad = { top: 16, right: 14, bottom: 30, left: 38 };
    var innerW = w - pad.left - pad.right;
    var innerH = h - pad.top - pad.bottom;
    var max = 0;
    series.forEach(function (s) { s.values.forEach(function (v) { if (v > max) max = v; }); });
    max = Math.ceil(max / 10) * 10 + 5;

    var x = function (i) { return pad.left + (innerW * i) / Math.max(1, labels.length - 1); };
    var y = function (v) { return pad.top + innerH - (innerH * v) / max; };

    /* grid */
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(34,23,19,.08)";
    ctx.lineWidth = 1;
    ctx.font = "11px Vazirmatn, sans-serif";
    ctx.fillStyle = "rgba(107,90,81,.9)";
    ctx.textAlign = "center";
    for (var g = 0; g <= 4; g++) {
      var val = (max / 4) * g;
      var yy = y(val);
      ctx.beginPath();
      ctx.moveTo(pad.left, yy);
      ctx.lineTo(w - pad.right, yy);
      ctx.stroke();
      ctx.textAlign = "right";
      ctx.fillText(Math.round(val) + "%", pad.left - 8, yy + 4);
    }

    /* x labels */
    ctx.textAlign = "center";
    labels.forEach(function (lab, i) {
      ctx.fillText(lab, x(i), h - 8);
    });

    /* series */
    series.forEach(function (s) {
      /* area */
      var grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + innerH);
      grad.addColorStop(0, s.fillTop);
      grad.addColorStop(1, "rgba(255,255,255,0)");
      ctx.beginPath();
      ctx.moveTo(x(0), y(s.values[0]));
      s.values.forEach(function (v, i) { ctx.lineTo(x(i), y(v)); });
      ctx.lineTo(x(s.values.length - 1), pad.top + innerH);
      ctx.lineTo(x(0), pad.top + innerH);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      /* line */
      ctx.beginPath();
      s.values.forEach(function (v, i) {
        if (i === 0) ctx.moveTo(x(i), y(v)); else ctx.lineTo(x(i), y(v));
      });
      ctx.strokeStyle = s.color;
      ctx.lineWidth = 2.6;
      ctx.lineJoin = "round";
      ctx.stroke();

      /* points */
      s.values.forEach(function (v, i) {
        ctx.beginPath();
        ctx.arc(x(i), y(v), 3.4, 0, Math.PI * 2);
        ctx.fillStyle = "#fff";
        ctx.fill();
        ctx.strokeStyle = s.color;
        ctx.lineWidth = 2.2;
        ctx.stroke();
      });
    });
  }

  /* -------------------------------------------------------------- bar chart */
  function barChart(canvas, labels, values) {
    var c = fitCanvas(canvas);
    var ctx = c.ctx, w = c.w, h = c.h;
    var pad = { top: 18, right: 12, bottom: 30, left: 34 };
    var innerW = w - pad.left - pad.right;
    var innerH = h - pad.top - pad.bottom;
    var max = Math.max.apply(null, values) * 1.15 || 1;
    var slot = innerW / values.length;
    var bw = Math.min(34, slot * 0.58);

    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(34,23,19,.08)";
    ctx.font = "11px Vazirmatn, sans-serif";
    for (var g = 0; g <= 3; g++) {
      var yy = pad.top + innerH - (innerH / 3) * g;
      ctx.beginPath();
      ctx.moveTo(pad.left, yy);
      ctx.lineTo(w - pad.right, yy);
      ctx.stroke();
      ctx.fillStyle = "rgba(107,90,81,.9)";
      ctx.textAlign = "right";
      ctx.fillText(String(Math.round((max / 3) * g)), pad.left - 8, yy + 4);
    }

    values.forEach(function (v, i) {
      var bh = (innerH * v) / max;
      var bx = pad.left + slot * i + (slot - bw) / 2;
      var by = pad.top + innerH - bh;
      var isPeak = v === Math.max.apply(null, values);
      var grad = ctx.createLinearGradient(0, by, 0, by + bh);
      if (isPeak) { grad.addColorStop(0, "#e0b169"); grad.addColorStop(1, "#c8773c"); }
      else { grad.addColorStop(0, "#dd9759"); grad.addColorStop(1, "#b0652f"); }

      var r = Math.min(7, bw / 2);
      ctx.beginPath();
      ctx.moveTo(bx, by + bh);
      ctx.lineTo(bx, by + r);
      ctx.quadraticCurveTo(bx, by, bx + r, by);
      ctx.lineTo(bx + bw - r, by);
      ctx.quadraticCurveTo(bx + bw, by, bx + bw, by + r);
      ctx.lineTo(bx + bw, by + bh);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.fillStyle = "rgba(107,90,81,.95)";
      ctx.textAlign = "center";
      ctx.fillText(labels[i], bx + bw / 2, h - 8);
    });
  }

  /* ------------------------------------------------------------------ KPIs */
  function renderKpis() {
    var host = $("#kpiGrid");
    if (!host) return;
    var k = D.kpis;
    var items = [
      { label: "فروش ۳۰ روز", value: H.toman(k.revenue), delta: k.revenueDelta, up: true, mono: true, accent: true },
      { label: "مشتریان", value: String(k.customers), delta: k.customersDelta, up: true, mono: true },
      { label: "نرخ بازگشت (Repeat Rate)", value: k.repeatRate + "%", delta: k.repeatDelta, up: true, mono: false },
      { label: "مشتری در معرض ریزش", value: String(k.atRisk), delta: "درآمد قابل بازیابی " + H.toman(k.recoverable), up: false, mono: true, danger: true }
    ];
    host.innerHTML = items.map(function (it) {
      return '<article class="kpi' + (it.accent ? " kpi--accent" : "") + ' reveal is-in">' +
        '<div class="kpi__label">' + it.label + "</div>" +
        '<div class="kpi__value">' + it.value + "</div>" +
        '<div class="kpi__delta ' + (it.up ? "up" : "down") + '">' + it.delta + "</div>" +
        "</article>";
    }).join("");
  }

  /* ------------------------------------------------------------ Smart table */
  var tableState = { query: "", status: "all", sort: "priority" };

  function priority(c) {
    var ticket = c.spend / Math.max(1, c.visits);
    var visitsPerMonth = 30 / Math.max(1, c.gap);
    var value = ticket * visitsPerMonth;
    var recency = Math.min(2.4, c.out / Math.max(1, c.gap));
    return Math.round((value * recency) / 1000);
  }

  function filteredCustomers() {
    var q = tableState.query.trim();
    var list = D.customers.filter(function (c) {
      var okStatus = tableState.status === "all" || c.status === tableState.status;
      var okQuery = !q || c.name.indexOf(q) !== -1 || c.fav.indexOf(q) !== -1 || c.last.indexOf(q) !== -1;
      return okStatus && okQuery;
    });
    var sorters = {
      priority: function (a, b) { return priority(b) - priority(a); },
      spend: function (a, b) { return b.spend - a.spend; },
      out: function (a, b) { return b.out - a.out; },
      visits: function (a, b) { return b.visits - a.visits; }
    };
    return list.sort(sorters[tableState.sort] || sorters.priority);
  }

  function initials(name) { return name.slice(0, 1); }

  function avatarClass(status) {
    if (status === "active") return "avatar avatar--mint";
    if (status === "fading") return "avatar avatar--violet";
    return "avatar";
  }

  function renderTable() {
    var tbody = $("#customerRows");
    if (!tbody) return;
    var list = filteredCustomers();
    $("#tableCount") && ($("#tableCount").textContent = list.length + " مشتری");

    if (!list.length) {
      tbody.innerHTML = '<tr><td colspan="7" class="center muted">موردی پیدا نشد.</td></tr>';
      return;
    }

    tbody.innerHTML = list.map(function (c) {
      return "<tr>" +
        '<td><div class="customer-cell"><span class="' + avatarClass(c.status) + '">' + initials(c.name) + "</span>" +
          "<div><b>" + c.name + "</b><div class=\"tiny faint mono\">" + c.last + "</div></div></div></td>" +
        '<td><span class="pill ' + H.statusClass[c.status] + '">' + H.statusLabel[c.status] + "</span></td>" +
        '<td class="num">' + c.visits + "</td>" +
        '<td class="num">' + H.toman(c.spend) + "</td>" +
        "<td>" + c.fav + "</td>" +
        '<td class="num">' + c.out + " روز</td>" +
        '<td class="num"><b>' + priority(c) + "</b></td>" +
        "</tr>";
    }).join("");
  }

  function renderRiskList() {
    var host = $("#riskList");
    if (!host) return;
    var risk = D.customers.filter(function (c) { return c.status === "risk"; })
      .sort(function (a, b) { return priority(b) - priority(a); })
      .slice(0, 5);

    host.innerHTML = risk.map(function (c) {
      return '<div class="flow__item" style="padding:14px 16px">' +
        '<span class="' + avatarClass(c.status) + '">' + initials(c.name) + "</span>" +
        '<div style="flex:1">' +
          "<b>" + c.name + "</b> · " + c.visits + " مراجعه · علاقه: " + c.fav +
          '<div class="tiny muted">' + c.out + " روز است نیامده (چرخه‌ی همیشگی: هر " + c.gap + " روز)</div>" +
        "</div>" +
        '<span class="pill pill--danger">' + priority(c) + "</span>" +
      "</div>";
    }).join("") || '<p class="muted small">موردی نیست. 🎉</p>';
  }

  /* -------------------------------------------------------------- charts */
  function renderCharts() {
    var trend = $("#repeatTrendChart");
    if (trend) {
      lineChart(trend, D.charts.repeatTrend.labels, [
        { values: D.charts.repeatTrend.repeat, color: "#2fa98c", fillTop: "rgba(47,169,140,.28)" },
        { values: D.charts.repeatTrend.onetime, color: "rgba(200,119,60,.85)", fillTop: "rgba(200,119,60,.16)" }
      ]);
    }
    var hourly = $("#hourlyChart");
    if (hourly) barChart(hourly, D.charts.hourly.labels, D.charts.hourly.values);
  }

  function renderProducts() {
    var host = $("#productBars");
    if (!host) return;
    var max = Math.max.apply(null, D.charts.products.map(function (p) { return p.value; }));
    host.innerHTML = D.charts.products.map(function (p) {
      var pct = Math.round((p.value / max) * 100);
      return '<div class="bar-row">' +
        "<span>" + p.name + "</span>" +
        '<span class="bar-track"><span class="bar-fill" data-value="' + pct + '"></span></span>' +
        '<span class="bar-value">' + p.value + "</span>" +
      "</div>";
    }).join("");

    var bars = $$(".bar-fill[data-value]", host);
    setTimeout(function () {
      bars.forEach(function (b) { b.style.width = b.dataset.value + "%"; });
    }, 200);
  }

  /* ------------------------------------------------------------- campaigns */
  function renderCampaignHistory() {
    var tbody = $("#campaignRows");
    if (!tbody) return;
    tbody.innerHTML = D.campaigns.map(function (c) {
      return "<tr>" +
        "<td><b>" + c.name + "</b><div class=\"tiny faint\">" + c.segment + "</div></td>" +
        '<td><span class="pill ' + (c.status === "active" ? "pill--brand" : "pill--ok") + '">' +
          (c.status === "active" ? "در حال اجرا" : "تمام‌شده") + "</span></td>" +
        '<td class="num">' + c.sent + "</td>" +
        '<td class="num">' + c.opened + "</td>" +
        '<td class="num">' + c.returned + "</td>" +
        '<td class="num"><b>' + H.toman(c.revenue) + "</b></td>" +
        '<td class="faint small">' + c.when + "</td>" +
      "</tr>";
    }).join("");
  }

  /* ----------------------------------------------- interactive campaign builder */
  var builder = { segment: "risk", sent: false };

  var SEGMENTS = {
    risk: {
      title: "در معرض ریزش",
      desc: "بیش از ۲ برابر چرخه‌ی همیشگی‌شان غایب بوده‌اند.",
      match: function (c) { return c.status === "risk"; }
    },
    fading: {
      title: "کم‌رنگ",
      desc: "کمی از ریتم همیشگی عقب افتاده‌اند؛ بهترین زمان مداخله.",
      match: function (c) { return c.status === "fading"; }
    },
    vip: {
      title: "مشتریان ارزشمند",
      desc: "مجموع خرید بالا؛ حفظشان بالاترین اولویت است.",
      match: function (c) { return c.spend >= 7000000; }
    },
    evening: {
      title: "ساعت‌های کم‌ترافیک",
      desc: "مشتریانی که امکان حضور در بازه‌ی ۱۴–۱۸ را دارند.",
      match: function (c) { return /1[4-8]|09|10|11/.test(c.hour); }
    }
  };

  function segmentList() {
    return D.customers.filter(SEGMENTS[builder.segment].match);
  }

  function renderBuilder() {
    var host = $("#segmentOptions");
    if (!host) return;

    host.innerHTML = Object.keys(SEGMENTS).map(function (key) {
      var s = SEGMENTS[key];
      var count = D.customers.filter(s.match).length;
      return '<button type="button" class="chip' + (builder.segment === key ? " is-active" : "") + '" data-segment="' + key + '">' +
        s.title + ' · ' + count + "</button>";
    }).join("");

    $$("[data-segment]", host).forEach(function (btn) {
      btn.addEventListener("click", function () {
        builder.segment = btn.dataset.segment;
        builder.sent = false;
        renderBuilder();
        renderBuilderPreview();
      });
    });

    var seg = SEGMENTS[builder.segment];
    var count = segmentList().length;
    $("#segmentTitle") && ($("#segmentTitle").textContent = seg.title);
    $("#segmentDesc") && ($("#segmentDesc").textContent = seg.desc);
    $("#segmentCount") && ($("#segmentCount").textContent = count + " نفر");
  }

  function renderBuilderPreview() {
    var host = $("#segmentPreview");
    if (!host) return;
    var list = segmentList().slice(0, 6);
    host.innerHTML = list.map(function (c) {
      return "<tr>" +
        '<td><div class="customer-cell"><span class="' + avatarClass(c.status) + '">' + initials(c.name) + "</span>" +
          "<b>" + c.name + "</b></div></td>" +
        "<td>" + c.fav + "</td>" +
        '<td class="num">' + c.out + " روز</td>" +
        '<td class="num">' + H.toman(c.spend / Math.max(1, c.visits)) + "</td>" +
      "</tr>";
    }).join("");
    var estimate = segmentList().reduce(function (sum, c) {
      return sum + (c.spend / Math.max(1, c.visits)) * 0.16;
    }, 0);
    $("#segmentEstimate") && ($("#segmentEstimate").textContent = H.toman(Math.round(estimate)));
    $("#segmentTotal") && ($("#segmentTotal").textContent = String(segmentList().length));
  }

  function runCampaign() {
    if (builder.sent) return;
    var seg = SEGMENTS[builder.segment];
    var count = segmentList().length;
    if (!count) { window.cafeLoopToast("این بخش مشتری‌ای ندارد."); return; }

    var btn = $("#runCampaign");
    if (btn) { btn.disabled = true; btn.textContent = "در حال ارسال…"; }

    var opened = Math.round(count * 0.34);
    var returned = Math.round(opened * 0.46);
    var avgTicket = Math.round(segmentList().reduce(function (s, c) {
      return s + c.spend / Math.max(1, c.visits);
    }, 0) / count);
    var revenue = returned * avgTicket;

    setTimeout(function () {
      builder.sent = true;
      var result = $("#campaignResult");
      if (result) {
        result.classList.remove("hidden");
        result.innerHTML =
          '<div class="kpi-grid">' +
            '<div class="kpi"><div class="kpi__label">هدف‌گذاری‌شده</div><div class="kpi__value">' + count + "</div></div>" +
            '<div class="kpi"><div class="kpi__label">پیام باز شد</div><div class="kpi__value">' + opened + '</div><div class="kpi__delta">' + Math.round((opened / count) * 100) + "٪</div></div>" +
            '<div class="kpi"><div class="kpi__label">بازگشت</div><div class="kpi__value" style="color:var(--mint-600)">' + returned + '</div><div class="kpi__delta up">' + Math.round((returned / count) * 100) + "٪ از گروه</div></div>" +
            '<div class="kpi kpi--accent"><div class="kpi__label">درآمد ساخته‌شده</div><div class="kpi__value">' + H.toman(revenue) + "</div></div>" +
          "</div>" +
          '<p class="note" style="margin-top:16px">گزارش آزمایشی است: مدل ساده‌ی «۳۴٪ باز شدن و ۴۶٪ بازگشت از باز‌شده‌ها» با میانگین سبد همین گروه. در پایلوت واقعی، اعداد از داده‌ی همان کافه می‌آید.</p>';
      }

      /* append to history */
      D.campaigns.unshift({
        name: "کمپین " + seg.title,
        segment: count + " نفر · " + seg.title,
        sent: count, opened: opened, returned: returned, revenue: revenue,
        when: "همین حالا", status: "active"
      });
      renderCampaignHistory();
      if (btn) { btn.disabled = false; btn.textContent = "اجرای کمپین"; }
      renderBuilder();
      window.cafeLoopToast("کمپین برای " + count + " مشتری ساخته شد — نتیجه در پایین همین صفحه.");
      var anchor = $("#campaignResult");
      anchor && anchor.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 900);
  }

  function messagePreview() {
    var tpl = $("#msgTemplate");
    var out = $("#msgPreview");
    if (!tpl || !out) return;
    var render = function () {
      var first = segmentList()[0] || { name: "مشتری", fav: "قهوه", points: 0 };
      out.textContent = tpl.value
        .replace(/{name}/g, first.name)
        .replace(/{fav}/g, first.fav)
        .replace(/{points}/g, first.points);
    };
    tpl.addEventListener("input", render);
    render();
  }

  /* ------------------------------------------------------------------ init */
  function bindControls() {
    var search = $("#customerSearch");
    search && search.addEventListener("input", function () {
      tableState.query = search.value;
      renderTable();
    });

    $$("[data-status-filter]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        tableState.status = btn.dataset.statusFilter;
        $$("[data-status-filter]").forEach(function (b) { b.classList.toggle("is-active", b === btn); });
        renderTable();
      });
    });

    var sort = $("#customerSort");
    sort && sort.addEventListener("change", function () {
      tableState.sort = sort.value;
      renderTable();
    });

    var run = $("#runCampaign");
    run && run.addEventListener("click", runCampaign);

    var tpl = $("#msgTemplate");
    tpl && tpl.addEventListener("input", messagePreview);

    var exportBtn = $("#exportCsv");
    exportBtn && exportBtn.addEventListener("click", function () {
      var rows = [["name", "visits", "spend", "favorite", "days_since_last_visit", "status"]];
      filteredCustomers().forEach(function (c) {
        rows.push([c.name, c.visits, c.spend, c.fav, c.out, H.statusLabel[c.status]]);
      });
      var csv = rows.map(function (r) { return r.join(","); }).join("\n");
      var blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "cafeloop-customers.csv";
      a.click();
      URL.revokeObjectURL(a.href);
      window.cafeLoopToast("خروجی CSV ساخته شد (نمونه).");
    });

    var redraw = function () { renderCharts(); };
    var t;
    window.addEventListener("resize", function () { clearTimeout(t); t = setTimeout(redraw, 160); });

    /* redraw charts when the section scrolls into view (nicer first paint) */
    if ("IntersectionObserver" in window) {
      var charts = [$("#repeatTrendChart"), $("#hourlyChart")].filter(Boolean);
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          setTimeout(redraw, 120);
          io.disconnect();
        });
      }, { threshold: 0.2 });
      charts.forEach(function (c) { io.observe(c); });
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderKpis();
    renderTable();
    renderRiskList();
    renderProducts();
    renderCharts();
    renderCampaignHistory();
    renderBuilder();
    renderBuilderPreview();
    messagePreview();
    bindControls();
  });
})();
