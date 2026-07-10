-- Seed data for the current repo GDD and game constants.
-- Run after database/schema.sql.

insert into referensi_wilayah (
  kode_wilayah,
  provinsi,
  kab_kota,
  kecamatan,
  desa_kelurahan
) values (
  '32.01.01.2001',
  'Jawa Barat',
  'Kabupaten Bogor',
  'Kecamatan Contoh',
  'Desa Merah Putih'
) on conflict (kode_wilayah) do update set
  provinsi = excluded.provinsi,
  kab_kota = excluded.kab_kota,
  kecamatan = excluded.kecamatan,
  desa_kelurahan = excluded.desa_kelurahan;

insert into referensi_koperasi_wilayah (koperasi_ref, kode_wilayah)
values ('KOP-MERAH-PUTIH-DEMO', '32.01.01.2001')
on conflict (koperasi_ref) do update set kode_wilayah = excluded.kode_wilayah;

insert into profil_koperasi (
  koperasi_ref,
  nama_koperasi,
  status_registrasi,
  bentuk_koperasi,
  kategori_usaha,
  alamat_lengkap,
  modal_awal,
  tentang_koperasi,
  pola_pengelolaan,
  metode_pengisian
) values (
  'KOP-MERAH-PUTIH-DEMO',
  'Koperasi Desa Merah Putih',
  'simulasi',
  'koperasi konsumen dan simpan pinjam',
  'kebutuhan pokok, simpan pinjam, pemberdayaan UMKM',
  'Desa Merah Putih',
  '5000000',
  'Koperasi simulasi untuk mengelola stok beras, minyak goreng, gas LPG, anggota, pinjaman, dan kebahagiaan warga.',
  'gotong royong',
  'seed game'
) on conflict (koperasi_ref) do update set
  nama_koperasi = excluded.nama_koperasi,
  modal_awal = excluded.modal_awal,
  tentang_koperasi = excluded.tentang_koperasi;

insert into produk_koperasi (
  produk_sample_id,
  koperasi_ref,
  kode_barcode,
  nama_produk,
  nama_tampilan,
  unit,
  item_key
) values
  ('PROD-RICE', 'KOP-MERAH-PUTIH-DEMO', 'KMP-RICE', 'Beras', 'Beras', 'unit', 'rice'),
  ('PROD-COOKING-OIL', 'KOP-MERAH-PUTIH-DEMO', 'KMP-OIL', 'Minyak Goreng', 'Minyak Goreng', 'unit', 'cookingOil'),
  ('PROD-LPG-GAS', 'KOP-MERAH-PUTIH-DEMO', 'KMP-LPG', 'Gas LPG', 'Gas LPG', 'unit', 'lpgGas')
on conflict (produk_sample_id) do update set
  nama_produk = excluded.nama_produk,
  nama_tampilan = excluded.nama_tampilan,
  unit = excluded.unit,
  item_key = excluded.item_key;

insert into inventaris_produk (
  inventaris_ref,
  produk_sample_id,
  koperasi_ref,
  nama_produk,
  stok,
  kapasitas_stok,
  harga_jual_aktif,
  kode_barcode
) values
  ('INV-RICE', 'PROD-RICE', 'KOP-MERAH-PUTIH-DEMO', 'Beras', 0, 0, 16000, 'KMP-RICE'),
  ('INV-COOKING-OIL', 'PROD-COOKING-OIL', 'KOP-MERAH-PUTIH-DEMO', 'Minyak Goreng', 0, 0, 29000, 'KMP-OIL'),
  ('INV-LPG-GAS', 'PROD-LPG-GAS', 'KOP-MERAH-PUTIH-DEMO', 'Gas LPG', 0, 0, 35000, 'KMP-LPG')
on conflict (inventaris_ref) do update set
  stok = excluded.stok,
  kapasitas_stok = excluded.kapasitas_stok,
  harga_jual_aktif = excluded.harga_jual_aktif;

insert into referensi_gerai_koperasi (jenis_gerai_ref, nama_jenis_gerai)
values ('GERAI-TOKO-KOPERASI', 'Toko Koperasi')
on conflict (jenis_gerai_ref) do update set nama_jenis_gerai = excluded.nama_jenis_gerai;

