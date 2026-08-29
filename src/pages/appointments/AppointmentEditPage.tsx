import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAppointment, useUpdateAppointment } from '@/hooks/useAppointments'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import { PageLoadingSpinner } from '@/components/ui/LoadingSpinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { ArrowLeft, Save, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'

const appointmentEditSchema = z.object({
  doctor_id: z.string().min(1, 'El medico es requerido'),
  appointment_date: z.string().min(1, 'La fecha es requerida'),
  start_time: z.string().min(1, 'La hora de inicio es requerida'),
  duration_minutes: z.string().optional(),
  type: z.string().optional(),
  reason: z.string().optional(),
  notes: z.string().optional(),
})
type AppointmentEditFormData = z.infer<typeof appointmentEditSchema>

export default function AppointmentEditPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { data: appointment, isLoading } = useAppointment(id!)
  const updateAppointment = useUpdateAppointment()
  const { register, handleSubmit, reset, formState: { errors } } = useForm<AppointmentEditFormData>({
    resolver: zodResolver(appointmentEditSchema),
  })

  useEffect(() => {
    if (appointment) {
      reset({
        doctor_id: String(appointment.doctor_id),
        appointment_date: appointment.appointment_date,
        start_time: appointment.start_time,
        duration_minutes: '30',
        type: appointment.type || 'consultation',
        reason: appointment.reason || '',
        notes: appointment.notes || '',
      })
    }
  }, [appointment, reset])

  if (isLoading) return <PageLoadingSpinner />
  if (!appointment) return <EmptyState title="Cita no encontrada" />

  const onSubmit = async (data: AppointmentEditFormData) => {
    try {
      await updateAppointment.mutateAsync({
        id: appointment.id,
        data: {
          doctor_id: data.doctor_id,
          appointment_date: data.appointment_date,
          start_time: data.start_time,
          type: (data.type as any) || undefined,
          reason: data.reason || undefined,
          notes: data.notes || undefined,
        },
      })
      toast.success('Cita actualizada correctamente')
      navigate(`/appointments/${id}`)
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Error al actualizar la cita')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" /></Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Editar Cita</h1>
          <p className="text-sm text-gray-500">{appointment.patient?.first_name} {appointment.patient?.last_name} — {appointment.appointment_date}</p>
        </div>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card variant="elevated">
          <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5 text-primary-600" />Datos de la Cita</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="ID del Medico" required {...register('doctor_id')} error={errors.doctor_id?.message} />
              <Select label="Tipo de Cita" options={[{ value: 'consultation', label: 'Consulta' }, { value: 'follow_up', label: 'Seguimiento' }, { value: 'emergency', label: 'Emergencia' }, { value: 'telemedicine', label: 'Telemedicina' }]} {...register('type')} />
            </div>
          </CardContent>
        </Card>
        <Card variant="elevated">
          <CardHeader><CardTitle>Horario</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Fecha <span className="text-red-500 ml-1">*</span></label>
                <input type="date" {...register('appointment_date')} className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
                {errors.appointment_date && <p className="mt-1.5 text-sm text-red-600">{errors.appointment_date.message}</p>}
              </div>
              <Input label="Hora de Inicio" required type="time" {...register('start_time')} error={errors.start_time?.message} />
              <Select label="Duracion" options={[{ value: '15', label: '15 minutos' }, { value: '30', label: '30 minutos' }, { value: '45', label: '45 minutos' }, { value: '60', label: '1 hora' }, { value: '90', label: '1.5 horas' }, { value: '120', label: '2 horas' }]} {...register('duration_minutes')} />
            </div>
          </CardContent>
        </Card>
        <Card variant="elevated">
          <CardHeader><CardTitle>Detalles</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Motivo</label>
                <textarea {...register('reason')} rows={2} placeholder="Motivo de la consulta..." className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 resize-y" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Notas</label>
                <textarea {...register('notes')} rows={2} placeholder="Notas adicionales..." className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 resize-y" />
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancelar</Button>
          <Button type="submit" leftIcon={<Save className="h-4 w-4" />} isLoading={updateAppointment.isPending}>Guardar Cambios</Button>
        </div>
      </form>
    </div>
  )
}
