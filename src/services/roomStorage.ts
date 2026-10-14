// Real-Time Room Service with Server API + LocalStorage fallback
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
  arisan?: ArisanState;
  createdAt: number;
  updatedAt: number;
}

const STORAGE_PREFIX = 'kahoot_room_';
const CHANNEL_NAME = 'kahoot_realtime_channel';

class RoomStorageService {
  private channel: BroadcastChannel | null = null;
  private listeners: Map<string, Set<(room: Room | null) => void>> = new Map();
  private pollIntervals: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel(CHANNEL_NAME);
        this.channel.onmessage = (event) => {
          const { pin } = event.data || {};
          if (pin) {
            this.fetchAndNotify(pin);
          }
        };
      } catch {
        // BroadcastChannel fallback
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (event) => {
        if (event.key && event.key.startsWith(STORAGE_PREFIX)) {
          const pin = event.key.replace(STORAGE_PREFIX, '');
          this.fetchAndNotify(pin);
        }
      });
    }
  }

  private notifyListeners(pin: string, room: Room | null) {
    const pinListeners = this.listeners.get(pin);
    if (pinListeners) {
      pinListeners.forEach((callback) => callback(room));
    }
  }

  private broadcast(pin: string) {
    if (this.channel) {
      this.channel.postMessage({ pin, timestamp: Date.now() });
    }
  }

  private async fetchAndNotify(pin: string) {
    const room = await this.getRoom(pin);
    this.notifyListeners(pin, room);
  }

  getLocalRoom(pin: string): Room | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(STORAGE_PREFIX + pin);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as Room;
    } catch {
      return null;
    }
  }

  saveLocalRoom(room: Room): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_PREFIX + room.pin, JSON.stringify(room));
    this.broadcast(room.pin);
  }

  listAllRooms(): Room[] {
    if (typeof window === 'undefined') return [];
    const rooms: Room[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX)) {
        try {
          const item = JSON.parse(localStorage.getItem(key) || '{}');
          if (item && item.pin) {
            rooms.push(item);
          }
        } catch {
          // ignore
        }
      }
    }
    return rooms.sort((a, b) => b.createdAt - a.createdAt);
  }

  async getRoom(pin: string): Promise<Room | null> {
    const cleanPin = pin.trim();
    if (!cleanPin) return null;

    try {
      const res = await fetch(`/api/rooms/${cleanPin}`);
      if (res.ok) {
        const room = (await res.json()) as Room;
        this.saveLocalRoom(room);
        return room;
      }
    } catch {
      // Server not reached, fallback to local storage
    }

    return this.getLocalRoom(cleanPin);
  }

  async createRoom(
    title: string,
    topic: string,
    questions: QuizQuestionItem[],
    timeLimit: number = 20,
    operatorName: string = 'Game Master'
  ): Promise<Room> {
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, topic, questions, timeLimit, operatorName }),
      });

      if (res.ok) {
        const room = (await res.json()) as Room;
        this.saveLocalRoom(room);
        this.notifyListeners(room.pin, room);
        return room;
      }
    } catch {
      // Local fallback if server fails
    }

    // Local offline generation
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    const newRoom: Room = {
      pin,
      title: title || `Kuis Outing #${pin.slice(-3)}`,
      topic,
      operatorName,
      status: 'lobby',
      currentQuestionIndex: 0,
      questionTimeLimit: timeLimit,
      questionStartTime: null,
      questions,
      participants: {},
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    this.saveLocalRoom(newRoom);
    this.notifyListeners(newRoom.pin, newRoom);
    return newRoom;
  }

  async joinRoom(
    pin: string,
    name: string
  ): Promise<{ success: boolean; participant?: Participant; message?: string }> {
    const cleanPin = pin.trim();
    const cleanName = name.trim();

    if (!cleanPin) {
      return { success: false, message: 'Masukkan 6-digit PIN Room!' };
    }
    if (!cleanName) {
      return { success: false, message: 'Wajib mengisi nama peserta!' };
    }

    try {
      const res = await fetch(`/api/rooms/${cleanPin}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: cleanName }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.participant) {
        if (data.room) {
          this.saveLocalRoom(data.room);
          this.notifyListeners(cleanPin, data.room);
        }
        return { success: true, participant: data.participant };
      } else {
        return { success: false, message: data.error || 'PIN tidak ditemukan atau sudah ditutup!' };
      }
    } catch {
      // Fallback: check local storage on same device
      const localRoom = this.getLocalRoom(cleanPin);
      if (!localRoom) {
        return {
          success: false,
          message: 'Room dengan PIN ' + cleanPin + ' tidak ditemukan. Pastikan Operator sudah membuat room!',
        };
      }

      const existing = Object.values(localRoom.participants).find(
        (p) => p.name.toLowerCase() === cleanName.toLowerCase()
      );
      if (existing) {
        return { success: true, participant: existing };
      }

      const colors = ['bg-red-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500'];
      const avatarColor = colors[Object.keys(localRoom.participants).length % colors.length];
      const participantId = 'p_' + Date.now();
      const newP: Participant = {
        id: participantId,
        name: cleanName,
        avatarColor,
        score: 0,
        streak: 0,
        lastPointsEarned: 0,
        answers: {},
        joinedAt: Date.now(),
      };
      localRoom.participants[participantId] = newP;
      this.saveLocalRoom(localRoom);
      this.notifyListeners(cleanPin, localRoom);
      return { success: true, participant: newP };
    }
  }

  async startQuiz(pin: string): Promise<void> {
    try {
      const res = await fetch(`/api/rooms/${pin}/start`, { method: 'POST' });
      if (res.ok) {
        const room = await res.json();
        this.saveLocalRoom(room);
        this.notifyListeners(pin, room);
        return;
      }
    } catch {
      // local fallback
    }

    const room = this.getLocalRoom(pin);
    if (!room) return;
    room.status = 'reading'; // Enters reading phase
    room.currentQuestionIndex = 0;
    room.questionStartTime = null;
    this.saveLocalRoom(room);
    this.notifyListeners(pin, room);
  }

  async triggerGo(pin: string): Promise<void> {
    try {
      const res = await fetch(`/api/rooms/${pin}/go`, { method: 'POST' });
      if (res.ok) {
        const room = await res.json();
        this.saveLocalRoom(room);
        this.notifyListeners(pin, room);
        return;
      }
    } catch {
      // local fallback
    }

    const room = this.getLocalRoom(pin);
    if (!room) return;
    room.status = 'question';
    room.questionStartTime = Date.now();
    this.saveLocalRoom(room);
    this.notifyListeners(pin, room);
  }

  async submitAnswer(
    pin: string,
    participantId: string,
    questionIndex: number,
    selectedOption: string,
    timeRemainingSeconds: number
  ): Promise<{ isCorrect: boolean; points: number }> {
    try {
      const res = await fetch(`/api/rooms/${pin}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantId, questionIndex, selectedOption, timeRemainingSeconds }),
      });
      if (res.ok) {
        const data = await res.json();
        return { isCorrect: data.isCorrect, points: data.points };
      }
    } catch {
      // local fallback
    }

    const room = this.getLocalRoom(pin);
    if (!room) return { isCorrect: false, points: 0 };
    const p = room.participants[participantId];
    const q = room.questions[questionIndex];
    if (!p || !q) return { isCorrect: false, points: 0 };

    const isCorrect = selectedOption === q.answer;
    let points = 0;
    if (isCorrect) {
      points = Math.round(500 + 500 * (timeRemainingSeconds / (room.questionTimeLimit || 20)));
      p.score += points;
      p.streak += 1;
      p.lastPointsEarned = points;
    } else {
      p.streak = 0;
      p.lastPointsEarned = 0;
    }

    p.answers[questionIndex] = {
      option: selectedOption,
      isCorrect,
      points,
      timeTakenMs: 0,
      answeredAt: Date.now(),
    };
    this.saveLocalRoom(room);
    this.notifyListeners(pin, room);
    return { isCorrect, points };
  }

  async revealAnswerSummary(pin: string): Promise<void> {
    try {
      const res = await fetch(`/api/rooms/${pin}/reveal`, { method: 'POST' });
      if (res.ok) {
        const room = await res.json();
        this.saveLocalRoom(room);
        this.notifyListeners(pin, room);
        return;
      }
    } catch {
      // local fallback
    }

    const room = this.getLocalRoom(pin);
    if (!room) return;
    room.status = 'answered_summary';
    this.saveLocalRoom(room);
    this.notifyListeners(pin, room);
  }

  async showLeaderboard(pin: string): Promise<void> {
    try {
      const res = await fetch(`/api/rooms/${pin}/leaderboard`, { method: 'POST' });
      if (res.ok) {
        const room = await res.json();
        this.saveLocalRoom(room);
        this.notifyListeners(pin, room);
        return;
      }
    } catch {
      // local fallback
    }

    const room = this.getLocalRoom(pin);
    if (!room) return;
    room.status = 'leaderboard';
    this.saveLocalRoom(room);
    this.notifyListeners(pin, room);
  }

  async nextQuestion(pin: string): Promise<void> {
    try {
      const res = await fetch(`/api/rooms/${pin}/next`, { method: 'POST' });
      if (res.ok) {
        const room = await res.json();
        this.saveLocalRoom(room);
        this.notifyListeners(pin, room);
        return;
      }
    } catch {
      // local fallback
    }

    const room = this.getLocalRoom(pin);
    if (!room) return;
    if (room.currentQuestionIndex + 1 < room.questions.length) {
      room.currentQuestionIndex += 1;
      room.status = 'reading'; // Enters reading phase for next question!
      room.questionStartTime = null;
    } else {
      room.status = 'finished';
    }
    this.saveLocalRoom(room);
    this.notifyListeners(pin, room);
  }

  async spinArisan(pin: string, categoryFilter?: string): Promise<Room | null> {
    try {
      const res = await fetch(`/api/rooms/${pin}/arisan/spin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryFilter }),
      });
      if (res.ok) {
        const room = await res.json();
        this.saveLocalRoom(room);
        this.notifyListeners(pin, room);
        return room;
      }
    } catch {
      // fallback
    }
    return null;
  }

  async toggleArisanVote(pin: string, isOpen?: boolean): Promise<Room | null> {
    try {
      const res = await fetch(`/api/rooms/${pin}/arisan/toggle-vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOpen }),
      });
      if (res.ok) {
        const room = await res.json();
        this.saveLocalRoom(room);
        this.notifyListeners(pin, room);
        return room;
      }
    } catch {
      // fallback
    }
    return null;
  }

  async voteArisanChallenge(pin: string, participantId: string, challengeId: string): Promise<Room | null> {
    try {
      const res = await fetch(`/api/rooms/${pin}/arisan/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantId, challengeId }),
      });
      if (res.ok) {
        const room = await res.json();
        this.saveLocalRoom(room);
        this.notifyListeners(pin, room);
        return room;
      }
    } catch {
      // fallback
    }
    return null;
  }

  async selectArisanChallenge(pin: string, challengeId?: string): Promise<Room | null> {
    try {
      const res = await fetch(`/api/rooms/${pin}/arisan/select-challenge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId }),
      });
      if (res.ok) {
        const room = await res.json();
        this.saveLocalRoom(room);
        this.notifyListeners(pin, room);
        return room;
      }
    } catch {
      // fallback
    }
    return null;
  }

  async completeArisan(pin: string): Promise<Room | null> {
    try {
      const res = await fetch(`/api/rooms/${pin}/arisan/complete`, { method: 'POST' });
      if (res.ok) {
        const room = await res.json();
        this.saveLocalRoom(room);
        this.notifyListeners(pin, room);
        return room;
      }
    } catch {
      // fallback
    }
    return null;
  }

  async resetArisan(pin: string): Promise<Room | null> {
    try {
      const res = await fetch(`/api/rooms/${pin}/arisan/reset`, { method: 'POST' });
      if (res.ok) {
        const room = await res.json();
        this.saveLocalRoom(room);
        this.notifyListeners(pin, room);
        return room;
      }
    } catch {
      // fallback
    }
    return null;
  }

  subscribe(pin: string, callback: (room: Room | null) => void): () => void {
    const cleanPin = pin.trim();
    if (!this.listeners.has(cleanPin)) {
      this.listeners.set(cleanPin, new Set());
    }
    this.listeners.get(cleanPin)!.add(callback);

    // Immediate initial fetch
    this.getRoom(cleanPin).then((r) => callback(r));

    // Real-time polling every 800ms to guarantee sync between phones & projector
    if (!this.pollIntervals.has(cleanPin)) {
      const interval = setInterval(async () => {
        const r = await this.getRoom(cleanPin);
        this.notifyListeners(cleanPin, r);
      }, 800);
      this.pollIntervals.set(cleanPin, interval);
    }

    return () => {
      const pinListeners = this.listeners.get(cleanPin);
      if (pinListeners) {
        pinListeners.delete(callback);
        if (pinListeners.size === 0) {
          this.listeners.delete(cleanPin);
          const interval = this.pollIntervals.get(cleanPin);
          if (interval) {
            clearInterval(interval);
            this.pollIntervals.delete(cleanPin);
          }
        }
      }
    };
  }
}

export const roomStorage = new RoomStorageService();
