import { useState, useMemo } from 'react'
import {
  useDashboardReport, usePatientReport, useAppointmentReport, useRevenueReport,
  useLabReport, usePharmacyReport, useHospitalizationReport, useDiagnosisReport,
  type ReportFilters,
} from '@/hooks/useReports'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { PageLoadingSpinner } from '@/components/ui/LoadingSpinner'
import { formatCurrency } from '@/lib/utils'
import {
  Download, BarChart3, TrendingUp, Users, DollarSign, Calendar,
  Activity, Stethoscope, Pill, Building,
} from 'lucide-react'

export default function ReportsPage() {
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [reportType, setReportType] = useState<string>('general')

  const filters: ReportFilters = useMemo(
    () => ({ date_from: dateFrom || undefined, date_to: dateTo || undefined }),
    [dateFrom, dateTo]
  )

  const { data: dashboardData, isLoading: dashboardLoading } = useDashboardReport()
  const { data: patientData, isLoading: patientsLoading } = usePatientReport(filters)
  const { data: appointmentData, isLoading: appointmentsLoading } = useAppointmentReport(filters)
  const { data: revenueData, isLoading: revenueLoading } = useRevenueReport(filters)
  const { data: labData, isLoading: labLoading } = useLabReport(filters)
  const { data: pharmacyData, isLoading: pharmacyLoading } = usePharmacyReport(filters)
  const { data: hospitalizationData, isLoading: hospitalizationLoading } = useHospitalizationReport(filters)
  const { data: diagnosisData, isLoading: diagnosesLoading } = useDiagnosisReport(filters)

  const isLoadingMap: Record<string, boolean> = {
    general: dashboardLoading, patients: patientsLoading, appointments: appointmentsLoading,
    revenue: revenueLoading, lab: labLoading, pharmacy: pharmacyLoading,
    hospitalization: hospitalizationLoading, diagnoses: diagnosesLoading,
  }

  const reportTabs = [
    { key: 'general', label: 'General', icon: <BarChart3 className="h-4 w-4" /> },
    { key: 'patients', label: 'Pacientes', icon: <Users className="h-4 w-4" /> },
    { key: 'appointments', label: 'Citas', icon: <Calendar className="h-4 w-4" /> },
    { key: 'revenue', label: 'Ingresos', icon: <DollarSign className="h-4 w-4" /> },
    { key: 'lab', label: 'Laboratorio', icon: <Activity className="h-4 w-4" /> },
    { key: 'pharmacy', label: 'Farmacia', icon: <Pill className="h-4 w-4" /> },
    { key: 'hospitalization', label: 'Hospitalizacion', icon: <Building className="h-4 w-4" /> },
    { key: 'diagnoses', label: 'Diagnosticos', icon: <Stethoscope className="h-4 w-4" /> },
  ]

  const isLoading = isLoadingMap[reportType]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reportes e Indicadores</h1>
          <p className="text-sm text-gray-500">Estadisticas y analisis del hospital</p>
        </div>
        <Button leftIcon={<Download className="h-4 w-4" />} variant="outline">Exportar</Button>
      </div>

      <Card variant="elevated">
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                className="block rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                className="block rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="border-b border-gray-200">
        <nav className="flex overflow-x-auto -mb-px gap-1">
          {reportTabs.map((tab) => (
            <button key={tab.key} onClick={() => setReportType(tab.key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                reportType === tab.key ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>{tab.icon}{tab.label}</button>
          ))}
        </nav>
      </div>

      {isLoading ? (
        <PageLoadingSpinner />
      ) : (
        <>
          {reportType === 'general' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="Pacientes" value={String(dashboardData?.total_patients ?? 0)} icon={<Users className="h-6 w-6 text-blue-600" />} />
              <StatCard title="Citas Hoy" value={String(dashboardData?.appointments_today ?? 0)} icon={<Calendar className="h-6 w-6 text-green-600" />} />
              <StatCard title="Ingresos del Mes" value={formatCurrency(dashboardData?.revenue_month ?? 0)} icon={<DollarSign className="h-6 w-6 text-yellow-600" />} />
              <StatCard title="Ocupacion Camas" value={`${dashboardData?.bed_occupancy ?? 0}%`} icon={<Building className="h-6 w-6 text-purple-600" />} />
            </div>
          )}
          {reportType === 'patients' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard title="Total Pacientes" value={String(patientData?.total ?? 0)} icon={<Users className="h-6 w-6 text-blue-600" />} />
              <StatCard title="Nuevos" value={String(patientData?.new_patients ?? 0)} icon={<TrendingUp className="h-6 w-6 text-green-600" />} />
              <StatCard title="Activos" value={String(patientData?.active ?? 0)} icon={<Activity className="h-6 w-6 text-primary-600" />} />
            </div>
          )}
          {reportType === 'appointments' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard title="Total" value={String(appointmentData?.total ?? 0)} icon={<Calendar className="h-6 w-6 text-blue-600" />} />
              <StatCard title="Completadas" value={String(appointmentData?.completed ?? 0)} icon={<Activity className="h-6 w-6 text-green-600" />} />
              <StatCard title="Canceladas" value={String(appointmentData?.cancelled ?? 0)} icon={<Activity className="h-6 w-6 text-red-600" />} />
              <StatCard title="No Show" value={String(appointmentData?.no_show ?? 0)} icon={<Activity className="h-6 w-6 text-yellow-600" />} />
            </div>
          )}
          {reportType === 'revenue' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard title="Ingresos Totales" value={formatCurrency(revenueData?.total ?? 0)} icon={<DollarSign className="h-6 w-6 text-green-600" />} />
              <StatCard title="Pendiente" value={formatCurrency(revenueData?.pending ?? 0)} icon={<DollarSign className="h-6 w-6 text-yellow-600" />} />
              <StatCard title="Facturas" value={String(revenueData?.invoice_count ?? 0)} icon={<BarChart3 className="h-6 w-6 text-blue-600" />} />
            </div>
          )}
          {reportType === 'lab' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard title="Ordenes" value={String(labData?.total_orders ?? 0)} icon={<Activity className="h-6 w-6 text-blue-600" />} />
              <StatCard title="Completadas" value={String(labData?.completed ?? 0)} icon={<Activity className="h-6 w-6 text-green-600" />} />
              <StatCard title="Pendientes" value={String(labData?.pending ?? 0)} icon={<Activity className="h-6 w-6 text-yellow-600" />} />
            </div>
          )}
          {reportType === 'pharmacy' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard title="Dispensaciones" value={String(pharmacyData?.dispensations ?? 0)} icon={<Pill className="h-6 w-6 text-blue-600" />} />
              <StatCard title="Stock Bajo" value={String(pharmacyData?.low_stock ?? 0)} icon={<Pill className="h-6 w-6 text-red-600" />} />
              <StatCard title="Medicamentos" value={String(pharmacyData?.total_medications ?? 0)} icon={<Pill className="h-6 w-6 text-green-600" />} />
            </div>
          )}
          {reportType === 'hospitalization' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard title="Ocupadas" value={String(hospitalizationData?.occupied_beds ?? 0)} icon={<Building className="h-6 w-6 text-red-600" />} />
              <StatCard title="Disponibles" value={String(hospitalizationData?.available_beds ?? 0)} icon={<Building className="h-6 w-6 text-green-600" />} />
              <StatCard title="Admisiones" value={String(hospitalizationData?.admissions ?? 0)} icon={<Building className="h-6 w-6 text-blue-600" />} />
            </div>
          )}
          {reportType === 'diagnoses' && (
            <Card variant="elevated">
              <CardHeader><CardTitle>Diagnosticos Frecuentes</CardTitle></CardHeader>
              <CardContent>
                {(diagnosisData?.top_diagnoses || []).length > 0 ? (
                  <div className="space-y-2">
                    {(diagnosisData?.top_diagnoses || []).map((d: any, i: number) => (
                      <div key={i} className="flex justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-mono text-primary-700">{d.code}</span>
                        <span className="text-gray-900">{d.name}</span>
                        <span className="font-medium">{d.count}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-8">Sin datos de diagnosticos en el periodo</p>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}

function StatCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <Card variant="elevated">
      <CardContent className="py-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          </div>
          {icon}
        </div>
      </CardContent>
    </Card>
  )
}
