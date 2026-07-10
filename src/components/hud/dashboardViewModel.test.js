import assert from 'node:assert/strict';
import test from 'node:test';
import { getCombinedStockLabel, getDashboardAdvisory } from './dashboardViewModel.js';

const baseState = {
  money: 5_000_000,
  happiness: 60,
  memberCount: 3,
  stock: { rice: 4, cookingOil: 8, lpgGas: 2 },
  stockCapacity: { rice: 10, cookingOil: 10, lpgGas: 10 },
  furniture: { cashier: 1 },
  statistics: { totalItemsSold: 0, totalLoansGiven: 0 },
  activeLoans: [],
  pendingApplications: [],
  pendingLoanRequests: [],
  activeEvents: [],
};

test('getCombinedStockLabel combines each live stock and capacity value', () => {
  assert.equal(
    getCombinedStockLabel(baseState.stock, baseState.stockCapacity),
    'Beras: 4/10   Minyak: 8/10   Gas: 2/10',
  );
});

test('getDashboardAdvisory prioritizes failed harvest over other alerts', () => {
  const advisory = getDashboardAdvisory({
    ...baseState,
    activeEvents: [{ type: 'gagalPanen' }],
    pendingApplications: [{ id: 'calon-1' }],
  });

  assert.deepEqual(advisory, {
    title: 'Gagal panen sedang terjadi',
    body: 'Prioritaskan belanja dari UMKM agar petani tetap terbantu dan kebahagiaan warga tidak jatuh.',
    action: 'Buka Pasar',
    actionType: 'pasar',
  });
});

test('getDashboardAdvisory directs the chapter stock goal to the market', () => {
  const advisory = getDashboardAdvisory({
    ...baseState,
    furniture: { cashier: 1 },
    stock: { rice: 1, cookingOil: 1, lpgGas: 1 },
  }, {
    activeChapter: {
      title: 'Stabilkan Koperasi Desa',
      summary: 'Buka toko dan layani warga.',
    },
    nextGoal: { id: 'stock', label: 'Isi 15 stok barang' },
  });

  assert.equal(advisory.action, 'Buka Pasar');
  assert.equal(advisory.actionType, 'pasar');
});

test('getDashboardAdvisory identifies the lowest low-stock item when no higher alert applies', () => {
  const advisory = getDashboardAdvisory({
    ...baseState,
    furniture: { cashier: 1 },
    statistics: { totalItemsSold: 10, totalLoansGiven: 0 },
  });

  assert.deepEqual(advisory, {
    title: 'Stok gas LPG mulai tipis',
    body: 'Gudang hanya berisi 2/10. Belanja pasokan sebelum penjualan harian.',
    action: 'Buka Pasar',
    actionType: 'pasar',
  });
});
