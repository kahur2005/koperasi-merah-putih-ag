-- Koperasi Merah Putih Simulator database schema.
-- PostgreSQL/Supabase compatible. Spreadsheet table names are preserved for
-- cooperative records; game-only runtime state lives in game_* tables.

create extension if not exists pgcrypto;

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.diperbarui_pada = now();
  return new;
end;
$$;

create or replace function set_game_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Official cooperative/reference layer from the hackathon spreadsheet.
-- ---------------------------------------------------------------------------

create table if not exists referensi_wilayah (
  kode_wilayah text primary key,
  provinsi text,
  kab_kota text,
  kecamatan text,
  desa_kelurahan text,
  dibuat_pada timestamp without time zone default now(),
  diperbarui_pada timestamp without time zone default now()
);

create table if not exists referensi_koperasi_wilayah (
  koperasi_ref text primary key,
  kode_wilayah text references referensi_wilayah(kode_wilayah),
  dibuat_pada timestamp without time zone default now(),
  diperbarui_pada timestamp without time zone default now()
);

create table if not exists profil_koperasi (
  koperasi_ref text primary key references referensi_koperasi_wilayah(koperasi_ref),
  nama_koperasi text,
  status_registrasi text,
  bentuk_koperasi text,
  kategori_usaha text,
  nik_koperasi text,
  alamat_lengkap text,
  kode_pos text,
  koordinat_dibulatkan text,
  modal_awal text,
  sumber_persetujuan text,
  tentang_koperasi text,
  pola_pengelolaan text,
  metode_pengisian text,
  dibuat_pada timestamp without time zone default now(),
  diperbarui_pada timestamp without time zone default now()
);

create table if not exists anggota_koperasi (
  anggota_ref text primary key,
  koperasi_ref text not null references referensi_koperasi_wilayah(koperasi_ref),
  nama text,
  nik text,
  kode_wilayah text references referensi_wilayah(kode_wilayah),
  jenis_kelamin text,
  status_keanggotaan text,
  tanggal_terdaftar date,
  file_ktp text,
  status_akun text,
  pekerjaan text,
  umur integer check (umur is null or umur >= 0),
  pendapatan_bulanan numeric(14, 2),
  simpanan_wajib numeric(14, 2),
  avatar_url text,
  loan_templates jsonb not null default '[]'::jsonb,
  dibuat_pada timestamp without time zone default now(),
  diperbarui_pada timestamp without time zone default now()
);

create table if not exists simpanan_anggota (
  simpanan_ref text primary key,
  koperasi_ref text not null references referensi_koperasi_wilayah(koperasi_ref),
  anggota_ref text not null references anggota_koperasi(anggota_ref),
  periode_pembayaran text,
  jumlah_simpanan numeric(14, 2),
  status text,
  dibuat_pada timestamp without time zone default now(),
  dibayar_pada timestamp without time zone
);

create table if not exists produk_koperasi (
  produk_sample_id text primary key,
  koperasi_ref text not null references referensi_koperasi_wilayah(koperasi_ref),
  kode_barcode text,
  nama_produk text,
  nama_tampilan text,
  unit text,
  item_key text not null,
  dibuat_pada timestamp without time zone default now(),
  diperbarui_pada timestamp without time zone default now(),
  unique (koperasi_ref, item_key)
);

create table if not exists inventaris_produk (
  inventaris_ref text primary key,
  produk_sample_id text not null references produk_koperasi(produk_sample_id),
  koperasi_ref text not null references referensi_koperasi_wilayah(koperasi_ref),
  nama_produk text,
  stok numeric(14, 2) not null default 0,
  kapasitas_stok numeric(14, 2) not null default 0,
  harga_jual_aktif numeric(14, 2),
  kode_barcode text,
  dibuat_pada timestamp without time zone default now(),
  diperbarui_pada timestamp without time zone default now(),
  unique (koperasi_ref, produk_sample_id)
);

