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
      { tujuan: 'Meningkatkan produksi beras', jumlah: 1_000_000, tenor: 1, barangTerkait: 'rice' },
      { tujuan: 'Meningkatkan produksi beras', jumlah: 500_000, tenor: 1, barangTerkait: 'rice' },
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
      { tujuan: 'Memperbesar produksi minyak goreng', jumlah: 600_000, tenor: 1, barangTerkait: 'cookingOil' },
      { tujuan: 'Menambah armada distribusi gas LPG', jumlah: 800_000, tenor: 1, barangTerkait: 'lpgGas' },
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
      { tujuan: 'Meningkatkan produksi beras', jumlah: 800_000, tenor: 1, barangTerkait: 'rice' },
      { tujuan: 'Memperbesar produksi minyak goreng', jumlah: 700_000, tenor: 1, barangTerkait: 'cookingOil' },
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
      { tujuan: 'Memperbesar produksi minyak goreng', jumlah: 1_000_000, tenor: 1, barangTerkait: 'cookingOil' },
      { tujuan: 'Memperbesar produksi minyak goreng', jumlah: 900_000, tenor: 1, barangTerkait: 'cookingOil' },
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
      { tujuan: 'Menambah armada distribusi gas LPG', jumlah: 700_000, tenor: 1, barangTerkait: 'lpgGas' },
      { tujuan: 'Meningkatkan produksi beras', jumlah: 500_000, tenor: 1, barangTerkait: 'rice' },
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
      { tujuan: 'Meningkatkan produksi beras', jumlah: 1_000_000, tenor: 1, barangTerkait: 'rice' },
      { tujuan: 'Menambah armada distribusi gas LPG', jumlah: 600_000, tenor: 1, barangTerkait: 'lpgGas' },
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
      { tujuan: 'Memperbesar produksi minyak goreng', jumlah: 600_000, tenor: 1, barangTerkait: 'cookingOil' },
      { tujuan: 'Menambah armada distribusi gas LPG', jumlah: 800_000, tenor: 1, barangTerkait: 'lpgGas' },
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
      { tujuan: 'Menambah armada distribusi gas LPG', jumlah: 1_000_000, tenor: 1, barangTerkait: 'lpgGas' },
      { tujuan: 'Menambah armada distribusi gas LPG', jumlah: 900_000, tenor: 1, barangTerkait: 'lpgGas' },
    ],
  },
];
