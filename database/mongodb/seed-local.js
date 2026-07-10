import { MongoClient } from 'mongodb';
import { EVENTS, GAME, MEMBERS, SUPPLIERS } from '../../src/constants/gameConstants.js';
import { NPC_DATABASE } from '../../src/data/npcData.js';
import {
  COLLECTIONS,
  DEMO_KODE_WILAYAH,
  DEMO_KOPERASI_REF,
  DEMO_SESSION_ID,
  MONGO_DB_NAME,
  MONGO_URI,
} from './config.js';

const products = [
  {
    produk_sample_id: 'PROD-RICE',
    kode_barcode: 'KMP-RICE',
    nama_produk: 'Beras',
    nama_tampilan: 'Beras',
    unit: 'unit',
    item_key: 'rice',
    harga_jual_aktif: 16000,
  },
  {
    produk_sample_id: 'PROD-COOKING-OIL',
    kode_barcode: 'KMP-OIL',
    nama_produk: 'Minyak Goreng',
    nama_tampilan: 'Minyak Goreng',
    unit: 'unit',
    item_key: 'cookingOil',
    harga_jual_aktif: 29000,
  },
  {
    produk_sample_id: 'PROD-LPG-GAS',
    kode_barcode: 'KMP-LPG',
    nama_produk: 'Gas LPG',
    nama_tampilan: 'Gas LPG',
    unit: 'unit',
    item_key: 'lpgGas',
    harga_jual_aktif: 35000,
  },
];

function stamp(document) {
  const date = new Date();
  return {
    ...document,
    updated_at: date,
  };
}

function upsertOne(key, document) {
  return {
    updateOne: {
      filter: key,
      update: {
        $set: stamp(document),
        $setOnInsert: {
          created_at: new Date(),
        },
      },
      upsert: true,
    },
  };
}

async function bulkUpsert(db, collectionName, operations) {
  if (operations.length === 0) return;
  await db.collection(collectionName).bulkWrite(operations, { ordered: true });
}

async function ensureIndexes(db) {
  await Promise.all([
    db.collection(COLLECTIONS.wilayah).createIndex({ kode_wilayah: 1 }, { unique: true }),
    db.collection(COLLECTIONS.koperasiWilayah).createIndex({ koperasi_ref: 1 }, { unique: true }),
    db.collection(COLLECTIONS.profilKoperasi).createIndex({ koperasi_ref: 1 }, { unique: true }),
    db.collection(COLLECTIONS.anggotaKoperasi).createIndex({ anggota_ref: 1 }, { unique: true }),
    db.collection(COLLECTIONS.produkKoperasi).createIndex({ produk_sample_id: 1 }, { unique: true }),
    db.collection(COLLECTIONS.produkKoperasi).createIndex({ koperasi_ref: 1, item_key: 1 }, { unique: true }),
    db.collection(COLLECTIONS.inventarisProduk).createIndex({ inventaris_ref: 1 }, { unique: true }),
    db.collection(COLLECTIONS.gameSessions).createIndex({ session_id: 1 }, { unique: true }),
    db.collection(COLLECTIONS.gameSupplierState).createIndex(
      { session_id: 1, supplier_type: 1, produk_sample_id: 1, day_number: 1 },
      { unique: true },
    ),
    db.collection(COLLECTIONS.gameEvents).createIndex(
      { session_id: 1, event_type: 1, scheduled_day: 1 },
      { unique: true },
    ),
    db.collection(COLLECTIONS.gameDailyReports).createIndex(
      { session_id: 1, day_number: 1 },
      { unique: true },
    ),
  ]);
}

