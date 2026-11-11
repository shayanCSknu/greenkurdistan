var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// js/vendor/kurdistan-cities.js
var require_kurdistan_cities = __commonJS({
  "js/vendor/kurdistan-cities.js"(exports, module) {
    (function() {
      const cities2 = {
        "erbil": {
          "name": "Erbil",
          "lat": 36.19117,
          "lon": 44.00943,
          "country": "IQ",
          "geonamesId": 95446,
          "timezone": "Asia/Baghdad",
          "ku": "\u0647\u06D5\u0648\u0644\u06CE\u0631",
          "ar": "\u0623\u0631\u0628\u064A\u0644"
        },
        "sulaymaniyah": {
          "name": "Sulaymaniyah",
          "lat": 35.56496,
          "lon": 45.4329,
          "country": "IQ",
          "geonamesId": 98463,
          "timezone": "Asia/Baghdad",
          "ku": "\u0633\u0644\u06CE\u0645\u0627\u0646\u06CC",
          "ar": "\u0627\u0644\u0633\u0644\u064A\u0645\u0627\u0646\u064A\u0629"
        },
        "duhok": {
          "name": "Duhok",
          "lat": 36.86608,
          "lon": 42.9879,
          "country": "IQ",
          "geonamesId": 96994,
          "timezone": "Asia/Baghdad",
          "ku": "\u062F\u0647\u06C6\u06A9",
          "ar": "\u062F\u0647\u0648\u0643"
        },
        "halabja": {
          "name": "Halabja",
          "lat": 35.17778,
          "lon": 45.98611,
          "country": "IQ",
          "geonamesId": 96205,
          "timezone": "Asia/Baghdad",
          "ku": "\u0647\u06D5\u06B5\u06D5\u0628\u062C\u06D5",
          "ar": "\u062D\u0644\u0628\u062C\u0629"
        },
        "shaqlawa": {
          "name": "Shaqlawa",
          "lat": 36.40422,
          "lon": 44.32563,
          "country": "IQ",
          "geonamesId": 91083,
          "timezone": "Asia/Baghdad",
          "ku": "\u0634\u06D5\u0642\u06B5\u0627\u0648\u06D5",
          "ar": "\u0634\u0642\u0644\u0627\u0648\u0629"
        },
        "zakho": {
          "name": "Zakho",
          "lat": 37.14871,
          "lon": 42.68591,
          "country": "IQ",
          "geonamesId": 89570,
          "timezone": "Asia/Baghdad",
          "ku": "\u0632\u0627\u062E\u06C6",
          "ar": "\u0632\u0627\u062E\u0648"
        },
        "soran": {
          "name": "Soran",
          "lat": 36.65558,
          "lon": 44.54217,
          "country": "IQ",
          "geonamesId": 96961,
          "timezone": "Asia/Baghdad",
          "ku": "\u0633\u06C6\u0631\u0627\u0646",
          "ar": "\u0633\u0648\u0631\u0627\u0646"
        },
        "ranya": {
          "name": "Ranya",
          "lat": 36.25511,
          "lon": 44.88239,
          "country": "IQ",
          "geonamesId": 92052,
          "timezone": "Asia/Baghdad",
          "ku": "\u0695\u0627\u0646\u06CC\u06D5",
          "ar": "\u0631\u0627\u0646\u064A\u0629"
        },
        "akre": {
          "name": "Akre",
          "lat": 36.76038,
          "lon": 43.89428,
          "country": "IQ",
          "geonamesId": 98822,
          "timezone": "Asia/Baghdad",
          "ku": "\u0626\u0627\u06A9\u0631\u06CE",
          "ar": "\u0639\u0642\u0631\u0629"
        },
        "kifri": {
          "name": "Kifri",
          "lat": 34.68963,
          "lon": 44.96057,
          "country": "IQ",
          "geonamesId": 94298,
          "timezone": "Asia/Baghdad",
          "ku": "\u06A9\u0641\u0631\u06CC",
          "ar": "\u0643\u0641\u0631\u064A"
        },
        "kirkuk": {
          "name": "Kirkuk",
          "lat": 35.46806,
          "lon": 44.39222,
          "country": "IQ",
          "geonamesId": 94787,
          "timezone": "Asia/Baghdad",
          "ku": "\u06A9\u06D5\u0631\u06A9\u0648\u0648\u06A9",
          "ar": "\u0643\u0631\u0643\u0648\u0643"
        },
        "sinjar": {
          "name": "Sinjar",
          "lat": 36.3209,
          "lon": 41.87656,
          "country": "IQ",
          "geonamesId": 448149,
          "timezone": "Asia/Baghdad",
          "ku": "\u0634\u0646\u06AF\u0627\u0644",
          "ar": "\u0633\u0646\u062C\u0627\u0631"
        },
        "makhmur": {
          "name": "Makhmur",
          "lat": 35.77622,
          "lon": 43.57974,
          "country": "IQ",
          "geonamesId": 93818,
          "timezone": "Asia/Baghdad",
          "ku": "\u0645\u06D5\u062E\u0645\u0648\u0648\u0631",
          "ar": "\u0645\u062E\u0645\u0648\u0631"
        },
        "van": {
          "name": "Van",
          "lat": 38.49457,
          "lon": 43.38323,
          "country": "TR",
          "geonamesId": 298117,
          "timezone": "Europe/Istanbul",
          "ku": "\u0648\u0627\u0646",
          "ar": "\u0648\u0627\u0646"
        },
        "mardin": {
          "name": "Mardin",
          "lat": 37.31309,
          "lon": 40.74357,
          "country": "TR",
          "geonamesId": 304797,
          "timezone": "Europe/Istanbul",
          "ku": "\u0645\u06CE\u0631\u062F\u06CC\u0646",
          "ar": "\u0645\u0627\u0631\u062F\u064A\u0646"
        },
        "batman": {
          "name": "Batman",
          "lat": 37.88738,
          "lon": 41.13221,
          "country": "TR",
          "geonamesId": 321836,
          "timezone": "Europe/Istanbul",
          "ku": "\u0628\u0627\u062A\u0645\u0627\u0646",
          "ar": "\u0628\u0627\u062A\u0645\u0627\u0646"
        },
        "hakkari": {
          "name": "Hakkari",
          "lat": 37.57444,
          "lon": 43.74083,
          "country": "TR",
          "geonamesId": 318137,
          "timezone": "Europe/Istanbul",
          "ku": "\u062C\u06C6\u0644\u06D5\u0645\u06CE\u0631\u06AF \xB7 \u0647\u06D5\u06A9\u0627\u0631\u06CC",
          "ar": "\u0647\u0643\u0627\u0631\u064A"
        },
        "siirt": {
          "name": "Siirt",
          "lat": 37.9293,
          "lon": 41.94134,
          "country": "TR",
          "geonamesId": 300822,
          "timezone": "Europe/Istanbul",
          "ku": "\u0633\u06CE\u0631\u062A",
          "ar": "\u0633\u0639\u0631\u062F"
        },
        "bitlis": {
          "name": "Bitlis",
          "lat": 38.40115,
          "lon": 42.10784,
          "country": "TR",
          "geonamesId": 321025,
          "timezone": "Europe/Istanbul",
          "ku": "\u0628\u06D5\u062F\u0644\u06CC\u0633",
          "ar": "\u0628\u062F\u0644\u064A\u0633"
        },
        "mus": {
          "name": "Mus",
          "lat": 38.73163,
          "lon": 41.48482,
          "country": "TR",
          "geonamesId": 304081,
          "timezone": "Europe/Istanbul",
          "ku": "\u0645\u0648\u0648\u0634",
          "ar": "\u0645\u0648\u0634"
        },
        "bingol": {
          "name": "Bingol",
          "lat": 38.88472,
          "lon": 40.49389,
          "country": "TR",
          "geonamesId": 321082,
          "timezone": "Europe/Istanbul",
          "ku": "\u0686\u06D5\u0648\u0644\u06CC\u06A9 \xB7 \u0628\u06CC\u0646\u06AF\u06C6\u0644",
          "ar": "\u0628\u064A\u0646\u063A\u0648\u0644"
        },
        "tunceli": {
          "name": "Tunceli",
          "lat": 39.09921,
          "lon": 39.54351,
          "country": "TR",
          "geonamesId": 298846,
          "timezone": "Europe/Istanbul",
          "ku": "\u062F\u06D5\u0631\u0633\u06CC\u0645 \xB7 \u062A\u0648\u0646\u062C\u06D5\u0644\u06CC",
          "ar": "\u062F\u0631\u0633\u064A\u0645 \xB7 \u062A\u0648\u0646\u062C\u0644\u064A"
        },
        "sanliurfa": {
          "name": "Sanliurfa",
          "lat": 37.16708,
          "lon": 38.79392,
          "country": "TR",
          "geonamesId": 298333,
          "timezone": "Europe/Istanbul",
          "ku": "\u0695\u0648\u0647\u0627 \xB7 \u0634\u0627\u0646\u0644\u06CC\u0626\u0648\u0631\u0641\u0627",
          "ar": "\u0627\u0644\u0631\u0647\u0627 \xB7 \u0634\u0627\u0646\u0644\u064A \u0623\u0648\u0631\u0641\u0627"
        },
        "agri": {
          "name": "Agri",
          "lat": 39.71467,
          "lon": 43.04015,
          "country": "TR",
          "geonamesId": 309647,
          "timezone": "Europe/Istanbul",
          "ku": "\u0626\u0627\u06AF\u0631\u06CC",
          "ar": "\u0623\u063A\u0631\u064A"
        },
        "sanandaj": {
          "name": "Sanandaj",
          "lat": 35.31495,
          "lon": 46.99883,
          "country": "IR",
          "geonamesId": 117574,
          "timezone": "Asia/Tehran",
          "ku": "\u0633\u0646\u06D5",
          "ar": "\u0633\u0646\u0646\u062F\u062C"
        },
        "mahabad": {
          "name": "Mahabad",
          "lat": 36.7631,
          "lon": 45.7222,
          "country": "IR",
          "geonamesId": 125446,
          "timezone": "Asia/Tehran",
          "ku": "\u0645\u06D5\u0647\u0627\u0628\u0627\u062F",
          "ar": "\u0645\u0647\u0627\u0628\u0627\u062F"
        },
        "saqqez": {
          "name": "Saqqez",
          "lat": 36.24992,
          "lon": 46.2735,
          "country": "IR",
          "geonamesId": 117392,
          "timezone": "Asia/Tehran",
          "ku": "\u0633\u06D5\u0642\u0632",
          "ar": "\u0633\u0642\u0632"
        },
        "baneh": {
          "name": "Baneh",
          "lat": 35.9975,
          "lon": 45.8853,
          "country": "IR",
          "geonamesId": 141584,
          "timezone": "Asia/Tehran",
          "ku": "\u0628\u0627\u0646\u06D5",
          "ar": "\u0628\u0627\u0646\u0647"
        },
        "marivan": {
          "name": "Marivan",
          "lat": 35.51829,
          "lon": 46.18298,
          "country": "IR",
          "geonamesId": 124778,
          "timezone": "Asia/Tehran",
          "ku": "\u0645\u06D5\u0631\u06CC\u0648\u0627\u0646",
          "ar": "\u0645\u0631\u064A\u0648\u0627\u0646"
        },
        "kermanshah": {
          "name": "Kermanshah",
          "lat": 34.31417,
          "lon": 47.065,
          "country": "IR",
          "geonamesId": 128226,
          "timezone": "Asia/Tehran",
          "ku": "\u06A9\u0631\u0645\u0627\u0634\u0627\u0646",
          "ar": "\u0643\u0631\u0645\u0627\u0646\u0634\u0627\u0647"
        },
        "ilam": {
          "name": "Ilam",
          "lat": 33.6374,
          "lon": 46.4227,
          "country": "IR",
          "geonamesId": 130802,
          "timezone": "Asia/Tehran",
          "ku": "\u0626\u06CC\u0644\u0627\u0645",
          "ar": "\u0625\u064A\u0644\u0627\u0645"
        },
        "urmia": {
          "name": "Urmia",
          "lat": 37.55274,
          "lon": 45.07605,
          "country": "IR",
          "geonamesId": 121801,
          "timezone": "Asia/Tehran",
          "ku": "\u0648\u0631\u0645\u06CE",
          "ar": "\u0623\u0631\u0648\u0645\u064A\u0629"
        },
        "piranshahr": {
          "name": "Piranshahr",
          "lat": 36.701,
          "lon": 45.1413,
          "country": "IR",
          "geonamesId": 121110,
          "timezone": "Asia/Tehran",
          "ku": "\u067E\u06CC\u0631\u0627\u0646\u0634\u0627\u0631",
          "ar": "\u0628\u064A\u0631\u0627\u0646\u0634\u0647\u0631"
        },
        "sardasht": {
          "name": "Sardasht",
          "lat": 36.1552,
          "lon": 45.4788,
          "country": "IR",
          "geonamesId": 117111,
          "timezone": "Asia/Tehran",
          "ku": "\u0633\u06D5\u0631\u062F\u06D5\u0634\u062A",
          "ar": "\u0633\u0631\u062F\u0634\u062A"
        },
        "qamishli": {
          "name": "Qamishli",
          "lat": 37.05215,
          "lon": 41.23142,
          "country": "SY",
          "geonamesId": 173377,
          "timezone": "Asia/Damascus",
          "ku": "\u0642\u0627\u0645\u06CC\u0634\u0644\u06C6",
          "ar": "\u0627\u0644\u0642\u0627\u0645\u0634\u0644\u064A"
        },
        "al-hasakah": {
          "name": "Al Hasakah",
          "lat": 36.50237,
          "lon": 40.74772,
          "country": "SY",
          "geonamesId": 173811,
          "timezone": "Asia/Damascus",
          "ku": "\u062D\u06D5\u0633\u06D5\u06A9\u06D5",
          "ar": "\u0627\u0644\u062D\u0633\u0643\u0629"
        },
        "afrin": {
          "name": "Afrin",
          "lat": 36.51194,
          "lon": 36.86954,
          "country": "SY",
          "geonamesId": 174186,
          "timezone": "Asia/Damascus",
          "ku": "\u0639\u06D5\u0641\u0631\u06CC\u0646",
          "ar": "\u0639\u0641\u0631\u064A\u0646"
        },
        "al-malikiyah": {
          "name": "Al Malikiyah",
          "lat": 37.17701,
          "lon": 42.14006,
          "country": "SY",
          "geonamesId": 173530,
          "timezone": "Asia/Damascus",
          "ku": "\u062F\u06CE\u0631\u06CC\u06A9",
          "ar": "\u0627\u0644\u0645\u0627\u0644\u0643\u064A\u0629 \xB7 \u062F\u064A\u0631\u064A\u0643"
        },
        "chamchamal": {
          "name": "Chamchamal",
          "lat": 35.53356,
          "lon": 44.8343,
          "country": "IQ",
          "geonamesId": 97417,
          "timezone": "Asia/Baghdad",
          "ku": "\u0686\u06D5\u0645\u0686\u06D5\u0645\u0627\u06B5",
          "ar": "\u062C\u0645\u062C\u0645\u0627\u0644"
        },
        "amadiyah": {
          "name": "Amadiyah",
          "lat": 37.09214,
          "lon": 43.48769,
          "country": "IQ",
          "geonamesId": 99611,
          "timezone": "Asia/Baghdad",
          "ku": "\u0626\u0627\u0645\u06CE\u062F\u06CC",
          "ar": "\u0627\u0644\u0639\u0645\u0627\u062F\u064A\u0629"
        },
        "diyarbakir": {
          "name": "Diyarbakir",
          "lat": 37.91363,
          "lon": 40.21721,
          "country": "TR",
          "geonamesId": 316541,
          "timezone": "Europe/Istanbul",
          "ku": "\u0626\u0627\u0645\u06D5\u062F \xB7 \u062F\u06CC\u0627\u0631\u0628\u06D5\u06A9\u0631",
          "ar": "\u0622\u0645\u062F \xB7 \u062F\u064A\u0627\u0631 \u0628\u0643\u0631"
        },
        "sirnak": {
          "name": "Sirnak",
          "lat": 37.51393,
          "lon": 42.45432,
          "country": "TR",
          "geonamesId": 300640,
          "timezone": "Europe/Istanbul",
          "ku": "\u0634\u0631\u0646\u0627\u062E",
          "ar": "\u0634\u0631\u0646\u0627\u0642"
        },
        "kobani": {
          "name": "Kobani",
          "lat": 36.89095,
          "lon": 38.35347,
          "country": "SY",
          "geonamesId": 172256,
          "timezone": "Asia/Damascus",
          "ku": "\u06A9\u06C6\u0628\u0627\u0646\u06CC",
          "ar": "\u0643\u0648\u0628\u0627\u0646\u064A"
        },
        "amuda": {
          "name": "Amuda",
          "lat": 37.10417,
          "lon": 40.93,
          "country": "SY",
          "geonamesId": 173230,
          "timezone": "Asia/Damascus",
          "ku": "\u0626\u0627\u0645\u0648\u062F\u06CE",
          "ar": "\u0639\u0627\u0645\u0648\u062F\u0627"
        }
      };
      if (typeof module === "object" && module.exports) module.exports = cities2;
      else window.KURDISTAN_CITIES = cities2;
    })();
  }
});

