import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './i18n';
import './index.css';
import './redesign.css';
import App from './App';
import { SiteProvider } from './contexts/SiteContext';
import { AuthProvider } from './contexts/AuthContext';

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <BrowserRouter>
      <SiteProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </SiteProvider>
    </BrowserRouter>
  </StrictMode>,
);
