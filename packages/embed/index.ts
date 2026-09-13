import { EclirisWidget, EclirisOptions } from './widget';

declare global {
  interface Window {
    Ecliris: {
      render: (containerId: string, options: EclirisOptions) => EclirisWidget;
    };
  }
}

window.Ecliris = {
  render: (containerId: string, options: EclirisOptions) => {
    return new EclirisWidget(containerId, options);
  }
};

export { EclirisWidget } from './widget';
export type { EclirisOptions } from './widget';