insert into gerai_koperasi (
  gerai_ref,
  koperasi_ref,
  jenis_gerai_ref,
  status_gerai,
  pengisi,
  akses_internet,
  akses_listrik,
  status_kepemilikan_aset_gerai,
  status_pemanfaatan_aset_gerai,
  jenis_bangunan
) values (
  'GERAI-KMP-DEMO',
  'KOP-MERAH-PUTIH-DEMO',
  'GERAI-TOKO-KOPERASI',
  'aktif',
  'Pengurus Koperasi',
  'tersedia',
  'tersedia',
  'milik koperasi',
  'digunakan',
  'toko desa'
) on conflict (gerai_ref) do update set status_gerai = excluded.status_gerai;

insert into aset_koperasi (
  aset_ref,
  koperasi_ref,
  nama_aset,
  tipe_aset,
  status,
  progres_pembangunan,
  panjang_lahan,
  lebar_lahan
) values (
  'ASET-TOKO-KMP-DEMO',
  'KOP-MERAH-PUTIH-DEMO',
  'Toko Koperasi Kecil',
  'bangunan',
  'aktif',
  100,
  10,
  15
) on conflict (aset_ref) do update set status = excluded.status;

insert into anggota_koperasi (
  anggota_ref,
  koperasi_ref,
  nama,
  kode_wilayah,
  jenis_kelamin,
  status_keanggotaan,
  status_akun,
  pekerjaan,
  umur,
  pendapatan_bulanan,
  simpanan_wajib,
  avatar_url,
  loan_templates
) values
  ('npc_m1', 'KOP-MERAH-PUTIH-DEMO', 'Budi Santoso', '32.01.01.2001', 'Laki-laki', 'calon', 'aktif', 'Petani Padi', 45, 2500000, 50000, '/assets/avatars/male_1_budi.jpg',
    '[{"tujuan":"Meningkatkan produksi beras","jumlah":1000000,"tenor":1,"barangTerkait":"rice"},{"tujuan":"Meningkatkan produksi beras","jumlah":500000,"tenor":1,"barangTerkait":"rice"}]'::jsonb),
  ('npc_m2', 'KOP-MERAH-PUTIH-DEMO', 'Ahmad Wijaya', '32.01.01.2001', 'Laki-laki', 'calon', 'aktif', 'Pedagang Kelontong', 38, 3000000, 50000, '/assets/avatars/male_2_ahmad.jpg',
    '[{"tujuan":"Memperbesar produksi minyak goreng","jumlah":600000,"tenor":1,"barangTerkait":"cookingOil"},{"tujuan":"Menambah armada distribusi gas LPG","jumlah":800000,"tenor":1,"barangTerkait":"lpgGas"}]'::jsonb),
  ('npc_m3', 'KOP-MERAH-PUTIH-DEMO', 'Hendra Kusuma', '32.01.01.2001', 'Laki-laki', 'calon', 'aktif', 'Nelayan', 42, 2000000, 50000, '/assets/avatars/male_3_hendra.jpg',
    '[{"tujuan":"Meningkatkan produksi beras","jumlah":800000,"tenor":1,"barangTerkait":"rice"},{"tujuan":"Memperbesar produksi minyak goreng","jumlah":700000,"tenor":1,"barangTerkait":"cookingOil"}]'::jsonb),
  ('npc_m4', 'KOP-MERAH-PUTIH-DEMO', 'Dedi Prasetyo', '32.01.01.2001', 'Laki-laki', 'calon', 'aktif', 'Pengusaha Minyak Goreng', 35, 2800000, 50000, '/assets/avatars/male_4_dedi.jpg',
    '[{"tujuan":"Memperbesar produksi minyak goreng","jumlah":1000000,"tenor":1,"barangTerkait":"cookingOil"},{"tujuan":"Memperbesar produksi minyak goreng","jumlah":900000,"tenor":1,"barangTerkait":"cookingOil"}]'::jsonb),
  ('npc_f1', 'KOP-MERAH-PUTIH-DEMO', 'Siti Aminah', '32.01.01.2001', 'Perempuan', 'calon', 'aktif', 'Penjahit', 32, 1800000, 50000, '/assets/avatars/female_1_siti.jpg',
    '[{"tujuan":"Menambah armada distribusi gas LPG","jumlah":700000,"tenor":1,"barangTerkait":"lpgGas"},{"tujuan":"Meningkatkan produksi beras","jumlah":500000,"tenor":1,"barangTerkait":"rice"}]'::jsonb),
  ('npc_f2', 'KOP-MERAH-PUTIH-DEMO', 'Dewi Lestari', '32.01.01.2001', 'Perempuan', 'calon', 'aktif', 'Guru SD', 40, 3500000, 50000, '/assets/avatars/female_2_dewi.jpg',
    '[{"tujuan":"Meningkatkan produksi beras","jumlah":1000000,"tenor":1,"barangTerkait":"rice"},{"tujuan":"Menambah armada distribusi gas LPG","jumlah":600000,"tenor":1,"barangTerkait":"lpgGas"}]'::jsonb),
  ('npc_f3', 'KOP-MERAH-PUTIH-DEMO', 'Rina Wulandari', '32.01.01.2001', 'Perempuan', 'calon', 'aktif', 'Pedagang Pasar', 36, 2200000, 50000, '/assets/avatars/female_3_rina.jpg',
    '[{"tujuan":"Memperbesar produksi minyak goreng","jumlah":600000,"tenor":1,"barangTerkait":"cookingOil"},{"tujuan":"Menambah armada distribusi gas LPG","jumlah":800000,"tenor":1,"barangTerkait":"lpgGas"}]'::jsonb),
  ('npc_f4', 'KOP-MERAH-PUTIH-DEMO', 'Kartini Putri', '32.01.01.2001', 'Perempuan', 'calon', 'aktif', 'Pengusaha Gas LPG', 44, 2000000, 50000, '/assets/avatars/female_4_kartini.jpg',
    '[{"tujuan":"Menambah armada distribusi gas LPG","jumlah":1000000,"tenor":1,"barangTerkait":"lpgGas"},{"tujuan":"Menambah armada distribusi gas LPG","jumlah":900000,"tenor":1,"barangTerkait":"lpgGas"}]'::jsonb)
