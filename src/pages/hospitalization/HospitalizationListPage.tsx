import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHospitalizations } from '@/hooks/useHospitalization'
import { DataTable } from '@/components/ui/DataTable'
import { StatusBadge, Badge } from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { formatDate } from '@/lib/utils'
import { Plus, Bed, ArrowRight } from 'lucide-react'
import type { Hospitalization } from '@/types'

export default function HospitalizationListPage() {
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const { data, isLoading } = useHospitalizations({ status: statusFilter || undefined, page, per_page: 15 })

  const columns = [
    { key: 'patient', header: 'Paciente', render: (item: Hospitalization) => (
      <div><p className="font-medium text-gray-900">{item.patient?.first_name} {item.patient?.last_name}</p>
      <p className="text-xs text-gray-500">{item.patient?.document_number}</p></div>) },
    { key: 'admission_date', header: 'Fecha Ingreso', sortable: true, render: (item: Hospitalization) => formatDate(item.admission_date) },
    { key: 'bed', header: 'Cama', render: (item: Hospitalization) => (
      <div className="flex items-center gap-2"><Bed className="h-4 w-4 text-gray-400" /><span>{item.bed?.number || 'Sin asignar'}</span></div>) },
    { key: 'department', header: 'Departamento', render: (item: Hospitalization) => item.department || '-' },
    { key: 'doctor', header: 'Medico', render: (item: Hospitalization) => (
      <span>Dr. {item.doctor?.first_name} {item.doctor?.last_name}</span>) },
    { key: 'reason', header: 'Motivo', render: (item: Hospitalization) => (
      <span className="truncate max-w-[200px] block">{item.reason}</span>) },
    { key: 'status', header: 'Estado', render: (item: Hospitalization) => <StatusBadge status={item.status} /> },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hospitalizaciones</h1>
          <p className="text-sm text-gray-500">Pacientes hospitalizados actualmente</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/hospitalization/bed-map')}>
            <Bed className="h-4 w-4 mr-2" />Mapa de Camas
          </Button>
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/hospitalization/create')}>
            Nueva Hospitalizacion
          </Button>
        </div>
      </div>
      <Card variant="elevated">
        <CardHeader>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
            className="block w-full sm:w-40 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20">
            <option value="">Todos los estados</option>
            <option value="active">Activas</option>
            <option value="discharged">Dados de Alta</option>
            <option value="transferred">Transferidos</option>
          </select>
        </CardHeader>
        <DataTable columns={columns} data={data?.data || []} isLoading={isLoading}
          onRowClick={(item) => navigate(`/hospitalization/${item.id}`)}
          pagination={data?.meta ? { current_page: data.meta.current_page, last_page: data.meta.last_page, per_page: data.meta.per_page, total: data.meta.total, onPageChange: setPage } : undefined}
          emptyTitle="No hay hospitalizaciones" emptyDescription="No se encontraron hospitalizaciones activas" />
      </Card>
    </div>
  )
}
