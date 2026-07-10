import assert from 'node:assert/strict';
import test from 'node:test';
import { getSaveSlotCards } from './gameEntryViewModel.js';

test('builds continue cards for auto and manual save slots', () => {
  const cards = getSaveSlotCards({
    auto: { saveName: 'Auto Save', dayNumber: 2, money: 125000, updatedAt: '2026-07-11T00:00:00.000Z' },
    manual: { saveName: 'Manual Save', dayNumber: 5, money: 500000, updatedAt: '2026-07-11T01:00:00.000Z' },
  });

  assert.deepEqual(cards.map((card) => card.slot), ['auto', 'manual']);
  assert.equal(cards[0].title, 'Continue Autosave');
  assert.equal(cards[0].subtitle, 'Hari 2 - Rp 125.000');
  assert.equal(cards[1].title, 'Continue Manual Save');
  assert.equal(cards[1].subtitle, 'Hari 5 - Rp 500.000');
});

test('omits missing save slots', () => {
  const cards = getSaveSlotCards({
    auto: null,
    manual: { saveName: 'Manual Save', dayNumber: 4, money: null },
  });

  assert.equal(cards.length, 1);
  assert.equal(cards[0].slot, 'manual');
  assert.equal(cards[0].subtitle, 'Hari 4 - Saldo belum tercatat');
});
