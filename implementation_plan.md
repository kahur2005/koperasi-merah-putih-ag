# Koperasi Merah Putih Simulator — Game Design Document (GDD)

> **Genre:** Economic Management Simulator  
> **Platform:** Web (Browser)  
> **Tech Stack:** React + Three.js (React Three Fiber)  
> **Target Resolution:** 16:9 (responsive)  
> **Game Duration:** 1 in-game year (January 1, 2026 → December 31, 2026 = 365 days)

---

## 1. Real-World Context

> [!NOTE]
> This game is based on the **Koperasi Desa/Kelurahan Merah Putih** — a real Indonesian government program launched under President Prabowo Subianto to establish community-owned cooperatives in every village. These cooperatives serve as one-stop hubs for basic goods (rice, cooking oil, LPG gas), savings & loans, and local economic empowerment. The player manages one such cooperative.

### What is Koperasi Simpan Pinjam?
A **Koperasi Simpan Pinjam (KSP)** is a member-owned savings-and-loan cooperative. Members pay a mandatory monthly deposit (*simpanan wajib*) and can apply for loans. Profits (*Sisa Hasil Usaha / SHU*) are redistributed to members annually. The game simulates this mechanism through the **Member System** and **Loan System**.

### UMKM vs Corporate (PT)
In the real program, cooperatives are encouraged to buy from **UMKM** (local small businesses / farmers) to strengthen the village economy — even if their prices fluctuate. Buying from **PT** (large corporations) is cheaper and more stable, but doesn't support local communities. The game translates this into the **Happiness mechanic**.

---

## 2. Project Structure (React + Three.js)

```
koperasi-merah-putih-ag/
├── public/
│   ├── assets/
│   │   ├── textures/          # 2D textures, UI backgrounds
│   │   ├── avatars/           # 8 NPC avatar images (see §6A)
│   │   │   ├── male_1_budi.jpg
│   │   │   ├── male_2_ahmad.jpg
│   │   │   ├── male_3_hendra.jpg
│   │   │   ├── male_4_dedi.jpg
│   │   │   ├── female_1_siti.jpg
│   │   │   ├── female_2_dewi.jpg
│   │   │   ├── female_3_rina.jpg
│   │   │   └── female_4_kartini.jpg
│   │   ├── models/            # .glb 3D furniture models
│   │   └── sounds/            # SFX and ambient
│   └── index.html
├── src/
│   ├── main.jsx               # React entry point
│   ├── App.jsx                # Root component, global state provider
│   ├── store/
│   │   └── gameStore.js       # Zustand store (single source of truth)
│   ├── constants/
│   │   ├── gameConstants.js   # All magic numbers defined here
│   │   └── uiStrings.js       # All UI text in Bahasa Indonesia
│   ├── systems/
│   │   ├── DaySystem.js       # Day progression, end-of-day calculations
│   │   ├── EconomySystem.js   # Price calculations, sales logic
│   │   ├── MemberSystem.js    # Member join/leave, monthly deposits
│   │   ├── LoanSystem.js      # Loan application, repayment, effects
│   │   ├── EventSystem.js     # Calendar events (Gagal Panen, etc.)
│   │   └── SupplySystem.js    # Supplier stock reset, price randomization
│   ├── components/
│   │   ├── hud/               # All 2D HUD overlay components
│   │   │   ├── TopBar.jsx            # Saldo, stok, kebahagiaan, anggota
│   │   │   ├── PanelAnggota.jsx      # Pendaftaran anggota (terima/tolak)
│   │   │   ├── PanelPinjaman.jsx     # Pengajuan pinjaman + pinjaman aktif
│   │   │   ├── PasarPasokan.jsx      # Beli barang dari pemasok (ikon keranjang)
│   │   │   ├── KontrolHarga.jsx      # Atur harga jual
│   │   │   ├── PanelKalender.jsx     # Kalender + acara
│   │   │   ├── LaporanHarian.jsx     # Rekap penjualan akhir hari
│   │   │   ├── BagiHasil.jsx         # UI acara Bagi Hasil
│   │   │   └── PanelMuseum.jsx       # Sejarah koperasi (e-learning)
│   │   ├── dashboard/         # Layar utama 2D
│   │   │   └── Dashboard.jsx         # Pemandangan desa dengan bangunan klik
│   │   └── store3d/           # Interior toko 3D (Three.js)
│   │       ├── StoreScene.jsx        # R3F Canvas, kamera, pencahayaan
│   │       ├── Furniture.jsx         # Furnitur 3D yang bisa digeser
│   │       ├── TokoFurnitur.jsx      # UI beli furnitur baru
│   │       └── StoreFloor.jsx        # Lantai + dinding
│   ├── data/
│   │   ├── npcData.js         # 8 hardcoded NPC profiles (see §6A)
│   │   └── museumContent.js   # Data timeline sejarah koperasi
│   └── utils/
│       ├── random.js          # Seeded random helpers
│       └── formatRupiah.js    # Currency formatter (Rp X.XXX.XXX)
├── package.json
└── vite.config.js
```

---

## 3. Game State (Zustand Store)

All game state lives in a single Zustand store. This is the **single source of truth**.

```js
// store/gameStore.js — Shape of state
{
  // === TIME ===
  currentDate: "2026-01-01",         // ISO string, advances +1 day on "End Day"
  dayNumber: 1,                       // 1–365

  // === PLAYER RESOURCES ===
  money: 5_000_000,                   // Starting balance in Rupiah (Rp 5.000.000)
  happiness: 50,                      // 0–100 (percent). Starts at 50%
  memberCount: 0,                     // Total accepted members

  // === INVENTORY (player's cooperative stock) ===
  stock: {
    rice: 20,                         // Current units in the co-op store
    cookingOil: 20,
    lpgGas: 20,
  },

  // === STOCK CAPACITY (determined by furniture) ===
  stockCapacity: {
    rice: 20,           // Base: 20. Each rice rack: +10
    cookingOil: 20,     // Base: 20. Each oil rack: +10
    lpgGas: 20,         // Base: 20 (fixed, or use goods rack for +3)
  },

  // === SELLING PRICES (set by player via Price Control) ===
  sellingPrices: {
    rice: 16_000,        // Default = same as UMKM base price
    cookingOil: 29_000,
    lpgGas: 35_000,
  },

  // === FURNITURE COUNTS ===
  furniture: {
    riceRack: 2,         // Starting: 2
    oilRack: 2,          // Starting: 2
    goodsRack: 0,        // Starting: 0
    cashier: 1,          // Starting: 1
    carpet: 0,           // Max 3
    indoorPlant: 0,      // Max 3
    prabowoPicture: 0,   // Max 3
  },

  // === STORE ===
  storeSize: "small",    // "small" = 10m×15m, "large" = 20m×30m
  furniturePositions: [], // Array of { id, type, position: {x,y,z}, rotation, color }

  // === MEMBERS ===
  members: [],           // Array of Member objects (see §6)
  pendingApplications: [], // Today's join requests (max 5/day)

  // === LOANS ===
  activeLoans: [],       // Array of Loan objects (see §7)
  pendingLoanRequests: [], // Today's loan requests (max 2/day)

  // === SUPPLIERS (today's stock, reset daily) ===
  supplierStockPT: { rice: 20, cookingOil: 20, lpgGas: 20 },
  supplierStockUMKM: { rice: 10, cookingOil: 10, lpgGas: 10 },
  supplierPricesUMKM: { rice: 16_000, cookingOil: 29_000, lpgGas: 35_000 },

  // === EVENTS ===
  activeEvents: [],      // Currently active event IDs
  eventLog: [],          // History of past events

  // === PURCHASE HISTORY (for profit tracking) ===
  purchasePrices: {
    rice: { lastPT: 15_000, lastUMKM: 16_000 },
    cookingOil: { lastPT: 27_000, lastUMKM: 29_000 },
    lpgGas: { lastPT: 30_000, lastUMKM: 35_000 },
  },
}
```

