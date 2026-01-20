import React from 'react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { GoogleOAuthProvider } from '@react-oauth/google';
import ErrorBoundary from './components/ErrorBoundary';

import { AuthProvider } from './context/AuthContext';

import { BrowserRouter as Router } from 'react-router-dom';

console.log("ParkEase Main Entry Loaded");

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <ErrorBoundary>
            <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || "dummy_client_id_to_prevent_crash"}>
                <Router>
                    <AuthProvider>
                        <App />
                    </AuthProvider>
                </Router>
            </GoogleOAuthProvider>
        </ErrorBoundary>
    </StrictMode>,
)
