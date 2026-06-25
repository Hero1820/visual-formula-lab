// ============================================================
// components/ui/ExplanationPanel.tsx
// Right panel on the LearnPage. Renders the active step's
// title, explanation, analogy, key observation, and optional
// formula. Animates smoothly when the step changes.
// Future: Swap static text blocks with AI-generated content.
// ============================================================

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExplanationStep } from '../../concepts/conceptData';
import FormulaDisplay from './FormulaDisplay';

interface ExplanationPanelProps {
  step: ExplanationStep;
  stepIndex: number;
  totalSteps: number;
  accentColor: string;
  conceptTitle: string;
}

// Stagger config for child elements entering
const CONTAINER_VARIANTS = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
};

const ITEM_VARIANTS = {
  hidden: { opacity: 0, y: 10 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

// ---- Sub-components ----------------------------------------

interface InfoBlockProps {
  icon: string;
  label: string;
  text: string;
  accentColor: string;
  borderColor: string;
  bgColor: string;
}

const InfoBlock: React.FC<InfoBlockProps> = ({
  icon, label, text, accentColor, borderColor, bgColor,
}) => (
  <motion.div
    variants={ITEM_VARIANTS}
    className="rounded-xl p-3.5"
    style={{ background: bgColor, border: `1px solid ${borderColor}` }}
  >
    <div className="flex items-center gap-2 mb-1.5">
      <span className="text-sm leading-none">{icon}</span>
      <span
        className="text-[10px] font-semibold tracking-widest uppercase"
        style={{ color: accentColor }}
      >
        {label}
      </span>
    </div>
    <p className="text-[12px] text-[#9090A8] leading-relaxed">{text}</p>
  </motion.div>
);

// ---- Main component ----------------------------------------

const ExplanationPanel: React.FC<ExplanationPanelProps> = ({
  step,
  stepIndex,
  totalSteps,
  accentColor,
  conceptTitle,
}) => {
  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* Panel header */}
      <div className="flex-shrink-0 px-4 pt-4 pb-3 border-b border-[#1E1E2E]">
        <p className="text-[10px] font-semibold tracking-widest uppercase text-[#5A5A72] mb-0.5">
          {conceptTitle}
        </p>
        <div className="flex items-center justify-between">
          <h2 className="text-[13px] font-semibold text-[#EEEEF2]">Explanation</h2>
          <span className="text-[10px] font-mono text-[#5A5A72]">
            {stepIndex + 1} / {totalSteps}
          </span>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 py-3 min-h-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={step.id}
            variants={CONTAINER_VARIANTS}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, y: -6, transition: { duration: 0.15 } }}
            className="flex flex-col gap-3"
          >

            {/* Step title */}
            <motion.div variants={ITEM_VARIANTS}>
              <h3
                className="text-[15px] font-semibold leading-snug"
                style={{ color: accentColor }}
              >
                {step.title}
              </h3>
            </motion.div>

            {/* Main explanation */}
            <motion.p
              variants={ITEM_VARIANTS}
              className="text-[13px] text-[#BBBBC8] leading-relaxed"
            >
              {step.explanation}
            </motion.p>

            {/* Formula (conditional) */}
            {step.highlightFormula && (
              <motion.div variants={ITEM_VARIANTS}>
                <FormulaDisplay
                  formula={step.highlightFormula}
                  accentColor={accentColor}
                />
              </motion.div>
            )}

            {/* Analogy block */}
            <InfoBlock
              icon="💡"
              label="Analogy"
              text={step.analogy}
              accentColor="#F5A623"
              borderColor="#F5A62320"
              bgColor="#F5A62308"
            />

            {/* Observation block */}
            <InfoBlock
              icon="🔍"
              label="Notice"
              text={step.observation}
              accentColor={accentColor}
              borderColor={accentColor + '20'}
              bgColor={accentColor + '08'}
            />

          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom progress bar */}
      <div className="flex-shrink-0 px-4 pb-4 pt-2">
        <div className="flex gap-1">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className="h-[3px] flex-1 rounded-full transition-all duration-400"
              style={{
                background:
                  i < stepIndex
                    ? accentColor
                    : i === stepIndex
                    ? accentColor + '80'
                    : '#2A2A3C',
              }}
            />
          ))}
        </div>
        <p className="text-[10px] text-[#3A3A52] mt-2 text-center font-mono">
          {stepIndex + 1} of {totalSteps} steps
        </p>
      </div>

    </div>
  );
};

export default ExplanationPanel;
