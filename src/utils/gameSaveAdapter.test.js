import assert from 'node:assert/strict';
import test from 'node:test';
import { createGameLoadPatch, createGameSaveSnapshot } from './gameSaveAdapter.js';

test('save snapshot keeps game progression and excludes transient UI state', () => {
  const snapshot = createGameSaveSnapshot({
    currentDate: '2026-01-05',
    dayNumber: 5,
    money: 1_250_000,
    happiness: 64,
    memberCount: 3,
    stock: { rice: 7, cookingOil: 3, lpgGas: 1 },
    furniture: { cashier: 1, riceRack: 1 },
    furniturePositions: [{ id: 'rack-1', type: 'riceRack', x: 10, y: 20 }],
    storyIntroSeen: true,
    storyFlags: { welcome_mission: true },
    gamePhase: 'restockPhase',
    activeModal: 'pasar',
    notifications: [{ id: 'toast', text: 'temporary' }],
    selectedNpc: { id: 'npc-1' },
    selectedLoan: { id: 'loan-1' },
    phaseTransition: { text: 'Tutup toko' },
    placementMode: { type: 'cashier' },
    restockFocusItem: 'rice',
    buySupply: () => {},
  });

  assert.equal(snapshot.dayNumber, 5);
  assert.deepEqual(snapshot.stock, { rice: 7, cookingOil: 3, lpgGas: 1 });
  assert.deepEqual(snapshot.storyFlags, { welcome_mission: true });
  assert.equal('activeModal' in snapshot, false);
  assert.equal('notifications' in snapshot, false);
  assert.equal('selectedNpc' in snapshot, false);
  assert.equal('placementMode' in snapshot, false);
  assert.equal('buySupply' in snapshot, false);
});

test('load patch accepts saved game state without function or invalid numeric values', () => {
  const patch = createGameLoadPatch({
    dayNumber: Number.NaN,
    money: 2_000_000,
    happiness: 70,
    currentView: 'store3d',
    members: [{ id: 'member-1' }],
    resetGame: () => {},
    notifications: [{ id: 'toast' }],
  });

  assert.equal('dayNumber' in patch, false);
  assert.equal(patch.money, 2_000_000);
  assert.equal(patch.currentView, 'store3d');
  assert.deepEqual(patch.members, [{ id: 'member-1' }]);
  assert.equal('resetGame' in patch, false);
  assert.equal('notifications' in patch, false);
});

test('manager mode autosaves resume at ready-to-open instead of a stale timed session', () => {
  const snapshot = createGameSaveSnapshot({
    gamePhase: 'managerMode',
    managerSession: { currentIndex: 2 },
    currentView: 'store3d',
  });

  assert.equal(snapshot.gamePhase, 'readyToOpen');
  assert.equal(snapshot.managerSession, null);
});
