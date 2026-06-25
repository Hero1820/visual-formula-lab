// ============================================================
// animations/CircleAnimation.tsx
// Sector rearrangement to derive Area = πr²
// ============================================================

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { clearCanvas, drawLabel } from '../utils/canvasUtils';
import { easing, lerp } from '../engine/animationEngine';

interface CircleAnimationProps {
  step: number;
  speed: number;
  isPlaying: boolean;
  accentColor: string;
  onStepComplete?: () => void;
}

const CircleAnimation: React.FC<CircleAnimationProps> = ({
  step, speed, isPlaying, accentColor, onStepComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const [radius, setRadius] = useState(120);
  const [numSectors, setNumSectors] = useState(8);
  const isDraggingRadius = useRef(false);

  const CANVAS_W = 600, CANVAS_H = 460, BG = '#0D0D14';
  const CX = 200, CY = 240; // circle center

  const drawCircle = (ctx: CanvasRenderingContext2D, r: number, alpha = 1) => {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = accentColor + '20';
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 2.5;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.arc(CX, CY, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Radius line
    ctx.strokeStyle = '#F5A623';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(CX, CY);
    ctx.lineTo(CX + r, CY);
    ctx.stroke();

    // Center dot
    ctx.fillStyle = accentColor;
    ctx.beginPath();
    ctx.arc(CX, CY, 5, 0, Math.PI * 2);
    ctx.fill();

    // Radius label
    ctx.font = '600 13px Inter, sans-serif';
    ctx.fillStyle = '#F5A623';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`r = ${r}`, CX + r / 2, CY - 16);
    ctx.globalAlpha = 1;
  };

  const drawSectors = (ctx: CanvasRenderingContext2D, n: number, r: number, spread: number, alpha = 1) => {
    const angleStep = (Math.PI * 2) / n;
    ctx.globalAlpha = alpha;
    for (let i = 0; i < n; i++) {
      const startAngle = i * angleStep - Math.PI / 2;
      const endAngle = startAngle + angleStep;
      const midAngle = (startAngle + endAngle) / 2;
      const hue = (i / n) * 60;
      ctx.fillStyle = `hsla(${220 + hue}, 80%, 60%, 0.25)`;
      ctx.strokeStyle = `hsla(${220 + hue}, 80%, 60%, 0.9)`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(CX, CY);
      ctx.arc(CX, CY, r - 1, startAngle, endAngle);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      if (spread > 0) {
        // Draw spread lines between sectors
        ctx.strokeStyle = accentColor + '30';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(CX, CY);
        ctx.lineTo(CX + Math.cos(startAngle) * r, CY + Math.sin(startAngle) * r);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
    ctx.globalAlpha = 1;
  };

  const drawRearranged = (ctx: CanvasRenderingContext2D, n: number, r: number, t: number, alpha = 1) => {
    // Rearrange sectors into approximate rectangle
    const angleStep = (Math.PI * 2) / n;
    const sectorWidth = r * Math.sin(angleStep / 2) * 2;
    const totalWidth = n * sectorWidth * 0.5; // πr approximately
    const startX = CANVAS_W / 2 - totalWidth / 2;
    const rectY = 240;

    ctx.globalAlpha = alpha;

    for (let i = 0; i < n; i++) {
      const flip = i % 2 === 0;
      const tileX = startX + i * (totalWidth / n);

      // Interpolate from circle position to rectangle position
      const fromX = CX + Math.cos(i * angleStep) * r * 0.5;
      const fromY = CY;
      const toX = tileX + (totalWidth / n) / 2;
      const toY = flip ? rectY - r / 2 : rectY + r / 2;

      const x = lerp(fromX, toX, t);
      const y = lerp(fromY, toY, t);

      const hue = (i / n) * 60;
      ctx.fillStyle = `hsla(${220 + hue}, 80%, 60%, 0.3)`;
      ctx.strokeStyle = `hsla(${220 + hue}, 80%, 60%, 0.8)`;
      ctx.lineWidth = 1.5;

      // Draw sector as triangle
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(flip ? Math.PI : 0);
      const w = lerp(sectorWidth * 0.4, totalWidth / n, t);
      const h = r;
      ctx.beginPath();
      ctx.moveTo(-w / 2, -h / 2);
      ctx.lineTo(w / 2, -h / 2);
      ctx.lineTo(0, h / 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // Rectangle outline (appears as t → 1)
    if (t > 0.6) {
      const outlineAlpha = (t - 0.6) / 0.4;
      ctx.strokeStyle = accentColor + Math.round(outlineAlpha * 255).toString(16).padStart(2, '0');
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.rect(startX, rectY - r, totalWidth, r * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Labels
      ctx.globalAlpha = outlineAlpha;
      ctx.font = '600 12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Width label: πr
      ctx.fillStyle = accentColor;
      ctx.fillText('← πr →', CANVAS_W / 2, rectY + r + 22);

      // Height label: r
      ctx.fillStyle = '#F5A623';
      ctx.fillText('r', startX - 20, rectY);
    }
    ctx.globalAlpha = 1;
  };

  const drawStep1 = (ctx: CanvasRenderingContext2D, p: number) => {
    clearCanvas(ctx, CANVAS_W, CANVAS_H, BG);
    drawCircle(ctx, radius, easing.easeOut(p));

    // Circumference label
    if (p > 0.6) {
      const t = (p - 0.6) / 0.4;
      ctx.globalAlpha = t;
      ctx.strokeStyle = '#00D4AA' + '60';
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 4]);
      ctx.beginPath();
      ctx.arc(CX, CY, radius + 10, 0, Math.PI * 2 * t);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;

      if (t > 0.8) {
        drawLabel(ctx, `Circumference = 2πr`, CX, CY + radius + 50, '#00D4AA', (t - 0.8) / 0.2);
        drawLabel(ctx, `π ≈ 3.14159...`, CX, CY + radius + 80, '#9090A8', (t - 0.8) / 0.2);
      }
    }
  };

  const drawStep2 = (ctx: CanvasRenderingContext2D, p: number) => {
    clearCanvas(ctx, CANVAS_W, CANVAS_H, BG);
    // Circle outline
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.arc(CX, CY, radius, 0, Math.PI * 2);
    ctx.stroke();

    const n = numSectors;
    const spread = easing.easeInOut(p);
    drawSectors(ctx, n, radius, spread, 1);

    // Label
    drawLabel(ctx, `${n} sectors`, CX, CY + radius + 50, accentColor, 1);

    if (p > 0.6) {
      drawLabel(ctx, 'More sectors = more accurate', CX, CY + radius + 78, '#9090A8', (p - 0.6) / 0.4);
    }
  };

  const drawStep3 = (ctx: CanvasRenderingContext2D, p: number) => {
    clearCanvas(ctx, CANVAS_W, CANVAS_H, BG);
    const t = easing.easeInOut(p);

    // Fading circle
    ctx.strokeStyle = accentColor + Math.round((1 - t) * 200).toString(16).padStart(2, '0');
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    ctx.globalAlpha = 1 - t * 0.7;
    ctx.beginPath();
    ctx.arc(CX, CY, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;

    drawRearranged(ctx, numSectors, radius, t, 1);

    if (t > 0.9) {
      drawLabel(ctx, 'Sectors form a rectangle!', CANVAS_W / 2, 40, accentColor, (t - 0.9) / 0.1);
    }
  };

  const drawStep4 = (ctx: CanvasRenderingContext2D, p: number) => {
    clearCanvas(ctx, CANVAS_W, CANVAS_H, BG);
    drawRearranged(ctx, numSectors, radius, 1, 1);

    const t = easing.easeOut(p);

    // Formula derivation
    const fy = 40;
    ctx.fillStyle = '#1E1E2A';
    ctx.strokeStyle = accentColor + '40';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(CANVAS_W / 2 - 170, fy - 24, 340, 44, 10);
    ctx.fill();
    ctx.stroke();

    const parts: { t: string; c: string }[] = [];
    if (t > 0.1) parts.push({ t: 'Area = ', c: '#9090A8' });
    if (t > 0.25) parts.push({ t: 'r', c: '#F5A623' });
    if (t > 0.4) parts.push({ t: ' × ', c: '#9090A8' });
    if (t > 0.55) parts.push({ t: 'πr', c: '#00D4AA' });
    if (t > 0.7) parts.push({ t: ' = ', c: '#9090A8' });
    if (t > 0.85) parts.push({ t: 'πr²', c: accentColor });

    ctx.font = 'bold 22px JetBrains Mono, monospace';
    ctx.textBaseline = 'middle';
    let tw = 0;
    parts.forEach(pt => { ctx.font = 'bold 22px JetBrains Mono, monospace'; tw += ctx.measureText(pt.t).width; });
    let cx = CANVAS_W / 2 - tw / 2;
    parts.forEach(pt => {
      ctx.font = 'bold 22px JetBrains Mono, monospace';
      ctx.fillStyle = pt.c;
      ctx.textAlign = 'left';
      ctx.fillText(pt.t, cx, fy);
      cx += ctx.measureText(pt.t).width;
    });
  };

  const drawStep5 = (ctx: CanvasRenderingContext2D, _p: number) => {
    clearCanvas(ctx, CANVAS_W, CANVAS_H, BG);
    const area = (Math.PI * radius * radius).toFixed(0);

    drawCircle(ctx, radius, 1);

    // Sector lines
    const n = 16;
    const angleStep = (Math.PI * 2) / n;
    ctx.strokeStyle = accentColor + '30';
    ctx.lineWidth = 1;
    for (let i = 0; i < n; i++) {
      ctx.beginPath();
      ctx.moveTo(CX, CY);
      ctx.lineTo(CX + Math.cos(i * angleStep) * radius, CY + Math.sin(i * angleStep) * radius);
      ctx.stroke();
    }

    // Radius drag handle
    ctx.fillStyle = '#F5A623';
    ctx.strokeStyle = '#0D0D14';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(CX + radius, CY, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Formula
    ctx.fillStyle = '#1E1E2A';
    ctx.strokeStyle = accentColor + '50';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(CANVAS_W - 230, 15, 215, 52, 10);
    ctx.fill();
    ctx.stroke();

    const fParts = [
      { t: 'A = π×', c: '#9090A8' },
      { t: `${radius}`, c: '#F5A623' },
      { t: '² = ', c: '#9090A8' },
      { t: area, c: accentColor },
    ];
    let tw = 0;
    fParts.forEach(pt => { ctx.font = 'bold 17px JetBrains Mono, monospace'; tw += ctx.measureText(pt.t).width; });
    let cx = CANVAS_W - 230 + (215 - tw) / 2;
    fParts.forEach(pt => {
      ctx.font = 'bold 17px JetBrains Mono, monospace';
      ctx.fillStyle = pt.c;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(pt.t, cx, 41);
      cx += ctx.measureText(pt.t).width;
    });

    ctx.font = '12px Inter, sans-serif';
    ctx.fillStyle = '#5A5A72';
    ctx.textAlign = 'center';
    ctx.fillText('Drag the yellow handle to resize', CANVAS_W / 2, CANVAS_H - 20);
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
  }, [step, radius, numSectors, accentColor]);

  useEffect(() => {
    let startTime: number | null = null;
    const duration = 2200 / speed;
    const animate = (ts: number) => {
      if (!startTime) startTime = ts;
      const p = Math.min((ts - startTime) / duration, 1);
      draw(p);
      if (p < 1 && isPlaying && step < 4) {
        animRef.current = requestAnimationFrame(animate);
      } else if (p >= 1) onStepComplete?.();
    };
    if (step === 4) { draw(1); }
    else if (isPlaying) { animRef.current = requestAnimationFrame(animate); }
    else { draw(0); }
    return () => cancelAnimationFrame(animRef.current);
  }, [step, isPlaying, speed, draw, onStepComplete]);

  useEffect(() => { if (step === 4) draw(1); }, [radius, step, draw]);

  const getPos = (e: React.MouseEvent) => {
    const r = canvasRef.current!.getBoundingClientRect();
    return { x: (e.clientX - r.left) * (CANVAS_W / r.width), y: (e.clientY - r.top) * (CANVAS_H / r.height) };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (step !== 4) return;
    const pos = getPos(e);
    if (Math.hypot(pos.x - (CX + radius), pos.y - CY) < 20) {
      isDraggingRadius.current = true;
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRadius.current) return;
    const pos = getPos(e);
    const newR = Math.round(Math.hypot(pos.x - CX, pos.y - CY));
    setRadius(Math.max(50, Math.min(160, newR)));
  };

  const handleMouseUp = () => { isDraggingRadius.current = false; };

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_W}
      height={CANVAS_H}
      className={`w-full h-full rounded-xl ${step === 4 ? 'cursor-grab' : 'cursor-default'}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ display: 'block', background: BG }}
    />
  );
};

export default CircleAnimation;
