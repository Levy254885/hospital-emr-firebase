import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateAppointment } from '@/hooks/useAppointments'
import { usePatients } from '@/hooks/usePatients'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import { ArrowLeft, Save, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'

const appointmentCreateSchema = z.object({
  patient_id: z.string().min(1, 'El paciente es requerido'),
  doctor_id: z.string().min(1, 'El medico es requerido'),
  appointment_date: z.string().min(1, 'La fecha es requerida'),
  start_time: z.string().min(1, 'La hora de inicio es requerida'),
  duration_minutes: z.string().optional(),
  type: z.string().optional(),
  reason: z.string().optional(),
  notes: z.string().optional(),
})
type AppointmentCreateFormData = z.infer<typeof appointmentCreateSchema>

export default function AppointmentCreatePage() {
  const navigate = useNavigate()
  const createAppointment = useCreateAppointment()
  const { data: patientsData } = usePatients({ per_page: 100 })
  const { register, handleSubmit, formState: { errors } } = useForm<AppointmentCreateFormData>({
    resolver: zodResolver(appointmentCreateSchema),
    defaultValues: { duration_minutes: '30', type: 'consultation' },
  })

  const onSubmit = async (data: AppointmentCreateFormData) => {
    try {
      const duration = data.duration_minutes ? parseInt(data.duration_minutes) : 30
      await createAppointment.mutateAsync({
        patient_id: data.patient_id,
        doctor_id: data.doctor_id,
        scheduled_at: `${data.appointment_date}T${data.start_time}:00`,
        duration_minutes: duration,
        type: data.type || undefined,
        reason: data.reason || undefined,
        notes: data.notes || undefined,
      })
      toast.success('Cita creada correctamente')
      navigate('/appointments')
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Error al crear la cita')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" /></Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nueva Cita</h1>
          <p className="text-sm text-gray-500">Agende una nueva cita medica</p>
        </div>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card variant="elevated">
          <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5 text-primary-600" />Datos de la Cita</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select label="Paciente" required placeholder="Seleccionar paciente"
                options={patientsData?.data?.map((p) => ({ value: String(p.id), label: `${p.first_name} ${p.last_name} — ${p.document_number}` })) || []}
                {...register('patient_id')} error={errors.patient_id?.message} />
              <Input label="ID del Medico" required placeholder="Ingrese el ID del medico" {...register('doctor_id')} error={errors.doctor_id?.message} />
            </div>
          </CardContent>
        </Card>
        <Card variant="elevated">
          <CardHeader><CardTitle>Horario</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Fecha <span className="text-red-500 ml-1">*</span></label>
                <input type="date" {...register('appointment_date')} min={new Date().toISOString().split('T')[0]}
                  className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
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
              <Select label="Tipo de Cita" options={[{ value: 'consultation', label: 'Consulta' }, { value: 'follow_up', label: 'Seguimiento' }, { value: 'emergency', label: 'Emergencia' }, { value: 'telemedicine', label: 'Telemedicina' }]} {...register('type')} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Motivo</label>
                <textarea {...register('reason')} rows={2} placeholder="Motivo de la consulta..."
                  className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 resize-y" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Notas</label>
                <textarea {...register('notes')} rows={3} placeholder="Notas adicionales..."
                  className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 resize-y" />
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancelar</Button>
          <Button type="submit" leftIcon={<Save className="h-4 w-4" />} isLoading={createAppointment.isPending}>Crear Cita</Button>
        </div>
      </form>
    </div>
  )
}
