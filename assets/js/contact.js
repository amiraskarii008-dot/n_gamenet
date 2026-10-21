/* ==========================================================================
   CafeLoop — contact form
   No backend: validates the request, then builds a ready-to-send email.
   Nothing is stored on a server.
   ========================================================================== */
(function () {
  "use strict";

  var PLAN_LABEL = {
    "": "هنوز مشخص نیست",
    starter: "Starter",
    growth: "Growth",
    pro: "Pro"
  };

  function $(id) { return document.getElementById(id); }

  function normalizeDigits(value) {
    var fa = "۰۱۲۳۴۵۶۷۸۹", ar = "٠١٢٣٤٥٦٧٨٩";
    return String(value).replace(/[۰-۹٠-٩]/g, function (ch) {
      var i = fa.indexOf(ch);
      if (i === -1) i = ar.indexOf(ch);
      return i === -1 ? ch : String(i);
    });
  }

  function prefillPlan() {
    var plan = new URLSearchParams(location.search).get("plan");
    var select = $("plan");
    if (plan && select && PLAN_LABEL[plan] !== undefined) select.value = plan;
  }

  function setError(fieldId, on) {
    var field = $(fieldId);
    if (field) field.classList.toggle("has-error", !!on);
    return !on;
  }

  function validate() {
    var ok = true;

    var cafe = $("cafeName").value.trim();
    if (cafe.length < 2) ok = setError("field-cafe", true) && ok; else setError("field-cafe", false);

    var name = $("contactName").value.trim();
    if (name.length < 3) ok = setError("field-name", true) && ok; else setError("field-name", false);

    var phone = normalizeDigits($("phone").value).replace(/[\s-]/g, "");
    var phoneOk = /^09\d{9}$/.test(phone) || /^9\d{9}$/.test(phone);
    if (!phoneOk) ok = setError("field-phone", true) && ok; else setError("field-phone", false);

    var city = $("city").value.trim();
    if (city.length < 2) ok = setError("field-city", true) && ok; else setError("field-city", false);

    var consent = $("consent").checked;
    var consentErr = $("consentErr");
    if (consentErr) consentErr.style.display = consent ? "none" : "block";
    if (!consent) ok = false;

    return ok;
  }

  function requestText() {
    var planValue = $("plan").value;
    var planText = PLAN_LABEL[planValue] || planValue;
    var branches = $("branches") ? $("branches").value : "1";
    var note = $("note") ? $("note").value.trim() : "";

    return [
      "درخواست راه‌اندازی CafeLoop",
      "",
      "کافه: " + $("cafeName").value.trim(),
      "نام: " + $("contactName").value.trim(),
      "موبایل: " + $("phone").value.trim(),
      "شهر: " + $("city").value.trim(),
      "پلن: " + planText,
      "تعداد شعبه: " + branches,
      note ? "یادداشت: " + note : "یادداشت: —"
    ].join("\n");
  }

  function fillSuccess() {
    $("successName").textContent = $("contactName").value.trim();
    $("successCafe").textContent = $("cafeName").value.trim();
    $("successCity").textContent = $("city").value.trim();
    $("successPlan").textContent = PLAN_LABEL[$("plan").value] || $("plan").value;

    var text = requestText();
    var link = $("sendMail");
    if (link) {
      link.href = "mailto:hello@cafeloop.ir" +
        "?subject=" + encodeURIComponent("درخواست راه‌اندازی — " + $("cafeName").value.trim()) +
        "&body=" + encodeURIComponent(text);
    }
    var copy = $("copyRequest");
    if (copy) {
      copy.onclick = function () {
        var done = function () {
          window.cafeLoopToast && window.cafeLoopToast("متن درخواست کپی شد.");
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done, done);
        } else {
          var area = document.createElement("textarea");
          area.value = text;
          document.body.appendChild(area);
          area.select();
          try { document.execCommand("copy"); } catch (e) {}
          document.body.removeChild(area);
          done();
        }
      };
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    var form = $("demoForm");
    if (!form) return;

    prefillPlan();
    var consentErr = $("consentErr");
    if (consentErr) consentErr.style.display = "none";

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validate()) {
        window.cafeLoopToast && window.cafeLoopToast("چند مورد را درست کن و دوباره امتحان کن.");
        var firstError = form.querySelector(".has-error input, .has-error select, .has-error textarea");
        if (firstError) firstError.focus();
        return;
      }

      var btn = $("submitBtn");
      if (btn) { btn.disabled = true; btn.textContent = "در حال آماده‌سازی…"; }

      setTimeout(function () {
        fillSuccess();
        form.classList.add("hidden");
        $("formSuccess").classList.remove("hidden");
        window.cafeLoopToast && window.cafeLoopToast("درخواست آماده شد — با ایمیل بفرست.");
        var panel = $("formSuccess");
        panel && panel.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 600);
    });

    ["cafeName", "contactName", "phone", "city"].forEach(function (id) {
      var el = $(id);
      if (!el) return;
      el.addEventListener("input", function () {
        var field = el.closest(".field");
        if (field) field.classList.remove("has-error");
      });
    });

    var reset = $("resetForm");
    if (reset) {
      reset.addEventListener("click", function () {
        $("formSuccess").classList.add("hidden");
        form.classList.remove("hidden");
        form.reset();
        var btn = $("submitBtn");
        if (btn) { btn.disabled = false; btn.textContent = "ارسال درخواست"; }
        prefillPlan();
        consentErr && (consentErr.style.display = "none");
      });
    }
  });
})();