on conflict (anggota_ref) do update set
  nama = excluded.nama,
  pekerjaan = excluded.pekerjaan,
  umur = excluded.umur,
  pendapatan_bulanan = excluded.pendapatan_bulanan,
  simpanan_wajib = excluded.simpanan_wajib,
  avatar_url = excluded.avatar_url,
  loan_templates = excluded.loan_templates;

insert into game_sessions (
  session_id,
  koperasi_ref,
  current_date,
  day_number,
  money,
  happiness,
  member_count,
  store_size,
  statistics
) values (
  '00000000-0000-0000-0000-000000000001',
  'KOP-MERAH-PUTIH-DEMO',
  '2026-01-01',
  1,
  5000000,
  50,
  0,
  'small',
  '{"totalItemsSold":0,"totalLoansGiven":0,"totalLoansSuccessful":0}'::jsonb
) on conflict (session_id) do update set
  current_date = excluded.current_date,
  day_number = excluded.day_number,
  money = excluded.money,
  happiness = excluded.happiness,
  store_size = excluded.store_size;

insert into game_supplier_state (
  session_id,
  supplier_type,
  produk_sample_id,
  day_number,
  daily_stock,
  current_price,
  last_purchase_price
) values
  ('00000000-0000-0000-0000-000000000001', 'PT', 'PROD-RICE', 1, 20, 15000, 15000),
  ('00000000-0000-0000-0000-000000000001', 'PT', 'PROD-COOKING-OIL', 1, 20, 27000, 27000),
  ('00000000-0000-0000-0000-000000000001', 'PT', 'PROD-LPG-GAS', 1, 20, 30000, 30000),
  ('00000000-0000-0000-0000-000000000001', 'UMKM', 'PROD-RICE', 1, 10, 16000, 16000),
  ('00000000-0000-0000-0000-000000000001', 'UMKM', 'PROD-COOKING-OIL', 1, 10, 29000, 29000),
  ('00000000-0000-0000-0000-000000000001', 'UMKM', 'PROD-LPG-GAS', 1, 10, 35000, 35000)
on conflict (session_id, supplier_type, produk_sample_id, day_number) do update set
  daily_stock = excluded.daily_stock,
  current_price = excluded.current_price,
  last_purchase_price = excluded.last_purchase_price;

insert into game_events (
  session_id,
  event_type,
  scheduled_day,
  start_day,
  days_remaining,
  status,
  payload
) values
  ('00000000-0000-0000-0000-000000000001', 'gagal_panen', 15, 15, 0, 'scheduled',
   '{"umkmRicePriceMultiplier":1.5,"happinessPenaltyIfNotBuyUMKM":25}'::jsonb),
  ('00000000-0000-0000-0000-000000000001', 'krisis_ekonomi', 8, 8, 7, 'scheduled',
   '{"durationDays":7,"happinessPenaltyPerDay":10}'::jsonb)
on conflict (session_id, event_type, scheduled_day) do update set
  start_day = excluded.start_day,
  days_remaining = excluded.days_remaining,
  status = excluded.status,
  payload = excluded.payload;
