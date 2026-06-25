// ============================================================
// components/ui/ConceptCard.tsx
// Card displayed on the HomePage for each concept.
// Shows icon, subject badge, difficulty, description, formula.
// Clicking navigates to the LearnPage for that concept.
// ============================================================

import React from 'react';
import { motion } from 'framer-motion';
import { Concept, Difficulty } from '../../concepts/conceptData';

interface ConceptCardProps {
  concept: Concept;
  index: number;
  onClick: (id: string) => void;
}

// Maps difficulty to a subtle badge style
const difficultyStyle: Record<Difficulty, { label: string; color: string }> = {
  Beginner:     { label: 'Beginner',     color: '#00D4AA' },
  Intermediate: { label: 'Intermediate', color: '#F5A623' },
  Advanced:     { label: 'Advanced',     color: '#FF6B8A' },
};

// Maps subject to a short icon label
const subjectIcon: Record<string, string> = {
  Geometry: '📐',
  Algebra:  '📊',
  Physics:  '⚡',
  Finance:  '💰',
};

const ConceptCard: React.FC<ConceptCardProps> = ({ concept, index, onClick }) => {
  const diff = difficultyStyle[concept.difficulty];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4, ease: 'easeOut' }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onClick={() => onClick(concept.id)}
      className="group relative flex flex-col cursor-pointer rounded-2xl overflow-hidden"
      style={{
        background: '#16161F',
        border: '1px solid #1E1E2E',
      }}
    >
      {/* Hover glow overlay */}
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at top left, ${concept.accentColor}10, transparent 70%)`,
          border: `1px solid ${concept.accentColor}30`,
        }}
      />

      {/* Top accent line */}
      <div
        className="h-[2px] w-full"
        style={{
          background: `linear-gradient(90deg, ${concept.accentColor}, ${concept.accentColor}20)`,
        }}
      />

      <div className="flex flex-col flex-1 p-5 gap-4">

        {/* Header row: icon + subject badge */}
        <div className="flex items-start justify-between">
          {/* Large concept icon */}
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0"
            style={{
              background: concept.accentColor + '18',
              color: concept.accentColor,
              border: `1px solid ${concept.accentColor}30`,
            }}
          >
            {concept.icon}
          </div>

          {/* Subject + difficulty badges */}
          <div className="flex flex-col items-end gap-1.5">
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full"
              style={{ background: '#1E1E2A', color: '#9090A8', border: '1px solid #2A2A3C' }}>
              {subjectIcon[concept.subject]} {concept.subject}
            </span>
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{
                background: diff.color + '15',
                color: diff.color,
                border: `1px solid ${diff.color}30`,
              }}
            >
              {diff.label}
            </span>
          </div>
        </div>

        {/* Title */}
        <div>
          <h3 className="text-[15px] font-semibold text-[#EEEEF2] leading-snug mb-1.5">
            {concept.title}
          </h3>
          <p className="text-[12px] text-[#5A5A72] leading-relaxed">
            {concept.description}
          </p>
        </div>

        {/* Formula chip */}
        <div
          className="mt-auto w-full rounded-lg px-3 py-2 flex items-center justify-between"
          style={{ background: concept.accentColor + '0C', border: `1px solid ${concept.accentColor}20` }}
        >
          <span className="text-[10px] font-medium tracking-wider uppercase"
            style={{ color: concept.accentColor + '80' }}>
            Formula
          </span>
          <span className="font-mono text-[12px] font-bold"
            style={{ color: concept.accentColor }}>
            {concept.formula}
          </span>
        </div>

        {/* Step count + CTA */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-[#5A5A72]">
            {concept.steps.length} steps
          </span>
          <motion.div
            className="flex items-center gap-1 text-[11px] font-semibold"
            style={{ color: concept.accentColor }}
            whileHover={{ x: 3 }}
            transition={{ duration: 0.15 }}
          >
            Explore
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2.5 6h7M6.5 3l3 3-3 3"
                stroke="currentColor" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.div>
        </div>

      </div>
    </motion.div>
  );
};

export default ConceptCard;
