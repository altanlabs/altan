import Clarity from '@microsoft/clarity';
import ReactDOM from 'react-dom/client';

//
import App from './App';
import reportWebVitals from './reportWebVitals';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import './index.css';

// Initialize analytics
import { initializeAnalytics } from './lib/analytics';
import { setupGlobalErrorHandling } from './utils/errorTracking';
import { startMemoryMonitoring } from './utils/memoryMonitor';
import { store } from './redux/store';

// Initialize Microsoft Clarity
Clarity.init('qdemnm0y9o');

// Initialize Supabase Analytics
initializeAnalytics();

// Set up global error tracking
setupGlobalErrorHandling();

// Start memory monitoring in development
if (import.meta.env.DEV) {
  startMemoryMonitoring(store, { interval: 10000, enabled: true });
  console.log('🔍 Memory monitoring enabled (DEV mode)');
}

// ----------------------------------------------------------------------

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(<App />);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.unregister();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
