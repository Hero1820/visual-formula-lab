// ============================================================
// animations/PythagorasAnimation.tsx
// Visual proof: squares on sides, a² + b² = c²
// ============================================================

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { clearCanvas, drawText, drawLabel, hitTest, Point, roundRect } from '../utils/canvasUtils';
import { easing, lerp, clamp } from '../engine/animationEngine';

interface PythagorasAnimationProps {
  step: number;
  speed: number;
  isPlaying: boolean;
  accentColor: string;
  onStepComplete?: () => void;
}

const PythagorasAnimation: React.FC<PythagorasAnimationProps> = ({
  step,
  speed,
  isPlaying,
  accentColor,
  onStepComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const dragRef = useRef<{ active: boolean; vertex: 'A' | 'B' | null }>({ active: false, vertex: null });
  const [isDragging, setIsDragging] = useState(false);

  const CANVAS_W = 600;
  const CANVAS_H = 460;
  const BG = '#0D0D14';

  // Right angle always at C (bottom-right for cleanliness)
  const [verts, setVerts] = useState({
    right: { x: 380, y: 340 }, // right angle vertex
    A: { x: 180, y: 340 },     // left (leg a)
    B: { x: 380, y: 160 },     // top (leg b)
  });

  const getSides = useCallback(() => {
    const { right, A, B } = verts;
    const a = Math.hypot(right.x - A.x, right.y - A.y);
    const b = Math.hypot(right.x - B.x, right.y - B.y);
    const c = Math.hypot(A.x - B.x, A.y - B.y);
    return { a, b, c };
  }, [verts]);

  /** Draw a square extruded from a segment outward from the triangle */
  const drawSquare = (
    ctx: CanvasRenderingContext2D,
    p1: Point,
    p2: Point,
    color: string,
    alpha: number,
    label?: string,
  ) => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    // Perpendicular direction (pointing outward)
    const len = Math.hypot(dx, dy);
    const nx = -dy / len * len;
    const ny = dx / len * len;

    const corners = [
      p1,
      p2,
      { x: p2.x + nx, y: p2.y + ny },
      { x: p1.x + nx, y: p1.y + ny },
    ];

    const prevAlpha = ctx.globalAlpha;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color + '25';
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(corners[0].x, corners[0].y);
    corners.forEach(c => ctx.lineTo(c.x, c.y));
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Area label at center
    if (label) {
      const cx = (corners[0].x + corners[1].x + corners[2].x + corners[3].x) / 4;
      const cy = (corners[0].y + corners[1].y + corners[2].y + corners[3].y) / 4;
      ctx.font = 'bold 15px JetBrains Mono, monospace';
      ctx.fillStyle = color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, cx, cy);
    }

    ctx.globalAlpha = prevAlpha;
  };

  const drawTriangle = (ctx: CanvasRenderingContext2D, alpha = 1) => {
    const { right, A, B } = verts;
    const prevAlpha = ctx.globalAlpha;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = accentColor + '20';
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 2.5;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(A.x, A.y);
    ctx.lineTo(right.x, right.y);
    ctx.lineTo(B.x, B.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Right angle marker
    const size = 16;
    const vAx = A.x - right.x, vAy = A.y - right.y;
    const vBx = B.x - right.x, vBy = B.y - right.y;
    const lA = Math.hypot(vAx, vAy);
    const lB = Math.hypot(vBx, vBy);
    const u1x = vAx / lA * size, u1y = vAy / lA * size;
    const u2x = vBx / lB * size, u2y = vBy / lB * size;
    ctx.strokeStyle = '#9090A8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(right.x + u1x, right.y + u1y);
    ctx.lineTo(right.x + u1x + u2x, right.y + u1y + u2y);
    ctx.lineTo(right.x + u2x, right.y + u2y);
    ctx.stroke();

    ctx.globalAlpha = prevAlpha;
  };

  const drawStep1 = (ctx: CanvasRenderingContext2D, p: number) => {
    clearCanvas(ctx, CANVAS_W, CANVAS_H, BG);
    const t = easing.easeOut(p);
    const { right, A, B } = verts;

    // Triangle grows in
    ctx.globalAlpha = t;
    drawTriangle(ctx, t);

    // Labels
    if (t > 0.5) {
      const la = t > 0.7 ? (t - 0.7) / 0.3 : 0;
      const { a, b, c } = getSides();
      drawLabel(ctx, `a = ${a.toFixed(0)}`, (right.x + A.x) / 2, (right.y + A.y) / 2 + 20, '#00D4AA', la);
      drawLabel(ctx, `b = ${b.toFixed(0)}`, (right.x + B.x) / 2 + 40, (right.y + B.y) / 2, accentColor, la);
      drawLabel(ctx, `c = ${c.toFixed(0)}`, (A.x + B.x) / 2 - 40, (A.y + B.y) / 2, '#F5A623', la);
    }
    ctx.globalAlpha = 1;
  };

  const drawStep2 = (ctx: CanvasRenderingContext2D, p: number) => {
    clearCanvas(ctx, CANVAS_W, CANVAS_H, BG);
    drawTriangle(ctx);

    const { right, A, B } = verts;
    const { a, b, c } = getSides();
    const squareAlpha = easing.easeOut(p);
    const t1 = Math.min(p * 3, 1);
    const t2 = Math.min(Math.max((p - 0.33) * 3, 0), 1);
    const t3 = Math.min(Math.max((p - 0.66) * 3, 0), 1);

    // Square on side a (right → A)
    drawSquare(ctx, right, A, '#00D4AA', easing.easeOut(t1) * 0.9, t1 > 0.8 ? `a² = ${(a * a).toFixed(0)}` : undefined);
    // Square on side b (B → right)
    drawSquare(ctx, B, right, accentColor, easing.easeOut(t2) * 0.9, t2 > 0.8 ? `b² = ${(b * b).toFixed(0)}` : undefined);
    // Square on hypotenuse c (A → B)
    drawSquare(ctx, A, B, '#F5A623', easing.easeOut(t3) * 0.9, t3 > 0.8 ? `c² = ${(c * c).toFixed(0)}` : undefined);
  };

  const drawStep3 = (ctx: CanvasRenderingContext2D, p: number) => {
    clearCanvas(ctx, CANVAS_W, CANVAS_H, BG);
    const { right, A, B } = verts;
    const { a, b, c } = getSides();

    drawTriangle(ctx);
    drawSquare(ctx, right, A, '#00D4AA', 0.9, `a²=${(a * a).toFixed(0)}`);
    drawSquare(ctx, B, right, accentColor, 0.9, `b²=${(b * b).toFixed(0)}`);
    drawSquare(ctx, A, B, '#F5A623', 0.9, `c²=${(c * c).toFixed(0)}`);

    // Formula reveal
    const t = easing.easeOut(p);
    const fy = 40;
    if (t > 0.3) {
      const ft = (t - 0.3) / 0.7;
      // Background box
      ctx.fillStyle = '#1E1E2A';
      ctx.strokeStyle = '#2A2A3C';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(CANVAS_W / 2 - 140, fy - 24, 280, 48, 10);
      ctx.fill();
      ctx.stroke();

      // Formula
      const parts = [
        { t: 'a²', c: '#00D4AA' }, { t: ' + ', c: '#9090A8' },
        { t: 'b²', c: accentColor }, { t: ' = ', c: '#9090A8' },
        { t: 'c²', c: '#F5A623' },
      ];
      ctx.globalAlpha = ft;
      ctx.font = 'bold 24px JetBrains Mono, monospace';
      ctx.textBaseline = 'middle';
      let tw = 0;
      parts.forEach(pt => { ctx.font = 'bold 24px JetBrains Mono, monospace'; tw += ctx.measureText(pt.t).width; });
      let cx = CANVAS_W / 2 - tw / 2;
      parts.forEach(pt => {
        ctx.font = 'bold 24px JetBrains Mono, monospace';
        ctx.fillStyle = pt.c;
        ctx.textAlign = 'left';
        ctx.fillText(pt.t, cx, fy);
        cx += ctx.measureText(pt.t).width;
      });
      ctx.globalAlpha = 1;

      // Verification
      if (ft > 0.8) {
        const areaSum = a * a + b * b;
        const cSq = c * c;
        const check = Math.abs(areaSum - cSq) < 5 ? '✓ Verified!' : `${areaSum.toFixed(0)} ≈ ${cSq.toFixed(0)}`;
        drawLabel(ctx, check, CANVAS_W / 2, CANVAS_H - 40, '#00D4AA', (ft - 0.8) / 0.2);
      }
    }
  };

  const drawStep4 = (ctx: CanvasRenderingContext2D, _p: number) => {
    clearCanvas(ctx, CANVAS_W, CANVAS_H, BG);
    const { right, A, B } = verts;
    const { a, b, c } = getSides();

    drawTriangle(ctx);
    drawSquare(ctx, right, A, '#00D4AA', 0.9, `a²=${(a * a).toFixed(0)}`);
    drawSquare(ctx, B, right, accentColor, 0.9, `b²=${(b * b).toFixed(0)}`);
    drawSquare(ctx, A, B, '#F5A623', 0.9, `c²=${(c * c).toFixed(0)}`);

    // Draggable handles
    [{ pt: A, label: 'A', key: 'A' }, { pt: B, label: 'B', key: 'B' }].forEach(({ pt, label }) => {
      ctx.fillStyle = '#F5A623';
      ctx.strokeStyle = '#0D0D14';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#0D0D14';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, pt.x, pt.y);
    });

    // Formula
    const areaSum = (a * a + b * b).toFixed(0);
    const cSq = (c * c).toFixed(0);
    ctx.fillStyle = '#1E1E2A';
    ctx.strokeStyle = '#2A2A3C';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(CANVAS_W / 2 - 160, 15, 320, 44, 10);
    ctx.fill();
    ctx.stroke();
    ctx.font = 'bold 17px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#9090A8';
    ctx.fillText(`${(a * a).toFixed(0)} + ${(b * b).toFixed(0)} = ${areaSum} ≈ ${cSq}`, CANVAS_W / 2, 37);

    ctx.font = '12px Inter, sans-serif';
    ctx.fillStyle = '#5A5A72';
    ctx.fillText('Drag A or B to explore', CANVAS_W / 2, CANVAS_H - 20);
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
  }, [step, verts, accentColor, getSides]);

  useEffect(() => {
    let startTime: number | null = null;
    const duration = 2200 / speed;
    const animate = (ts: number) => {
      if (!startTime) startTime = ts;
      const p = Math.min((ts - startTime) / duration, 1);
      draw(p);
      if (p < 1 && isPlaying && step < 3) {
        animRef.current = requestAnimationFrame(animate);
      } else if (p >= 1) {
        onStepComplete?.();
      }
    };
    if (step === 3) {
      draw(1);
    } else if (isPlaying) {
      animRef.current = requestAnimationFrame(animate);
    } else {
      draw(0);
    }
    return () => cancelAnimationFrame(animRef.current);
  }, [step, isPlaying, speed, draw, onStepComplete]);

  useEffect(() => {
    if (step === 3) draw(1);
  }, [verts, step, draw]);

  const getPos = (e: React.MouseEvent): Point => {
    const r = canvasRef.current!.getBoundingClientRect();
    return {
      x: (e.clientX - r.left) * (CANVAS_W / r.width),
      y: (e.clientY - r.top) * (CANVAS_H / r.height),
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (step !== 3) return;
    const pos = getPos(e);
    if (hitTest(pos, verts.A, 18)) { dragRef.current = { active: true, vertex: 'A' }; setIsDragging(true); }
    else if (hitTest(pos, verts.B, 18)) { dragRef.current = { active: true, vertex: 'B' }; setIsDragging(true); }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragRef.current.active) return;
    const pos = getPos(e);
    const v = dragRef.current.vertex;
    setVerts(prev => {
      const next = { ...prev };
      if (v === 'A') {
        next.A = { x: clamp(pos.x, 60, prev.right.x - 60), y: clamp(pos.y, prev.right.y - 30, prev.right.y + 30) };
        next.A.y = prev.right.y;
      } else if (v === 'B') {
        next.B = { x: clamp(pos.x, prev.right.x - 30, prev.right.x + 30), y: clamp(pos.y, 60, prev.right.y - 60) };
        next.B.x = prev.right.x;
      }
      return next;
    });
  };

  const handleMouseUp = () => {
    dragRef.current = { active: false, vertex: null };
    setIsDragging(false);
  };

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

export default PythagorasAnimation;
