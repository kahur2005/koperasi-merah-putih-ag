// ============================================================
// random.js — Seeded PRNG (Pseudo-Random Number Generator)
// Menggunakan algoritma mulberry32 untuk hasil deterministik.
// ============================================================

let _seed = Date.now();

/**
 * Atur seed untuk PRNG.
 * @param {number} seed
 */
export function setSeed(seed) {
  _seed = seed;
}

/**
 * Menghasilkan angka acak [0, 1) secara deterministik (mulberry32).
 * @returns {number}
 */
export function seededRandom() {
  _seed |= 0;
  _seed = (_seed + 0x6d2b79f5) | 0;
  let t = Math.imul(_seed ^ (_seed >>> 15), 1 | _seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/**
 * Bilangan bulat acak dalam rentang [min, max] (inklusif).
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function randomInt(min, max) {
  return Math.floor(seededRandom() * (max - min + 1)) + min;
}

/**
 * Bilangan desimal acak dalam rentang [min, max).
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function randomFloat(min, max) {
  return seededRandom() * (max - min) + min;
}

/**
 * Pilih satu elemen acak dari array.
 * @template T
 * @param {T[]} arr
 * @returns {T}
 */
export function pickRandom(arr) {
  return arr[randomInt(0, arr.length - 1)];
}

/**
 * Acak urutan array (Fisher-Yates shuffle) — mengubah array asli.
 * @template T
 * @param {T[]} arr
 * @returns {T[]}
 */
export function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
