// ============================================================
// animations/TriangleAnimation.tsx
// Interactive animation for deriving Area = ½ × base × height
// Steps: Rectangle → Diagonal → Triangle isolation → Formula
// ============================================================

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { clearCanvas, drawText, drawLabel, drawDimension, drawRightAngle, hitTest, Point } from '../utils/canvasUtils';
import { easing, lerp, clamp } from '../engine/animationEngine';

interface TriangleAnimationProps {
  step: number;
  speed: number;
  isPlaying: boolean;
  accentColor: string;
  onStepComplete?: () => void;
}

interface DragState {
  active: boolean;
  vertex: 'A' | 'B' | 'C' | null;
}

const TriangleAnimation: React.FC<TriangleAnimationProps> = ({
  step,
  speed,
  isPlaying,
  accentColor,
  onStepComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const progressRef = useRef(0);
  const dragRef = useRef<DragState>({ active: false, vertex: null });
  const [isDragging, setIsDragging] = useState(false);

  // Triangle vertices (step 5: draggable)
  const [vertices, setVertices] = useState({
    A: { x: 140, y: 320 },  // bottom-left
    B: { x: 460, y: 320 },  // bottom-right
    C: { x: 260, y: 140 },  // top
  });

  const CANVAS_W = 600;
  const CANVAS_H = 460;
  const BG = '#0D0D14';

  const RECT_X = 120, RECT_Y = 120, RECT_W = 360, RECT_H = 200;
  const RECT_BASE = RECT_X + RECT_W;
  const RECT_BOTTOM = RECT_Y + RECT_H;

  const drawStep1 = useCallback((ctx: CanvasRenderingContext2D, p: number) => {
    clearCanvas(ctx, CANVAS_W, CANVAS_H, BG);
    const t = easing.easeOut(Math.min(p * 2, 1));
    const t2 = easing.easeOut(Math.max((p - 0.5) * 2, 0));

    // Rectangle
    const w = lerp(0, RECT_W, t);
    ctx.fillStyle = accentColor + '18';
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 2.5;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.rect(RECT_X, RECT_Y, w, RECT_H);
    ctx.fill();
    ctx.stroke();

    // Base label
    if (t > 0.6) {
      drawDimension(ctx, { x: RECT_X, y: RECT_BOTTOM + 30 }, { x: RECT_X + w, y: RECT_BOTTOM + 30 }, 'Base (b)', accentColor, t2);
    }
    // Height label
    if (t > 0.8) {
      drawDimension(ctx, { x: RECT_BASE + 30, y: RECT_Y }, { x: RECT_BASE + 30, y: RECT_BOTTOM }, 'Height (h)', '#00D4AA', t2);
    }
    // Formula
    if (t2 > 0.5) {
      drawLabel(ctx, 'Rectangle: Base × Height', CANVAS_W / 2, CANVAS_H - 40, accentColor, (t2 - 0.5) * 2);
    }
  }, [accentColor]);

  const drawStep2 = useCallback((ctx: CanvasRenderingContext2D, p: number) => {
    clearCanvas(ctx, CANVAS_W, CANVAS_H, BG);

    // Full rectangle always visible
    ctx.fillStyle = accentColor + '18';
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 2.5;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.rect(RECT_X, RECT_Y, RECT_W, RECT_H);
    ctx.fill();
    ctx.stroke();

    // Animated diagonal
    const t = easing.easeInOut(p);
    const diagX = lerp(RECT_X, RECT_BASE, t);
    const diagY = lerp(RECT_BOTTOM, RECT_Y, t);

    ctx.strokeStyle = '#F5A623';
    ctx.lineWidth = 3;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(RECT_X, RECT_BOTTOM);
    ctx.lineTo(diagX, diagY);
    ctx.stroke();

    // Triangle highlight after diagonal drawn
    if (p > 0.7) {
      const alpha = easing.easeOut((p - 0.7) / 0.3);
      // Upper triangle
      ctx.fillStyle = '#F5A623' + Math.round(alpha * 30).toString(16).padStart(2, '0');
      ctx.beginPath();
      ctx.moveTo(RECT_X, RECT_Y);
      ctx.lineTo(RECT_BASE, RECT_Y);
      ctx.lineTo(RECT_BASE, RECT_BOTTOM);
      ctx.closePath();
      ctx.fill();
      // Lower triangle
      ctx.fillStyle = accentColor + Math.round(alpha * 30).toString(16).padStart(2, '0');
      ctx.beginPath();
      ctx.moveTo(RECT_X, RECT_Y);
      ctx.lineTo(RECT_X, RECT_BOTTOM);
      ctx.lineTo(RECT_BASE, RECT_BOTTOM);
      ctx.closePath();
      ctx.fill();

      drawLabel(ctx, 'Two equal triangles!', CANVAS_W / 2, CANVAS_H - 40, '#F5A623', alpha);
    }
  }, [accentColor]);

  const drawStep3 = useCallback((ctx: CanvasRenderingContext2D, p: number) => {
    clearCanvas(ctx, CANVAS_W, CANVAS_H, BG);

    // Fade upper triangle
    const fadeAlpha = easing.easeOut(Math.min(1 - p * 1.5, 1));
    const highlightAlpha = easing.easeOut(Math.min(p * 1.5, 1));

    // Upper triangle (fading)
    ctx.fillStyle = `rgba(245, 166, 35, ${0.25 * fadeAlpha})`;
    ctx.strokeStyle = `rgba(245, 166, 35, ${fadeAlpha})`;
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(RECT_X, RECT_Y);
    ctx.lineTo(RECT_BASE, RECT_Y);
    ctx.lineTo(RECT_BASE, RECT_BOTTOM);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.setLineDash([]);

    // Lower triangle (highlighting)
    ctx.fillStyle = `rgba(79, 142, 247, ${0.4 * highlightAlpha})`;
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 2.5;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(RECT_X, RECT_Y);
    ctx.lineTo(RECT_X, RECT_BOTTOM);
    ctx.lineTo(RECT_BASE, RECT_BOTTOM);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Right angle marker
    if (highlightAlpha > 0.5) {
      drawRightAngle(ctx, { x: RECT_X, y: RECT_BOTTOM }, { x: RECT_X + 20, y: RECT_BOTTOM }, { x: RECT_X, y: RECT_BOTTOM - 20 }, accentColor, 14);
    }

    // Label
    if (highlightAlpha > 0.4) {
      drawLabel(ctx, 'Triangle = ½ of Rectangle', CANVAS_W / 2, CANVAS_H - 40, accentColor, (highlightAlpha - 0.4) / 0.6);
    }
  }, [accentColor]);

  const drawStep4 = useCallback((ctx: CanvasRenderingContext2D, p: number) => {
    clearCanvas(ctx, CANVAS_W, CANVAS_H, BG);

    // Static triangle
    ctx.fillStyle = accentColor + '30';
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 2.5;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(RECT_X, RECT_Y);
    ctx.lineTo(RECT_X, RECT_BOTTOM);
    ctx.lineTo(RECT_BASE, RECT_BOTTOM);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Right angle
    drawRightAngle(ctx, { x: RECT_X, y: RECT_BOTTOM }, { x: RECT_X + 20, y: RECT_BOTTOM }, { x: RECT_X, y: RECT_BOTTOM - 20 }, accentColor, 14);

    // Dimensions
    drawDimension(ctx, { x: RECT_X, y: RECT_BOTTOM + 30 }, { x: RECT_BASE, y: RECT_BOTTOM + 30 }, 'Base (b)', accentColor, 1);
    drawDimension(ctx, { x: RECT_X - 40, y: RECT_Y }, { x: RECT_X - 40, y: RECT_BOTTOM }, 'Height (h)', '#00D4AA', 1);

    // Formula animation - build character by character
    const formulaParts = ['Area', ' = ', '½', ' × ', 'b', ' × ', 'h'];
    const colors = [accentColor, '#9090A8', '#F5A623', '#9090A8', accentColor, '#9090A8', '#00D4AA'];
    const totalChars = formulaParts.join('').length;
    const charsToShow = Math.floor(p * totalChars * 1.2);

    let drawn = 0;
    const fx = 210, fy = 50;
    ctx.font = 'bold 28px JetBrains Mono, monospace';
    ctx.textBaseline = 'middle';

    let xOff = 0;
    for (let i = 0; i < formulaParts.length; i++) {
      const part = formulaParts[i];
      if (drawn >= charsToShow) break;
      const chars = Math.min(part.length, charsToShow - drawn);
      const text = part.slice(0, chars);
      ctx.fillStyle = colors[i];
      ctx.textAlign = 'left';
      ctx.fillText(text, fx + xOff, fy);
      xOff += ctx.measureText(part).width;
      drawn += part.length;
    }

    if (p > 0.9) {
      const pulse = 0.7 + 0.3 * Math.sin(Date.now() / 400);
      drawLabel(ctx, '✓ Formula discovered!', CANVAS_W / 2, CANVAS_H - 40, '#00D4AA', pulse);
    }
  }, [accentColor]);

  const drawStep5 = useCallback((ctx: CanvasRenderingContext2D, _p: number) => {
    clearCanvas(ctx, CANVAS_W, CANVAS_H, BG);

    const { A, B, C } = vertices;

    // Calculate base and height
    const base = Math.abs(B.x - A.x);
    const heightVal = Math.abs(A.y - C.y);
    const area = (0.5 * base * heightVal).toFixed(1);

    // Fill triangle
    ctx.fillStyle = accentColor + '28';
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 2.5;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(A.x, A.y);
    ctx.lineTo(B.x, B.y);
    ctx.lineTo(C.x, C.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Height dashed line
    const footX = C.x;
    const footY = A.y;
    ctx.strokeStyle = '#00D4AA' + '80';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(C.x, C.y);
    ctx.lineTo(footX, footY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Dimensions
    drawDimension(ctx, A, { x: footX, y: footY }, '', '#00D4AA', 0.7, 0);
    drawDimension(ctx, { x: A.x, y: A.y + 35 }, { x: B.x, y: B.y + 35 }, `b = ${base.toFixed(0)}`, accentColor, 1);

    // Vertex handles
    const handles = [A, B, C];
    const names = ['A', 'B', 'C'];
    handles.forEach((pt, i) => {
      ctx.fillStyle = accentColor;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#EEEEF2';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(names[i], pt.x, pt.y);
    });

    // Height label near midpoint
    drawLabel(ctx, `h = ${heightVal.toFixed(0)}`, C.x + 45, (C.y + A.y) / 2, '#00D4AA');

    // Formula box
    const fw = 260, fh = 56;
    const fx = CANVAS_W / 2 - fw / 2, fy = 20;
    ctx.fillStyle = accentColor + '15';
    ctx.strokeStyle = accentColor + '60';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(fx, fy, fw, fh, 10);
    ctx.fill();
    ctx.stroke();

    ctx.font = 'bold 20px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // Parts with color
    const parts = [
      { text: 'A', color: accentColor },
      { text: ' = ½ × ', color: '#9090A8' },
      { text: `${base.toFixed(0)}`, color: accentColor },
      { text: ' × ', color: '#9090A8' },
      { text: `${heightVal.toFixed(0)}`, color: '#00D4AA' },
      { text: ` = `, color: '#9090A8' },
      { text: `${area}`, color: '#F5A623' },
    ];
    let totalWidth = 0;
    parts.forEach(pt => {
      ctx.font = 'bold 18px JetBrains Mono, monospace';
      totalWidth += ctx.measureText(pt.text).width;
    });
    let cx = CANVAS_W / 2 - totalWidth / 2;
    parts.forEach(pt => {
      ctx.font = 'bold 18px JetBrains Mono, monospace';
      ctx.fillStyle = pt.color;
      ctx.textAlign = 'left';
      ctx.fillText(pt.text, cx, fy + fh / 2);
      cx += ctx.measureText(pt.text).width;
    });

    // Drag hint
    ctx.font = '12px Inter, sans-serif';
    ctx.fillStyle = '#5A5A72';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Drag vertices A, B, C to explore', CANVAS_W / 2, CANVAS_H - 20);
  }, [vertices, accentColor]);

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
  }, [step, drawStep1, drawStep2, drawStep3, drawStep4, drawStep5]);

  // Animation loop
  useEffect(() => {
    progressRef.current = 0;
    let startTime: number | null = null;
    const duration = 2000 / speed;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const p = Math.min(elapsed / duration, 1);
      progressRef.current = p;
      draw(p);

      if (p < 1 && isPlaying && step < 4) {
        animRef.current = requestAnimationFrame(animate);
      } else if (p >= 1) {
        onStepComplete?.();
      }
    };

    if (isPlaying || step === 4) {
      if (step === 4) {
        draw(1);
      } else {
        animRef.current = requestAnimationFrame(animate);
      }
    } else {
      draw(0);
    }

    return () => cancelAnimationFrame(animRef.current);
  }, [step, isPlaying, speed, draw, onStepComplete]);

  // Step 5 drag handlers
  const getCanvasPos = (e: React.MouseEvent): Point => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_W / rect.width;
    const scaleY = CANVAS_H / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (step !== 4) return;
    const pos = getCanvasPos(e);
    const verts = vertices;
    for (const key of ['A', 'B', 'C'] as const) {
      if (hitTest(pos, verts[key], 18)) {
        dragRef.current = { active: true, vertex: key };
        setIsDragging(true);
        break;
      }
    }
  }, [step, vertices]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragRef.current.active || !dragRef.current.vertex) return;
    const pos = getCanvasPos(e);
    const v = dragRef.current.vertex;

    setVertices(prev => {
      const next = { ...prev };
      if (v === 'A') {
        next.A = { x: clamp(pos.x, 60, 300), y: clamp(pos.y, 200, 420) };
        next.B = { ...next.B, y: next.A.y };
      } else if (v === 'B') {
        next.B = { x: clamp(pos.x, next.A.x + 80, 540), y: next.A.y };
      } else {
        next.C = { x: clamp(pos.x, 60, 540), y: clamp(pos.y, 60, next.A.y - 60) };
      }
      return next;
    });
  }, []);

  const handleMouseUp = useCallback(() => {
    dragRef.current = { active: false, vertex: null };
    setIsDragging(false);
  }, []);

  // Re-draw when vertices change (step 5)
  useEffect(() => {
    if (step === 4) draw(1);
  }, [vertices, step, draw]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_W}
      height={CANVAS_H}
      className={`w-full h-full rounded-xl ${isDragging ? 'cursor-grabbing' : step === 4 ? 'cursor-grab' : 'cursor-default'}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ display: 'block', background: BG }}
    />
  );
};

export default TriangleAnimation;
