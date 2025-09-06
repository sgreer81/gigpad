import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './contexts/ThemeContext'

// Detect PWA mode and add class to body for better CSS targeting
const detectPWAMode = () => {
  const isPWA = 
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://');
  
  if (isPWA) {
    document.body.classList.add('pwa-mode');
  }
};

// Run PWA detection
detectPWAMode();

// Listen for display mode changes
if (window.matchMedia) {
  window.matchMedia('(display-mode: standalone)').addEventListener('change', detectPWAMode);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
