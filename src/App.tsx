// ============================================================
// App.tsx
// Root component. Owns top-level navigation state.
//
// Navigation model (no router library):
//   selectedConceptId === null  →  render HomePage
//   selectedConceptId === string → render LearnPage for that concept
//
// This keeps the architecture simple for the MVP. When routing
// needs to support deep-links or browser history, replace the
// useState here with a lightweight router (e.g. wouter).
//
// Future: Add global user progress state here and pass down
//         as context once the AI explanation layer is integrated.
// ============================================================

import React, { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import HomePage from './pages/HomePage';
import LearnPage from './pages/LearnPage';
import { CONCEPTS, getConceptById } from './concepts/conceptData';

const App: React.FC = () => {
  // null  → home screen
  // string → learning screen for that concept id
  const [selectedConceptId, setSelectedConceptId] = useState<string | null>(null);

  const handleSelectConcept = useCallback((id: string) => {
    setSelectedConceptId(id);
  }, []);

  const handleBack = useCallback(() => {
    setSelectedConceptId(null);
  }, []);

  // Resolve the concept object when a selection is active.
  // getConceptById returns undefined for unknown ids — fall back
  // to home gracefully rather than crashing.
  const activeConcept = selectedConceptId
    ? getConceptById(selectedConceptId)
    : undefined;

  if (selectedConceptId && !activeConcept) {
    // Unknown id — reset to home silently
    setSelectedConceptId(null);
  }

  return (
    // AnimatePresence enables exit animations when switching
    // between HomePage and LearnPage.
    <AnimatePresence mode="wait">
      {activeConcept ? (
        <motion.div
          key={`learn-${activeConcept.id}`}
          className="flex flex-col min-h-screen"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
        >
          <LearnPage
            concept={activeConcept}
            onBack={handleBack}
          />
        </motion.div>
      ) : (
        <motion.div
          key="home"
          className="flex flex-col min-h-screen"
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 24 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
        >
          <HomePage onSelectConcept={handleSelectConcept} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default App;
