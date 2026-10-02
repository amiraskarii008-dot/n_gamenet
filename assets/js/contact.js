/* ==========================================================================
   CafeLoop — demo contact form (no backend, everything stays in the browser)
   ========================================================================== */
(function () {
  "use strict";

  var PLAN_LABEL = {
    starter: "Starter",
    growth: "Growth",
    pro: "Pro",
    "": "هنوز مشخص نیست"
  };

  /* Prefill plan from ?plan=growth */
  function prefill() {
    var params = new URLSearchParams(location.search);
    var plan = params.get("plan");
    var select = document.getElementById("plan");
    if (plan && select && PLAN_LABEL[plan] !== undefined) select.value = plan;
  }

  function setError(fieldId, on) {
    var field = document.getElementById(fieldId);
    if (field) field.classList.toggle("has-error", !!on);
    return !on;
  }

  /* Accept both Persian and Latin digits. */
  function normalizeDigits(value) {
    var fa = "۰۱۲۳۴۵۶۷۸۹", ar = "٠١٢٣٤٥٦٧٨٩";
    return String(value).replace(/[۰-۹٠-٩]/g, function (ch) {
      var i = fa.indexOf(ch);
      if (i === -1) i = ar.indexOf(ch);
      return i === -1 ? ch : String(i);
    });
  }

  function validate() {
    var ok = true;

    var cafe = document.getElementById("cafeName").value.trim();
    if (cafe.length < 2) ok = setError("field-cafe", true) && ok; else setError("field-cafe", false);

    var name = document.getElementById("contactName").value.trim();
    if (name.length < 3) ok = setError("field-name", true) && ok; else setError("field-name", false);

    var phone = normalizeDigits(document.getElementById("phone").value).replace(/[\s-]/g, "");
    var phoneOk = /^09\d{9}$/.test(phone) || /^9\d{9}$/.test(phone);
    if (!phoneOk) ok = setError("field-phone", true) && ok; else setError("field-phone", false);

    var city = document.getElementById("city").value.trim();
    if (city.length < 2) ok = setError("field-city", true) && ok; else setError("field-city", false);

    var consent = document.getElementById("consent").checked;
    var consentErr = document.getElementById("consentErr");
    if (consentErr) consentErr.style.display = consent ? "none" : "block";
    if (!consent) ok = false;

    return ok;
  }

  function fillSuccess() {
    var planValue = document.getElementById("plan").value;
    var planText = PLAN_LABEL[planValue] !== undefined ? PLAN_LABEL[planValue] : planValue;

    document.getElementById("successName").textContent = document.getElementById("contactName").value.trim();
    document.getElementById("successCafe").textContent = document.getElementById("cafeName").value.trim();
    document.getElementById("successCity").textContent = document.getElementById("city").value.trim();
    document.getElementById("successPlan").textContent = planText;
  }

  document.addEventListener("DOMContentLoaded", function () {
    var form = document.getElementById("demoForm");
    if (!form) return;

    prefill();

    var consentErr = document.getElementById("consentErr");
    if (consentErr) consentErr.style.display = "none";

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validate()) {
        window.cafeLoopToast && window.cafeLoopToast("چند مورد را درست کن و دوباره امتحان کن.");
        var firstError = form.querySelector(".has-error input, .has-error select, .has-error textarea");
        firstError && firstError.focus();
        return;
      }

      var btn = document.getElementById("submitBtn");
      btn.disabled = true;
      btn.textContent = "در حال ارسال…";

      setTimeout(function () {
        fillSuccess();
        form.classList.add("hidden");
        document.getElementById("formSuccess").classList.remove("hidden");
        window.cafeLoopToast && window.cafeLoopToast("درخواست ثبت شد — در نسخه‌ی واقعی، همین‌جا تماس می‌گیریم.");
      }, 700);
    });

    /* live-clearing of errors */
    ["cafeName", "contactName", "phone", "city"].forEach(function (id) {
      var el = document.getElementById(id);
      el && el.addEventListener("input", function () {
        var field = el.closest(".field");
        field && field.classList.remove("has-error");
      });
    });

    var reset = document.getElementById("resetForm");
    reset && reset.addEventListener("click", function () {
      document.getElementById("formSuccess").classList.add("hidden");
      form.classList.remove("hidden");
      form.reset();
      var btn = document.getElementById("submitBtn");
      btn.disabled = false;
      btn.textContent = "ارسال درخواست";
      prefill();
    });
  });
})();
