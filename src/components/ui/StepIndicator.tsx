// ============================================================
// components/ui/StepIndicator.tsx
// Vertical step list shown in the left panel of LearnPage.
// Displays all steps for a concept; highlights the active one.
// ============================================================

import React from 'react';
import { motion } from 'framer-motion';
import { ExplanationStep } from '../../concepts/conceptData';

interface StepIndicatorProps {
  steps: ExplanationStep[];
  currentStep: number;
  accentColor: string;
  onStepClick: (index: number) => void;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  currentStep,
  accentColor,
  onStepClick,
}) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;
        const isLocked = index > currentStep;

        return (
          <motion.button
            key={step.id}
            onClick={() => onStepClick(index)}
            disabled={isLocked}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.06, duration: 0.3 }}
            className={`
              group relative flex items-start gap-3 w-full text-left
              px-3 py-2.5 rounded-xl transition-all duration-200
              ${isActive ? 'bg-[#1E1E2A]' : 'hover:bg-[#16161F]'}
              ${isLocked ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {/* Connector line between dots */}
            {index < steps.length - 1 && (
              <div
                className="absolute left-[22px] top-[36px] w-[2px] h-[calc(100%-8px)]"
                style={{
                  background: isCompleted
                    ? accentColor + '60'
                    : '#2A2A3C',
                }}
              />
            )}

            {/* Step dot / number */}
            <div className="relative z-10 flex-shrink-0 mt-0.5">
              <motion.div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold"
                animate={{
                  backgroundColor: isActive
                    ? accentColor
                    : isCompleted
                    ? accentColor + '40'
                    : '#1E1E2A',
                  borderColor: isActive
                    ? accentColor
                    : isCompleted
                    ? accentColor + '60'
                    : '#2A2A3C',
                }}
                style={{
                  border: '1.5px solid',
                  color: isActive ? '#0A0A0F' : isCompleted ? accentColor : '#5A5A72',
                }}
              >
                {isCompleted ? (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path
                      d="M2 5l2.5 2.5L8 3"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  index + 1
                )}
              </motion.div>

              {/* Active pulse ring */}
              {isActive && (
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ border: `1.5px solid ${accentColor}` }}
                  animate={{ scale: [1, 1.6], opacity: [0.6, 0] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut' }}
                />
              )}
            </div>

            {/* Step title */}
            <div className="flex-1 min-w-0">
              <p
                className="text-[12px] font-medium leading-snug truncate"
                style={{
                  color: isActive
                    ? '#EEEEF2'
                    : isCompleted
                    ? '#9090A8'
                    : '#5A5A72',
                }}
              >
                {step.title}
              </p>
              {isActive && (
                <motion.p
                  className="text-[10px] mt-0.5"
                  style={{ color: accentColor }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15 }}
                >
                  In progress
                </motion.p>
              )}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
};

export default StepIndicator;
