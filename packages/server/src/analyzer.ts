import {
  TelemetryPayload,
  calculateAngularMomentum,
  calculateVelocityVariance,
  calculateMicroMovements,
  calculatePathComplexity,
  checkSpeedLimits,
  checkTemporalConsistency
} from '@ecliris/core';

export interface AnalysisResult {
  passed: boolean;
  score: number;
  reason: string;
  details: string[];
}

export function analyzeTelemetry(telemetry: TelemetryPayload): AnalysisResult {
  const { path, targetsConsumed } = telemetry;
  const details: string[] = [];
  let score = 0;

  if (targetsConsumed < 3) {
    return { passed: false, score: 0, reason: 'Not all targets consumed', details: [] };
  }

  if (path.length < 50) {
    return { passed: false, score: 0, reason: 'Insufficient movement data', details: [] };
  }

  // Security Check 1: Speed limits
  const speedCheck = checkSpeedLimits(path);
  if (!speedCheck.pass) {
    details.push('Speed: ' + speedCheck.reason);
  } else {
    score += 20;
    details.push('Speed: Normal ✓');
  }

  // Security Check 2: Temporal consistency
  const temporalCheck = checkTemporalConsistency(path);
  if (!temporalCheck.pass) {
    details.push('Temporal: ' + temporalCheck.reason);
  } else {
    score += 20;
    details.push('Temporal: Variance ' + (temporalCheck.variance || 0).toFixed(2) + ' ✓');
  }

  // Behavioral Check 1: Angular momentum
  const serverMomentum = calculateAngularMomentum(path);
  if (serverMomentum > 5) {
    score += 15;
    details.push('Angular momentum ✓');
  } else {
    details.push('Angular momentum: Low (' + serverMomentum.toFixed(2) + ')');
  }

  // Behavioral Check 2: Velocity variance
  const variance = calculateVelocityVariance(path);
  if (variance > 0.05) {
    score += 15;
    details.push('Velocity variance ✓');
  } else {
    details.push('Velocity variance: Low (' + variance.toFixed(4) + ')');
  }

  // Behavioral Check 3: Micro-movements
  const microMovements = calculateMicroMovements(path);
  if (microMovements > 0.3) {
    score += 15;
    details.push('Micro-movements ✓');
  } else {
    details.push('Micro-movements: Low (' + microMovements.toFixed(2) + ')');
  }

  // Behavioral Check 4: Path complexity
  const complexity = calculatePathComplexity(path);
  if (complexity > 0.5) {
    score += 15;
    details.push('Path complexity ✓');
  } else {
    details.push('Path complexity: Low (' + complexity.toFixed(2) + ')');
  }

  const passed = score >= 70;
  const reason = passed ? 'Human-like behavior detected' : 'Score too low: ' + score + '/100';

  return {
    passed,
    score,
    reason,
    details
  };
}
