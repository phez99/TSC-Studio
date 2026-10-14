export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  answer: string;
  category: 'Dunia Kerja' | 'Tebak Logika & Pop-Culture' | 'Tebak Lagu & Istilah';
  funFact?: string;
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "Pertanyaan sakral yang paling sering muncul di grup WhatsApp divisi tepat jam 11.45 siang adalah...",
    options: [
      "Ada yang punya charger type C?",
      "Makan siang di mana hari ini guys?",
      "Meeting jam 1 jadi gak?",
      "Draft revisi sudah dikirim ke email"
    ],
    answer: "Makan siang di mana hari ini guys?",
    category: "Dunia Kerja",
    funFact: "99% perdebatan terpanjang di kantor bukan soal KPI, melainkan menentukan tempat makan siang."
  },
  {
    id: 2,
    question: "Apa arti psikologis sebenarnya saat rekan kerja mengirim email bertuliskan 'Per my previous email' atau 'Sesuai email saya sebelumnya'?",
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
    question: "Refleks darurat apa yang paling spontan dilakukan karyawan saat tiba-tiba bos besar jalan santai di belakang kursi kerja?",
    options: [
      "Pura-pura menatap tajam spreadsheet Excel yang kosong",
      "Langsung berdiri tegak hormat bendera",
      "Mengetik keyboard acak dengan ekspresi muka tegang",
      "Tiba-tiba pura-pura batuk kering"
    ],
    answer: "Pura-pura menatap tajam spreadsheet Excel yang kosong",
    category: "Dunia Kerja",
    funFact: "Excel kosong dengan ekspresi dahi berkerut adalah tameng pertahanan terkuat karyawan."
  },
  {
    id: 4,
    question: "Kapan kecepatan mengetik dan respons chat karyawan melonjak 300% lebih cepat dibanding biasanya?",
    options: [
      "Saat bos bertanya update laporan mingguan",
      "Saat klien komplain revisi belum beres",
      "Saat notifikasi chat: 'Gajian sudah masuk' atau 'Ada gorengan di pantry'",
      "Saat ada ajakan Zoom mendadak hari Minggu"
    ],
    answer: "Saat notifikasi chat: 'Gajian sudah masuk' atau 'Ada gorengan di pantry'",
    category: "Dunia Kerja",
    funFact: "Gorengan hangat di pantry memiliki daya gravitasi lebih kuat daripada deadline kuartal."
  },
  {
    id: 5,
    question: "Jika seorang atasan atau klien bilang 'Tenang aja, revisinya minor kok...', realita di lapangan biasanya adalah...",
    options: [
      "Cuma ubah satu tanda titik atau koma",
      "Hanya ganti warna tombol jadi agak gelap sedikit",
      "Harus rombak 80% konsep dan lembur sampai malam",
      "Pekerjaan langsung dianggap selesai dan approved"
    ],
    answer: "Harus rombak 80% konsep dan lembur sampai malam",
    category: "Dunia Kerja",
    funFact: "Kata 'minor' dalam kamus revisi berbanding lurus dengan jumlah kopi yang harus diseduh."
  },
  {
    id: 6,
    question: "Tebak-tebakan logika: Pintu apa yang meskipun didorong sekuat tenaga oleh 10 binaragawan tetap tidak akan terbuka?",
    options: [
      "Pintu darurat mall",
      "Pintu gerbang tol otomatis",
      "Pintu lift yang macet",
      "Pintu yang ada tulisan 'TARIK'"
    ],
    answer: "Pintu yang ada tulisan 'TARIK'",
    category: "Tebak Logika & Pop-Culture",
    funFact: "Hukum fisika kalah telak dengan instruksi sederhana tulisan di gagang pintu."
  },
  {
    id: 7,
    question: "Secara ilmiah dan logika pop-culture, kenapa pahlawan super Superman kalau lagi terbang tangan kanannya selalu dijulurkan ke depan?",
    options: [
      "Biar memecah hambatan angin aerodinamis",
      "Supaya gak nabrak tiang listrik dan kabel layangan",
      "Karena kalau tangannya ditekuk dua-duanya disangka lagi push-up di udara",
      "Biar bisa sekalian pamer jam tangan"
    ],
    answer: "Karena kalau tangannya ditekuk dua-duanya disangka lagi push-up di udara",
    category: "Tebak Logika & Pop-Culture",
    funFact: "Bayangkan Superman melayang di langit sambil dikira lagi latihan calisthenics."
  },
  {
    id: 8,
    question: "Di film Harry Potter, mantra 'Alohomora' membuka gembok pintu. Di kantor kita, kata mantra apa yang paling cepat bikin orang kumpul serentak di pantry?",
    options: [
      "'Pak bos lagi dinas luar kota'",
      "'Ada traktiran pizza dan kopi gratis di meja tengah'",
      "'Koneksi wifi kantor mati mendadak'",
      "'Mesin fotokopi mengeluarkan asap'"
    ],
    answer: "'Ada traktiran pizza dan kopi gratis di meja tengah'",
    category: "Tebak Logika & Pop-Culture",
    funFact: "Mantra legendaris ini terbukti bisa memanggil seluruh divisi hanya dalam waktu 7 detik."
  },
  {
    id: 9,
    question: "Tebak-tebakan: Apa perbedaan paling mendasar antara 'Kucing' dan rekan kerja yang lagi 'Kuker' (Kurang Kerjaian)?",
    options: [
      "Kucing suka ikan, rekan kuker suka jajan seblak",
      "Kucing bunyinya 'meong', kalau kuker bunyinya: 'Eh, spill gosip divisi sebelah dong!'",
      "Kucing berkaki empat, rekan kuker berkaki dua",
      "Kucing tidur siang di sofa, rekan kuker tidur di bawah meja"
    ],
    answer: "Kucing bunyinya 'meong', kalau kuker bunyinya: 'Eh, spill gosip divisi sebelah dong!'",
    category: "Tebak Logika & Pop-Culture",
    funFact: "Rasa ingin tahu kucing tinggi, tapi rasa ingin tahu rekan kuker terhadap drama kantor jauh lebih tinggi."
  },
  {
    id: 10,
    question: "Kota atau daerah apa di Indonesia yang warganya terkenal paling sabar, tabah, dan tidak pernah emosi?",
    options: [
      "Kota Bandung",
      "Kota Sabang (karena Sa-bang-et sabarnya)",
      "Kota Cikarang",
      "Kota Malang"
    ],
    answer: "Kota Sabang (karena Sa-bang-et sabarnya)",
    category: "Tebak Logika & Pop-Culture",
    funFact: "Plesetan klasik bapak-bapak yang selalu sukses bikin peserta outing tersenyum getir."
  },
  {
    id: 11,
    question: "Lengkapi lirik lagu ulang tahun legendaris dari band Jamrud ini: 'Ulang tahunmu, kami bawa hadiah... Datang ke rumahmu, bawa...'?",
    options: [
      "Kue tart cokelat dan lilin",
      "Martabak manis keju spesial",
      "Kado dibungkus koran",
      "Bunga mawar merah setangkai"
    ],
    answer: "Kado dibungkus koran",
    category: "Tebak Lagu & Istilah",
    funFact: "Koran bekas kemarin sore adalah pembungkus kado paling otentik di era 90-an dan 2000-an."
  },
  {
    id: 12,
    question: "Singkatan aslinya adalah 'Fear Of Missing Out'. Namun bagi karyawan di tanggal 25 ke atas, istilah 'FOMO' berubah kepanjangannya jadi...",
    options: [
      "Focus On Meeting Online",
      "Fulus Otw Menipis Oy",
      "Financial Order Must Optimize",
      "Fast Output Maximum Overtime"
    ],
    answer: "Fulus Otw Menipis Oy",
    category: "Tebak Lagu & Istilah",
    funFact: "Kondisi di mana saldo rekening mulai menguji ketabahan iman dan kesabaran."
  },
  {
    id: 13,
    question: "Penggalan lagu hits Sheila On 7 mana yang paling sering diteriakkan dalam hati setiap jam 17.00 di hari Jumat?",
    options: [
      "'Melompat lebih tinggi!'",
      "'Dan... bila esok... datang kembali...'",
      "'Seberapa pantas kau untuk kutunggu...'",
      "'Kupetik bintang untuk kau simpan...'"
    ],
    answer: "'Melompat lebih tinggi!'",
    category: "Tebak Lagu & Istilah",
    funFact: "Lagu wajib untuk soundtrack menutup laptop dan langsung melesat keluar lobi."
  },
  {
    id: 14,
    question: "Istilah gaul modern menyebut orang yang suka bengong dan cuma ikut nimbrung di rapat tanpa bersuara sebagai...",
    options: [
      "Senior Strategic Thinker",
      "Pegawai Teladan Divisi Menyimak",
      "Chief Silence Officer",
      "Observer Spesialis Notulensi"
    ],
    answer: "Pegawai Teladan Divisi Menyimak",
    category: "Tebak Lagu & Istilah",
    funFact: "Prinsip hidupnya: 'Malu bertanya sesat di jalan, banyak bertanya nambah kerjaan'."
  },
  {
    id: 15,
    question: "Lagu legendaris 'Kemesraan ini... janganlah cepat berlalu...' biasanya menjadi lagu wajib yang dinyanyikan saat momen apa dalam Outing Kantor?",
    options: [
      "Makan pagi sebelum berangkat naik bus",
      "Sesi penutupan malam keakraban / api unggun sambil rangkulan pundak",
      "Saat berebut kursi bus paling belakang",
      "Ketika antre mengambil nasi kotak makan siang"
    ],
    answer: "Sesi penutupan malam keakraban / api unggun sambil rangkulan pundak",
    category: "Tebak Lagu & Istilah",
    funFact: "Momen magis di mana bos dan anak magang menyatu dalam harmoni sebelum hari Senin kembali menyapa."
  }
];

// Pure JSON format exactly matching the user request
export const RAW_QUIZ_JSON = QUIZ_QUESTIONS.map(({ id, question, options, answer }) => ({
  id,
  question,
  options,
  answer
}));
