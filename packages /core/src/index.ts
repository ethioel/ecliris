// Main entry point for @ecliris/core
// Exports all public APIs

export { EclirisEngine } from './engine';
export type { EclirisConfig, TelemetryPayload } from './engine';

export {
  calculateAngularMomentum,
  calculateVelocityVariance,
  applyGravity,
  applySpaghettification,
  GRAVITY_RADIUS,
  EVENT_HORIZON,
  TARGET_RADIUS
} from './physics';

export type { Point, Particle, Target } from './physics';
