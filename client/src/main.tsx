import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initSupabaseAuthListener } from './utils/supabase/middleware';

// Initialize Supabase auth session listener for automatic refresh & state syncing
initSupabaseAuthListener();

createRoot(document.getElementById('root')!).render(<App />);
