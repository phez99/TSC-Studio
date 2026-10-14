import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';

export interface QuizQuestionItem {
  id: number;
  question: string;
  options: string[];
  answer: string;
  category?: string;
  funFact?: string;
}

export interface ParticipantAnswer {
  option: string;
  isCorrect: boolean;
  points: number;
  timeTakenMs: number;
  answeredAt: number;
}

export interface Participant {
  id: string;
  name: string;
  avatarColor: string;
  score: number;
  streak: number;
  lastPointsEarned: number;
  answers: Record<number, ParticipantAnswer>;
  joinedAt: number;
}

export type RoomStatus = 'lobby' | 'reading' | 'question' | 'answered_summary' | 'leaderboard' | 'finished';

export type ChallengeCategory =
  | 'Parodi & Akting Viral'
  | 'Goyang Viral & TikTok'
  | 'Jujur & Curhat Huru-Hara'
  | 'Tirukan Suara & Hewan'
  | 'Tahan Tawa & Muka Jelek'
  | 'Gombalan Absurd & Rayuan'
  | 'Tantangan Fisik Kocak'
  | 'Nyanyi Hancur & Karaoke Rusak'
  | 'Prank Telepon & Chat Halu'
  | 'Bintang Iklan Nyeleneh';

export interface ArisanChallenge {
  id: string;
  category: ChallengeCategory;
  title: string;
  description: string;
  votes: string[];
}

export interface ArisanWinnerRecord {
  participantId: string;
  participantName: string;
  challenge: ArisanChallenge;
  completedAt: number;
}

export interface ArisanState {
  isSpinning: boolean;
  selectedParticipantId: string | null;
  selectedParticipantName: string | null;
  excludedParticipantIds: string[];
  challenges: ArisanChallenge[];
  activeChallenge: ArisanChallenge | null;
  isVotingOpen: boolean;
  selectedCategoryFilter?: string;
  winnersHistory: ArisanWinnerRecord[];
}

export interface Room {
  pin: string;
  title: string;
  topic: string;
  operatorName: string;
  status: RoomStatus;
  currentQuestionIndex: number;
  questionTimeLimit: number;
  questionStartTime: number | null;
  questions: QuizQuestionItem[];
  participants: Record<string, Participant>;
  arisan: ArisanState;
  createdAt: number;
  updatedAt: number;
}

const rooms = new Map<string, Room>();

const AVATAR_COLORS = [
  'bg-red-500',
  'bg-blue-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-teal-500',
  'bg-indigo-500',
];

// 10 Entertainment categories for Outing challenge
export const TEN_CHALLENGE_CATEGORIES: ChallengeCategory[] = [
  'Parodi & Akting Viral',
  'Goyang Viral & TikTok',
  'Jujur & Curhat Huru-Hara',
  'Tirukan Suara & Hewan',
  'Tahan Tawa & Muka Jelek',
  'Gombalan Absurd & Rayuan',
  'Tantangan Fisik Kocak',
  'Nyanyi Hancur & Karaoke Rusak',
  'Prank Telepon & Chat Halu',
  'Bintang Iklan Nyeleneh',
];

