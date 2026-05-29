import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const registerServiceWorker = () => {
  if (
    typeof window === 'undefined'
    || typeof navigator === 'undefined'
    || !('serviceWorker' in navigator)
    || !import.meta.env.PROD
  ) {
    return;
  }

  const register = () => {
    const baseUrl = import.meta.env.BASE_URL.endsWith('/')
      ? import.meta.env.BASE_URL
      : `${import.meta.env.BASE_URL}/`;

    navigator.serviceWorker.register(`${baseUrl}sw.js`, { scope: baseUrl }).catch(() => {
      // Keep startup resilient even if SW registration fails.
    });
  };

  if (document.readyState === 'complete') {
    register();
    return;
  }

  window.addEventListener('load', register, { once: true });
};

const dismissStaticSplash = () => {
  const splash = document.getElementById('app-splash');
  if (!splash) {
    return;
  }

  splash.classList.add('app-splash--hide');

  const onDone = () => {
    splash.removeEventListener('transitionend', onDone);
    splash.remove();
  };

  splash.addEventListener('transitionend', onDone, { once: true });

  // Safety fallback: remove after 400ms even if transitionend never fires
  setTimeout(() => {
    if (splash.parentNode) {
      splash.remove();
    }
  }, 400);
};

window.dismissStaticSplash = dismissStaticSplash;

registerServiceWorker();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Safety fallback: dismiss after 2000ms in case React mounting hangs or fails
setTimeout(dismissStaticSplash, 2000);