---

## 4. Constants (All Magic Numbers)

> [!IMPORTANT]
> **Every numeric value in the game MUST reference this constants file.** No magic numbers in components or systems. This prevents breakage when tuning.

```js
// constants/gameConstants.js

export const GAME = {
  START_DATE: "2026-01-01",
  END_DATE: "2026-12-31",
  STARTING_MONEY: 5_000_000,
  STARTING_HAPPINESS: 50,
  STARTING_STOCK: { rice: 20, cookingOil: 20, lpgGas: 20 },
};

export const MEMBERS = {
  MAX_APPLICATIONS_PER_DAY: 5,
  MONTHLY_SAVING: 50_000,              // Rp 50.000 per member per month
  TOTAL_NPC_COUNT: 8,                  // 8 hardcoded NPCs in the game
};

export const LOANS = {
  MIN_REQUESTS_PER_MONTH: 3,           // At least 3 loan requests per month
  MAX_REQUESTS_PER_DAY: 2,            // Still max 2 shown per day
  // System distributes ≥3/month across days, showing max 2 on any single day
  // ONLY approved members (in state.members[]) can apply
};

export const SUPPLIERS = {
  PT: {
    name: "PT. Jaya Abadi",
    prices: { rice: 15_000, cookingOil: 27_000, lpgGas: 30_000 },
    dailyStock: { rice: 20, cookingOil: 20, lpgGas: 20 },
  },
  UMKM: {
    name: "UMKM Desa",
    basePrices: { rice: 16_000, cookingOil: 29_000, lpgGas: 35_000 },
    priceVariance: 5_000,               // ± Rp 5.000 random per day
    baseDailyStock: { rice: 10, cookingOil: 10, lpgGas: 10 },
  },
};

export const FURNITURE = {
  riceRack:       { price: 500_000,  stockBonus: { rice: 10 },              maxCount: Infinity },
  oilRack:        { price: 600_000,  stockBonus: { cookingOil: 10 },        maxCount: Infinity },
  goodsRack:      { price: 200_000,  stockBonus: { rice: 3, cookingOil: 3 },maxCount: Infinity },
  cashier:        { price: 350_000,  customerBonus: 10,                     maxCount: Infinity },
  carpet:         { price: 700_000,  happinessBonus: 5,                     maxCount: 3 },
  indoorPlant:    { price: 850_000,  happinessBonus: 5,                     maxCount: 3 },
  prabowoPicture: { price: 600_000,  happinessBonus: 10,                    maxCount: 3 },
};

export const STORE = {
  BASE_SIZE: { width: 10, depth: 15 },     // meters
  UPGRADED_SIZE: { width: 20, depth: 30 },  // meters
  UPGRADE_COST: 20_000_000,                 // Rp 20.000.000
  BASE_CUSTOMERS_PER_CASHIER: 10,           // 10 customers per cashier per day
};

export const PRICE_CONTROL = {
  HIGH_MARKUP_THRESHOLD: 0.40,    // 40% above purchase price
  LOW_MARKUP_THRESHOLD: 0.20,     // 20% above purchase price
  HAPPINESS_PENALTY_PER_ITEM: 0.1, // -0.1% per item sold when markup ≥ 40%
  HAPPINESS_BONUS_PER_ITEM: 0.1,   // +0.1% per item sold when markup ≤ 20%
};

export const HAPPINESS = {
  BUY_FROM_UMKM_BONUS: 2,        // +2% per purchase transaction from UMKM
  BUY_FROM_PT_PENALTY: 2,        // -2% per purchase transaction from PT
};

export const EVENTS = {
  GAGAL_PANEN: {
    id: "gagal_panen",
    name: "Gagal Panen Beras",
    frequency: "monthly",               // Once per month
    umkmRicePriceMultiplier: 1.5,        // +50% rice price from UMKM
    happinessPenaltyIfNotBuyUMKM: 25,    // -25% if player doesn't buy UMKM rice
  },
  BAGI_HASIL: {
    id: "bagi_hasil",
    name: "Bagi Hasil (Revenue Distribution)",
    frequency: "end_of_month",
    minPercent: 0,
    maxPercent: 10,
    // 0% → happiness -10%, 1% → +1%, 2% → +2%, ... 10% → +10%
    // Cost = (percent / 100) * MONTHLY_SAVING * memberCount
  },
  KRISIS_EKONOMI: {
    id: "krisis_ekonomi",
    name: "Krisis Ekonomi",
    frequency: "every_2_months",
    durationDays: 7,
    happinessPenaltyPerDay: 10,          // -10%/day if prices not lowered
  },
};
```

---

## 4A. Bahasa Indonesia UI Strings

> [!IMPORTANT]
> **Seluruh teks UI harus dalam Bahasa Indonesia.** Semua label, tombol, notifikasi, dan modal harus menggunakan string dari file ini. JANGAN menggunakan teks bahasa Inggris di UI.

