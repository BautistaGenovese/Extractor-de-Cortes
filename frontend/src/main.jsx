import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ClerkProvider } from '@clerk/clerk-react'
import { dark } from '@clerk/themes'
import { ToastProvider } from './components/Toaster.jsx'
import { ConfirmProvider } from './components/ConfirmModal.jsx'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error("Falta la VITE_CLERK_PUBLISHABLE_KEY")
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ClerkProvider 
      publishableKey={PUBLISHABLE_KEY} 
      afterSignOutUrl="/"
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: '#f59e0b', // amber-500 para coincidir con el botón Iniciar Sesión
          colorTextOnPrimaryBackground: '#020617', // slate-950 para contraste
        },
        elements: {
          card: "bg-zinc-950 border border-zinc-800",
          headerTitle: "text-amber-500 font-bold",
          headerSubtitle: "text-zinc-400",
        }
      }}
    >
      <ToastProvider>
        <ConfirmProvider>
          <App />
        </ConfirmProvider>
      </ToastProvider>
    </ClerkProvider>
  </React.StrictMode>,
)