const CHALLENGES_POOL: Record<ChallengeCategory, { title: string; description: string }[]> = {
  'Parodi & Akting Viral': [
    {
      title: 'Tiru Gaya Bos Besar Saat Marah Revisi',
      description: 'Tirukan ekspresi, intonasi, dan gestur atasan ketika revisi belum selesai saat jam 5 sore selama 30 detik!'
    },
    {
      title: 'Akting Drama Sinetron Azab',
      description: 'Peragakan adegan tersambar petir pura-pura sambil teriak minta maaf ke rekan kerja terdekat!'
    },
    {
      title: 'Parodi Selebgram Spill Gosip',
      description: 'Bicara ala selebgram TikTok: "Guys jadi aku mau spill drama anak divisi sebelah..." dengan gaya sok misterius!'
    },
    {
      title: 'Tebak Gestur Rekan Kantor',
      description: 'Peragakan cara jalan dan kebiasaan 1 orang di kantor tanpa suara sampai penonton bisa menebak namanya!'
    }
  ],
  'Goyang Viral & TikTok': [
    {
      title: 'Joget Tren TikTok Tanpa Musik',
      description: 'Tampilkan gerakan joget viral TikTok / goyang asoy di depan panggung selama 30 detik dalam keheningan total!'
    },
    {
      title: 'Senam Pinguin Kolosal',
      description: 'Pimpin senam pinguin heboh dan ajak minimal 2 orang lain untuk ikut menirukan di panggung!'
    },
    {
      title: 'Goyang Koplo Slow-Motion',
      description: 'Berjoget koplo dengan gerakan lambat (slow-motion) seolah-olah terkena efek kamera Matrix!'
    },
    {
      title: 'Battle Dance Spontan',
      description: 'Ajak operator atau salah satu rekan kerja untuk adu gaya joget terheboh selama 20 detik!'
    }
  ],
  'Jujur & Curhat Huru-Hara': [
    {
      title: 'Bongkar Misteri Sibuk',
      description: 'Sebutkan dengan jujur: Siapa di kantor yang menurutmu paling jago pura-pura sibuk ngetik padahal lagi bengong?'
    },
    {
      title: 'Momen Paling Memalukan',
      description: 'Ceritakan satu rahasia momen paling bikin malu atau canggung yang pernah kamu alami saat kerja di kantor ini!'
    },
    {
      title: 'Revisi Aturan Kantor 1 Hari',
      description: 'Jika kamu diangkat jadi Direktur Utama selama 1 hari besok, peraturan kantor apa yang paling pertama kamu hapus?'
    },
    {
      title: 'Duta Gorengan Pantry',
      description: 'Jujur: Berapa gorengan dan sachet kopi kantor terbanyak yang pernah kamu timbun di laci meja kerjamu?'
    }
  ],
  'Tirukan Suara & Hewan': [
    {
      title: 'Suara Ayam Kejepit Pintu',
      description: 'Tirukan kokok ayam jantan yang mendadak ekornya kejepit pintu sebanyak 3 kali dengan ekspresi panik!'
    },
    {
      title: 'Abang Tahu Bulat Digoreng Dadakan',
      description: 'Tirukan rekaman suara abang tahu bulat keliling sedetail dan semirip mungkin lewat mikrofon!'
    },
    {
      title: 'Knalpot Motor Bobok Rusak',
      description: 'Tirukan suara knalpot motor brong yang lagi digeber di lampu merah selama 15 detik nonstop!'
    },
    {
      title: 'Suara Kucing Kelaparan Rebutan Ikan',
      description: 'Ngeong dengan nada paling memelas ke orang di sampingmu sampai dia mengusap kepalamu!'
    }
  ],
  'Tahan Tawa & Muka Jelek': [
    {
      title: 'Tahan Tawa Batu Karang 30 Detik',
      description: 'Tatap muka rekan kerjamu selama 30 detik tanpa boleh senyum sedikit pun, sementara rekanmu bebas melawak!'
    },
    {
      title: 'Pose Wajah Terjelek Kamera Depan',
      description: 'Tampilkan ekspresi wajah terjelek dan terlucu selama 10 detik penuh ke arah kamera proyektor!'
    },
    {
      title: 'Tertawa Hambar Terpaksa',
      description: 'Peragakan tawa palsu bapak-bapak saat mendengar lelucon garing dari bos selama 20 detik!'
    },
    {
      title: 'Ekspresi Kaget Mendadak Gajian',
      description: 'Tampilkan 3 variasi ekspresi wajah kaget saat melihat notifikasi m-banking bertambah saldo!'
    }
  ],
  'Gombalan Absurd & Rayuan': [
    {
      title: 'Rayu Sapu atau Botol Air',
      description: 'Tatap sebuah botol minum atau sapu dan ucapkan kalimat rayuan gombal paling romantis seolah dia pasanganmu!'
    },
    {
      title: 'Gombalan Istilah IT / Kantor',
      description: 'Bikin 1 rayuan maut menggunakan istilah kerja kantor (misal: spreadsheet, KPI, server down, revisi)!'
    },
    {
      title: 'Pantun Buah & Bunga Spontan',
      description: 'Buat pantun 4 baris spontan untuk orang di depanmu dalam waktu 20 detik!'
    },
    {
      title: 'Pujian Berlebihan Tanpa Logika',
      description: 'Puji rekan kerjamu dengan 5 pujian yang semakin lama semakin tidak masuk akal!'
    }
  ],
  'Tantangan Fisik Kocak': [
    {
      title: 'Push-up Menu Pantry Kantor',
      description: 'Push-up 5 kali, tapi setiap kali badan naik wajib teriakkan 1 nama makanan kesukaan di kantor!'
    },
    {
      title: 'Jalan Jinjit Mundur Gaya Robot',
      description: 'Berjalan jinjit mundur mengelilingi ruangan dengan gerakan kaku seperti robot kehabisan baterai!'
    },
    {
      title: 'Supermodel 5 Pose Kilat',
      description: 'Lakukan 5 gaya foto model majalah kelas dunia yang berbeda dalam hitungan 5 detik bergantian!'
    },
    {
      title: 'Tebak Benda di Punggung',
      description: 'Tebak benda kantor yang ditaruh rekanmu di punggungmu hanya dengan merasakan beratnya!'
    }
  ],
  'Nyanyi Hancur & Karaoke Rusak': [
    {
      title: 'Balonku Vokal O Penuh Derita',
      description: 'Nyanyikan lagu "Balonku Ada Lima" tapi SEMUA huruf vokalnya diganti jadi "O" dengan nada super mellow!'
    },
    {
      title: 'Rap Nama-Nama Teman Divisi',
      description: 'Nge-rap dadakan dengan tempo cepat menyebutkan 5 nama teman kantor dan kebiasaannya!'
    },
    {
      title: 'Pelangi-Pelangi Versi Rock Cadas',
      description: 'Nyanyikan lagu anak "Pelangi-Pelangi" dengan gaya vokalis band rock metal berteriak!'
    },
    {
      title: 'Lipsync Lagu Galau Penuh Jiwa',
      description: 'Pura-pura lipsync lagu galau dengan penghayatan dramatis sampai berlutut di panggung!'
    }
  ],
  'Prank Telepon & Chat Halu': [
    {
      title: 'Voice Note Rindu Rekan Cuti',
      description: 'Kirim pesan suara (VN) WA ke salah satu teman yang gak ikut outing: "Bro, aku kangen banget sama tawamu..."!'
    },
    {
      title: 'Telepon Pura-Pura Darurat Kopi',
      description: 'Telepon rekan kerjamu dan panik bilang: "Gawat banget, kopi di pantry rasanya kayak teh manis!"!'
    },
    {
      title: 'Chat Typo Absurd ke Grup Divisi',
      description: 'Ketik 1 chat typo lucu di grup WhatsApp divisi lalu pura-pura tidak sadar selama 2 menit!'
    },
    {
      title: 'Selfie Muka Datar Kirim ke Teman',
      description: 'Foto selfie muka datar di depan panggung dan kirim ke grup kantor dengan caption: "Aku terjebak di sini."'
    }
  ],
  'Bintang Iklan Nyeleneh': [
    {
      title: 'Iklan Sandal Jepit 50 Juta',
      description: 'Pegang sebuah sandal jepit dan promosikan di depan panggung sebagai sandal titanium berteknologi NASA seharga 50 juta!'
    },
    {
      title: 'Obat Herbal Anti-Revisi Bos',
      description: 'Presentasikan produk fiktif "Kapsul Anti-Revisi" yang menjamin semua pekerjaan langsung di-approve atasan!'
    },
    {
      title: 'Sales Brosur Kosong',
      description: 'Pegang selembar tisu atau kertas kosong dan yakinkan 2 orang penonton untuk tanda tangan kontrak investasi!'
    },
    {
      title: 'Iklan Kopi Sachet Rasa Kari Ayam',
      description: 'Peragakan bintang iklan TV yang mencicipi kopi unik rasa kari ayam dengan ekspresi nikmat luar biasa!'
    }
  ]
};

