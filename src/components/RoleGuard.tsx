import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { canAccessPath, defaultHomePath } from '@/lib/rbac'

export default function RoleGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const role = user?.role?.name
  if (!canAccessPath(role, location.pathname)) {
    return <Navigate to={defaultHomePath(role)} replace />
  }

  return <>{children}</>
}
