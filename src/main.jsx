import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

// The site used to live at /portfolio-3D/. Old links (CVs, LinkedIn) land here through
// 404.html; map them, in any letter case, onto the same page at the root.
const legacy = window.location.pathname.match(/^\/portfolio-3d(\/.*)?$/i)
if (legacy) {
  window.history.replaceState(null, '', (legacy[1] || '/') + window.location.search + window.location.hash)
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