```js
// constants/uiStrings.js

export const UI = {
  // === TOP BAR ===
  STOK_BERAS: "Beras",
  STOK_MINYAK: "Minyak",
  STOK_GAS: "Gas LPG",
  KEBAHAGIAAN: "Kebahagiaan",
  ANGGOTA: "Anggota",
  SALDO: "Saldo",

  // === SIDEBAR BUTTONS ===
  MUSEUM: "Museum",
  PASAR: "Pasar",
  HARGA: "Harga",

  // === CENTER BUILDING ===
  MASUK: "Masuk",

  // === BOTTOM BAR ===
  PINJAMAN: "Pinjaman",
  PENDAFTARAN_ANGGOTA: "Anggota Baru",
  KALENDER: "Kalender",
  PINJAMAN_AKTIF: "Pinjaman Aktif",
  AKHIRI_HARI: "Akhiri Hari",

  // === MEMBER PROFILE MODAL ===
  PROFIL_ANGGOTA: "Profil Calon Anggota",
  NAMA: "Nama",
  PEKERJAAN: "Pekerjaan",
  UMUR: "Umur",
  JENIS_KELAMIN: "Jenis Kelamin",
  LAKI_LAKI: "Laki-laki",
  PEREMPUAN: "Perempuan",
  SIMPANAN_WAJIB: "Simpanan Wajib",
  PER_BULAN: "/ bulan",
  PENDAPATAN_BULANAN: "Pendapatan Bulanan",
  BTN_TERIMA: "Terima",
  BTN_TOLAK: "Tolak",
  TAHUN: "tahun",

  // === LOAN MODAL ===
  PENGAJUAN_PINJAMAN: "Pengajuan Pinjaman",
  JUMLAH_PINJAMAN: "Jumlah Pinjaman",
  TUJUAN_PINJAMAN: "Tujuan Pinjaman",
  TENOR: "Tenor",
  BULAN: "bulan",
  BUNGA: "Bunga (%)",
  PERHITUNGAN_CICILAN: "Perhitungan Cicilan",
  POKOK_PER_BULAN: "Pokok/bulan",
  BUNGA_PER_BULAN: "Bunga/bulan",
  TOTAL_PER_BULAN: "Total/bulan",
  TOTAL_BAYAR: "Total bayar",
  BTN_SETUJUI: "Setujui",

  // === SUPPLY MARKET ===
  PASAR_PASOKAN: "Pasar Pasokan",
  PEMASOK_PT: "PT. Jaya Abadi",
  PEMASOK_UMKM: "UMKM Desa",
  BARANG: "Barang",
  HARGA_LABEL: "Harga",
  STOK: "Stok",
  JUMLAH: "Jumlah",
  BTN_BELI: "Beli",
  BERAS: "Beras",
  MINYAK_GORENG: "Minyak Goreng",
  GAS_LPG: "Gas LPG",

  // === PRICE CONTROL ===
  KONTROL_HARGA: "Kontrol Harga",
  ATUR_HARGA_JUAL: "Atur Harga Jual Koperasi",
  HARGA_BELI: "Harga Beli",
  HARGA_JUAL: "Harga Jual",
  MARKUP: "Markup %",
  EFEK: "Efek",
  BTN_SIMPAN_HARGA: "Simpan Harga",

  // === DAY END RECEIPT ===
  LAPORAN_HARIAN: "Laporan Harian",
  HARI: "Hari",
  BARANG_TERJUAL: "Barang Terjual",
  PELANGGAN_DILAYANI: "Pelanggan Dilayani",
  PELANGGAN_KECEWA: "Pelanggan Kecewa (Stok Habis)",
  TOTAL_PENDAPATAN: "Total Pendapatan",
  PERUBAHAN_KEBAHAGIAAN: "Perubahan Kebahagiaan",
  BTN_LANJUT: "Lanjut ke Hari Berikutnya →",

  // === EVENTS ===
  GAGAL_PANEN: "Gagal Panen Beras",
  GAGAL_PANEN_DESC: "Harga beras UMKM naik 50%! Beli dari UMKM untuk jaga kebahagiaan rakyat.",
  BAGI_HASIL: "Bagi Hasil Bulanan",
  BAGI_HASIL_DESC: "Saatnya membagikan hasil kepada anggota koperasi.",
  PERSEN_BAGI_HASIL: "Persentase Bagi Hasil",
  PER_ANGGOTA: "Per Anggota",
  TOTAL_BIAYA: "Total Biaya",
  EFEK_KEBAHAGIAAN: "Efek Kebahagiaan",
  BTN_KONFIRMASI: "Konfirmasi",
  KRISIS_EKONOMI: "Krisis Ekonomi",
  KRISIS_EKONOMI_DESC: "Turunkan harga jual untuk meringankan beban rakyat!",

  // === CALENDAR ===
  KALENDER_ACARA: "Kalender & Acara",
  ACARA_KHUSUS: "Acara Khusus",

  // === 3D STORE ===
  TOKO_FURNITUR: "Toko Furnitur",
  RAK_BERAS: "Rak Beras",
  RAK_MINYAK: "Rak Minyak",
  RAK_BARANG: "Rak Barang",
  KASIR: "Meja Kasir",
  KARPET: "Karpet",
  TANAMAN_HIAS: "Tanaman Hias",
  FOTO_PRABOWO: "Foto Prabowo",
  KAPASITAS_STOK: "Kapasitas Stok",
  PELANGGAN_BONUS: "Bonus Pelanggan",
  BTN_BELI_PASANG: "Beli & Pasang",
  KOSMETIK: "Kosmetik",
  PERBESAR_TOKO: "Perbesar Toko",
  KEMBALI_KE_DASHBOARD: "← Kembali",

  // === MUSEUM ===
  MUSEUM_TITLE: "Museum Koperasi Indonesia",
  HALAMAN: "Halaman",
  DARI: "dari",

  // === WIN/LOSE ===
  HASIL_AKHIR: "Hasil Akhir — Koperasi Merah Putih",
  SALDO_AKHIR: "Saldo Akhir",
  JUMLAH_ANGGOTA: "Jumlah Anggota",
  TOTAL_HARI: "Total Hari",
  TOTAL_BARANG_TERJUAL: "Total Barang Terjual",
  TOTAL_PINJAMAN: "Total Pinjaman Disalurkan",
  PINJAMAN_SUKSES: "Pinjaman Sukses",
  TOTAL_FURNITUR: "Total Furnitur",
  RATING: "Rating",
  BTN_MAIN_LAGI: "Main Lagi",
  GAME_OVER_BANGKRUT: "GAME OVER — Koperasi Bangkrut!",
  GAME_OVER_RAKYAT: "GAME OVER — Rakyat Kecewa!",

  // === NOTIFICATIONS ===
  SIMPANAN_WAJIB_NOTIF: (bulan, jumlah, count) =>
    `Simpanan Wajib bulan ${bulan}: Rp ${jumlah} dari ${count} anggota`,
  CICILAN_DITERIMA: (nama, jumlah) =>
    `Cicilan dari ${nama}: Rp ${jumlah}`,
  PINJAMAN_LUNAS: (nama) =>
    `Pinjaman ${nama} telah lunas!`,
  ANGGOTA_BARU: (nama) =>
    `${nama} bergabung sebagai anggota baru!`,

  // === MONTHS ===
  BULAN_NAMES: [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ],
};
```

---

## 5. Dashboard View (Main Screen)

The dashboard is the **primary game screen** — a 2D illustrated village scene with an overlay HUD.

### 5.1 Background Scene

A pixel-art / illustrated Indonesian village. The center building is the **Koperasi Merah Putih** store. Flanking it are traditional wooden houses, palm trees, chickens, a well, and a flagpole with the Indonesian flag.

> [!TIP]
> The background is a **static 2D image** rendered behind the HUD. It is NOT a 3D scene. Only the store interior uses Three.js.

### 5.2 HUD Layout (Overlay on Dashboard)

```
┌──────────────────────────────────────────────────────────────────────┐
│  TOP BAR (always visible)                                            │
│  ┌─────┐ ┌─────┐ ┌─────┐   ┌──────┐ ┌──────┐   ┌──────────────┐   │
│  │🍚 20│ │🛢 20│ │⛽ 20│   │😊 12%│ │👥 12│   │₨ Rp 230.000 │   │
│  └─────┘ └─────┘ └─────┘   └──────┘ └──────┘   └──────────────┘   │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   [Village scene background image]            RIGHT SIDEBAR:         │
│                                                ┌──────────┐         │
│                                                │ 🏛 Museum │         │
│              ┌─────────────────┐               ├──────────┤         │
│              │   KOPERASI      │               │ 🛒 Pasar │         │
│              │   MERAH PUTIH   │               ├──────────┤         │
│              │                 │               │ 💰 Harga │         │
│              │   [MASUK btn]   │               └──────────┘         │
│              └─────────────────┘                                     │
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
│  BOTTOM BAR                                                          │
│  ┌─────────────────────┐ ┌─────────────────────┐ ┌────────┐ ┌─────┐│
│  │ PINJAMAN (Loans)    │ │ ANGGOTA (Members)    │ │Calendar│ │Loan ││
│  │ [avatar][avatar]    │ │ [avatar][avatar]...  │ │June 24 │ │Track││
│  │ (max 2 cards/day)   │ │ (max 5 cards/day)    │ │ 2026   │ │     ││
│  └─────────────────────┘ └─────────────────────┘ └────────┘ └─────┘│
│                                                                      │
│                        [ ⏭ END DAY ]                                │
└──────────────────────────────────────────────────────────────────────┘
```

### 5.3 Dashboard Interactive Elements

| Element | Location | Click Action |
|---|---|---|
| **Stock counters** (🍚🛢⛽) | Top-left | Tooltip showing capacity vs current |
| **Happiness %** (😊) | Top-center | Tooltip showing factors |
| **Member count** (👥) | Top-center | Opens member list modal |
| **Money** (₨) | Top-right | Opens financial summary modal |
| **Museum** button | Right sidebar | Opens Museum/E-Learning panel |
| **Pasar** (Market) button | Right sidebar | Opens Supply Market (buy goods from suppliers) |
| **Harga** (Price) button | Right sidebar | Opens Price Control panel |
| **MASUK** button | Center building | Enters 3D store interior (Three.js scene) |
| **Pinjaman** section | Bottom-left | Shows today's loan requests (max 2) |
| **Anggota** section | Bottom-center | Shows today's member applications (max 5) |
| **Calendar** | Bottom-right area | Opens calendar with events |
| **Active Loan** | Bottom-right | Opens active loan monitoring |
| **END DAY** button | Bottom-center | Advances to next day, triggers sales calculation |

---

## 6A. NPC Database (Hardcoded Characters)

