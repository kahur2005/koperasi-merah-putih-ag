// ============================================================
// gameConstants.js — Semua angka ajaib permainan
// ============================================================

export const GAME = {
  START_DATE: '2026-01-01',
  END_DATE: '2026-12-31',
  STARTING_MONEY: 5_000_000,
  STARTING_HAPPINESS: 50,
  STARTING_STOCK: { rice: 0, cookingOil: 0, lpgGas: 0 },
};

export const MEMBERS = {
  MAX_APPLICATIONS_PER_DAY: 5,
  MONTHLY_SAVING: 50_000,
  TOTAL_NPC_COUNT: 8,
};

export const LOANS = {
  MIN_REQUESTS_PER_MONTH: 3,
  MAX_REQUESTS_PER_DAY: 2,
  SUCCESS_RATE: 0.8,
  UMKM_PRICE_REDUCTION: 1_000,
  UMKM_STOCK_BONUS: 3,
};

export const SUPPLIERS = {
  PT: {
    name: 'PT. Jaya Abadi',
    prices: { rice: 15_000, cookingOil: 27_000, lpgGas: 30_000 },
    dailyStock: { rice: 20, cookingOil: 20, lpgGas: 20 },
  },
  UMKM: {
    name: 'UMKM Desa',
    basePrices: { rice: 16_000, cookingOil: 29_000, lpgGas: 35_000 },
    priceVariance: 5_000,
    baseDailyStock: { rice: 10, cookingOil: 10, lpgGas: 10 },
  },
};

export const FURNITURE = {
  riceRack:       { price: 500_000,  stockBonus: { rice: 10 },              maxCount: Infinity, label: 'Rak Beras' },
  oilRack:        { price: 600_000,  stockBonus: { cookingOil: 10 },        maxCount: Infinity, label: 'Rak Minyak' },
  goodsRack:      { price: 200_000,  stockBonus: { rice: 3, cookingOil: 3 },maxCount: Infinity, label: 'Rak Barang' },
  cashier:        { price: 350_000,  customerBonus: 10,                     maxCount: Infinity, label: 'Meja Kasir' },
  carpet:         { price: 700_000,  happinessBonus: 5,                     maxCount: 3, label: 'Karpet' },
  indoorPlant:    { price: 850_000,  happinessBonus: 5,                     maxCount: 3, label: 'Tanaman Hias' },
  prabowoPicture: { price: 600_000,  happinessBonus: 10,                    maxCount: 3, label: 'Foto Prabowo' },
};

export const STORE = {
  BASE_SIZE: { width: 10, depth: 15 },
  UPGRADED_SIZE: { width: 20, depth: 30 },
  UPGRADE_COST: 20_000_000,
  BASE_CUSTOMERS_PER_CASHIER: 10,
};

export const PRICE_CONTROL = {
  HIGH_MARKUP_THRESHOLD: 0.40,
  LOW_MARKUP_THRESHOLD: 0.20,
  HAPPINESS_PENALTY_PER_ITEM: 0.1,
  HAPPINESS_BONUS_PER_ITEM: 0.1,
};

export const HAPPINESS = {
  BUY_FROM_UMKM_BONUS: 2,
  BUY_FROM_PT_PENALTY: 2,
  OUT_OF_STOCK_PENALTY: 0.5,
  MIN: 0,
  MAX: 100,
};

export const EVENTS = {
  GAGAL_PANEN: {
    id: 'gagal_panen',
    name: 'Gagal Panen Beras',
    frequency: 'monthly',
    umkmRicePriceMultiplier: 1.5,
    happinessPenaltyIfNotBuyUMKM: 25,
  },
  BAGI_HASIL: {
    id: 'bagi_hasil',
    name: 'Bagi Hasil',
    frequency: 'end_of_month',
    minPercent: 0,
    maxPercent: 10,
  },
  KRISIS_EKONOMI: {
    id: 'krisis_ekonomi',
    name: 'Krisis Ekonomi',
    frequency: 'every_2_months',
    durationDays: 7,
    happinessPenaltyPerDay: 10,
  },
};

export const WIN_CONDITIONS = {
  MONEY: 10_000_000,
  MEMBERS: 8,
  HAPPINESS: 60,
};
