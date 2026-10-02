/* ==========================================================================
   CafeLoop — sample data (demo only)
   Any resemblance to real customers is accidental. This is fake data used
   to show the shape of the product, exactly as described in the 7-day plan.
   ========================================================================== */
window.CAFE_LOOP_DATA = (function () {
  "use strict";

  var customers = [
    { name: "امیر",  last: "۰۹۱۲***۴۵۱۲", visits: 7,  spend: 4200000, fav: "Americano",       hour: "18:00–21:00", points: 740, gap: 8,  out: 12, status: "risk" },
    { name: "سارا",  last: "۰۹۳۵***۸۸۷۱", visits: 22, spend: 11800000, fav: "Latte",          hour: "09:00–12:00", points: 2150, gap: 3,  out: 2,  status: "active" },
    { name: "نیما",  last: "۰۹۱۹***۲۲۴۵", visits: 5,  spend: 2600000, fav: "Espresso",       hour: "16:00–19:00", points: 505, gap: 11, out: 21, status: "risk" },
    { name: "مینا",  last: "۰۹۰۱***۳۳۹۰", visits: 14, spend: 7400000, fav: "Cappuccino",     hour: "10:00–13:00", points: 1320, gap: 6,  out: 7,  status: "active" },
    { name: "رضا",   last: "۰۹۳۳***۵۵۶۷", visits: 9,  spend: 5100000, fav: "Cold Brew",      hour: "19:00–22:00", points: 910, gap: 9,  out: 15, status: "fading" },
    { name: "هستی",  last: "۰۹۱۲***۷۷۸۲", visits: 31, spend: 18600000, fav: "Flat White",     hour: "08:00–10:00", points: 3120, gap: 2,  out: 1,  status: "active" },
    { name: "کاوه",  last: "۰۹۱۵***۱۱۴۵", visits: 6,  spend: 3100000, fav: "Mocha",          hour: "17:00–20:00", points: 620, gap: 10, out: 19, status: "risk" },
    { name: "الهام", last: "۰۹۳۶***۶۶۰۱", visits: 18, spend: 9200000, fav: "Americano",      hour: "11:00–14:00", points: 1640, gap: 4,  out: 5,  status: "active" },
    { name: "بهنام", last: "۰۹۱۰***۹۹۳۸", visits: 4,  spend: 1900000, fav: "Tea & Cake",     hour: "20:00–23:00", points: 385, gap: 13, out: 27, status: "risk" },
    { name: "پریسا", last: "۰۹۱۴***۴۴۷۰", visits: 11, spend: 6300000, fav: "Iced Latte",     hour: "15:00–18:00", points: 1180, gap: 7,  out: 11, status: "fading" },
    { name: "سیاوش", last: "۰۹۱۲***۲۲۸۳", visits: 26, spend: 15300000, fav: "Espresso",       hour: "07:00–09:00", points: 2760, gap: 3,  out: 3,  status: "active" },
    { name: "نگار",  last: "۰۹۳۹***۵۵۱۹", visits: 8,  spend: 4400000, fav: "Cheesecake+Latte", hour: "18:00–21:00", points: 820, gap: 9,  out: 14, status: "fading" },
    { name: "آرش",   last: "۰۹۳۰***۸۸۱۴", visits: 3,  spend: 1450000, fav: "Americano",      hour: "12:00–15:00", points: 290, gap: 12, out: 25, status: "risk" },
    { name: "شیوا",  last: "۰۹۱۸***۳۳۰۷", visits: 17, spend: 8100000, fav: "Matcha Latte",   hour: "10:00–12:00", points: 1510, gap: 5,  out: 6,  status: "active" },
    { name: "فرزاد", last: "۰۹۱۲***۶۶۵۸", visits: 6,  spend: 3400000, fav: "Mocha",          hour: "19:00–22:00", points: 640, gap: 10, out: 18, status: "risk" },
    { name: "لیلا",  last: "۰۹۳۵***۱۱۹۳", visits: 12, spend: 5900000, fav: "Cappuccino",     hour: "16:00–18:00", points: 1095, gap: 6,  out: 9,  status: "active" },
    { name: "مهدی",  last: "۰۹۱۱***۴۸۲۶", visits: 2,  spend: 980000,  fav: "Espresso",       hour: "08:00–11:00", points: 175, gap: 15, out: 31, status: "risk" },
    { name: "رویا",  last: "۰۹۳۷***۷۷۳۵", visits: 20, spend: 10400000, fav: "Flat White",     hour: "09:00–11:00", points: 2030, gap: 4,  out: 4,  status: "active" },
    { name: "کامران", last: "۰۹۱۶***۲۲۹۰", visits: 7,  spend: 3900000, fav: "Cold Brew",      hour: "17:00–19:00", points: 720, gap: 8,  out: 13, status: "risk" },
    { name: "نازنین", last: "۰۹۳۲***۵۵۴۳", visits: 15, spend: 7700000, fav: "Iced Latte",     hour: "14:00–17:00", points: 1385, gap: 5,  out: 8,  status: "active" },
    { name: "بابک",   last: "۰۹۱۲***۳۸۷۰", visits: 10, spend: 5200000, fav: "Turkish Coffee", hour: "20:00–23:00", points: 950, gap: 7,  out: 12, status: "fading" },
    { name: "ترانه", last: "۰۹۳۴***۹۹۲۶", visits: 5,  spend: 2700000, fav: "Mocha",          hour: "18:00–20:00", points: 520, gap: 11, out: 23, status: "risk" },
    { name: "شهاب",  last: "۰۹۱۲***۶۱۲۹", visits: 24, spend: 13100000, fav: "Americano",      hour: "07:00–10:00", points: 2460, gap: 3,  out: 2,  status: "active" },
    { name: "یاسمن", last: "۰۹۳۸***۴۴۰۸", visits: 13, spend: 6800000, fav: "Cappuccino",     hour: "11:00–13:00", points: 1200, gap: 6,  out: 10, status: "fading" }
  ];

  var campaigns = [
    { name: "بازگشت مشتریان در معرض ریزش",  segment: "۲۷ نفر · ۱۰+ روز غایب", sent: 127, opened: 41, returned: 19, revenue: 3400000, when: "۵ روز پیش",  status: "done" },
    { name: "آفر آخر هفته (Coffee + Cake)", segment: "۱۱۰ نفر · فعالین ۱۸–۲۱", sent: 110, opened: 58, returned: 27, revenue: 5100000, when: "۱۲ روز پیش", status: "done" },
    { name: "یادآوری امتیاز نزدیک به پاداش", segment: "۴۳ نفر · بالای ۶۰۰ امتیاز", sent: 43, opened: 29, returned: 15, revenue: 2200000, when: "۱۹ روز پیش", status: "done" },
    { name: "کمپین ساعات کم‌ترافیک",         segment: "۶۸ نفر · عصر ۱۴–۱۶",       sent: 68, opened: 22, returned: 6,  revenue: 890000,   when: "دیروز",      status: "active" }
  ];

  return {
    cafe: { name: "Cafe Noir", plan: "Growth", since: "۴ ماه پیش" },

    kpis: {
      revenue: 32800000,
      revenueDelta: "+12٪",
      customers: 187,
      customersDelta: "+8٪",
      repeatRate: 34,
      repeatDelta: "+12 امتیاز",
      avgTicket: 175000,
      atRisk: 27,
      recoverable: 8400000
    },

    charts: {
      repeatTrend: {
        labels: ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور"],
        repeat: [22, 24, 26, 29, 32, 34],
        onetime: [78, 76, 74, 71, 68, 66]
      },
      hourly: {
        labels: ["۸–۱۰", "۱۰–۱۲", "۱۲–۱۴", "۱۴–۱۶", "۱۶–۱۸", "۱۸–۲۱", "۲۱–۲۳"],
        values: [42, 78, 96, 61, 88, 134, 57]
      },
      products: [
        { name: "Latte",             value: 214 },
        { name: "Americano",         value: 189 },
        { name: "Cappuccino",        value: 143 },
        { name: "Cold Brew",         value: 96 },
        { name: "Cheesecake",        value: 74 },
        { name: "Matcha Latte",      value: 58 }
      ]
    },

    campaigns: campaigns,

    customers: customers,

    ai: {
      greeting: "Good morning, Cafe Noir ☀️",
      note: "دیروز ۱۸۷ مشتری داشتید. ۳۲ مشتری که معمولاً ماهانه بیش از دو بار می‌آمدند، بیش از ۱۰ روز است برنگشته‌اند. پیشنهاد می‌کنم برای ۲۱ نفر از آن‌ها پیشنهاد بازگشت ارسال شود.",
      offer: "\"Coffee + Cake offer بین ۱۶:۰۰ تا ۱۸:۰۰ امروز اجرا شود\"",
      reason: "این بازه کم‌ترین ترافیک هفته را دارد و ۴۸ مشتری فعال در آن ساعت سابقه‌ی خرید دارند."
    },

    helper: {
      statusLabel: { active: "فعال", fading: "کم‌رنگ", risk: "در معرض ریزش" },
      statusClass: { active: "pill--ok", fading: "pill--warn", risk: "pill--danger" },
      toman: function (n) {
        if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
        if (n >= 1000) return Math.round(n / 1000) + "K";
        return String(n);
      },
      tomanFull: function (n) { return Number(n).toLocaleString("en-US"); }
    }
  };
})();