> [!IMPORTANT]
> The game uses **8 hardcoded NPC characters**. These NPCs are the ONLY characters who can appear as member applicants and loan requesters. Their avatars are reused — each NPC has a unique pre-generated avatar image.

### 6A.1 NPC Profiles — Complete Data

```js
// data/npcData.js

export const NPC_DATABASE = [
  // === MALE NPCs (4) ===
  {
    id: "npc_m1",
    nama: "Budi Santoso",
    pekerjaan: "Petani Padi",
    umur: 45,
    jenisKelamin: "Laki-laki",
    pendapatanBulanan: 2_500_000,
    simpananWajib: 50_000,
    avatar: "/assets/avatars/male_1_budi.jpg",
    loanTemplates: [
      {
        tujuan: "Memperluas sawah padi",
        jumlah: 1_000_000,
        tenor: 5,    // bulan
        barangTerkait: "rice",
      },
      {
        tujuan: "Membeli bibit padi unggul",
        jumlah: 500_000,
        tenor: 3,
        barangTerkait: "rice",
      },
    ],
  },
  {
    id: "npc_m2",
    nama: "Ahmad Wijaya",
    pekerjaan: "Pedagang Kelontong",
    umur: 38,
    jenisKelamin: "Laki-laki",
    pendapatanBulanan: 3_000_000,
    simpananWajib: 50_000,
    avatar: "/assets/avatars/male_2_ahmad.jpg",
    loanTemplates: [
      {
        tujuan: "Menambah stok dagangan",
        jumlah: 1_500_000,
        tenor: 6,
        barangTerkait: null,  // general commerce, no specific good
      },
      {
        tujuan: "Renovasi toko",
        jumlah: 2_000_000,
        tenor: 8,
        barangTerkait: null,
      },
    ],
  },
  {
    id: "npc_m3",
    nama: "Hendra Kusuma",
    pekerjaan: "Nelayan",
    umur: 42,
    jenisKelamin: "Laki-laki",
    pendapatanBulanan: 2_000_000,
    simpananWajib: 50_000,
    avatar: "/assets/avatars/male_3_hendra.jpg",
    loanTemplates: [
      {
        tujuan: "Membeli jaring baru",
        jumlah: 800_000,
        tenor: 4,
        barangTerkait: null,
      },
      {
        tujuan: "Perbaikan perahu",
        jumlah: 1_200_000,
        tenor: 5,
        barangTerkait: null,
      },
    ],
  },
  {
    id: "npc_m4",
    nama: "Dedi Prasetyo",
    pekerjaan: "Pengusaha Minyak Goreng",
    umur: 35,
    jenisKelamin: "Laki-laki",
    pendapatanBulanan: 2_800_000,
    simpananWajib: 50_000,
    avatar: "/assets/avatars/male_4_dedi.jpg",
    loanTemplates: [
      {
        tujuan: "Menambah produksi minyak goreng",
        jumlah: 1_500_000,
        tenor: 6,
        barangTerkait: "cookingOil",
      },
      {
        tujuan: "Membeli mesin press kelapa",
        jumlah: 2_000_000,
        tenor: 8,
        barangTerkait: "cookingOil",
      },
    ],
  },

  // === FEMALE NPCs (4) ===
  {
    id: "npc_f1",
    nama: "Siti Aminah",
    pekerjaan: "Penjahit",
    umur: 32,
    jenisKelamin: "Perempuan",
    pendapatanBulanan: 1_800_000,
    simpananWajib: 50_000,
    avatar: "/assets/avatars/female_1_siti.jpg",
    loanTemplates: [
      {
        tujuan: "Membeli mesin jahit baru",
        jumlah: 700_000,
        tenor: 4,
        barangTerkait: null,
      },
      {
        tujuan: "Membeli kain untuk pesanan",
        jumlah: 500_000,
        tenor: 3,
        barangTerkait: null,
      },
    ],
  },
  {
    id: "npc_f2",
    nama: "Dewi Lestari",
    pekerjaan: "Guru SD",
    umur: 40,
    jenisKelamin: "Perempuan",
    pendapatanBulanan: 3_500_000,
    simpananWajib: 50_000,
    avatar: "/assets/avatars/female_2_dewi.jpg",
    loanTemplates: [
      {
        tujuan: "Biaya pendidikan anak",
        jumlah: 1_000_000,
        tenor: 5,
        barangTerkait: null,
      },
      {
        tujuan: "Renovasi rumah",
        jumlah: 3_000_000,
        tenor: 10,
        barangTerkait: null,
      },
    ],
  },
  {
    id: "npc_f3",
    nama: "Rina Wulandari",
    pekerjaan: "Pedagang Pasar",
    umur: 36,
    jenisKelamin: "Perempuan",
    pendapatanBulanan: 2_200_000,
    simpananWajib: 50_000,
    avatar: "/assets/avatars/female_3_rina.jpg",
    loanTemplates: [
      {
        tujuan: "Menambah modal usaha sayur",
        jumlah: 600_000,
        tenor: 3,
        barangTerkait: null,
      },
      {
        tujuan: "Sewa lapak pasar baru",
        jumlah: 1_000_000,
        tenor: 5,
        barangTerkait: null,
      },
    ],
  },
  {
    id: "npc_f4",
    nama: "Kartini Putri",
    pekerjaan: "Pengusaha Gas LPG",
    umur: 44,
    jenisKelamin: "Perempuan",
    pendapatanBulanan: 2_000_000,
    simpananWajib: 50_000,
    avatar: "/assets/avatars/female_4_kartini.jpg",
    loanTemplates: [
      {
        tujuan: "Menambah stok tabung gas",
        jumlah: 1_500_000,
        tenor: 5,
        barangTerkait: "lpgGas",
      },
      {
        tujuan: "Membeli kendaraan distribusi gas",
        jumlah: 3_000_000,
        tenor: 10,
        barangTerkait: "lpgGas",
      },
    ],
  },
];
```

### 6A.2 Avatar Assignments

| NPC ID | Nama | Jenis Kelamin | Pekerjaan | Avatar File |
|---|---|---|---|---|
| `npc_m1` | Budi Santoso | Laki-laki | Petani Padi | `male_1_budi.jpg` |
| `npc_m2` | Ahmad Wijaya | Laki-laki | Pedagang Kelontong | `male_2_ahmad.jpg` |
| `npc_m3` | Hendra Kusuma | Laki-laki | Nelayan | `male_3_hendra.jpg` |
| `npc_m4` | Dedi Prasetyo | Laki-laki | Pengusaha Minyak Goreng | `male_4_dedi.jpg` |
| `npc_f1` | Siti Aminah | Perempuan | Penjahit | `female_1_siti.jpg` |
| `npc_f2` | Dewi Lestari | Perempuan | Guru SD | `female_2_dewi.jpg` |
| `npc_f3` | Rina Wulandari | Perempuan | Pedagang Pasar | `female_3_rina.jpg` |
| `npc_f4` | Kartini Putri | Perempuan | Pengusaha Gas LPG | `female_4_kartini.jpg` |

### 6A.3 NPC Reuse Rules

- The 8 NPCs are the **complete pool** of characters in the game.
- When generating daily member applications, the system picks randomly from NPCs that are **NOT yet approved members**.
- Once all 8 NPCs have been accepted, no more member applications will appear.
- NPCs who are denied can re-appear on future days.
- Avatar images are **reused across the game** — each NPC always shows the same avatar.

> [!TIP]
> The NPC data includes `loanTemplates[]` — predefined loan scenarios tied to each character's job. NPC `npc_m1` (Budi, Petani Padi) will always request loans related to rice farming. NPC `npc_m4` (Dedi, Pengusaha Minyak Goreng) will request loans related to cooking oil production. This connects the **Simpan Pinjam** system to the **supply chain** — successful loans from relevant NPCs reduce UMKM prices for their related goods.

