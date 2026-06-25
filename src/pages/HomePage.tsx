// ============================================================
// pages/HomePage.tsx
// The landing screen. Renders a header section and a responsive
// grid of ConceptCards, one per concept in conceptData.ts.
//
// Navigation is prop-based (no router). Clicking a card calls
// onSelectConcept(id), which App.tsx handles by switching view.
//
// Future: Add search, subject filter tabs, and progress badges
//         once user progress tracking is implemented.
// ============================================================

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import AppShell from '../components/layout/AppShell';
import ConceptCard from '../components/ui/ConceptCard';
import { CONCEPTS, Subject } from '../concepts/conceptData';

interface HomePageProps {
  onSelectConcept: (id: string) => void;
}

// Subject filter options — 'All' plus every unique subject
const SUBJECTS: Array<'All' | Subject> = ['All', 'Geometry', 'Algebra', 'Physics', 'Finance'];

const HomePage: React.FC<HomePageProps> = ({ onSelectConcept }) => {
  const [activeSubject, setActiveSubject] = useState<'All' | Subject>('All');

  const filtered = activeSubject === 'All'
    ? CONCEPTS
    : CONCEPTS.filter(c => c.subject === activeSubject);

  return (
    <AppShell>
      <div className="flex flex-col flex-1 overflow-y-auto">

        {/* ── Hero header ── */}
        <div className="flex-shrink-0 px-8 pt-10 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            {/* Eyebrow label */}
            <div className="flex items-center gap-2 mb-4">
              <div
                className="h-[1px] w-8"
                style={{ background: 'linear-gradient(90deg, #4F8EF7, transparent)' }}
              />
              <span className="text-[11px] font-semibold tracking-widest uppercase text-[#4F8EF7]">
                Interactive Learning
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-[#EEEEF2] mb-3 leading-tight">
              Discover Formulas{' '}
              <span
                className="relative inline-block"
                style={{
                  background: 'linear-gradient(135deg, #4F8EF7, #7C5CFC)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Visually
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-[14px] text-[#5A5A72] max-w-lg leading-relaxed">
              Don't memorise formulas. Watch them emerge from first principles.
              Every concept is an interactive animation you can explore and reshape.
            </p>
          </motion.div>

          {/* ── Stats row ── */}
          <motion.div
            className="flex items-center gap-6 mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.4 }}
          >
            {[
              { value: `${CONCEPTS.length}`, label: 'Concepts' },
              { value: `${CONCEPTS.reduce((a, c) => a + c.steps.length, 0)}`, label: 'Interactive steps' },
              { value: '100%', label: 'Visual & hands-on' },
            ].map(stat => (
              <div key={stat.label} className="flex items-baseline gap-1.5">
                <span className="text-lg font-bold text-[#EEEEF2]">{stat.value}</span>
                <span className="text-[11px] text-[#3A3A52]">{stat.label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ── Subject filter tabs ── */}
        <motion.div
          className="flex-shrink-0 flex items-center gap-2 px-8 mb-6"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.35 }}
        >
          {SUBJECTS.map(subject => {
            const isActive = subject === activeSubject;
            // Count how many concepts match this subject
            const count = subject === 'All'
              ? CONCEPTS.length
              : CONCEPTS.filter(c => c.subject === subject).length;

            return (
              <motion.button
                key={subject}
                onClick={() => setActiveSubject(subject)}
                whileTap={{ scale: 0.94 }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-medium transition-all duration-200"
                style={
                  isActive
                    ? {
                        background: '#4F8EF718',
                        color: '#4F8EF7',
                        border: '1px solid #4F8EF730',
                      }
                    : {
                        background: 'transparent',
                        color: '#5A5A72',
                        border: '1px solid transparent',
                      }
                }
              >
                {subject}
                <span
                  className="text-[10px] font-mono px-1 rounded"
                  style={{
                    background: isActive ? '#4F8EF720' : '#1E1E2A',
                    color: isActive ? '#4F8EF7' : '#3A3A52',
                  }}
                >
                  {count}
                </span>
              </motion.button>
            );
          })}
        </motion.div>

        {/* ── Card grid ── */}
        <div className="flex-1 px-8 pb-10">
          <motion.div
            key={activeSubject}
            className="grid gap-4"
            style={{
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {filtered.map((concept, index) => (
              <ConceptCard
                key={concept.id}
                concept={concept}
                index={index}
                onClick={onSelectConcept}
              />
            ))}
          </motion.div>

          {/* Empty state — shown when a filter has no results */}
          {filtered.length === 0 && (
            <motion.div
              className="flex flex-col items-center justify-center py-20 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-4xl mb-3">🔭</p>
              <p className="text-[14px] text-[#5A5A72]">
                No concepts in this subject yet.
              </p>
              <p className="text-[12px] text-[#3A3A52] mt-1">More coming soon.</p>
            </motion.div>
          )}
        </div>

        {/* ── Footer strip ── */}
        <div
          className="flex-shrink-0 flex items-center justify-center py-4 gap-2"
          style={{ borderTop: '1px solid #1E1E2E' }}
        >
          <div
            className="w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold"
            style={{ background: 'linear-gradient(135deg, #4F8EF7, #7C5CFC)', color: '#fff' }}
          >
            ƒ
          </div>
          <span className="text-[11px] text-[#3A3A52]">
            Visual Formula Lab — MVP
          </span>
        </div>

      </div>
    </AppShell>
  );
};

export default HomePage;
