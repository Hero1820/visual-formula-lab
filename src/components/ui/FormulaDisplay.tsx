// ============================================================
// components/ui/FormulaDisplay.tsx
// Displays the formula string in a monospace highlighted box.
// Shown inside ExplanationPanel when a step has highlightFormula.
// Future: Replace with AI-generated formula breakdowns.
// ============================================================

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FormulaDisplayProps {
  formula: string;
  accentColor: string;
  /** If true, renders smaller inline variant */
  compact?: boolean;
}

const FormulaDisplay: React.FC<FormulaDisplayProps> = ({
  formula,
  accentColor,
  compact = false,
}) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={formula}
        initial={{ opacity: 0, y: 6, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -4, scale: 0.97 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className={`
          relative w-full rounded-xl overflow-hidden
          ${compact ? 'py-2.5 px-4' : 'py-4 px-5'}
        `}
        style={{
          background: `linear-gradient(135deg, ${accentColor}12, ${accentColor}06)`,
          border: `1px solid ${accentColor}30`,
        }}
      >
        {/* Subtle left accent bar */}
        <div
          className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl"
          style={{ background: `linear-gradient(180deg, ${accentColor}, ${accentColor}40)` }}
        />

        {/* Label */}
        {!compact && (
          <p className="text-[10px] font-semibold tracking-widest uppercase mb-2"
            style={{ color: accentColor + 'AA' }}>
            Formula
          </p>
        )}

        {/* Formula text */}
        <p
          className={`font-mono font-bold tracking-wide ${compact ? 'text-sm' : 'text-base'}`}
          style={{ color: accentColor }}
        >
          {formula}
        </p>
      </motion.div>
    </AnimatePresence>
  );
};

export default FormulaDisplay;