---

## 6. Sistem Anggota (Member System)

### 6.1 Data Model

```ts
type Member = {
  id: string;                  // NPC ID from NPC_DATABASE (e.g., "npc_m1")
  nama: string;                // NPC name
  pekerjaan: string;           // e.g., "Petani Padi", "Pedagang", "Guru SD"
  umur: number;                // 20–60
  jenisKelamin: "Laki-laki" | "Perempuan";
  pendapatanBulanan: number;   // e.g., Rp 2.500.000
  simpananWajib: 50_000;       // Fixed Rp 50.000
  tanggalBergabung: string;    // ISO date when accepted
  avatar: string;              // Path to avatar image file
};
```

### 6.2 Alur Pendaftaran Harian (Daily Application Flow)

```
AWAL HARI (START OF DAY)
  │
  ├── Sistem memilih 1–5 NPC SECARA ACAK dari NPC_DATABASE
  │   SYARAT: NPC belum menjadi anggota (tidak ada di state.members[])
  │   (disimpan di state.pendingApplications)
  │
  ├── Setiap NPC ditampilkan sebagai kartu di BOTTOM BAR → bagian "Anggota"
  │   Kartu menampilkan: avatar, nama
  │   Kartu memiliki tombol ❌ (Tolak) dan ✅ (Terima)
  │
  ├── Pemain klik avatar → Modal Profil terbuka:
  │   ┌──────────────────────────┐
  │   │  [Avatar]                │
  │   │  Nama: Siti Aminah       │
  │   │  Pekerjaan: Penjahit     │
  │   │  Umur: 32 tahun          │
  │   │  Jenis Kelamin: Perempuan│
  │   │  Simpanan Wajib:         │
  │   │    Rp 50.000 / bulan     │
  │   │  Pendapatan Bulanan:     │
  │   │    Rp 1.800.000          │
  │   │                          │
  │   │  [TERIMA]  [TOLAK]       │
  │   └──────────────────────────┘
  │
  ├── Jika TERIMA:
  │   • state.memberCount += 1
  │   • NPC ditambahkan ke state.members[]
  │   • Kartu dihapus dari pendingApplications
  │   • NPC tidak akan muncul lagi di pendaftaran
  │
  ├── Jika TOLAK:
  │   • Kartu dihapus dari pendingApplications
  │   • NPC BISA muncul lagi di hari berikutnya
  │
  └── Pendaftaran yang belum diproses hilang di AKHIR HARI
      (NPC tersebut bisa muncul kembali di hari lain)
```

### 6.3 Penarikan Simpanan Bulanan

Pada **tanggal 1 setiap bulan**, sistem otomatis memproses:

```
simpananBulanan = state.memberCount × Rp 50.000
state.money += simpananBulanan
```

Tampilkan notifikasi: *"Simpanan Wajib bulan [Bulan]: Rp [jumlah] dari [jumlah] anggota"*

---

## 7. Sistem Simpan Pinjam (Loan System)

> [!IMPORTANT]
> **HANYA NPC yang sudah diterima sebagai anggota** (ada di `state.members[]`) yang dapat mengajukan pinjaman. NPC yang belum bergabung TIDAK BISA meminjam. Ini adalah mekanisme inti dari **Koperasi Simpan Pinjam** — anggota menabung dulu, baru bisa meminjam.

### 7.1 Data Model

```ts
type PengajuanPinjaman = {
  id: string;
  npcId: string;               // Referensi ke NPC_DATABASE (e.g., "npc_m1")
  namaAnggota: string;
  pekerjaanAnggota: string;
  pendapatanBulanan: number;
  jumlahPinjaman: number;      // e.g., Rp 1.000.000
  tujuanPinjaman: string;      // e.g., "Memperluas sawah padi"
  barangTerkait: "rice" | "cookingOil" | "lpgGas" | null;
  tenorBulan: number;          // e.g., 5 bulan
  bungaPersen: number;         // e.g., 5 (persen), DITENTUKAN PEMAIN
  status: "menunggu" | "aktif" | "lunas" | "gagal_bayar";
  avatar: string;              // NPC avatar path
};

type PinjamanAktif = PengajuanPinjaman & {
  tanggalDisetujui: string;
  sisaBulan: number;
  cicilanPerBulan: number;     // Dihitung: (jumlahPinjaman / tenorBulan) + bunga
  totalTerbayar: number;
  berhasil: boolean;           // Ditentukan saat lunas
};
```

### 7.2 Aturan Pengajuan Pinjaman (Simpan Pinjam Rules)

```
ATURAN UTAMA:
  • MINIMAL 3 pengajuan pinjaman per BULAN
  • MAKSIMAL 2 pengajuan pinjaman ditampilkan per HARI
  • HANYA anggota yang sudah diterima yang bisa mengajukan
  • Anggota yang sudah punya pinjaman aktif TIDAK bisa mengajukan lagi

DISTRIBUSI BULANAN:
  Pada awal setiap bulan, sistem menjadwalkan ≥3 pengajuan pinjaman
  yang akan muncul secara tersebar di hari-hari dalam bulan tersebut.
  
  Contoh distribusi untuk bulan Februari (28 hari):
  - Hari 3: 1 pengajuan dari Budi (npc_m1)
  - Hari 12: 1 pengajuan dari Kartini (npc_f4)
  - Hari 21: 1 pengajuan dari Ahmad (npc_m2)
  
  Jika anggota yang terdaftar > 5, sistem bisa menambah
  jumlah pengajuan per bulan (hingga 1 per anggota).
```

### 7.3 Alur Pinjaman (Loan Flow)

```
HARIAN: Sistem menampilkan 0–2 pengajuan dari ANGGOTA TERDAFTAR
  │
  ├── Ditampilkan di BOTTOM BAR → bagian "Pinjaman"
  │   Setiap kartu menampilkan: avatar NPC, nama
  │
  ├── Pemain klik kartu → Modal Detail Pinjaman:
  │   ┌────────────────────────────────┐
  │   │  📋 PENGAJUAN PINJAMAN         │
  │   │                                │
  │   │  [Avatar NPC]                  │
  │   │  Nama: Budi Santoso            │
  │   │  Pekerjaan: Petani Padi        │
  │   │  Pendapatan: Rp 2.500.000      │
  │   │  ─────────────────────────     │
  │   │  Jumlah Pinjaman: Rp 1.000.000│
  │   │  Tujuan: Memperluas sawah padi │
  │   │  Tenor: 5 bulan                │
  │   │                                │
  │   │  Bunga (%): [__5__]  ← Pemain isi sendiri
  │   │                                │
  │   │  📊 Perhitungan Cicilan:       │
  │   │  Pokok/bulan: Rp 200.000       │
  │   │  Bunga/bulan: Rp 10.000 (5%)   │
  │   │  Total/bulan: Rp 210.000       │
  │   │  Total bayar: Rp 1.050.000     │
  │   │                                │
  │   │  [SETUJUI]    [TOLAK]          │
  │   └────────────────────────────────┘
  │
  ├── Jika DISETUJUI:
  │   • state.money -= jumlahPinjaman
  │   • Pinjaman ditambahkan ke state.activeLoans[]
  │   • NPC tidak bisa mengajukan pinjaman lagi sampai lunas
  │   • Efek kebahagiaan berdasarkan bunga (lihat tabel §7.4)
  │
  ├── CICILAN BULANAN (tanggal 1 setiap bulan):
  │   Untuk setiap pinjaman aktif:
  │     cicilanBulanan = (jumlahPinjaman / tenorBulan) × (1 + bungaPersen / 100)
  │     state.money += cicilanBulanan
  │     pinjaman.sisaBulan -= 1
  │
  └── PINJAMAN LUNAS (sisaBulan mencapai 0):
      • 80% kemungkinan: berhasil = true
      • Jika berhasil DAN pinjaman punya barangTerkait:
        - Harga dasar UMKM untuk barang tersebut TURUN Rp 1.000
        - Stok harian UMKM untuk barang tersebut NAIK +3
        - Contoh: Budi (Petani Padi) lunas → harga beras UMKM turun
        - Contoh: Dedi (Pengusaha Minyak) lunas → harga minyak UMKM turun
        - Contoh: Kartini (Pengusaha Gas) lunas → harga gas UMKM turun
      • Pinjaman dipindahkan ke status "lunas"
      • NPC bisa mengajukan pinjaman baru di bulan berikutnya
```

