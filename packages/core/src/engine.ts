import {
  Particle,
  Target,
  Point,
  GRAVITY_RADIUS,
  EVENT_HORIZON,
  TARGET_RADIUS,
  applyGravity,
  applySpaghettification,
  calculateAngularMomentum
} from './physics';

export interface EclirisConfig {
  container: HTMLElement;
  onTargetConsumed: (count: number) => void;
  onComplete: (telemetry: TelemetryPayload) => void;
}

export interface TelemetryPayload {
  path: Point[];
  angularMomentum: number;
  targetsConsumed: number;
}

export class EclirisEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private targets: Target[] = [];
  private mouse = { x: 0, y: 0, active: false };
  private pathData: Point[] = [];
  private config: EclirisConfig;
  private animationId: number | null = null;
  private resizeHandler: () => void;

  constructor(config: EclirisConfig) {
    this.config = config;
    this.canvas = document.createElement('canvas');
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.cursor = 'none';
    config.container.appendChild(this.canvas);

    this.ctx = this.canvas.getContext('2d')!;
    this.resizeHandler = () => this.resize();

    this.resize();
    this.initUniverse();
    this.bindEvents();
    this.animate();
  }

  private resize(): void {
    const rect = this.config.container.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
  }

  private initUniverse(): void {
    this.particles = [];
    for (let i = 0; i < 600; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: 0,
        vy: 0,
        size: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.6 + 0.2
      });
    }

    this.targets = [];
    for (let i = 0; i < 3; i++) {
      this.targets.push({
        x: Math.random() * (this.canvas.width - 100) + 50,
        y: Math.random() * (this.canvas.height - 100) + 50,
        consumed: false,
        radius: TARGET_RADIUS
      });
    }
  }

  private bindEvents(): void {
    window.addEventListener('resize', this.resizeHandler);

    this.canvas.addEventListener('mousemove', (e: MouseEvent) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
      this.mouse.active = true;

      this.pathData.push({
        x: this.mouse.x,
        y: this.mouse.y,
        t: performance.now()
      });
      if (this.pathData.length > 300) this.pathData.shift();
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.mouse.active = false;
    });
  }

  private animate = (): void => {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.particles.forEach((p) => {
      if (this.mouse.active) {
        const dx = this.mouse.x - p.x;
        const dy = this.mouse.y - p.y;
        const dist = Math.hypot(dx, dy);

        if (dist < GRAVITY_RADIUS && dist > EVENT_HORIZON) {
          applyGravity(p, dx, dy, dist);
          applySpaghettification(p, dist);
        }

        if (dist < EVENT_HORIZON) {
          p.x = Math.random() * this.canvas.width;
          p.y = Math.random() * this.canvas.height;
          p.vx = 0;
          p.vy = 0;
          p.size = Math.random() * 1.5 + 0.5;
        }
      }

      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.95;
      p.vy *= 0.95;

      this.ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
    });

    let consumedCount = 0;
    this.targets.forEach((t) => {
      if (t.consumed) {
        consumedCount++;
        return;
      }

      if (this.mouse.active) {
        const dist = Math.hypot(this.mouse.x - t.x, this.mouse.y - t.y);
        if (dist < EVENT_HORIZON + t.radius) {
          t.consumed = true;
          consumedCount++;
          this.config.onTargetConsumed(consumedCount);
          if (consumedCount === 3) this.finish();
        }
      }

      const gradient = this.ctx.createRadialGradient(t.x, t.y, 0, t.x, t.y, 20);
      gradient.addColorStop(0, 'rgba(100, 200, 255, 1)');
      gradient.addColorStop(0.5, 'rgba(110, 69, 226, 0.6)');
      gradient.addColorStop(1, 'rgba(110, 69, 226, 0)');
      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(t.x, t.y, 20, 0, Math.PI * 2);
      this.ctx.fill();
    });

    if (this.mouse.active) {
      this.ctx.strokeStyle = 'rgba(255, 150, 50, 0.6)';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(this.mouse.x, this.mouse.y, EVENT_HORIZON + 8, 0, Math.PI * 2);
      this.ctx.stroke();

      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.arc(this.mouse.x, this.mouse.y, EVENT_HORIZON + 2, 0, Math.PI * 2);
      this.ctx.stroke();

      this.ctx.fillStyle = '#000';
      this.ctx.beginPath();
      this.ctx.arc(this.mouse.x, this.mouse.y, EVENT_HORIZON, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.animationId = requestAnimationFrame(this.animate);
  };

  private finish(): void {
    this.config.onComplete({
      path: this.pathData,
      angularMomentum: calculateAngularMomentum(this.pathData),
      targetsConsumed: 3
    });
  }

  public destroy(): void {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    window.removeEventListener('resize', this.resizeHandler);
    this.canvas.remove();
  }
}
