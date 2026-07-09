// ============================================================
// museumContent.js — Museum Koperasi Content
// ============================================================

export const MUSEUM_TABS = [
  { id: 'history', label: 'Sejarah Koperasi', icon: '🏛' },
  { id: 'merah_putih', label: 'Koperasi Merah Putih', icon: '🏪' },
  { id: 'simpan_pinjam', label: 'Simpan Pinjam', icon: '💰' },
  { id: 'korporasi', label: 'Koperasi vs Korporasi', icon: '🏢' },
];

export const MUSEUM_CONTENT = {
  history: {
    title: 'Sejarah Koperasi Indonesia',
    image: '/assets/images/museum/hist_1896.jpg', // Fallback
    sections: [
      {
        subtitle: '1896 - Awal Mula',
        image: '/assets/images/museum/hist_1896.jpg',
        text: 'Patih R. Aria Wiriaatmadja mendirikan bank penolong dan tabungan (hulp en spaarbank) di Purwokerto untuk membantu para priyayi dari jeratan rentenir. Inilah benih pertama gerakan koperasi di Indonesia.'
      },
      {
        subtitle: '1908 - Budi Utomo',
        image: '/assets/images/museum/hist_1908.jpg',
        text: 'Organisasi Budi Utomo memajukan koperasi rumah tangga dan toko sebagai bagian dari semangat Kebangkitan Nasional, menjadikannya alat perjuangan ekonomi rakyat.'
      },
      {
        subtitle: '1947 - Kongres Koperasi Pertama',
        image: '/assets/images/museum/hist_1947.jpg',
        text: 'Diselenggarakan di Tasikmalaya pada 12 Juli 1947, melahirkan SOKRI (Sentral Organisasi Koperasi Rakyat Indonesia). Tanggal ini ditetapkan sebagai Hari Koperasi Nasional.'
      },
      {
        subtitle: '1967/1992 - Era Orde Baru & UU Perkoperasian',
        image: '/assets/images/museum/hist_1992.jpg',
        text: 'Pemerintah mengembangkan Koperasi Unit Desa (KUD) secara masif. Pada 1992, disahkan UU No. 25 tentang Perkoperasian yang menjadi tonggak hukum utama hingga kini.'
      },
      {
        subtitle: 'Masa Kini - Koperasi Digital',
        image: '/assets/images/museum/hist_present.jpg',
        text: 'Koperasi bertransformasi di era digital, menawarkan transparansi, kecepatan aplikasi, dan menjangkau generasi muda tanpa meninggalkan asas kekeluargaan dan gotong royong.'
      }
    ]
  },
  merah_putih: {
    title: 'Koperasi Merah Putih',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop', // Grocery store
    sections: [
      {
        subtitle: 'Konsep Dasar',
        text: 'Koperasi Merah Putih adalah simulasi koperasi konsumen dan serba usaha. Berfokus pada penyediaan kebutuhan pokok (Beras, Minyak Goreng, Gas LPG) untuk warga desa dengan harga yang adil.'
      },
      {
        subtitle: 'Tujuan Utama',
        text: 'Meningkatkan kesejahteraan anggota dan menjaga tingkat kebahagiaan masyarakat. Koperasi harus mampu bertahan dari krisis ekonomi dan gagal panen dengan manajemen stok yang baik.'
      },
      {
        subtitle: 'Sistem Keanggotaan',
        text: 'Warga desa dapat mendaftar menjadi anggota. Anggota wajib membayar simpanan pokok dan bulanan, namun berhak mendapatkan Sisa Hasil Usaha (SHU) dan fasilitas pinjaman dengan bunga rendah.'
      }
    ]
  },
  simpan_pinjam: {
    title: 'Skema Koperasi Simpan Pinjam',
    image: 'https://images.unsplash.com/photo-1579621970588-a3f5ce599fac?q=80&w=600&auto=format&fit=crop', // Money
    sections: [
      {
        subtitle: 'Istilah Simpanan',
        text: '• Simpanan Pokok: Dibayar sekali saat mendaftar menjadi anggota.\n• Simpanan Wajib: Dibayar rutin setiap bulan (misal Rp 50.000/bulan).\n• Simpanan Sukarela: Tabungan ekstra yang bisa diambil kapan saja.'
      },
      {
        subtitle: 'Pinjaman & Bunga',
        text: 'Anggota dapat meminjam dana untuk usaha atau kebutuhan hidup. Koperasi Merah Putih menerapkan bunga rendah (6% per tahun atau 0.5% per bulan) agar tidak memberatkan warga, jauh lebih murah dari rentenir.'
      },
      {
        subtitle: 'SHU (Sisa Hasil Usaha)',
        text: 'Keuntungan bersih koperasi yang dibagikan kembali kepada anggota setiap bulan atau akhir tahun. Besaran SHU dihitung berdasarkan proporsi transaksi dan simpanan masing-masing anggota.'
      }
    ]
  },
  korporasi: {
    title: 'Koperasi vs Korporasi (PT)',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=600&auto=format&fit=crop', // Corporate building
    sections: [
      {
        subtitle: 'Orientasi & Tujuan',
        text: 'Koperasi bertujuan untuk menyejahterakan anggotanya (People-Based). Sementara Korporasi atau PT berorientasi pada pencarian keuntungan maksimal bagi para pemilik modal (Capital-Based).'
      },
      {
        subtitle: 'Hak Suara (Voting)',
        text: '• Koperasi: Satu anggota = Satu suara (One man, one vote). Tidak peduli seberapa besar simpanannya, setiap orang setara.\n• Korporasi: Satu saham = Satu suara. Pemegang saham mayoritas memegang kendali penuh.'
      },
      {
        subtitle: 'Pembagian Hasil',
        text: 'Koperasi membagikan keuntungan sebagai Sisa Hasil Usaha (SHU) secara adil berdasarkan partisipasi anggota. Korporasi membagikan Dividen hanya berdasarkan persentase kepemilikan saham.'
      }
    ]
  }
};