// server/media.js
var require_media = __commonJS({
  "server/media.js"(exports, module) {
    var MAX_VIDEO = 15 * 1024 * 1024;
    function attachments2(values, photo2, fail3) {
      if (values === void 0) return [];
      if (!Array.isArray(values) || values.length > 3) fail3(400, "invalid_attachments");
      return values.map((value) => {
        if (value?.mime?.startsWith("image/")) return photo2(value);
        if (!value || !["video/mp4", "video/webm"].includes(value.mime) || typeof value.data !== "string" || value.data.length > Math.ceil(MAX_VIDEO / 3) * 4 || !/^[A-Za-z0-9+/]+={0,2}$/.test(value.data)) fail3(400, "invalid_attachments");
        const bytes = Buffer.from(value.data, "base64");
        if (bytes.length < 16 || bytes.length > MAX_VIDEO || bytes.toString("base64") !== value.data) fail3(400, "invalid_attachments");
        const mp4 = bytes.toString("ascii", 4, 8) === "ftyp" && bytes.readUInt32BE(0) >= 16 && bytes.readUInt32BE(0) <= bytes.length && ["isom", "iso2", "iso5", "iso6", "mp41", "mp42", "avc1", "M4V "].includes(bytes.toString("ascii", 8, 12));
        const webm = bytes.subarray(0, 4).equals(Buffer.from("1a45dfa3", "hex")) && bytes.subarray(4, 256).includes(Buffer.from("webm"));
        if (!(value.mime === "video/mp4" ? mp4 : webm)) fail3(400, "invalid_attachments");
        return { mime: value.mime, bytes };
      });
    }
    __name(attachments2, "attachments");
    function sendMedia2(req, res, data, fail3) {
      const bytes = Buffer.from(data.bytes), headers = { "Content-Type": data.mime, "Cache-Control": "no-store", "Content-Disposition": "inline", "Accept-Ranges": "bytes" };
      if (req.headers.range) {
        const match = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
        let start, end;
        if (match && (match[1] || match[2])) {
          start = match[1] ? Number(match[1]) : Math.max(0, bytes.length - Number(match[2]));
          end = match[1] && match[2] ? Math.min(Number(match[2]), bytes.length - 1) : bytes.length - 1;
        }
        if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 0 || end < start || start >= bytes.length) {
          res.writeHead(416, { ...headers, "Content-Range": `bytes */${bytes.length}` });
          return res.end();
        }
        res.writeHead(206, { ...headers, "Content-Range": `bytes ${start}-${end}/${bytes.length}`, "Content-Length": end - start + 1 });
        return res.end(bytes.subarray(start, end + 1));
      }
      res.writeHead(200, { ...headers, "Content-Length": bytes.length });
      return res.end(bytes);
    }
    __name(sendMedia2, "sendMedia");
    module.exports = { attachments: attachments2, sendMedia: sendMedia2 };
  }
});

