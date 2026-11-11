// Usernames may use English letters OR Kurdish/Arabic letters, never a mix of both.
// Names are normalised so that letters which look the same are stored the same way.
const FOLD = { 'ي': 'ی', 'ى': 'ی', 'ك': 'ک' };
const LATIN = /^[a-z0-9_]+$/;
const ARABIC = /^[[\p{Script=Arabic}&&\p{L}]0-9_]+$/v;

function normalizeUsername(value) {
  if (typeof value !== 'string') return null;
  const name = value.normalize('NFKC').trim().toLowerCase()
    .replace(/[٠-٩]/g, digit => String(digit.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, digit => String(digit.charCodeAt(0) - 0x06F0))
    .replace(/[يىك]/g, letter => FOLD[letter])
    .replace(/\p{M}/gu, '');
  const length = [...name].length;
  if (length < 3 || length > 32) return null;
  return LATIN.test(name) || ARABIC.test(name) ? name : null;
}

module.exports = { normalizeUsername };
