export interface Point { x: number; y: number; t: number; }
export interface Particle { x: number; y: number; vx: number; vy: number; size: number; alpha: number; }
export interface Target { x: number; y: number; consumed: boolean; radius: number; }

export const GRAVITY_RADIUS = 200;
export const EVENT_HORIZON = 15;
export const TARGET_RADIUS = 25;

export function calculateGravityForce(distance: number): number {
  if (distance >= GRAVITY_RADIUS || distance <= EVENT_HORIZON) return 0;
  return (GRAVITY_RADIUS - distance) / GRAVITY_RADIUS;
}

export function applyGravity(p: Particle, dx: number, dy: number, dist: number): void {
  const force = calculateGravityForce(dist);
  p.vx += (dx / dist) * force * 0.5;
  p.vy += (dy / dist) * force * 0.5;
}

export function applySpaghettification(p: Particle, dist: number): void {
  if (dist < EVENT_HORIZON * 2.5) p.size = Math.min(p.size * 1.03, 4);
}

export function calculateAngularMomentum(path: Point[]): number {
  if (path.length < 3) return 0;
  let m = 0;
  for (let i = 2; i < path.length; i++) {
    const v1x = path[i-1].x - path[i-2].x, v1y = path[i-1].y - path[i-2].y;
    const v2x = path[i].x - path[i-1].x, v2y = path[i].y - path[i-1].y;
    m += Math.abs(v1x * v2y - v1y * v2x);
  }
  return m / path.length;
}

export function calculateVelocityVariance(path: Point[]): number {
  if (path.length < 2) return 0;
  const v: number[] = [];
  for (let i = 1; i < path.length; i++) {
    const dt = path[i].t - path[i-1].t;
    if (dt > 0) v.push(Math.hypot(path[i].x - path[i-1].x, path[i].y - path[i-1].y) / dt);
  }
  if (!v.length) return 0;
  const avg = v.reduce((a, b) => a + b, 0) / v.length;
  return v.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / v.length;
}

export function calculateMicroMovements(path: Point[]): number {
  if (path.length < 10) return 0;
  let c = 0;
  for (let i = 1; i < path.length; i++) {
    const d = Math.hypot(path[i].x - path[i-1].x, path[i].y - path[i-1].y);
    if (d > 0 && d < 2) c++;
  }
  return c / path.length;
}

export function calculatePathComplexity(path: Point[]): number {
  if (path.length < 3) return 0;
  let c = 0;
  for (let i = 2; i < path.length; i++) {
    const a1 = Math.atan2(path[i-1].y - path[i-2].y, path[i-1].x - path[i-2].x);
    const a2 = Math.atan2(path[i].y - path[i-1].y, path[i].x - path[i-1].x);
    let d = Math.abs(a2 - a1);
    if (d > Math.PI) d = 2 * Math.PI - d;
    c += d;
  }
  return c / path.length;
}

export function checkSpeedLimits(path: Point[]): { pass: boolean; reason: string } {
  const MAX_SPEED = 2;
  for (let i = 1; i < path.length; i++) {
    const dist = Math.hypot(path[i].x - path[i-1].x, path[i].y - path[i-1].y);
    const dt = path[i].t - path[i-1].t;
    if (dt === 0) continue;
    const speed = dist / dt;
    if (speed > MAX_SPEED) {
      return { pass: false, reason: 'Speed exceeded: ' + (speed * 1000).toFixed(0) + 'px/s' };
    }
  }
  return { pass: true, reason: 'Normal' };
}

export function checkTemporalConsistency(path: Point[]): { pass: boolean; reason: string; variance?: number } {
  if (path.length < 10) return { pass: false, reason: 'Insufficient data' };
  
  const intervals: number[] = [];
  for (let i = 1; i < path.length; i++) {
    intervals.push(path[i].t - path[i-1].t);
  }
  
  const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const variance = intervals.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / intervals.length;
  
  if (variance < 0.5) {
    return { pass: false, reason: 'Too consistent (variance: ' + variance.toFixed(2) + ')' };
  }
  
  return { pass: true, reason: 'Normal', variance: variance };
}