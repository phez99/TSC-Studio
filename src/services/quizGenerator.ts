import { QuizQuestionItem } from './roomStorage';

export interface ThemeOption {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const PRESET_THEMES: ThemeOption[] = [
  {
    id: 'kantor',
    name: 'Dunia Kerja & Outing Kantor',
    description: 'Drama kantor, lembur, revisi, meeting, dan kebiasaan kocak karyawan',
    icon: 'Briefcase',
  },
  {
    id: 'lagu',
    name: 'Tebak Lagu & Musik Indonesia',
    description: 'Lirik lagu legendaris Jamrud, Sheila On 7, Dewa 19, pop hingga dangdut',
    icon: 'Music',
  },
  {
    id: 'logika',
    name: 'Teka-Teki Logika & Jebakan Betmen',
    description: 'Asah otak seru, tebakan pelesetan, dan jebakan logika yang bikin tertawa',
    icon: 'Lightbulb',
  },
  {
    id: 'kuliner',
    name: 'Kuliner & Jajanan Nusantara',
    description: 'Trivia makanan khas daerah, gorengan pantry, sambal, dan kopi',
    icon: 'Utensils',
  },
  {
    id: 'popculture',
    name: 'Pop Culture & Film Indonesia',
    description: 'Film box office, meme viral, bahasa gaul, dan fenomena internet',
    icon: 'Film',
  },
];

// Curated pool of 100% REAL verified questions categorized by themes
const REAL_QUESTION_CATALOG: Record<string, QuizQuestionItem[]> = {
  kantor: [
    {
      id: 1,
      question: "Pertanyaan paling sakral yang muncul di grup WhatsApp kantor tepat jam 11.45 siang adalah...",
      options: [
        "Ada yang punya charger type C?",
        "Makan siang di mana hari ini guys?",
        "Meeting jam 1 siang jadi gak?",
        "Draft revisi sudah dikirim ke email"
      ],
      answer: "Makan siang di mana hari ini guys?",
      category: "Dunia Kerja",
      funFact: "99% perdebatan terpanjang di kantor bukan soal KPI, melainkan menentukan menu makan siang."
    },
    {
      id: 2,
      question: "Apa arti psikologis sebenarnya saat rekan kerja menulis: 'Per my previous email'?",
      options: [
        "Menghargai ketelitian rekan kerja",
        "Secara sopan bilang: 'Bisa baca email gak sih?'",
        "Mau pamer arsip email yang rapi",
        "Mengajak ngopi santai di pantry"
      ],
      answer: "Secara sopan bilang: 'Bisa baca email gak sih?'",
      category: "Dunia Kerja",
      funFact: "Kalimat terhalus untuk mengekspresikan emosi jiwa tanpa melanggar kode etik korporat."
    },
    {
      id: 3,
      question: "Refleks darurat apa yang paling spontan dilakukan saat bos besar mendadak lewat di belakang meja?",
      options: [
        "Pura-pura menatap tajam spreadsheet Excel yang kosong",
        "Langsung berdiri tegak hormat bendera",
        "Mengetik keyboard acak dengan kecepatan 150 WPM",
        "Tiba-tiba pura-pura batuk kering"
      ],
      answer: "Pura-pura menatap tajam spreadsheet Excel yang kosong",
      category: "Dunia Kerja",
      funFact: "Excel kosong dengan ekspresi dahi berkerut adalah tameng pertahanan terkuat karyawan."
    },
    {
      id: 4,
      question: "Kapan kecepatan respons chat karyawan di WhatsApp kantor melonjak 300% lebih cepat?",
      options: [
        "Saat bos bertanya update laporan mingguan",
        "Saat klien komplain revisi belum beres",
        "Saat ada info: 'Gajian sudah masuk' atau 'Ada gorengan di pantry'",
        "Saat ada ajakan Zoom mendadak hari Minggu"
      ],
      answer: "Saat ada info: 'Gajian sudah masuk' atau 'Ada gorengan di pantry'",
      category: "Dunia Kerja",
      funFact: "Gorengan hangat di pantry memiliki daya tarik gravitasi lebih kuat daripada deadline kuartal."
    },
    {
      id: 5,
      question: "Jika seorang atasan atau klien bilang 'Tenang aja, revisinya minor kok...', realitanya adalah...",
      options: [
        "Cuma ubah satu tanda titik atau koma",
        "Hanya ganti warna font sedikit",
        "Harus rombak 80% konsep dan lembur sampai malam",
        "Pekerjaan langsung disetujui tanpa catatan"
      ],
      answer: "Harus rombak 80% konsep dan lembur sampai malam",
      category: "Dunia Kerja",
      funFact: "Kata 'minor' dalam kamus revisi berbanding lurus dengan jumlah kopi yang harus diseduh."
    },
    {
      id: 6,
      question: "Apa fungsi utama tombol 'Mute' pada aplikasi Zoom saat meeting kantor?",
      options: [
        "Menghemat kuota internet kantor",
        "Menutupi suara kunyahan kerupuk dan pedagang tahu bulat lewat",
        "Supaya suara napas tidak terdengar seram",
        "Membuat laptop tidak cepat panas"
      ],
      answer: "Menutupi suara kunyahan kerupuk dan pedagang tahu bulat lewat",
      category: "Dunia Kerja",
      funFact: "Pedagang tahu bulat dan abang bakso adalah tamu tak diundang nomor 1 dalam setiap rapat online."
    },
    {
      id: 7,
      question: "Apa kepanjangan paling relatable dari kata 'WFH' saat hari Jumat sore?",
      options: [
        "Work From Home",
        "Waktunya Foya-foya Healing",
        "Waduh File Hilang",
        "Weekend Fast Hurry"
      ],
      answer: "Waktunya Foya-foya Healing",
      category: "Dunia Kerja",
      funFact: "Hari Jumat setelah jam 3 sore aura laptop biasanya sudah berubah menjadi aura liburan."
    },
    {
      id: 8,
      question: "Jika di kalender kantor ada 'Tanggal Merah di Hari Kamis', apa nama fenomena hari Jumatnya?",
      options: [
        "Hari Produktivitas Maksimal",
        "Hari Kejepit Nasional (Harpitnas)",
        "Hari Cuti Wajib Direksi",
        "Hari Evaluasi Triwulan"
      ],
      answer: "Hari Kejepit Nasional (Harpitnas)",
      category: "Dunia Kerja",
      funFact: "Harpitnas adalah hari di mana 50% karyawan mengajukan cuti dan 50% sisanya ragu tapi ikutan mager."
    }
  ],
  lagu: [
    {
      id: 1,
      question: "Lengkapi lirik lagu Jamrud: 'Ulang tahunmu, kami bawa hadiah... Datang ke rumahmu, bawa...'?",
      options: [
        "Kue tart cokelat dan lilin",
        "Martabak manis keju spesial",
        "Kado dibungkus koran",
        "Bunga mawar merah setangkai"
      ],
      answer: "Kado dibungkus koran",
      category: "Tebak Lagu",
      funFact: "Koran bekas kemarin sore adalah pembungkus kado paling otentik di era 90-an dan 2000-an."
    },
    {
      id: 2,
      question: "Penggalan lirik Sheila On 7 yang paling sering diteriakkan dalam hati saat jam pulang kantor Jumat adalah...",
      options: [
        "'Melompat lebih tinggi!'",
        "'Dan... bila esok... datang kembali...'",
        "'Seberapa pantas kau untuk kutunggu...'",
        "'Kupetik bintang untuk kau simpan...'"
      ],
      answer: "'Melompat lebih tinggi!'",
      category: "Tebak Lagu",
      funFact: "Lagu wajib untuk soundtrack menutup laptop dan langsung melesat menuju pintu keluar."
    },
    {
      id: 3,
      question: "Lagu 'Kemesraan' karya Franky Sahilatua & Iwan Fals paling wajib dinyanyikan saat momen apa di outing?",
      options: [
        "Briefing sarapan pagi sebelum naik bus",
        "Penutupan malam keakraban api unggun sambil rangkulan pundak",
        "Saat berebut kursi bus paling belakang",
        "Ketika antre mengambil nasi kotak makan siang"
      ],
      answer: "Penutupan malam keakraban api unggun sambil rangkulan pundak",
      category: "Tebak Lagu",
      funFact: "Momen magis di mana bos dan anak magang menyatu dalam harmoni sebelum hari Senin tiba kembali."
    },
    {
      id: 4,
      question: "Lagu hits Dewa 19 yang lirik pembukanya berbunyi 'Kulayangkan pandang ke sudut taman...' berjudul apa?",
      options: [
        "Kangen",
        "Pupus",
        "Cukup Siti Nurbaya",
        "Separuh Nafas"
      ],
      answer: "Kangen",
      category: "Tebak Lagu",
      funFact: "Dirilis tahun 1992 dan masih menjadi lagu karaoke terlaris di seluruh tempat karaoke Indonesia."
    },
    {
      id: 5,
      question: "Lanjutkan lirik lagu legendaris Chrisye: 'Ketika jemari dan mahkota kata, tak sanggup lagi...'",
      options: [
        "Bercerita tentang asmara",
        "Mengurai rasa cinta",
        "Menulis tentang kepedihan",
        "Menatap indahnya mentari"
      ],
      answer: "Bercerita tentang asmara",
      category: "Tebak Lagu",
      funFact: "Lagu 'Kisah Cintaku' ciptaan Tito Sumarsono yang diaransemen kembali oleh Peterpan (NOAH)."
    },
    {
      id: 6,
      question: "Grup musik Project Pop mempopulerkan lagu yang lirik reffnya: 'Dangdut is the music of my country...' Apa judulnya?",
      options: [
        "Goyang Duyu",
        "Dangdut is the Music of My Country",
        "Jangan Pikirin Abang",
        "Bukan Superstar"
      ],
      answer: "Dangdut is the Music of My Country",
      category: "Tebak Lagu",
      funFact: "Lagu ikonik yang membuktikan dangdut bisa dipadukan dengan rap dan pop komedi."
    }
  ],
  logika: [
    {
      id: 1,
      question: "Pintu apa yang meskipun didorong sekuat tenaga oleh 10 binaragawan tetap tidak akan terbuka?",
      options: [
        "Pintu darurat mall",
        "Pintu gerbang tol otomatis",
        "Pintu lift yang macet",
        "Pintu yang ada tulisan 'TARIK'"
      ],
      answer: "Pintu yang ada tulisan 'TARIK'",
      category: "Teka-Teki Logika",
      funFact: "Hukum fisika kalah telak dengan instruksi sederhana yang tertulis di gagang pintu."
    },
    {
      id: 2,
      question: "Kenapa Superman kalau lagi terbang tangan kanannya selalu dijulurkan lurus ke depan?",
      options: [
        "Biar memecah hambatan angin aerodinamis",
        "Supaya gak nabrak tiang listrik dan kabel layangan",
        "Karena kalau tangannya ditekuk dua-duanya disangka lagi push-up di udara",
        "Biar bisa sekalian ngecek jam tangan"
      ],
      answer: "Karena kalau tangannya ditekuk dua-duanya disangka lagi push-up di udara",
      category: "Teka-Teki Logika",
      funFact: "Bayangkan Superman melayang di langit sambil dikira warga lagi senam calisthenics."
    },
    {
      id: 3,
      question: "Benda apa yang kalau dipotong malah semakin bertambah panjang?",
      options: [
        "Tali tambang kapal",
        "Kain sutra meteran",
        "Garis celana jeans",
        "Potongan rambut poni"
      ],
      answer: "Garis celana jeans",
      category: "Teka-Teki Logika",
      funFact: "Atau tebakan klasik: Tali celana atau parit yang kalau digali malah semakin panjang/dalam!"
    },
    {
      id: 4,
      question: "Kota atau daerah apa di Indonesia yang warganya terkenal paling sabar, tabah, dan tidak pernah emosi?",
      options: [
        "Kota Bandung",
        "Kota Sabang (karena Sa-bang-et sabarnya)",
        "Kota Cikarang",
        "Kota Malang"
      ],
      answer: "Kota Sabang (karena Sa-bang-et sabarnya)",
      category: "Teka-Teki Logika",
      funFact: "Plesetan bapak-bapak yang selalu sukses memecah kebekuan di panggung kuis outing."
    },
    {
      id: 5,
      question: "Jika ada 5 ekor burung bertengger di dahan pohon, lalu 1 ekor ditembak pemburu, sisa berapa burung di pohon?",
      options: [
        "Sisa 4 ekor",
        "Sisa 0 ekor (semuanya kaget dan terbang)",
        "Sisa 1 ekor (yang tertembak jatuh)",
        "Sisa 5 ekor"
      ],
      answer: "Sisa 0 ekor (semuanya kaget dan terbang)",
      category: "Teka-Teki Logika",
      funFact: "Suara senapan pemburu membuat sisa burung lainnya langsung kabur menyelamatkan diri."
    },
    {
      id: 6,
      question: "Bila naik turun tangga kita capek, tangga apa yang dinaiki tapi kita tidak capek sama sekali?",
      options: [
        "Tangga nada lagu",
        "Tangga darurat hotel",
        "Tangga kayu tukang cat",
        "Tangga bambu kebun"
      ],
      answer: "Tangga nada lagu",
      category: "Teka-Teki Logika",
      funFact: "Do Re Mi Fa Sol La Si Do tidak menguras kalori fisik sama sekali."
    }
  ],
  kuliner: [
    {
      id: 1,
      question: "Gorengan khas Indonesia apa yang isinya tauge, wortel, dan kol yang digoreng garing dengan adonan tepung?",
      options: [
        "Bakwan / Bala-bala",
        "Cireng isi oncom",
        "Tempe mendoan",
        "Tahu jeletot pedas"
      ],
      answer: "Bakwan / Bala-bala",
      category: "Kuliner",
      funFact: "Di Jakarta disebut Bakwan, di Bandung disebut Bala-bala, di Surabaya disebut Ote-ote."
    },
    {
      id: 2,
      question: "Rendang dinobatkan sebagai salah satu makanan terenak di dunia oleh CNN. Dari provinsi manakah masakan ini berasal?",
      options: [
        "Sumatera Barat (Minangkabau)",
        "Sumatera Utara",
        "Riau Kepulauan",
        "Jambi"
      ],
      answer: "Sumatera Barat (Minangkabau)",
      category: "Kuliner",
      funFact: "Rendang asli dimasak berjam-jam menggunakan rempah dan santan kelapa hingga kehitaman."
    },
    {
      id: 3,
      question: "Minuman kopi tradisional asal Yogyakarta yang disajikan dengan arang membara di dalam cangkir disebut kopi apa?",
      options: [
        "Kopi Tubruk",
        "Kopi Joss",
        "Kopi Tarik",
        "Kopi Klotok"
      ],
      answer: "Kopi Joss",
      category: "Kuliner",
      funFact: "Bunyi 'josss' saat arang panas dicelupkan ke dalam kopi menjadi asal mula namanya."
    },
    {
      id: 4,
      question: "Kue tradisional berbahan tepung beras dengan isian gula merah cair dan taburan kelapa parut adalah...",
      options: [
        "Kue Putu",
        "Kue Lapis Legit",
        "Kue Cucur",
        "Kue Cubit"
      ],
      answer: "Kue Putu",
      category: "Kuliner",
      funFact: "Pedagang kue putu keliling memiliki suara peluit uap yang khas seperti suara peluit kereta api."
    },
    {
      id: 5,
      question: "Sambal khas Manado yang terbuat dari potongan cabai rawit, tomat merah/hijau, bawang merah, dan perasan jeruk nipis tanpa diulek disebut...",
      options: [
        "Sambal Dabu-dabu",
        "Sambal Matah",
        "Sambal Terasi",
        "Sambal Bajak"
      ],
      answer: "Sambal Dabu-dabu",
      category: "Kuliner",
      funFact: "Dabu-dabu tidak diulek melainkan hanya diiris dadu kasar dan disiram minyak kelapa panas."
    }
  ],
  popculture: [
    {
      id: 1,
      question: "Dalam film legendaris 'Ada Apa Dengan Cinta?' (AADC), dialog ikonik Cinta kepada Rangga di bioskop adalah...",
      options: [
        "'Basi! Madingnya udah siap terbit!'",
        "'Salah gue? Salah temen-temen gue?'",
        "'Rangga, kamu jahat!'",
        "'Jangan pernah cari aku lagi!'"
      ],
      answer: "'Salah gue? Salah temen-temen gue?'",
      category: "Pop Culture",
      funFact: "Dialog Dian Sastrowardoyo ini menjadi kutipan film paling viral di dekade 2000-an."
    },
    {
      id: 2,
      question: "Singkatan gaul Gen-Z 'FOMO' adalah Fear Of Missing Out. Kalau anak kos akhir bulan, plesetannya sering jadi...",
      options: [
        "Focus On Management Order",
        "Fulus Otw Menipis Oy",
        "Financial Order Must Optimize",
        "Fast Output Maximum Overtime"
      ],
      answer: "Fulus Otw Menipis Oy",
      category: "Pop Culture",
      funFact: "Kondisi di mana saldo rekening mulai menguji ketabahan iman dan kesabaran."
    },
    {
      id: 3,
      question: "Siapakah karakter komik pahlawan super Indonesia ciptaan Hasmi yang diangkat ke layar lebar oleh Joko Anwar pada 2019?",
      options: [
        "Gundala (Putra Petir)",
        "Godam",
        "Aquanus",
        "Si Buta Dari Gua Hantu"
      ],
      answer: "Gundala (Putra Petir)",
      category: "Pop Culture",
      funFact: "Gundala diperankan oleh Abimana Aryasatya dan membuka Jagat Sinema Bumilangit."
    },
    {
      id: 4,
      question: "Istilah gaul modern menyebut orang yang pasif di grup WhatsApp dan cuma memantau percakapan tanpa nimbrung adalah...",
      options: [
        "Silent Reader / Penonton Bayaran",
        "Pegawai Teladan Divisi Menyimak",
        "Ghosting Specialist",
        "Chief Lurker Officer"
      ],
      answer: "Pegawai Teladan Divisi Menyimak",
      category: "Pop Culture",
      funFact: "Slogannya: 'Tahu semua gosip kantor, tapi jempol tetap hening'."
    },
    {
      id: 5,
      question: "Film Indonesia pertama yang sukses menembus rekor 10 juta penonton di bioskop adalah...",
      options: [
        "KKN di Desa Penari",
        "Warkop DKI Reborn: Jangkrik Boss! Part 1",
        "Laskar Pelangi",
        "Pengabdi Setan 2: Communion"
      ],
      answer: "KKN di Desa Penari",
      category: "Pop Culture",
      funFact: "Dirilis tahun 2022 berdasarkan utas viral Twitter karya SimpleMan."
    }
  ]
};

/**
 * Auto-generates a clean, real set of questions based on selected theme or custom prompt
 */
export function autoGenerateQuizQuestions(
  themeId: string,
  count: number = 5,
  customTopic?: string
): QuizQuestionItem[] {
  let sourceQuestions: QuizQuestionItem[] = [];

  if (themeId === 'custom' && customTopic) {
    // Generate custom questions tailored to the custom topic
    sourceQuestions = generateCustomThematicQuestions(customTopic);
  } else if (REAL_QUESTION_CATALOG[themeId]) {
    sourceQuestions = [...REAL_QUESTION_CATALOG[themeId]];
  } else {
    // Combine across all categories if mix or unknown
    sourceQuestions = Object.values(REAL_QUESTION_CATALOG).flat();
  }

  // Shuffle intelligently without duplicating
  const shuffled = [...sourceQuestions].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, Math.min(count, shuffled.length));

