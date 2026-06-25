// ============================================================
// animations/OhmsLawAnimation.tsx
// Circuit animation with water-flow analogy for V = IR
// ============================================================

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { clearCanvas, drawLabel, roundRect } from '../utils/canvasUtils';
import { easing, lerp } from '../engine/animationEngine';

interface OhmsLawAnimationProps {
  step: number;
  speed: number;
  isPlaying: boolean;
  accentColor: string;
  onStepComplete?: () => void;
}

interface Particle {
  pos: number; // 0–1 along circuit path
  speed: number;
}

const NUM_PARTICLES = 18;

const OhmsLawAnimation: React.FC<OhmsLawAnimationProps> = ({
  step, speed, isPlaying, accentColor, onStepComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const lastTimeRef = useRef<number>(0);
  const [voltage, setVoltage] = useState(6);
  const [resistance, setResistance] = useState(3);

  const CANVAS_W = 600, CANVAS_H = 460, BG = '#0D0D14';

  const current = voltage / resistance;

  // Circuit path: rectangle
  const CIRCUIT = {
    left: 80, right: 480, top: 100, bottom: 360,
  };

  const circuitPath = (t: number): { x: number; y: number; angle: number } => {
    // Total perimeter
    const W = CIRCUIT.right - CIRCUIT.left;
    const H = CIRCUIT.bottom - CIRCUIT.top;
    const perimeter = 2 * (W + H);
    const d = (t % 1) * perimeter;

    if (d < W) {
      return { x: CIRCUIT.left + d, y: CIRCUIT.top, angle: 0 };
    } else if (d < W + H) {
      return { x: CIRCUIT.right, y: CIRCUIT.top + (d - W), angle: Math.PI / 2 };
    } else if (d < 2 * W + H) {
      return { x: CIRCUIT.right - (d - W - H), y: CIRCUIT.bottom, angle: Math.PI };
    } else {
      return { x: CIRCUIT.left, y: CIRCUIT.bottom - (d - 2 * W - H), angle: -Math.PI / 2 };
    }
  };

  // Initialize particles
  useEffect(() => {
    particlesRef.current = Array.from({ length: NUM_PARTICLES }, (_, i) => ({
      pos: i / NUM_PARTICLES,
      speed: 0.0008,
    }));
  }, []);

  const drawCircuit = (ctx: CanvasRenderingContext2D, alpha = 1) => {
    const { left, right, top, bottom } = CIRCUIT;
    ctx.globalAlpha = alpha;

    // Wire
    ctx.strokeStyle = '#2A2A3C';
    ctx.lineWidth = 6;
    ctx.lineJoin = 'round';
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.rect(left, top, right - left, bottom - top);
    ctx.stroke();

    // Battery (left side, vertical)
    const batX = left, batY = (top + bottom) / 2;
    // Positive terminal
    ctx.fillStyle = '#00D4AA';
    ctx.strokeStyle = '#00D4AA';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(batX - 16, batY - 40);
    ctx.lineTo(batX + 16, batY - 40);
    ctx.stroke();
    ctx.fillStyle = '#00D4AA';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('+', batX, batY - 30);

    // Negative terminal
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(batX - 10, batY + 40);
    ctx.lineTo(batX + 10, batY + 40);
    ctx.stroke();
    ctx.fillText('−', batX, batY + 30);

    // Battery body
    ctx.fillStyle = '#1E1E2A';
    ctx.strokeStyle = '#3A3A52';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(batX - 22, batY - 60, 44, 120, 6);
    ctx.fill();
    ctx.stroke();

    // Voltage label
    ctx.fillStyle = '#00D4AA';
    ctx.font = 'bold 13px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${voltage}V`, batX, batY);

    // Resistor (right side, vertical)
    const resX = right, resY = (top + bottom) / 2;
    ctx.fillStyle = '#1E1E2A';
    ctx.strokeStyle = '#F5A623';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(resX - 22, resY - 45, 44, 90, 4);
    ctx.fill();
    ctx.stroke();

    // Zigzag
    ctx.strokeStyle = '#F5A623';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    const zStart = resY - 30;
    const zEnd = resY + 30;
    const zSteps = 6;
    const zH = (zEnd - zStart) / zSteps;
    ctx.moveTo(resX, zStart);
    for (let i = 0; i < zSteps; i++) {
      ctx.lineTo(resX + (i % 2 === 0 ? 10 : -10), zStart + (i + 0.5) * zH);
    }
    ctx.lineTo(resX, zEnd);
    ctx.stroke();

    // Resistance label
    ctx.fillStyle = '#F5A623';
    ctx.font = 'bold 12px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${resistance}Ω`, resX, resY + 60);

    // Current label (top)
    ctx.fillStyle = accentColor;
    ctx.font = 'bold 12px JetBrains Mono, monospace';
    ctx.fillText(`I = ${current.toFixed(2)}A`, (left + right) / 2, top - 20);

    ctx.globalAlpha = 1;
  };

  const drawParticles = (ctx: CanvasRenderingContext2D, particleSpeed: number) => {
    const now = Date.now();
    const dt = Math.min(now - lastTimeRef.current, 50);
    lastTimeRef.current = now;

    particlesRef.current.forEach(p => {
      p.pos = (p.pos + particleSpeed * dt) % 1;
      const { x, y } = circuitPath(p.pos);

      ctx.fillStyle = accentColor;
      ctx.shadowColor = accentColor;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });
  };

  const drawStep1 = (ctx: CanvasRenderingContext2D, p: number) => {
    clearCanvas(ctx, CANVAS_W, CANVAS_H, BG);
    const t = easing.easeOut(p);

    // Water pipe analogy illustration
    const pipeY = CANVAS_H / 2 - 20;
    const pipeX = 80, pipeW = 440;

    ctx.globalAlpha = t;

    // Pipe background
    ctx.fillStyle = '#1A1A26';
    ctx.strokeStyle = '#2A2A3C';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(pipeX, pipeY - 30, pipeW, 60, 20);
    ctx.fill();
    ctx.stroke();

    // Water flow
    const waterW = pipeW * easing.easeOut(Math.min(p * 1.5, 1));
    ctx.fillStyle = '#4F8EF7' + '60';
    ctx.beginPath();
    ctx.roundRect(pipeX + 2, pipeY - 28, waterW - 4, 56, 18);
    ctx.fill();

    // Pressure indicator (left)
    ctx.fillStyle = '#00D4AA';
    ctx.font = '13px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Pressure', pipeX + 50, pipeY - 55);
    ctx.fillText('= Voltage', pipeX + 50, pipeY - 40);

    // Flow arrows
    if (t > 0.5) {
      const arrows = 4;
      for (let i = 0; i < arrows; i++) {
        const ax = pipeX + 80 + i * 90;
        ctx.strokeStyle = '#4F8EF7';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(ax, pipeY);
        ctx.lineTo(ax + 30, pipeY);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(ax + 30, pipeY);
        ctx.lineTo(ax + 22, pipeY - 7);
        ctx.moveTo(ax + 30, pipeY);
        ctx.lineTo(ax + 22, pipeY + 7);
        ctx.stroke();
      }
    }

    // Label
    ctx.fillStyle = accentColor;
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.fillText('Flow = Current', CANVAS_W / 2, pipeY + 60);
    ctx.fillStyle = '#9090A8';
    ctx.font = '12px Inter, sans-serif';
    ctx.fillText('Pipe narrowness = Resistance', CANVAS_W / 2, pipeY + 80);

    ctx.globalAlpha = 1;
  };

  const drawStep2 = (ctx: CanvasRenderingContext2D, p: number) => {
    clearCanvas(ctx, CANVAS_W, CANVAS_H, BG);
    drawCircuit(ctx, 1);

    const particleSpeed = (current / 10) * 0.0015 * Math.min(p * 2, 1);
    drawParticles(ctx, particleSpeed);

    if (p > 0.5) {
      drawLabel(ctx, `Higher V → More current`, (CIRCUIT.left + CIRCUIT.right) / 2, CIRCUIT.bottom + 40, '#00D4AA', (p - 0.5) / 0.5);
    }
  };

  const drawStep3 = (ctx: CanvasRenderingContext2D, p: number) => {
    clearCanvas(ctx, CANVAS_W, CANVAS_H, BG);
    drawCircuit(ctx, 1);
    const particleSpeed = (current / 10) * 0.0015;
    drawParticles(ctx, particleSpeed);

    if (p > 0.5) {
      drawLabel(ctx, `Higher R → Less current`, (CIRCUIT.left + CIRCUIT.right) / 2, CIRCUIT.bottom + 40, '#F5A623', (p - 0.5) / 0.5);
    }
  };

  const drawStep4 = (ctx: CanvasRenderingContext2D, p: number) => {
    clearCanvas(ctx, CANVAS_W, CANVAS_H, BG);
    drawCircuit(ctx, 1);
    const particleSpeed = (current / 10) * 0.0015;
    drawParticles(ctx, particleSpeed);

    const t = easing.easeOut(p);

    // Formula box
    ctx.globalAlpha = t;
    ctx.fillStyle = '#1E1E2A';
    ctx.strokeStyle = accentColor + '50';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(CANVAS_W / 2 - 130, CIRCUIT.bottom + 20, 260, 50, 10);
    ctx.fill();
    ctx.stroke();

    const parts = [
      { t: 'V', c: '#00D4AA' }, { t: ' = ', c: '#9090A8' },
      { t: 'I', c: accentColor }, { t: ' × ', c: '#9090A8' },
      { t: 'R', c: '#F5A623' },
    ];
    ctx.font = 'bold 24px JetBrains Mono, monospace';
    ctx.textBaseline = 'middle';
    let tw = 0;
    parts.forEach(pt => { ctx.font = 'bold 24px JetBrains Mono, monospace'; tw += ctx.measureText(pt.t).width; });
    let cx = CANVAS_W / 2 - tw / 2;
    parts.forEach(pt => {
      ctx.font = 'bold 24px JetBrains Mono, monospace';
      ctx.fillStyle = pt.c;
      ctx.textAlign = 'left';
      ctx.fillText(pt.t, cx, CIRCUIT.bottom + 45);
      cx += ctx.measureText(pt.t).width;
    });
    ctx.globalAlpha = 1;
  };

  const drawStep5 = (ctx: CanvasRenderingContext2D, _p: number) => {
    clearCanvas(ctx, CANVAS_W, CANVAS_H, BG);
    drawCircuit(ctx, 1);
    const particleSpeed = (current / 10) * 0.0015;
    drawParticles(ctx, particleSpeed);

    // Result formula
    ctx.fillStyle = '#1E1E2A';
    ctx.strokeStyle = accentColor + '40';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(CANVAS_W / 2 - 150, CIRCUIT.bottom + 15, 300, 50, 10);
    ctx.fill();
    ctx.stroke();

    ctx.font = 'bold 16px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#00D4AA';
    ctx.fillText(`${voltage}V ÷ ${resistance}Ω = `, CANVAS_W / 2 - 40, CIRCUIT.bottom + 40);
    ctx.fillStyle = accentColor;
    ctx.fillText(`${current.toFixed(2)}A`, CANVAS_W / 2 + 85, CIRCUIT.bottom + 40);

    ctx.font = '12px Inter, sans-serif';
    ctx.fillStyle = '#5A5A72';
    ctx.fillText('Adjust sliders to experiment', CANVAS_W / 2, CIRCUIT.bottom + 78);
  };

  const draw = useCallback((p: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    switch (step) {
      case 0: drawStep1(ctx, p); break;
      case 1: drawStep2(ctx, p); break;
      case 2: drawStep3(ctx, p); break;
      case 3: drawStep4(ctx, p); break;
      case 4: drawStep5(ctx, p); break;
    }
  }, [step, voltage, resistance, accentColor, current]);

  // Continuous particle animation
  useEffect(() => {
    if (step >= 1) {
      const loop = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        draw(1);
        animRef.current = requestAnimationFrame(loop);
      };
      lastTimeRef.current = Date.now();
      if (step >= 1) animRef.current = requestAnimationFrame(loop);
      return () => cancelAnimationFrame(animRef.current);
    } else {
      let startTime: number | null = null;
      const duration = 2000 / speed;
      const animate = (ts: number) => {
        if (!startTime) startTime = ts;
        const p = Math.min((ts - startTime) / duration, 1);
        draw(p);
        if (p < 1 && isPlaying) animRef.current = requestAnimationFrame(animate);
        else if (p >= 1) onStepComplete?.();
      };
      if (isPlaying) animRef.current = requestAnimationFrame(animate);
      else draw(0);
      return () => cancelAnimationFrame(animRef.current);
    }
  }, [step, isPlaying, speed, draw, voltage, resistance, onStepComplete]);

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        className="w-full h-full rounded-xl"
        style={{ display: 'block', background: BG }}
      />
      {step === 4 && (
        <div className="absolute bottom-4 left-4 right-4 bg-[#111118]/90 border border-[#2A2A3C] rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#9090A8] w-24">Voltage (V)</span>
            <input type="range" min={1} max={12} step={1} value={voltage}
              onChange={e => setVoltage(Number(e.target.value))}
              className="flex-1 accent-[#00D4AA]" />
            <span className="font-mono text-sm text-[#00D4AA] w-16 text-right">{voltage}V</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#9090A8] w-24">Resistance (R)</span>
            <input type="range" min={1} max={12} step={1} value={resistance}
              onChange={e => setResistance(Number(e.target.value))}
              className="flex-1 accent-[#F5A623]" />
            <span className="font-mono text-sm text-[#F5A623] w-16 text-right">{resistance}Ω</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default OhmsLawAnimation;
