import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { WIN_CONDITIONS } from '../../constants/gameConstants';
import { getChapterProgress } from '../../data/storyChapters';
import { formatRupiah } from '../../utils/formatRupiah';

function getLowestStock(stock, capacity) {
  const entries = [
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
  });

  return entries.sort((a, b) => a.ratio - b.ratio)[0];
}

export default function AdvisoryMemo() {
  const snapshot = useGameStore((s) => s);
  const money = useGameStore((s) => s.money);
  const stock = useGameStore((s) => s.stock);
  const stockCapacity = useGameStore((s) => s.stockCapacity);
  const happiness = useGameStore((s) => s.happiness);
  const memberCount = useGameStore((s) => s.memberCount);
  const pendingApplications = useGameStore((s) => s.pendingApplications);
  const pendingLoanRequests = useGameStore((s) => s.pendingLoanRequests);
  const activeEvents = useGameStore((s) => s.activeEvents);
  const gamePhase = useGameStore((s) => s.gamePhase);
  const setActiveModal = useGameStore((s) => s.setActiveModal);
  const openRestockPanel = useGameStore((s) => s.openRestockPanel);
  const setView = useGameStore((s) => s.setView);

  const { activeChapter, nextGoal } = getChapterProgress(snapshot);
  const lowestStock = getLowestStock(stock, stockCapacity);
  const targetMoney = WIN_CONDITIONS.MONEY || 10_000_000;
  const targetMembers = WIN_CONDITIONS.MEMBERS || 8;
  const targetHappiness = WIN_CONDITIONS.HAPPINESS || 60;

  let memo = {
    title: activeChapter.title,
    body: `Fokus bab ini: ${nextGoal?.label || 'selesaikan target koperasi'}. ${activeChapter.summary}`,
    action: nextGoal?.id === 'money' || nextGoal?.id === 'stock' || nextGoal?.id === 'capacity' ? 'Buka Pasar' : 'Masuk Toko',
    onAction: nextGoal?.id === 'money' || nextGoal?.id === 'stock' || nextGoal?.id === 'capacity'
      ? () => openRestockPanel()
      : () => setView('store3d'),
  };

  if (gamePhase === 'setupStore') {
    memo = {
      title: 'Susun toko koperasi',
      body: 'Masuk ke toko 3D, pasang minimal satu kasir dan satu rak sebelum membeli stok pertama.',
      action: 'Masuk Toko',
      onAction: () => setView('store3d'),
    };
  } else if (gamePhase === 'monthlyMeeting') {
    memo = {
      title: 'Rapat simpanan bulanan',
      body: 'Tentukan simpanan wajib bulan ini sebelum koperasi kembali membuka toko.',
      action: 'Mulai Rapat',
      onAction: () => setActiveModal('monthlyMeeting'),
    };
  } else if (gamePhase === 'managerMode') {
    memo = {
      title: 'Manager Mode berjalan',
      body: 'Layani permintaan pelanggan langsung di toko 3D sebelum waktu habis.',
      action: 'Masuk Toko',
      onAction: () => setView('store3d'),
    };
  } else if (gamePhase === 'readyToOpen') {
    memo = {
      title: 'Toko siap dibuka',
      body: 'Pilih Mainkan 3D untuk melayani pelanggan langsung, atau Simulasi Hari untuk menjalankan penjualan otomatis.',
      action: 'Mainkan 3D',
      onAction: () => setView('store3d'),
    };
  } else if (gamePhase === 'restockPhase') {
    memo = {
      title: 'Fase restok pasokan',
      body: 'Toko masih tutup. Isi stok secara manual atau otomatis sebelum membuka hari baru.',
      action: 'Buka Pasar',
      onAction: () => openRestockPanel(),
    };
  } else if (activeEvents.some((event) => event.type === 'gagalPanen')) {
    memo = {
      title: 'Gagal panen sedang terjadi',
      body: 'Prioritaskan belanja dari UMKM agar petani tetap terbantu dan kebahagiaan warga tidak jatuh.',
      action: 'Buka Pasar',
      onAction: () => openRestockPanel(),
    };
  } else if (activeEvents.some((event) => event.type === 'krisisEkonomi')) {
    memo = {
      title: 'Krisis ekonomi aktif',
      body: 'Cek harga jual. Saat krisis, harga yang terlalu tinggi cepat membuat warga kecewa.',
      action: 'Atur Harga',
      onAction: () => setActiveModal('harga'),
    };
  } else if (pendingApplications.length > 0) {
    memo = {
      title: `${pendingApplications.length} calon anggota menunggu`,
      body: 'Anggota baru menambah simpanan wajib dan memperkuat koperasi untuk target akhir tahun.',
      action: 'Lihat Anggota',
      onAction: () => setActiveModal('pinjamanAktifList'),
    };
  } else if (pendingLoanRequests.length > 0) {
    memo = {
      title: `${pendingLoanRequests.length} pengajuan pinjaman`,
      body: 'Pinjaman bisa menghidupkan usaha anggota, tapi bunga tinggi menurunkan kepercayaan.',
      action: 'Tinjau Pinjaman',
      onAction: () => setActiveModal('pinjamanAktifList'),
    };
  } else if (lowestStock.cap > 0 && lowestStock.ratio < 0.35) {
    memo = {
      title: `Stok ${lowestStock.label} mulai tipis`,
      body: `Gudang hanya berisi ${lowestStock.value}/${lowestStock.cap}. Tutup toko dulu, lalu restok sebelum hari baru dibuka.`,
      action: 'Buka Pasar',
      onAction: () => openRestockPanel(),
    };
  } else if (happiness < targetHappiness) {
    memo = {
      title: 'Kepercayaan warga perlu dijaga',
      body: `Kebahagiaan ${happiness}%. Beli dari UMKM, jaga harga, dan bantu anggota agar menuju target ${targetHappiness}%.`,
      action: 'Atur Harga',
      onAction: () => setActiveModal('harga'),
    };
  }

  return (
    <div className="prabowo-advisor-container" aria-label="Catatan pengurus">
      <img src="/assets/images/ui/prabowo_bg2.png" alt="Presiden Prabowo" className="prabowo-advisor-portrait" />
      <aside className="advisory-memo">
        <h3 className="advisory-title">{memo.title}</h3>
        <p className="advisory-body">{memo.body}</p>
        <button className="btn btn-primary" onClick={memo.onAction}>
          {memo.action}
        </button>
      </aside>
    </div>
  );
}
