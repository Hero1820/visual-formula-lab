// ============================================================
// engine/animationEngine.ts
// Core animation state management and timing utilities.
// Future: Connect to AI explanation triggers here.
// ============================================================

export interface AnimationState {
  currentStep: number;
  totalSteps: number;
  isPlaying: boolean;
  speed: number; // 0.5x, 1x, 1.5x, 2x
  progress: number; // 0–1 within current step
  isDragging: boolean;
}

export const DEFAULT_ANIMATION_STATE: AnimationState = {
  currentStep: 0,
  totalSteps: 1,
  isPlaying: false,
  speed: 1,
  progress: 0,
  isDragging: false,
};

export const SPEED_OPTIONS = [0.5, 1, 1.5, 2] as const;
export type SpeedOption = typeof SPEED_OPTIONS[number];

/**
 * Easing functions for smooth animations
 */
export const easing = {
  easeInOut: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  easeOut: (t: number) => 1 - Math.pow(1 - t, 3),
  easeIn: (t: number) => t * t * t,
  elastic: (t: number) => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1
      : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
  bounce: (t: number) => {
    const n1 = 7.5625, d1 = 2.75;
    if (t < 1 / d1) return n1 * t * t;
    if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
    if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  },
};

/**
 * Linear interpolation
 */
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Color interpolation between two hex colors
 */
export const lerpColor = (hex1: string, hex2: string, t: number): string => {
  const parse = (h: string) => [
    parseInt(h.slice(1, 3), 16),
    parseInt(h.slice(3, 5), 16),
    parseInt(h.slice(5, 7), 16),
  ];
  const [r1, g1, b1] = parse(hex1);
  const [r2, g2, b2] = parse(hex2);
  const r = Math.round(lerp(r1, r2, t));
  const g = Math.round(lerp(g1, g2, t));
  const b = Math.round(lerp(b1, b2, t));
  return `rgb(${r},${g},${b})`;
};

/**
 * Clamp a value between min and max
 */
export const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

/**
 * Generate timed animation frames for a given duration
 */
export const createAnimationTimer = (
  duration: number,
  onFrame: (progress: number) => void,
  onComplete?: () => void,
): { stop: () => void } => {
  let startTime: number | null = null;
  let rafId: number;

  const frame = (timestamp: number) => {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / duration, 1);
    onFrame(progress);
    if (progress < 1) {
      rafId = requestAnimationFrame(frame);
    } else {
      onComplete?.();
    }
  };

  rafId = requestAnimationFrame(frame);
  return { stop: () => cancelAnimationFrame(rafId) };
};
