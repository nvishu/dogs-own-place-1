'use client'
import { Toaster } from 'react-hot-toast'

export default function Providers({ children }) {
  return (
    <>
      {children}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3500,
          style: { borderRadius: '9999px', background: '#5C2E0A', color: '#fff', fontWeight: 600, padding: '12px 20px' },
          success: { iconTheme: { primary: '#F5A623', secondary: '#5C2E0A' } },
        }}
      />
    </>
  )
}