create table if not exists barang_masuk_produk (
  barang_masuk_ref text primary key,
  produk_sample_id text not null references produk_koperasi(produk_sample_id),
  koperasi_ref text not null references referensi_koperasi_wilayah(koperasi_ref),
  kode_barcode text,
  nama_produk text,
  nama_tampilan text,
  jumlah_masuk numeric(14, 2),
  jumlah_tersedia numeric(14, 2),
  harga_beli numeric(14, 2),
  harga_jual numeric(14, 2),
  total_biaya numeric(14, 2),
  supplier_type text check (supplier_type in ('PT', 'UMKM')),
  keterangan text,
  status text,
  tanggal_masuk timestamp without time zone,
  dibuat_pada timestamp without time zone default now(),
  diperbarui_pada timestamp without time zone default now()
);

create table if not exists transaksi_penjualan (
  transaksi_sample_id text primary key,
  koperasi_ref text not null references referensi_koperasi_wilayah(koperasi_ref),
  nama_pelanggan text,
  tanggal_dibuat timestamp without time zone,
  total_pembayaran numeric(14, 2),
  status_transaksi text,
  metode_pembayaran text,
  session_id uuid,
  day_number integer,
  dibuat_pada timestamp without time zone default now(),
  diperbarui_pada timestamp without time zone default now()
);

create table if not exists barang_keluar_produk (
  row_id bigint generated always as identity primary key,
  transaksi_sample_id text not null references transaksi_penjualan(transaksi_sample_id),
  produk_sample_id text not null references produk_koperasi(produk_sample_id),
  koperasi_ref text not null references referensi_koperasi_wilayah(koperasi_ref),
  kode_barcode text,
  tanggal_keluar timestamp without time zone,
  status text,
  nama_produk text,
  nama_tampilan text,
  jumlah_keluar numeric(14, 2),
  harga numeric(14, 2),
  total_nilai numeric(14, 2),
  status_transaksi text,
  dibuat_pada timestamp without time zone default now(),
  diperbarui_pada timestamp without time zone default now()
);

create table if not exists pengajuan_pembiayaan (
  pengajuan_pembiayaan_ref text primary key,
  koperasi_ref text not null references referensi_koperasi_wilayah(koperasi_ref),
  anggota_ref text references anggota_koperasi(anggota_ref),
  nik text,
  penanggung_jawab text,
  nomor_penanggung_jawab text,
  status_permohonan text,
  status_pinjaman text check (
    status_pinjaman is null
    or status_pinjaman in ('menunggu', 'aktif', 'lunas', 'ditolak', 'gagal')
  ),
  formulir_permohonan_pembiayaan text,
  nominal_permohonan numeric(14, 2),
  tenor integer,
  tujuan_permohonan text,
  bunga_persen numeric(5, 2),
  cicilan_per_bulan numeric(14, 2),
  sisa_bulan integer,
  total_terbayar numeric(14, 2) not null default 0,
  barang_terkait text,
  request_date date,
  start_date date,
  completed_date date,
  dibuat_pada timestamp without time zone default now(),
  diperbarui_pada timestamp without time zone default now()
);

create table if not exists aset_koperasi (
  aset_ref text primary key,
  koperasi_ref text not null references referensi_koperasi_wilayah(koperasi_ref),
  nama_aset text,
  tipe_aset text,
  status text,
  progres_pembangunan numeric,
  foto_utama text,
  foto_sekunder text,
  dokumen_utama text,
  dokumen_sekunder text,
  dokumen_lainnya text,
  luas_lahan numeric,
  panjang_lahan numeric,
  lebar_lahan numeric,
  akses_jalan text,
  koordinat_dibulatkan text,
  dibuat_pada timestamp without time zone default now(),
  diperbarui_pada timestamp without time zone default now()
);

create table if not exists referensi_gerai_koperasi (
  jenis_gerai_ref text primary key,
  nama_jenis_gerai text,
  dibuat_pada timestamp without time zone default now(),
  diperbarui_pada timestamp without time zone default now()
);

create table if not exists gerai_koperasi (
  gerai_ref text primary key,
  koperasi_ref text not null references referensi_koperasi_wilayah(koperasi_ref),
  jenis_gerai_ref text not null references referensi_gerai_koperasi(jenis_gerai_ref),
  status_gerai text,
  foto_gerai text,
  pengisi text,
  akses_internet text,
  akses_listrik text,
  status_kepemilikan_aset_gerai text,
  status_pemanfaatan_aset_gerai text,
  sumber_air_bersih text,
  jenis_bangunan text,
  koordinat_dibulatkan text,
  dibuat_pada timestamp without time zone default now(),
  diperbarui_pada timestamp without time zone default now()
);

