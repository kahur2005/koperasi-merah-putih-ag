import { WIN_CONDITIONS } from '../../constants/gameConstants.js';

export function getCombinedStockLabel(stock, stockCapacity) {
  return [
    `Beras: ${stock.rice || 0}/${stockCapacity.rice || 0}`,
    `Minyak: ${stock.cookingOil || 0}/${stockCapacity.cookingOil || 0}`,
    `Gas: ${stock.lpgGas || 0}/${stockCapacity.lpgGas || 0}`,
  ].join('   ');
}

function getLowestStock(stock, capacity) {
  return [
    { key: 'rice', label: 'beras' },
    { key: 'cookingOil', label: 'minyak' },
    { key: 'lpgGas', label: 'gas LPG' },
  ].map((item) => {
    const cap = capacity[item.key] || 0;
    const value = stock[item.key] || 0;

    return {
      ...item,
      cap,
      value,
      ratio: cap > 0 ? value / cap : 0,
    };
  }).sort((a, b) => a.ratio - b.ratio)[0];
}

export function getDashboardAdvisory(state, chapterProgress) {
  const { activeChapter, nextGoal } = chapterProgress || {};
  const lowestStock = getLowestStock(state.stock, state.stockCapacity);
  const targetHappiness = WIN_CONDITIONS.HAPPINESS || 60;

  let advisory = {
    title: activeChapter?.title || 'Koperasi Merah Putih',
    body: activeChapter
      ? `Fokus bab ini: ${nextGoal?.label || 'selesaikan target koperasi'}. ${activeChapter.summary}`
      : 'Lanjutkan pengelolaan koperasi untuk melayani warga desa.',
    action: nextGoal?.id === 'money' || nextGoal?.id === 'stock' || nextGoal?.id === 'capacity' ? 'Buka Pasar' : 'Masuk Toko',
    actionType: nextGoal?.id === 'money' || nextGoal?.id === 'stock' || nextGoal?.id === 'capacity' ? 'pasar' : 'store3d',
  };

  if (state.gamePhase === 'restockPhase') {
    advisory = {
      title: 'Fase restok pasokan',
      body: 'Toko masih tutup. Isi stok secara manual atau otomatis sebelum membuka hari baru.',
      action: 'Buka Pasar',
      actionType: 'pasar',
    };
  } else if (state.activeEvents.some((event) => event.type === 'gagalPanen')) {
    advisory = {
      title: 'Gagal panen sedang terjadi',
      body: 'Prioritaskan belanja dari UMKM agar petani tetap terbantu dan kebahagiaan warga tidak jatuh.',
      action: 'Buka Pasar',
      actionType: 'pasar',
    };
  } else if (state.activeEvents.some((event) => event.type === 'krisisEkonomi')) {
    advisory = {
      title: 'Krisis ekonomi aktif',
      body: 'Cek harga jual. Saat krisis, harga yang terlalu tinggi cepat membuat warga kecewa.',
      action: 'Atur Harga',
      actionType: 'harga',
    };
  } else if (state.pendingApplications.length > 0) {
    advisory = {
      title: `${state.pendingApplications.length} calon anggota menunggu`,
      body: 'Anggota baru menambah simpanan wajib dan memperkuat koperasi untuk target akhir tahun.',
      action: 'Lihat Anggota',
      actionType: 'pinjamanAktifList',
    };
  } else if (state.pendingLoanRequests.length > 0) {
    advisory = {
      title: `${state.pendingLoanRequests.length} pengajuan pinjaman`,
      body: 'Pinjaman bisa menghidupkan usaha anggota, tapi bunga tinggi menurunkan kepercayaan.',
      action: 'Tinjau Pinjaman',
      actionType: 'pinjamanAktifList',
    };
  } else if (lowestStock.cap > 0 && lowestStock.ratio < 0.35) {
    advisory = {
      title: `Stok ${lowestStock.label} mulai tipis`,
      body: `Gudang hanya berisi ${lowestStock.value}/${lowestStock.cap}. Tutup toko dulu, lalu restok sebelum hari baru dibuka.`,
      action: 'Buka Pasar',
      actionType: 'pasar',
    };
  } else if (state.happiness < targetHappiness) {
    advisory = {
      title: 'Kepercayaan warga perlu dijaga',
      body: `Kebahagiaan ${state.happiness}%. Beli dari UMKM, jaga harga, dan bantu anggota agar menuju target ${targetHappiness}%.`,
      action: 'Atur Harga',
      actionType: 'harga',
    };
  }

  return advisory;
}