// worker/index.mjs
import { Buffer as Buffer6 } from "node:buffer";

// worker/app.mjs
var import_kurdistan_cities2 = __toESM(require_kurdistan_cities(), 1);
import { Buffer as Buffer5 } from "node:buffer";
import { randomBytes as randomBytes2, createHash as createHash3 } from "node:crypto";

// worker/store.mjs
import { Buffer as Buffer2 } from "node:buffer";
import { createHash, randomBytes } from "node:crypto";
function createStore(binding) {
  let queue = null;
  const statement = /* @__PURE__ */ __name((sql, values) => binding.prepare(sql).bind(...values), "statement");
  async function hydrate(row) {
    if (!row) return row;
    for (const column of ["bytes", "photo_bytes"]) {
      if (typeof row[column] === "string" && row[column].startsWith("d1media:")) {
        const result = await statement("SELECT data FROM media_chunks WHERE key=? ORDER BY slot", [row[column].slice(8)]).all();
        if (!result.results.length) throw new Error("Missing media chunks");
        row[column] = Buffer2.concat(result.results.map((item) => Buffer2.from(item.data)));
      } else if (row[column] != null) row[column] = Buffer2.from(row[column]);
    }
    return row;
  }
  __name(hydrate, "hydrate");
  return {
    assertReport(id, version) {
      if (!queue) throw new Error("Guard must be part of an atomic batch");
      const key = randomBytes(16).toString("hex");
      queue.push(statement("INSERT INTO transaction_guards(id,ok) SELECT ?,COUNT(*) FROM reports WHERE id=? AND version=?", [key, id, version]));
      queue.push(statement("DELETE FROM transaction_guards WHERE id=?", [key]));
    },
    prepare(originalSQL) {
      return {
        async get(...values) {
          return hydrate(await statement(originalSQL, values).first());
        },
        async all(...values) {
          return (await statement(originalSQL, values).all()).results;
        },
        async run(...values) {
          let sql = originalSQL, generatedId;
          if (/^INSERT INTO reports\(/.test(sql)) {
            generatedId = Number(randomBytes(6).readUIntBE(0, 6) % 9999999999) + 1;
            sql = sql.replace("reports(", "reports(id,").replace("VALUES (", "VALUES (?,");
            values.unshift(generatedId);
          }
          const writes = [];
          values = values.map((value) => {
            if (!Buffer2.isBuffer(value) && !(value instanceof Uint8Array)) return value;
            const bytes = Buffer2.from(value);
            const key = createHash("sha256").update(bytes).digest("hex");
            for (let offset = 0, slot = 0; offset < bytes.length; offset += 18e5, slot++) {
              writes.push(statement("INSERT OR IGNORE INTO media_chunks(key,slot,data) VALUES (?,?,?)", [key, slot, Uint8Array.from(bytes.subarray(offset, offset + 18e5)).buffer]));
            }
            return "d1media:" + key;
          });
          writes.push(statement(sql, values));
          if (queue) {
            queue.push(...writes);
            return { lastInsertRowid: generatedId, changes: 1 };
          }
          const results = writes.length === 1 ? [await writes[0].run()] : await binding.batch(writes);
          const meta = results.at(-1).meta;
          return { lastInsertRowid: generatedId || meta.last_row_id, changes: meta.changes };
        }
      };
    },
    async transaction(fn) {
      if (queue) throw new Error("Nested transaction");
      queue = [];
      try {
        const result = await fn();
        if (queue.length) await binding.batch(queue);
        return result;
      } finally {
        queue = null;
      }
    }
  };
}
__name(createStore, "createStore");

// worker/password.mjs
import { Buffer as Buffer3 } from "node:buffer";
import { scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
var deriveLegacy = promisify(scrypt);
async function passwordHash(password, salt) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: new TextEncoder().encode(salt), iterations: 1e5 }, key, 256);
  return Buffer3.from(bits).toString("hex");
}
__name(passwordHash, "passwordHash");
async function verifyPassword(password, stored) {
  const parts = (stored || "").split(":");
  if (parts[0] === "pbkdf2" || !stored) {
    const actual = await passwordHash(password, parts[1] || "00000000000000000000000000000000");
    const expected2 = parts[2] || "00".repeat(32);
    return !!stored && expected2.length === actual.length && timingSafeEqual(Buffer3.from(actual, "hex"), Buffer3.from(expected2, "hex"));
  }
  const [salt, expected] = parts;
  if (!salt || !/^[a-f0-9]{128}$/.test(expected || "")) return false;
  return timingSafeEqual(await deriveLegacy(password, salt, 64), Buffer3.from(expected, "hex"));
}
__name(verifyPassword, "verifyPassword");

