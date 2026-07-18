import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { ThemeProvider } from './contexts/ThemeContext';
import Preloader from './components/Preloader.jsx';
import './index.css';

// Hide Spline Logo inside Shadow DOM dynamically
if (typeof window !== 'undefined') {
  setInterval(() => {
    const splineViewers = document.querySelectorAll('spline-viewer');
    splineViewers.forEach(viewer => {
      if (viewer.shadowRoot) {
        const logo = viewer.shadowRoot.getElementById('logo');
        if (logo) {
          logo.style.display = 'none';
          logo.style.visibility = 'hidden';
          logo.style.opacity = '0';
          logo.style.pointerEvents = 'none';
        }
      }
    });
  }, 300);
}

const Main = () => {
  const [isLoading, setIsLoading] = useState(true);

  const handlePreloaderFinished = () => {
    setIsLoading(false);
  };

  return (
    <>
      {isLoading ? (
        <Preloader onFinished={handlePreloaderFinished} />
      ) : (
        <App />
      )}
    </>
  );
};

// Render komponen Main ke dalam DOM
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <Main />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
