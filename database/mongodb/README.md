# Local MongoDB Test Database

This folder is a test-only MongoDB version of the GDD database plan. It does not replace the PostgreSQL/Supabase schema in `database/schema.sql`; it gives us a quick local document database target for experiments.

## Defaults

- URI: `mongodb://localhost:27017`
- Database: `koperasi_merah_putih_game`
- Demo session: `demo-session-001`

Override with:

```powershell
$env:MONGO_URI='mongodb://localhost:27017'
$env:MONGO_DB_NAME='koperasi_merah_putih_game'
```

## Commands

```powershell
npm run db:mongo:seed
npm run db:mongo:validate
```

## Collections

The collection names mirror the spreadsheet/Postgres plan:

- Official cooperative collections: `referensi_wilayah`, `profil_koperasi`, `anggota_koperasi`, `produk_koperasi`, `inventaris_produk`, `barang_masuk_produk`, `transaksi_penjualan`, `barang_keluar_produk`, `pengajuan_pembiayaan`.
- Game-only collections: `game_sessions`, `game_membership_state`, `game_supplier_state`, `game_furniture`, `game_events`, `game_daily_reports`, `game_story_state`.

The browser game is still client-only. These scripts prove the local database shape and provide a backend target for the next wiring step.
