import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import "@altanlabs/auth/dist/styles.css";

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />); 