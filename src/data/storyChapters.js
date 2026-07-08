import { WIN_CONDITIONS } from '../constants/gameConstants';

export const CHAPTERS = [
  {
    id: 'stabilize',
    number: 1,
    title: 'Stabilkan Koperasi Desa',
    summary: 'Buka toko, pasang kasir, dan pastikan warga mulai terlayani.',
    advisor: 'Bu Siti',
    avatar: '/assets/avatars/female_1_siti.jpg',
    goals: [
      { id: 'cashier', label: 'Pasang meja kasir', target: 1, select: (state) => state.furniture.cashier },
      { id: 'stock', label: 'Isi 15 stok barang', target: 15, select: (state) => Object.values(state.stock).reduce((sum, value) => sum + value, 0) },
      { id: 'sales', label: 'Jual 10 barang', target: 10, select: (state) => state.statistics.totalItemsSold },
    ],
  },
  {
    id: 'members',
    number: 2,
    title: 'Bangun Kepercayaan Anggota',
    summary: 'Terima warga, jaga kebahagiaan, dan jadikan koperasi milik bersama.',
    advisor: 'Pak Budi',
    avatar: '/assets/avatars/male_1_budi.jpg',
    goals: [
      { id: 'members', label: 'Terima 3 anggota', target: 3, select: (state) => state.memberCount },
      { id: 'happiness', label: 'Jaga bahagia 55%', target: 55, select: (state) => state.happiness },
      { id: 'money', label: 'Kas Rp 6 juta', target: 6_000_000, select: (state) => state.money, money: true },
    ],
  },
  {
    id: 'umkm',
    number: 3,
    title: 'Hidupkan Rantai UMKM',
    summary: 'Salurkan pinjaman dan beli dari UMKM agar pasokan desa makin mandiri.',
    advisor: 'Pak Dedi',
    avatar: '/assets/avatars/male_4_dedi.jpg',
    goals: [
      { id: 'loans', label: 'Salurkan 2 pinjaman', target: 2, select: (state) => state.statistics.totalLoansGiven },
      { id: 'activeLoans', label: 'Kelola 1 pinjaman aktif', target: 1, select: (state) => state.activeLoans.filter((loan) => loan.status === 'aktif').length },
      { id: 'happiness', label: 'Bahagia 60%', target: 60, select: (state) => state.happiness },
    ],
  },
  {
    id: 'expand',
    number: 4,
    title: 'Perluas Toko Koperasi',
    summary: 'Perbesar kapasitas, tambah rak, dan layani lebih banyak kebutuhan warga.',
    advisor: 'Bu Rina',
    avatar: '/assets/avatars/female_3_rina.jpg',
    goals: [
      { id: 'capacity', label: 'Kapasitas stok 75', target: 75, select: (state) => Object.values(state.stockCapacity).reduce((sum, value) => sum + value, 0) },
      { id: 'store', label: 'Upgrade toko besar', target: 1, select: (state) => (state.storeSize === 'large' ? 1 : 0) },
      { id: 'sales', label: 'Jual 80 barang', target: 80, select: (state) => state.statistics.totalItemsSold },
    ],
  },
  {
    id: 'resilience',
    number: 5,
    title: 'Koperasi Mandiri',
    summary: 'Selesaikan target akhir tahun sambil menjaga kas, anggota, dan kepercayaan.',
    advisor: 'Pengurus Desa',
    avatar: '/assets/avatars/female_2_dewi.jpg',
    goals: [
      { id: 'money', label: 'Kas akhir tahun', target: WIN_CONDITIONS.MONEY, select: (state) => state.money, money: true },
      { id: 'members', label: 'Anggota aktif', target: WIN_CONDITIONS.MEMBERS, select: (state) => state.memberCount },
      { id: 'happiness', label: 'Bahagia warga', target: WIN_CONDITIONS.HAPPINESS, select: (state) => state.happiness },
    ],
  },
];

export function getChapterProgress(state) {
  const chapters = CHAPTERS.map((chapter) => {
    const goals = chapter.goals.map((goal) => {
      const value = Math.max(0, goal.select(state) || 0);
      const progress = Math.min(100, Math.round((value / goal.target) * 100));

      return {
        ...goal,
        value,
        progress,
        complete: value >= goal.target,
      };
    });

    const complete = goals.every((goal) => goal.complete);
    const progress = Math.round(goals.reduce((sum, goal) => sum + goal.progress, 0) / goals.length);

    return {
      ...chapter,
      goals,
      complete,
      progress,
    };
  });

  const activeChapter = chapters.find((chapter) => !chapter.complete) || chapters[chapters.length - 1];
  const activeIndex = chapters.findIndex((chapter) => chapter.id === activeChapter.id);
  const nextGoal = activeChapter.goals.find((goal) => !goal.complete) || activeChapter.goals[0];

  return {
    chapters,
    activeChapter,
    activeIndex,
    nextGoal,
  };
}
