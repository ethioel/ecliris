export { EclirisEngine } from './engine';
export type { EclirisConfig, TelemetryPayload } from './engine';

export {
  calculateAngularMomentum,
  calculateVelocityVariance,
  calculateMicroMovements,
  calculatePathComplexity,
  checkSpeedLimits,
  checkTemporalConsistency,
  applyGravity,
  applySpaghettification,
  GRAVITY_RADIUS,
  EVENT_HORIZON,
  TARGET_RADIUS
} from './physics';

export type { Point, Particle, Target } from './physics';