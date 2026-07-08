// ============================================================
// formatRupiah.js — Format angka ke mata uang Rupiah
// ============================================================

/**
 * Format angka menjadi string Rupiah Indonesia.
 * @param {number} amount - Jumlah dalam Rupiah
 * @returns {string} String terformat, contoh: "Rp 1.500.000"
 */
export function formatRupiah(amount) {
  return 'Rp ' + amount.toLocaleString('id-ID');
}
