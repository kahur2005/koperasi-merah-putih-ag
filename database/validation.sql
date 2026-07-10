-- Validation queries for the database/GDD mapping.
-- These are read-only checks to run after schema.sql and seed.sql.

-- 1. Starting game has one session with the current GDD starting values.
select
  session_id,
  current_date,
  day_number,
  money,
  happiness,
  store_size,
  game_over
from game_sessions
where session_id = '00000000-0000-0000-0000-000000000001';

-- 2. Seed product inventory is aligned with item keys used in src/store/gameStore.js.
select p.item_key, p.nama_tampilan, i.stok, i.kapasitas_stok, i.harga_jual_aktif
from produk_koperasi p
join inventaris_produk i on i.produk_sample_id = p.produk_sample_id
where p.koperasi_ref = 'KOP-MERAH-PUTIH-DEMO'
order by p.item_key;

-- 3. Initial supplier state captures PT/UMKM stock and prices for day 1.
select s.supplier_type, p.item_key, s.daily_stock, s.current_price, s.last_purchase_price
from game_supplier_state s
join produk_koperasi p on p.produk_sample_id = s.produk_sample_id
where s.session_id = '00000000-0000-0000-0000-000000000001'
  and s.day_number = 1
order by s.supplier_type, p.item_key;

-- 4. Member pool is ready for the member application mechanic.
select anggota_ref, nama, pekerjaan, jenis_kelamin, simpanan_wajib, jsonb_array_length(loan_templates) as loan_template_count
from anggota_koperasi
where koperasi_ref = 'KOP-MERAH-PUTIH-DEMO'
order by anggota_ref;

-- 5. Calendar events can be rendered from game_events.
select event_type, scheduled_day, start_day, days_remaining, status, payload
from game_events
where session_id = '00000000-0000-0000-0000-000000000001'
order by scheduled_day, event_type;

-- 6. End-of-day reports should be unique per session/day once gameplay writes them.
select session_id, day_number, count(*) as report_count
from game_daily_reports
group by session_id, day_number
having count(*) > 1;
