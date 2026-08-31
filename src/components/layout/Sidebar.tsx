import { useState, useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { canSeeMenuSection, canSeeMenuPath } from '@/lib/rbac'
import {
  LayoutDashboard,
  Users,
  FileText,
  Calendar,
  Pill,
  FlaskConical,
  CreditCard,
  BarChart3,
  Settings,
  Shield,
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Heart,
  BedDouble,
  AlertTriangle,
  Package,
  Scissors,
  UserCog,
  Building2,
} from 'lucide-react'

interface SidebarProps {
  collapsed?: boolean
  onToggle?: () => void
  onNavigate?: () => void
}

interface NavItem {
  label: string
  path: string
  icon: React.ReactNode
}

const navigation: { label: string; items: NavItem[] }[] = [
  {
    label: 'Main',
    items: [{ label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> }],
  },
  {
    label: 'Patients',
    items: [
      { label: 'Patients', path: '/patients', icon: <Users className="h-5 w-5" /> },
      { label: 'Inpatient', path: '/hospitalization', icon: <BedDouble className="h-5 w-5" /> },
      { label: 'Emergency', path: '/emergency', icon: <AlertTriangle className="h-5 w-5" /> },
    ],
  },
  {
    label: 'Clinical',
    items: [
      { label: 'Medical Records', path: '/clinical/records', icon: <FileText className="h-5 w-5" /> },
      { label: 'Appointments', path: '/appointments', icon: <Calendar className="h-5 w-5" /> },
      { label: 'Prescriptions', path: '/prescriptions', icon: <Pill className="h-5 w-5" /> },
      { label: 'Laboratory', path: '/lab/orders', icon: <FlaskConical className="h-5 w-5" /> },
      { label: 'Surgery', path: '/surgery', icon: <Scissors className="h-5 w-5" /> },
      { label: 'Radiology', path: '/radiology', icon: <Heart className="h-5 w-5" /> },
    ],
  },
  {
    label: 'Pharmacy',
    items: [
      { label: 'Medications', path: '/pharmacy/medications', icon: <Pill className="h-5 w-5" /> },
      { label: 'Inventory', path: '/inventory', icon: <Package className="h-5 w-5" /> },
      { label: 'Dispensation', path: '/pharmacy/dispensation', icon: <Package className="h-5 w-5" /> },
      { label: 'Suppliers', path: '/pharmacy/suppliers', icon: <Building2 className="h-5 w-5" /> },
      { label: 'Reports', path: '/reports', icon: <BarChart3 className="h-5 w-5" /> },
    ],
  },
  {
    label: 'Finance',
    items: [
      { label: 'Invoices', path: '/billing/invoices', icon: <CreditCard className="h-5 w-5" /> },
      { label: 'Payments', path: '/billing/payments', icon: <CreditCard className="h-5 w-5" /> },
      { label: 'Cash Register', path: '/billing/cash-register', icon: <CreditCard className="h-5 w-5" /> },
    ],
  },
  {
    label: 'Administration',
    items: [
      { label: 'Users', path: '/settings/users', icon: <UserCog className="h-5 w-5" /> },
      { label: 'Roles', path: '/settings/roles', icon: <Shield className="h-5 w-5" /> },
      { label: 'Institution', path: '/settings/institution', icon: <Building2 className="h-5 w-5" /> },
      { label: 'Settings', path: '/settings', icon: <Settings className="h-5 w-5" /> },
      { label: 'Reports', path: '/reports', icon: <BarChart3 className="h-5 w-5" /> },
      { label: 'Audit Log', path: '/audit', icon: <Shield className="h-5 w-5" /> },
      { label: 'Notifications', path: '/notifications', icon: <Bell className="h-5 w-5" /> },
    ],
  },
]

export default function Sidebar({ collapsed = false, onToggle, onNavigate }: SidebarProps) {
  const location = useLocation()
  const { user } = useAuth()
  const roleName = user?.role?.name

  const filteredNav = useMemo(() => {
    return navigation
      .filter((section) => canSeeMenuSection(roleName, section.label))
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => canSeeMenuPath(roleName, item.path)),
      }))
      .filter((section) => section.items.length > 0)
  }, [roleName])

  const [expandedSections, setExpandedSections] = useState<string[]>(() => navigation.map((s) => s.label))

  const toggleSection = (label: string) => {
    setExpandedSections((current) =>
      current.includes(label) ? current.filter((s) => s !== label) : [...current, label]
    )
  }

  const isActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === '/dashboard'
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  return (
    <aside
      className={cn(
        'h-screen bg-gradient-to-b from-primary-900 via-primary-800 to-primary-900 text-white flex flex-col shadow-xl',
        collapsed ? 'w-[72px]' : 'w-64'
      )}
    >
      <div className="flex items-center gap-3 px-4 h-16 border-b border-primary-700/50">
        <div className="flex-shrink-0 w-10 h-10 bg-white rounded-xl flex items-center justify-center overflow-hidden">
          <img src="/icons/elikin-logo.svg" alt="" className="w-8 h-8 object-contain" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-sm font-bold text-white truncate leading-tight">Elikin Medical Clinic</h1>
            <p className="text-[10px] text-primary-200 truncate italic">The Heart of Healthcare</p>
            <p className="text-xs text-primary-300 truncate capitalize">
              {roleName?.replace(/_/g, ' ') || 'Staff'}
            </p>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {filteredNav.map((section) => (
          <div key={section.label} className="mb-4">
            {!collapsed && (
              <button
                type="button"
                onClick={() => toggleSection(section.label)}
                className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-primary-300 uppercase tracking-wider"
              >
                <span>{section.label}</span>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 transition-transform',
                    !expandedSections.includes(section.label) && '-rotate-90'
                  )}
                />
              </button>
            )}
            <div className={cn('space-y-1', collapsed && 'mt-2')}>
              {expandedSections.includes(section.label) || collapsed
                ? section.items.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => onNavigate?.()}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                        isActive(item.path)
                          ? 'bg-white/15 text-white shadow-sm'
                          : 'text-primary-100 hover:bg-white/10 hover:text-white',
                        collapsed && 'justify-center px-2'
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <span className="flex-shrink-0">{item.icon}</span>
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </Link>
                  ))
                : null}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-2 border-t border-primary-700/50 hidden lg:block">
        <button
          type="button"
          onClick={onToggle}
          className="flex items-center justify-center w-full px-3 py-2 rounded-lg text-primary-200 hover:bg-white/10 hover:text-white transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <>
              <ChevronLeft className="h-5 w-5 mr-2" />
              <span className="text-sm">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  )
}