async function seed() {
  const client = new MongoClient(MONGO_URI, { serverSelectionTimeoutMS: 3000 });

  try {
    await client.connect();
    const db = client.db(MONGO_DB_NAME);
    await ensureIndexes(db);

    await bulkUpsert(db, COLLECTIONS.wilayah, [
      upsertOne(
        { kode_wilayah: DEMO_KODE_WILAYAH },
        {
          kode_wilayah: DEMO_KODE_WILAYAH,
          provinsi: 'Jawa Barat',
          kab_kota: 'Kabupaten Bogor',
          kecamatan: 'Kecamatan Contoh',
          desa_kelurahan: 'Desa Merah Putih',
        },
      ),
    ]);

    await bulkUpsert(db, COLLECTIONS.koperasiWilayah, [
      upsertOne(
        { koperasi_ref: DEMO_KOPERASI_REF },
        {
          koperasi_ref: DEMO_KOPERASI_REF,
          kode_wilayah: DEMO_KODE_WILAYAH,
        },
      ),
    ]);

    await bulkUpsert(db, COLLECTIONS.profilKoperasi, [
      upsertOne(
        { koperasi_ref: DEMO_KOPERASI_REF },
        {
          koperasi_ref: DEMO_KOPERASI_REF,
          nama_koperasi: 'Koperasi Desa Merah Putih',
          status_registrasi: 'simulasi',
          bentuk_koperasi: 'koperasi konsumen dan simpan pinjam',
          kategori_usaha: 'kebutuhan pokok, simpan pinjam, pemberdayaan UMKM',
          alamat_lengkap: 'Desa Merah Putih',
          modal_awal: GAME.STARTING_MONEY,
          tentang_koperasi: 'Koperasi simulasi untuk mengelola stok, anggota, pinjaman, dan kebahagiaan warga.',
          pola_pengelolaan: 'gotong royong',
          metode_pengisian: 'seed game mongodb',
        },
      ),
    ]);

    await bulkUpsert(
      db,
      COLLECTIONS.produkKoperasi,
      products.map((product) =>
        upsertOne(
          { produk_sample_id: product.produk_sample_id },
          {
            ...product,
            koperasi_ref: DEMO_KOPERASI_REF,
          },
        ),
      ),
    );

    await bulkUpsert(
      db,
      COLLECTIONS.inventarisProduk,
      products.map((product) =>
        upsertOne(
          { inventaris_ref: `INV-${product.item_key}` },
          {
            inventaris_ref: `INV-${product.item_key}`,
            produk_sample_id: product.produk_sample_id,
            koperasi_ref: DEMO_KOPERASI_REF,
            nama_produk: product.nama_produk,
            stok: GAME.STARTING_STOCK[product.item_key] || 0,
            kapasitas_stok: 0,
            harga_jual_aktif: product.harga_jual_aktif,
            kode_barcode: product.kode_barcode,
          },
        ),
      ),
    );

    const coreNpc = NPC_DATABASE.slice(0, MEMBERS.TOTAL_NPC_COUNT);
    await bulkUpsert(
      db,
      COLLECTIONS.anggotaKoperasi,
      coreNpc.map((npc) =>
        upsertOne(
          { anggota_ref: npc.id },
          {
            anggota_ref: npc.id,
            koperasi_ref: DEMO_KOPERASI_REF,
            nama: npc.nama,
            kode_wilayah: DEMO_KODE_WILAYAH,
            jenis_kelamin: npc.jenisKelamin,
            status_keanggotaan: 'calon',
            status_akun: 'aktif',
            pekerjaan: npc.pekerjaan,
            umur: npc.umur,
            pendapatan_bulanan: npc.pendapatanBulanan,
            simpanan_wajib: npc.simpananWajib,
            avatar_url: npc.avatar,
            loan_templates: npc.loanTemplates,
          },
        ),
      ),
    );

    await bulkUpsert(db, COLLECTIONS.gameSessions, [
      upsertOne(
        { session_id: DEMO_SESSION_ID },
        {
          session_id: DEMO_SESSION_ID,
          koperasi_ref: DEMO_KOPERASI_REF,
          current_date: GAME.START_DATE,
          day_number: 1,
          money: GAME.STARTING_MONEY,
          happiness: GAME.STARTING_HAPPINESS,
          member_count: 0,
          store_size: 'small',
          story_intro_seen: false,
          bought_from_umkm_today: false,
          game_over: false,
          game_result: null,
          statistics: {
            totalItemsSold: 0,
            totalLoansGiven: 0,
            totalLoansSuccessful: 0,
          },
        },
      ),
    ]);

    const supplierRows = products.flatMap((product) =>
      [
        {
          supplier_type: 'PT',
          daily_stock: SUPPLIERS.PT.dailyStock[product.item_key],
          current_price: SUPPLIERS.PT.prices[product.item_key],
          last_purchase_price: SUPPLIERS.PT.prices[product.item_key],
        },
        {
          supplier_type: 'UMKM',
          daily_stock: SUPPLIERS.UMKM.baseDailyStock[product.item_key],
          current_price: SUPPLIERS.UMKM.basePrices[product.item_key],
          last_purchase_price: SUPPLIERS.UMKM.basePrices[product.item_key],
        },
      ].map((supplier) => ({
        ...supplier,
        session_id: DEMO_SESSION_ID,
        produk_sample_id: product.produk_sample_id,
        day_number: 1,
        permanent_stock_bonus: 0,
        permanent_price_adjustment: 0,
      })),
    );

    await bulkUpsert(
      db,
      COLLECTIONS.gameSupplierState,
      supplierRows.map((row) =>
        upsertOne(
          {
            session_id: row.session_id,
            supplier_type: row.supplier_type,
            produk_sample_id: row.produk_sample_id,
            day_number: row.day_number,
          },
          row,
        ),
      ),
    );

    await bulkUpsert(db, COLLECTIONS.gameEvents, [
      upsertOne(
        { session_id: DEMO_SESSION_ID, event_type: 'gagal_panen', scheduled_day: 15 },
        {
          session_id: DEMO_SESSION_ID,
          event_type: 'gagal_panen',
          scheduled_day: 15,
          start_day: 15,
          days_remaining: 0,
          status: 'scheduled',
          payload: EVENTS.GAGAL_PANEN,
        },
      ),
      upsertOne(
        { session_id: DEMO_SESSION_ID, event_type: 'krisis_ekonomi', scheduled_day: 8 },
        {
          session_id: DEMO_SESSION_ID,
          event_type: 'krisis_ekonomi',
          scheduled_day: 8,
          start_day: 8,
          days_remaining: EVENTS.KRISIS_EKONOMI.durationDays,
          status: 'scheduled',
          payload: EVENTS.KRISIS_EKONOMI,
        },
      ),
    ]);

    console.log(`Seeded MongoDB database "${MONGO_DB_NAME}" at ${MONGO_URI}`);
    console.log(`Demo session: ${DEMO_SESSION_ID}`);
  } finally {
    await client.close();
  }
}

seed().catch((error) => {
  console.error('MongoDB seed failed.');
  console.error(error.message);
  process.exitCode = 1;
});
