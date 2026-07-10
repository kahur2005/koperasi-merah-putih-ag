import assert from 'node:assert/strict';
import test from 'node:test';
import { getPrimaryActionLabel, getStoryTransition } from './introFlow.js';

test('uses Lanjut until the final story beat', () => {
  assert.equal(getPrimaryActionLabel(0, 3), 'Lanjut');
  assert.equal(getPrimaryActionLabel(1, 3), 'Lanjut');
});

test('uses Mulai Mengelola for the final story beat', () => {
  assert.equal(getPrimaryActionLabel(2, 3), 'Mulai Mengelola');
});

test('advances to the following beat before the story ends', () => {
  assert.deepEqual(getStoryTransition(1, 3), { type: 'advance', index: 2 });
});

test('completes the story on the final beat', () => {
  assert.deepEqual(getStoryTransition(2, 3), { type: 'complete' });
});

test('skipping completes the story immediately', () => {
  assert.deepEqual(getStoryTransition(0, 3, { skip: true }), { type: 'complete' });
});