-- ---------------------------------------------------------------------------
-- Game runtime layer mapped to the current 365-day GDD.
-- ---------------------------------------------------------------------------

create table if not exists game_sessions (
  session_id uuid primary key default gen_random_uuid(),
  koperasi_ref text not null references referensi_koperasi_wilayah(koperasi_ref),
  current_date date not null,
  day_number integer not null check (day_number between 1 and 365),
  money numeric(14, 2) not null,
  happiness numeric(5, 2) not null check (happiness between 0 and 100),
  member_count integer not null default 0,
  store_size text not null check (store_size in ('small', 'large')),
  story_intro_seen boolean not null default false,
  bought_from_umkm_today boolean not null default false,
  game_over boolean not null default false,
  game_result jsonb,
  statistics jsonb not null default '{"totalItemsSold":0,"totalLoansGiven":0,"totalLoansSuccessful":0}'::jsonb,
  created_at timestamp without time zone default now(),
  updated_at timestamp without time zone default now()
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'transaksi_penjualan_session_fk'
  ) then
    alter table transaksi_penjualan
      add constraint transaksi_penjualan_session_fk
      foreign key (session_id) references game_sessions(session_id);
  end if;
end;
$$;

create table if not exists game_membership_state (
  session_id uuid not null references game_sessions(session_id) on delete cascade,
  anggota_ref text not null references anggota_koperasi(anggota_ref),
  status text not null check (status in ('pending', 'accepted', 'denied')),
  join_date date,
  has_applied_for_loan boolean not null default false,
  first_seen_day integer,
  updated_at timestamp without time zone default now(),
  primary key (session_id, anggota_ref)
);

create table if not exists game_supplier_state (
  session_id uuid not null references game_sessions(session_id) on delete cascade,
  supplier_type text not null check (supplier_type in ('PT', 'UMKM')),
  produk_sample_id text not null references produk_koperasi(produk_sample_id),
  day_number integer not null check (day_number between 1 and 365),
  daily_stock numeric(14, 2) not null default 0,
  current_price numeric(14, 2) not null,
  last_purchase_price numeric(14, 2),
  permanent_stock_bonus numeric(14, 2) not null default 0,
  permanent_price_adjustment numeric(14, 2) not null default 0,
  updated_at timestamp without time zone default now(),
  primary key (session_id, supplier_type, produk_sample_id, day_number)
);

create table if not exists game_furniture (
  furniture_id uuid primary key default gen_random_uuid(),
  session_id uuid not null references game_sessions(session_id) on delete cascade,
  furniture_type text not null,
  label text,
  x numeric(8, 2) not null,
  y numeric(8, 2) not null,
  rotation integer not null default 0,
  color text,
  purchase_price numeric(14, 2),
  stock_bonus jsonb not null default '{}'::jsonb,
  happiness_bonus numeric(5, 2) not null default 0,
  customer_bonus integer not null default 0,
  purchased_at_day integer,
  deleted_at timestamp without time zone,
  created_at timestamp without time zone default now(),
  updated_at timestamp without time zone default now()
);

create table if not exists game_events (
  event_id uuid primary key default gen_random_uuid(),
  session_id uuid not null references game_sessions(session_id) on delete cascade,
  event_type text not null check (event_type in ('gagal_panen', 'krisis_ekonomi', 'bagi_hasil')),
  scheduled_day integer check (scheduled_day between 1 and 365),
  start_day integer check (start_day between 1 and 365),
  days_remaining integer not null default 0,
  status text not null check (status in ('scheduled', 'active', 'resolved', 'missed')),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamp without time zone default now(),
  updated_at timestamp without time zone default now(),
  unique (session_id, event_type, scheduled_day)
);

