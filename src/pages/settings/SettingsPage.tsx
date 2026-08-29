import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Settings, Building2, Bell, Shield, Database, Globe } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function SettingsPage() {
  const settingsSections = [
    {
      title: 'Institucion',
      description: 'Configuracion general de la institucion',
      icon: Building2,
      path: '/settings/institution',
    },
    {
      title: 'Usuarios',
      description: 'Gestion de usuarios del sistema',
      icon: Shield,
      path: '/settings/users',
    },
    {
      title: 'Roles y Permisos',
      description: 'Configuracion de roles y permisos',
      icon: Shield,
      path: '/settings/roles',
    },
    {
      title: 'Notificaciones',
      description: 'Configuracion de notificaciones',
      icon: Bell,
      path: '/notifications',
    },
    {
      title: 'Base de Datos',
      description: 'Copias de seguridad y mantenimiento',
      icon: Database,
      path: '#',
    },
    {
      title: 'Integraciones',
      description: 'Conexiones con servicios externos',
      icon: Globe,
      path: '#',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuracion</h1>
        <p className="text-sm text-gray-500">Administracion general del sistema</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {settingsSections.map((section) => (
          <Link key={section.title} to={section.path}>
            <Card variant="elevated" className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardContent className="py-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary-100 rounded-xl">
                    <section.icon className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{section.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{section.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
