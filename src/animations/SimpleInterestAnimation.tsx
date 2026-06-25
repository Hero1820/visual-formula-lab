// ============================================================
// animations/SimpleInterestAnimation.tsx
// Bar chart animation showing linear interest growth
// ============================================================

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { clearCanvas, roundRect } from '../utils/canvasUtils';
import { easing } from '../engine/animationEngine';

interface SimpleInterestAnimationProps {
  step: number;
  speed: number;
  isPlaying: boolean;
  accentColor: string;
  onStepComplete?: () => void;
}

const SimpleInterestAnimation: React.FC<SimpleInterestAnimationProps> = ({
  step, speed, isPlaying, accentColor, onStepComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const [principal, setPrincipal] = useState(1000);
  const [rate, setRate] = useState(0.10);
  const [years, setYears] = useState(5);

  const CANVAS_W = 600, CANVAS_H = 460, BG = '#0D0D14';

  const interestPerYear = principal * rate;
  const totalInterest = interestPerYear * years;

  const drawBarChart = (ctx: CanvasRenderingContext2D, yearsToShow: number, animProgress: number) => {
    const CHART_X = 60, CHART_Y = 60, CHART_W = CANVAS_W - 100, CHART_H = 280;
    const maxVal = Math.max(principal + interestPerYear * 5, 1);
    const barW = Math.min((CHART_W / Math.max(years, 1)) - 10, 70);

    // Grid
    ctx.strokeStyle = '#1E1E2E';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = CHART_Y + CHART_H - (i / 5) * CHART_H;
      ctx.beginPath();
      ctx.moveTo(CHART_X, y);
      ctx.lineTo(CHART_X + CHART_W, y);
      ctx.stroke();

      const val = (maxVal * i / 5).toFixed(0);
      ctx.font = '11px Inter, sans-serif';
      ctx.fillStyle = '#5A5A72';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(`₹${val}`, CHART_X - 8, y);
    }

    // Axes
    ctx.strokeStyle = '#2A2A3C';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(CHART_X, CHART_Y);
    ctx.lineTo(CHART_X, CHART_Y + CHART_H);
    ctx.lineTo(CHART_X + CHART_W, CHART_Y + CHART_H);
    ctx.stroke();

    // Bars
    for (let y = 1; y <= yearsToShow; y++) {
      const barProgress = y <= yearsToShow - 1 ? 1 : animProgress;
      const totalVal = principal + interestPerYear * y;
      const pHeight = (principal / maxVal) * CHART_H;
      const iHeight = ((totalVal - principal) / maxVal) * CHART_H * barProgress;

      const barX = CHART_X + (y - 1) * (CHART_W / Math.max(years, 1)) + (CHART_W / Math.max(years, 1) - barW) / 2;
      const baseY = CHART_Y + CHART_H;

      // Principal part
      ctx.fillStyle = accentColor + '40';
      ctx.strokeStyle = accentColor + '80';
      ctx.lineWidth = 1;
      ctx.setLineDash([]);
      ctx.beginPath();
      roundRect(ctx, barX, baseY - pHeight, barW, pHeight, 4);
      ctx.fill();
      ctx.stroke();

      // Interest part
      if (iHeight > 0) {
        ctx.fillStyle = '#00D4AA' + '50';
        ctx.strokeStyle = '#00D4AA' + '90';
        ctx.beginPath();
        roundRect(ctx, barX, baseY - pHeight - iHeight, barW, iHeight, 4);
        ctx.fill();
        ctx.stroke();
      }

      // Value label
      if (barProgress > 0.8 && barW > 35) {
        ctx.font = '10px Inter, sans-serif';
        ctx.fillStyle = '#9090A8';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(`₹${(totalVal * barProgress + principal * (1 - barProgress)).toFixed(0)}`, barX + barW / 2, baseY - pHeight - iHeight - 4);
      }

      // Year label
      ctx.font = '11px Inter, sans-serif';
      ctx.fillStyle = '#5A5A72';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(`Yr ${y}`, barX + barW / 2, CHART_Y + CHART_H + 8);
    }

    // Legend
    const lx = CHART_X, ly = CHART_Y + CHART_H + 36;
    ctx.fillStyle = accentColor + '40';
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    roundRect(ctx, lx, ly, 14, 14, 3);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#9090A8';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('Principal', lx + 20, ly + 7);

    ctx.fillStyle = '#00D4AA' + '50';
    ctx.strokeStyle = '#00D4AA';
    ctx.beginPath();
    roundRect(ctx, lx + 110, ly, 14, 14, 3);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#9090A8';
    ctx.fillText('Interest', lx + 130, ly + 7);
  };

  const drawStep1 = (ctx: CanvasRenderingContext2D, p: number) => {
    clearCanvas(ctx, CANVAS_W, CANVAS_H, BG);
    const t = easing.easeOut(p);

    // Coin animation
    const coinY = lerp(100, CANVAS_H / 2 - 40, t);
    ctx.fillStyle = '#F5A623' + Math.round(t * 255).toString(16).padStart(2, '0');
    ctx.strokeStyle = '#F5A623';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(CANVAS_W / 2, coinY, 50, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.font = 'bold 28px Inter, sans-serif';
    ctx.fillStyle = '#0D0D14';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('₹', CANVAS_W / 2, coinY);

    if (t > 0.6) {
      const ft = (t - 0.6) / 0.4;
      ctx.font = 'bold 18px Inter, sans-serif';
      ctx.fillStyle = '#EEEEF2';
      ctx.globalAlpha = ft;
      ctx.fillText('Your Principal: ₹1,000', CANVAS_W / 2, CANVAS_H / 2 + 40);
      ctx.font = '14px Inter, sans-serif';
      ctx.fillStyle = '#9090A8';
      ctx.fillText('Bank pays you 10% every year', CANVAS_W / 2, CANVAS_H / 2 + 70);
      ctx.globalAlpha = 1;
    }
  };

  const drawStep2 = (ctx: CanvasRenderingContext2D, p: number) => {
    clearCanvas(ctx, CANVAS_W, CANVAS_H, BG);
    const yearsShown = Math.ceil(easing.easeOut(p) * 1);
    const barProg = easing.easeOut(Math.min(p * 2, 1));
    drawBarChart(ctx, yearsShown, barProg);

    if (p > 0.5) {
      const ft = (p - 0.5) / 0.5;
      ctx.globalAlpha = ft;
      ctx.fillStyle = '#1E1E2A';
      ctx.strokeStyle = '#00D4AA' + '40';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(CANVAS_W / 2 - 120, CANVAS_H - 55, 240, 40, 8);
      ctx.fill();
      ctx.stroke();
      ctx.font = 'bold 14px JetBrains Mono, monospace';
      ctx.fillStyle = '#00D4AA';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`+₹${interestPerYear.toFixed(0)} per year`, CANVAS_W / 2, CANVAS_H - 35);
      ctx.globalAlpha = 1;
    }
  };

  const drawStep3 = (ctx: CanvasRenderingContext2D, p: number) => {
    clearCanvas(ctx, CANVAS_W, CANVAS_H, BG);
    const yearsShown = Math.ceil(easing.easeInOut(p) * years);
    const barProg = easing.easeOut((p * years - (yearsShown - 1)) / 1);
    drawBarChart(ctx, Math.max(1, yearsShown), Math.max(0.1, barProg));

    if (p > 0.7) {
      const ft = (p - 0.7) / 0.3;
      ctx.globalAlpha = ft;
      ctx.fillStyle = '#1E1E2A';
      ctx.strokeStyle = accentColor + '40';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(CANVAS_W - 220, 15, 205, 52, 8);
      ctx.fill();
      ctx.stroke();

      const fParts = [
        { t: 'I', c: '#00D4AA' }, { t: ' = ', c: '#9090A8' },
        { t: 'P', c: accentColor }, { t: '×', c: '#9090A8' },
        { t: 'R', c: '#F5A623' }, { t: '×', c: '#9090A8' },
        { t: 'T', c: '#FF6B8A' },
      ];
      ctx.font = 'bold 18px JetBrains Mono, monospace';
      ctx.textBaseline = 'middle';
      let tw = 0;
      fParts.forEach(pt => { ctx.font = 'bold 18px JetBrains Mono, monospace'; tw += ctx.measureText(pt.t).width; });
      let cx = CANVAS_W - 220 + (205 - tw) / 2;
      fParts.forEach(pt => {
        ctx.font = 'bold 18px JetBrains Mono, monospace';
        ctx.fillStyle = pt.c;
        ctx.textAlign = 'left';
        ctx.fillText(pt.t, cx, 41);
        cx += ctx.measureText(pt.t).width;
      });
      ctx.globalAlpha = 1;
    }
  };

  const drawStep4 = (ctx: CanvasRenderingContext2D, _p: number) => {
    clearCanvas(ctx, CANVAS_W, CANVAS_H, BG);
    drawBarChart(ctx, years, 1);

    // Sliders area
    const sx = 60, sy = CANVAS_H - 120, sw = CANVAS_W - 120;
    ctx.fillStyle = '#1E1E2A';
    ctx.strokeStyle = '#2A2A3C';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(sx - 10, sy - 10, sw + 20, 100, 10);
    ctx.fill();
    ctx.stroke();

    const drawSlider = (label: string, value: string, x: number, y: number, pct: number, color: string) => {
      ctx.font = '11px Inter, sans-serif';
      ctx.fillStyle = '#9090A8';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, x, y - 14);

      ctx.font = 'bold 13px JetBrains Mono, monospace';
      ctx.fillStyle = color;
      ctx.textAlign = 'right';
      ctx.fillText(value, x + 160, y - 14);

      // Track
      ctx.fillStyle = '#2A2A3C';
      ctx.beginPath();
      ctx.roundRect(x, y - 5, 160, 10, 5);
      ctx.fill();

      // Fill
      ctx.fillStyle = color + '80';
      ctx.beginPath();
      ctx.roundRect(x, y - 5, 160 * pct, 10, 5);
      ctx.fill();

      // Thumb
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x + 160 * pct, y, 8, 0, Math.PI * 2);
      ctx.fill();
    };

    drawSlider('Principal (P)', `₹${principal}`, sx, sy + 15, (principal - 500) / 4500, accentColor);
    drawSlider('Rate (R)', `${(rate * 100).toFixed(0)}%`, sx + 200, sy + 15, (rate - 0.01) / 0.24, '#F5A623');
    drawSlider('Time (T)', `${years} yrs`, sx + 400, sy + 15, (years - 1) / 9, '#FF6B8A');

    // Total
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#00D4AA';
    ctx.fillText(`Total Interest: ₹${totalInterest.toFixed(0)}`, CANVAS_W / 2, sy + 60);
    ctx.font = '12px Inter, sans-serif';
    ctx.fillStyle = '#5A5A72';
    ctx.fillText('(Use sliders below in the controls)', CANVAS_W / 2, sy + 80);
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
    }
  }, [step, principal, rate, years, accentColor]);

  useEffect(() => {
    let startTime: number | null = null;
    const duration = 2200 / speed;
    const animate = (ts: number) => {
      if (!startTime) startTime = ts;
      const p = Math.min((ts - startTime) / duration, 1);
      draw(p);
      if (p < 1 && isPlaying && step < 3) animRef.current = requestAnimationFrame(animate);
      else if (p >= 1) onStepComplete?.();
    };
    if (step === 3) draw(1);
    else if (isPlaying) animRef.current = requestAnimationFrame(animate);
    else draw(0);
    return () => cancelAnimationFrame(animRef.current);
  }, [step, isPlaying, speed, draw, onStepComplete]);

  useEffect(() => { if (step === 3) draw(1); }, [principal, rate, years, step, draw]);

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        className="w-full h-full rounded-xl"
        style={{ display: 'block', background: BG }}
      />
      {step === 3 && (
        <div className="absolute bottom-4 left-4 right-4 bg-[#111118]/90 border border-[#2A2A3C] rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#9090A8] w-28">Principal (P)</span>
            <input type="range" min={500} max={5000} step={100} value={principal}
              onChange={e => setPrincipal(Number(e.target.value))}
              className="flex-1 accent-[#4F8EF7]" />
            <span className="font-mono text-sm text-[#4F8EF7] w-20 text-right">₹{principal}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#9090A8] w-28">Rate (R)</span>
            <input type="range" min={1} max={25} step={1} value={Math.round(rate * 100)}
              onChange={e => setRate(Number(e.target.value) / 100)}
              className="flex-1 accent-[#F5A623]" />
            <span className="font-mono text-sm text-[#F5A623] w-20 text-right">{Math.round(rate * 100)}%</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#9090A8] w-28">Time (T)</span>
            <input type="range" min={1} max={10} step={1} value={years}
              onChange={e => setYears(Number(e.target.value))}
              className="flex-1 accent-[#FF6B8A]" />
            <span className="font-mono text-sm text-[#FF6B8A] w-20 text-right">{years} yrs</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleInterestAnimation;
