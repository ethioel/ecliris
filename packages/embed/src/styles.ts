export function getHostStyles(): string {
  return `
    :host {
      all: initial;
      display: block;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    *, *::before, *::after {
      box-sizing: border-box;
    }
  `;
}

export function getCardStyles(): string {
  return `
    .ecliris-card {
      background: rgba(10, 10, 15, 0.95);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 24px;
      color: #fff;
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    }
    .ecliris-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .ecliris-title {
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 1px;
      opacity: 0.85;
      text-transform: uppercase;
    }
    .ecliris-a11y {
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: rgba(255, 255, 255, 0.6);
      padding: 4px 12px;
      border-radius: 100px;
      font-size: 11px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .ecliris-a11y:hover {
      border-color: rgba(255, 255, 255, 0.5);
      color: #fff;
    }
    .ecliris-viewport {
      width: 100%;
      height: 320px;
      background: radial-gradient(ellipse at center, #0a0a1e 0%, #000 100%);
      border-radius: 8px;
      overflow: hidden;
      position: relative;
      margin-bottom: 16px;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }
    .ecliris-status {
      font-size: 13px;
      opacity: 0.7;
      text-align: center;
      min-height: 20px;
      transition: all 0.3s;
    }
    .ecliris-status.success {
      color: #00ffcc;
      opacity: 1;
    }
    .ecliris-status.error {
      color: #ff4466;
      opacity: 1;
    }
  `;
}