// worker/climate.mjs
var import_kurdistan_cities = __toESM(require_kurdistan_cities(), 1);
import { createHash as createHash2 } from "node:crypto";
var CITIES = Object.fromEntries(Object.entries(import_kurdistan_cities.default).map(([key, city]) => [key, { latitude: city.lat, longitude: city.lon }]));
var HADCRUT = "https://www.metoffice.gov.uk/hadobs/hadcrut5/data/HadCRUT.5.2.0.0/analysis/diagnostics/HadCRUT.5.2.0.0.analysis.summary_series.global.";
var SOURCES = {
  global: { name: "HadCRUT5 5.2.0.0 \u2014 Met Office Hadley Centre / Climatic Research Unit", documentation: "https://www.metoffice.gov.uk/hadobs/hadcrut5/", license: "https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/", baseline: "1961\u20131990", earliest: "1850-01-01", kind: "global_analysis", resolution: "global", timezone: "UTC" },
  weather: { name: "ERA5 \u2014 ECMWF / Copernicus, via Open-Meteo", documentation: "https://open-meteo.com/en/docs/historical-weather-api", license: "https://open-meteo.com/en/licence", earliest: "1940-01-01", kind: "reanalysis", resolution: "0.25\xB0 (~25 km)", timezone: "Asia/Baghdad" },
  air: { name: "CAMS Global atmospheric composition forecasts, via Open-Meteo", documentation: "https://open-meteo.com/en/docs/air-quality-api", license: "https://open-meteo.com/en/licence", earliest: "2022-08-01", kind: "archived_model", resolution: "0.4\xB0 (~45 km); native 3-hourly, API hourly", timezone: "Asia/Baghdad" }
};
var WEATHER = ["temperature_2m_mean", "temperature_2m_min", "temperature_2m_max", "precipitation_sum", "relative_humidity_2m_mean", "wind_speed_10m_max"];
var AIR = ["pm2_5", "pm10", "nitrogen_dioxide", "ozone", "sulphur_dioxide", "carbon_monoxide", "us_aqi"];
var fail = /* @__PURE__ */ __name((status, code) => {
  const error = new Error(code);
  error.status = status;
  error.code = code;
  throw error;
}, "fail");
var numeric = /* @__PURE__ */ __name((value) => typeof value === "number" && Number.isFinite(value) ? value : null, "numeric");
function parseHadcrut(csv, interval) {
  const lines = csv.trim().split(/\r?\n/);
  if (!lines[0].startsWith("Time,Anomaly (deg C),Lower confidence limit")) fail(502, "source_invalid");
  const rows = lines.slice(1).map((line) => {
    const [time, ...values] = line.split(",");
    if (!(interval === "annual" ? /^\d{4}$/ : /^\d{4}-\d{2}$/).test(time)) fail(502, "source_invalid");
    const parsed = values.map((v) => v?.trim() && Number.isFinite(Number(v)) ? Number(v) : null);
    return { time, anomaly: parsed[0] ?? null, lower: parsed[1] ?? null, upper: parsed[2] ?? null };
  });
  if (!rows.length) fail(502, "source_invalid");
  return rows;
}
__name(parseHadcrut, "parseHadcrut");
function parseMeteo(data, dataset) {
  const keys = dataset === "weather" ? WEATHER : AIR, group = dataset === "weather" ? "daily" : "hourly";
  const block = data[group], units = data[group + "_units"];
  if (!Array.isArray(block?.time) || !block.time.length || !units || keys.some((key) => !Array.isArray(block[key]) || block[key].length !== block.time.length)) fail(502, "source_invalid");
  const pattern = dataset === "weather" ? /^\d{4}-\d{2}-\d{2}$/ : /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
  const rows = block.time.map((time, i) => {
    if (typeof time !== "string" || !pattern.test(time)) fail(502, "source_invalid");
    return { time, ...Object.fromEntries(keys.map((key) => [key, numeric(block[key][i])])) };
  });
  return { rows, units: Object.fromEntries(keys.map((key) => [key, units[key]])), grid: { latitude: numeric(data.latitude), longitude: numeric(data.longitude), elevation: numeric(data.elevation) } };
}
__name(parseMeteo, "parseMeteo");
function createClimateService({ fetcher = fetch, clock = /* @__PURE__ */ __name(() => /* @__PURE__ */ new Date(), "clock") } = {}) {
  const pending = /* @__PURE__ */ new Map();
  async function source(url, format, ttl, timeout = 25e3) {
    const file = new Request("https://climate-cache.internal/" + createHash2("sha256").update(url).digest("hex"));
    const cache = globalThis.caches?.default;
    let cached;
    try {
      cached = await (await cache?.match(file))?.json();
      if (cached.url !== url || !cached.fetchedAt) cached = null;
    } catch {
    }
    const age = cached ? clock().getTime() - Date.parse(cached.fetchedAt) : Infinity;
    if (cached && age >= 0 && age < ttl) return { ...cached, stale: false };
    if (pending.has(url)) return pending.get(url);
    const work = (async () => {
      try {
        const response = await fetcher(url, { signal: AbortSignal.timeout(timeout), headers: { Accept: format === "csv" ? "text/csv" : "application/json" } });
        if (!response.ok) throw new Error("source_unavailable");
        const raw = await response.text();
        if (raw.length > 15 * 1024 * 1024) throw new Error("source_invalid");
        const data = format === "csv" ? raw : JSON.parse(raw);
        if (format === "csv") parseHadcrut(data, url.includes(".annual.") ? "annual" : "monthly");
        else parseMeteo(data, url.includes("/v1/archive") ? "weather" : "air");
        const result = { url, fetchedAt: clock().toISOString(), data };
        if (cache) await cache.put(file, new Response(JSON.stringify(result), { headers: { "Cache-Control": "public, max-age=604800" } }));
        return { ...result, stale: false };
      } catch {
        if (cached) return { ...cached, stale: true };
        fail(502, "source_unavailable");
      } finally {
        pending.delete(url);
      }
    })();
    pending.set(url, work);
    return work;
  }
  __name(source, "source");
  async function history(params) {
    const dataset = params.get("dataset") || "global";
    if (!SOURCES[dataset]) fail(400, "invalid_dataset");
    const sourceInfo = SOURCES[dataset], today = clock().toISOString().slice(0, 10);
    if (dataset === "global") {
      const interval = params.get("interval") || "annual";
      if (!["annual", "monthly"].includes(interval)) fail(400, "invalid_interval");
      const start2 = Number(params.get("start") || 1900), end2 = Number(params.get("end") || clock().getUTCFullYear());
      if (!Number.isInteger(start2) || !Number.isInteger(end2) || start2 < 1850 || end2 > clock().getUTCFullYear() || end2 < start2) fail(400, "invalid_range");
      let result2;
      try {
        result2 = await source(HADCRUT + interval + ".csv", "csv", 24 * 36e5, 12e3);
      } catch {
        const alternate = (HADCRUT + interval + ".csv").replace("www.metoffice.gov.uk/hadobs", "hadleyserver.metoffice.gov.uk");
        result2 = await source(alternate, "csv", 24 * 36e5, 12e3);
      }
      const all = parseHadcrut(result2.data, interval);
      const rows = all.filter((row) => Number(row.time.slice(0, 4)) >= start2 && Number(row.time.slice(0, 4)) <= end2 && (interval !== "annual" || Number(row.time) < clock().getUTCFullYear()) && row.time <= today);
      return { dataset, interval, source: { ...sourceInfo, url: result2.url }, fetchedAt: result2.fetchedAt, stale: result2.stale, rows, units: { anomaly: "\xB0C", lower: "\xB0C", upper: "\xB0C" }, requested: { start: start2, end: end2 }, availableThrough: all.filter((row) => row.time <= today && (interval !== "annual" || Number(row.time) < clock().getUTCFullYear())).at(-1)?.time || null };
    }
    const city = params.get("city") || "erbil";
    if (!CITIES[city]) fail(400, "invalid_city");
    const start = params.get("start"), end = params.get("end");
    const validDate = /* @__PURE__ */ __name((value) => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value, "validDate");
    if (!validDate(start) || !validDate(end) || end < start) fail(400, "invalid_range");
    const latest = new Date(clock().getTime() - (dataset === "weather" ? 5 : 1) * 864e5).toISOString().slice(0, 10);
    if (start < sourceInfo.earliest || end > latest) fail(400, "outside_coverage");
    const maxDays = dataset === "weather" ? 3660 : 366;
    if ((Date.parse(end) - Date.parse(start)) / 864e5 + 1 > maxDays) fail(400, "range_too_large");
    const coordinates = CITIES[city];
    const timezone = import_kurdistan_cities.default[city].timezone;
    const query = new URLSearchParams({ ...coordinates, start_date: start, end_date: end, timezone });
    let url;
    if (dataset === "weather") {
      query.set("models", "era5");
      query.set("daily", WEATHER.join(","));
      url = "https://archive-api.open-meteo.com/v1/archive?" + query;
    } else {
      query.set("domains", "cams_global");
      query.set("hourly", AIR.join(","));
      url = "https://air-quality-api.open-meteo.com/v1/air-quality?" + query;
    }
    const result = await source(url, "json", 6 * 36e5), parsed = parseMeteo(result.data, dataset);
    return { dataset, interval: dataset === "weather" ? "daily" : "hourly", city, source: { ...sourceInfo, timezone, url }, fetchedAt: result.fetchedAt, stale: result.stale, ...parsed, requested: { start, end, ...coordinates }, availableThrough: parsed.rows.at(-1)?.time || null };
  }
  __name(history, "history");
  return { history };
}
__name(createClimateService, "createClimateService");

