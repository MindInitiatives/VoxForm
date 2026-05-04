'use client';

import BankTransferForm from "@/app/components/BankTransferForm/BankTransferForm";
import { useTheme } from "@/app/providers/ThemeProvider/ThemeProvider";

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className="flex items-center gap-2 rounded-lg border border-border bg-muted
        hover:bg-accent px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground
        transition-all duration-200 cursor-pointer select-none"
    >
      {/* Toggle track */}
      <div className={`relative w-8 h-4 rounded-full transition-colors duration-300
        ${isDark ? 'bg-indigo-500' : 'bg-slate-300'}`}
      >
        {/* Knob */}
        <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm
          transition-transform duration-300
          ${isDark ? 'translate-x-4' : 'translate-x-0.5'}`}
        />
      </div>
      {/* Sun / Moon icon */}
      {isDark ? (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="hidden sm:block">
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
        </svg>
      ) : (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="hidden sm:block">
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1" x2="12" y2="3"/>
          <line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/>
          <line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
      )}
    </button>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col transition-colors duration-300">

      {/* ── Header ── */}
      <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="4.5" y="1" width="5" height="7" rx="2.5" fill="#6366f1"/>
                <path d="M2 7.5A5 5 0 0012 7.5" stroke="#6366f1" strokeWidth="1.2" strokeLinecap="round"/>
                <line x1="7" y1="12.5" x2="7" y2="10.5" stroke="#6366f1" strokeWidth="1.2" strokeLinecap="round"/>
                <line x1="5" y1="13" x2="9" y2="13" stroke="#6366f1" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="font-semibold text-sm text-foreground tracking-tight">VoxForm</span>
            <span className="hidden sm:inline text-[11px] text-muted-foreground/50 font-mono">v0.1.0-beta.1</span>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              AI ready
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-6 w-full">
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-50 dark:bg-indigo-500/5 px-3 py-1 text-xs text-indigo-600 dark:text-indigo-300 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            Voice-Enabled Bank Transfer
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight leading-tight">
            Your voice is the shortest path
            <br />
            <span className="text-indigo-500 dark:text-indigo-400">
              between thought and form
            </span>
          </h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
            Speak naturally to fill out your transfer. AI maps your words to the right fields instantly.
          </p>
        </div>

        {/* Main card */}
        <div className="rounded-2xl border border-border bg-card shadow-lg dark:shadow-black/40 overflow-hidden">
          <BankTransferForm />
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="mt-auto border-t border-border">
        <div className="max-w-6xl mx-auto px-6 h-12 flex items-center justify-between">
          <p className="text-xs text-muted-foreground/60">
            Made with <span className="text-red-400">♥</span> by{" "}
            <a
              href="https://github.com/MindInitiatives"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition underline underline-offset-2"
            >
              MindInitiatives
            </a>
          </p>
          <p className="text-xs text-muted-foreground/40 font-mono">
            © {new Date().getFullYear()} VoxForm
          </p>
        </div>
      </footer>
    </div>
  );
}
