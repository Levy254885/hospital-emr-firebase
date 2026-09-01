import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/Card'
import { Settings, Building2, Users, Shield, Bell, Palette } from 'lucide-react'

const settingsSections = [
  {
    title: 'Clinic',
    description: 'General clinic settings',
    icon: Building2,
    path: '/settings/institution',
    color: 'bg-primary-100 text-primary-700',
  },
  {
    title: 'Users',
    description: 'Manage staff accounts and access',
    icon: Users,
    path: '/settings/users',
    color: 'bg-blue-100 text-blue-700',
  },
  {
    title: 'Roles & permissions',
    description: 'Configure roles and access control',
    icon: Shield,
    path: '/settings/roles',
    color: 'bg-purple-100 text-purple-700',
  },
  {
    title: 'Notifications',
    description: 'Notification preferences',
    icon: Bell,
    path: '/notifications',
    color: 'bg-yellow-100 text-yellow-700',
  },
]

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500">Configure your clinic management system</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {settingsSections.map((section) => (
          <Link key={section.path} to={section.path}>
            <Card variant="elevated" className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${section.color}`}>
                    <section.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{section.title}</h3>
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