### 7.4 Tabel Bunga & Efek Kebahagiaan

| Bunga yang Ditetapkan Pemain | Efek Kebahagiaan |
|---|---|
| 1% – 5% | Tidak ada penalti |
| 6% – 10% | -5% kebahagiaan saat disetujui |
| 11% – 15% | -10% kebahagiaan saat disetujui |
| 16%+ | -15% kebahagiaan saat disetujui |

### 7.5 Koneksi NPC ↔ Barang (Supply Chain Effect)

> [!TIP]
> Inilah inti dari mekanik **Simpan Pinjam** yang mempengaruhi **rantai pasokan**:

| NPC | Pekerjaan | Barang Terkait | Efek Jika Pinjaman Berhasil |
|---|---|---|---|
| Budi Santoso | Petani Padi | 🍚 Beras (`rice`) | Harga beras UMKM turun Rp 1.000, stok +3 |
| Dedi Prasetyo | Pengusaha Minyak | 🛢 Minyak Goreng (`cookingOil`) | Harga minyak UMKM turun Rp 1.000, stok +3 |
| Kartini Putri | Pengusaha Gas | ⛽ Gas LPG (`lpgGas`) | Harga gas UMKM turun Rp 1.000, stok +3 |
| Ahmad, Hendra, Siti, Dewi, Rina | Lainnya | ❌ Tidak ada | Tidak ada efek pada harga barang |

---

## 8. Supply / Market System (Pasar)

### 8.1 Supplier Board UI

When player clicks **"Pasar"** (cart icon), a modal opens showing two tabs:

```
┌──────────────────────────────────────────────────────┐
│  PASAR PASOKAN                                        │
│  ┌─────────────────────┐ ┌─────────────────────┐     │
│  │  PT. Jaya Abadi     │ │  UMKM Desa          │     │
│  └─────────────────────┘ └─────────────────────┘     │
│                                                        │
│  ┌────────────────────────────────────────────────┐   │
│  │ Item          │ Price    │ Stock │ Qty │ Buy   │   │
│  ├───────────────┼──────────┼───────┼─────┼───────┤   │
│  │ Beras (Rice)  │ Rp15.000 │ 20    │ [_] │ [BUY] │   │
│  │ Minyak Goreng │ Rp27.000 │ 20    │ [_] │ [BUY] │   │
│  │ Gas LPG       │ Rp30.000 │ 20    │ [_] │ [BUY] │   │
│  └────────────────────────────────────────────────┘   │
│                                                        │
│  💰 Saldo: Rp 230.000                                │
└──────────────────────────────────────────────────────┘
```

### 8.2 Supplier Rules

| Rule | PT. Jaya Abadi | UMKM Desa |
|---|---|---|
| **Rice price** | Rp 15.000 (fixed forever) | Rp 16.000 ± Rp 5.000 (random daily) |
| **Oil price** | Rp 27.000 (fixed forever) | Rp 29.000 ± Rp 5.000 (random daily) |
| **LPG price** | Rp 30.000 (fixed forever) | Rp 35.000 ± Rp 5.000 (random daily) |
| **Daily stock** | 20 per item (resets daily) | 10 per item base (resets daily, can increase via successful loans) |
| **Happiness effect** | **-2% per purchase transaction** | **+2% per purchase transaction** |
| **Stock reset** | Every new day | Every new day |

### 8.3 Purchase Logic

```
When player buys N units of item X from supplier S:
  1. Validate: N ≤ supplier's remaining stock for X
  2. Validate: N + current stock[X] ≤ stockCapacity[X]
  3. Validate: money ≥ N × price
  4. Deduct: money -= N × price
  5. Add: stock[X] += N
  6. Reduce: supplierStock[S][X] -= N
  7. Track: purchasePrices[X][lastS] = price (for markup % calculation)
  8. Happiness: apply +2% (UMKM) or -2% (PT) per transaction
```

---

## 9. Price Control System (Harga)

### 9.1 UI Layout

```
┌──────────────────────────────────────────────────────────────┐
│  KONTROL HARGA - Set Your Selling Prices                      │
│                                                                │
│  ┌──────────┬──────────┬────────────┬───────────┬───────────┐ │
│  │ Item     │ Buy Price│ Sell Price │ Markup %  │ Effect    │ │
│  ├──────────┼──────────┼────────────┼───────────┼───────────┤ │
│  │ Beras    │ Rp15.000 │ [Rp_____] │ +6.7%     │ 😊 +0.1% │ │
│  │ Minyak   │ Rp27.000 │ [Rp_____] │ +29.6%    │ 😊 +0.1% │ │
│  │ Gas LPG  │ Rp30.000 │ [Rp_____] │ +16.7%    │ 😊 +0.1% │ │
│  └──────────┴──────────┴────────────┴───────────┴───────────┘ │
│                                                                │
│  📌 "Buy Price" shows the PT base price for reference.        │
│  📌 Markup % = ((Sell - Buy) / Buy) × 100                    │
│  📌 Markup ≥ 40%: Happiness -0.1% per item sold              │
│  📌 Markup ≤ 20%: Happiness +0.1% per item sold              │
│  📌 Between 20%–40%: No happiness effect                     │
│                                                                │
│  [SAVE PRICES]                                                │
└──────────────────────────────────────────────────────────────┘
```

### 9.2 Markup Calculation

```
markup% = ((sellingPrice - lastPurchasePrice) / lastPurchasePrice) × 100

// lastPurchasePrice = the price of the most recent purchase of that item
// (could be from PT or UMKM, whichever was last)
```

---

## 10. Day Cycle System

### 10.1 Day Progression Flow

```
┌──────────────────────────────────────────────────────┐
│              AWAL HARI (DAY START)                     │
│  1. Reset stok pemasok (PT=20, UMKM=10+)             │
│  2. Acak harga UMKM (dasar ± 5000)                   │
│  3. Ambil NPC dari pool untuk pendaftaran anggota     │
│     (1–5 NPC yang BELUM jadi anggota)                │
│  4. Cek jadwal pinjaman bulan ini                     │
│     (tampilkan 0–2 pengajuan dari ANGGOTA TERDAFTAR) │
│  5. Cek acara kalender                                │
│  6. Jika tanggal 1 → kumpulkan simpanan wajib        │
│  6b. Jika tanggal 1 → proses cicilan pinjaman        │
│  7. Jika akhir bulan → trigger Bagi Hasil            │
└──────────────────┬───────────────────────────────────┘
                   │
        Pemain berinteraksi dengan:
        • Terima/tolak anggota baru (NPC)
        • Setujui/tolak pinjaman (Simpan Pinjam)
        • Beli barang dari Pasar
        • Atur harga di Kontrol Harga
        • Kunjungi toko 3D (Masuk)
        • Lihat museum, kalender, dll.
                   │
                   ▼
┌──────────────────────────────────────────────┐
│     PEMAIN KLIK "AKHIRI HARI"                │
│                                               │
│  1. Hitung pelanggan hari ini:                │
│     totalPelanggan = jumlahKasir × 10         │
│                                               │
│  2. Setiap pelanggan beli 1 barang ACAK:      │
│     - Hanya dari barang yang stok > 0         │
│     - Acak merata (bobot sama)                │
│                                               │
│  3. Untuk setiap penjualan:                   │
│     - stok[barang] -= 1                       │
│     - pendapatan += hargaJual[barang]         │
│     - Terapkan modifier kebahagiaan           │
│       berdasarkan markup% barang tersebut     │
│                                               │
│  4. Jika pelanggan mau beli tapi stok = 0:    │
│     - Pelanggan pergi (penjualan gagal)       │
│     - kebahagiaan -= 0.5% per pelanggan       │
│                                               │
│  5. saldo += totalPendapatan                  │
│                                               │
│  6. Terapkan efek acara yang aktif            │
│     (misal Krisis: -10% kebahagiaan/hari)     │
│                                               │
│  7. Majukan tanggal +1 hari                   │
│                                               │
│  8. Tampilkan LAPORAN HARIAN                  │
└──────────────────────────────────────────────┘
```

