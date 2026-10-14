import React, { useState, useEffect, useMemo, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  Tv, 
  Users, 
  Play, 
  Trophy, 
  Sparkles, 
  Timer as TimerIcon, 
  Check, 
  X, 
  Copy, 
  ExternalLink, 
  Plus, 
  RotateCcw, 
  LogOut, 
  Crown, 
  Flame, 
  HelpCircle, 
  Volume2, 
  VolumeX, 
  Lock, 
  ShieldCheck, 
  UserCheck, 
  ArrowRight, 
  ChevronRight, 
  Download,
  QrCode,
  Smartphone,
  Eye,
  CheckCircle2,
  AlertCircle,
  Gift
} from 'lucide-react';

import { 
  roomStorage, 
  Room, 
  Participant, 
  QuizQuestionItem 
} from './services/roomStorage';
import { 
  PRESET_THEMES, 
  autoGenerateQuizQuestions 
} from './services/quizGenerator';
import { KAHOOT_SHAPES } from './components/KahootShapes';
import { QRCodeDisplay } from './components/QRCodeDisplay';
import { ArisanStudio } from './components/ArisanStudio';
import { ArisanParticipantView } from './components/ArisanParticipantView';
import { sound } from './utils/audio';

type AppRole = 'select' | 'operator_login' | 'operator' | 'player';
type GameMode = 'quis' | 'challenge';

