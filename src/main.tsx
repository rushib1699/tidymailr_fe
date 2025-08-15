import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { router } from './routes'
import './index.css'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element not found')
}

ReactDOM.createRoot(rootElement).render(
  // <React.StrictMode>
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>
  // </React.StrictMode>,
)