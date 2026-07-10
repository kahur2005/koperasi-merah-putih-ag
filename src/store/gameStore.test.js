import assert from 'node:assert/strict';
import test from 'node:test';
import { useGameStore } from './gameStore.js';
import { NPC_DATABASE } from '../data/npcData.js';
import { setSeed } from '../utils/random.js';

const resetTo = (patch = {}) => {
  useGameStore.getState().resetGame();
  useGameStore.setState({
    notifications: [],
    storyFlags: {},
    currentStoryMoment: null,
    storyQueue: [],
    pendingMorningStoryMoments: [],
    ...patch,
  });
};

test('buySupply is rejected outside the restock phase', () => {
  resetTo({
    gamePhase: 'storeOpen',
    money: 1_000_000,
    stock: { rice: 0, cookingOil: 0, lpgGas: 0 },
    stockCapacity: { rice: 10, cookingOil: 0, lpgGas: 0 },
  });

  useGameStore.getState().buySupply('PT', 'rice', 5);

  const state = useGameStore.getState();
  assert.equal(state.stock.rice, 0);
  assert.equal(state.money, 1_000_000);
});

test('manual buySupply works during the restock phase', () => {
  resetTo({
    gamePhase: 'restockPhase',
    money: 1_000_000,
    happiness: 50,
    stock: { rice: 0, cookingOil: 0, lpgGas: 0 },
    stockCapacity: { rice: 10, cookingOil: 0, lpgGas: 0 },
    supplierStockUMKM: { rice: 10, cookingOil: 0, lpgGas: 0 },
    supplierPricesUMKM: { rice: 16_000, cookingOil: 29_000, lpgGas: 35_000 },
  });

  useGameStore.getState().buySupply('UMKM', 'rice', 5);

  const state = useGameStore.getState();
  assert.equal(state.stock.rice, 5);
  assert.equal(state.supplierStockUMKM.rice, 5);
  assert.equal(state.money, 920_000);
  assert.equal(state.happiness, 52);
  assert.equal(state.boughtFromUMKMToday, true);
});

test('autoRestockSupply fills stock to capacity when possible', () => {
  resetTo({
    gamePhase: 'restockPhase',
    money: 1_000_000,
    stock: { rice: 2, cookingOil: 0, lpgGas: 0 },
    stockCapacity: { rice: 10, cookingOil: 0, lpgGas: 0 },
    supplierStockPT: { rice: 20, cookingOil: 0, lpgGas: 0 },
  });

  useGameStore.getState().autoRestockSupply('PT', 'rice');

  const state = useGameStore.getState();
  assert.equal(state.stock.rice, 10);
  assert.equal(state.supplierStockPT.rice, 12);
  assert.equal(state.money, 880_000);
});

test('autoRestockSupply partially fills when supplier stock is limited', () => {
  resetTo({
    gamePhase: 'restockPhase',
    money: 1_000_000,
    stock: { rice: 2, cookingOil: 0, lpgGas: 0 },
    stockCapacity: { rice: 10, cookingOil: 0, lpgGas: 0 },
    supplierStockPT: { rice: 3, cookingOil: 0, lpgGas: 0 },
  });

  useGameStore.getState().autoRestockSupply('PT', 'rice');

  const state = useGameStore.getState();
  assert.equal(state.stock.rice, 5);
  assert.equal(state.supplierStockPT.rice, 0);
  assert.equal(state.money, 955_000);
});

test('endDay closes the store and startNewDay enters the restock phase', () => {
  resetTo({
    gamePhase: 'storeOpen',
    furniture: { riceRack: 0, oilRack: 0, goodsRack: 0, lpgStack: 0, cashier: 0, carpet: 0, indoorPlant: 0, prabowoPicture: 0 },
    stock: { rice: 0, cookingOil: 0, lpgGas: 0 },
    stockCapacity: { rice: 0, cookingOil: 0, lpgGas: 0 },
  });

  useGameStore.getState().endDay();
  assert.equal(useGameStore.getState().gamePhase, 'closingReport');

  useGameStore.getState().startNewDay();
  assert.equal(useGameStore.getState().gamePhase, 'restockPhase');

  useGameStore.getState().openStoreForDay();
  assert.equal(useGameStore.getState().gamePhase, 'storeOpen');
});

