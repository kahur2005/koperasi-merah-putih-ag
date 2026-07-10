import assert from 'node:assert/strict';
import test from 'node:test';
import { useGameStore } from './gameStore.js';

const resetTo = (patch = {}) => {
  useGameStore.getState().resetGame();
  useGameStore.setState({
    notifications: [],
    storyFlags: {},
    currentStoryMoment: null,
    storyQueue: [],
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