// worker/community.mjs
import { Buffer as Buffer4 } from "node:buffer";
async function communityRoutes(c) {
  const { req, res, path, method, url, db, userFor, authenticated, getReport, field: field2, photo: photo2, body: body2, json, fail: fail3, transaction, rate, now: now2 } = c;
  const match = path.match(/^\/api\/reports\/([1-9][0-9]{0,9})\/(community|support|team(?:\/membership|\/leader)?|tasks(?:\/[1-9][0-9]{0,9})?|updates(?:\/[1-9][0-9]{0,9}(?:\/photo|\/resolve)?)?)$/);
  if (!match) return false;
  const id = Number(match[1]), route = match[2], viewer = await userFor(req);
  let report = await getReport(id, viewer);
  const team = /* @__PURE__ */ __name(async () => await db.prepare("SELECT t.*,u.username AS leader FROM community_teams t JOIN users u ON u.id=t.leader_id WHERE report_id=?").get(id), "team");
  const member = /* @__PURE__ */ __name(async (user2) => await db.prepare("SELECT * FROM team_members WHERE report_id=? AND user_id=?").get(id, user2.id), "member");
  const leader = /* @__PURE__ */ __name(async (user2) => {
    const value = await team();
    if (!value) fail3(404, "team_missing");
    if (value.leader_id !== user2.id && user2.role !== "admin") fail3(403, "leader_required");
    return value;
  }, "leader");
  const active = /* @__PURE__ */ __name(() => {
    if (!["reviewed", "in_progress"].includes(report.status)) fail3(409, "project_not_active");
  }, "active");
  const participant = /* @__PURE__ */ __name(async (user2) => {
    if (!await member(user2) && user2.role !== "admin") fail3(403, "team_member_required");
  }, "participant");
  const touch = /* @__PURE__ */ __name(async () => await db.prepare("UPDATE reports SET updated_at=? WHERE id=?").run(now2(), id), "touch");
  const limit = /* @__PURE__ */ __name(async (table, maximum) => {
    if ((await db.prepare(`SELECT COUNT(*) AS n FROM ${table} WHERE report_id=?`).get(id)).n >= maximum) fail3(409, "project_limit");
  }, "limit");
  const output = /* @__PURE__ */ __name((value) => {
    json(res, 200, value);
    return true;
  }, "output");
  if (route === "community" && method === "GET") {
    const page = Number(url.searchParams.get("page") || 1);
    if (!Number.isSafeInteger(page) || page < 1 || page > 1e5) fail3(400, "invalid_input");
    const visibility = viewer?.role === "admin" ? "" : " AND hidden=0";
    const total = (await db.prepare("SELECT COUNT(*) AS n FROM community_updates WHERE report_id=?" + visibility).get(id)).n;
    return output({
      reportStatus: report.status,
      reportVersion: report.version,
      reportTeam: report.team,
      team: await team() || null,
      members: await db.prepare("SELECT m.user_id,u.username,m.contribution,m.joined_at FROM team_members m JOIN users u ON u.id=m.user_id WHERE m.report_id=? ORDER BY m.joined_at,m.user_id").all(id),
      tasks: await db.prepare("SELECT t.*,u.username AS assignee FROM project_tasks t LEFT JOIN users u ON u.id=t.assignee_id WHERE t.report_id=? ORDER BY t.id").all(id),
      updates: await db.prepare("SELECT p.id,p.kind,p.content,p.hidden,p.created_at,p.user_id,u.username,p.photo_mime IS NOT NULL AS hasPhoto FROM community_updates p JOIN users u ON u.id=p.user_id WHERE p.report_id=?" + visibility + " ORDER BY p.id DESC LIMIT 20 OFFSET ?").all(id, (page - 1) * 20),
      supporters: (await db.prepare("SELECT COUNT(*) AS n FROM report_supporters WHERE report_id=?").get(id)).n,
      supported: !!(viewer && await db.prepare("SELECT 1 FROM report_supporters WHERE report_id=? AND user_id=?").get(id, viewer.id)),
      page,
      pages: Math.ceil(total / 20),
      total
    });
  }
  const image = route.match(/^updates\/([1-9][0-9]{0,9})\/photo$/);
  if (image && method === "GET") {
    const update = await db.prepare("SELECT photo_mime,photo_bytes,hidden FROM community_updates WHERE id=? AND report_id=?").get(Number(image[1]), id);
    if (!update?.photo_bytes || update.hidden && viewer?.role !== "admin") fail3(404, "not_found");
    res.writeHead(200, {
      "Content-Type": update.photo_mime,
      "Content-Length": update.photo_bytes.length,
      "Cache-Control": "no-store"
    });
    res.end(Buffer4.from(update.photo_bytes));
    return true;
  }
  if (!["POST", "PATCH"].includes(method)) fail3(405, "method_not_allowed");
  const user = await authenticated(req);
  await rate(req, "community", 150);
  const data = await body2(req);
  report = await getReport(id, user);
  const resolveMatch = route.match(/^updates\/([1-9][0-9]{0,9})\/resolve$/);
  if (resolveMatch && method === "POST") {
    await authenticated(req, true);
    if (report.status !== "in_progress") fail3(409, "project_not_active");
    const update = await db.prepare("SELECT * FROM community_updates WHERE id=? AND report_id=? AND kind='resolution_request' AND hidden=0").get(Number(resolveMatch[1]), id);
    if (!update?.photo_bytes) fail3(404, "not_found");
    if ((await db.prepare("SELECT COUNT(*) AS n FROM project_tasks WHERE report_id=? AND status!='done'").get(id)).n) fail3(409, "unfinished_tasks");
    const note = field2(data.note, 5, 1500), timestamp = now2();
    await transaction(async () => {
      db.assertReport(id, report.version);
      await db.prepare("UPDATE reports SET status='resolved',resolution=?,updated_at=?,version=version+1 WHERE id=?").run(note, timestamp, id);
      await db.prepare("INSERT INTO photos VALUES (?,?,?,?) ON CONFLICT(report_id,kind) DO UPDATE SET mime=excluded.mime,bytes=excluded.bytes").run(id, "after", update.photo_mime, update.photo_bytes);
      await db.prepare("INSERT INTO history(report_id,actor_id,status,note,team,created_at) VALUES (?,?,?,?,?,?)").run(id, user.id, "resolved", note, report.team, timestamp);
    });
    return output({
      ok: true
    });
  }
  if (route === "support" && method === "POST") {
    if (!["reviewed", "in_progress", "resolved"].includes(report.status)) fail3(409, "project_not_active");
    if (typeof data.supported !== "boolean") fail3(400, "invalid_input");
    if (data.supported) await db.prepare("INSERT OR IGNORE INTO report_supporters VALUES (?,?)").run(id, user.id);
    else await db.prepare("DELETE FROM report_supporters WHERE report_id=? AND user_id=?").run(id, user.id);
    return output({
      ok: true
    });
  }
  if (route === "team" && method === "POST") {
    active();
    const name = field2(data.name, 3, 100), plan = field2(data.plan, 15, 2e3), contribution = field2(data.contribution ?? "", 0, 300);
    if (await team()) fail3(409, "team_exists");
    await transaction(async () => {
      db.assertReport(id, report.version);
      const time = now2();
      await db.prepare("INSERT INTO community_teams VALUES (?,?,?,?,?)").run(id, name, plan, user.id, time);
      await db.prepare("INSERT INTO team_members VALUES (?,?,?,?)").run(id, user.id, contribution, time);
      await db.prepare("UPDATE reports SET team=?,status='in_progress',updated_at=?,version=version+1 WHERE id=?").run(name, time, id);
      await db.prepare("INSERT INTO history(report_id,actor_id,status,note,team,created_at) VALUES (?,?,?,?,?,?)").run(id, user.id, "in_progress", "Community team formed. " + plan.slice(0, 1400), name, time);
    });
    return output({
      ok: true
    });
  }
  if (route === "team" && method === "PATCH") {
    active();
    await leader(user);
    const name = field2(data.name, 3, 100), plan = field2(data.plan, 15, 2e3);
    await transaction(async () => {
      db.assertReport(id, report.version);
      await db.prepare("UPDATE community_teams SET name=?,plan=? WHERE report_id=?").run(name, plan, id);
      await db.prepare("UPDATE reports SET team=?,updated_at=?,version=version+1 WHERE id=?").run(name, now2(), id);
    });
    return output({
      ok: true
    });
  }
  if (route === "team/leader" && method === "POST") {
    active();
    await leader(user);
    if (!Number.isSafeInteger(data.userId) || !await db.prepare("SELECT 1 FROM team_members WHERE report_id=? AND user_id=?").get(id, data.userId)) fail3(400, "invalid_input");
    await db.prepare("UPDATE community_teams SET leader_id=? WHERE report_id=?").run(data.userId, id);
    await touch();
    return output({
      ok: true
    });
  }
  if (route === "team/membership" && method === "POST") {
    active();
    const value = await team();
    if (!value) fail3(404, "team_missing");
    if (data.action === "join") {
      const contribution = field2(data.contribution ?? "", 0, 300);
      if (!await member(user)) await limit("team_members", 100);
      await db.prepare("INSERT INTO team_members VALUES (?,?,?,?) ON CONFLICT(report_id,user_id) DO UPDATE SET contribution=excluded.contribution").run(id, user.id, contribution, now2());
    } else if (data.action === "leave") {
      if (value.leader_id === user.id) fail3(409, "transfer_leadership");
      await transaction(async () => {
        await db.prepare("UPDATE project_tasks SET assignee_id=NULL,status='open',updated_at=? WHERE report_id=? AND assignee_id=? AND status='doing'").run(now2(), id, user.id);
        await db.prepare("DELETE FROM team_members WHERE report_id=? AND user_id=?").run(id, user.id);
      });
    } else fail3(400, "invalid_input");
    await touch();
    return output({
      ok: true
    });
  }
  if (route === "tasks" && method === "POST") {
    active();
    await leader(user);
    await limit("project_tasks", 100);
    const title = field2(data.title, 3, 200), due = field2(data.dueDate ?? "", 0, 10);
    if (due && (!/^\d{4}-\d{2}-\d{2}$/.test(due) || !Number.isFinite(Date.parse(due)) || new Date(due).toISOString().slice(0, 10) !== due)) fail3(400, "invalid_input");
    await db.prepare("INSERT INTO project_tasks(report_id,title,due_date,created_by,created_at,updated_at) VALUES (?,?,?,?,?,?)").run(id, title, due, user.id, now2(), now2());
    await touch();
    return output({
      ok: true
    });
  }
  const taskMatch = route.match(/^tasks\/([1-9][0-9]{0,9})$/);
  if (taskMatch && method === "PATCH") {
    active();
    await participant(user);
    const task = await db.prepare("SELECT * FROM project_tasks WHERE id=? AND report_id=?").get(Number(taskMatch[1]), id);
    if (!task) fail3(404, "not_found");
    if (data.action === "claim") {
      if (task.status !== "open") fail3(409, "task_conflict");
      const result = await db.prepare("UPDATE project_tasks SET status='doing',assignee_id=?,updated_at=? WHERE id=? AND status='open'").run(user.id, now2(), task.id);
      if (!result.changes) fail3(409, "task_conflict");
    } else if (["complete", "release", "reopen"].includes(data.action)) {
      const coordinator = (await team()).leader_id === user.id || user.role === "admin";
      if (task.assignee_id !== user.id && !coordinator) fail3(403, "task_owner_required");
      if (data.action === "complete" && task.status !== "doing" || data.action === "release" && task.status !== "doing" || data.action === "reopen" && task.status !== "done") fail3(409, "task_conflict");
      if (data.action === "complete") await db.prepare("UPDATE project_tasks SET status='done',updated_at=? WHERE id=?").run(now2(), task.id);
      else await db.prepare("UPDATE project_tasks SET status='open',assignee_id=NULL,updated_at=? WHERE id=?").run(now2(), task.id);
    } else fail3(400, "invalid_input");
    await touch();
    return output({
      ok: true
    });
  }
  if (route === "updates" && method === "POST") {
    if (!["reviewed", "in_progress", "resolved"].includes(report.status)) fail3(409, "project_not_active");
    if (!["discussion", "progress", "resolution_request"].includes(data.kind)) fail3(400, "invalid_input");
    if (data.kind !== "discussion") {
      active();
      await participant(user);
    }
    if (data.kind === "resolution_request") {
      await leader(user);
      if (!data.photo) fail3(400, "evidence_required");
      if ((await db.prepare("SELECT COUNT(*) AS n FROM project_tasks WHERE report_id=? AND status!='done'").get(id)).n) fail3(409, "unfinished_tasks");
    }
    const content = field2(data.content, 5, 3e3), image2 = photo2(data.photo);
    await limit("community_updates", 2e3);
    await db.prepare("INSERT INTO community_updates(report_id,user_id,kind,content,photo_mime,photo_bytes,created_at) VALUES (?,?,?,?,?,?,?)").run(id, user.id, data.kind, content, image2?.mime ?? null, image2?.bytes ?? null, now2());
    await touch();
    return output({
      ok: true
    });
  }
  const updateMatch = route.match(/^updates\/([1-9][0-9]{0,9})$/);
  if (updateMatch && method === "PATCH") {
    await authenticated(req, true);
    if (typeof data.hidden !== "boolean") fail3(400, "invalid_input");
    const changed = await db.prepare("UPDATE community_updates SET hidden=? WHERE id=? AND report_id=?").run(Number(data.hidden), Number(updateMatch[1]), id);
    if (!changed.changes) fail3(404, "not_found");
    return output({
      ok: true
    });
  }
  fail3(405, "method_not_allowed");
}
__name(communityRoutes, "communityRoutes");

