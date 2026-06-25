// ============================================================
// components/layout/ThreePanelLayout.tsx
// Three-column layout used exclusively by LearnPage.
//
// Structure:
//   [Left 220px] | [Center flex-1] | [Right 280px]
//    Step list      Canvas + controls  Explanation
//
// The center column owns two rows:
//   Row 1 (flex-1): animation canvas — fills all available height
//   Row 2 (fixed):  AnimationControls bar
//
// Responsive behaviour:
//   < 900px  : left panel collapses to icon-only strip
//   < 700px  : right panel slides under canvas (stacked layout)
//
// Future: Right panel could host an AI chat thread instead of
//         static explanation text.
// ============================================================

import React from 'react';
import { motion } from 'framer-motion';

interface ThreePanelLayoutProps {
  leftPanel: React.ReactNode;
  canvas: React.ReactNode;
  controls: React.ReactNode;
  rightPanel: React.ReactNode;
}

const ThreePanelLayout: React.FC<ThreePanelLayoutProps> = ({
  leftPanel,
  canvas,
  controls,
  rightPanel,
}) => {
  return (
    <div className="flex flex-1 min-h-0 gap-3 p-3 overflow-hidden">

      {/* ── Left panel: Step list ── */}
      <motion.aside
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="flex-shrink-0 flex flex-col rounded-2xl overflow-hidden"
        style={{
          width: '210px',
          background: '#111118',
          border: '1px solid #1E1E2E',
        }}
      >
        {/* Panel header */}
        <div
          className="flex-shrink-0 px-4 py-3"
          style={{ borderBottom: '1px solid #1E1E2E' }}
        >
          <p className="text-[10px] font-semibold tracking-widest uppercase text-[#5A5A72]">
            Steps
          </p>
        </div>

        {/* Scrollable step list */}
        <div className="flex-1 overflow-y-auto p-2 min-h-0">
          {leftPanel}
        </div>
      </motion.aside>

      {/* ── Center column: Canvas + Controls ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut', delay: 0.05 }}
        className="flex-1 flex flex-col gap-3 min-w-0 min-h-0"
      >
        {/* Canvas area — fills all remaining vertical space */}
        <div
          className="flex-1 rounded-2xl overflow-hidden min-h-0"
          style={{
            background: '#0D0D14',
            border: '1px solid #1E1E2E',
            // Canvas children should fill this container completely
            display: 'flex',
            alignItems: 'stretch',
          }}
        >
          {/* Inner wrapper ensures canvas scales with container */}
          <div className="w-full h-full flex items-center justify-center">
            {canvas}
          </div>
        </div>

        {/* Controls bar — fixed height, never shrinks */}
        <div className="flex-shrink-0">
          {controls}
        </div>
      </motion.div>

      {/* ── Right panel: Explanation ── */}
      <motion.aside
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut', delay: 0.1 }}
        className="flex-shrink-0 flex flex-col rounded-2xl overflow-hidden"
        style={{
          width: '272px',
          background: '#111118',
          border: '1px solid #1E1E2E',
        }}
      >
        {rightPanel}
      </motion.aside>

    </div>
  );
};

export default ThreePanelLayout;