### 10.2 End of Day Receipt UI

```
┌──────────────────────────────────────────────┐
│  📋 LAPORAN HARIAN                            │
│  Hari: 2 Januari 2026                         │
│                                               │
│  ─────────────────────────────────────────    │
│  Barang Terjual:                              │
│                                               │
│  Minyak Goreng    6 × Rp 35.000 = Rp 210.000│
│  Beras            5 × Rp 16.000 = Rp  80.000│
│  Gas LPG          4 × Rp 40.000 = Rp 160.000│
│  ─────────────────────────────────────────    │
│  Pelanggan dilayani: 15 / 20                  │
│  Pelanggan kecewa:   5 (stok habis)          │
│  ─────────────────────────────────────────    │
│  TOTAL PENDAPATAN:        Rp 450.000         │
│  Perubahan Kebahagiaan:   +1.5%              │
│  ─────────────────────────────────────────    │
│                                               │
│  [LANJUT KE HARI BERIKUTNYA →]               │
└──────────────────────────────────────────────┘
```

---

## 11. Calendar & Events System

### 11.1 Calendar UI

A scrollable monthly calendar. Days with events are highlighted. Player can click any day to see event details.

### 11.2 Event: Gagal Panen Beras (Failed Rice Harvest)

```
Trigger:    Once per month (random day between 10th–20th)
Duration:   1 day
Effects:
  • UMKM rice price × 1.5 (50% increase) for that day
  • If player does NOT buy rice from UMKM on this day:
      happiness -= 25%
  • Notification banner: "⚠️ Gagal Panen! Harga beras UMKM naik 50%!"
```

### 11.3 Event: Bagi Hasil (Revenue Distribution)

```
Trigger:    Last day of every month
Duration:   End-of-day modal before proceeding
Flow:
  1. Modal appears: "Bagi Hasil Bulanan"
  2. Shows: total members, monthly saving per member (Rp 50.000)
  3. Player inputs: percentage to distribute (0% – 10%)
  4. Preview calculation:
     • Per member payout = (percent / 100) × Rp 50.000
     • Total cost = per member payout × memberCount
     • Happiness change:
       - 0% → happiness -= 10%
       - 1% → happiness += 1%
       - 2% → happiness += 2%
       - ...
       - 10% → happiness += 10%
  5. Confirmation screen shows all stats + effects
  6. Player confirms → money deducted, happiness adjusted
```

**Example:**
- 5 members, player inputs 10%
- Per member: 10% × Rp 50.000 = Rp 5.000
- Total cost: Rp 5.000 × 5 = Rp 25.000
- Happiness: +10%

### 11.4 Event: Krisis Ekonomi (Economic Crisis)

```
Trigger:    Once every 2 months (random start day)
Duration:   7 consecutive days
Effects per day (during crisis):
  • If player's selling prices are NOT lower than purchase prices:
      happiness -= 10% per day
  • Player should sell goods BELOW cost to maintain happiness
  • Notification banner: "🔴 KRISIS EKONOMI! Turunkan harga untuk rakyat!"
```

> [!WARNING]
> During a crisis, selling below cost means the player LOSES money per sale. This is an intentional design tension — the player must sacrifice profit for community happiness, mirroring real cooperative values.

---

## 12. 3D Store Interior (Three.js)

### 12.1 When Does This Render?

Only when the player clicks **"MASUK"** on the main building. The React app transitions from the 2D Dashboard view to a full-screen Three.js canvas.

### 12.2 Scene Setup

```
Camera:    Perspective, top-down isometric angle (~45°)
Controls:  OrbitControls (rotate, zoom, pan)
Lighting:  Ambient + 2 directional lights (warm tone)
Floor:     Plane geometry with tile texture
Walls:     4 walls, paintings can be placed on walls
Ceiling:   Optional subtle geometry
```

### 12.3 Furniture Interaction

| Action | Input | Behavior |
|---|---|---|
| **Select** | Click furniture | Highlight with glow outline, show info tooltip |
| **Move** | Drag (after select) | Snap to grid (0.5m grid), prevent overlap |
| **Rotate** | R key or rotate button | 90° increments |
| **Change Color** | Color picker in sidebar | Apply material color tint |
| **Delete** | Delete button | Return to inventory (no refund) |

### 12.4 Furniture Shop (Sidebar)

When inside the 3D view, a sidebar shows available furniture to purchase:

```
┌─────────────────────┐
│  🏪 TOKO FURNITUR   │
│                     │
│  [Rice Rack]        │
│  Rp 500.000         │
│  Stock cap: +10 🍚  │
│  [BUY & PLACE]      │
│                     │
│  [Oil Rack]         │
│  Rp 600.000         │
│  Stock cap: +10 🛢  │
│  [BUY & PLACE]      │
│                     │
│  ... etc            │
│                     │
│  ── COSMETICS ──    │
│  [Carpet] 0/3       │
│  Rp 700.000         │
│  Happiness +5%      │
│  [BUY & PLACE]      │
│                     │
│  ── UPGRADE ──      │
│  [Expand Store]     │
│  Rp 20.000.000      │
│  10×15 → 20×30      │
│  [UPGRADE]          │
│                     │
│  [← BACK TO DASH]   │
└─────────────────────┘
```

### 12.5 Starting Layout

The store starts with:
- 2 × Rice Rack (placed along back wall)
- 2 × Oil Rack (placed along side wall)
- 1 × Cashier Counter (placed near entrance)
- 0 cosmetic items

---

## 13. Museum / E-Learning System

### 13.1 Content Structure

A horizontal scrollable timeline (swipeable) teaching the history of cooperatives in Indonesia:

```
┌───────────────────────────────────────────────────────────────┐
│  🏛 MUSEUM KOPERASI INDONESIA                                 │
│                                                               │
│  ◄ [slide] ──────────────●───────────── [slide] ►            │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                                                         │ │
│  │  📅 1896 — Awal Mula                                   │ │
│  │                                                         │ │
│  │  Patih R. Aria Wiriaatmaja mendirikan Bank Penolong     │ │
│  │  dan Tabungan (Hulp- en Spaarbank) di Purwokerto,      │ │
│  │  dianggap sebagai cikal bakal koperasi Indonesia.       │ │
│  │                                                         │ │
│  │  [illustration]                                         │ │
│  │                                                         │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ● ○ ○ ○ ○ ○ ○ ○                    Page 1 of 8             │
└───────────────────────────────────────────────────────────────┘
```

### 13.2 Timeline Entries (Data)

| Year | Title | Description |
|---|---|---|
| 1896 | Awal Mula | Bank Penolong dan Tabungan di Purwokerto oleh Patih R. Aria Wiriaatmaja |
| 1908 | Budi Utomo | Gerakan nasional yang mendorong koperasi sebagai alat pemberdayaan |
| 1927 | Verordening op de Cooperatieve Vereenigingen | Aturan koperasi pertama dari Belanda |
| 1945 | Pasal 33 UUD 1945 | Koperasi masuk dalam konstitusi Indonesia |
| 1947 | Kongres Koperasi Pertama | 12 Juli ditetapkan sebagai Hari Koperasi Nasional |
| 1958 | UU No. 79 Tahun 1958 | Undang-undang koperasi pertama di Indonesia merdeka |
| 1967–1992 | Era Orde Baru | Koperasi Unit Desa (KUD) menjadi pilar ekonomi desa |
| 2025 | Koperasi Merah Putih | Program Presiden Prabowo: 80.000 koperasi desa di seluruh Indonesia |

