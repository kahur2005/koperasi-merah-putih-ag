function formatSaveSubtitle(save) {
  if (!save) return 'Belum ada save untuk akun ini.';
  const day = save.dayNumber ? `Hari ${save.dayNumber}` : 'Hari belum tercatat';
  const money = Number.isFinite(save.money)
    ? `Rp ${Number(save.money).toLocaleString('id-ID')}`
    : 'Saldo belum tercatat';
  return `${day} - ${money}`;
}

export function getSaveSlotCards(saves = {}) {
  const slots = [
    { slot: 'auto', title: 'Continue Autosave', save: saves.auto },
    { slot: 'manual', title: 'Continue Manual Save', save: saves.manual },
  ];

  return slots
    .filter((entry) => !!entry.save)
    .map((entry) => ({
      slot: entry.slot,
      title: entry.title,
      subtitle: formatSaveSubtitle(entry.save),
      updatedAt: entry.save.updatedAt,
    }));
}

export function getEntrySummary(saves = {}) {
  const cards = getSaveSlotCards(saves);
  if (cards.length === 0) return 'Belum ada autosave atau manual save untuk akun ini.';
  if (cards.length === 1) return `${cards[0].title}: ${cards[0].subtitle}`;
  return 'Pilih autosave terbaru atau manual save yang kamu buat sendiri.';
}
