// ============================================================
// npcData.js — Database NPC (8 karakter sesuai GDD)
// ============================================================

export const NPC_DATABASE = [
  // ── Laki-laki ────────────────────────────────────────────
  {
    id: 'npc_m1',
    nama: 'Budi Santoso',
    pekerjaan: 'Petani Padi',
    umur: 45,
    jenisKelamin: 'Laki-laki',
    pendapatanBulanan: 2_500_000,
    simpananWajib: 50_000,
    avatar: '/assets/avatars/male_1_budi.jpg',
    loanTemplates: [
      { tujuan: 'Perbaikan sawah', jumlah: 1_000_000, tenor: 5, barangTerkait: 'rice' },
      { tujuan: 'Pembelian bibit', jumlah: 500_000, tenor: 3, barangTerkait: 'rice' },
    ],
  },
  {
    id: 'npc_m2',
    nama: 'Ahmad Wijaya',
    pekerjaan: 'Pedagang Kelontong',
    umur: 38,
    jenisKelamin: 'Laki-laki',
    pendapatanBulanan: 3_000_000,
    simpananWajib: 50_000,
    avatar: '/assets/avatars/male_2_ahmad.jpg',
    loanTemplates: [
      { tujuan: 'Penambahan stok dagangan', jumlah: 1_500_000, tenor: 6, barangTerkait: null },
      { tujuan: 'Renovasi toko', jumlah: 2_000_000, tenor: 8, barangTerkait: null },
    ],
  },
  {
    id: 'npc_m3',
    nama: 'Hendra Kusuma',
    pekerjaan: 'Nelayan',
    umur: 42,
    jenisKelamin: 'Laki-laki',
    pendapatanBulanan: 2_000_000,
    simpananWajib: 50_000,
    avatar: '/assets/avatars/male_3_hendra.jpg',
    loanTemplates: [
      { tujuan: 'Pembelian jaring baru', jumlah: 800_000, tenor: 4, barangTerkait: null },
      { tujuan: 'Perbaikan perahu', jumlah: 1_200_000, tenor: 5, barangTerkait: null },
    ],
  },
  {
    id: 'npc_m4',
    nama: 'Dedi Prasetyo',
    pekerjaan: 'Pengusaha Minyak Goreng',
    umur: 35,
    jenisKelamin: 'Laki-laki',
    pendapatanBulanan: 2_800_000,
    simpananWajib: 50_000,
    avatar: '/assets/avatars/male_4_dedi.jpg',
    loanTemplates: [
      { tujuan: 'Modal produksi minyak', jumlah: 1_500_000, tenor: 6, barangTerkait: 'cookingOil' },
      { tujuan: 'Pembelian mesin press', jumlah: 2_000_000, tenor: 8, barangTerkait: 'cookingOil' },
    ],
  },

  // ── Perempuan ────────────────────────────────────────────
  {
    id: 'npc_f1',
    nama: 'Siti Aminah',
    pekerjaan: 'Penjahit',
    umur: 32,
    jenisKelamin: 'Perempuan',
    pendapatanBulanan: 1_800_000,
    simpananWajib: 50_000,
    avatar: '/assets/avatars/female_1_siti.jpg',
    loanTemplates: [
      { tujuan: 'Pembelian mesin jahit', jumlah: 700_000, tenor: 4, barangTerkait: null },
      { tujuan: 'Pembelian kain', jumlah: 500_000, tenor: 3, barangTerkait: null },
    ],
  },
  {
    id: 'npc_f2',
    nama: 'Dewi Lestari',
    pekerjaan: 'Guru SD',
    umur: 40,
    jenisKelamin: 'Perempuan',
    pendapatanBulanan: 3_500_000,
    simpananWajib: 50_000,
    avatar: '/assets/avatars/female_2_dewi.jpg',
    loanTemplates: [
      { tujuan: 'Biaya pendidikan anak', jumlah: 1_000_000, tenor: 5, barangTerkait: null },
      { tujuan: 'Renovasi rumah', jumlah: 3_000_000, tenor: 10, barangTerkait: null },
    ],
  },
  {
    id: 'npc_f3',
    nama: 'Rina Wulandari',
    pekerjaan: 'Pedagang Pasar',
    umur: 36,
    jenisKelamin: 'Perempuan',
    pendapatanBulanan: 2_200_000,
    simpananWajib: 50_000,
    avatar: '/assets/avatars/female_3_rina.jpg',
    loanTemplates: [
      { tujuan: 'Modal sayur-mayur', jumlah: 600_000, tenor: 3, barangTerkait: null },
      { tujuan: 'Sewa lapak pasar', jumlah: 1_000_000, tenor: 5, barangTerkait: null },
    ],
  },
  {
    id: 'npc_f4',
    nama: 'Kartini Putri',
    pekerjaan: 'Pengusaha Gas LPG',
    umur: 44,
    jenisKelamin: 'Perempuan',
    pendapatanBulanan: 2_000_000,
    simpananWajib: 50_000,
    avatar: '/assets/avatars/female_4_kartini.jpg',
    loanTemplates: [
      { tujuan: 'Penambahan stok gas', jumlah: 1_500_000, tenor: 5, barangTerkait: 'lpgGas' },
      { tujuan: 'Kendaraan distribusi', jumlah: 3_000_000, tenor: 10, barangTerkait: 'lpgGas' },
    ],
  },
];
