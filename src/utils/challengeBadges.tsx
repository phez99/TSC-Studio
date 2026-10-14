import React from 'react';
import { 
  Theater, 
  Flame, 
  MessageCircle, 
  Volume2, 
  Smile, 
  Heart, 
  Dumbbell, 
  Mic2, 
  Smartphone, 
  ShoppingBag,
  Sparkles
} from 'lucide-react';
import { ChallengeCategory } from '../services/roomStorage';

export interface CategoryInfo {
  category: ChallengeCategory;
  label: string;
  emoji: string;
  color: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  icon: (className?: string) => React.ReactNode;
}

export const CATEGORY_INFOS: Record<ChallengeCategory, CategoryInfo> = {
  'Parodi & Akting Viral': {
    category: 'Parodi & Akting Viral',
    label: 'Parodi & Akting Viral',
    emoji: '🎭',
    color: 'purple',
    badgeBg: 'bg-purple-950/40',
    badgeBorder: 'border-purple-500/40',
    badgeText: 'text-purple-300',
    icon: (c = 'w-4 h-4') => <Theater className={c} />,
  },
  'Goyang Viral & TikTok': {
    category: 'Goyang Viral & TikTok',
    label: 'Goyang Viral & TikTok',
    emoji: '💃',
    color: 'rose',
    badgeBg: 'bg-rose-950/40',
    badgeBorder: 'border-rose-500/40',
    badgeText: 'text-rose-300',
    icon: (c = 'w-4 h-4') => <Flame className={c} />,
  },
  'Jujur & Curhat Huru-Hara': {
    category: 'Jujur & Curhat Huru-Hara',
    label: 'Jujur & Curhat Huru-Hara',
    emoji: '🎤',
    color: 'amber',
    badgeBg: 'bg-amber-950/40',
    badgeBorder: 'border-amber-500/40',
    badgeText: 'text-amber-300',
    icon: (c = 'w-4 h-4') => <MessageCircle className={c} />,
  },
  'Tirukan Suara & Hewan': {
    category: 'Tirukan Suara & Hewan',
    label: 'Tirukan Suara & Hewan',
    emoji: '🐔',
    color: 'emerald',
    badgeBg: 'bg-emerald-950/40',
    badgeBorder: 'border-emerald-500/40',
    badgeText: 'text-emerald-300',
    icon: (c = 'w-4 h-4') => <Volume2 className={c} />,
  },
  'Tahan Tawa & Muka Jelek': {
    category: 'Tahan Tawa & Muka Jelek',
    label: 'Tahan Tawa & Muka Jelek',
    emoji: '🤪',
    color: 'yellow',
    badgeBg: 'bg-yellow-950/40',
    badgeBorder: 'border-yellow-500/40',
    badgeText: 'text-yellow-300',
    icon: (c = 'w-4 h-4') => <Smile className={c} />,
  },
  'Gombalan Absurd & Rayuan': {
    category: 'Gombalan Absurd & Rayuan',
    label: 'Gombalan Absurd & Rayuan',
    emoji: '💘',
    color: 'pink',
    badgeBg: 'bg-pink-950/40',
    badgeBorder: 'border-pink-500/40',
    badgeText: 'text-pink-300',
    icon: (c = 'w-4 h-4') => <Heart className={c} />,
  },
  'Tantangan Fisik Kocak': {
    category: 'Tantangan Fisik Kocak',
    label: 'Tantangan Fisik Kocak',
    emoji: '🤸',
    color: 'orange',
    badgeBg: 'bg-orange-950/40',
    badgeBorder: 'border-orange-500/40',
    badgeText: 'text-orange-300',
    icon: (c = 'w-4 h-4') => <Dumbbell className={c} />,
  },
  'Nyanyi Hancur & Karaoke Rusak': {
    category: 'Nyanyi Hancur & Karaoke Rusak',
    label: 'Nyanyi Hancur & Karaoke Rusak',
    emoji: '🎶',
    color: 'sky',
    badgeBg: 'bg-sky-950/40',
    badgeBorder: 'border-sky-500/40',
    badgeText: 'text-sky-300',
    icon: (c = 'w-4 h-4') => <Mic2 className={c} />,
  },
  'Prank Telepon & Chat Halu': {
    category: 'Prank Telepon & Chat Halu',
    label: 'Prank Telepon & Chat Halu',
    emoji: '📱',
    color: 'cyan',
    badgeBg: 'bg-cyan-950/40',
    badgeBorder: 'border-cyan-500/40',
    badgeText: 'text-cyan-300',
    icon: (c = 'w-4 h-4') => <Smartphone className={c} />,
  },
  'Bintang Iklan Nyeleneh': {
    category: 'Bintang Iklan Nyeleneh',
    label: 'Bintang Iklan Nyeleneh',
    emoji: '👑',
    color: 'indigo',
    badgeBg: 'bg-indigo-950/40',
    badgeBorder: 'border-indigo-500/40',
    badgeText: 'text-indigo-300',
    icon: (c = 'w-4 h-4') => <ShoppingBag className={c} />,
  },
};

export function getCategoryInfo(category: ChallengeCategory): CategoryInfo {
  return CATEGORY_INFOS[category] || {
    category,
    label: category,
    emoji: '✨',
    color: 'slate',
    badgeBg: 'bg-slate-900',
    badgeBorder: 'border-slate-700',
    badgeText: 'text-slate-300',
    icon: (c = 'w-4 h-4') => <Sparkles className={c} />,
  };
}
