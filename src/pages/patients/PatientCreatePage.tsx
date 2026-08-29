import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { patientSchema, type PatientFormData } from '@/validations'
import { useCreatePatient } from '@/hooks/usePatients'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import { ArrowLeft, Save, UserPlus } from 'lucide-react'

export default function PatientCreatePage() {
  const navigate = useNavigate()
  const createPatient = useCreatePatient()
  const { register, handleSubmit, formState: { errors } } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: { gender: 'M', document_type: 'CI' },
  })

  const onSubmit = async (data: PatientFormData) => {
    try {
      const patient = await createPatient.mutateAsync(data as any)
      navigate(`/patients/${patient.id}`)
    } catch (error) {
      console.error('Error creating patient:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" /></Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Registrar Paciente</h1>
          <p className="text-sm text-gray-500">Complete los datos del nuevo paciente</p>
        </div>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card variant="elevated">
          <CardHeader><CardTitle className="flex items-center gap-2"><UserPlus className="h-5 w-5 text-primary-600" />Datos Personales</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Input label="Nombre" required {...register('first_name')} error={errors.first_name?.message} />
              <Input label="Apellido Paterno" required {...register('last_name')} error={errors.last_name?.message} />
              <Input label="Apellido Materno" {...register('second_last_name')} />
              <Select label="Tipo de Documento" required options={[{ value: 'CI', label: 'Cedula de Identidad' }, { value: 'PASSPORT', label: 'Pasaporte' }, { value: 'OTHER', label: 'Otro' }]} {...register('document_type')} error={errors.document_type?.message} />
              <Input label="Numero de Documento" required {...register('document_number')} error={errors.document_number?.message} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Fecha de Nacimiento <span className="text-red-500 ml-1">*</span></label>
                <input type="date" {...register('birth_date')} className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
                {errors.birth_date && <p className="mt-1.5 text-sm text-red-600">{errors.birth_date.message}</p>}
              </div>
              <Select label="Sexo" required options={[{ value: 'M', label: 'Masculino' }, { value: 'F', label: 'Femenino' }, { value: 'O', label: 'Otro' }]} {...register('gender')} error={errors.gender?.message} />
              <Select label="Tipo de Sangre" options={[{ value: 'A+', label: 'A+' }, { value: 'A-', label: 'A-' }, { value: 'B+', label: 'B+' }, { value: 'B-', label: 'B-' }, { value: 'AB+', label: 'AB+' }, { value: 'AB-', label: 'AB-' }, { value: 'O+', label: 'O+' }, { value: 'O-', label: 'O-' }]} {...register('blood_type')} />
            </div>
          </CardContent>
        </Card>
        <Card variant="elevated">
          <CardHeader><CardTitle>Informacion de Contacto</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Input label="Telefono" {...register('phone')} />
              <Input label="Correo Electronico" type="email" {...register('email')} error={errors.email?.message} />
              <Input label="Direccion" {...register('address')} />
            </div>
          </CardContent>
        </Card>
        <Card variant="elevated">
          <CardHeader><CardTitle>Contacto de Emergencia</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Nombre del Contacto" {...register('emergency_contact_name')} />
              <Input label="Telefono del Contacto" {...register('emergency_contact_phone')} />
            </div>
          </CardContent>
        </Card>
        <Card variant="elevated">
          <CardHeader><CardTitle>Seguro Medico</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Proveedor de Seguro" {...register('insurance_provider')} />
              <Input label="Numero de Poliza" {...register('insurance_number')} />
            </div>
          </CardContent>
        </Card>
        <Card variant="elevated">
          <CardHeader><CardTitle>Historial Medico</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Alergias</label>
                <textarea {...register('allergies')} rows={3} placeholder="Describa alergias conocidas..." className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 resize-y" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Historial Medico</label>
                <textarea {...register('medical_history')} rows={4} placeholder="Enfermedades previas, cirugias, medicamentos..." className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 resize-y" />
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancelar</Button>
          <Button type="submit" leftIcon={<Save className="h-4 w-4" />} isLoading={createPatient.isPending}>Registrar Paciente</Button>
        </div>
      </form>
    </div>
  )
}
