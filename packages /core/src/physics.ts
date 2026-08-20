// Pure physics calculations - no DOM dependencies
// Shared between client engine and server analyzer

export interface Point {
  x: number;
  y: number;
  t: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
}

export interface Target {
  x: number;
  y: number;
  consumed: boolean;
  radius: number;
}

export const GRAVITY_RADIUS = 200;
export const EVENT_HORIZON = 15;
export const TARGET_RADIUS = 25;

export function calculateGravityForce(distance: number): number {
  if (distance >= GRAVITY_RADIUS || distance <= EVENT_HORIZON) return 0;
  return (GRAVITY_RADIUS - distance) / GRAVITY_RADIUS;
}

export function applyGravity(
  particle: Particle,
  dx: number,
  dy: number,
  distance: number
): void {
  const force = calculateGravityForce(distance);
  particle.vx += (dx / distance) * force * 0.5;
  particle.vy += (dy / distance) * force * 0.5;
}

export function applySpaghettification(particle: Particle, distance: number): void {
  if (distance < EVENT_HORIZON * 2.5) {
    particle.size = Math.min(particle.size * 1.03, 4);
  }
}

export function calculateAngularMomentum(path: Point[]): number {
  if (path.length < 3) return 0;
  let momentum = 0;
  for (let i = 2; i < path.length; i++) {
    const p1 = path[i - 2];
    const p2 = path[i - 1];
    const p3 = path[i];
    const v1x = p2.x - p1.x;
    const v1y = p2.y - p1.y;
    const v2x = p3.x - p2.x;
    const v2y = p3.y - p2.y;
    momentum += Math.abs(v1x * v2y - v1y * v2x);
  }
  return momentum / path.length;
}

export function calculateVelocityVariance(path: Point[]): number {
  if (path.length < 2) return 0;
  const velocities: number[] = [];
  for (let i = 1; i < path.length; i++) {
    const dx = path[i].x - path[i - 1].x;
    const dy = path[i].y - path[i - 1].y;
    const dt = path[i].t - path[i - 1].t;
    if (dt > 0) velocities.push(Math.hypot(dx, dy) / dt);
  }
  if (velocities.length === 0) return 0;
  const avg = velocities.reduce((a, b) => a + b, 0) / velocities.length;
  return velocities.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / velocities.length;
}
