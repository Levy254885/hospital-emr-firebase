import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppointments, useCancelAppointment } from '@/hooks/useAppointments'
import { DataTable } from '@/components/ui/DataTable'
import { StatusBadge, Badge } from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { formatDate, formatTime } from '@/lib/utils'
import { Plus, Calendar, Clock, X } from 'lucide-react'
import type { Appointment } from '@/types'

export default function AppointmentListPage() {
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [page, setPage] = useState(1)
  const [cancelId, setCancelId] = useState<string | null>(null)
  const cancelAppointment = useCancelAppointment()
  const { data, isLoading } = useAppointments({ status: statusFilter || undefined, type: typeFilter || undefined, page, per_page: 15 })

  const typeLabels: Record<string, string> = {
    consultation: 'Consulta', follow_up: 'Seguimiento', emergency: 'Emergencia', telemedicine: 'Telemedicina',
  }

  const columns = [
    { key: 'date', header: 'Fecha', sortable: true, render: (item: Appointment) => (
      <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-gray-400" /><span>{formatDate(item.appointment_date)}</span></div>) },
    { key: 'time', header: 'Hora', render: (item: Appointment) => (
      <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-gray-400" /><span>{item.start_time} - {item.end_time}</span></div>) },
    { key: 'patient', header: 'Paciente', render: (item: Appointment) => (
      <div><p className="font-medium text-gray-900">{item.patient?.first_name} {item.patient?.last_name}</p><p className="text-xs text-gray-500">{item.patient?.document_number}</p></div>) },
    { key: 'doctor', header: 'Medico', render: (item: Appointment) => (<span>Dr. {item.doctor?.first_name} {item.doctor?.last_name}</span>) },
    { key: 'type', header: 'Tipo', render: (item: Appointment) => (<Badge variant="primary">{typeLabels[item.type as keyof typeof typeLabels] || item.type || '-'}</Badge>) },
    { key: 'status', header: 'Estado', render: (item: Appointment) => <StatusBadge status={item.status} /> },
    { key: 'actions', header: '', render: (item: Appointment) => (
      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setCancelId(item.id) }} disabled={item.status === 'cancelled' || item.status === 'completed'}>
        <X className="h-4 w-4 text-red-500" />
      </Button>) },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-gray-900">Citas Medicas</h1><p className="text-sm text-gray-500">Lista de todas las citas programadas</p></div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/appointments/calendar')}><Calendar className="h-4 w-4 mr-2" />Calendario</Button>
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/appointments/create')}>Nueva Cita</Button>
        </div>
      </div>
      <Card variant="elevated">
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-3">
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
              className="block w-full sm:w-40 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20">
              <option value="">Todos los estados</option>
              <option value="scheduled">Programadas</option>
              <option value="confirmed">Confirmadas</option>
              <option value="in_progress">En Progreso</option>
              <option value="completed">Completadas</option>
              <option value="cancelled">Canceladas</option>
            </select>
            <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1) }}
              className="block w-full sm:w-40 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20">
              <option value="">Todos los tipos</option>
              <option value="consultation">Consulta</option>
              <option value="follow_up">Seguimiento</option>
              <option value="emergency">Emergencia</option>
              <option value="telemedicine">Telemedicina</option>
            </select>
          </div>
        </CardHeader>
        <DataTable columns={columns} data={data?.data || []} isLoading={isLoading}
          onRowClick={(item) => navigate(`/appointments/${item.id}`)}
          pagination={data?.meta ? { current_page: data.meta.current_page, last_page: data.meta.last_page, per_page: data.meta.per_page, total: data.meta.total, onPageChange: setPage } : undefined}
          emptyTitle="No hay citas" emptyDescription="No se encontraron citas con los filtros aplicados" />
      </Card>
      <ConfirmDialog open={!!cancelId} onOpenChange={() => setCancelId(null)} title="Cancelar Cita"
        description="Esta seguro que desea cancelar esta cita?" confirmText="Cancelar Cita"
        onConfirm={() => { if (cancelId) { cancelAppointment.mutate({ id: cancelId, reason: 'Cancelado por el usuario' }, { onSettled: () => setCancelId(null) }) } }}
        isLoading={cancelAppointment.isPending} />
    </div>
  )
}
