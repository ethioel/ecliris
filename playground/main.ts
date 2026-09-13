import { EclirisWidget } from '../packages/embed/src/widget';

document.addEventListener('DOMContentLoaded', () => {
  const widget = new EclirisWidget('ecliris-container', {
    siteKey: 'test_key_playground',
    apiEndpoint: 'http://localhost:3000/v1/verify',
    onSuccess: (token) => {
      console.log('✅ Success! Token:', token);
      const result = document.getElementById('result');
      if (result) {
        result.textContent = 'Verified! Token: ' + token.substring(0, 24) + '...';
        result.style.color = '#00ffcc';
      }
    },
    onError: (err) => {
      console.error('❌ Error:', err);
      const result = document.getElementById('result');
      if (result) {
        result.textContent = 'Failed: ' + err;
        result.style.color = '#ff4466';
      }
    }
  });

  (window as any).__ecliris = widget;
});
