import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { Shield, Plus } from 'lucide-react'

interface Role {
  id: string
  name: string
  description: string
  permissions_count: number
  is_system: boolean
}

export default function RoleListPage() {
  const roles: Role[] = []

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Roles</h1>
          <p className="text-sm text-gray-500">Gestion de roles y permisos</p>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />}>
          Nuevo Rol
        </Button>
      </div>

      <Card variant="elevated">
        <CardContent>
          {roles.length === 0 ? (
            <EmptyState
              title="No hay roles"
              description="Los roles del sistema apareceran aqui"
              icon={<Shield className="h-8 w-8 text-gray-400" />}
            />
          ) : (
            <div className="space-y-3">
              {roles.map((role) => (
                <div key={role.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">{role.name}</p>
                        {role.is_system && <Badge variant="default">Sistema</Badge>}
                      </div>
                      <p className="text-sm text-gray-500">{role.description}</p>
                    </div>
                    <p className="text-sm text-gray-500">{role.permissions_count} permisos</p>
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
