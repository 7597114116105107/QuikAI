import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'

// API base URL: use env in build, else production URL when deployed
const API_BASE =
  import.meta.env.VITE_BASE_URL ||
  (import.meta.env.PROD ? 'https://quik-ai-server-dusky.vercel.app' : 'http://localhost:3000')
axios.defaults.baseURL = API_BASE

// Import your Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Publishable Key')
}

createRoot(document.getElementById('root')).render(
   <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl='/'>
    <BrowserRouter>
      <App />
    </BrowserRouter>,
  </ClerkProvider>
)
