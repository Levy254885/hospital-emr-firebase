import { useState, useEffect, useCallback, createContext, useContext, useRef } from 'react'
import type { ReactNode } from 'react'
import type { User } from '@/types'
import * as authService from '@/lib/services/authService'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string, institutionId?: string) => Promise<void>
  logout: () => Promise<void>
  register: (
    email: string,
    password: string,
    data: {
      name: string
      first_name?: string
      last_name?: string
      phone?: string
      role?: string
      institution_id?: string
    }
  ) => Promise<void>
  resetPassword: (email: string) => Promise<void>
  refreshToken: () => Promise<void>
  getCurrentUser: () => Promise<void>
  hasRole: (...roles: string[]) => boolean
  hasPermission: (permission: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    const unsubscribe = authService.subscribeToAuth((profile) => {
      if (!mountedRef.current) return
      setUser(profile)
      setIsLoading(false)
    })
    return () => {
      mountedRef.current = false
      unsubscribe()
    }
  }, [])

  const getCurrentUser = useCallback(async () => {
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    const profile = await authService.login(email, password)
    if (mountedRef.current) {
      setUser(profile)
      setIsLoading(false)
    }
  }

  const logout = async () => {
    await authService.logout()
    if (mountedRef.current) setUser(null)
  }

  const register = async (
    email: string,
    password: string,
    data: {
      name: string
      first_name?: string
      last_name?: string
      phone?: string
      role?: string
      institution_id?: string
    }
  ) => {
    const profile = await authService.register(email, password, {
      ...data,
      role: (data.role as authService.SystemRole) || 'patient',
    })
    if (mountedRef.current) {
      setUser(profile)
      setIsLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    await authService.resetPassword(email)
  }

  const refreshToken = async () => {}

  const hasRole = (...roles: string[]) => {
    if (!user?.role?.name) return false
    const rn = user.role.name.toLowerCase().replace(/\s+/g, '_')
    return roles.some((r) => r.toLowerCase().replace(/\s+/g, '_') === rn)
  }

  const hasPermission = (permission: string) => {
    if (!user?.role) return false
    const rn = user.role.name?.toLowerCase() || ''
    if (rn === 'super_admin' || rn === 'admin') return true
    return (user.role.permissions || []).some(
      (p) => p.name === permission || p.name === '*'
    )
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        register,
        resetPassword,
        refreshToken,
        getCurrentUser,
        hasRole,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
