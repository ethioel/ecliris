import {
  TelemetryPayload,
  calculateAngularMomentum,
  calculateVelocityVariance
} from '@ecliris/core';

export interface AnalysisResult {
  passed: boolean;
  score: number;
  reason: string;
}

export function analyzeTelemetry(telemetry: TelemetryPayload): AnalysisResult {
  const { path, angularMomentum, targetsConsumed } = telemetry;

  if (targetsConsumed < 3) {
    return { passed: false, score: 0, reason: 'Not all targets consumed' };
  }

  if (path.length < 50) {
    return { passed: false, score: 0, reason: 'Insufficient movement data' };
  }

  const serverMomentum = calculateAngularMomentum(path);
  const variance = calculateVelocityVariance(path);

  if (serverMomentum < 5) {
    return {
      passed: false,
      score: serverMomentum,
      reason: 'Low angular momentum (linear movement detected)'
    };
  }

  if (variance < 0.01) {
    return {
      passed: false,
      score: variance,
      reason: 'Constant velocity (robotic movement)'
    };
  }

  const momentumDelta = Math.abs(serverMomentum - angularMomentum);
  if (momentumDelta > serverMomentum * 0.5) {
    return {
      passed: false,
      score: 0,
      reason: 'Telemetry tampering detected'
    };
  }

  return {
    passed: true,
    score: serverMomentum,
    reason: 'Human-like gravitational interaction'
  };
}
