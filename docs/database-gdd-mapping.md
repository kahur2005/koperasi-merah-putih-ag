# Database GDD Mapping

This project is currently a client-only React/Zustand game. The database implementation in `database/` gives the backend shape for PostgreSQL/Supabase without changing the running frontend yet.

## Files

- `database/schema.sql` creates the hackathon-aligned cooperative tables and the game runtime tables.
- `database/seed.sql` seeds the demo cooperative, three products, initial inventory, the core NPC member pool, a demo game session, supplier state, and scheduled starting events.
- `database/validation.sql` contains read-only checks for the main GDD scenarios.

## Design Rule

Spreadsheet table names are used for official cooperative records. Game-only state uses `game_*` tables so the official model stays clean.

## GDD System Mapping

| GDD system | Primary tables | Notes |
| --- | --- | --- |
| Cooperative and village identity | `referensi_wilayah`, `referensi_koperasi_wilayah`, `profil_koperasi` | Stores the village setting and the cooperative profile. |
| Game session/progression | `game_sessions` | Tracks current date, day number, money, happiness, store size, win/lose state, and aggregate statistics. |
| Member system | `anggota_koperasi`, `game_membership_state` | NPC profiles live in `anggota_koperasi`; pending/accepted/denied state is per session. |
| Monthly savings | `simpanan_anggota` | Written on first-of-month processing for accepted members. |
| Inventory | `produk_koperasi`, `inventaris_produk` | Product keys match the app keys: `rice`, `cookingOil`, `lpgGas`. |
| Supply purchases | `barang_masuk_produk`, `game_supplier_state` | Purchase history is official stock movement; daily supplier prices/stock are game state. |
| Sales engine | `transaksi_penjualan`, `barang_keluar_produk`, `game_daily_reports` | Sales transactions store financial history; daily reports store the game receipt payload. |
| Loans | `pengajuan_pembiayaan` | Extended with member, interest, repayment, status, and related-product gameplay fields. |
| Events | `game_events` | Stores `gagal_panen`, `krisis_ekonomi`, and `bagi_hasil` scheduling/status. |
| Store/furniture | `aset_koperasi`, `gerai_koperasi`, `game_furniture` | Real store assets stay official; placed 3D furniture is session-specific. |
| Story/tutorial | `game_story_state` | Stores one-time story flags and tutorial progress per session. |

## Backend Write Flow

1. New game:
   Create `game_sessions`, ensure seed products and `inventaris_produk` exist, insert day-1 `game_supplier_state`.

2. Accept member:
   Upsert `game_membership_state` to `accepted`, set `join_date`, and update `anggota_koperasi.status_keanggotaan` if the app wants a global member status.

3. Buy supply:
   Insert `barang_masuk_produk`, update `inventaris_produk.stok`, update `game_supplier_state.daily_stock`, and update `game_sessions.money`/`happiness`.

4. End day:
   Insert one `transaksi_penjualan` header, insert `barang_keluar_produk` rows for sold items, update `inventaris_produk`, insert `game_daily_reports`, and advance `game_sessions`.

5. Loan approval/repayment:
   Insert or update `pengajuan_pembiayaan`. Use `status_pinjaman` values `menunggu`, `aktif`, `lunas`, `ditolak`, or `gagal`.

6. Events:
   Store scheduled and active events in `game_events`. Copy event effects into `game_daily_reports.flags` when they affect a day.

## Current Assumptions

- PostgreSQL/Supabase is the target database.
- IDs remain text refs for spreadsheet compatibility, except `game_*` rows use UUIDs where no spreadsheet key exists.
- Seed values follow the current code constants: start date `2026-01-01`, money `5000000`, happiness `50`, products `rice`/`cookingOil`/`lpgGas`, PT and UMKM prices/stock.
- The uploaded 30-day MVP document is treated as older context; the current repo GDD/code is authoritative.
