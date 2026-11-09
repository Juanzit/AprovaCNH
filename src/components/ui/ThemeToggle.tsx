'use client';

import React, { useSyncExternalStore } from 'react';
import { SunIcon, MoonIcon } from './Icons';

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

function getSnapshot(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return (localStorage.getItem('theme-mode') as 'light' | 'dark') || 'light';
}

function getServerSnapshot(): 'light' | 'dark' {
  return 'light';
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme-mode', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      data-testid="theme-toggle-btn"
      aria-label={theme === 'light' ? 'Alternar para modo escuro' : 'Alternar para modo claro'}
      title={theme === 'light' ? 'Modo Escuro' : 'Modo Claro'}
      className="inline-flex items-center justify-center w-8 h-8 rounded-xl border border-slate-200 bg-white text-slate-700 hover:text-blue-600 hover:bg-slate-50 hover:border-slate-300 transition-all focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-2xs"
    >
      {theme === 'light' ? (
        <SunIcon className="w-4 h-4 text-amber-500" />
      ) : (
        <MoonIcon className="w-4 h-4 text-blue-400" />
      )}
    </button>
  );
}
