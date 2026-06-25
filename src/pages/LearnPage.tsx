// ============================================================
// pages/LearnPage.tsx
// The interactive learning screen for a single concept.
//
// This component owns ALL animation state:
//   currentStep  — which step (0-indexed) is active
//   isPlaying    — whether the animation is currently running
//   speed        — playback speed multiplier (0.5 / 1 / 1.5 / 2)
//   replayKey    — incrementing key that forces animation remount
//                  when Replay or step changes are triggered
//
// It wires together:
//   AppShell         → nav bar with back button + concept title
//   ThreePanelLayout → structural 3-column grid
//   StepIndicator    → left panel, shows all steps + active state
//   AnimationRouter  → center canvas, receives step + control props
//   AnimationControls→ bottom bar, all playback controls
//   ExplanationPanel → right panel, step title / text / formula
//
// Step-change logic:
//   Next      — advances step, resets isPlaying to true so the
//               new step auto-plays immediately
//   Prev      — goes back, resets isPlaying to false (paused)
//   Replay    — bumps replayKey to remount animation at step start
//   Reset     — returns to step 0, pauses, bumps replayKey
//   StepClick — jumps directly; plays if clicking a later step
//   onStepComplete (from animation) — does NOT auto-advance;
//               instead marks step as "complete" so the Next
//               button pulses, giving the student a moment to read
//
// Future: Add AI explanation panel toggle, step completion
//         tracking, and hint system here.
// ============================================================

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AppShell from '../components/layout/AppShell';
import ThreePanelLayout from '../components/layout/ThreePanelLayout';
import StepIndicator from '../components/ui/StepIndicator';
import ExplanationPanel from '../components/ui/ExplanationPanel';
import AnimationControls from '../components/controls/AnimationControls';
import AnimationRouter from '../animations/AnimationRouter';
import { Concept } from '../concepts/conceptData';
import { SpeedOption } from '../engine/animationEngine';

interface LearnPageProps {
  concept: Concept;
  onBack: () => void;
}

const LearnPage: React.FC<LearnPageProps> = ({ concept, onBack }) => {
  const totalSteps = concept.steps.length;

  // ── Animation state ──────────────────────────────────────
  const [currentStep, setCurrentStep]     = useState(0);
  const [isPlaying, setIsPlaying]         = useState(true);   // auto-play on open
  const [speed, setSpeed]                 = useState<SpeedOption>(1);
  const [replayKey, setReplayKey]         = useState(0);      // remounts animation
  const [stepComplete, setStepComplete]   = useState(false);  // current step finished

  // Reset all state whenever the concept changes
  useEffect(() => {
    setCurrentStep(0);
    setIsPlaying(true);
    setSpeed(1);
    setReplayKey(0);
    setStepComplete(false);
  }, [concept.id]);

  // ── Control handlers ─────────────────────────────────────

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
    setStepComplete(false);
  }, []);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const handleNext = useCallback(() => {
    if (currentStep >= totalSteps - 1) return;
    setCurrentStep(s => s + 1);
    setIsPlaying(true);
    setStepComplete(false);
    setReplayKey(k => k + 1);
  }, [currentStep, totalSteps]);

  const handlePrev = useCallback(() => {
    if (currentStep <= 0) return;
    setCurrentStep(s => s - 1);
    setIsPlaying(false);
    setStepComplete(false);
    setReplayKey(k => k + 1);
  }, [currentStep]);

  const handleReplay = useCallback(() => {
    setIsPlaying(true);
    setStepComplete(false);
    setReplayKey(k => k + 1);
  }, []);

  const handleReset = useCallback(() => {
    setCurrentStep(0);
    setIsPlaying(false);
    setStepComplete(false);
    setReplayKey(k => k + 1);
  }, []);

  const handleSpeedChange = useCallback((s: SpeedOption) => {
    setSpeed(s);
  }, []);

  const handleStepClick = useCallback((index: number) => {
    setCurrentStep(index);
    // Play forward, pause backward
    setIsPlaying(index > currentStep);
    setStepComplete(false);
    setReplayKey(k => k + 1);
  }, [currentStep]);

  // Called by animation when its internal sequence finishes
  const handleStepComplete = useCallback(() => {
    setIsPlaying(false);
    setStepComplete(true);
  }, []);

  const activeStep = concept.steps[currentStep];
  const isLastStep = currentStep === totalSteps - 1;

  // ── Panels ───────────────────────────────────────────────

  const leftPanel = (
    <StepIndicator
      steps={concept.steps}
      currentStep={currentStep}
      accentColor={concept.accentColor}
      onStepClick={handleStepClick}
    />
  );

  // The canvas remounts when replayKey changes, forcing a clean
  // animation restart without losing concept/step props.
  const canvasPanel = (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${concept.id}-step${currentStep}-replay${replayKey}`}
        className="w-full h-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        style={{ display: 'flex', alignItems: 'stretch' }}
      >
        <AnimationRouter
          conceptId={concept.id}
          step={currentStep}
          speed={speed}
          isPlaying={isPlaying}
          accentColor={concept.accentColor}
          onStepComplete={handleStepComplete}
        />
      </motion.div>
    </AnimatePresence>
  );

  const controlsPanel = (
    <div className="relative">
      <AnimationControls
        isPlaying={isPlaying}
        currentStep={currentStep}
        totalSteps={totalSteps}
        speed={speed}
        onPlay={handlePlay}
        onPause={handlePause}
        onNext={handleNext}
        onPrev={handlePrev}
        onReplay={handleReplay}
        onReset={handleReset}
        onSpeedChange={handleSpeedChange}
        accentColor={concept.accentColor}
      />

      {/* Step-complete nudge: pulses on the Next button area when
          the animation finishes and a next step is available     */}
      <AnimatePresence>
        {stepComplete && !isLastStep && (
          <motion.div
            className="absolute -top-9 left-1/2 -translate-x-1/2 flex items-center gap-1.5
                       px-3 py-1.5 rounded-full text-[11px] font-semibold pointer-events-none"
            style={{
              background: concept.accentColor + '20',
              color: concept.accentColor,
              border: `1px solid ${concept.accentColor}40`,
            }}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.25 }}
          >
            <motion.span
              animate={{ x: [0, 3, 0] }}
              transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
            >
              →
            </motion.span>
            Ready for the next step
          </motion.div>
        )}

        {/* Final step celebration */}
        {stepComplete && isLastStep && (
          <motion.div
            className="absolute -top-9 left-1/2 -translate-x-1/2 flex items-center gap-1.5
                       px-3 py-1.5 rounded-full text-[11px] font-semibold pointer-events-none"
            style={{
              background: '#00D4AA20',
              color: '#00D4AA',
              border: '1px solid #00D4AA40',
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            ✓ Concept complete — you discovered it!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const rightPanel = (
    <ExplanationPanel
      step={activeStep}
      stepIndex={currentStep}
      totalSteps={totalSteps}
      accentColor={concept.accentColor}
      conceptTitle={concept.title}
    />
  );

  // ── Render ───────────────────────────────────────────────

  return (
    <AppShell
      conceptTitle={concept.title}
      conceptSubject={concept.subject}
      accentColor={concept.accentColor}
      onBack={onBack}
    >
      {/* AppShell's main slot is flex-col flex-1; ThreePanelLayout
          fills it completely, so the canvas gets all vertical space */}
      <ThreePanelLayout
        leftPanel={leftPanel}
        canvas={canvasPanel}
        controls={controlsPanel}
        rightPanel={rightPanel}
      />
    </AppShell>
  );
};

export default LearnPage;
