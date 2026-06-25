// ============================================================
// animations/RectangleAnimation.tsx
// Tile-filling animation to derive Area = l × w
// ============================================================

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { clearCanvas, drawLabel, drawDimension, roundRect } from '../utils/canvasUtils';
import { easing, lerp, clamp } from '../engine/animationEngine';

interface RectangleAnimationProps {
  step: number;
  speed: number;
  isPlaying: boolean;
  accentColor: string;
  onStepComplete?: () => void;
}

const RectangleAnimation: React.FC<RectangleAnimationProps> = ({
  step, speed, isPlaying, accentColor, onStepComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const [dims, setDims] = useState({ cols: 5, rows: 3 });
  const dragRef = useRef<{ active: boolean; axis: 'w' | 'h' | null }>({ active: false, axis: null });
  const [isDragging, setIsDragging] = useState(false);

  const CANVAS_W = 600, CANVAS_H = 460, BG = '#0D0D14';
  const TILE = 52;
  const ORIGIN_X = 80, ORIGIN_Y = 80;

  const getTotalW = () => dims.cols * TILE;
  const getTotalH = () => dims.rows * TILE;

  const drawGrid = (ctx: CanvasRenderingContext2D, cols: number, rows: number, tilesFilled: number, alpha = 1) => {
    const prevAlpha = ctx.globalAlpha;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = r * cols + c;
        const tx = ORIGIN_X + c * TILE;
        const ty = ORIGIN_Y + r * TILE;
        ctx.globalAlpha = alpha;
        if (idx < tilesFilled) {
          ctx.fillStyle = accentColor + '22';
          ctx.strokeStyle = accentColor + '60';
        } else {
          ctx.fillStyle = '#1E1E2A';
          ctx.strokeStyle = '#2A2A3C';
        }
        ctx.lineWidth = 1;
        ctx.beginPath();
        roundRect(ctx, tx + 1, ty + 1, TILE - 2, TILE - 2, 4);
        ctx.fill();
        ctx.stroke();

        // Tile number
        if (idx < tilesFilled && TILE > 30) {
          ctx.globalAlpha = alpha * 0.5;
          ctx.font = '11px Inter, sans-serif';
          ctx.fillStyle = accentColor;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`${idx + 1}`, tx + TILE / 2, ty + TILE / 2);
        }
      }
    }
    ctx.globalAlpha = prevAlpha;
  };

  const drawStep1 = (ctx: CanvasRenderingContext2D, p: number) => {
    clearCanvas(ctx, CANVAS_W, CANVAS_H, BG);
    const t = easing.easeOut(p);

    // Show one unit tile
    const tileX = CANVAS_W / 2 - TILE / 2;
    const tileY = CANVAS_H / 2 - TILE / 2;
    ctx.globalAlpha = t;
    ctx.fillStyle = accentColor + '25';
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    roundRect(ctx, tileX, tileY, TILE, TILE, 6);
    ctx.fill();
    ctx.stroke();

    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.fillStyle = accentColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('1 unit²', CANVAS_W / 2, CANVAS_H / 2);

    if (t > 0.6) {
      ctx.globalAlpha = (t - 0.6) / 0.4;
      ctx.font = '14px Inter, sans-serif';
      ctx.fillStyle = '#9090A8';
      ctx.fillText('Area = number of unit squares that fit', CANVAS_W / 2, CANVAS_H / 2 + 70);
    }
    ctx.globalAlpha = 1;
  };

  const drawStep2 = (ctx: CanvasRenderingContext2D, p: number) => {
    clearCanvas(ctx, CANVAS_W, CANVAS_H, BG);
    const filled = Math.floor(easing.easeOut(p) * dims.cols);
    drawGrid(ctx, dims.cols, 1, filled, 1);

    // Row outline
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    ctx.beginPath();
    roundRect(ctx, ORIGIN_X, ORIGIN_Y, getTotalW(), TILE, 4);
    ctx.stroke();

    drawDimension(ctx, { x: ORIGIN_X, y: ORIGIN_Y + TILE + 30 }, { x: ORIGIN_X + getTotalW(), y: ORIGIN_Y + TILE + 30 }, `Width = ${dims.cols}`, accentColor, 1);

    if (p > 0.8) {
      drawLabel(ctx, `1 row × ${dims.cols} tiles = ${dims.cols} tiles`, CANVAS_W / 2, CANVAS_H - 40, accentColor, (p - 0.8) / 0.2);
    }
  };

  const drawStep3 = (ctx: CanvasRenderingContext2D, p: number) => {
    clearCanvas(ctx, CANVAS_W, CANVAS_H, BG);
    const filled = Math.floor(easing.easeOut(p) * dims.cols * dims.rows);
    drawGrid(ctx, dims.cols, dims.rows, filled, 1);

    // Border
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    ctx.beginPath();
    roundRect(ctx, ORIGIN_X, ORIGIN_Y, getTotalW(), getTotalH(), 4);
    ctx.stroke();

    drawDimension(ctx, { x: ORIGIN_X, y: ORIGIN_Y + getTotalH() + 30 }, { x: ORIGIN_X + getTotalW(), y: ORIGIN_Y + getTotalH() + 30 }, `l = ${dims.cols}`, accentColor, 1);
    drawDimension(ctx, { x: ORIGIN_X + getTotalW() + 40, y: ORIGIN_Y }, { x: ORIGIN_X + getTotalW() + 40, y: ORIGIN_Y + getTotalH() }, `w = ${dims.rows}`, '#00D4AA', 1);

    const total = dims.cols * dims.rows;
    if (p > 0.7) {
      // Formula box
      ctx.fillStyle = '#1E1E2A';
      ctx.strokeStyle = accentColor + '50';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(CANVAS_W - 200, CANVAS_H - 80, 180, 56, 10);
      ctx.fill();
      ctx.stroke();
      ctx.font = 'bold 16px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#9090A8';
      ctx.fillText(`${dims.cols} × ${dims.rows} = `, CANVAS_W - 145, CANVAS_H - 55);
      ctx.fillStyle = '#F5A623';
      ctx.fillText(`${total}`, CANVAS_W - 65, CANVAS_H - 55);
    }
  };

  const drawStep4 = (ctx: CanvasRenderingContext2D, _p: number) => {
    clearCanvas(ctx, CANVAS_W, CANVAS_H, BG);
    const total = dims.cols * dims.rows;

    drawGrid(ctx, dims.cols, dims.rows, total, 1);

    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 2.5;
    ctx.setLineDash([]);
    ctx.beginPath();
    roundRect(ctx, ORIGIN_X, ORIGIN_Y, getTotalW(), getTotalH(), 4);
    ctx.stroke();

    drawDimension(ctx, { x: ORIGIN_X, y: ORIGIN_Y + getTotalH() + 30 }, { x: ORIGIN_X + getTotalW(), y: ORIGIN_Y + getTotalH() + 30 }, `l = ${dims.cols}`, accentColor, 1);
    drawDimension(ctx, { x: ORIGIN_X + getTotalW() + 40, y: ORIGIN_Y }, { x: ORIGIN_X + getTotalW() + 40, y: ORIGIN_Y + getTotalH() }, `w = ${dims.rows}`, '#00D4AA', 1);

    // Drag handles
    // Width handle (right edge)
    const wHx = ORIGIN_X + getTotalW(), wHy = ORIGIN_Y + getTotalH() / 2;
    ctx.fillStyle = accentColor;
    ctx.beginPath();
    ctx.arc(wHx, wHy, 10, 0, Math.PI * 2);
    ctx.fill();

    // Height handle (bottom edge)
    const hHx = ORIGIN_X + getTotalW() / 2, hHy = ORIGIN_Y + getTotalH();
    ctx.fillStyle = '#00D4AA';
    ctx.beginPath();
    ctx.arc(hHx, hHy, 10, 0, Math.PI * 2);
    ctx.fill();

    // Formula
    ctx.fillStyle = '#1E1E2A';
    ctx.strokeStyle = accentColor + '40';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(CANVAS_W - 220, 20, 200, 52, 10);
    ctx.fill();
    ctx.stroke();

    ctx.font = 'bold 16px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const fParts = [
      { t: 'A', c: accentColor },
      { t: ' = ', c: '#9090A8' },
      { t: `${dims.cols}`, c: accentColor },
      { t: '×', c: '#9090A8' },
      { t: `${dims.rows}`, c: '#00D4AA' },
      { t: `=${total}`, c: '#F5A623' },
    ];
    let tw2 = 0;
    fParts.forEach(pt => { ctx.font = 'bold 15px JetBrains Mono, monospace'; tw2 += ctx.measureText(pt.t).width; });
    let cx = CANVAS_W - 220 + (200 - tw2) / 2;
    fParts.forEach(pt => {
      ctx.font = 'bold 15px JetBrains Mono, monospace';
      ctx.fillStyle = pt.c;
      ctx.textAlign = 'left';
      ctx.fillText(pt.t, cx, 46);
      cx += ctx.measureText(pt.t).width;
    });

    ctx.font = '12px Inter, sans-serif';
    ctx.fillStyle = '#5A5A72';
    ctx.textAlign = 'center';
    ctx.fillText('Drag handles to resize', CANVAS_W / 2, CANVAS_H - 20);
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
  }, [step, dims, accentColor]);

  useEffect(() => {
    let startTime: number | null = null;
    const duration = 2000 / speed;
    const animate = (ts: number) => {
      if (!startTime) startTime = ts;
      const p = Math.min((ts - startTime) / duration, 1);
      draw(p);
      if (p < 1 && isPlaying && step < 3) {
        animRef.current = requestAnimationFrame(animate);
      } else if (p >= 1) onStepComplete?.();
    };
    if (step === 3) { draw(1); }
    else if (isPlaying) { animRef.current = requestAnimationFrame(animate); }
    else { draw(0); }
    return () => cancelAnimationFrame(animRef.current);
  }, [step, isPlaying, speed, draw, onStepComplete]);

  useEffect(() => { if (step === 3) draw(1); }, [dims, step, draw]);

  const getPos = (e: React.MouseEvent) => {
    const r = canvasRef.current!.getBoundingClientRect();
    return { x: (e.clientX - r.left) * (CANVAS_W / r.width), y: (e.clientY - r.top) * (CANVAS_H / r.height) };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (step !== 3) return;
    const pos = getPos(e);
    const wHx = ORIGIN_X + getTotalW(), wHy = ORIGIN_Y + getTotalH() / 2;
    const hHx = ORIGIN_X + getTotalW() / 2, hHy = ORIGIN_Y + getTotalH();
    if (Math.hypot(pos.x - wHx, pos.y - wHy) < 18) { dragRef.current = { active: true, axis: 'w' }; setIsDragging(true); }
    else if (Math.hypot(pos.x - hHx, pos.y - hHy) < 18) { dragRef.current = { active: true, axis: 'h' }; setIsDragging(true); }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragRef.current.active) return;
    const pos = getPos(e);
    if (dragRef.current.axis === 'w') {
      const cols = clamp(Math.round((pos.x - ORIGIN_X) / TILE), 2, 8);
      setDims(prev => ({ ...prev, cols }));
    } else {
      const rows = clamp(Math.round((pos.y - ORIGIN_Y) / TILE), 1, 6);
      setDims(prev => ({ ...prev, rows }));
    }
  };

  const handleMouseUp = () => { dragRef.current = { active: false, axis: null }; setIsDragging(false); };

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_W}
      height={CANVAS_H}
      className={`w-full h-full rounded-xl ${isDragging ? 'cursor-grabbing' : step === 3 ? 'cursor-grab' : 'cursor-default'}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ display: 'block', background: BG }}
    />
  );
};

export default RectangleAnimation;
