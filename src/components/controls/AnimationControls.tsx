// ============================================================
// components/controls/AnimationControls.tsx
// Bottom control bar for the LearnPage animation canvas.
// Handles: Play/Pause, Previous step, Next step,
//          Replay current step, Reset to step 0, Speed selector.
// Props map directly to AnimationState from animationEngine.ts.
// ============================================================

import React from 'react';
import { motion } from 'framer-motion';
import { SPEED_OPTIONS, SpeedOption } from '../../engine/animationEngine';

interface AnimationControlsProps {
  isPlaying: boolean;
  currentStep: number;
  totalSteps: number;
  speed: number;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onReplay: () => void;
  onReset: () => void;
  onSpeedChange: (speed: SpeedOption) => void;
  accentColor: string;
}

// ---- Icon components (inline SVG, no external deps) --------

const IconPlay = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
    <path d="M3 2.5l9 4.5-9 4.5V2.5z" />
  </svg>
);

const IconPause = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
    <rect x="2.5" y="2" width="3.5" height="10" rx="1" />
    <rect x="8" y="2" width="3.5" height="10" rx="1" />
  </svg>
);

const IconPrev = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 3L5 7l4 4" />
  </svg>
);

const IconNext = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 3l4 4-4 4" />
  </svg>
);

const IconReplay = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 7A4.5 4.5 0 1 0 4 3.5L2.5 2" />
    <path d="M2.5 2v3h3" />
  </svg>
);

const IconReset = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 2v2M3.5 3.5l1.4 1.4M2 7h2M3.5 10.5l1.4-1.4M7 12v-2M10.5 10.5l-1.4-1.4M12 7h-2M10.5 3.5L9.1 4.9" />
  </svg>
);

// ---- Control button base -----------------------------------

interface CtrlBtnProps {
  onClick: () => void;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
  variant?: 'default' | 'primary';
  accentColor?: string;
}

const CtrlBtn: React.FC<CtrlBtnProps> = ({
  onClick, disabled = false, title, children, variant = 'default', accentColor,
}) => (
  <motion.button
    onClick={onClick}
    disabled={disabled}
    title={title}
    whileTap={!disabled ? { scale: 0.88 } : undefined}
    whileHover={!disabled ? { scale: 1.08 } : undefined}
    transition={{ duration: 0.12 }}
    className={`
      relative flex items-center justify-center rounded-xl transition-colors duration-150
      ${variant === 'primary' ? 'w-11 h-11' : 'w-9 h-9'}
      ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
    `}
    style={
      variant === 'primary' && accentColor
        ? {
            background: `linear-gradient(135deg, ${accentColor}, ${accentColor}CC)`,
            color: '#0A0A0F',
            boxShadow: `0 0 16px ${accentColor}40`,
          }
        : {
            background: '#1E1E2A',
            color: '#9090A8',
            border: '1px solid #2A2A3C',
          }
    }
  >
    {children}
  </motion.button>
);

// ---- Main component ----------------------------------------

const AnimationControls: React.FC<AnimationControlsProps> = ({
  isPlaying,
  currentStep,
  totalSteps,
  speed,
  onPlay,
  onPause,
  onNext,
  onPrev,
  onReplay,
  onReset,
  onSpeedChange,
  accentColor,
}) => {
  const isFirst = currentStep === 0;
  const isLast  = currentStep === totalSteps - 1;

  return (
    <div
      className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl"
      style={{ background: '#111118', border: '1px solid #1E1E2E' }}
    >

      {/* Left group: Reset + Replay */}
      <div className="flex items-center gap-2">
        <CtrlBtn onClick={onReset} title="Reset to beginning" disabled={isFirst && !isPlaying}>
          <IconReset />
        </CtrlBtn>
        <CtrlBtn onClick={onReplay} title="Replay this step">
          <IconReplay />
        </CtrlBtn>
      </div>

      {/* Center group: Prev + Play/Pause + Next */}
      <div className="flex items-center gap-2">
        <CtrlBtn onClick={onPrev} disabled={isFirst} title="Previous step">
          <IconPrev />
        </CtrlBtn>

        <CtrlBtn
          onClick={isPlaying ? onPause : onPlay}
          variant="primary"
          accentColor={accentColor}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <IconPause /> : <IconPlay />}
        </CtrlBtn>

        <CtrlBtn onClick={onNext} disabled={isLast} title="Next step">
          <IconNext />
        </CtrlBtn>
      </div>

      {/* Right group: Speed selector */}
      <div className="flex items-center gap-1">
        {SPEED_OPTIONS.map((opt) => {
          const isActive = opt === speed;
          return (
            <motion.button
              key={opt}
              onClick={() => onSpeedChange(opt)}
              whileTap={{ scale: 0.88 }}
              className="px-2 py-1 rounded-lg text-[11px] font-mono font-semibold transition-all duration-150"
              style={
                isActive
                  ? {
                      background: accentColor + '25',
                      color: accentColor,
                      border: `1px solid ${accentColor}50`,
                    }
                  : {
                      background: 'transparent',
                      color: '#5A5A72',
                      border: '1px solid transparent',
                    }
              }
            >
              {opt}×
            </motion.button>
          );
        })}
      </div>

    </div>
  );
};

export default AnimationControls;
