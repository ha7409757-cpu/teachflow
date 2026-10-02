import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

try {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
} catch (error) {
  console.error('Failed to render application:', error);
  document.getElementById('root')!.innerHTML = `
    <div style="padding: 20px; color: red; font-family: sans-serif;">
      <h2>Critical Error</h2>
      <p>The application failed to start.</p>
      <pre>${error instanceof Error ? error.message : String(error)}</pre>
    </div>
  `;
}