create table if not exists game_daily_reports (
  report_id uuid primary key default gen_random_uuid(),
  session_id uuid not null references game_sessions(session_id) on delete cascade,
  day_number integer not null check (day_number between 1 and 365),
  report_date date not null,
  total_customers integer not null default 0,
  customers_served integer not null default 0,
  customers_lost integer not null default 0,
  total_items_sold integer not null default 0,
  revenue numeric(14, 2) not null default 0,
  happiness_change numeric(5, 2) not null default 0,
  sales_breakdown jsonb not null default '{}'::jsonb,
  stock_after jsonb not null default '{}'::jsonb,
  events_active jsonb not null default '[]'::jsonb,
  flags jsonb not null default '{}'::jsonb,
  created_at timestamp without time zone default now(),
  unique (session_id, day_number)
);

create table if not exists game_story_state (
  session_id uuid not null references game_sessions(session_id) on delete cascade,
  story_id text not null,
  seen boolean not null default true,
  seen_at_day integer check (seen_at_day is null or seen_at_day between 1 and 365),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamp without time zone default now(),
  primary key (session_id, story_id)
);

create index if not exists idx_anggota_koperasi_koperasi_ref on anggota_koperasi(koperasi_ref);
create index if not exists idx_simpanan_anggota_member_period on simpanan_anggota(anggota_ref, periode_pembayaran);
create index if not exists idx_produk_koperasi_item_key on produk_koperasi(koperasi_ref, item_key);
create index if not exists idx_barang_masuk_session_day on barang_masuk_produk(koperasi_ref, tanggal_masuk);
create index if not exists idx_transaksi_penjualan_session_day on transaksi_penjualan(session_id, day_number);
create index if not exists idx_pengajuan_pembiayaan_status on pengajuan_pembiayaan(koperasi_ref, status_pinjaman);
create index if not exists idx_game_events_session_status on game_events(session_id, status, scheduled_day);
create index if not exists idx_game_supplier_state_day on game_supplier_state(session_id, day_number);

drop trigger if exists trg_referensi_wilayah_updated_at on referensi_wilayah;
create trigger trg_referensi_wilayah_updated_at
before update on referensi_wilayah
for each row execute function set_updated_at();

drop trigger if exists trg_referensi_koperasi_wilayah_updated_at on referensi_koperasi_wilayah;
create trigger trg_referensi_koperasi_wilayah_updated_at
before update on referensi_koperasi_wilayah
for each row execute function set_updated_at();

drop trigger if exists trg_profil_koperasi_updated_at on profil_koperasi;
create trigger trg_profil_koperasi_updated_at
before update on profil_koperasi
for each row execute function set_updated_at();

drop trigger if exists trg_anggota_koperasi_updated_at on anggota_koperasi;
create trigger trg_anggota_koperasi_updated_at
before update on anggota_koperasi
for each row execute function set_updated_at();

drop trigger if exists trg_produk_koperasi_updated_at on produk_koperasi;
create trigger trg_produk_koperasi_updated_at
before update on produk_koperasi
for each row execute function set_updated_at();

drop trigger if exists trg_inventaris_produk_updated_at on inventaris_produk;
create trigger trg_inventaris_produk_updated_at
before update on inventaris_produk
for each row execute function set_updated_at();

drop trigger if exists trg_barang_masuk_produk_updated_at on barang_masuk_produk;
create trigger trg_barang_masuk_produk_updated_at
before update on barang_masuk_produk
for each row execute function set_updated_at();

drop trigger if exists trg_transaksi_penjualan_updated_at on transaksi_penjualan;
create trigger trg_transaksi_penjualan_updated_at
before update on transaksi_penjualan
for each row execute function set_updated_at();

drop trigger if exists trg_pengajuan_pembiayaan_updated_at on pengajuan_pembiayaan;
create trigger trg_pengajuan_pembiayaan_updated_at
before update on pengajuan_pembiayaan
for each row execute function set_updated_at();

drop trigger if exists trg_game_sessions_updated_at on game_sessions;
create trigger trg_game_sessions_updated_at
before update on game_sessions
for each row execute function set_game_updated_at();

drop trigger if exists trg_game_furniture_updated_at on game_furniture;
create trigger trg_game_furniture_updated_at
before update on game_furniture
for each row execute function set_game_updated_at();

drop trigger if exists trg_game_events_updated_at on game_events;
create trigger trg_game_events_updated_at
before update on game_events
for each row execute function set_game_updated_at();