test('startNewDay shows restock narrative before deferring new applicant cards until the store opens', () => {
  setSeed(1);
  resetTo({
    pendingApplications: NPC_DATABASE.slice(1),
  });

  useGameStore.getState().startNewDay();

  let state = useGameStore.getState();
  assert.equal(state.currentStoryMoment.speaker, 'Bu Siti');
  assert.equal(state.currentStoryMoment.title, 'Waktunya restok pasokan');
  assert.equal(state.storyQueue.length, 0);
  assert.equal(state.pendingMorningStoryMoments.length, 2);
  assert.equal(state.pendingMorningStoryMoments[0].title, 'Ada warga ingin bergabung');
  assert.equal(state.pendingMorningStoryMoments[1].title, 'Calon anggota menunggu');

  useGameStore.getState().dismissStoryMoment();
  useGameStore.getState().openStoreForDay();

  state = useGameStore.getState();
  assert.equal(state.currentStoryMoment.title, 'Ada warga ingin bergabung');
  assert.equal(state.storyQueue.length, 1);
  assert.equal(state.storyQueue[0].title, 'Calon anggota menunggu');
  assert.equal(state.pendingMorningStoryMoments.length, 0);
});

test('startNewDay summarizes multiple new applicants into one narrative pair', () => {
  setSeed(1);
  resetTo();

  useGameStore.getState().startNewDay();

  const state = useGameStore.getState();
  const applicationCards = state.pendingMorningStoryMoments.filter((moment) =>
    moment.id.startsWith('application_')
  );
  assert.equal(state.pendingApplications.length > 1, true);
  assert.equal(applicationCards.length, 2);
  assert.equal(applicationCards[0].title, 'Ada warga ingin bergabung');
  assert.match(applicationCards[0].text, /warga lain juga menunggu/);
  assert.equal(applicationCards[1].title, 'Calon anggota menunggu');
});

test('startNewDay builds narrative cards from every generated morning event', () => {
  const member = { ...NPC_DATABASE[0], hasAppliedForLoan: false };
  resetTo({
    currentDate: '2026-01-02',
    members: [member],
    memberCount: 1,
    krisisStartDay: 1,
    pendingApplications: NPC_DATABASE.slice(2),
    loanSchedule: [{
      dayNumber: 1,
      memberId: member.id,
      memberName: member.nama || member.name,
      jumlahPinjaman: 500_000,
      tenorBulan: 1,
      alasan: 'Meningkatkan produksi beras',
      barangTerkait: 'rice',
    }],
  });

  useGameStore.getState().startNewDay();

  const titles = useGameStore.getState().pendingMorningStoryMoments.map((moment) => moment.title);
  assert.deepEqual(titles, [
    'Krisis ekonomi dimulai',
    'Pengajuan modal usaha',
    'Ada warga ingin bergabung',
    'Calon anggota menunggu',
  ]);
});

test('setFurniturePosition moves selected furniture with store bounds and rotation', () => {
  resetTo({
    storeSize: 'small',
    furniturePositions: [
      { id: 'item-1', type: 'cashier', x: 50, y: 50, rotation: 0, color: '#B45309' },
    ],
  });

  useGameStore.getState().setFurniturePosition('item-1', 150, -20, 90);

  const item = useGameStore.getState().furniturePositions[0];
  assert.equal(item.x, 92);
  assert.equal(item.y, -17);
  assert.equal(item.rotation, 90);
});

test('moveFurniture keeps furniture inside upgraded store bounds', () => {
  resetTo({
    storeSize: 'large',
    furniturePositions: [
      { id: 'item-1', type: 'cashier', x: 50, y: 50, rotation: 0, color: '#B45309' },
    ],
  });

  useGameStore.getState().moveFurniture('item-1', -999, 999);

  const item = useGameStore.getState().furniturePositions[0];
  assert.equal(item.x, -42);
  assert.equal(item.y, 192);
});
