import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { analyzeTelemetry } from './analyzer';

const router: Router = Router();
const sessions = new Map<string, { createdAt: number; siteKey: string }>();
const SECRET = process.env.ECLIRIS_SECRET || 'dev-secret-change-me';

router.get('/v1/challenge', (req: Request, res: Response) => {
  const siteKey = req.query.siteKey as string;
  if (!siteKey) return res.status(400).json({ error: 'Missing siteKey' });

  const sessionId = crypto.randomUUID();
  sessions.set(sessionId, { createdAt: Date.now(), siteKey });

  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
  for (const [id, session] of sessions.entries()) {
    if (session.createdAt < fiveMinutesAgo) sessions.delete(id);
  }

  res.json({ sessionId, status: 'ready' });
});

router.post('/v1/verify', (req: Request, res: Response) => {
  const { siteKey, telemetry } = req.body;

  if (!siteKey || !telemetry) {
    return res.status(400).json({ error: 'Missing siteKey or telemetry' });
  }

  const analysis = analyzeTelemetry(telemetry);

  if (!analysis.passed) {
    return res.status(403).json({
      success: false,
      error: analysis.reason,
      score: analysis.score
    });
  }

  const token = crypto
    .createHmac('sha256', SECRET)
    .update(`${siteKey}-${Date.now()}-${analysis.score}`)
    .digest('hex');

  res.json({ success: true, token, score: analysis.score });
});

export default router;