---

## 14. Win / Lose Conditions

### 14.1 Game End

The game ends on **December 31, 2026** (day 365).

### 14.2 Win Condition

The player wins if ALL of the following are true on the final day:

| Metric | Threshold |
|---|---|
| **Money** | ≥ Rp 10.000.000 |
| **Members** | ≥ 50 |
| **Happiness** | ≥ 60% |

### 14.3 Lose Condition (Early Game Over)

The game ends early if:
- **Money** drops below Rp 0 (bankrupt)
- **Happiness** drops to 0% (community revolt)

### 14.4 Score Breakdown (End Screen)

```
┌──────────────────────────────────────────────┐
│  🏆 HASIL AKHIR — KOPERASI MERAH PUTIH       │
│                                               │
│  Saldo Akhir:     Rp 15.230.000    ✅        │
│  Jumlah Anggota:  67                ✅        │
│  Kebahagiaan:     72%               ✅        │
│                                               │
│  ── STATISTIK ──                              │
│  Total Hari:              365                 │
│  Total Barang Terjual:    4.230               │
│  Total Pinjaman Disalurkan: 12                │
│  Pinjaman Sukses:         10 (83%)            │
│  Total Furnitur:          18                  │
│                                               │
│  RATING: ⭐⭐⭐⭐ (HEBAT!)                   │
│                                               │
│  [MAIN LAGI]                                  │
└──────────────────────────────────────────────┘
```

---

## 15. Happiness System — Complete Reference

> [!IMPORTANT]
> Happiness is clamped to **0–100%**. All modifiers are additive. Process them in order each day.

| Source | Effect | When |
|---|---|---|
| Buy from UMKM | +2% per transaction | On purchase |
| Buy from PT | -2% per transaction | On purchase |
| Sell at markup ≤ 20% | +0.1% per item sold | End of day |
| Sell at markup ≥ 40% | -0.1% per item sold | End of day |
| Customer can't buy (out of stock) | -0.5% per lost customer | End of day |
| Loan interest ≤ 5% | No effect | On approval |
| Loan interest 6–10% | -5% | On approval |
| Loan interest 11–15% | -10% | On approval |
| Loan interest 16%+ | -15% | On approval |
| Gagal Panen — didn't buy UMKM rice | -25% | Event day |
| Bagi Hasil — 0% distribution | -10% | End of month |
| Bagi Hasil — N% distribution (1–10) | +N% | End of month |
| Krisis Ekonomi — prices not lowered | -10% per day | During crisis |
| Carpet purchased | +5% (one-time) | On purchase |
| Indoor Plant purchased | +5% (one-time) | On purchase |
| Prabowo Picture purchased | +10% (one-time) | On purchase |

---

## 16. Starting State Summary

| Variable | Starting Value |
|---|---|
| Date | January 1, 2026 |
| Money | Rp 5.000.000 |
| Happiness | 50% |
| Members | 0 |
| Rice Stock | 20 |
| Cooking Oil Stock | 20 |
| LPG Gas Stock | 20 |
| Rice Racks | 2 |
| Oil Racks | 2 |
| Goods Racks | 0 |
| Cashiers | 1 |
| Cosmetic Furniture | 0 each |
| Store Size | 10m × 15m |
| Active Loans | 0 |

---

## 17. Implementation Order (for AI Agents)

> [!CAUTION]
> Build in this EXACT order. Each phase depends on the previous one. Do NOT skip ahead.

### Phase 1 — Foundation
1. Initialize React + Vite project
2. Set up Zustand store with full state shape (§3)
3. Create constants file (§4)
4. Create `formatRupiah()` utility
5. Build basic app shell with view routing (Dashboard ↔ 3D Store)

### Phase 2 — Dashboard & HUD
6. Create Dashboard component with background image
7. Build TopBar (stock counters, happiness, members, money)
8. Build Bottom Bar (member cards, loan cards, calendar, active loan)
9. Build right sidebar buttons (Museum, Pasar, Harga)
10. Build "End Day" button (no logic yet, just UI)

### Phase 3 — Core Systems
11. Implement Day System (day advancement, date tracking)
12. Implement Member System (generation, accept/deny, monthly savings)
13. Implement Loan System (generation, approval, interest, repayment)
14. Implement Supply System (buy from PT/UMKM, stock management)
15. Implement Price Control (selling price input, markup calculation)
16. Implement Sales Engine (end-of-day customer simulation)
17. Implement End of Day Receipt

### Phase 4 — Events
18. Implement Calendar UI
19. Implement Gagal Panen event
20. Implement Bagi Hasil event
21. Implement Krisis Ekonomi event

### Phase 5 — 3D Store
22. Set up React Three Fiber canvas
23. Create store floor and walls
24. Create 3D furniture models (simple box geometry with textures)
25. Implement furniture placement (drag, rotate, snap)
26. Implement furniture shop sidebar
27. Implement store upgrade (size change)
28. Implement color picker for furniture

### Phase 6 — Museum
29. Create museum timeline data
30. Build swipeable carousel UI

### Phase 7 — Polish
31. Win/Lose condition checks
32. End game score screen
33. Animations (day transition, receipt reveal)
34. Sound effects
35. Responsive layout adjustments
36. Tutorial / first-day walkthrough

---

## 18. Key Technical Decisions

| Decision | Choice | Rationale |
|---|---|---|
| State management | Zustand | Lightweight, no boilerplate, works well with R3F |
| 3D framework | React Three Fiber (R3F) | React-native integration, declarative Three.js |
| Routing | No router needed | Simple state-based view switching (dashboard ↔ store3d ↔ modals) |
| Styling | CSS Modules or vanilla CSS | Keep it simple, no Tailwind |
| Furniture models | Procedural (BoxGeometry + textures) | Avoids .glb loading complexity for MVP |
| Random generation | Seeded PRNG | Reproducible runs for testing |
| Date handling | day.js or native Date | Lightweight date math |

---

## Open Questions

> [!IMPORTANT]
> These questions need your input before implementation begins:

1. **Ambang batas menang** — Saya mengusulkan Rp 10.000.000 / 50 anggota / 60% kebahagiaan sebagai syarat menang. Tapi dengan hanya 8 NPC, batas anggota 50 tidak mungkin tercapai. Haruskah saya turunkan ke **8 anggota** (semua NPC bergabung), atau apakah kamu ingin menambah jumlah NPC?

2. **Uang awal** — Saya tetapkan Rp 5.000.000 sebagai modal awal. Apakah ini sesuai keinginanmu?

3. **Tingkat keberhasilan pinjaman** — Saya tetapkan 80% kemungkinan sukses. Apakah perlu bisa diatur, atau 80% sudah pas?

4. **Kapasitas stok Gas LPG** — Kamu menyebut rak beras dan rak minyak menambah +10, rak barang +3 untuk beras dan minyak. Apa yang menambah kapasitas LPG? Apakah perlu furnitur "Rak Gas" khusus?

5. **Kebahagiaan dari pembelian UMKM/PT** — Saya tetapkan ±2% per transaksi. Apakah ini tepat, atau harusnya per item yang dibeli?

6. **Museum** — Apakah museum murni edukasi (baca saja), atau harus ada kuis atau konten yang bisa di-unlock?

7. **Avatar NPC** — Saya sudah generate 2 dari 8 avatar. Layanan gambar sedang penuh kapasitas. Saya akan terus mencoba generate sisanya. Apakah gaya avatar kartun seperti yang sudah dibuat sudah sesuai keinginanmu?
