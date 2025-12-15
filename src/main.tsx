import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { AppProvider } from './context/AppContext'
import './index.css'
import './index.css'

// VitePWA plugin with 'autoUpdate' injects the registration script automatically.
// We don't need to manually import and call registerSW unless we want custom behavior.
// Let's rely on the plugin's injection to be safe and consistent.

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <AppProvider>
            <App />
        </AppProvider>
    </React.StrictMode>,
)
