import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { MessagesProvider } from './context/messages.context.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MessagesProvider>
        <App />

    </MessagesProvider>
  
  </StrictMode>
);