export default function App() {
  const [role, setRole] = useState<AppRole>('operator_login');
  const [operatorAuthed, setOperatorAuthed] = useState<boolean>(false);
  const [operatorPinInput, setOperatorPinInput] = useState<string>('');
  const [operatorAuthError, setOperatorAuthError] = useState<string>('');

  // Mode switcher: 'quis' or 'challenge'
  const [operatorMode, setOperatorMode] = useState<GameMode>('quis');
  const [playerTab, setPlayerTab] = useState<GameMode>('quis');
  const [showHostQrModal, setShowHostQrModal] = useState<boolean>(false);

  // Active room & Participant state
  const [currentPin, setCurrentPin] = useState<string>('');
  const [room, setRoom] = useState<Room | null>(null);
  const [currentParticipant, setCurrentParticipant] = useState<Participant | null>(null);

  // Player Join form state
  const [playerPinInput, setPlayerPinInput] = useState<string>('');
  const [playerNameInput, setPlayerNameInput] = useState<string>('');
  const [playerJoinError, setPlayerJoinError] = useState<string>('');

  // Operator Room Creator state
  const [creatorStep, setCreatorStep] = useState<'create' | 'lobby' | 'game'>('create');
  const [roomTitle, setRoomTitle] = useState<string>('Outing Kantor Fun Quiz 2026');
  const [selectedTheme, setSelectedTheme] = useState<string>('kantor');
  const [customTopic, setCustomTopic] = useState<string>('');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [timeLimit, setTimeLimit] = useState<number>(20);
  const [generatedQuestions, setGeneratedQuestions] = useState<QuizQuestionItem[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Game countdown state
  const [timerLeft, setTimerLeft] = useState<number>(20);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Participant answer selection in current question
  const [playerSelectedOption, setPlayerSelectedOption] = useState<string | null>(null);
  const [playerAnswerResult, setPlayerAnswerResult] = useState<{ isCorrect: boolean; points: number } | null>(null);

  // Detect query params on mount: e.g. ?pin=123456
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pinParam = params.get('pin');
    const roleParam = params.get('role');

    if (pinParam) {
      const cleanPin = pinParam.replace(/\D/g, '').trim();
      setPlayerPinInput(cleanPin);
      setCurrentPin(cleanPin);
      setRole('player');

      // Check if session already exists for this pin
      if (typeof window !== 'undefined') {
        const saved = sessionStorage.getItem('kahoot_player_' + cleanPin);
        if (saved) {
          try {
            const p = JSON.parse(saved);
            setCurrentParticipant(p);
          } catch {
            // ignore
          }
        }
      }
    } else if (roleParam === 'operator') {
      setRole('operator_login');
    }
  }, []);

  // Listen to real-time room updates via roomStorage (LocalStorage + BroadcastChannel)
  useEffect(() => {
    if (!currentPin) return;

    const unsubscribe = roomStorage.subscribe(currentPin, (updatedRoom) => {
      setRoom(updatedRoom);

      // If current user is a participant, sync their data
      if (updatedRoom && currentParticipant) {
        const syncedP = updatedRoom.participants[currentParticipant.id];
        if (syncedP) {
          setCurrentParticipant(syncedP);
        }
      }
    });

    return () => unsubscribe();
  }, [currentPin, currentParticipant?.id]);

  // Handle countdown timer during 'question' state
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (room && room.status === 'question' && room.questionStartTime) {
      const calculateTimeLeft = () => {
        const elapsed = (Date.now() - (room.questionStartTime || Date.now())) / 1000;
        const remaining = Math.max(0, Math.ceil(room.questionTimeLimit - elapsed));
        setTimerLeft(remaining);

        if (remaining <= 4 && remaining > 0) {
          sound.playUrgentBeep();
        }

        // When timer hits zero, operator screen triggers reveal
        if (remaining === 0 && role === 'operator') {
          roomStorage.revealAnswerSummary(room.pin);
          sound.playWrong();
        }
      };

      calculateTimeLeft();
      interval = setInterval(calculateTimeLeft, 1000);
    }
    return () => clearInterval(interval);
  }, [room?.status, room?.questionStartTime, room?.questionTimeLimit, room?.pin, role]);

  // Reset player option selection whenever question changes
  useEffect(() => {
    if (room?.status === 'question') {
      setPlayerSelectedOption(null);
      setPlayerAnswerResult(null);
    }
  }, [room?.currentQuestionIndex, room?.status]);

  // Trigger celebration on final podium
  useEffect(() => {
    if (room?.status === 'finished') {
      sound.playFanfare();
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    }
  }, [room?.status]);

  // Audio toggle
  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    sound.setMuted(next);
  };

  // -----------------------------------------------------------------------------
  // OPERATOR ACTIONS
  // -----------------------------------------------------------------------------
  const handleOperatorLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    // Simple secure gate for host: default passcode is 'admin' or '1234' or direct button
    if (operatorPinInput.trim() === '1234' || operatorPinInput.trim() === 'admin' || operatorPinInput.trim() === '') {
      setOperatorAuthed(true);
      setRole('operator');
      setOperatorAuthError('');
      sound.playCorrect();

      // Check for existing active rooms
      const existingRooms = roomStorage.listAllRooms();
      if (existingRooms.length > 0 && !currentPin) {
        // Offer latest or start creation
        handleGenerateQuestions();
      } else {
        handleGenerateQuestions();
      }
    } else {
      setOperatorAuthError('PIN / Sandi Operator salah! (Gunakan sandi default: 1234)');
      sound.playWrong();
    }
  };

  const handleGenerateQuestions = () => {
    setIsGenerating(true);
    sound.playClick();
    setTimeout(() => {
      const q = autoGenerateQuizQuestions(selectedTheme, questionCount, customTopic);
      setGeneratedQuestions(q);
      setIsGenerating(false);
    }, 350);
  };

  const handleCreateAndLaunchRoom = async () => {
    if (generatedQuestions.length === 0) {
      handleGenerateQuestions();
      return;
    }
    sound.playCorrect();
    try {
      const newRoom = await roomStorage.createRoom(
        roomTitle,
        selectedTheme === 'custom' ? (customTopic || 'Topik Khusus') : (PRESET_THEMES.find(t => t.id === selectedTheme)?.name || 'Outing'),
        generatedQuestions,
        timeLimit,
        'Game Master / MC'
      );
      setCurrentPin(newRoom.pin);
      setRoom(newRoom);
      setCreatorStep('lobby');
    } catch (err) {
      console.error('Error creating room', err);
    }
  };

  const handleStartQuizFromLobby = async () => {
    if (!room) return;
    sound.playFanfare();
    await roomStorage.startQuiz(room.pin);
    setCreatorStep('game');
  };

  const handleTriggerGo = async () => {
    if (!room) return;
    sound.playFanfare();
    await roomStorage.triggerGo(room.pin);
  };

  const handleRevealAnswer = async () => {
    if (!room) return;
    sound.playCorrect();
    await roomStorage.revealAnswerSummary(room.pin);
  };

  const handleShowLeaderboard = async () => {
    if (!room) return;
    sound.playClick();
    await roomStorage.showLeaderboard(room.pin);
  };

  const handleNextQuestion = async () => {
    if (!room) return;
    sound.playClick();
    await roomStorage.nextQuestion(room.pin);
  };

  // Arisan action handlers
  const handleArisanSpin = async (categoryFilter?: string) => {
    if (!room) return;
    await roomStorage.spinArisan(room.pin, categoryFilter);
  };

  const handleArisanToggleVote = async (isOpen: boolean) => {
    if (!room) return;
    sound.playClick();
    await roomStorage.toggleArisanVote(room.pin, isOpen);
  };

  const handleArisanSelectChallenge = async (challengeId?: string) => {
    if (!room) return;
    sound.playCorrect();
    await roomStorage.selectArisanChallenge(room.pin, challengeId);
  };

  const handleArisanComplete = async () => {
    if (!room) return;
    sound.playFanfare();
    await roomStorage.completeArisan(room.pin);
  };

  const handleArisanReset = async () => {
    if (!room) return;
    if (window.confirm('Reset riwayat pemenang arisan dan mulai dari awal?')) {
      await roomStorage.resetArisan(room.pin);
    }
  };

  const handleArisanVoteParticipant = async (challengeId: string) => {
    if (!room || !currentParticipant) return;
    await roomStorage.voteArisanChallenge(room.pin, currentParticipant.id, challengeId);
  };

  const handleCreateQuickArisanRoom = async () => {
    sound.playCorrect();
    try {
      const questions = autoGenerateQuizQuestions('kantor', 5);
      const newRoom = await roomStorage.createRoom(
        'TSC Studio Versi 1 - Outing Kantor',
        'Outing Kantor & Challenge',
        questions,
        20,
        'Operator TSC Studio'
      );
      setCurrentPin(newRoom.pin);
      setRoom(newRoom);
      setOperatorMode('challenge');
    } catch (err) {
      console.error(err);
    }
  };

  // -----------------------------------------------------------------------------
  // PARTICIPANT ACTIONS
  // -----------------------------------------------------------------------------
  const handlePlayerJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPlayerJoinError('');

    const pin = playerPinInput.replace(/\D/g, '').trim();
    const name = playerNameInput.trim();

    if (!pin) {
      setPlayerJoinError('Masukkan 6-digit PIN Room kuis!');
      sound.playWrong();
      return;
    }

    if (!name) {
      setPlayerJoinError('Wajib mengisi nama peserta!');
      sound.playWrong();
      return;
    }

    try {
      const result = await roomStorage.joinRoom(pin, name);
      if (result.success && result.participant) {
        sound.playJoinSound();
        setCurrentPin(pin);
        setCurrentParticipant(result.participant);
        // Persist session on mobile browser
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('kahoot_player_' + pin, JSON.stringify(result.participant));
        }
        setRole('player');
      } else {
        sound.playWrong();
        setPlayerJoinError(result.message || 'Gagal bergabung ke room.');
      }
    } catch {
      sound.playWrong();
      setPlayerJoinError('Gagal menghubungi server room. Silakan coba lagi.');
    }
  };

  const handlePlayerSubmitOption = async (option: string) => {
    if (!room || !currentParticipant || playerSelectedOption !== null) return;
    sound.playClick();
    setPlayerSelectedOption(option);

    const result = await roomStorage.submitAnswer(
      room.pin,
      currentParticipant.id,
      room.currentQuestionIndex,
      option,
      timerLeft
    );
    setPlayerAnswerResult(result);
  };

  // Logout actions
  const handleOperatorLogout = () => {
    if (window.confirm('Keluar dari portal Operator?')) {
      setOperatorAuthed(false);
      setRole('operator_login');
      setOperatorPinInput('');
      setOperatorAuthError('');
    }
  };

  const handlePlayerLogout = () => {
    if (window.confirm('Yakin ingin logout dan keluar dari kuis?')) {
      if (currentPin) {
        sessionStorage.removeItem('kahoot_player_' + currentPin);
      }
      setCurrentParticipant(null);
      setPlayerNameInput('');
      setPlayerJoinError('');
      setPlayerSelectedOption(null);
      setPlayerAnswerResult(null);
      setRole('player');
    }
  };

  // Helper: Copy invitation link
  const copyInviteLink = async () => {
    if (!room) return;
    const inviteUrl = `${window.location.origin}${window.location.pathname}?pin=${room.pin}`;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopiedLink(true);
      sound.playCorrect();
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // fallback
    }
  };

  // Leaderboard sorted list
  const sortedParticipants = useMemo(() => {
    if (!room) return [];
    return Object.values(room.participants).sort((a, b) => b.score - a.score);
  }, [room?.participants]);

  // Answers count for current question
  const currentAnswersCount = useMemo(() => {
    if (!room || !room.questions[room.currentQuestionIndex]) return 0;
    const qIdx = room.currentQuestionIndex;
    return Object.values(room.participants).filter(p => p.answers[qIdx] !== undefined).length;
  }, [room?.participants, room?.currentQuestionIndex]);

  // Current question object
  const currentQuestion: QuizQuestionItem | null = useMemo(() => {
    if (!room || !room.questions || room.questions.length === 0) return null;
    return room.questions[room.currentQuestionIndex] || null;
  }, [room?.questions, room?.currentQuestionIndex]);

  // Answer distribution counts for bar chart
  const answerDistribution = useMemo(() => {
    if (!room || !currentQuestion) return [0, 0, 0, 0];
    const qIdx = room.currentQuestionIndex;
    const counts = [0, 0, 0, 0];

    Object.values(room.participants).forEach((p) => {
      const ans = p.answers[qIdx];
      if (ans) {
        const optIdx = currentQuestion.options.indexOf(ans.option);
        if (optIdx >= 0 && optIdx < 4) {
          counts[optIdx]++;
        }
      }
    });
    return counts;
  }, [room?.participants, room?.currentQuestionIndex, currentQuestion]);

  // ===========================================================================
  // SCREEN 1: OPERATOR LOGIN GATE
  // ===========================================================================
  if (role === 'operator_login') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-amber-500/30">
        {/* Top Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-slate-900 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-red-500 flex items-center justify-center font-black text-slate-950">
              TSC
            </div>
            <span className="text-base font-bold tracking-tight text-white">
              TSC Studio Versi 1
            </span>
          </div>
          <button
            onClick={toggleMute}
            className="p-2 text-slate-400 hover:text-white rounded-lg border border-slate-800"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </header>

        {/* Auth Card */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col gap-6">
            <div className="text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h1 className="text-2xl font-black text-white">Portal Operator & MC</h1>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Hanya Operator yang dapat membuat room, meng-generate soal real, dan mengendalikan kuis di layar utama.
              </p>
            </div>

            {operatorAuthError && (
              <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{operatorAuthError}</span>
              </div>
            )}

            <form onSubmit={handleOperatorLogin} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Sandi Akses Operator
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={operatorPinInput}
                    onChange={(e) => setOperatorPinInput(e.target.value)}
                    placeholder="Sandi default: 1234"
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                  <Lock className="w-4 h-4 text-slate-500 absolute right-3.5 top-3.5" />
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  *Tekan langsung tombol masuk di bawah untuk akses cepat (Sandi: 1234)
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm tracking-wide shadow-lg shadow-amber-500/20 transition-all"
              >
                Masuk sebagai Operator
              </button>
            </form>

            <div className="pt-4 border-t border-slate-800/80 text-center">
              <span className="text-xs text-slate-400">Anda adalah peserta yang ingin ikut kuis?</span>
              <button
                type="button"
                onClick={() => setRole('player')}
                className="mt-2 w-full py-2.5 px-3 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-xs font-semibold text-slate-200 transition-colors flex items-center justify-center gap-2"
              >
                <Smartphone className="w-4 h-4 text-sky-400" />
                <span>Gabung dengan PIN Game</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="py-4 text-center text-xs text-slate-600">
          Kahoot Outing Studio · Real LocalStorage Multiplayer
        </footer>
      </div>
    );
  }

  // ===========================================================================
  // SCREEN 2: PARTICIPANT JOIN SCREEN
  // ===========================================================================
  if (role === 'player' && !currentParticipant) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-sky-500/30">
        {/* Top Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-slate-900 bg-slate-950">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center font-black text-slate-950 text-xs">
              TSC
            </div>
            <span className="text-sm font-bold text-white">TSC Studio Versi 1 (Peserta)</span>
          </div>

          <button
            onClick={() => setRole('operator_login')}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Mode Operator</span>
          </button>
        </header>

        {/* Join Card */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col gap-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-sky-500/20 mb-3">
                <Smartphone className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-black text-white">Gabung Kuis Outing</h1>
              <p className="text-xs text-slate-400 mt-1">
                Masukkan Game PIN dan Nama kamu untuk mulai berkompetisi!
              </p>
            </div>

            {playerJoinError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{playerJoinError}</span>
              </div>
            )}

            <form onSubmit={handlePlayerJoin} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  6-Digit Game PIN
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={playerPinInput}
                  onChange={(e) => setPlayerPinInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="Contoh: 849201"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-center text-xl font-mono font-bold tracking-widest text-amber-400 placeholder-slate-700 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nama Peserta <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  maxLength={20}
                  value={playerNameInput}
                  onChange={(e) => setPlayerNameInput(e.target.value)}
                  placeholder="Nama panggilan atau nama tim"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Nama ini akan muncul di papan skor & podium kuis.
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-black text-sm tracking-wide shadow-lg shadow-sky-500/20 transition-all"
              >
                Masuk ke Room Kuis
              </button>
            </form>
          </div>
        </div>

        <footer className="py-4 text-center text-xs text-slate-600">
          Kahoot Outing Studio · Masuk dengan PIN atau Scan QR
        </footer>
      </div>
    );
  }

  // ===========================================================================
  // SCREEN 3: PARTICIPANT LOBBY & GAMEPLAY
  // ===========================================================================
  if (role === 'player' && currentParticipant && room) {
    const isChallengeActive = playerTab === 'challenge' || Boolean(room.arisan?.isVotingOpen) || room.arisan?.selectedParticipantId === currentParticipant.id;

    if (isChallengeActive) {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col">
          <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
              <button
                onClick={() => setPlayerTab('quis')}
                className={`px-3 py-1 rounded-lg font-bold transition-colors ${playerTab === 'quis' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
              >
                🎮 Quis
              </button>
              <button
                onClick={() => setPlayerTab('challenge')}
                className={`px-3 py-1 rounded-lg font-bold transition-colors ${playerTab === 'challenge' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
              >
                🎯 Challenge
              </button>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-amber-400 font-mono font-bold">PIN: {room.pin}</span>
              <button
                onClick={handlePlayerLogout}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors"
                title="Logout Peserta"
              >
                <LogOut className="w-3 h-3" />
                <span>Logout</span>
              </button>
            </div>
          </div>

          <ArisanParticipantView
            room={room}
            currentParticipant={currentParticipant}
            onVote={handleArisanVoteParticipant}
            onLogout={handlePlayerLogout}
          />
        </div>
      );
    }

    // 3A: Participant in Waiting Lobby
    if (room.status === 'lobby') {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">PIN: {room.pin}</span>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className={`w-3 h-3 rounded-full ${currentParticipant.avatarColor}`} />
                <span className="text-xs font-bold text-white">{currentParticipant.name}</span>
              </div>
              <button
                onClick={handlePlayerLogout}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors"
                title="Keluar / Logout Peserta"
              >
                <LogOut className="w-3 h-3" />
                <span>Logout</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center text-center max-w-sm mx-auto my-auto gap-4">
            <div className="w-24 h-24 rounded-full bg-slate-900 border-2 border-dashed border-amber-500/40 flex items-center justify-center animate-pulse">
              <Sparkles className="w-10 h-10 text-amber-400" />
            </div>
            <h1 className="text-2xl font-black text-white">Kamu Sudah Bergabung!</h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              Halo <strong className="text-amber-400">{currentParticipant.name}</strong>, lihat ke layar utama / proyektor operator. Kuis akan segera dimulai!
            </p>
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-400 w-full">
              🎯 Siapa cepat dan benar mendapat poin tertinggi (hingga 1.000 poin per soal).
            </div>
          </div>

          <div className="text-center text-xs text-slate-600">
            Menunggu Operator memulai kuis...
          </div>
        </div>
      );
    }

    // 3A.2: Participant in Reading Question Phase (Listening to Operator)
    if (room.status === 'reading' && currentQuestion) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 md:p-6 select-none font-sans">
          <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3">
            <span className="text-xs text-slate-400 font-semibold">
              Soal {room.currentQuestionIndex + 1}/{room.questions.length}
            </span>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold animate-pulse">
              <span>🎙️ Membaca Soal</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-300">
                {currentParticipant.score} pts
              </span>
              <button
                onClick={handlePlayerLogout}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors"
                title="Logout Peserta"
              >
                <LogOut className="w-3 h-3" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>

          <div className="my-auto text-center flex flex-col items-center gap-5 max-w-sm mx-auto">
            <div className="w-20 h-20 rounded-full bg-amber-500/15 border-2 border-dashed border-amber-500/40 flex items-center justify-center text-amber-400 animate-pulse">
              <Sparkles className="w-10 h-10" />
            </div>

            <div className="text-xs font-bold uppercase tracking-widest text-amber-400">
              Dengarkan Operator di Depan!
            </div>

            <h2 className="text-lg md:text-xl font-black text-white leading-relaxed">
              &ldquo;{currentQuestion.question}&rdquo;
            </h2>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-slate-300 leading-relaxed shadow-lg">
              ⏳ Pilihan ganda <strong>A, B, C, D</strong> akan segera muncul di layar HP Anda begitu Operator menekan tombol <strong>GO</strong>!
            </div>
          </div>

          <div className="text-center text-[11px] text-slate-500 py-2">
            {currentParticipant.name} · Siap-siap memilih jawaban tercepat!
          </div>
        </div>
      );
    }

    // 3B: Participant Question Active (Tactile Kahoot Controller)
    if (room.status === 'question' && currentQuestion) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col p-4 md:p-6 justify-between select-none">
          {/* Top Bar for Player */}
          <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 rounded-2xl px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold">
                Soal {room.currentQuestionIndex + 1}/{room.questions.length}
              </span>
            </div>

            <div className="flex items-center gap-2 font-mono font-bold text-amber-400 text-sm">
              <TimerIcon className="w-4 h-4" />
              <span>{timerLeft}s</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-300">
                {currentParticipant.score} pts
              </span>
              <button
                onClick={handlePlayerLogout}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors"
                title="Logout Peserta"
              >
                <LogOut className="w-3 h-3" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>

          {/* Question Hint for Player */}
          <div className="my-3 text-center">
            <h2 className="text-sm md:text-base font-bold text-slate-200 line-clamp-2 px-2">
              {currentQuestion.question}
            </h2>
          </div>

          {/* If Player Already Answered */}
          {playerSelectedOption !== null ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 py-12">
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 animate-bounce">
                <Check className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-black text-white">Jawaban Terkirim!</h3>
              <p className="text-xs text-slate-400 max-w-xs">
                Kamu memilih opsi. Menunggu waktu habis atau semua peserta menjawab...
              </p>
            </div>
          ) : (
            /* Tactile 4 Kahoot Buttons */
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3.5 my-2">
              {currentQuestion.options.map((opt, idx) => {
                const shape = KAHOOT_SHAPES[idx] || KAHOOT_SHAPES[0];
                return (
                  <button
                    key={idx}
                    onClick={() => handlePlayerSubmitOption(opt)}
                    className={`flex items-center gap-4 p-5 md:p-6 rounded-2xl ${shape.bgClass} text-white font-bold text-base md:text-lg shadow-lg active:scale-95 transition-transform duration-100 text-left`}
                  >
                    <div className="p-2 bg-black/20 rounded-xl shrink-0">
                      {shape.icon('w-7 h-7 md:w-9 md:h-9 text-white')}
                    </div>
                    <span className="flex-1 drop-shadow-sm leading-snug">
                      {opt}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Player Footer */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 px-2 pt-2">
            <span>{currentParticipant.name}</span>
            <span>🔥 Streak: {currentParticipant.streak}x</span>
          </div>
        </div>
      );
    }

    // 3C: Participant Answer Revealed / Result
    if (room.status === 'answered_summary' && currentQuestion) {
      const isCorrect = playerSelectedOption === currentQuestion.answer;
      return (
        <div className={`min-h-screen ${isCorrect ? 'bg-emerald-950' : 'bg-rose-950'} text-white flex flex-col justify-between p-4 md:p-6 text-center select-none`}>
          <div className="w-full flex items-center justify-between bg-black/25 border border-white/10 rounded-2xl px-4 py-2.5 text-xs">
            <span className="font-mono font-bold text-amber-300">Skor: {currentParticipant.score} pts</span>
            <button
              onClick={handlePlayerLogout}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
              title="Logout Peserta"
            >
              <LogOut className="w-3 h-3" />
              <span>Logout</span>
            </button>
          </div>

          <div className="my-auto flex flex-col items-center">
            <div className="w-24 h-24 rounded-3xl bg-white/10 flex items-center justify-center mb-6 shadow-2xl">
              {isCorrect ? <Check className="w-14 h-14 text-emerald-300" /> : <X className="w-14 h-14 text-rose-300" />}
            </div>

            <h1 className="text-3xl font-black tracking-tight">
              {isCorrect ? 'BENAR SEKALI!' : 'KURANG TEPAT!'}
            </h1>

            <div className="my-6 p-4 rounded-2xl bg-black/30 border border-white/10 max-w-sm w-full">
              <span className="text-xs uppercase tracking-widest text-slate-300 font-semibold">
                Kunci Jawaban yang Benar:
              </span>
              <div className="text-base font-bold text-amber-300 mt-1">
                {currentQuestion.answer}
              </div>

              {isCorrect && playerAnswerResult && (
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-around">
                  <div>
                    <span className="text-[11px] text-emerald-200">Poin Didapat</span>
                    <div className="text-2xl font-black font-mono text-emerald-300">
                      +{playerAnswerResult.points}
                    </div>
                  </div>
                  <div>
                    <span className="text-[11px] text-emerald-200">Streak</span>
                    <div className="text-2xl font-black font-mono text-amber-300">
                      🔥 {currentParticipant.streak}x
                    </div>
                  </div>
                </div>
              )}
            </div>

            <p className="text-xs text-white/70">
              Perhatikan proyektor operator untuk melihat papan peringkat!
            </p>
          </div>

          <div className="text-[11px] text-white/50 py-2">
            {currentParticipant.name}
          </div>
        </div>
      );
    }

    // 3D: Participant Leaderboard View
    if (room.status === 'leaderboard') {
      const myRank = sortedParticipants.findIndex(p => p.id === currentParticipant.id) + 1;
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-400">PIN: {room.pin}</span>
            <button
              onClick={handlePlayerLogout}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors"
              title="Logout Peserta"
            >
              <LogOut className="w-3 h-3" />
              <span>Logout</span>
            </button>
          </div>

          <div className="text-center pt-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Papan Peringkat Sementara
            </span>
            <h1 className="text-2xl font-black text-white mt-1">
              Peringkat #{myRank}
            </h1>
            <div className="text-3xl font-mono font-black text-amber-400 mt-2">
              {currentParticipant.score} <span className="text-sm text-slate-500 font-normal">pts</span>
            </div>
          </div>

          <div className="my-auto max-w-md w-full mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-4 divide-y divide-slate-800/80">
            {sortedParticipants.slice(0, 5).map((p, idx) => (
              <div key={p.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className={`w-5 h-5 rounded font-bold flex items-center justify-center ${
                    idx === 0 ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {idx + 1}
                  </span>
                  <span className={`font-semibold ${p.id === currentParticipant.id ? 'text-amber-400 underline font-bold' : 'text-slate-200'}`}>
                    {p.name} {p.id === currentParticipant.id && '(Kamu)'}
                  </span>
                </div>
                <span className="font-mono font-bold text-slate-300">{p.score} pts</span>
              </div>
            ))}
          </div>

          <div className="text-center text-xs text-slate-500">
            Menunggu Operator melanjutkan ke soal berikutnya...
          </div>
        </div>
      );
    }

    // 3E: Participant Finished View
    if (room.status === 'finished') {
      const myRank = sortedParticipants.findIndex(p => p.id === currentParticipant.id) + 1;
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 rounded-3xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-4 animate-bounce">
            <Trophy className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-black text-white">Kuis Outing Selesai!</h1>
          <p className="text-sm text-slate-400 mt-1">
            Terima kasih telah berpartisipasi, <strong className="text-white">{currentParticipant.name}</strong>!
          </p>

          <div className="my-6 p-6 rounded-2xl bg-slate-900 border border-slate-800 w-full max-w-xs">
            <span className="text-xs uppercase tracking-widest text-slate-500 font-semibold">
              Hasil Akhir Kamu
            </span>
            <div className="text-4xl font-mono font-black text-amber-400 my-2">
              Juara #{myRank}
            </div>
            <div className="text-sm font-mono text-slate-300">
              Total Skor: <strong>{currentParticipant.score} Poin</strong>
            </div>
          </div>

          <button
            onClick={handlePlayerLogout}
            className="flex items-center gap-2 px-6 py-3 rounded-xl border border-rose-500/30 bg-rose-500/15 hover:bg-rose-500/25 text-rose-200 text-xs font-bold transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout / Keluar Peserta</span>
          </button>
        </div>
      );
    }
  }

  // ===========================================================================
  // SCREEN 4: OPERATOR DASHBOARD (CREATE ROOM, LOBBY, PROJECTOR GAMEPLAY)
  // ===========================================================================
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500/30">
      {/* Top Bar for Operator */}
      <header className="flex items-center justify-between px-6 py-3.5 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-red-500 flex items-center justify-center font-black text-slate-950 shadow-md">
            TSC
          </div>
          <span className="text-base font-bold tracking-tight text-white">
            TSC Studio Versi 1
          </span>
          {room && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs bg-slate-800 text-amber-400 px-2.5 py-1 rounded-md font-mono font-bold">
                PIN: {room.pin}
              </span>
              <button
                type="button"
                onClick={() => setShowHostQrModal(true)}
                className="p-1 px-2 rounded-md bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold flex items-center gap-1 border border-slate-700"
                title="Tampilkan QR Code Lobby"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">QR</span>
              </button>
            </div>
          )}
        </div>

        {/* Mode Switcher: Mode Quis & Mode Challenge */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-xl text-xs font-medium">
          <button
            onClick={() => { setOperatorMode('quis'); sound.playClick(); }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
              operatorMode === 'quis'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>Mode Quis</span>
          </button>

          <button
            onClick={() => { setOperatorMode('challenge'); sound.playClick(); }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
              operatorMode === 'challenge'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Mode Challenge</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleMute}
            className="p-2 text-slate-400 hover:text-white rounded-lg border border-slate-800"
            title={isMuted ? 'Nyalakan Suara' : 'Matikan Suara'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          <button
            onClick={handleOperatorLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 text-xs font-semibold transition-colors shadow-sm"
            title="Keluar / Logout dari Portal Operator"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout Operator</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 flex flex-col">
        {/* =====================================================================
            VIEW 1: MODE CHALLENGE / RANDOM NAME & 10 KATEGORI
            ===================================================================== */}
        {operatorMode === 'challenge' && (
          room ? (
            <ArisanStudio
              room={room}
              onSpin={handleArisanSpin}
              onToggleVote={handleArisanToggleVote}
              onSelectChallenge={handleArisanSelectChallenge}
              onCompleteChallenge={handleArisanComplete}
              onResetArisan={handleArisanReset}
              copyInviteLink={copyInviteLink}
              copiedLink={copiedLink}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 max-w-md mx-auto">
              <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-4">
                <Flame className="w-8 h-8 text-rose-400" />
              </div>
              <h2 className="text-2xl font-black text-white">Mode Challenge (10 Kategori Lucu &amp; Viral)</h2>
              <p className="text-xs text-slate-400 mt-1.5 mb-6">
                Belum ada Room yang aktif. Tekan tombol di bawah untuk membuat room seketika dan mendapatkan Game PIN / QR Code!
              </p>
              <button
                onClick={handleCreateQuickArisanRoom}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm tracking-wide shadow-xl shadow-amber-500/20 transition-all"
              >
                Buka Room Challenge Instan
              </button>
            </div>
          )
        )}

        {/* =====================================================================
            VIEW 2: MODE QUIS
            ===================================================================== */}
        {operatorMode === 'quis' && creatorStep === 'create' && (
          <div className="flex-1 flex flex-col gap-6 max-w-4xl w-full mx-auto">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl">
              <div className="mb-6">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                  Langkah 1 dari 2
                </span>
                <h1 className="text-2xl md:text-3xl font-black text-white mt-1">
                  Buat Room Kuis Baru &amp; Auto-Generate Soal
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  Pilih tema kuis untuk Outing Kantor Anda. Sistem akan meng-generate soal dan jawaban riil tanpa seeder acak.
                </p>
              </div>

              {/* Form Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Judul Acara / Room Kuis
                  </label>
                  <input
                    type="text"
                    value={roomTitle}
                    onChange={(e) => setRoomTitle(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                    placeholder="Contoh: Outing Kantor 2026"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Waktu Per Soal (Detik)
                  </label>
                  <select
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value={15}>15 Detik (Cepat &amp; Sengit)</option>
                    <option value={20}>20 Detik (Standar Rekomendasi)</option>
                    <option value={30}>30 Detik (Santai &amp; Diskusi)</option>
                  </select>
                </div>
              </div>

              {/* Theme Selection */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Pilih Tema Soal Real untuk Auto-Generate:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {PRESET_THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => {
                        setSelectedTheme(theme.id);
                        sound.playClick();
                      }}
                      className={`p-3.5 rounded-2xl border text-left transition-all ${
                        selectedTheme === theme.id
                          ? 'border-amber-500 bg-amber-500/10 ring-1 ring-amber-500'
                          : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-sm font-bold text-white mb-1">
                        {theme.name}
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                        {theme.description}
                      </div>
                    </button>
                  ))}

                  {/* Custom Topic Option */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTheme('custom');
                      sound.playClick();
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      selectedTheme === 'custom'
                        ? 'border-amber-500 bg-amber-500/10 ring-1 ring-amber-500'
                        : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-sm font-bold text-white mb-1">
                      ✨ Topik Bebas / Custom
                    </div>
                    <div className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      Tulis topik spesifik sendiri (contoh: Divisi Marketing, Trivia Kantor).
                    </div>
                  </button>
                </div>

                {selectedTheme === 'custom' && (
                  <div className="mt-3">
                    <input
                      type="text"
                      value={customTopic}
                      onChange={(e) => setCustomTopic(e.target.value)}
                      placeholder="Ketik topik custom (misal: 'Keluarga Besar Divisi IT')"
                      className="w-full px-4 py-2.5 bg-slate-950 border border-amber-500/50 rounded-xl text-sm text-white focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Number of questions selector & Generate Button */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 font-medium">Jumlah Soal:</span>
                  <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 p-1 rounded-xl text-xs">
                    {[5, 8, 10].map((count) => (
                      <button
                        key={count}
                        type="button"
                        onClick={() => {
                          setQuestionCount(count);
                          sound.playClick();
                        }}
                        className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                          questionCount === count
                            ? 'bg-amber-500 text-slate-950'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {count} Soal
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateQuestions}
                  disabled={isGenerating}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-amber-500/50 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-bold transition-all shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isGenerating ? 'Meng-generate...' : 'Acak Ulang Soal Auto-Generate'}</span>
                </button>
              </div>
            </div>

            {/* Preview Generated Questions */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Preview {generatedQuestions.length} Soal Real Siap Dimainkan
                  </h3>
                </div>
                <span className="text-xs text-slate-400">Semua opsi &amp; kunci terverifikasi</span>
              </div>

              <div className="flex flex-col gap-3">
                {generatedQuestions.map((q, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="font-bold text-amber-400 font-mono">#{idx + 1}</span>
                      <span className="text-[11px] text-slate-500">{q.category}</span>
                    </div>
                    <p className="text-sm font-semibold text-white">{q.question}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                      {q.options.map((opt, oIdx) => (
                        <div
                          key={oIdx}
                          className={`px-3 py-1.5 rounded-lg text-xs flex items-center justify-between ${
                            opt === q.answer
                              ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-bold'
                              : 'bg-slate-900 text-slate-400'
                          }`}
                        >
                          <span>{String.fromCharCode(65 + oIdx)}. {opt}</span>
                          {opt === q.answer && <Check className="w-3 h-3 text-emerald-400" />}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Launch Room Button */}
              <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={handleCreateAndLaunchRoom}
                  className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm tracking-wide shadow-xl shadow-amber-500/20 transition-all"
                >
                  <span>Buka Room Quis &amp; Tampilkan QR Lobby</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            SUB-VIEW B: OPERATOR LOBBY (WAITING ROOM WITH QR CODE & PIN)
            ===================================================================== */}
        {operatorMode === 'quis' && creatorStep === 'lobby' && room && (
          <div className="flex-1 flex flex-col gap-6">
            {/* Giant Room PIN & QR Card for Projector */}
            <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 md:p-10 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8">
              {/* Left Column: Instructions & PIN */}
              <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left gap-4">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>{room.title}</span>
                </div>

                <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                  Bergabung di Layar HP Kamu!
                </h1>
                <p className="text-slate-400 text-sm max-w-lg">
                  Buka browser di HP kamu, scan QR Code di samping atau masukkan Game PIN di bawah ini. Wajib mengisi nama peserta!
                </p>

                {/* Big PIN Display */}
                <div className="my-2 p-5 bg-slate-950 border-2 border-amber-500/40 rounded-3xl text-center shadow-xl">
                  <span className="text-xs uppercase tracking-widest text-slate-500 font-bold block mb-1">
                    GAME PIN RESMI
                  </span>
                  <span className="text-5xl md:text-6xl font-black font-mono tracking-widest text-amber-400">
                    {room.pin}
                  </span>
                </div>

                {/* Action Buttons: Copy link */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={copyInviteLink}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedLink ? 'Link Undangan Tersalin!' : 'Salin Link Undangan'}</span>
                  </button>
                </div>
              </div>

              {/* Right Column: Real QR Code */}
              <div className="flex flex-col items-center gap-3 p-6 bg-slate-950/80 border border-slate-800 rounded-3xl shadow-xl">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-amber-400" />
                  <span>Scan QR Code untuk Gabung</span>
                </span>

                <QRCodeDisplay
                  url={`${window.location.origin}${window.location.pathname}?pin=${room.pin}`}
                  size={210}
                />

                <span className="text-[11px] text-slate-500">
                  Langsung terhubung tanpa perlu ketik PIN
                </span>
              </div>
            </div>

            {/* Participants Grid */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <Users className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-bold text-white">
                    Peserta yang Sudah Masuk ({Object.keys(room.participants).length})
                  </h3>
                </div>

                {Object.keys(room.participants).length === 0 && (
                  <span className="text-xs text-amber-400 animate-pulse">
                    Menunggu peserta pertama scan QR / join dengan PIN...
                  </span>
                )}
              </div>

              {Object.keys(room.participants).length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-slate-800 rounded-2xl">
                  <p className="text-sm text-slate-400">
                    Belum ada peserta yang bergabung. Buka browser di HP kamu, lalu scan QR Code atau masukkan Game PIN di atas untuk bergabung.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {Object.values(room.participants).map((p) => (
                    <div
                      key={p.id}
                      className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex items-center gap-2.5 shadow-sm"
                    >
                      <span className={`w-3.5 h-3.5 rounded-full ${p.avatarColor} shrink-0`} />
                      <span className="text-xs font-bold text-slate-200 truncate">
                        {p.name}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Start Quiz CTA */}
              <div className="mt-8 pt-4 border-t border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCreatorStep('create')}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Ubah Pengaturan Soal
                </button>

                <button
                  type="button"
                  onClick={handleStartQuizFromLobby}
                  className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm tracking-wide shadow-xl shadow-amber-500/20 transition-all"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Mulai Quis Sekarang ({Object.keys(room.participants).length} Peserta)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            SUB-VIEW C: OPERATOR PROJECTOR GAMEPLAY (QUESTIONS, STATS, PODIUM)
            ===================================================================== */}
        {operatorMode === 'quis' && creatorStep === 'game' && room && (
          <div className="flex-1 flex flex-col gap-6">
            {/* C0: Reading Question Phase (Operator reads question aloud, options hidden until GO is pressed) */}
            {room.status === 'reading' && currentQuestion && (
              <div className="flex-1 flex flex-col justify-between gap-6">
                {/* Question Info Bar */}
                <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl px-6 py-3.5">
                  <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                    <span className="text-amber-400 font-bold uppercase tracking-wider">
                      {currentQuestion.category || room.topic}
                    </span>
                    <span aria-hidden="true" className="text-slate-700">·</span>
                    <span>Soal {room.currentQuestionIndex + 1} dari {room.questions.length}</span>
                  </div>

                  <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold animate-pulse">
                    <span>🎙️ Sesi Membaca Soal (Operator / MC)</span>
                  </div>

                  <div className="text-xs font-semibold text-slate-300">
                    Peserta Terkoneksi: <strong className="text-emerald-400 font-mono">{Object.keys(room.participants).length}</strong> Orang
                  </div>
                </div>

                {/* Big Question Banner for Reading */}
                <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-8 md:p-12 text-center shadow-2xl min-h-[250px] flex flex-col items-center justify-center gap-4">
                  <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
                    PERTANYAAN SOAL {room.currentQuestionIndex + 1}
                  </span>
                  <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-white leading-snug tracking-tight max-w-4xl">
                    &ldquo;{currentQuestion.question}&rdquo;
                  </h1>
                  <p className="text-xs md:text-sm text-slate-400 max-w-xl italic mt-1">
                    📢 Bacakan pertanyaan di atas ke seluruh peserta. Setelah selesai, tekan tombol <strong>GO</strong> untuk memunculkan pilihan ganda A, B, C, D &amp; memulai timer!
                  </p>
                </div>

                {/* 4 Hidden/Locked Option Placeholders indicating options are coming */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['A', 'B', 'C', 'D'].map((letter, idx) => {
                    const shape = KAHOOT_SHAPES[idx] || KAHOOT_SHAPES[0];
                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-4 p-5 md:p-6 rounded-2xl bg-slate-900/50 border border-dashed border-slate-800 text-slate-500 select-none"
                      >
                        <div className="p-2.5 bg-slate-800/80 rounded-xl shrink-0 opacity-70">
                          {shape.icon('w-7 h-7 text-slate-400')}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-400">Pilihan {letter}</span>
                          <span className="text-xs text-slate-500 font-mono">🔒 Pilihan disembunyikan sampai tombol GO ditekan</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* GIANT GO BUTTON FOR OPERATOR */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border border-amber-500/40 rounded-3xl shadow-2xl">
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black text-sm">
                      GO!
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Selesai Membaca Soal?</h4>
                      <p className="text-xs text-slate-400">
                        Tekan tombol GO untuk membuka pilihan jawaban A, B, C, D di layar ini dan di HP semua peserta!
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleTriggerGo}
                    className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-400 hover:via-orange-400 hover:to-rose-400 text-slate-950 font-black text-base md:text-lg tracking-wider shadow-2xl shadow-amber-500/40 hover:scale-105 active:scale-95 transition-all animate-pulse"
                  >
                    <Play className="w-6 h-6 fill-current" />
                    <span>GO! BUKA PILIHAN JAWABAN (A, B, C, D)</span>
                  </button>
                </div>
              </div>
            )}

            {/* C1: Active Question Display (Projector) */}
            {room.status === 'question' && currentQuestion && (
              <div className="flex-1 flex flex-col justify-between gap-6">
                {/* Question Info Bar */}
                <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl px-6 py-3.5">
                  <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                    <span className="text-amber-400 font-bold uppercase tracking-wider">
                      {currentQuestion.category || room.topic}
                    </span>
                    <span aria-hidden="true" className="text-slate-700">·</span>
                    <span>Soal {room.currentQuestionIndex + 1} dari {room.questions.length}</span>
                  </div>

                  {/* Circular Timer Ring / Countdown */}
                  <div className="flex items-center gap-3">
                    <div className={`px-4 py-1.5 rounded-xl border font-mono font-black text-xl tabular-nums ${
                      timerLeft <= 5
                        ? 'border-rose-500 bg-rose-950 text-rose-300 animate-pulse'
                        : 'border-slate-800 bg-slate-950 text-amber-400'
                    }`}>
                      {timerLeft}s
                    </div>
                  </div>

                  <div className="text-xs font-semibold text-slate-300">
                    Jawaban Masuk: <strong className="text-emerald-400 font-mono">{currentAnswersCount}</strong> / {Object.keys(room.participants).length}
                  </div>
                </div>

                {/* Big Question Banner */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12 text-center shadow-2xl min-h-[220px] flex items-center justify-center">
                  <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-white leading-snug tracking-tight max-w-4xl">
                    {currentQuestion.question}
                  </h1>
                </div>

                {/* 4 Kahoot Option Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentQuestion.options.map((opt, idx) => {
                    const shape = KAHOOT_SHAPES[idx] || KAHOOT_SHAPES[0];
                    return (
                      <div
                        key={idx}
                        className={`flex items-center gap-4 p-5 md:p-6 rounded-2xl ${shape.bgClass} text-white shadow-xl`}
                      >
                        <div className="p-2.5 bg-black/20 rounded-xl shrink-0">
                          {shape.icon('w-8 h-8 text-white')}
                        </div>
                        <span className="text-lg md:text-xl font-black tracking-tight leading-snug">
                          {opt}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Operator Emergency Controls */}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={handleRevealAnswer}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Kunci Jawaban Sekarang</span>
                  </button>
                </div>
              </div>
            )}

            {/* C2: Answer Summary & Distribution Chart */}
            {room.status === 'answered_summary' && currentQuestion && (
              <div className="flex-1 flex flex-col justify-between gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl">
                  <div className="text-center mb-6">
                    <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold">
                      KUNCI JAWABAN BENAR
                    </span>
                    <h2 className="text-2xl md:text-3xl font-black text-white mt-1">
                      {currentQuestion.answer}
                    </h2>
                    {currentQuestion.funFact && (
                      <p className="text-xs text-slate-400 mt-2 max-w-xl mx-auto italic">
                        💡 {currentQuestion.funFact}
                      </p>
                    )}
                  </div>

                  {/* Kahoot Bar Chart of Participant Choices */}
                  <div className="grid grid-cols-4 gap-4 items-end h-56 pt-8 max-w-3xl mx-auto">
                    {currentQuestion.options.map((opt, idx) => {
                      const shape = KAHOOT_SHAPES[idx] || KAHOOT_SHAPES[0];
                      const count = answerDistribution[idx];
                      const total = Math.max(1, Object.keys(room.participants).length);
                      const heightPercent = Math.max(12, Math.round((count / total) * 100));
                      const isCorrect = opt === currentQuestion.answer;

                      return (
                        <div key={idx} className="flex flex-col items-center h-full justify-end gap-2">
                          <span className="text-sm font-mono font-black text-white">
                            {count}
                          </span>
                          <div
                            style={{ height: `${heightPercent}%` }}
                            className={`w-full rounded-2xl ${shape.bgClass} flex items-center justify-center transition-all duration-500 relative ${
                              isCorrect ? 'ring-4 ring-emerald-400 shadow-lg shadow-emerald-500/20' : 'opacity-70'
                            }`}
                          >
                            {isCorrect && (
                              <Check className="w-6 h-6 text-white absolute -top-8 bg-emerald-500 rounded-full p-1" />
                            )}
                            <div className="p-1 bg-black/20 rounded-lg">
                              {shape.icon('w-5 h-5 text-white')}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleShowLeaderboard}
                    className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm tracking-wide shadow-xl shadow-amber-500/20 transition-all"
                  >
                    <span>Lanjut ke Papan Skor</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* C3: Interim Leaderboard */}
            {room.status === 'leaderboard' && (
              <div className="flex-1 flex flex-col justify-between gap-6 max-w-3xl mx-auto w-full">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl">
                  <div className="text-center mb-6">
                    <Trophy className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                    <h2 className="text-2xl font-black text-white tracking-tight">
                      Papan Peringkat Sementara
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Skor dihitung dari kecepatan dan ketepatan menjawab
                    </p>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    {sortedParticipants.slice(0, 7).map((p, idx) => (
                      <div
                        key={p.id}
                        className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                          idx === 0
                            ? 'bg-amber-500/10 border-amber-500/40'
                            : 'bg-slate-950 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-7 h-7 rounded-xl font-black flex items-center justify-center text-xs ${
                            idx === 0
                              ? 'bg-amber-500 text-slate-950'
                              : idx === 1
                                ? 'bg-slate-300 text-slate-950'
                                : idx === 2
                                  ? 'bg-amber-700 text-white'
                                  : 'bg-slate-800 text-slate-400'
                          }`}>
                            {idx + 1}
                          </span>
                          <span className="text-sm font-bold text-white">
                            {p.name}
                          </span>
                          {p.streak >= 2 && (
                            <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                              <Flame className="w-3.5 h-3.5 fill-current" />
                              {p.streak}x
                            </span>
                          )}
                        </div>

                        <div className="text-sm font-mono font-black text-amber-400 tabular-nums">
                          {p.score} <span className="text-xs text-slate-500 font-normal">pts</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleNextQuestion}
                    className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm tracking-wide shadow-xl shadow-amber-500/20 transition-all"
                  >
                    <span>
                      {room.currentQuestionIndex + 1 < room.questions.length
                        ? 'Lanjut Soal Berikutnya (Membaca Soal)'
                        : 'Lihat Podium Pemenang Akhir'}
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* C4: Final Podium Screen */}
            {room.status === 'finished' && (
              <div className="flex-1 flex flex-col justify-between gap-6 max-w-4xl mx-auto w-full">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-10 shadow-2xl text-center">
                  <Crown className="w-12 h-12 text-amber-400 mx-auto mb-2 animate-bounce" />
                  <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                    PODIUM JUARA OUTING KANTOR!
                  </h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Selamat kepada para pemenang kuis tercepat dan tertepat hari ini!
                  </p>

                  {/* 3-Tier Podium */}
                  <div className="flex items-end justify-center gap-3 sm:gap-6 my-10 max-w-lg mx-auto">
                    {/* Rank 2 (Silver) */}
                    {sortedParticipants[1] && (
                      <div className="flex-1 flex flex-col items-center">
                        <span className="text-xs font-bold text-slate-300 truncate max-w-[100px] mb-2">
                          {sortedParticipants[1].name}
                        </span>
                        <div className="w-full bg-slate-800 border-t-4 border-slate-400 rounded-t-2xl pt-6 pb-4 flex flex-col items-center h-40 justify-between">
                          <span className="text-2xl font-black text-slate-300">#2</span>
                          <span className="text-xs font-mono font-bold text-slate-400">
                            {sortedParticipants[1].score} pts
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Rank 1 (Gold) */}
                    {sortedParticipants[0] && (
                      <div className="flex-1 flex flex-col items-center">
                        <Crown className="w-6 h-6 text-amber-400 mb-1" />
                        <span className="text-sm font-black text-amber-300 truncate max-w-[120px] mb-2">
                          {sortedParticipants[0].name}
                        </span>
                        <div className="w-full bg-gradient-to-b from-amber-500/30 to-amber-950 border-t-4 border-amber-400 rounded-t-2xl pt-8 pb-4 flex flex-col items-center h-52 justify-between shadow-2xl">
                          <span className="text-4xl font-black text-amber-400">#1</span>
                          <span className="text-sm font-mono font-black text-amber-300">
                            {sortedParticipants[0].score} pts
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Rank 3 (Bronze) */}
                    {sortedParticipants[2] && (
                      <div className="flex-1 flex flex-col items-center">
                        <span className="text-xs font-bold text-slate-300 truncate max-w-[100px] mb-2">
                          {sortedParticipants[2].name}
                        </span>
                        <div className="w-full bg-slate-800 border-t-4 border-amber-700 rounded-t-2xl pt-4 pb-4 flex flex-col items-center h-32 justify-between">
                          <span className="text-xl font-black text-amber-600">#3</span>
                          <span className="text-xs font-mono font-bold text-slate-400">
                            {sortedParticipants[2].score} pts
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Full Leaderboard Table */}
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-left">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                      Rekap Lengkap Seluruh Peserta:
                    </span>
                    <div className="divide-y divide-slate-800/80 text-xs">
                      {sortedParticipants.map((p, idx) => (
                        <div key={p.id} className="py-2 flex items-center justify-between">
                          <span className="font-semibold text-slate-200">
                            {idx + 1}. {p.name}
                          </span>
                          <span className="font-mono font-bold text-amber-400">{p.score} pts</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Final Actions */}
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => {
                      setCreatorStep('create');
                      setCurrentPin('');
                      setRoom(null);
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Buat Room Quis Baru</span>
                  </button>

                  <button
                    onClick={() => {
                      confetti({
                        particleCount: 150,
                        spread: 100,
                      });
                      sound.playFanfare();
                    }}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-lg"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Rayakan Pemenang (Konfeti)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Operator Floating/Global QR Code Modal */}
      {showHostQrModal && room && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full text-center flex flex-col items-center gap-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">QR Code Join Room</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Peserta yang baru datang dapat scan langsung dengan kamera HP.
              </p>
            </div>

            <QRCodeDisplay
              url={`${window.location.origin}${window.location.pathname}?pin=${room.pin}`}
              size={210}
            />

            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 w-full text-center">
              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block mb-0.5">
                GAME PIN RESMI
              </span>
              <span className="text-3xl font-mono font-black tracking-widest text-amber-400">
                {room.pin}
              </span>
            </div>

            <div className="flex items-center gap-2 w-full">
              <button
                type="button"
                onClick={copyInviteLink}
                className="flex-1 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors flex items-center justify-center gap-1.5"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'Tersalin!' : 'Salin Link'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowHostQrModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
