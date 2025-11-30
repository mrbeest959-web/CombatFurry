import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');

// Global Error Handler for Mobile Debugging
window.onerror = function(message, source, lineno, colno, error) {
    const crashScreen = document.getElementById('crash-screen');
    if (crashScreen) {
        crashScreen.style.display = 'block';
        crashScreen.innerHTML += `<h3>CRITICAL ERROR</h3><p>${message}</p><p>${source}:${lineno}</p>`;
    }
};

if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
} catch (e: any) {
    const crashScreen = document.getElementById('crash-screen');
    if (crashScreen) {
        crashScreen.style.display = 'block';
        crashScreen.innerHTML = `<h1>Startup Error</h1><pre>${e.message}\n${e.stack}</pre>`;
    }
}