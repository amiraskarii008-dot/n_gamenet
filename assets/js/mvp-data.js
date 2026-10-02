/* ==========================================================================
   CafeLoop MVP — customer app data (demo data only)
   همه‌ی داده‌ها ساختگی است و فقط برای نشان دادن شکل محصول است.
   ========================================================================== */
window.MVP_DATA = (function () {
  "use strict";

  var categories = [
    { id: "hot",   name: "نوشیدنی گرم", icon: "☕" },
    { id: "cold",  name: "نوشیدنی سرد", icon: "🧊" },
    { id: "cake",  name: "کیک و دسر",   icon: "🍰" },
    { id: "food",  name: "صبحانه و غذا", icon: "🥐" },
    { id: "tea",   name: "دمنوش و چای", icon: "🍵" }
  ];

  /* tags: vegan / sugarfree / decaf / glutenfree —Nutrition: kcal, caf (mg caffeine), prep (min) */
  var items = [
    { id: "americano", name: "Americano", fa: "آمریکانو", cat: "hot", desc: "دوبل اسپرسو + آب گرم، بدنه‌ی تمیز", price: 145000, icon: "☕", rating: 4.7, sold: 189, kcal: 15, caf: 150, prep: 3, tags: ["vegan", "sugarfree"], spicy: 0 },
    { id: "latte", name: "Latte", fa: "لاته", cat: "hot", desc: "شیر مخملی و میکرو فوم نازک", price: 175000, icon: "🥛", rating: 4.8, sold: 214, kcal: 180, caf: 110, prep: 4, tags: [], spicy: 0 },
    { id: "cappuccino", name: "Cappuccino", fa: "کاپوچینو", cat: "hot", desc: "فوم غلیظ، نسبت کلاسیک ۱/۳", price: 168000, icon: "☕", rating: 4.6, sold: 143, kcal: 160, caf: 110, prep: 4, tags: [], spicy: 0 },
    { id: "flatwhite", name: "Flat White", fa: "فلت وایت", cat: "hot", desc: "ریز‌فوم + دوبل ristretto", price: 182000, icon: "🤍", rating: 4.7, sold: 121, kcal: 165, caf: 145, prep: 4, tags: [], spicy: 0 },
    { id: "mocha", name: "Mocha", fa: "موکا", cat: "hot", desc: "شکلات تلخ ۷۰٪ + اسپرسو", price: 198000, icon: "🍫", rating: 4.5, sold: 87, kcal: 290, caf: 120, prep: 5, tags: [], spicy: 0 },
    { id: "espresso", name: "Espresso", fa: "اسپرسو", cat: "hot", desc: "۱۸ گرم دوز، ۲۵ ثانیه", price: 120000, icon: "⚡", rating: 4.6, sold: 96, kcal: 5, caf: 90, prep: 2, tags: ["vegan", "sugarfree"], spicy: 0 },
    { id: "caramel", name: "Caramel Macchiato", fa: "کارامل ماکیاتو", cat: "hot", desc: "وانیل، شیر، کارامل شور", price: 212000, icon: "🍮", rating: 4.8, sold: 132, kcal: 320, caf: 100, prep: 5, tags: [], spicy: 0 },
    { id: "affogato", name: "Affogato", fa: "آفوگاتو", cat: "cold", desc: "بستنی وانیلی + شات اسپرسو", price: 205000, icon: "🍨", rating: 4.7, sold: 54, kcal: 340, caf: 80, prep: 3, tags: ["glutenfree"], spicy: 0 },

    { id: "coldbrew", name: "Cold Brew", fa: "کلد برو", cat: "cold", desc: "دم سرد ۱۸ ساعته، کم‌ترشی", price: 195000, icon: "🧊", rating: 4.8, sold: 96, kcal: 10, caf: 200, prep: 2, tags: ["vegan", "sugarfree"], spicy: 0 },
    { id: "icedlatte", name: "Iced Latte", fa: "آیس لاته", cat: "cold", desc: "یخ، شیر سرد، دوبل اسپرسو", price: 185000, icon: "🧋", rating: 4.6, sold: 118, kcal: 175, caf: 120, prep: 3, tags: [], spicy: 0 },
    { id: "estonic", name: "Espresso Tonic", fa: "اسپرسو تونیک", cat: "cold", desc: "تونیک هندوانه‌ای + اسپرسو", price: 205000, icon: "🍹", rating: 4.5, sold: 63, kcal: 120, caf: 95, prep: 3, tags: ["vegan"], spicy: 0 },
    { id: "matcha", name: "Matcha Latte (Iced)", fa: "مچا لاته سرد", cat: "cold", desc: "مچا مراسمویی ceremonial", price: 215000, icon: "🍵", rating: 4.7, sold: 58, kcal: 145, caf: 70, prep: 4, tags: ["vegan"], spicy: 0 },
    { id: "frappe", name: "Mocha Frappé", fa: "موکا فراپه", cat: "cold", desc: "یخ‌زده، خامه، سس شکلات", price: 225000, icon: "🥤", rating: 4.4, sold: 71, kcal: 430, caf: 95, prep: 5, tags: [], spicy: 0 },
    { id: "lemonade", name: "Lemon & Mint", fa: "لیموناد نعنا", cat: "cold", desc: "لیمو تازه، نعنا، بدون شکر افزوده", price: 165000, icon: "🍋", rating: 4.5, sold: 49, kcal: 60, caf: 0, prep: 3, tags: ["vegan", "sugarfree", "decaf"], spicy: 0 },

    { id: "cheesecake", name: "New York Cheesecake", fa: "چیزکیک نیویورکی", cat: "cake", desc: "برش سنگین، سس تمبل بری", price: 225000, icon: "🍰", rating: 4.9, sold: 74, kcal: 480, caf: 0, prep: 2, tags: ["glutenfree"], spicy: 0 },
    { id: "tiramisu", name: "Tiramisu", fa: "تیرامیسو", cat: "cake", desc: "ماسکارپونه، لیدی‌فینگر، قهوه", price: 240000, icon: "🍫", rating: 4.8, sold: 66, kcal: 420, caf: 45, prep: 2, tags: [], spicy: 0 },
    { id: "brownie", name: "Walnut Brownie", fa: "برونی گردو", cat: "cake", desc: "گرم، با بستنی وانیلی", price: 210000, icon: "🟤", rating: 4.6, sold: 58, kcal: 510, caf: 35, prep: 4, tags: [], spicy: 0 },
    { id: "croissant", name: "Butter Croissant", fa: "کروسان کره‌ای", cat: "cake", desc: "۲۷ لایه، پخت صبح", price: 130000, icon: "🥐", rating: 4.5, sold: 92, kcal: 330, caf: 0, prep: 1, tags: ["vegan"], spicy: 0 },
    { id: "bananabread", name: "Banana Bread", fa: "مافین موز", cat: "cake", desc: "بدون شکر raf، دارچین", price: 138000, icon: "🍌", rating: 4.4, sold: 41, kcal: 290, caf: 0, prep: 1, tags: ["sugarfree", "vegan"], spicy: 0 },

    { id: "omelette", name: "Mushroom Omelette", fa: "املت قارچ و پنیر", cat: "food", desc: "سه تخم‌مرغ، قارچ سوته", price: 285000, icon: "🍳", rating: 4.7, sold: 52, kcal: 420, caf: 0, prep: 11, tags: [], spicy: 0 },
    { id: "club", name: "Club Sandwich", fa: "کلاب ساندویچ", cat: "food", desc: "مرغ، بیکن، سس خردل", price: 320000, icon: "🥪", rating: 4.6, sold: 63, kcal: 560, caf: 0, prep: 12, tags: [], spicy: 1 },
    { id: "caesarsalad", name: "Caesar Salad", fa: "سالاد سزار با مرغ", cat: "food", desc: "کاهو رومن، سس خانگی", price: 295000, icon: "🥗", rating: 4.5, sold: 44, kcal: 340, caf: 0, prep: 9, tags: ["sugarfree"], spicy: 0 },
    { id: "avocado", name: "Avocado Toast", fa: "تست آووکادو", cat: "food", desc: "چاودار، فلفل چیلی، لیمو", price: 275000, icon: "🥑", rating: 4.8, sold: 78, kcal: 380, caf: 0, prep: 8, tags: ["vegan"], spicy: 2 },
    { id: "pancake", name: "Berry Pancakes", fa: "پنکیک میوه‌ای", cat: "food", desc: "سه لایه، سس توت‌فرنگی", price: 265000, icon: "🥞", rating: 4.7, sold: 57, kcal: 610, caf: 0, prep: 13, tags: [], spicy: 0 },

    { id: "chai", name: "Masala Chai", fa: "چای ماسالا", cat: "tea", desc: "هل، دارچین، زنجبیل تازه", price: 155000, icon: "🫖", rating: 4.6, sold: 68, kcal: 120, caf: 50, prep: 6, tags: [], spicy: 2 },
    { id: "tea", name: "Persian Tea", fa: "چای سیاه ایرانی", cat: "tea", desc: "زغالی، با نبات و خرما", price: 85000, icon: "🍵", rating: 4.7, sold: 121, kcal: 20, caf: 45, prep: 5, tags: ["vegan", "sugarfree", "glutenfree"], spicy: 0 },
    { id: "camelthyme", name: "Thyme & Camelthorn", fa: "آویشن واکه شتری", cat: "tea", desc: "دمنوش سنتی، بدون کافئین", price: 110000, icon: "🌿", rating: 4.3, sold: 33, kcal: 10, caf: 0, prep: 6, tags: ["vegan", "decaf", "sugarfree"], spicy: 0 },
    { id: "chamomile", name: "Chamomile", fa: "دمنوش بابونه", cat: "tea", desc: "آرام‌بخش، با عسل جداگانه", price: 115000, icon: "🌼", rating: 4.4, sold: 29, kcal: 15, caf: 0, prep: 6, tags: ["vegan", "decaf"], spicy: 0 },
    { id: "hibiscus", name: "Hibiscus", fa: "چای ترش", cat: "tea", desc: "سرد یا گرم، لیمو", price: 120000, icon: "🌺", rating: 4.5, sold: 37, kcal: 25, caf: 0, prep: 6, tags: ["vegan", "decaf", "sugarfree"], spicy: 0 }
  ];

  var sizes = [
    { id: "s", name: "کوچک (۸oz)", delta: 0 },
    { id: "m", name: "متوسط (۱۲oz)", delta: 20000 },
    { id: "l", name: "بزرگ (۱۶oz)", delta: 38000 }
  ];
  var milks = [
    { id: "whole", name: "شیر پرچرب", delta: 0 },
    { id: "low", name: "کم‌چرب", delta: 0 },
    { id: "oat", name: "جو دوسر (Oat)", delta: 30000 },
    { id: "almond", name: "بادام", delta: 30000 },
    { id: "soy", name: "سویا", delta: 28000 },
    { id: "none", name: "بدون شیر", delta: -10000 }
  ];
  var sugars = [
    { id: "0", name: "بدون شکر" },
    { id: "1", name: "کم" },
    { id: "2", name: "معمولی" },
    { id: "3", name: "شیرین" }
  ];
  var temps = [
    { id: "hot", name: "گرم" },
    { id: "warm", name: "ولرم" },
    { id: "iced", name: "سرد / یخ" }
  ];
  var extras = [
    { id: "shot", name: "شات اضافی اسپرسو", price: 30000 },
    { id: "vanilla", name: "شیرینی وانیل", price: 18000 },
    { id: "caramel", name: "سس کارامل شور", price: 22000 },
    { id: "collagen", name: "کلاژن", price: 45000 },
    { id: "extraice", name: "یخ بیشتر", price: 0 },
    { id: "decafshot", name: "شات دی‌کف", price: 20000 }
  ];

  var tiers = [
    { id: "bronze", name: "برنز", need: 0, icon: "🥉", perk: "۱٪ امتیاز پایه" },
    { id: "silver", name: "نقره‌ای", need: 1000, icon: "🥈", perk: "۱.۲۵٪ امتیاز + ۱۰٪ تخفیف تولد" },
    { id: "gold", name: "طلایی", need: 3000, icon: "🥇", perk: "۱.۵٪ امتیاز + ارتقای رایگان سایز" },
    { id: "diamond", name: "الماس", need: 6000, icon: "💎", perk: "۲٪ امتیاز + میز رزروی + آفر زودهنگام" }
  ];

  var rewards = [
    { id: "free-drink", name: "یک نوشیدنی رایگان", cost: 1000, icon: "☕", note: "هر نوشیدنی گرم تا ۲۱۵ هزار تومان" },
    { id: "cake", name: "برش کیک رایگان", cost: 1500, icon: "🍰", note: "چیزکیک، تیرامیسو یا برونی" },
    { id: "ten", name: "کد ۱۰٪ تخفیف", cost: 600, icon: "🏷️", note: "روی کل فاکتور، یک‌بار مصرف" },
    { id: "brunch", name: "برونچ دو نفره", cost: 4200, icon: "🍳", note: "آخر هفته‌ها، ۱۱ تا ۱۴" },
    { id: "beans", name: "یک بسته دانه ۲۵۰g", cost: 2600, icon: "🫘", note: "تور رستری خودش" },
    { id: "upgrade", name: "ارتقای سایز + شیر گیاهی", cost: 350, icon: "⤴️", note: "روی سفارش بعدی" }
  ];

  var service = [
    { id: "waiter", name: "صدای پیشخدمت", icon: "🙋", note: "میانگین پاسخ ۴۰ ثانیه" },
    { id: "bill", name: "آوردن فاکتور", icon: "🧾", note: "پرداخت در میز" },
    { id: "refill", name: "ادامه آب / چای", icon: "💧", note: "رایگان" },
    { id: "tissue", name: "دستمال و شکر", icon: "🧻", note: "روی میز" },
    { id: "quiet", name: "میز آرام‌تر", icon: "🤫", note: "اگر جا باشد" },
    { id: "plug", name: "پریز و وای‌فای", icon: "🔌", note: "رمز: noirguest" },
    { id: "heater", name: "هیتر / کپشن", icon: "🔥", note: "بخش تراس" },
    { id: "baby", name: "صندلی کودک", icon: "🍼", note: "۲ عدد موجود" }
  ];

  var offers = [
    {
      id: "comeback", icon: "🎁", title: "قهوه‌ی همیشگیت منتظرتونه",
      body: "۲۰٪ روی Americanano و هر نوشیدنی اسپرسو — چون ۹ روز است نیامده‌ای.",
      code: "NOIR-COME-20", off: 20, kind: "percent",
      why: "میانگین فاصله‌ی مراجعه‌ی تو ۸ روز است و امروز روز ۹ بدون سفارش گذشته.",
      window: "امروز ۱۶:۰۰ تا ۱۸:۰۰", expiresIn: "۱۲ ساعت"
    },
    {
      id: "happyhour", icon: "🕓", title: "ساعت آرام: ۱۴:۰۰ تا ۱۶:۰۰",
      body: "کیک + نوشیدنی با ۲۵٪ تخفیف — برای اینکه کافه خلوت است و ما شلوغی را دوست نداریم.",
      code: "NOIR-QIET-25", off: 25, kind: "percent",
      why: "تو معمولاً عصر می‌آیی؛ این بازه کم‌ترین ترافیک هفته است.",
      window: "هر روز ۱۴ تا ۱۶", expiresIn: "۳ روز"
    },
    {
      id: "points", icon: "⭐", title: "امتیاز دوبرابر روی دمنوش",
      body: "سفارش دمنوش امروز = ۲× امتیاز. نزدیک پاداش بعدی‌ات هستی.",
      code: "NOIR-X2-TEA", off: 0, kind: "points",
      why: "به ۱۰۰۰ امتیاز برای نوشیدنی رایگان نزدیک‌تری؛ این سریع‌ترین راه رسیدن است.",
      window: "امشب تا ۲۳:۰۰", expiresIn: "۶ ساعت"
    },
    {
      id: "friend", icon: "👯", title: "دوستت مهمان ما باشد",
      body: "یک فنجان رایگان برای همراهت اگر خودت سفارش بدهی.",
      code: "NOIR-FRIEND-1", off: 0, kind: "gift",
      why: "مشتری‌هایی که همراه می‌آورند ۲.۳ برابر بیشتر برمی‌گردند.",
      window: "هفته‌ی جاری", expiresIn: "۵ روز"
    }
  ];

  /* seed data for the demo persona: the customer already has a light history */
  var seed = {
    name: "امیر",
    phoneMasked: "۰۹۱۲***۴۵۱۲",
    memberSince: "۴ ماه پیش",
    basePoints: 740,
    visits: 7,
    spend: 4200000,
    fav: "Americano",
    hour: "18:00–21:00",
    gapDays: 8,
    daysAway: 9,
    hourHistogram: { "۸–۱۰": 0, "۱۰–۱۲": 1, "۱۲–۱۴": 0, "۱۴–۱۶": 1, "۱۶–۱۸": 1, "۱۸–۲۱": 3, "۲۱–۲۳": 1 },
    spendTrend: [420, 610, 380, 720, 540, 930, 1180],
    monthLabels: ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر"]
  };

  var cafe = {
    name: "Cafe Noir",
    city: "تهران، جردن",
    table: 7,
    open: "۰۸:۰۰ — ۲۳:۳۰",
    wifi: "noirguest",
    wait: 9
  };

  return {
    categories: categories,
    items: items,
    sizes: sizes,
    milks: milks,
    sugars: sugars,
    temps: temps,
    extras: extras,
    tiers: tiers,
    rewards: rewards,
    service: service,
    offers: offers,
    seed: seed,
    cafe: cafe
  };
})();
