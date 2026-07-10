export const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
export const MONGO_DB_NAME = process.env.MONGO_DB_NAME || 'koperasi_merah_putih_game';

export const DEMO_KOPERASI_REF = 'KOP-MERAH-PUTIH-DEMO';
export const DEMO_SESSION_ID = 'demo-session-001';
export const DEMO_KODE_WILAYAH = '32.01.01.2001';

export const COLLECTIONS = {
  wilayah: 'referensi_wilayah',
  koperasiWilayah: 'referensi_koperasi_wilayah',
  profilKoperasi: 'profil_koperasi',
  anggotaKoperasi: 'anggota_koperasi',
  simpananAnggota: 'simpanan_anggota',
  produkKoperasi: 'produk_koperasi',
  inventarisProduk: 'inventaris_produk',
  barangMasukProduk: 'barang_masuk_produk',
  transaksiPenjualan: 'transaksi_penjualan',
  barangKeluarProduk: 'barang_keluar_produk',
  pengajuanPembiayaan: 'pengajuan_pembiayaan',
  asetKoperasi: 'aset_koperasi',
  geraiKoperasi: 'gerai_koperasi',
  gameSessions: 'game_sessions',
  gameMembershipState: 'game_membership_state',
  gameSupplierState: 'game_supplier_state',
  gameFurniture: 'game_furniture',
  gameEvents: 'game_events',
  gameDailyReports: 'game_daily_reports',
  gameStoryState: 'game_story_state',
};
