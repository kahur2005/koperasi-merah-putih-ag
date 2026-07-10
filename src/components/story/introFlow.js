export function getPrimaryActionLabel(index, totalBeats) {
  return index === totalBeats - 1 ? 'Mulai Mengelola' : 'Lanjut';
}

export function getStoryTransition(index, totalBeats, { skip = false } = {}) {
  if (skip || index === totalBeats - 1) {
    return { type: 'complete' };
  }

  return { type: 'advance', index: index + 1 };
}
