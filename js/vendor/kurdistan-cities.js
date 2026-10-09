// City coordinates: GeoNames via Open-Meteo Geocoding API, verified 2026-10-09.
// https://open-meteo.com/en/docs/geocoding-api (GeoNames CC BY 4.0).
(function(){const cities={
  "erbil": {
    "name": "Erbil",
    "lat": 36.19117,
    "lon": 44.00943,
    "country": "IQ",
    "geonamesId": 95446,
    "timezone": "Asia/Baghdad",
    "ku": "هەولێر",
    "ar": "أربيل"
  },
  "sulaymaniyah": {
    "name": "Sulaymaniyah",
    "lat": 35.56496,
    "lon": 45.4329,
    "country": "IQ",
    "geonamesId": 98463,
    "timezone": "Asia/Baghdad",
    "ku": "سلێمانی",
    "ar": "السليمانية"
  },
  "duhok": {
    "name": "Duhok",
    "lat": 36.86608,
    "lon": 42.9879,
    "country": "IQ",
    "geonamesId": 96994,
    "timezone": "Asia/Baghdad",
    "ku": "دهۆک",
    "ar": "دهوك"
  },
  "halabja": {
    "name": "Halabja",
    "lat": 35.17778,
    "lon": 45.98611,
    "country": "IQ",
    "geonamesId": 96205,
    "timezone": "Asia/Baghdad",
    "ku": "هەڵەبجە",
    "ar": "حلبجة"
  },
  "shaqlawa": {
    "name": "Shaqlawa",
    "lat": 36.40422,
    "lon": 44.32563,
    "country": "IQ",
    "geonamesId": 91083,
    "timezone": "Asia/Baghdad",
    "ku": "شەقڵاوە",
    "ar": "شقلاوة"
  },
  "zakho": {
    "name": "Zakho",
    "lat": 37.14871,
    "lon": 42.68591,
    "country": "IQ",
    "geonamesId": 89570,
    "timezone": "Asia/Baghdad",
    "ku": "زاخۆ",
    "ar": "زاخو"
  },
  "soran": {
    "name": "Soran",
    "lat": 36.65558,
    "lon": 44.54217,
    "country": "IQ",
    "geonamesId": 96961,
    "timezone": "Asia/Baghdad",
    "ku": "سۆران",
    "ar": "سوران"
  },
  "ranya": {
    "name": "Ranya",
    "lat": 36.25511,
    "lon": 44.88239,
    "country": "IQ",
    "geonamesId": 92052,
    "timezone": "Asia/Baghdad",
    "ku": "ڕانیە",
    "ar": "رانية"
  },
  "akre": {
    "name": "Akre",
    "lat": 36.76038,
    "lon": 43.89428,
    "country": "IQ",
    "geonamesId": 98822,
    "timezone": "Asia/Baghdad",
    "ku": "ئاکرێ",
    "ar": "عقرة"
  },
  "kifri": {
    "name": "Kifri",
    "lat": 34.68963,
    "lon": 44.96057,
    "country": "IQ",
    "geonamesId": 94298,
    "timezone": "Asia/Baghdad",
    "ku": "کفری",
    "ar": "كفري"
  },
  "kirkuk": {
    "name": "Kirkuk",
    "lat": 35.46806,
    "lon": 44.39222,
    "country": "IQ",
    "geonamesId": 94787,
    "timezone": "Asia/Baghdad",
    "ku": "کەرکووک",
    "ar": "كركوك"
  },
  "sinjar": {
    "name": "Sinjar",
    "lat": 36.3209,
    "lon": 41.87656,
    "country": "IQ",
    "geonamesId": 448149,
    "timezone": "Asia/Baghdad",
    "ku": "شنگال",
    "ar": "سنجار"
  },
  "makhmur": {
    "name": "Makhmur",
    "lat": 35.77622,
    "lon": 43.57974,
    "country": "IQ",
    "geonamesId": 93818,
    "timezone": "Asia/Baghdad",
    "ku": "مەخموور",
    "ar": "مخمور"
  },
  "van": {
    "name": "Van",
    "lat": 38.49457,
    "lon": 43.38323,
    "country": "TR",
    "geonamesId": 298117,
    "timezone": "Europe/Istanbul",
    "ku": "وان",
    "ar": "وان"
  },
  "mardin": {
    "name": "Mardin",
    "lat": 37.31309,
    "lon": 40.74357,
    "country": "TR",
    "geonamesId": 304797,
    "timezone": "Europe/Istanbul",
    "ku": "مێردین",
    "ar": "ماردين"
  },
  "batman": {
    "name": "Batman",
    "lat": 37.88738,
    "lon": 41.13221,
    "country": "TR",
    "geonamesId": 321836,
    "timezone": "Europe/Istanbul",
    "ku": "باتمان",
    "ar": "باتمان"
  },
  "hakkari": {
    "name": "Hakkari",
    "lat": 37.57444,
    "lon": 43.74083,
    "country": "TR",
    "geonamesId": 318137,
    "timezone": "Europe/Istanbul",
    "ku": "جۆلەمێرگ · هەکاری",
    "ar": "هكاري"
  },
  "siirt": {
    "name": "Siirt",
    "lat": 37.9293,
    "lon": 41.94134,
    "country": "TR",
    "geonamesId": 300822,
    "timezone": "Europe/Istanbul",
    "ku": "سێرت",
    "ar": "سعرد"
  },
  "bitlis": {
    "name": "Bitlis",
    "lat": 38.40115,
    "lon": 42.10784,
    "country": "TR",
    "geonamesId": 321025,
    "timezone": "Europe/Istanbul",
    "ku": "بەدلیس",
    "ar": "بدليس"
  },
  "mus": {
    "name": "Mus",
    "lat": 38.73163,
    "lon": 41.48482,
    "country": "TR",
    "geonamesId": 304081,
    "timezone": "Europe/Istanbul",
    "ku": "مووش",
    "ar": "موش"
  },
  "bingol": {
    "name": "Bingol",
    "lat": 38.88472,
    "lon": 40.49389,
    "country": "TR",
    "geonamesId": 321082,
    "timezone": "Europe/Istanbul",
    "ku": "چەولیک · بینگۆل",
    "ar": "بينغول"
  },
  "tunceli": {
    "name": "Tunceli",
    "lat": 39.09921,
    "lon": 39.54351,
    "country": "TR",
    "geonamesId": 298846,
    "timezone": "Europe/Istanbul",
    "ku": "دەرسیم · تونجەلی",
    "ar": "درسيم · تونجلي"
  },
  "sanliurfa": {
    "name": "Sanliurfa",
    "lat": 37.16708,
    "lon": 38.79392,
    "country": "TR",
    "geonamesId": 298333,
    "timezone": "Europe/Istanbul",
    "ku": "ڕوها · شانلیئورفا",
    "ar": "الرها · شانلي أورفا"
  },
  "agri": {
    "name": "Agri",
    "lat": 39.71467,
    "lon": 43.04015,
    "country": "TR",
    "geonamesId": 309647,
    "timezone": "Europe/Istanbul",
    "ku": "ئاگری",
    "ar": "أغري"
  },
  "sanandaj": {
    "name": "Sanandaj",
    "lat": 35.31495,
    "lon": 46.99883,
    "country": "IR",
    "geonamesId": 117574,
    "timezone": "Asia/Tehran",
    "ku": "سنە",
    "ar": "سنندج"
  },
  "mahabad": {
    "name": "Mahabad",
    "lat": 36.7631,
    "lon": 45.7222,
    "country": "IR",
    "geonamesId": 125446,
    "timezone": "Asia/Tehran",
    "ku": "مەهاباد",
    "ar": "مهاباد"
  },
  "saqqez": {
    "name": "Saqqez",
    "lat": 36.24992,
    "lon": 46.2735,
    "country": "IR",
    "geonamesId": 117392,
    "timezone": "Asia/Tehran",
    "ku": "سەقز",
    "ar": "سقز"
  },
  "baneh": {
    "name": "Baneh",
    "lat": 35.9975,
    "lon": 45.8853,
    "country": "IR",
    "geonamesId": 141584,
    "timezone": "Asia/Tehran",
    "ku": "بانە",
    "ar": "بانه"
  },
  "marivan": {
    "name": "Marivan",
    "lat": 35.51829,
    "lon": 46.18298,
    "country": "IR",
    "geonamesId": 124778,
    "timezone": "Asia/Tehran",
    "ku": "مەریوان",
    "ar": "مريوان"
  },
  "kermanshah": {
    "name": "Kermanshah",
    "lat": 34.31417,
    "lon": 47.065,
    "country": "IR",
    "geonamesId": 128226,
    "timezone": "Asia/Tehran",
    "ku": "کرماشان",
    "ar": "كرمانشاه"
  },
  "ilam": {
    "name": "Ilam",
    "lat": 33.6374,
    "lon": 46.4227,
    "country": "IR",
    "geonamesId": 130802,
    "timezone": "Asia/Tehran",
    "ku": "ئیلام",
    "ar": "إيلام"
  },
  "urmia": {
    "name": "Urmia",
    "lat": 37.55274,
    "lon": 45.07605,
    "country": "IR",
    "geonamesId": 121801,
    "timezone": "Asia/Tehran",
    "ku": "ورمێ",
    "ar": "أرومية"
  },
  "piranshahr": {
    "name": "Piranshahr",
    "lat": 36.701,
    "lon": 45.1413,
    "country": "IR",
    "geonamesId": 121110,
    "timezone": "Asia/Tehran",
    "ku": "پیرانشار",
    "ar": "بيرانشهر"
  },
  "sardasht": {
    "name": "Sardasht",
    "lat": 36.1552,
    "lon": 45.4788,
    "country": "IR",
    "geonamesId": 117111,
    "timezone": "Asia/Tehran",
    "ku": "سەردەشت",
    "ar": "سردشت"
  },
  "qamishli": {
    "name": "Qamishli",
    "lat": 37.05215,
    "lon": 41.23142,
    "country": "SY",
    "geonamesId": 173377,
    "timezone": "Asia/Damascus",
    "ku": "قامیشلۆ",
    "ar": "القامشلي"
  },
  "al-hasakah": {
    "name": "Al Hasakah",
    "lat": 36.50237,
    "lon": 40.74772,
    "country": "SY",
    "geonamesId": 173811,
    "timezone": "Asia/Damascus",
    "ku": "حەسەکە",
    "ar": "الحسكة"
  },
  "afrin": {
    "name": "Afrin",
    "lat": 36.51194,
    "lon": 36.86954,
    "country": "SY",
    "geonamesId": 174186,
    "timezone": "Asia/Damascus",
    "ku": "عەفرین",
    "ar": "عفرين"
  },
  "al-malikiyah": {
    "name": "Al Malikiyah",
    "lat": 37.17701,
    "lon": 42.14006,
    "country": "SY",
    "geonamesId": 173530,
    "timezone": "Asia/Damascus",
    "ku": "دێریک",
    "ar": "المالكية · ديريك"
  },
  "chamchamal": {
    "name": "Chamchamal",
    "lat": 35.53356,
    "lon": 44.8343,
    "country": "IQ",
    "geonamesId": 97417,
    "timezone": "Asia/Baghdad",
    "ku": "چەمچەماڵ",
    "ar": "جمجمال"
  },
  "amadiyah": {
    "name": "Amadiyah",
    "lat": 37.09214,
    "lon": 43.48769,
    "country": "IQ",
    "geonamesId": 99611,
    "timezone": "Asia/Baghdad",
    "ku": "ئامێدی",
    "ar": "العمادية"
  },
  "diyarbakir": {
    "name": "Diyarbakir",
    "lat": 37.91363,
    "lon": 40.21721,
    "country": "TR",
    "geonamesId": 316541,
    "timezone": "Europe/Istanbul",
    "ku": "ئامەد · دیاربەکر",
    "ar": "آمد · ديار بكر"
  },
  "sirnak": {
    "name": "Sirnak",
    "lat": 37.51393,
    "lon": 42.45432,
    "country": "TR",
    "geonamesId": 300640,
    "timezone": "Europe/Istanbul",
    "ku": "شرناخ",
    "ar": "شرناق"
  },
  "kobani": {
    "name": "Kobani",
    "lat": 36.89095,
    "lon": 38.35347,
    "country": "SY",
    "geonamesId": 172256,
    "timezone": "Asia/Damascus",
    "ku": "کۆبانی",
    "ar": "كوباني"
  },
  "amuda": {
    "name": "Amuda",
    "lat": 37.10417,
    "lon": 40.93,
    "country": "SY",
    "geonamesId": 173230,
    "timezone": "Asia/Damascus",
    "ku": "ئامودێ",
    "ar": "عامودا"
  }
};if(typeof module==='object'&&module.exports)module.exports=cities;else window.KURDISTAN_CITIES=cities;})();