// worker/app.mjs
var import_media = __toESM(require_media(), 1);
var { attachments, sendMedia } = import_media.default;
var CATEGORIES = ["water", "waste", "green-space", "pollution"];
var AREAS = ["knowledge-university", "ankawa", "baharka", ...Object.keys(import_kurdistan_cities2.default), "other"];
var STATUSES = ["submitted", "reviewed", "in_progress", "resolved", "rejected"];
var PUBLIC = ["reviewed", "in_progress", "resolved"];
var MAX_PHOTO = 3 * 1024 * 1024;
var MAX_BODY = 5 * 1024 * 1024;
var now = /* @__PURE__ */ __name(() => (/* @__PURE__ */ new Date()).toISOString(), "now");
var hash = /* @__PURE__ */ __name((value) => createHash3("sha256").update(value).digest("hex"), "hash");
var HttpError = class extends Error {
  static {
    __name(this, "HttpError");
  }
  constructor(status, code) {
    super(code);
    this.status = status;
    this.code = code;
  }
};
var fail2 = /* @__PURE__ */ __name((status, code) => {
  throw new HttpError(status, code);
}, "fail");
function field(value, min, max) {
  if (typeof value !== "string" || value.trim().length < min || value.trim().length > max) fail2(400, "invalid_input");
  return value.trim();
}
__name(field, "field");
function photo(value) {
  if (value === void 0 || value === null) return null;
  if (typeof value !== "object" || !["image/jpeg", "image/png", "image/webp"].includes(value.mime) || typeof value.data !== "string") fail2(400, "invalid_photo");
  if (value.data.length > Math.ceil(MAX_PHOTO / 3) * 4 || !/^[A-Za-z0-9+/]+={0,2}$/.test(value.data)) fail2(400, "invalid_photo");
  const bytes = Buffer5.from(value.data, "base64");
  if (bytes.length < 12 || bytes.length > MAX_PHOTO || bytes.toString("base64") !== value.data) fail2(400, "invalid_photo");
  const valid = value.mime === "image/png" ? bytes.subarray(0, 8).equals(Buffer5.from("89504e470d0a1a0a", "hex")) : value.mime === "image/jpeg" ? bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255 && bytes.at(-2) === 255 && bytes.at(-1) === 217 : bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP";
  if (!valid) fail2(400, "invalid_photo");
  return {
    mime: value.mime,
    bytes
  };
}
__name(photo, "photo");
async function body(req, maximum = MAX_BODY) {
  if (!req.headers["content-type"]?.startsWith("application/json")) fail2(415, "json_required");
  if (Number(req.headers["content-length"]) > maximum) fail2(413, "too_large");
  const chunks = [];
  let length = 0;
  for await (const chunk of req) {
    length += chunk.length;
    if (length > maximum) fail2(413, "too_large");
    chunks.push(chunk);
  }
  try {
    const result = JSON.parse(Buffer5.concat(chunks).toString("utf8"));
    if (!result || typeof result !== "object" || Array.isArray(result)) fail2(400, "invalid_input");
    return result;
  } catch {
    fail2(400, "invalid_input");
  }
}
__name(body, "body");
async function handle(req, res, env) {
  const secureCookies = new URL(req.url).protocol === "https:";
  const allowedOrigins = (env.ALLOWED_ORIGINS || "").split(",").filter(Boolean);
  const sameSite = "Strict";
  const trustedOrigins = new Set(allowedOrigins.map((value) => {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol) || url.origin !== value) throw new Error("ALLOWED_ORIGINS must contain exact HTTP(S) origins without trailing slashes");
    return value;
  }));
  if (!["Strict", "Lax", "None"].includes(sameSite) || sameSite === "None" && !secureCookies) throw new Error("Invalid cookie policy: SameSite=None requires COOKIE_SECURE=1");
  const db = createStore(env.DB);
  const climate = createClimateService();
  const cookieName = "green_session";
  async function rate(req2, bucket, maximum) {
    const key = hash(bucket + ":" + (req2.headers["cf-connecting-ip"] || "local"));
    const window2 = Math.floor(Date.now() / 9e5);
    const entry = await env.DB.prepare("INSERT INTO rate_limits(key,window,count) VALUES (?,?,1) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN window=excluded.window THEN count+1 ELSE 1 END,window=excluded.window RETURNING count").bind(key, window2).first();
    if (entry.count > maximum) fail2(429, "rate_limit");
  }
  __name(rate, "rate");
  async function userFor(req2) {
    const token = (req2.headers.cookie || "").split(";").map((x) => x.trim()).find((x) => x.startsWith(cookieName + "="))?.slice(cookieName.length + 1);
    if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
    return await db.prepare(`SELECT u.id,u.username,u.role FROM users u JOIN sessions s ON s.user_id=u.id WHERE s.token=? AND s.expires_at>?`).get(hash(token), Date.now()) || null;
  }
  __name(userFor, "userFor");
  async function authenticated(req2, admin = false) {
    const user = await userFor(req2);
    if (!user) fail2(401, "sign_in_required");
    if (admin && user.role !== "admin") fail2(403, "admin_required");
    return user;
  }
  __name(authenticated, "authenticated");
  async function setSession(res2, userId) {
    const token = randomBytes2(32).toString("hex");
    await db.prepare("INSERT INTO sessions VALUES (?,?,?)").run(hash(token), userId, Date.now() + 7 * 864e5);
    res2.setHeader("Set-Cookie", `${cookieName}=${token}; Path=/; HttpOnly; SameSite=${sameSite}; Max-Age=604800${secureCookies ? "; Secure" : ""}`);
  }
  __name(setSession, "setSession");
  function canRead(report, user) {
    return PUBLIC.includes(report.status) || user?.role === "admin" || report.user_id === user?.id;
  }
  __name(canRead, "canRead");
  async function getReport(id, user) {
    const report = await db.prepare("SELECT * FROM reports WHERE id=?").get(id);
    if (!report || !canRead(report, user)) fail2(404, "not_found");
    return report;
  }
  __name(getReport, "getReport");
  async function serialize(report) {
    const result = {
      ...report
    };
    delete result.user_id;
    delete result.request_id;
    const metadata = await db.prepare(`SELECT
      (SELECT json_group_array(kind) FROM photos WHERE report_id=?) AS photos,
      (SELECT json_group_array(json_object('slot',slot,'mime',mime,'size',COALESCE((SELECT SUM(length(data)) FROM media_chunks WHERE key=substr(CAST(bytes AS TEXT),9)),length(bytes)))) FROM report_media WHERE report_id=? ORDER BY slot) AS attachments,
      (SELECT json_object('goal',goal,'resources',resources,'urgency',urgency) FROM project_briefs WHERE report_id=?) AS brief,
      (SELECT COUNT(*) FROM team_members WHERE report_id=?) AS members,
      (SELECT COUNT(*) FROM project_tasks WHERE report_id=? AND status='done') AS completedTasks,
      (SELECT COUNT(*) FROM project_tasks WHERE report_id=?) AS totalTasks,
      (SELECT COUNT(*) FROM report_supporters WHERE report_id=?) AS supporters`).get(...Array(7).fill(report.id));
    result.photos = JSON.parse(metadata.photos || "[]");
    result.attachments = JSON.parse(metadata.attachments || "[]");
    if (!result.photos.includes("before") && result.attachments.some((item) => item.mime.startsWith("image/"))) result.photos.push("before");
    result.brief = JSON.parse(metadata.brief || '{"goal":"","resources":"","urgency":"normal"}');
    result.community = {
      members: metadata.members,
      completedTasks: metadata.completedTasks,
      totalTasks: metadata.totalTasks,
      supporters: metadata.supporters
    };
    return result;
  }
  __name(serialize, "serialize");
  function json(res2, status, value) {
    res2.writeHead(status, {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    });
    res2.end(JSON.stringify(value));
  }
  __name(json, "json");
  const transaction = /* @__PURE__ */ __name((fn) => db.transaction(fn), "transaction");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "same-origin");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(self)");
  res.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://tile.openstreetmap.org; media-src 'self' blob:; connect-src 'self' https://api.open-meteo.com https://air-quality-api.open-meteo.com; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'");
  try {
    const url = new URL(req.url, "http://localhost");
    const path = url.pathname;
    const method = req.method;
    if (path.startsWith("/api/")) {
      res.setHeader("Cache-Control", "no-store");
      const requestOrigin = req.headers.origin;
      if (requestOrigin && trustedOrigins.has(requestOrigin)) {
        res.setHeader("Access-Control-Allow-Origin", requestOrigin);
        res.setHeader("Access-Control-Allow-Credentials", "true");
        res.setHeader("Vary", "Origin");
      }
      if (method === "OPTIONS") {
        if (!requestOrigin || !trustedOrigins.has(requestOrigin)) fail2(403, "invalid_origin");
        if (!["GET", "POST", "PATCH"].includes(req.headers["access-control-request-method"])) fail2(405, "method_not_allowed");
        const headers = (req.headers["access-control-request-headers"] || "").toLowerCase().split(",").map((x) => x.trim()).filter(Boolean);
        if (headers.some((header) => !["content-type", "x-green-request", "range"].includes(header))) fail2(403, "invalid_origin");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Green-Request, Range");
        res.writeHead(204);
        return res.end();
      }
      if (!["GET", "POST", "PATCH"].includes(method)) fail2(405, "method_not_allowed");
      if (method !== "GET") {
        if (req.headers["x-green-request"] !== "1") fail2(403, "invalid_origin");
        if (req.headers.origin) {
          let origin;
          try {
            origin = new URL(req.headers.origin);
          } catch {
            fail2(403, "invalid_origin");
          }
          if (!["http:", "https:"].includes(origin.protocol) || origin.host !== req.headers.host && !trustedOrigins.has(req.headers.origin)) fail2(403, "invalid_origin");
        }
      }
      if (path === "/api/health" && method === "GET") return json(res, 200, {
        ok: true,
        app: "green-kurdistan",
        features: ["community-projects", "climate-history", "report-media", "regional-cities"],
        schemaVersion: 3,
        cityCount: Object.keys(import_kurdistan_cities2.default).length
      });
      if (await communityRoutes({
        req,
        res,
        path,
        method,
        url,
        db,
        userFor,
        authenticated,
        getReport,
        field,
        photo,
        body,
        json,
        fail: fail2,
        transaction,
        rate,
        now
      })) return;
      if (path === "/api/climate/history" && method === "GET") {
        await rate(req, "climate", 120);
        try {
          return json(res, 200, await climate.history(url.searchParams));
        } catch (error) {
          if (error.status) return json(res, error.status, {
            error: error.code
          });
          throw error;
        }
      }
      if (path === "/api/session" && method === "GET") return json(res, 200, {
        user: await userFor(req)
      });
      if (["/api/register", "/api/login"].includes(path) && method === "POST") {
        await rate(req, "auth", 30);
        const data = await body(req);
        const username = field(data.username, 3, 32).toLowerCase();
        if (!/^[a-z0-9_]+$/.test(username) || typeof data.password !== "string" || data.password.length > 128) fail2(400, "invalid_credentials_format");
        if (path === "/api/register") {
          if (data.password.length < 12) fail2(400, "password_short");
          if (await db.prepare("SELECT id FROM users WHERE username=?").get(username)) fail2(409, "username_taken");
          const salt = randomBytes2(16).toString("hex");
          const secret = await passwordHash(data.password, salt);
          if (await db.prepare("SELECT id FROM users WHERE username=?").get(username)) fail2(409, "username_taken");
          // Get the user's IP address from Cloudflare
const userIP = req.headers["cf-connecting-ip"] || "Unknown IP";

// Save the user and their IP to the database
const result = await db.prepare("INSERT INTO users(username,password,created_at,ip_address) VALUES (?,?,?,?)").run(username, `pbkdf2:${salt}:${secret}`, now(), userIP);
          await setSession(res, Number(result.lastInsertRowid));
          return json(res, 201, {
            user: {
              id: Number(result.lastInsertRowid),
              username,
              role: "member"
            }
          });
        }
        const account = await db.prepare("SELECT * FROM users WHERE username=?").get(username);
        if (!await verifyPassword(data.password, account?.password)) fail2(401, "incorrect_login");
        await setSession(res, account.id);
        return json(res, 200, {
          user: {
            id: account.id,
            username: account.username,
            role: account.role
          }
        });
      }
      if (path === "/api/logout" && method === "POST") {
        await body(req);
        const token = (req.headers.cookie || "").match(/(?:^|;\s*)green_session=([a-f0-9]{64})(?:;|$)/)?.[1];
        if (token) await db.prepare("DELETE FROM sessions WHERE token=?").run(hash(token));
        res.setHeader("Set-Cookie", `${cookieName}=; Path=/; HttpOnly; SameSite=${sameSite}; Max-Age=0${secureCookies ? "; Secure" : ""}`);
        return json(res, 200, {
          ok: true
        });
      }
      if (path === "/api/stats" && method === "GET") {
        const counts = await db.prepare("SELECT status,COUNT(*) AS count FROM reports WHERE status IN ('reviewed','in_progress','resolved') GROUP BY status").all();
        const areas = await db.prepare("SELECT area,COUNT(*) AS count FROM reports WHERE status IN ('reviewed','in_progress','resolved') GROUP BY area ORDER BY count DESC").all();
        const categories = await db.prepare("SELECT category,COUNT(*) AS count FROM reports WHERE status IN ('reviewed','in_progress','resolved') GROUP BY category ORDER BY count DESC").all();
        const pending = (await userFor(req))?.role === "admin" ? (await db.prepare("SELECT COUNT(*) AS count FROM reports WHERE status='submitted'").get()).count : null;
        return json(res, 200, {
          counts,
          areas,
          categories,
          pending
        });
      }
      if (path === "/api/reports" && method === "GET") {
        const user = await userFor(req), scope = url.searchParams.get("scope") || "public";
        const where = [], values = [];
        if (scope === "mine") {
          if (!user) fail2(401, "sign_in_required");
          where.push("user_id=?");
          values.push(user.id);
        } else if (scope === "teams") {
          if (!user) fail2(401, "sign_in_required");
          where.push("id IN (SELECT report_id FROM team_members WHERE user_id=?) AND status IN ('reviewed','in_progress','resolved')");
          values.push(user.id);
        } else if (scope === "admin") {
          await authenticated(req, true);
          where.push("1=1");
        } else if (scope === "public") where.push("status IN ('reviewed','in_progress','resolved')");
        else fail2(400, "invalid_input");
        for (const [key, allowed] of [["area", AREAS], ["category", CATEGORIES], ["status", STATUSES]]) {
          const value = url.searchParams.get(key);
          if (value) {
            if (!allowed.includes(value)) fail2(400, "invalid_input");
            where.push(`${key}=?`);
            values.push(value);
          }
        }
        const q = url.searchParams.get("q")?.trim();
        if (q) {
          if (Buffer5.byteLength(q) > 40) fail2(400, "invalid_input");
          where.push("(title LIKE ? ESCAPE '\\' OR location LIKE ? ESCAPE '\\' OR description LIKE ? ESCAPE '\\')");
          const term = `%${q.replace(/[\\%_]/g, "\\$&")}%`;
          values.push(term, term, term);
        }
        const page = Number(url.searchParams.get("page") || 1);
        if (!Number.isSafeInteger(page) || page < 1 || page > 1e5) fail2(400, "invalid_input");
        const condition = where.join(" AND ");
        const total = (await db.prepare(`SELECT COUNT(*) AS count FROM reports WHERE ${condition}`).get(...values)).count;
        const rows = await db.prepare(`SELECT * FROM reports WHERE ${condition} ORDER BY updated_at DESC,id DESC LIMIT 12 OFFSET ?`).all(...values, (page - 1) * 12);
        return json(res, 200, {
          reports: await Promise.all(rows.map(serialize)),
          total,
          page,
          pages: Math.ceil(total / 12)
        });
      }
      if (path === "/api/reports" && method === "POST") {
        const user = await authenticated(req);
        await rate(req, "report", 40);
        const data = await body(req, 22 * 1024 * 1024);
        const requestId = field(data.requestId, 16, 80);
        if (!/^[a-zA-Z0-9-]+$/.test(requestId)) fail2(400, "invalid_input");
        const existing = await db.prepare("SELECT * FROM reports WHERE user_id=? AND request_id=?").get(user.id, requestId);
        if (existing) return json(res, 200, {
          report: await serialize(existing)
        });
        const title = field(data.title, 5, 120), location = field(data.location, 3, 180), description = field(data.description, 15, 1e4);
        const goal = field(data.goal ?? "", 0, 2e3), resources = field(data.resources ?? "", 0, 1500), urgency = data.urgency ?? "normal";
        if (!["normal", "high"].includes(urgency)) fail2(400, "invalid_input");
        if (!CATEGORIES.includes(data.category) || !AREAS.includes(data.area)) fail2(400, "invalid_input");
        const latitude = data.latitude ?? null, longitude = data.longitude ?? null;
        if (latitude === null !== (longitude === null) || latitude !== null && (typeof latitude !== "number" || typeof longitude !== "number" || !Number.isFinite(latitude) || !Number.isFinite(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180)) fail2(400, "invalid_coordinates");
        const before = photo(data.photo);
        const media2 = attachments(data.attachments, photo, fail2);
        if (before && media2.length) fail2(400, "invalid_attachments");
        if (media2.reduce((size, item) => size + item.bytes.length, 0) > 15 * 1024 * 1024) fail2(413, "too_large");
        const id = await transaction(async () => {
          const timestamp = now();
          const result = await db.prepare("INSERT INTO reports(user_id,request_id,title,category,area,location,description,latitude,longitude,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)").run(user.id, requestId, title, data.category, data.area, location, description, latitude, longitude, timestamp, timestamp);
          const reportId = Number(result.lastInsertRowid);
          await db.prepare("INSERT INTO project_briefs(report_id,goal,resources,urgency) VALUES (?,?,?,?)").run(reportId, goal, resources, urgency);
          if (before) await db.prepare("INSERT INTO photos VALUES (?,?,?,?)").run(reportId, "before", before.mime, before.bytes);
          await Promise.all(media2.map(async (item, i) => await db.prepare("INSERT INTO report_media VALUES (?,?,?,?)").run(reportId, i + 1, item.mime, item.bytes)));
          await db.prepare("INSERT INTO history(report_id,actor_id,status,note,team,created_at) VALUES (?,?,?,?,?,?)").run(reportId, user.id, "submitted", "", "", timestamp);
          return reportId;
        });
        return json(res, 201, {
          report: await serialize(await getReport(id, user))
        });
      }
      const detail = path.match(/^\/api\/reports\/([1-9][0-9]{0,9})$/);
      if (detail && method === "GET") {
        const report = await getReport(Number(detail[1]), await userFor(req));
        return json(res, 200, {
          report: {
            ...await serialize(report),
            history: await db.prepare("SELECT status,note,team,created_at FROM history WHERE report_id=? ORDER BY id").all(report.id)
          }
        });
      }
      if (detail && method === "PATCH") {
        const user = await authenticated(req, true), data = await body(req);
        const report = await getReport(Number(detail[1]), user);
        if (!Number.isInteger(data.version) || data.version !== report.version) fail2(409, "version_conflict");
        const transitions = {
          submitted: ["reviewed", "rejected"],
          reviewed: ["in_progress", "rejected"],
          in_progress: ["resolved", "reviewed"],
          resolved: ["in_progress"],
          rejected: ["reviewed"]
        };
        if (!STATUSES.includes(data.status) || data.status !== report.status && !transitions[report.status].includes(data.status)) fail2(400, "invalid_transition");
        const note = field(data.note, 5, 1500), team = field(data.team ?? "", 0, 100);
        const after = photo(data.photo);
        if (after && data.status !== "resolved") fail2(400, "resolution_only");
        const timestamp = now();
        await transaction(async () => {
          db.assertReport(report.id, report.version);
          await db.prepare("UPDATE reports SET status=?,team=?,resolution=?,updated_at=?,version=version+1 WHERE id=?").run(data.status, team, data.status === "resolved" ? note : "", timestamp, report.id);
          if (after) await db.prepare("INSERT INTO photos VALUES (?,?,?,?) ON CONFLICT(report_id,kind) DO UPDATE SET mime=excluded.mime,bytes=excluded.bytes").run(report.id, "after", after.mime, after.bytes);
          if (data.status !== "resolved" && report.status === "resolved") await db.prepare("DELETE FROM photos WHERE report_id=? AND kind='after'").run(report.id);
          await db.prepare("INSERT INTO history(report_id,actor_id,status,note,team,created_at) VALUES (?,?,?,?,?,?)").run(report.id, user.id, data.status, note, team, timestamp);
        });
        return json(res, 200, {
          report: await serialize(await getReport(report.id, user))
        });
      }
      const attachment = path.match(/^\/api\/reports\/([1-9][0-9]{0,9})\/attachments\/([1-3])$/);
      if (attachment && method === "GET") {
        const report = await getReport(Number(attachment[1]), await userFor(req));
        const data = await db.prepare("SELECT mime,bytes FROM report_media WHERE report_id=? AND slot=?").get(report.id, Number(attachment[2]));
        if (!data) fail2(404, "not_found");
        return sendMedia(req, res, data, fail2);
      }
      const image = path.match(/^\/api\/reports\/([1-9][0-9]{0,9})\/photos\/(before|after)$/);
      if (image && method === "GET") {
        const report = await getReport(Number(image[1]), await userFor(req));
        const data = await db.prepare("SELECT mime,bytes FROM photos WHERE report_id=? AND kind=?").get(report.id, image[2]) || (image[2] === "before" ? await db.prepare("SELECT mime,bytes FROM report_media WHERE report_id=? AND mime LIKE 'image/%' ORDER BY slot LIMIT 1").get(report.id) : null);
        if (!data) fail2(404, "not_found");
        res.writeHead(200, {
          "Content-Type": data.mime,
          "Content-Length": data.bytes.length,
          "Cache-Control": "no-store",
          "Content-Disposition": "inline"
        });
        return res.end(Buffer5.from(data.bytes));
      }
      fail2(404, "not_found");
    }
    return res.respond(await env.ASSETS.fetch(req.original));
  } catch (error) {
    if (res.headersSent) {
      res.end();
      return;
    }
    if (error.message?.includes("CHECK constraint failed: ok=1")) return json(res, 409, { error: "version_conflict" });
    if (error.message?.includes("UNIQUE constraint failed: users.username")) return json(res, 409, { error: "username_taken" });
    if (error.message?.includes("UNIQUE constraint failed: community_teams.report_id")) return json(res, 409, { error: "team_exists" });
    if (!(error instanceof HttpError)) console.error("Request failed:", error.message);
    json(res, error.status || 500, {
      error: error.code && (error instanceof HttpError || [400, 502].includes(error.status)) ? error.code : "server_error"
    });
  }
}
__name(handle, "handle");

