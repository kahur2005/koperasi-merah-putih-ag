// ============================================================
// formatRupiah.js — Format angka ke mata uang Rupiah
// ============================================================

/**
 * Format angka menjadi string Rupiah Indonesia.
 * @param {number} amount - Jumlah dalam Rupiah
 * @returns {string} String terformat, contoh: "Rp 1.500.000"
 */
export function formatRupiah(amount) {
  if (!Number.isFinite(amount)) amount = 0;
  return 'Rp ' + amount.toLocaleString('id-ID');
}
