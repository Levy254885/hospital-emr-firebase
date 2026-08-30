import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppointment, useConfirmAppointment, useCancelAppointment, useCompleteAppointment } from '@/hooks/useAppointments'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { StatusBadge, Badge } from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalFooter } from '@/components/ui/Modal'
import { PageLoadingSpinner } from '@/components/ui/LoadingSpinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'
import { ArrowLeft, Edit, Calendar, Clock, User, FileText, CheckCircle, Ban } from 'lucide-react'

export default function AppointmentDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const { data: appointment, isLoading } = useAppointment(id!)
  const confirmAppointment = useConfirmAppointment()
  const cancelAppointment = useCancelAppointment()
  const completeAppointment = useCompleteAppointment()

  if (isLoading) return <PageLoadingSpinner />
  if (!appointment) return <EmptyState title="Cita no encontrada" />

  const typeLabels: Record<string, string> = { consultation: 'Consulta', follow_up: 'Seguimiento', emergency: 'Emergencia', telemedicine: 'Telemedicina' }
  const statusLabels: Record<string, string> = { scheduled: 'Programada', confirmed: 'Confirmada', in_progress: 'En Progreso', completed: 'Completada', cancelled: 'Cancelada', no_show: 'No Asistio' }
  const canConfirm = appointment.status === 'scheduled'
  const canComplete = appointment.status === 'confirmed' || appointment.status === 'in_progress'
  const canCancel = appointment.status === 'scheduled' || appointment.status === 'confirmed'

  const handleConfirm = async () => {
    try { await confirmAppointment.mutateAsync(appointment.id); toast.success('Cita confirmada correctamente') }
    catch { toast.error('Error al confirmar la cita') }
  }
  const handleComplete = async () => {
    try { await completeAppointment.mutateAsync(appointment.id); toast.success('Cita marcada como completada') }
    catch { toast.error('Error al completar la cita') }
  }
  const handleCancel = async () => {
    if (!cancelReason.trim()) { toast.error('Debe ingresar un motivo de cancelacion'); return }
    try {
      await cancelAppointment.mutateAsync({ id: appointment.id, reason: cancelReason })
      toast.success('Cita cancelada correctamente')
      setCancelDialogOpen(false)
      setCancelReason('')
    } catch { toast.error('Error al cancelar la cita') }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" /></Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Detalle de Cita</h1>
            <p className="text-sm text-gray-500">{appointment.patient?.first_name} {appointment.patient?.last_name} — {formatDate(appointment.appointment_date)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {canConfirm && <Button variant="outline" leftIcon={<CheckCircle className="h-4 w-4" />} onClick={handleConfirm} isLoading={confirmAppointment.isPending}>Confirmar</Button>}
          {canComplete && <Button variant="outline" leftIcon={<CheckCircle className="h-4 w-4" />} onClick={handleComplete} isLoading={completeAppointment.isPending}>Completar</Button>}
          {canCancel && <Button variant="outline" leftIcon={<Ban className="h-4 w-4" />} onClick={() => setCancelDialogOpen(true)}>Cancelar Cita</Button>}
          <Button leftIcon={<Edit className="h-4 w-4" />} onClick={() => navigate(`/appointments/${id}/edit`)}>Editar</Button>
        </div>
      </div>
      <div className="flex gap-3">
        <StatusBadge status={appointment.status} />
        {appointment.type && <Badge variant="primary">{typeLabels[appointment.type] || appointment.type}</Badge>}
      </div>
      <Card variant="elevated">
        <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5 text-primary-600" />Informacion de la Cita</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <InfoItem label="Fecha" value={formatDate(appointment.appointment_date)} icon={<Calendar className="h-4 w-4 text-gray-400" />} />
            <InfoItem label="Horario" value={`${appointment.start_time} - ${appointment.end_time}`} icon={<Clock className="h-4 w-4 text-gray-400" />} />
            <InfoItem label="Estado" value={statusLabels[appointment.status] || appointment.status} />
            {appointment.confirmed_at && <InfoItem label="Confirmado el" value={formatDate(appointment.confirmed_at)} />}
            {appointment.cancelled_at && <InfoItem label="Cancelado el" value={formatDate(appointment.cancelled_at)} />}
            {appointment.cancellation_reason && <InfoItem label="Motivo de cancelacion" value={appointment.cancellation_reason} />}
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card variant="elevated">
          <CardHeader><CardTitle className="flex items-center gap-2"><User className="h-5 w-5 text-primary-600" />Paciente</CardTitle></CardHeader>
          <CardContent>
            {appointment.patient ? (
              <div className="cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors" onClick={() => navigate(`/patients/${appointment.patient_id}`)}>
                <p className="font-medium text-gray-900">{appointment.patient.first_name} {appointment.patient.last_name}</p>
                <p className="text-sm text-gray-500">{appointment.patient.document_type}: {appointment.patient.document_number}</p>
                {appointment.patient.phone && <p className="text-sm text-gray-500">Tel: {appointment.patient.phone}</p>}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Paciente ID: {appointment.patient_id}</p>
            )}
          </CardContent>
        </Card>
        <Card variant="elevated">
          <CardHeader><CardTitle className="flex items-center gap-2"><User className="h-5 w-5 text-primary-600" />Medico</CardTitle></CardHeader>
          <CardContent>
            {appointment.doctor ? (
              <div>
                <p className="font-medium text-gray-900">Dr. {appointment.doctor.first_name} {appointment.doctor.last_name}</p>
                {appointment.doctor.email && <p className="text-sm text-gray-500">{appointment.doctor.email}</p>}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Medico ID: {appointment.doctor_id}</p>
            )}
          </CardContent>
        </Card>
      </div>
      <Card variant="elevated">
        <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary-600" />Detalles Clinicos</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Motivo de la consulta</p>
              <p className="text-gray-900">{appointment.reason || 'No especificado'}</p>
            </div>
            {appointment.notes && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Notas</p>
                <p className="text-gray-900 whitespace-pre-wrap">{appointment.notes}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      <Modal open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <ModalContent size="sm">
          <ModalHeader>
            <ModalTitle>Cancelar Cita</ModalTitle>
            <ModalDescription>Ingrese el motivo de la cancelacion</ModalDescription>
          </ModalHeader>
          <div className="px-6">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Motivo <span className="text-red-500">*</span></label>
            <textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} rows={3}
              className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 resize-y"
              placeholder="Describa el motivo de la cancelacion..." />
          </div>
          <ModalFooter>
            <Button variant="ghost" onClick={() => setCancelDialogOpen(false)} disabled={cancelAppointment.isPending}>Cerrar</Button>
            <Button variant="danger" onClick={handleCancel} isLoading={cancelAppointment.isPending}>Cancelar Cita</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}

function InfoItem({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div>
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <div className="flex items-center gap-2">{icon}<p className="text-gray-900 font-medium">{value}</p></div>
    </div>
  )
}
