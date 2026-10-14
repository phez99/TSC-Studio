import React from 'react';

export interface KahootThemeShape {
  name: string;
  colorName: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
  glowClass: string;
  icon: (className?: string) => React.ReactNode;
}

export const KAHOOT_SHAPES: KahootThemeShape[] = [
  {
    name: 'Segitiga',
    colorName: 'Merah',
    bgClass: 'bg-red-600',
    borderClass: 'border-red-500',
    textClass: 'text-red-400',
    glowClass: 'shadow-red-600/40',
    icon: (className = 'w-6 h-6') => (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <polygon points="12,3 22,21 2,21" />
      </svg>
    ),
  },
  {
    name: 'Belah Ketupat',
    colorName: 'Biru',
    bgClass: 'bg-blue-600',
    borderClass: 'border-blue-500',
    textClass: 'text-blue-400',
    glowClass: 'shadow-blue-600/40',
    icon: (className = 'w-6 h-6') => (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <polygon points="12,2 22,12 12,22 2,12" />
      </svg>
    ),
  },
  {
    name: 'Lingkaran',
    colorName: 'Kuning',
    bgClass: 'bg-amber-500',
    borderClass: 'border-amber-400',
    textClass: 'text-amber-400',
    glowClass: 'shadow-amber-500/40',
    icon: (className = 'w-6 h-6') => (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <circle cx="12" cy="12" r="10" />
      </svg>
    ),
  },
  {
    name: 'Kotak',
    colorName: 'Hijau',
    bgClass: 'bg-emerald-600',
    borderClass: 'border-emerald-500',
    textClass: 'text-emerald-400',
    glowClass: 'shadow-emerald-600/40',
    icon: (className = 'w-6 h-6') => (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <rect x="3" y="3" width="18" height="18" rx="2" />
      </svg>
    ),
  },
];
