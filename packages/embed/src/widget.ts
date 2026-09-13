import { EclirisEngine, TelemetryPayload } from '@ecliris/core';
import { getHostStyles, getCardStyles } from './styles';

export interface EclirisOptions {
  siteKey: string;
  onSuccess: (token: string) => void;
  onError?: (error: string) => void;
  apiEndpoint?: string;
}

export class EclirisWidget {
  private shadowRoot: ShadowRoot;
  private engine: EclirisEngine | null = null;
  private options: EclirisOptions;

  constructor(containerId: string, options: EclirisOptions) {
    const container = document.getElementById(containerId);
    if (!container) throw new Error(`[Ecliris] Container #${containerId} not found`);

    this.options = options;
    this.shadowRoot = container.attachShadow({ mode: 'open' });
    this.injectStyles();
    this.renderUI();
    this.initEngine();
  }

  private injectStyles(): void {
    const style = document.createElement('style');
    style.textContent = getHostStyles() + getCardStyles();
    this.shadowRoot.appendChild(style);
  }

  private renderUI(): void {
    const card = document.createElement('div');
    card.className = 'ecliris-card';
    card.innerHTML = `
      <div class="ecliris-header">
        <span class="ecliris-title">Ecliris · Security Verification</span>
        <button class="ecliris-a11y" aria-label="Audio alternative">Audio</button>
      </div>
      <div class="ecliris-viewport" id="ecliris-viewport"></div>
      <div class="ecliris-status" id="ecliris-status">Move cursor to reveal the universe...</div>
    `;
    this.shadowRoot.appendChild(card);
  }

  private initEngine(): void {
    const viewport = this.shadowRoot.getElementById('ecliris-viewport') as HTMLElement;
    const status = this.shadowRoot.getElementById('ecliris-status') as HTMLElement;

    this.engine = new EclirisEngine({
      container: viewport,
      onTargetConsumed: (count) => {
        status.textContent = `Stellar Anchors Consumed: ${count} / 3`;
        status.className = 'ecliris-status';
      },
      onComplete: (telemetry) => {
        status.textContent = 'Verifying Singularity...';
        this.verify(telemetry, status);
      }
    });
  }

  private async verify(telemetry: TelemetryPayload, status: HTMLElement): Promise<void> {
    const endpoint = this.options.apiEndpoint || '/v1/verify';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteKey: this.options.siteKey,
          telemetry
        })
      });
      const data = await res.json();
      if (data.success) {
        status.textContent = '✓ Verification Complete';
        status.className = 'ecliris-status success';
        this.options.onSuccess(data.token);
      } else {
        throw new Error(data.error || 'Verification failed');
      }
    } catch (err: any) {
      status.textContent = '✗ ' + (err.message || 'Verification failed');
      status.className = 'ecliris-status error';
      this.options.onError?.(err.message);
    }
  }

  public destroy(): void {
    this.engine?.destroy();
  }
}
