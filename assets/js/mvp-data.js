/* ==========================================================================
   CafeLoop MVP — customer app data (menu + sample CRM seed)
   منوی واقعی نمونه‌ی کافه (قابل ویرایش در پنل مدیریت)؛ داده‌ی رفتاری مشتری نمونه است.
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

  /* منوی واقعی کافه — هر آیتم: عکس واقعی (assets/img/menu)، مواد تشکیل‌دهنده،
     آلرژن‌ها، حجم، کالری، کافئین و زمان آماده‌سازی.
     مدیر کافه در پنل مدیریت (admin.html) می‌تواند همه‌ی این‌ها را ویرایش کند؛
     نسخه‌ی ویرایش‌شده در localStorage ذخیره و در همین اپ نمایش داده می‌شود.
     tags: vegan / sugarfree / decaf / glutenfree */
  var items = [
    { id: "americano", name: "Americano", fa: "آمریکانو", cat: "hot", desc: "دوبل اسپرسو (۳۶ گرم عصاره) + ۱۸۰ میلی‌لیتر آب ۹۰ درجه؛ بدنه‌ی تمیز و طعم شکلاتی ملایم", ingredients: "اسپرسو دوبل (۱۸ گرم قهوه عربیکا/روبوستا ۷۰/۳۰)، آب گرم", allergens: "—", img: "assets/img/menu/americano.jpg", price: 145000, icon: "☕", rating: 4.7, sold: 189, kcal: 15, caf: 150, prep: 3, tags: ["vegan", "sugarfree"], spicy: 0, available: true },
    { id: "latte", name: "Latte", fa: "لاته", cat: "hot", desc: "اسپرسو دوبل با ۲۰۰ میلی‌لیتر شیر بخاردهی‌شده و میکرو‌فوم نازک، لاته‌آرت دستی", ingredients: "اسپرسو دوبل، شیر پرچرب تازه", allergens: "شیر (لاکتوز)", img: "assets/img/menu/latte.jpg", price: 175000, icon: "🥛", rating: 4.8, sold: 214, kcal: 180, caf: 110, prep: 4, tags: [], spicy: 0, available: true },
    { id: "cappuccino", name: "Cappuccino", fa: "کاپوچینو", cat: "hot", desc: "نسبت کلاسیک یک‌سوم اسپرسو، یک‌سوم شیر، یک‌سوم فوم غلیظ + پودر کاکائو", ingredients: "اسپرسو دوبل، شیر، فوم شیر، کاکائو", allergens: "شیر (لاکتوز)", img: "assets/img/menu/cappuccino.jpg", price: 168000, icon: "☕", rating: 4.6, sold: 143, kcal: 160, caf: 110, prep: 4, tags: [], spicy: 0, available: true },
    { id: "flatwhite", name: "Flat White", fa: "فلت وایت", cat: "hot", desc: "دوبل ریسترتو با شیر مخملی و فوم بسیار نازک؛ طعم قهوه پررنگ‌تر از لاته", ingredients: "ریسترتو دوبل، شیر پرچرب", allergens: "شیر (لاکتوز)", img: "assets/img/menu/flatwhite.jpg", price: 182000, icon: "🤍", rating: 4.7, sold: 121, kcal: 165, caf: 145, prep: 4, tags: [], spicy: 0, available: true },
    { id: "mocha", name: "Mocha", fa: "موکا", cat: "hot", desc: "اسپرسو + شیر بخاردهی + شکلات تلخ ۷۰٪ ذوب‌شده، روی آن خامه‌ی فرم‌گرفته", ingredients: "اسپرسو دوبل، شیر، شکلات تلخ ۷۰٪، خامه", allergens: "شیر، سویا (در شکلات)", img: "assets/img/menu/mocha.jpg", price: 198000, icon: "🍫", rating: 4.5, sold: 87, kcal: 290, caf: 120, prep: 5, tags: [], spicy: 0, available: true },
    { id: "espresso", name: "Espresso", fa: "اسپرسو", cat: "hot", desc: "تک‌شات ۱۸ گرم دوز، عصاره‌گیری ۲۵ ثانیه، کرمای فندقی؛ سرو با آب گازدار", ingredients: "قهوه تازه‌آسیاب (ترکیب خانه ۷۰/۳۰)", allergens: "—", img: "assets/img/menu/espresso.jpg", price: 120000, icon: "⚡", rating: 4.6, sold: 96, kcal: 5, caf: 90, prep: 2, tags: ["vegan", "sugarfree"], spicy: 0, available: true },
    { id: "caramel", name: "Caramel Macchiato", fa: "کارامل ماکیاتو", cat: "hot", desc: "شیر وانیلی لایه‌ای، اسپرسو روی آن و سس کارامل شور دست‌ساز", ingredients: "اسپرسو، شیر، سیروپ وانیل، سس کارامل شور", allergens: "شیر (لاکتوز)", img: "assets/img/menu/caramel.jpg", price: 212000, icon: "🍮", rating: 4.8, sold: 132, kcal: 320, caf: 100, prep: 5, tags: [], spicy: 0, available: true },
    { id: "affogato", name: "Affogato", fa: "آفوگاتو", cat: "cold", desc: "یک اسکوپ بستنی وانیلی که شات اسپرسوی داغ سر میز رویش ریخته می‌شود", ingredients: "بستنی وانیلی، شات اسپرسو", allergens: "شیر، تخم‌مرغ", img: "assets/img/menu/affogato.jpg", price: 205000, icon: "🍨", rating: 4.7, sold: 54, kcal: 340, caf: 80, prep: 3, tags: ["glutenfree"], spicy: 0, available: true },

    { id: "coldbrew", name: "Cold Brew", fa: "کلد برو", cat: "cold", desc: "دم‌آوری سرد ۱۸ ساعته با دانه‌ی اتیوپی؛ اسیدیته‌ی پایین، شیرینی طبیعی، سرو روی یخ قالبی", ingredients: "قهوه اتیوپی تک‌خاستگاه، آب تصفیه، یخ", allergens: "—", img: "assets/img/menu/coldbrew.jpg", price: 195000, icon: "🧊", rating: 4.8, sold: 96, kcal: 10, caf: 200, prep: 2, tags: ["vegan", "sugarfree"], spicy: 0, available: true },
    { id: "icedlatte", name: "Iced Latte", fa: "آیس لاته", cat: "cold", desc: "دوبل اسپرسو روی یخ و شیر سرد تازه؛ لایه‌ها موقع سرو جدا دیده می‌شوند", ingredients: "اسپرسو دوبل، شیر سرد، یخ", allergens: "شیر (لاکتوز)", img: "assets/img/menu/icedlatte.jpg", price: 185000, icon: "🧋", rating: 4.6, sold: 118, kcal: 175, caf: 120, prep: 3, tags: [], spicy: 0, available: true },
    { id: "estonic", name: "Espresso Tonic", fa: "اسپرسو تونیک", cat: "cold", desc: "شات اسپرسو روی تونیک گازدار و یخ، با برش لیمو و رزماری؛ تلخ‌وترش و خنک", ingredients: "اسپرسو، آب تونیک، لیموترش، رزماری، یخ", allergens: "—", img: "assets/img/menu/estonic.jpg", price: 205000, icon: "🍹", rating: 4.5, sold: 63, kcal: 120, caf: 95, prep: 3, tags: ["vegan"], spicy: 0, available: true },
    { id: "matcha", name: "Matcha Latte (Iced)", fa: "مچا لاته سرد", cat: "cold", desc: "مچای ژاپنی درجه‌ی ceremonial که با ویسک بامبو زده می‌شود، روی شیر سرد و یخ", ingredients: "پودر مچا، شیر (یا شیر جو دوسر)، یخ", allergens: "شیر (قابل جایگزینی با شیر گیاهی)", img: "assets/img/menu/matcha.jpg", price: 215000, icon: "🍵", rating: 4.7, sold: 58, kcal: 145, caf: 70, prep: 4, tags: ["vegan"], spicy: 0, available: true },
    { id: "frappe", name: "Mocha Frappé", fa: "موکا فراپه", cat: "cold", desc: "اسپرسو، شیر و شکلات با یخ بلند شده؛ روی آن خامه و سس شکلات", ingredients: "اسپرسو، شیر، شکلات، یخ خردشده، خامه", allergens: "شیر، سویا", img: "assets/img/menu/frappe.jpg", price: 225000, icon: "🥤", rating: 4.4, sold: 71, kcal: 430, caf: 95, prep: 5, tags: [], spicy: 0, available: true },
    { id: "lemonade", name: "Lemon & Mint", fa: "لیموناد نعنا", cat: "cold", desc: "آب‌لیموی تازه‌ی همان روز، برگ نعنای کوبیده و آب گازدار؛ بدون شکر افزوده (شیرینی فقط از عسل)", ingredients: "لیموترش تازه، نعنا، عسل، آب گازدار", allergens: "—", img: "assets/img/menu/lemonade.jpg", price: 165000, icon: "🍋", rating: 4.5, sold: 49, kcal: 60, caf: 0, prep: 3, tags: ["vegan", "sugarfree", "decaf"], spicy: 0, available: true },

    { id: "cheesecake", name: "New York Cheesecake", fa: "چیزکیک نیویورکی", cat: "cake", desc: "برش ۱۴۰ گرمی چیزکیک پخته با بیس بیسکویت کره‌ای و سس توت‌فرنگی تازه؛ پخت روزانه", ingredients: "پنیر خامه‌ای، خامه، تخم‌مرغ، بیسکویت گندمی، توت‌فرنگی", allergens: "شیر، تخم‌مرغ، گلوتن", img: "assets/img/menu/cheesecake.jpg", price: 225000, icon: "🍰", rating: 4.9, sold: 74, kcal: 480, caf: 0, prep: 2, tags: [], spicy: 0, available: true },
    { id: "tiramisu", name: "Tiramisu", fa: "تیرامیسو", cat: "cake", desc: "لیدی‌فینگر خیس‌خورده در اسپرسو، کرم ماسکارپونه و خاک کاکائوی تلخ؛ حداقل ۸ ساعت استراحت", ingredients: "ماسکارپونه، خامه، لیدی‌فینگر، اسپرسو، کاکائو", allergens: "شیر، تخم‌مرغ، گلوتن", img: "assets/img/menu/tiramisu.jpg", price: 240000, icon: "🍫", rating: 4.8, sold: 66, kcal: 420, caf: 45, prep: 2, tags: [], spicy: 0, available: true },
    { id: "brownie", name: "Walnut Brownie", fa: "براونی گردو", cat: "cake", desc: "براونی شکلات تلخ ۶۰٪ با مغز گردوی ایرانی؛ گرم سرو می‌شود و کنارش بستنی وانیلی می‌آید", ingredients: "شکلات تلخ، کره، تخم‌مرغ، گردو، آرد", allergens: "شیر، تخم‌مرغ، گلوتن، مغزها (گردو)", img: "assets/img/menu/brownie.jpg", price: 210000, icon: "🟤", rating: 4.6, sold: 58, kcal: 510, caf: 35, prep: 4, tags: [], spicy: 0, available: true },
    { id: "croissant", name: "Butter Croissant", fa: "کروسان کره‌ای", cat: "cake", desc: "خمیر ۲۷ لایه با کره‌ی حیوانی، پخت هر صبح ساعت ۷؛ تا وقتی هست روی پیشخوان است", ingredients: "آرد گندم، کره حیوانی، شیر، مخمر، نمک دریا", allergens: "گلوتن، شیر", img: "assets/img/menu/croissant.jpg", price: 130000, icon: "🥐", rating: 4.5, sold: 92, kcal: 330, caf: 0, prep: 1, tags: [], spicy: 0, available: true },
    { id: "bananabread", name: "Banana Bread", fa: "نان موز دارچینی", cat: "cake", desc: "برش ضخیم نان موز با موز رسیده و دارچین، بدون شکر سفید؛ امکان تست‌شده با کره", ingredients: "موز، آرد سبوس‌دار، تخم‌مرغ، دارچین، شکر قهوه‌ای", allergens: "گلوتن، تخم‌مرغ", img: "assets/img/menu/bananabread.jpg", price: 138000, icon: "🍌", rating: 4.4, sold: 41, kcal: 290, caf: 0, prep: 1, tags: ["sugarfree"], spicy: 0, available: true },

    { id: "omelette", name: "Mushroom Omelette", fa: "املت قارچ و پنیر", cat: "food", desc: "سه تخم‌مرغ محلی، قارچ سوته‌شده در کره و پنیر گودا؛ با نان چاودار تست و گوجه گریل", ingredients: "تخم‌مرغ، قارچ دکمه‌ای، پنیر گودا، کره، نان چاودار", allergens: "تخم‌مرغ، شیر، گلوتن", img: "assets/img/menu/omelette.jpg", price: 285000, icon: "🍳", rating: 4.7, sold: 52, kcal: 420, caf: 0, prep: 11, tags: [], spicy: 0, available: true },
    { id: "club", name: "Club Sandwich", fa: "کلاب ساندویچ مرغ", cat: "food", desc: "سه لایه نان تست، مرغ گریل مزه‌دار، بیکن بوقلمون، تخم‌مرغ و سس خردل‌عسل؛ با سیب‌زمینی تنوری", ingredients: "سینه مرغ، بیکن بوقلمون، تخم‌مرغ، کاهو، گوجه، نان تست", allergens: "گلوتن، تخم‌مرغ، خردل", img: "assets/img/menu/club.jpg", price: 320000, icon: "🥪", rating: 4.6, sold: 63, kcal: 560, caf: 0, prep: 12, tags: [], spicy: 1, available: true },
    { id: "caesarsalad", name: "Caesar Salad", fa: "سالاد سزار با مرغ", cat: "food", desc: "کاهوی رومن تازه، مرغ گریل، کروتون سیر، پارمسان و سس سزار خانگی (بدون آنچوی، با سیر تازه)", ingredients: "کاهو رومن، مرغ گریل، نان کروتون، پارمسان، سس سزار", allergens: "شیر، تخم‌مرغ، گلوتن", img: "assets/img/menu/caesarsalad.jpg", price: 295000, icon: "🥗", rating: 4.5, sold: 44, kcal: 340, caf: 0, prep: 9, tags: ["sugarfree"], spicy: 0, available: true },
    { id: "avocado", name: "Avocado Toast", fa: "تست آووکادو و تخم‌مرغ", cat: "food", desc: "نان خمیرترش، پوره‌ی آووکادو با لیمو، تخم‌مرغ آب‌پز نیم‌پز و چیلی فلکس؛ روی آن کنجد و سبزی تازه", ingredients: "آووکادو، تخم‌مرغ، نان خمیرترش، لیمو، فلفل چیلی", allergens: "تخم‌مرغ، گلوتن، کنجد", img: "assets/img/menu/avocado.jpg", price: 275000, icon: "🥑", rating: 4.8, sold: 78, kcal: 380, caf: 0, prep: 8, tags: [], spicy: 2, available: true },
    { id: "pancake", name: "Berry Pancakes", fa: "پنکیک توت و افرا", cat: "food", desc: "سه پنکیک پف‌دار با کره، شربت افرا و توت‌فرنگی و بلوبری تازه؛ فقط تا ساعت ۱۳ سرو می‌شود", ingredients: "آرد، شیر، تخم‌مرغ، کره، شربت افرا، میوه‌ی تازه", allergens: "گلوتن، شیر، تخم‌مرغ", img: "assets/img/menu/pancake.jpg", price: 265000, icon: "🥞", rating: 4.7, sold: 57, kcal: 610, caf: 0, prep: 13, tags: [], spicy: 0, available: true },

    { id: "chai", name: "Masala Chai", fa: "چای ماسالا", cat: "tea", desc: "چای سیاه آسام با شیر، زنجبیل تازه، هل، دارچین و میخک؛ روی شعله می‌جوشد نه دم می‌کشد", ingredients: "چای آسام، شیر، زنجبیل، هل، دارچین، میخک", allergens: "شیر (لاکتوز)", img: "assets/img/menu/chai.jpg", price: 155000, icon: "🫖", rating: 4.6, sold: 68, kcal: 120, caf: 50, prep: 6, tags: [], spicy: 2, available: true },
    { id: "tea", name: "Persian Tea", fa: "چای سیاه ایرانی", cat: "tea", desc: "چای بهاره‌ی لاهیجان در قوری چینی، سرو با نبات شاخه‌ای و خرما؛ رنگ و عطر طبیعی بدون افزودنی", ingredients: "چای سیاه لاهیجان، آب، نبات، خرما", allergens: "—", img: "assets/img/menu/tea.jpg", price: 85000, icon: "🍵", rating: 4.7, sold: 121, kcal: 20, caf: 45, prep: 5, tags: ["vegan", "sugarfree", "glutenfree"], spicy: 0, available: true },
    { id: "camelthyme", name: "Thyme Herbal Tea", fa: "دمنوش آویشن", cat: "tea", desc: "آویشن کوهی خشک‌شده، دم ۶ دقیقه در قوری؛ عسل کنارش جدا می‌آید تا خودت اندازه‌اش کنی", ingredients: "برگ آویشن کوهی، عسل طبیعی (جداگانه)", allergens: "—", img: "assets/img/menu/camelthyme.jpg", price: 110000, icon: "🌿", rating: 4.3, sold: 33, kcal: 10, caf: 0, prep: 6, tags: ["vegan", "decaf", "sugarfree"], spicy: 0, available: true },
    { id: "chamomile", name: "Chamomile", fa: "دمنوش بابونه", cat: "tea", desc: "گل بابونه‌ی کامل (نه تی‌بگ)، آرام‌بخش و بدون کافئین؛ پیشنهاد ما برای ساعت‌های آخر شب", ingredients: "گل بابونه، عسل (جداگانه)", allergens: "—", img: "assets/img/menu/chamomile.jpg", price: 115000, icon: "🌼", rating: 4.4, sold: 29, kcal: 15, caf: 0, prep: 6, tags: ["vegan", "decaf"], spicy: 0, available: true },
    { id: "hibiscus", name: "Hibiscus", fa: "چای ترش (هیبیسکوس)", cat: "tea", desc: "کاسبرگ هیبیسکوس با رنگ یاقوتی و طعم ترش طبیعی؛ گرم یا روی یخ با برش لیمو", ingredients: "هیبیسکوس خشک، لیموترش، نبات (اختیاری)", allergens: "—", img: "assets/img/menu/hibiscus.jpg", price: 120000, icon: "🌺", rating: 4.5, sold: 37, kcal: 25, caf: 0, prep: 6, tags: ["vegan", "decaf", "sugarfree"], spicy: 0, available: true }
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
    { id: "beans", name: "یک بسته دانه ۲۵۰g", cost: 2600, icon: "🫘", note: "رستری خود کافه، تازه‌برشته" },
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
      body: "۲۰٪ روی آمریکانو و هر نوشیدنی اسپرسو — چون ۹ روز است نیامده‌ای.",
      code: "NOIR-COME-20", off: 20, kind: "percent",
      why: "میانگین فاصله‌ی مراجعه‌ی تو ۸ روز است و امروز روز ۹ بدون سفارش گذشته.",
      window: "امروز ۱۶:۰۰ تا ۱۸:۰۰", expiresIn: "۱۲ ساعت"
    },
    {
      id: "happyhour", icon: "🕓", title: "ساعت آرام: ۱۴:۰۰ تا ۱۶:۰۰",
      body: "کیک + نوشیدنی با ۲۵٪ تخفیف — برای اینکه کافه خلوت است و ما شلوغی را دوست نداریم.",
      code: "NOIR-QUIET-25", off: 25, kind: "percent",
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
