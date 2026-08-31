import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useDashboardStats } from '@/hooks/useDashboard'
import { roleDashboardTitle, normalizeRole } from '@/lib/rbac'
import { Card, CardContent } from '@/components/ui/Card'
import { PageLoadingSpinner } from '@/components/ui/LoadingSpinner'
import { formatCurrency } from '@/lib/utils'
import {
  Users, Calendar, DollarSign, BedDouble, Pill, FlaskConical, Package,
  CreditCard, FileText, AlertTriangle, Plus,
} from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuth()
  const role = normalizeRole(user?.role?.name)
  const { data: stats, isLoading } = useDashboardStats()

  if (isLoading) return <PageLoadingSpinner />

  const title = roleDashboardTitle(user?.role?.name)
  const name = user?.name || user?.first_name || 'User'

  if (role === 'pharmacist') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-500">Welcome, {name}. Manage medications, stock, and dispensation.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <DashCard title="Medications" value="—" icon={Pill} color="bg-primary-600" to="/pharmacy/medications" />
          <DashCard title="Inventory" value="—" icon={Package} color="bg-secondary-600" to="/inventory" />
          <DashCard title="Dispensation" value="—" icon={Pill} color="bg-green-600" to="/pharmacy/dispensation" />
          <DashCard title="Suppliers" value="—" icon={Package} color="bg-yellow-600" to="/pharmacy/suppliers" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/pharmacy/medications/create" className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700">
            <Plus className="h-4 w-4" /> Add Medication
          </Link>
          <Link to="/inventory/create" className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">
            <Plus className="h-4 w-4" /> Add Inventory Item
          </Link>
        </div>
      </div>
    )
  }

  if (role === 'laboratory') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-500">Welcome, {name}. Process lab orders and results.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <DashCard title="Lab Orders" value={String(stats?.summary?.pending_lab_orders ?? 0)} icon={FlaskConical} color="bg-primary-600" to="/lab/orders" />
          <DashCard title="Results" value="—" icon={FileText} color="bg-green-600" to="/lab/results" />
          <DashCard title="Patients" value={String(stats?.summary?.total_patients ?? 0)} icon={Users} color="bg-secondary-600" to="/patients" />
        </div>
      </div>
    )
  }

  if (role === 'billing') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-500">Welcome, {name}. Invoices and payments (KSh).</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <DashCard title="Monthly Revenue" value={formatCurrency(stats?.summary?.monthly_revenue || 0)} icon={DollarSign} color="bg-green-600" to="/billing/invoices" />
          <DashCard title="Pending Payments" value={formatCurrency(stats?.summary?.pending_payments || 0)} icon={CreditCard} color="bg-yellow-600" to="/billing/payments" />
          <DashCard title="Cash Register" value="—" icon={DollarSign} color="bg-primary-600" to="/billing/cash-register" />
        </div>
      </div>
    )
  }

  if (role === 'receptionist') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-500">Welcome, {name}. Registration and appointments.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <DashCard title="Patients" value={String(stats?.summary?.total_patients ?? 0)} icon={Users} color="bg-primary-600" to="/patients" />
          <DashCard title="Today's Appointments" value={String(stats?.summary?.today_appointments ?? 0)} icon={Calendar} color="bg-secondary-600" to="/appointments" />
          <DashCard title="Billing" value="—" icon={CreditCard} color="bg-green-600" to="/billing/invoices" />
        </div>
        <Link to="/patients/create" className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700">
          <Plus className="h-4 w-4" /> New Patient
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-500">Welcome, {name}. Hospital overview.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/patients/create" className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700">
            <Plus className="h-4 w-4" /> New Patient
          </Link>
          <Link to="/appointments" className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">
            <Calendar className="h-4 w-4" /> Appointments
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashCard title="Total Patients" value={String(stats?.summary?.total_patients ?? 0)} icon={Users} color="bg-primary-600" to="/patients" />
        <DashCard title="Appointments Today" value={String(stats?.summary?.today_appointments ?? 0)} icon={Calendar} color="bg-secondary-600" to="/appointments" />
        <DashCard title="Monthly Revenue" value={formatCurrency(stats?.summary?.monthly_revenue || 0)} icon={DollarSign} color="bg-green-600" to="/billing/invoices" />
        <DashCard title="Inpatients" value={String(stats?.summary?.active_hospitalizations ?? 0)} icon={BedDouble} color="bg-yellow-600" to="/hospitalization" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <DashCard title="Pending Lab" value={String(stats?.summary?.pending_lab_orders ?? 0)} icon={FlaskConical} color="bg-blue-600" to="/lab/orders" />
        <DashCard title="Emergency" value="—" icon={AlertTriangle} color="bg-red-600" to="/emergency" />
        <DashCard title="Pharmacy" value="—" icon={Pill} color="bg-purple-600" to="/pharmacy/medications" />
      </div>
    </div>
  )
}

function DashCard({
  title, value, icon: Icon, color, to,
}: {
  title: string
  value: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  to: string
}) {
  return (
    <Link to={to}>
      <Card variant="elevated" className="relative overflow-hidden hover:shadow-md transition-shadow">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">{title}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            </div>
            <div className={`p-3 rounded-xl ${color}`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
