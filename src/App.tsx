import { useEffect, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/hooks/useAuth'
import { router } from '@/router'
import { RouterProvider } from 'react-router-dom'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  const [showToaster, setShowToaster] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setShowToaster(true))
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
      {showToaster ? (
        <Toaster
          position="top-right"
          containerStyle={{ zIndex: 99999 }}
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#374151',
              borderRadius: '0.75rem',
              padding: '12px 16px',
            },
          }}
        />
      ) : null}
    </QueryClientProvider>
  )
}

export default App
