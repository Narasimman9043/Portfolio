import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="bottom-right"
      toastOptions={{
        duration: 3200,
        style: {
          background: 'rgba(18,22,42,0.95)',
          color: '#e2e8f0',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '12px',
          backdropFilter: 'blur(20px)',
          fontSize: '0.875rem',
        },
        success: { iconTheme: { primary: '#34d399', secondary: '#fff' } },
        error:   { iconTheme: { primary: '#f87171', secondary: '#fff' } },
      }}
    />
  </React.StrictMode>
)