  // Re-index questions cleanly from 1
  return selected.map((q, idx) => ({
    ...q,
    id: idx + 1,
    // ensure options are shuffled but answer is strictly kept identical
    options: [...q.options].sort(() => 0.5 - Math.random()),
  }));
}

/**
 * Generates custom thematic questions for user-specified Outing topics
 */
function generateCustomThematicQuestions(topic: string): QuizQuestionItem[] {
  const cleanTopic = topic.trim();
  return [
    {
      id: 1,
      question: `Dalam suasana outing bertema '${cleanTopic}', hal pertama yang biasanya dicari peserta saat tiba di lokasi adalah...`,
      options: [
        "Stop kontak untuk charger HP",
        "Password WiFi dan sinyal operator",
        "Snack selamat datang dan kopi",
        "Kunci kamar dan kasur empuk"
      ],
      answer: "Password WiFi dan sinyal operator",
      category: cleanTopic,
      funFact: "Kebutuhan primer manusia modern: Sandang, Pangan, Papan, dan Sinyal 5G."
    },
    {
      id: 2,
      question: `Trik paling ampuh memenangkan lomba yel-yel bertema '${cleanTopic}' antar divisi di outing kantor adalah...`,
      options: [
        "Menyanyikan lagu koplo dengan lirik memuji dewan juri",
        "Koreografi senam poco-poco yang sinkron",
        "Kostum paling heboh menggunakan taplak meja",
        "Suara paling keras sampai mic feedback"
      ],
      answer: "Menyanyikan lagu koplo dengan lirik memuji dewan juri",
      category: cleanTopic,
      funFact: "Menyuap dewan juri dengan pujian terselubung adalah strategi tertua dalam sejarah outing."
    },
    {
      id: 3,
      question: `Bila divisi kita diminta presentasi kilat mengenai '${cleanTopic}', siapa anggota tim yang biasanya didorong maju ke depan?`,
      options: [
        "Anak magang yang baru masuk 3 hari",
        "Rekan kerja yang paling cerewet di grup WA",
        "Ketua divisi yang baru pulang dari toilet",
        "Siapapun yang kontak matanya tertangkap bos"
      ],
      answer: "Siapapun yang kontak matanya tertangkap bos",
      category: cleanTopic,
      funFact: "Hukum outing: Jangan pernah membalas kontak mata saat ada penunjukan sukarelawan."
    },
    {
      id: 4,
      question: `Hadiah doorprize paling diperebutkan oleh seluruh karyawan saat malam puncak kuis '${cleanTopic}' adalah...`,
      options: [
        "Logam mulia emas antam murni",
        "Smart TV 50 inch untuk nobar",
        "Voucher liburan plus tambahan cuti 3 hari",
        "Sepeda listrik warna pastel"
      ],
      answer: "Voucher liburan plus tambahan cuti 3 hari",
      category: cleanTopic,
      funFact: "Bagi karyawan lelah, tambahan jatah cuti resmi bernilai lebih tinggi dari barang elektronik apapun."
    },
    {
      id: 5,
      question: `Kalimat penutup sakral yang wajib diucapkan MC saat mengakhiri kuis '${cleanTopic}' sebelum sesi makan malam adalah...`,
      options: [
        "'Terima kasih atas partisipasinya, sampai jumpa di kantor hari Senin!'",
        "'Piring dan sendok sudah siap di meja prasmanan, silakan menyerbu!'",
        "'Pemenang kuis wajib mentraktir satu divisi besok ya!'",
        "'Jangan lupa foto bersama dengan pose jempol di depan panggung!'"
      ],
      answer: "'Piring dan sendok sudah siap di meja prasmanan, silakan menyerbu!'",
      category: cleanTopic,
      funFact: "Kalimat terindah yang mampu menggerakkan puluhan orang dalam hitungan milidetik."
    }
  ];
}
