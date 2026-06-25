// ============================================================
// components/layout/AppShell.tsx
// Outermost layout wrapper. Renders the top navigation bar
// and wraps all page content below it.
//
// Nav bar shows:
//   - Home: Logo + app name only
//   - LearnPage: Back button + concept title + subject badge
//
// Future: Add user progress, settings, and AI chat toggle here.
// ============================================================

import React from 'react';
import { motion } from 'framer-motion';

interface AppShellProps {
  children: React.ReactNode;
  /** When set, shows back button and concept title in the nav */
  conceptTitle?: string;
  conceptSubject?: string;
  accentColor?: string;
  onBack?: () => void;
}

const AppShell: React.FC<AppShellProps> = ({
  children,
  conceptTitle,
  conceptSubject,
  accentColor = '#4F8EF7',
  onBack,
}) => {
  const isLearnPage = Boolean(conceptTitle);

  return (
    <div className="flex flex-col min-h-screen bg-[#0A0A0F] text-[#EEEEF2]">

      {/* ── Top navigation bar ── */}
      <header
        className="flex-shrink-0 flex items-center justify-between h-14 px-5"
        style={{
          background: '#0D0D14',
          borderBottom: '1px solid #1E1E2E',
          // Subtle backdrop so content scrolling underneath looks clean
          backdropFilter: 'blur(8px)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        {/* Left: back button OR logo */}
        <div className="flex items-center gap-3 min-w-0">
          {isLearnPage && onBack ? (
            <motion.button
              onClick={onBack}
              whileHover={{ x: -2 }}
              whileTap={{ scale: 0.92 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2 text-[#9090A8] hover:text-[#EEEEF2] transition-colors duration-150"
            >
              {/* Back chevron */}
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: '#1E1E2A', border: '1px solid #2A2A3C' }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
                  stroke="currentColor" strokeWidth="1.8"
                  strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7.5 2L4 6l3.5 4" />
                </svg>
              </div>
              <span className="text-[12px] font-medium hidden sm:block">All Concepts</span>
            </motion.button>
          ) : (
            /* Logo mark */
            <div className="flex items-center gap-2.5">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold"
                style={{
                  background: 'linear-gradient(135deg, #4F8EF7, #7C5CFC)',
                  color: '#fff',
                  boxShadow: '0 0 12px rgba(79,142,247,0.25)',
                }}
              >
                ƒ
              </div>
              <span className="text-[13px] font-semibold text-[#EEEEF2] hidden sm:block">
                Visual Formula Lab
              </span>
            </div>
          )}
        </div>

        {/* Center: concept title (LearnPage only) */}
        {isLearnPage && conceptTitle && (
          <motion.div
            className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <h1 className="text-[13px] font-semibold text-[#EEEEF2] truncate max-w-[180px]">
              {conceptTitle}
            </h1>
            {conceptSubject && (
              <span
                className="text-[10px] font-medium px-2 py-0.5 rounded-full hidden sm:inline-block"
                style={{
                  background: (accentColor ?? '#4F8EF7') + '18',
                  color: accentColor,
                  border: `1px solid ${accentColor}30`,
                }}
              >
                {conceptSubject}
              </span>
            )}
          </motion.div>
        )}

        {/* Right: wordmark on LearnPage, tagline on Home */}
        <div className="flex items-center">
          {isLearnPage ? (
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold"
                style={{
                  background: 'linear-gradient(135deg, #4F8EF7, #7C5CFC)',
                  color: '#fff',
                }}
              >
                ƒ
              </div>
            </div>
          ) : (
            <span className="text-[11px] text-[#3A3A52] hidden md:block">
              Learn by discovery
            </span>
          )}
        </div>
      </header>

      {/* ── Page content ── */}
      <main className="flex-1 flex flex-col min-h-0">
        {children}
      </main>

    </div>
  );
};

export default AppShell;
