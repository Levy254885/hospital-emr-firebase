import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppointments, useCancelAppointment } from '@/hooks/useAppointments'
import { DataTable } from '@/components/ui/DataTable'
import { StatusBadge, Badge } from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { formatDate } from '@/lib/utils'
import { Plus, Calendar, Clock, X } from 'lucide-react'
import type { Appointment } from '@/types'

export default function AppointmentListPage() {
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [page, setPage] = useState(1)
  const [cancelId, setCancelId] = useState<string | null>(null)
  const cancelAppointment = useCancelAppointment()

  const { data, isLoading } = useAppointments({
    status: statusFilter || undefined,
    type: typeFilter || undefined,
    page,
    per_page: 15,
  })

  const typeLabels: Record<string, string> = {
    consultation: 'Consultation',
    follow_up: 'Follow-up',
    emergency: 'Emergency',
    procedure: 'Procedure',
    lab: 'Lab',
    telemedicine: 'Telemedicine',
  }

  const columns = [
    {
      key: 'date',
      header: 'Date',
      sortable: true,
      render: (item: Appointment) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span>{formatDate(item.appointment_date)}</span>
        </div>
      ),
    },
    {
      key: 'time',
      header: 'Time',
      render: (item: Appointment) => (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-400" />
          <span>
            {item.start_time} - {item.end_time}
          </span>
        </div>
      ),
    },
    {
      key: 'patient',
      header: 'Patient',
      render: (item: Appointment) => (
        <div>
          <p className="font-medium text-gray-900">
            {item.patient?.first_name} {item.patient?.last_name}
          </p>
          <p className="text-xs text-gray-500">{item.patient?.document_number}</p>
        </div>
      ),
    },
    {
      key: 'doctor',
      header: 'Doctor',
      render: (item: Appointment) => (
        <span>
          Dr. {item.doctor?.first_name} {item.doctor?.last_name}
        </span>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (item: Appointment) => (
        <Badge variant="primary">{typeLabels[item.type as string] || item.type || '—'}</Badge>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: Appointment) => <StatusBadge status={item.status} />,
    },
    {
      key: 'actions',
      header: '',
      render: (item: Appointment) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            setCancelId(item.id)
          }}
          disabled={item.status === 'cancelled' || item.status === 'completed'}
        >
          <X className="h-4 w-4 text-red-500" />
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Medical appointments</h1>
          <p className="text-sm text-gray-500">List of all scheduled appointments</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/appointments/calendar')}>
            <Calendar className="h-4 w-4 mr-2" />
            Calendar
          </Button>
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/appointments/create')}>
            New appointment
          </Button>
        </div>
      </div>

      <Card variant="elevated">
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(1)
              }}
              className="block w-full sm:w-40 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm"
            >
              <option value="">All statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="confirmed">Confirmed</option>
              <option value="in_progress">In progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value)
                setPage(1)
              }}
              className="block w-full sm:w-40 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm"
            >
              <option value="">All types</option>
              <option value="consultation">Consultation</option>
              <option value="follow_up">Follow-up</option>
              <option value="emergency">Emergency</option>
              <option value="telemedicine">Telemedicine</option>
            </select>
          </div>
        </CardHeader>
        <DataTable
          columns={columns}
          data={data?.data || []}
          isLoading={isLoading}
          onRowClick={(item) => navigate(`/appointments/${item.id}`)}
          pagination={
            data?.meta
              ? {
                  current_page: data.meta.current_page,
                  last_page: data.meta.last_page,
                  per_page: data.meta.per_page,
                  total: data.meta.total,
                  onPageChange: setPage,
                }
              : undefined
          }
          emptyTitle="No appointments"
          emptyDescription="No appointments match the selected filters"
        />
      </Card>

      <ConfirmDialog
        open={!!cancelId}
        onOpenChange={() => setCancelId(null)}
        title="Cancel appointment"
        description="Are you sure you want to cancel this appointment?"
        confirmText="Cancel appointment"
        onConfirm={() => {
          if (cancelId) {
            cancelAppointment.mutate(
              { id: cancelId, reason: 'Cancelled by user' },
              { onSettled: () => setCancelId(null) }
            )
          }
        }}
        isLoading={cancelAppointment.isPending}
      />
    </div>
  )
}