// worker/index.mjs
var index_default = {
  async fetch(request, env) {
    if (!new URL(request.url).pathname.startsWith("/api/")) return env.ASSETS.fetch(request);
    const req = {
      original: request,
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers),
      async *[Symbol.asyncIterator]() {
        if (!request.body) return;
        const reader = request.body.getReader();
        try {
          for (; ; ) {
            const { value, done } = await reader.read();
            if (done) break;
            yield Buffer6.from(value);
          }
        } finally {
          reader.releaseLock();
        }
      }
    };
    req.headers.host = new URL(request.url).host;
    const headers = new Headers();
    let response, status = 200;
    const res = {
      headersSent: false,
      setHeader(name, value) {
        headers.set(name, String(value));
      },
      writeHead(code, extra = {}) {
        status = code;
        for (const [key, value] of Object.entries(extra)) headers.set(key, String(value));
      },
      end(data) {
        this.headersSent = true;
        response = new Response(status === 204 ? null : data ?? null, { status, headers });
      },
      respond(value) {
        response = value;
      }
    };
    await handle(req, res, env);
    return response || new Response(JSON.stringify({ error: "server_error" }), { status: 500, headers: { "Content-Type": "application/json" } });
  },
  async scheduled(event, env) {
    await env.DB.batch([
      env.DB.prepare("DELETE FROM sessions WHERE expires_at<=?").bind(Date.now()),
      env.DB.prepare("DELETE FROM rate_limits WHERE window<?").bind(Math.floor(Date.now() / 9e5) - 1),
      env.DB.prepare(`DELETE FROM media_chunks WHERE key NOT IN (
        SELECT substr(CAST(bytes AS TEXT),9) FROM photos UNION
        SELECT substr(CAST(bytes AS TEXT),9) FROM report_media UNION
        SELECT substr(CAST(photo_bytes AS TEXT),9) FROM community_updates WHERE photo_bytes IS NOT NULL)`)
    ]);
  }
};
export {
  index_default as default
};
//# sourceMappingURL=index.js.map
