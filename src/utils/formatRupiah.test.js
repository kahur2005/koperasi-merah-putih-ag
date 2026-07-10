import assert from 'node:assert/strict';
import test from 'node:test';
import { formatRupiah } from './formatRupiah.js';

test('formatRupiah never renders NaN for invalid amounts', () => {
  assert.equal(formatRupiah(Number.NaN), 'Rp 0');
  assert.equal(formatRupiah(undefined), 'Rp 0');
});
