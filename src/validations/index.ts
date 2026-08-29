import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Correo electronico invalido'),
  password: z.string().min(6, 'La contrasena debe tener al menos 6 caracteres'),
  institution_id: z.string().optional(),
  remember_me: z.boolean().optional(),
})
export type LoginFormData = z.infer<typeof loginSchema>

export const patientSchema = z.object({
  first_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  last_name: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  second_last_name: z.string().optional(),
  birth_date: z.string().min(1, 'La fecha de nacimiento es requerida'),
  gender: z.enum(['M', 'F', 'O'], { message: 'El sexo es requerido' }),
  document_type: z.enum(['CI', 'PASSPORT', 'OTHER'], { message: 'El tipo de documento es requerido' }),
  document_number: z.string().min(1, 'El numero de documento es requerido'),
  phone: z.string().optional(),
  email: z.string().email('Correo electronico invalido').optional().or(z.literal('')),
  address: z.string().optional(),
  blood_type: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
  allergies: z.string().optional(),
  medical_history: z.string().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  insurance_provider: z.string().optional(),
  insurance_number: z.string().optional(),
})
export type PatientFormData = z.infer<typeof patientSchema>

export const medicalRecordSchema = z.object({ patient_id: z.string().min(1, 'El paciente es requerido') })
export type MedicalRecordFormData = z.infer<typeof medicalRecordSchema>

export const consultationSchema = z.object({
  medical_record_id: z.string().min(1, 'La historia clinica es requerida'),
  date: z.string().min(1, 'La fecha es requerida'),
  chief_complaint: z.string().min(1, 'El motivo de consulta es requerido'),
  present_illness: z.string().min(1, 'La enfermedad actual es requerida'),
  physical_examination: z.string().optional(),
  assessment: z.string().optional(),
  plan: z.string().optional(),
})
export type ConsultationFormData = z.infer<typeof consultationSchema>

export const soapNoteSchema = z.object({
  subjective: z.string().min(1, 'La seccion Subjetivo es requerida'),
  objective: z.string().min(1, 'La seccion Objetivo es requerida'),
  assessment: z.string().min(1, 'La seccion Evaluacion es requerida'),
  plan: z.string().min(1, 'La seccion Plan es requerido'),
})
export type SoapNoteFormData = z.infer<typeof soapNoteSchema>

export const vitalSignSchema = z.object({
  temperature: z.number().min(30).max(45).optional(),
  heart_rate: z.number().min(30).max(300).optional(),
  respiratory_rate: z.number().min(5).max(60).optional(),
  blood_pressure_systolic: z.number().min(50).max(300).optional(),
  blood_pressure_diastolic: z.number().min(20).max(200).optional(),
  oxygen_saturation: z.number().min(0).max(100).optional(),
  weight: z.number().min(0).max(500).optional(),
  height: z.number().min(0).max(300).optional(),
})
export type VitalSignFormData = z.infer<typeof vitalSignSchema>

export const prescriptionSchema = z.object({
  consultation_id: z.string().min(1, 'La consulta es requerida'),
  notes: z.string().optional(),
  valid_until: z.string().optional(),
  items: z.array(z.object({
    medication_id: z.string().min(1, 'El medicamento es requerido'),
    dosage: z.string().min(1, 'La dosis es requerida'),
    frequency: z.string().min(1, 'La frecuencia es requerida'),
    duration: z.string().min(1, 'La duracion es requerida'),
    quantity: z.number().min(1, 'La cantidad debe ser mayor a 0'),
    instructions: z.string().optional(),
  })).min(1, 'Debe agregar al menos un medicamento'),
})
export type PrescriptionFormData = z.infer<typeof prescriptionSchema>

export const appointmentSchema = z.object({
  patient_id: z.string().min(1, 'El paciente es requerido'),
  doctor_id: z.string().min(1, 'El doctor es requerido'),
  date: z.string().min(1, 'La fecha es requerida'),
  start_time: z.string().min(1, 'La hora de inicio es requerida'),
  end_time: z.string().min(1, 'La hora de fin es requerida'),
  type: z.enum(['consultation', 'follow_up', 'emergency', 'procedure', 'lab'], { message: 'El tipo de cita es requerido' }),
  reason: z.string().optional(),
  notes: z.string().optional(),
  room: z.string().optional(),
})
export type AppointmentFormData = z.infer<typeof appointmentSchema>

export const labOrderSchema = z.object({
  patient_id: z.string().min(1, 'El paciente es requerido'),
  consultation_id: z.string().optional(),
  priority: z.enum(['routine', 'urgent', 'stat'], { message: 'La prioridad es requerida' }),
  clinical_info: z.string().optional(),
  items: z.array(z.object({ test_id: z.string().min(1, 'El examen es requerido') })).min(1, 'Debe agregar al menos un examen'),
})
export type LabOrderFormData = z.infer<typeof labOrderSchema>

export const invoiceSchema = z.object({
  patient_id: z.string().min(1, 'El paciente es requerido'),
  appointment_id: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(z.object({
    description: z.string().min(1, 'La descripcion es requerida'),
    quantity: z.number().min(1, 'La cantidad debe ser mayor a 0'),
    unit_price: z.number().min(0, 'El precio debe ser mayor o igual a 0'),
    service_code: z.string().optional(),
  })).min(1, 'Debe agregar al menos un servicio'),
})
export type InvoiceFormData = z.infer<typeof invoiceSchema>

export const paymentSchema = z.object({
  invoice_id: z.string().min(1, 'La factura es requerida'),
  amount: z.number().min(0.01, 'El monto debe ser mayor a 0'),
  method: z.enum(['cash', 'card', 'transfer', 'insurance', 'other'], { message: 'El metodo de pago es requerido' }),
  reference: z.string().optional(),
  notes: z.string().optional(),
})
export type PaymentFormData = z.infer<typeof paymentSchema>

export const hospitalizationSchema = z.object({
  patient_id: z.string().min(1, 'El paciente es requerido'),
  admission_date: z.string().min(1, 'La fecha de ingreso es requerida'),
  reason: z.string().min(1, 'El motivo es requerido'),
  diagnosis: z.string().optional(),
  bed_id: z.string().optional(),
  doctor_id: z.string().min(1, 'El doctor es requerido'),
  department: z.string().optional(),
  notes: z.string().optional(),
})
export type HospitalizationFormData = z.infer<typeof hospitalizationSchema>

export const emergencyTriageSchema = z.object({
  patient_id: z.string().min(1, 'El paciente es requerido'),
  arrival_time: z.string().min(1, 'La hora de llegada es requerida'),
  chief_complaint: z.string().min(1, 'El motivo de consulta es requerido'),
  triage_level: z.number().min(1).max(5),
  notes: z.string().optional(),
})
export type EmergencyTriageFormData = z.infer<typeof emergencyTriageSchema>

export const forgotPasswordSchema = z.object({ email: z.string().email('Correo electronico invalido') })
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'El token es requerido'),
  password: z.string().min(8, 'La contrasena debe tener al menos 8 caracteres'),
  password_confirmation: z.string().min(1, 'Confirma tu contrasena'),
}).refine((data) => data.password === data.password_confirmation, {
  message: 'Las contrasenas no coinciden',
  path: ['password_confirmation'],
})
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
