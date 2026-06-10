import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { HashRouter } from 'react-router-dom'
import { AuthProvider } from './lib/AuthContext'

// 开发环境：暴露测试 API 到全局，控制台可直接调用
if (import.meta.env.DEV) {
  import('./lib/api.js').then(m => {
    window.__ct = { ...window.__ct, ...m };
  });
  import('./page/Wallet/walletService.js').then(m => {
    window.__ct = { ...window.__ct, ...m };
  });
  import('./FirebaseConfig.js').then(m => {
    window.__ct = { ...window.__ct, ...m };
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <AuthProvider>
        <App/>
      </AuthProvider>
    </HashRouter>
  </StrictMode>,
)
