import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Flame, 
  Play, 
  Vote, 
  Check, 
  Sparkles, 
  Users, 
  Timer as TimerIcon, 
  Crown, 
  History, 
  QrCode, 
  Copy, 
  ExternalLink,
  Shuffle
} from 'lucide-react';
import { 
  Room, 
  ChallengeCategory, 
  TEN_CHALLENGE_CATEGORIES 
} from '../services/roomStorage';
import { getCategoryInfo } from '../utils/challengeBadges';
import { QRCodeDisplay } from './QRCodeDisplay';
import { sound } from '../utils/audio';

interface ArisanStudioProps {
  room: Room;
  onSpin: (categoryFilter?: string) => Promise<void>;
  onToggleVote: (isOpen: boolean) => Promise<void>;
  onSelectChallenge: (challengeId?: string) => Promise<void>;
  onCompleteChallenge: () => Promise<void>;
  onResetArisan: () => Promise<void>;
  onAddDemoParticipant?: (name: string) => Promise<void>;
  copyInviteLink: () => void;
  openTestTab?: () => void;
  copiedLink: boolean;
}

export const ArisanStudio: React.FC<ArisanStudioProps> = ({
  room,
  onSpin,
  onToggleVote,
  onSelectChallenge,
  onCompleteChallenge,
  onResetArisan,
  copyInviteLink,
  copiedLink,
}) => {
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [isSpinningLocal, setIsSpinningLocal] = useState<boolean>(false);
  const [displayRollingName, setDisplayRollingName] = useState<string>('???');
  const [challengeTimer, setChallengeTimer] = useState<number>(60);
  const [isChallengeTimerRunning, setIsChallengeTimerRunning] = useState<boolean>(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  const participantsList = Object.values(room.participants || {});
  const arisan = room.arisan;

  const eligibleParticipants = participantsList.filter(
    (p) => !(arisan?.excludedParticipantIds || []).includes(p.id)
  );

  // Timer countdown for active challenge
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isChallengeTimerRunning && challengeTimer > 0) {
      interval = setInterval(() => {
        setChallengeTimer((prev) => {
          if (prev <= 5 && prev > 1) {
            sound.playTick();
          }
          if (prev === 1) {
            sound.playWrong();
            setIsChallengeTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isChallengeTimerRunning, challengeTimer]);

  const handleStartSpin = async () => {
    if (participantsList.length === 0) {
      alert('Belum ada peserta yang bergabung ke room ini!');
      return;
    }

    setIsSpinningLocal(true);
    sound.playClick();

    // Rolling animation for 2.8 seconds
    const names = participantsList.map((p) => p.name);
    let counter = 0;
    const rollInterval = setInterval(() => {
      setDisplayRollingName(names[counter % names.length]);
      counter++;
      sound.playTick();
    }, 85);

    // Trigger backend pick with optional category filter
    await onSpin(selectedCategoryFilter === 'all' ? undefined : selectedCategoryFilter);

    setTimeout(() => {
      clearInterval(rollInterval);
      setIsSpinningLocal(false);
      sound.playFanfare();
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
      setChallengeTimer(60);
      setIsChallengeTimerRunning(false);
    }, 2800);
  };

  return (
    <div className="flex-1 flex flex-col gap-6">
      {/* =======================================================================
          TOP BAR: PIN JOIN & PARTICIPANT STATS (MANDATORY PIN AT TOP)
          ======================================================================= */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 md:p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        {/* Left: Giant PIN for latecomers */}
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-tr from-amber-500 to-rose-500 rounded-2xl text-slate-950 font-black shadow-lg shadow-amber-500/20">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-widest text-slate-400 font-bold">
                PIN JOIN PESERTA (SCAN / KETIK PIN):
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="text-3xl md:text-4xl font-mono font-black tracking-widest text-amber-400">
              {room.pin}
            </div>
          </div>
        </div>

        {/* Center: Live Counter */}
        <div className="flex items-center gap-3 bg-slate-950/70 border border-slate-800 px-4 py-2.5 rounded-2xl">
          <Users className="w-5 h-5 text-sky-400" />
          <div className="text-xs">
            <div className="text-slate-400">Peserta Terdaftar:</div>
            <div className="text-base font-black text-white font-mono">
              {participantsList.length} Orang{' '}
              <span className="text-xs text-amber-400 font-normal">
                ({eligibleParticipants.length} belum challenge)
              </span>
            </div>
          </div>
        </div>

        {/* Right: Quick QR & Link actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowQrModal(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors"
          >
            <QrCode className="w-4 h-4 text-amber-400" />
            <span>Tampilkan QR</span>
          </button>

          <button
            onClick={copyInviteLink}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copiedLink ? 'Tersalin!' : 'Salin Link'}</span>
          </button>
        </div>
      </div>

      {/* =======================================================================
          10 CHALLENGE CATEGORIES BAR (FILTER / FOCUS)
          ======================================================================= */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl">
        <div className="flex items-center justify-between gap-2 mb-2 px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            10 Kategori Challenge Outing (Lucu, Viral, Humor &amp; Banyak Tawa):
          </span>
          <span className="text-[11px] text-slate-400">
            {selectedCategoryFilter === 'all' ? 'Acak Semua Kategori' : `Kategori: ${selectedCategoryFilter}`}
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => { setSelectedCategoryFilter('all'); sound.playClick(); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedCategoryFilter === 'all'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            🎲 Semua 10 Kategori (Campur)
          </button>

          {TEN_CHALLENGE_CATEGORIES.map((cat) => {
            const info = getCategoryInfo(cat);
            const isSelected = selectedCategoryFilter === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => { setSelectedCategoryFilter(cat); sound.playClick(); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'bg-slate-950 border border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <span>{info.emoji}</span>
                <span>{cat}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* =======================================================================
          MAIN CHALLENGE STAGE: ROULETTE & CHALLENGE CARDS
          ======================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Roulette / Wheel Spinner (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Giant Spinner Box */}
          <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 md:p-10 shadow-2xl text-center flex flex-col items-center justify-between min-h-[380px] relative overflow-hidden">
            {/* Stage Header */}
            <div className="flex items-center justify-between w-full text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-amber-400">
                <Flame className="w-4 h-4 text-rose-400" />
                STAGE RANDOM NAME &amp; CHALLENGE OUTING
              </span>
              <span className="text-slate-500">TSC Studio Versi 1</span>
            </div>

            {/* Rolling Spotlight Name */}
            <div className="my-8 w-full max-w-lg">
              <span className="text-xs uppercase tracking-widest text-slate-500 font-bold block mb-3">
                {isSpinningLocal
                  ? 'SEDANG MENGACAK NAMA PESERTA...'
                  : arisan?.selectedParticipantName
                    ? '🎯 PESERTA TERPILIH UNTUK CHALLENGE:'
                    : 'SIAPA YANG AKAN MENERIMA TANTANGAN?'}
              </span>

              <div className={`p-6 md:p-8 rounded-3xl border-2 transition-all duration-300 shadow-2xl ${
                isSpinningLocal
                  ? 'border-amber-500 bg-amber-950/30 text-amber-300 scale-105 animate-pulse ring-4 ring-amber-500/20'
                  : arisan?.selectedParticipantName
                    ? 'border-rose-500 bg-rose-950/40 text-rose-300 ring-4 ring-rose-500/30'
                    : 'border-slate-800 bg-slate-950 text-slate-400'
              }`}>
                <div className="text-3xl md:text-5xl font-black tracking-tight truncate">
                  {isSpinningLocal
                    ? displayRollingName
                    : arisan?.selectedParticipantName || 'Tekan Tombol Start'}
                </div>
              </div>
            </div>

            {/* Spin CTA Button */}
            <div className="w-full flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleStartSpin}
                disabled={isSpinningLocal || participantsList.length === 0}
                className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 hover:from-amber-400 hover:to-rose-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-black text-base tracking-wide shadow-xl shadow-amber-500/25 transition-all transform active:scale-95"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>{isSpinningLocal ? 'Mengacak Nama...' : 'START PUTAR NAMA!'}</span>
              </button>

              {arisan?.selectedParticipantName && (
                <button
                  type="button"
                  onClick={onCompleteChallenge}
                  className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-lg"
                  title="Simpan nama ini ke riwayat pemenang dan lanjut undi berikutnya"
                >
                  <Check className="w-4 h-4" />
                  <span>Tandai Selesai &amp; Undi Berikutnya</span>
                </button>
              )}
            </div>

            {/* Empty state hint */}
            {participantsList.length === 0 && (
              <div className="mt-4 p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-400 flex items-center justify-center gap-2">
                <span>Belum ada peserta yang bergabung. Ajak peserta scan QR Code di atas atau masukkan PIN untuk mulai!</span>
              </div>
            )}
          </div>

          {/* Active Challenge Spotlight & Timer */}
          {arisan?.activeChallenge && (
            <div className="bg-slate-900 border-2 border-rose-500/60 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest text-rose-400 font-bold flex items-center gap-1.5">
                  <Crown className="w-4 h-4" />
                  TANTANGAN AKTIF UNTUK: {arisan.selectedParticipantName}
                </span>

                {/* Challenge Timer */}
                <div className="flex items-center gap-2">
                  <div className={`px-3 py-1 rounded-xl font-mono font-black text-sm tabular-nums border ${
                    challengeTimer <= 10 && challengeTimer > 0
                      ? 'border-rose-500 bg-rose-950 text-rose-300 animate-pulse'
                      : 'border-slate-800 bg-slate-950 text-amber-400'
                  }`}>
                    <TimerIcon className="w-3.5 h-3.5 inline mr-1" />
                    {challengeTimer}s
                  </div>
                  <button
                    onClick={() => setIsChallengeTimerRunning(prev => !prev)}
                    className="px-3 py-1 rounded-lg bg-slate-800 text-xs font-semibold text-slate-200 hover:bg-slate-700"
                  >
                    {isChallengeTimerRunning ? 'Jeda' : 'Mulai Timer'}
                  </button>
                  <button
                    onClick={() => setChallengeTimer(60)}
                    className="px-2 py-1 rounded-lg bg-slate-800 text-xs text-slate-400 hover:text-white"
                  >
                    60s
                  </button>
                </div>
              </div>

              <div>
                <div className="text-xs text-rose-400 font-semibold mb-1">
                  Kategori: {arisan.activeChallenge.category}
                </div>
                <h3 className="text-xl md:text-2xl font-black text-white">
                  {arisan.activeChallenge.title}
                </h3>
                <p className="text-sm md:text-base text-slate-200 mt-2 leading-relaxed bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  &ldquo;{arisan.activeChallenge.description}&rdquo;
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={onCompleteChallenge}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-colors shadow-lg"
                >
                  Tantangan Berhasil Dilakukan (Beri Hadiah) 🎉
                </button>
              </div>
            </div>
          )}

          {/* Registered Participants Pill Grid */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
              <span className="font-bold text-white uppercase tracking-wider">
                Daftar Peserta Terkoneksi ({participantsList.length})
              </span>
              <span>Yang sudah challenge ditandai centang</span>
            </div>

            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
              {participantsList.map((p) => {
                const isWon = (arisan?.excludedParticipantIds || []).includes(p.id);
                const isSelected = arisan?.selectedParticipantId === p.id;

                return (
                  <div
                    key={p.id}
                    className={`px-3 py-1.5 rounded-xl border text-xs flex items-center gap-2 transition-all ${
                      isSelected
                        ? 'border-rose-500 bg-rose-500/20 text-rose-200 font-bold'
                        : isWon
                          ? 'border-slate-800/60 bg-slate-950/40 text-slate-500 line-through'
                          : 'border-slate-800 bg-slate-950 text-slate-300 font-medium'
                    }`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${p.avatarColor}`} />
                    <span>{p.name}</span>
                    {isWon && <Check className="w-3 h-3 text-emerald-500 ml-1" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: 3 Challenge Cards & Voting (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col gap-4">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                3 Opsi Tantangan untuk Peserta
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Bisa langsung dipilih oleh Operator atau dibuka voting untuk seluruh peserta lewat HP!
              </p>
            </div>

            {/* Voting Control Bar */}
            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs">
                <span className="text-slate-400">Voting HP: </span>
                <span className={`font-bold ${arisan?.isVotingOpen ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {arisan?.isVotingOpen ? '🟢 Terbuka (Peserta Memilih)' : '🔴 Ditutup'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onToggleVote(!arisan?.isVotingOpen)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                    arisan?.isVotingOpen
                      ? 'bg-rose-600 hover:bg-rose-500 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  <Vote className="w-3.5 h-3.5 inline mr-1" />
                  {arisan?.isVotingOpen ? 'Tutup Vote' : 'Buka Vote HP'}
                </button>

                <button
                  type="button"
                  onClick={() => onSelectChallenge()}
                  className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors"
                  title="Pilih tantangan yang memiliki suara terbanyak"
                >
                  Pilih Suara Terbanyak
                </button>
              </div>
            </div>

            {/* 3 Challenge Cards */}
            <div className="flex flex-col gap-3.5">
              {(arisan?.challenges || []).map((ch) => {
                const info = getCategoryInfo(ch.category);
                const voteCount = ch.votes?.length || 0;
                const totalVotes = (arisan?.challenges || []).reduce((acc, c) => acc + (c.votes?.length || 0), 0);
                const votePercentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
                const isCurrentActive = arisan?.activeChallenge?.id === ch.id;

                return (
                  <div
                    key={ch.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                      isCurrentActive
                        ? 'border-emerald-500 bg-emerald-950/30 ring-2 ring-emerald-500/30'
                        : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold ${info.badgeBg} ${info.badgeBorder} ${info.badgeText}`}>
                        {info.icon('w-3.5 h-3.5')}
                        <span>{info.emoji} {ch.category}</span>
                      </span>

                      <div className="flex items-center gap-1 text-xs font-mono font-bold text-amber-400">
                        <Vote className="w-3.5 h-3.5" />
                        <span>{voteCount} vote ({votePercentage}%)</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-white">
                        {ch.title}
                      </h4>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        {ch.description}
                      </p>
                    </div>

                    {arisan?.isVotingOpen && (
                      <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-amber-400 h-full transition-all duration-300"
                          style={{ width: `${votePercentage}%` }}
                        />
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-900 flex justify-end">
                      <button
                        type="button"
                        onClick={() => onSelectChallenge(ch.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                          isCurrentActive
                            ? 'bg-emerald-500 text-slate-950'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                        }`}
                      >
                        {isCurrentActive ? '✓ Terpilih' : 'Operator Pilih Ini'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Challenge Winners History */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <History className="w-4 h-4 text-amber-400" />
                Riwayat Selesai Challenge ({arisan?.winnersHistory?.length || 0})
              </span>

              {(arisan?.winnersHistory?.length || 0) > 0 && (
                <button
                  type="button"
                  onClick={onResetArisan}
                  className="text-xs text-rose-400 hover:text-rose-300 underline"
                >
                  Reset Riwayat
                </button>
              )}
            </div>

            {(arisan?.winnersHistory?.length || 0) === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">
                Belum ada yang diundi. Tekan tombol &apos;START PUTAR NAMA&apos; untuk mulai!
              </p>
            ) : (
              <div className="flex flex-col gap-2 max-h-52 overflow-y-auto divide-y divide-slate-800/80">
                {(arisan?.winnersHistory || []).map((rec, i) => (
                  <div key={i} className="pt-2 first:pt-0 flex items-start justify-between gap-2 text-xs">
                    <div>
                      <div className="font-bold text-rose-300">
                        {rec.participantName}
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">
                        {rec.challenge.title} ({rec.challenge.category})
                      </div>
                    </div>
                    <span className="text-[10px] text-emerald-400 shrink-0 font-mono">
                      Selesai ✓
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QR Code Modal for Operator */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full text-center flex flex-col items-center gap-4 shadow-2xl">
            <h3 className="text-lg font-black text-white">Scan QR untuk Gabung Challenge</h3>
            <p className="text-xs text-slate-400">
              Peserta baru dapat scan QR di bawah dengan kamera HP dan masukkan nama.
            </p>

            <QRCodeDisplay
              url={`${window.location.origin}${window.location.pathname}?pin=${room.pin}`}
              size={220}
            />

            <div className="text-2xl font-black font-mono tracking-widest text-amber-400">
              PIN: {room.pin}
            </div>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
