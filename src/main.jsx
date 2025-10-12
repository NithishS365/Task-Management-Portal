import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { TaskProvider } from './context/Taskcontext.jsx'
import { NotificationProvider } from './context/NotificationContext.jsx' // ✅ CORRECT IMPORT

createRoot(document.getElementById('root')).render(
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
            <NotificationProvider> {/* ✅ CORRECT WRAPPER */}
          <TaskProvider>
              <App />
          </TaskProvider>
            </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
)