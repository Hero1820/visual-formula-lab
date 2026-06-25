// ============================================================
// utils/canvasUtils.ts
// Reusable canvas drawing primitives used across all animations.
// ============================================================

export interface Point {
  x: number;
  y: number;
}

export interface DrawTextOptions {
  color?: string;
  fontSize?: number;
  fontWeight?: string;
  fontFamily?: string;
  textAlign?: CanvasTextAlign;
  textBaseline?: CanvasTextBaseline;
  alpha?: number;
}

/**
 * Draw styled text on canvas
 */
export const drawText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  options: DrawTextOptions = {},
) => {
  const {
    color = '#EEEEF2',
    fontSize = 14,
    fontWeight = '500',
    fontFamily = 'Inter, system-ui, sans-serif',
    textAlign = 'center',
    textBaseline = 'middle',
    alpha = 1,
  } = options;

  const prevAlpha = ctx.globalAlpha;
  ctx.globalAlpha = alpha;
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  ctx.fillStyle = color;
  ctx.textAlign = textAlign;
  ctx.textBaseline = textBaseline;
  ctx.fillText(text, x, y);
  ctx.globalAlpha = prevAlpha;
};

/**
 * Draw a label with a pill background
 */
export const drawLabel = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  accentColor: string,
  alpha = 1,
) => {
  const prevAlpha = ctx.globalAlpha;
  ctx.globalAlpha = alpha;

  ctx.font = '600 13px Inter, system-ui, sans-serif';
  const width = ctx.measureText(text).width + 20;
  const height = 26;

  // Pill background
  ctx.fillStyle = accentColor + '30';
  ctx.strokeStyle = accentColor + '80';
  ctx.lineWidth = 1;
  roundRect(ctx, x - width / 2, y - height / 2, width, height, 6);
  ctx.fill();
  ctx.stroke();

  // Text
  ctx.fillStyle = accentColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);

  ctx.globalAlpha = prevAlpha;
};

/**
 * Draw a rounded rectangle path
 */
export const roundRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) => {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
};

/**
 * Draw a dashed line between two points
 */
export const drawDashedLine = (
  ctx: CanvasRenderingContext2D,
  from: Point,
  to: Point,
  color: string,
  dashPattern: number[] = [6, 4],
  alpha = 1,
) => {
  const prevAlpha = ctx.globalAlpha;
  ctx.globalAlpha = alpha;
  ctx.setLineDash(dashPattern);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.globalAlpha = prevAlpha;
};

/**
 * Draw a dimension arrow line with arrowheads
 */
export const drawDimension = (
  ctx: CanvasRenderingContext2D,
  from: Point,
  to: Point,
  label: string,
  color: string,
  alpha = 1,
  offset = 0,
) => {
  const prevAlpha = ctx.globalAlpha;
  ctx.globalAlpha = alpha;

  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  if (length < 1) return;

  const nx = -dy / length * offset;
  const ny = dx / length * offset;

  const fx = from.x + nx, fy = from.y + ny;
  const tx = to.x + nx, ty = to.y + ny;

  // Line
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(fx, fy);
  ctx.lineTo(tx, ty);
  ctx.stroke();

  // Arrowheads
  const arrowSize = 8;
  const angle = Math.atan2(dy, dx);

  const drawArrow = (x: number, y: number, ang: number) => {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(
      x - arrowSize * Math.cos(ang - Math.PI / 6),
      y - arrowSize * Math.sin(ang - Math.PI / 6),
    );
    ctx.moveTo(x, y);
    ctx.lineTo(
      x - arrowSize * Math.cos(ang + Math.PI / 6),
      y - arrowSize * Math.sin(ang + Math.PI / 6),
    );
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  };

  drawArrow(tx, ty, angle);
  drawArrow(fx, fy, angle + Math.PI);

  // Label at midpoint
  const mx = (fx + tx) / 2;
  const my = (fy + ty) / 2;
  const perp = Math.atan2(dy, dx) + Math.PI / 2;
  const lx = mx + Math.cos(perp) * 14;
  const ly = my + Math.sin(perp) * 14;

  ctx.font = '600 13px Inter, system-ui, sans-serif';
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, lx, ly);

  ctx.globalAlpha = prevAlpha;
};

/**
 * Draw a right angle marker
 */
export const drawRightAngle = (
  ctx: CanvasRenderingContext2D,
  vertex: Point,
  p1: Point,
  p2: Point,
  color: string,
  size = 12,
) => {
  const v1x = p1.x - vertex.x, v1y = p1.y - vertex.y;
  const v2x = p2.x - vertex.x, v2y = p2.y - vertex.y;
  const len1 = Math.sqrt(v1x * v1x + v1y * v1y);
  const len2 = Math.sqrt(v2x * v2x + v2y * v2y);

  const u1x = v1x / len1 * size, u1y = v1y / len1 * size;
  const u2x = v2x / len2 * size, u2y = v2y / len2 * size;

  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(vertex.x + u1x, vertex.y + u1y);
  ctx.lineTo(vertex.x + u1x + u2x, vertex.y + u1y + u2y);
  ctx.lineTo(vertex.x + u2x, vertex.y + u2y);
  ctx.stroke();
};

/**
 * Clear canvas with background color
 */
export const clearCanvas = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  bg = '#0A0A0F',
) => {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);
};

/**
 * Distance between two points
 */
export const distance = (a: Point, b: Point) =>
  Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);

/**
 * Check if a point is within radius of another
 */
export const hitTest = (point: Point, target: Point, radius = 12) =>
  distance(point, target) <= radius;