function getRandomChallenges(preferredCategory?: ChallengeCategory): ArisanChallenge[] {
  let categoriesToPick: ChallengeCategory[] = [];

  if (preferredCategory && CHALLENGES_POOL[preferredCategory]) {
    categoriesToPick = [preferredCategory];
    // Fill remaining 2 categories randomly
    const others = TEN_CHALLENGE_CATEGORIES.filter(c => c !== preferredCategory).sort(() => 0.5 - Math.random());
    categoriesToPick.push(others[0], others[1]);
  } else {
    // Pick 3 distinct random categories from the 10
    const shuffled = [...TEN_CHALLENGE_CATEGORIES].sort(() => 0.5 - Math.random());
    categoriesToPick = shuffled.slice(0, 3);
  }

  return categoriesToPick.map((cat, idx) => {
    const list = CHALLENGES_POOL[cat];
    const picked = list[Math.floor(Math.random() * list.length)];
    return {
      id: 'ch_' + idx + '_' + Math.random().toString(36).substring(2, 6),
      category: cat,
      title: picked.title,
      description: picked.description,
      votes: [],
    };
  });
}

function createDefaultArisanState(): ArisanState {
  return {
    isSpinning: false,
    selectedParticipantId: null,
    selectedParticipantName: null,
    excludedParticipantIds: [],
    challenges: getRandomChallenges(),
    activeChallenge: null,
    isVotingOpen: false,
    winnersHistory: [],
  };
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Enable CORS
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // ---------------------------------------------------------------------------
  // API: ROOMS
  // ---------------------------------------------------------------------------

  // List all active rooms
  app.get('/api/rooms', (req, res) => {
    const list = Array.from(rooms.values()).sort((a, b) => b.createdAt - a.createdAt);
    res.json(list);
  });

  // Get room by PIN
  app.get('/api/rooms/:pin', (req, res) => {
    const pin = req.params.pin.trim();
    const room = rooms.get(pin);
    if (!room) {
      return res.status(404).json({ error: 'Room dengan PIN ini tidak ditemukan!' });
    }
    res.json(room);
  });

  // Create room
  app.post('/api/rooms', (req, res) => {
    const { title, topic, questions, timeLimit, operatorName } = req.body;

    let pin = '';
    do {
      pin = Math.floor(100000 + Math.random() * 900000).toString();
    } while (rooms.has(pin));

    const newRoom: Room = {
      pin,
      title: title || `TSC Studio Outing #${pin.slice(-3)}`,
      topic: topic || 'Outing Kantor',
      operatorName: operatorName || 'Operator TSC Studio',
      status: 'lobby',
      currentQuestionIndex: 0,
      questionTimeLimit: timeLimit || 20,
      questionStartTime: null,
      questions: questions || [],
      participants: {},
      arisan: createDefaultArisanState(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    rooms.set(pin, newRoom);
    res.status(201).json(newRoom);
  });

  // Participant join room
  app.post('/api/rooms/:pin/join', (req, res) => {
    const pin = req.params.pin.trim();
    const { name } = req.body;

    const room = rooms.get(pin);
    if (!room) {
      return res.status(404).json({ error: 'Room dengan PIN ini tidak ditemukan!' });
    }

    const trimmedName = (name || '').trim();
    if (!trimmedName) {
      return res.status(400).json({ error: 'Nama peserta wajib diisi!' });
    }

    const existing = Object.values(room.participants).find(
      (p) => p.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (existing) {
      return res.json({ success: true, participant: existing, room });
    }

    const count = Object.keys(room.participants).length;
    const avatarColor = AVATAR_COLORS[count % AVATAR_COLORS.length];
    const participantId = 'p_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);

    const newParticipant: Participant = {
      id: participantId,
      name: trimmedName,
      avatarColor,
      score: 0,
      streak: 0,
      lastPointsEarned: 0,
      answers: {},
      joinedAt: Date.now(),
    };

    room.participants[participantId] = newParticipant;
    room.updatedAt = Date.now();

    res.json({ success: true, participant: newParticipant, room });
  });

  // Operator starts quiz -> enters 'reading' phase (Operator reads question, options hidden)
  app.post('/api/rooms/:pin/start', (req, res) => {
    const pin = req.params.pin.trim();
    const room = rooms.get(pin);
    if (!room) {
      return res.status(404).json({ error: 'Room tidak ditemukan' });
    }

    room.status = 'reading';
    room.currentQuestionIndex = 0;
    room.questionStartTime = null;
    room.updatedAt = Date.now();

    res.json(room);
  });

  // Operator presses "GO" -> shows options A,B,C,D and starts timer!
  app.post('/api/rooms/:pin/go', (req, res) => {
    const pin = req.params.pin.trim();
    const room = rooms.get(pin);
    if (!room) {
      return res.status(404).json({ error: 'Room tidak ditemukan' });
    }

    room.status = 'question';
    room.questionStartTime = Date.now();
    room.updatedAt = Date.now();

    res.json(room);
  });

  // Participant submit answer
  app.post('/api/rooms/:pin/answer', (req, res) => {
    const pin = req.params.pin.trim();
    const { participantId, questionIndex, selectedOption, timeRemainingSeconds } = req.body;

    const room = rooms.get(pin);
    if (!room) {
      return res.status(404).json({ error: 'Room tidak ditemukan' });
    }

    const participant = room.participants[participantId];
    const question = room.questions[questionIndex];

    if (!participant || !question) {
      return res.status(400).json({ error: 'Data peserta atau soal tidak valid' });
    }

    if (participant.answers[questionIndex]) {
      return res.json({
        isCorrect: participant.answers[questionIndex].isCorrect,
        points: participant.answers[questionIndex].points,
        participant,
      });
    }

    const isCorrect = selectedOption === question.answer;
    let points = 0;

    if (isCorrect) {
      const totalTime = room.questionTimeLimit || 20;
      const speedRatio = Math.max(0, Math.min(1, (timeRemainingSeconds || 0) / totalTime));
      const speedBonus = Math.round(500 * speedRatio);
      const streakBonus = Math.min(participant.streak * 50, 250);
      points = 500 + speedBonus + streakBonus;

      participant.score += points;
      participant.streak += 1;
      participant.lastPointsEarned = points;
    } else {
      participant.streak = 0;
      participant.lastPointsEarned = 0;
    }

    const timeTakenMs = room.questionStartTime ? Date.now() - room.questionStartTime : 0;

    participant.answers[questionIndex] = {
      option: selectedOption,
      isCorrect,
      points,
      timeTakenMs,
      answeredAt: Date.now(),
    };

    room.updatedAt = Date.now();
    res.json({ isCorrect, points, participant });
  });

  // Operator reveal answer summary
  app.post('/api/rooms/:pin/reveal', (req, res) => {
    const pin = req.params.pin.trim();
    const room = rooms.get(pin);
    if (!room) {
      return res.status(404).json({ error: 'Room tidak ditemukan' });
    }

    room.status = 'answered_summary';
    room.updatedAt = Date.now();
    res.json(room);
  });

  // Operator show leaderboard
  app.post('/api/rooms/:pin/leaderboard', (req, res) => {
    const pin = req.params.pin.trim();
    const room = rooms.get(pin);
    if (!room) {
      return res.status(404).json({ error: 'Room tidak ditemukan' });
    }

    room.status = 'leaderboard';
    room.updatedAt = Date.now();
    res.json(room);
  });

  // Operator next question -> enters 'reading' phase for the next question!
  app.post('/api/rooms/:pin/next', (req, res) => {
    const pin = req.params.pin.trim();
    const room = rooms.get(pin);
    if (!room) {
      return res.status(404).json({ error: 'Room tidak ditemukan' });
    }

    if (room.currentQuestionIndex + 1 < room.questions.length) {
      room.currentQuestionIndex += 1;
      room.status = 'reading'; // Enters reading phase!
      room.questionStartTime = null;
    } else {
      room.status = 'finished';
    }
    room.updatedAt = Date.now();
    res.json(room);
  });

  // Operator finish quiz
  app.post('/api/rooms/:pin/finish', (req, res) => {
    const pin = req.params.pin.trim();
    const room = rooms.get(pin);
    if (!room) {
      return res.status(404).json({ error: 'Room tidak ditemukan' });
    }

    room.status = 'finished';
    room.updatedAt = Date.now();
    res.json(room);
  });

  // ---------------------------------------------------------------------------
  // API: ARISAN & CHALLENGE (10 CATEGORIES)
  // ---------------------------------------------------------------------------

  // Spin Arisan: pick random participant & 3 challenges from 10 categories
  app.post('/api/rooms/:pin/arisan/spin', (req, res) => {
    const pin = req.params.pin.trim();
    const { categoryFilter } = req.body || {};
    const room = rooms.get(pin);
    if (!room) {
      return res.status(404).json({ error: 'Room tidak ditemukan' });
    }

    if (!room.arisan) {
      room.arisan = createDefaultArisanState();
    }

    const allParticipants = Object.values(room.participants);
    if (allParticipants.length === 0) {
      return res.status(400).json({ error: 'Belum ada peserta yang bergabung!' });
    }

    let available = allParticipants.filter(p => !room.arisan.excludedParticipantIds.includes(p.id));
    if (available.length === 0) {
      room.arisan.excludedParticipantIds = [];
      available = allParticipants;
    }

    const picked = available[Math.floor(Math.random() * available.length)];
    const newChallenges = getRandomChallenges(categoryFilter as ChallengeCategory);

    room.arisan.isSpinning = false;
    room.arisan.selectedParticipantId = picked.id;
    room.arisan.selectedParticipantName = picked.name;
    room.arisan.challenges = newChallenges;
    room.arisan.activeChallenge = null;
    room.arisan.isVotingOpen = false;
    room.arisan.selectedCategoryFilter = categoryFilter;
    room.updatedAt = Date.now();

    res.json(room);
  });

  // Toggle Voting Open/Close
  app.post('/api/rooms/:pin/arisan/toggle-vote', (req, res) => {
    const pin = req.params.pin.trim();
    const { isOpen } = req.body;
    const room = rooms.get(pin);
    if (!room || !room.arisan) {
      return res.status(404).json({ error: 'Room atau Arisan tidak ditemukan' });
    }

    room.arisan.isVotingOpen = isOpen !== undefined ? Boolean(isOpen) : !room.arisan.isVotingOpen;
    room.updatedAt = Date.now();
    res.json(room);
  });

  // Participant votes for a challenge
  app.post('/api/rooms/:pin/arisan/vote', (req, res) => {
    const pin = req.params.pin.trim();
    const { participantId, challengeId } = req.body;
    const room = rooms.get(pin);
    if (!room || !room.arisan) {
      return res.status(404).json({ error: 'Room atau Arisan tidak ditemukan' });
    }

    if (!room.arisan.isVotingOpen) {
      return res.status(400).json({ error: 'Voting sudah ditutup!' });
    }

    room.arisan.challenges.forEach(ch => {
      ch.votes = ch.votes.filter(id => id !== participantId);
    });

    const target = room.arisan.challenges.find(ch => ch.id === challengeId);
    if (target) {
      target.votes.push(participantId);
    }

    room.updatedAt = Date.now();
    res.json(room);
  });

  // Operator selects a challenge
  app.post('/api/rooms/:pin/arisan/select-challenge', (req, res) => {
    const pin = req.params.pin.trim();
    const { challengeId } = req.body;
    const room = rooms.get(pin);
    if (!room || !room.arisan) {
      return res.status(404).json({ error: 'Room atau Arisan tidak ditemukan' });
    }

    let selected: ArisanChallenge | undefined;
    if (challengeId) {
      selected = room.arisan.challenges.find(ch => ch.id === challengeId);
    } else {
      const sorted = [...room.arisan.challenges].sort((a, b) => b.votes.length - a.votes.length);
      selected = sorted[0];
    }

    if (selected) {
      room.arisan.activeChallenge = selected;
      room.arisan.isVotingOpen = false;
      room.updatedAt = Date.now();
    }

    res.json(room);
  });

  // Complete challenge and save to winner history
  app.post('/api/rooms/:pin/arisan/complete', (req, res) => {
    const pin = req.params.pin.trim();
    const room = rooms.get(pin);
    if (!room || !room.arisan) {
      return res.status(404).json({ error: 'Room atau Arisan tidak ditemukan' });
    }

    if (room.arisan.selectedParticipantId && room.arisan.activeChallenge) {
      room.arisan.winnersHistory.unshift({
        participantId: room.arisan.selectedParticipantId,
        participantName: room.arisan.selectedParticipantName || 'Peserta',
        challenge: room.arisan.activeChallenge,
        completedAt: Date.now(),
      });
      room.arisan.excludedParticipantIds.push(room.arisan.selectedParticipantId);
    }

    room.arisan.selectedParticipantId = null;
    room.arisan.selectedParticipantName = null;
    room.arisan.activeChallenge = null;
    room.arisan.isVotingOpen = false;
    room.updatedAt = Date.now();

    res.json(room);
  });

  // Reset arisan
  app.post('/api/rooms/:pin/arisan/reset', (req, res) => {
    const pin = req.params.pin.trim();
    const room = rooms.get(pin);
    if (!room || !room.arisan) {
      return res.status(404).json({ error: 'Room atau Arisan tidak ditemukan' });
    }

    room.arisan = createDefaultArisanState();
    room.updatedAt = Date.now();
    res.json(room);
  });

  // ---------------------------------------------------------------------------
  // VITE MIDDLEWARES / STATIC SPA SERVING
  // ---------------------------------------------------------------------------
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TSC Studio Versi 1 Server running on port ${PORT}`);
  });
}

startServer();
