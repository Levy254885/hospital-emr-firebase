import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { Card, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { Badge, StatusBadge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { Plus, Users, Mail, Shield } from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  role: { name: string }
  is_active: boolean
  last_login?: string
}

export default function UserListPage() {
  const navigate = useNavigate()
  const { data, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.get('/users')
      return response.data
    },
  })
  const users: User[] = data?.data || []

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
          <p className="text-sm text-gray-500">Gestion de usuarios del sistema</p>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/settings/users/create')}>Nuevo Usuario</Button>
      </div>
      <Card variant="elevated">
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" /></div>
          ) : users.length === 0 ? (
            <EmptyState title="No hay usuarios" description="Registre usuarios para acceder al sistema" icon={<Users className="h-8 w-8 text-gray-400" />}
              action={<Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/settings/users/create')}>Registrar Usuario</Button>} />
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <div key={user.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary-700">{user.name?.charAt(0) || '?'}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500 flex items-center gap-1"><Mail className="h-3 w-3" /> {user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="primary">{user.role?.name || 'Sin rol'}</Badge>
                      <StatusBadge status={user.is_active ? 'active' : 'inactive'} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
