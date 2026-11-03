import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { DraftProvider } from './lib/draft.jsx';
import { AvailabilityProvider } from './lib/useAvailability.js';
import './styles/base.css';
import './styles/home.css';
import './styles/booking.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <DraftProvider>
        <AvailabilityProvider>
          <App />
        </AvailabilityProvider>
      </DraftProvider>
    </BrowserRouter>
  </StrictMode>
);
