import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { HashRouter } from 'react-router-dom'
import { AuthProvider } from './lib/AuthContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <AuthProvider>
        <App/>
      </AuthProvider>
    </HashRouter>
  </StrictMode>,
)
