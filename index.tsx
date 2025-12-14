import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register the Service Worker for PWA functionality
// Changed to register for production-grade PWA behavior
serviceWorkerRegistration.register({
  onUpdate: (registration) => {
    // Optional: Trigger a toast to let the user know a new version is available
    console.log('New version available. Ready to reload.');
  },
  onSuccess: (registration) => {
    console.log('Content is cached for offline use.');
  }
});