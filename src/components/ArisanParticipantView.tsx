import React, { useState } from 'react';
import { 
  Flame, 
  Vote, 
  Check, 
  Crown,
  LogOut
} from 'lucide-react';
import { 
  Room, 
  Participant
} from '../services/roomStorage';
import { getCategoryInfo } from '../utils/challengeBadges';
import { sound } from '../utils/audio';

interface ArisanParticipantViewProps {
  room: Room;
  currentParticipant: Participant;
  onVote: (challengeId: string) => Promise<void>;
  onLogout?: () => void;
}

export const ArisanParticipantView: React.FC<ArisanParticipantViewProps> = ({
  room,
  currentParticipant,
  onVote,
  onLogout,
}) => {
  const [selectedVoteId, setSelectedVoteId] = useState<string | null>(null);
  const [isSubmittingVote, setIsSubmittingVote] = useState<boolean>(false);

  const arisan = room.arisan;
  const isSelectedWinner = arisan?.selectedParticipantId === currentParticipant.id;
  const isVotingOpen = Boolean(arisan?.isVotingOpen);

  const handleVoteClick = async (challengeId: string) => {
    if (!isVotingOpen || isSubmittingVote) return;
    setIsSubmittingVote(true);
    sound.playClick();
    setSelectedVoteId(challengeId);
    await onVote(challengeId);
    setIsSubmittingVote(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 md:p-6 select-none font-sans">
      {/* Top Header */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-rose-400" />
          <span className="text-xs font-bold text-white">Mode Challenge Outing</span>
        </div>
        <div className="text-xs font-mono font-bold text-amber-400">
          PIN: {room.pin}
        </div>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold">
            <span className={`w-2.5 h-2.5 rounded-full ${currentParticipant.avatarColor}`} />
            <span>{currentParticipant.name}</span>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors"
              title="Logout / Keluar"
            >
              <LogOut className="w-3 h-3" />
              <span>Logout</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Body */}
      <div className="my-auto py-6 flex flex-col items-center gap-6 max-w-md w-full mx-auto">
        {/* CASE 1: Current participant is the chosen winner! */}
        {isSelectedWinner ? (
          <div className="w-full bg-gradient-to-b from-rose-500/20 via-slate-900 to-slate-950 border-2 border-rose-400 rounded-3xl p-6 text-center flex flex-col items-center gap-4 shadow-2xl animate-pulse">
            <div className="w-16 h-16 rounded-full bg-rose-500 flex items-center justify-center text-white shadow-xl shadow-rose-500/30">
              <Crown className="w-8 h-8" />
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-rose-300 tracking-tight">
              SELAMAT! NAMA KAMU TERPILIH!
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed">
              Halo <strong className="text-white">{currentParticipant.name}</strong>, nama kamu terpilih untuk menjalankan challenge! Silakan bersiap maju ke depan panggung.
            </p>

            {arisan?.activeChallenge ? (
              <div className="w-full bg-slate-950 p-4 rounded-2xl border border-rose-500/40 text-left mt-2">
                <span className="text-[11px] uppercase tracking-widest text-rose-400 font-bold block mb-1">
                  Tantangan yang Harus Kamu Lakukan:
                </span>
                <h3 className="text-base font-black text-white">
                  {arisan.activeChallenge.title}
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  &ldquo;{arisan.activeChallenge.description}&rdquo;
                </p>
              </div>
            ) : (
              <div className="text-xs text-rose-300 bg-rose-950/60 p-3 rounded-xl border border-rose-800/40">
                Teman-teman dan Operator sedang menentukan tantangan gokil untukmu!
              </div>
            )}
          </div>
        ) : isVotingOpen ? (
          /* CASE 2: Audience Voting is Open! */
          <div className="w-full flex flex-col gap-4">
            <div className="text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
                <Vote className="w-3.5 h-3.5" />
                <span>VOTING TANTANGAN DIBUKA!</span>
              </div>
              <h2 className="text-lg md:text-xl font-black text-white">
                Pilih Tantangan untuk:
              </h2>
              <div className="text-2xl font-black text-rose-400 mt-0.5">
                {arisan?.selectedParticipantName || 'Peserta Terpilih'}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Ketuk salah satu dari pilihan tantangan di bawah:
              </p>
            </div>

            {/* Voting Cards */}
            <div className="flex flex-col gap-3">
              {(arisan?.challenges || []).map((ch) => {
                const info = getCategoryInfo(ch.category);
                const hasVotedThis = selectedVoteId === ch.id || ch.votes?.includes(currentParticipant.id);

                return (
                  <button
                    key={ch.id}
                    onClick={() => handleVoteClick(ch.id)}
                    className={`p-4 rounded-2xl border text-left transition-all transform active:scale-98 flex flex-col gap-2 ${
                      hasVotedThis
                        ? 'border-emerald-500 bg-emerald-950/50 ring-2 ring-emerald-500/40'
                        : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg border text-[11px] font-bold ${info.badgeBg} ${info.badgeBorder} ${info.badgeText}`}>
                        {info.icon('w-3.5 h-3.5')}
                        <span>{info.emoji} {ch.category}</span>
                      </span>

                      {hasVotedThis && (
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-400">
                          <Check className="w-4 h-4" />
                          <span>Pilihanmu</span>
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-white">
                      {ch.title}
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {ch.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* CASE 3: Waiting or Active Challenge in Progress */
          <div className="text-center flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-rose-400 shadow-xl">
              <Flame className="w-10 h-10 animate-bounce" />
            </div>

            <div>
              <h2 className="text-xl font-black text-white">
                {arisan?.selectedParticipantName
                  ? `${arisan.selectedParticipantName} Sedang Beraksi!`
                  : 'Mode Challenge Sedang Berlangsung'}
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                {arisan?.selectedParticipantName
                  ? 'Perhatikan layar proyektor panggung dan beri sorak tepuk tangan yang meriah!'
                  : 'Operator sedang mempersiapkan undian challenge berikutnya. Siap-siap!'}
              </p>
            </div>

            {arisan?.activeChallenge && (
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-left w-full mt-2">
                <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider block mb-1">
                  Tantangan Sedang Berlangsung:
                </span>
                <div className="text-sm font-bold text-white">
                  {arisan.activeChallenge.title}
                </div>
                <div className="text-xs text-slate-300 mt-1">
                  &ldquo;{arisan.activeChallenge.description}&rdquo;
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center text-[11px] text-slate-500 py-2">
        TSC Studio Versi 1 · Outing Kantor Interaktif
      </div>
    </div>
  );
};
