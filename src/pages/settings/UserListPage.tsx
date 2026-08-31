import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as authService from '@/lib/services/authService'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import { Badge, StatusBadge } from '@/components/ui/Badge'
import { PageLoadingSpinner } from '@/components/ui/LoadingSpinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { Plus, UserCog } from 'lucide-react'
import toast from 'react-hot-toast'
import type { User } from '@/types'

const ROLE_OPTIONS = authService.SYSTEM_ROLES.map((r) => ({
  value: r,
  label: authService.ROLE_LABELS[r] || r,
}))

export default function UserListPage() {
  const navigate = useNavigate()
  const { user: currentUser, hasRole } = useAuth()
  const qc = useQueryClient()
  const canManage = hasRole('super_admin', 'admin')

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => authService.listUsers(),
  })

  const updateRole = useMutation({
    mutationFn: ({ id, role }: { id: string; role: authService.SystemRole }) =>
      authService.updateUserRole(id, role, currentUser?.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
      toast.success('Role updated')
    },
    onError: (e: Error) => toast.error(e.message || 'Failed to update role'),
  })

  const toggleActive = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      authService.setUserActive(id, active),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
      toast.success('User status updated')
    },
    onError: (e: Error) => toast.error(e.message || 'Failed to update status'),
  })

  if (isLoading) return <PageLoadingSpinner />

  const list = users || []

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500">Manage system users and roles</p>
        </div>
        {canManage && (
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/settings/users/create')}>
            Add User
          </Button>
        )}
      </div>

      <Card variant="elevated">
        <CardContent className="pt-6">
          {list.length === 0 ? (
            <EmptyState
              title="No users found"
              description="Create the first user to get started"
              icon={<UserCog className="h-8 w-8 text-gray-400" />}
              action={
                canManage ? (
                  <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/settings/users/create')}>
                    Add User
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="text-left text-xs font-semibold text-gray-500 uppercase">
                    <th className="px-3 py-3">Name</th>
                    <th className="px-3 py-3">Email</th>
                    <th className="px-3 py-3">Role</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {list.map((u: User) => (
                    <tr key={u.id} className="text-sm">
                      <td className="px-3 py-3 font-medium text-gray-900">
                        {u.name || `${u.first_name || ''} ${u.last_name || ''}`.trim() || '—'}
                      </td>
                      <td className="px-3 py-3 text-gray-600">{u.email}</td>
                      <td className="px-3 py-3">
                        {canManage && u.id !== currentUser?.id ? (
                          <Select
                            options={ROLE_OPTIONS}
                            value={u.role?.name || 'patient'}
                            onChange={(e) =>
                              updateRole.mutate({
                                id: u.id,
                                role: e.target.value as authService.SystemRole,
                              })
                            }
                            className="min-w-[140px]"
                          />
                        ) : (
                          <Badge variant="primary">
                            {authService.ROLE_LABELS[u.role?.name || ''] || u.role?.name || '—'}
                          </Badge>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <StatusBadge status={u.is_active ? 'active' : 'inactive'} />
                      </td>
                      <td className="px-3 py-3">
                        {canManage && u.id !== currentUser?.id && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              toggleActive.mutate({ id: u.id, active: !u.is_active })
                            }
                          >
                            {u.is_active ? 'Deactivate' : 'Activate'}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
