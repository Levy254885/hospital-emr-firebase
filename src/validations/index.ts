import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  institution_id: z.string().optional(),
  remember_me: z.boolean().optional(),
})
export type LoginFormData = z.infer<typeof loginSchema>

export const patientSchema = z.object({
  first_name: z.string().min(2, 'First name must be at least 2 characters'),
  last_name: z.string().min(2, 'Last name must be at least 2 characters'),
  second_last_name: z.string().optional(),
  birth_date: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['M', 'F', 'O'], { message: 'Gender is required' }),
  document_type: z.enum(['CI', 'PASSPORT', 'OTHER'], { message: 'Document type is required' }),
  document_number: z.string().min(1, 'Document number is required'),
  phone: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
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

export const medicalRecordSchema = z.object({
  patient_id: z.string().min(1, 'Patient is required'),
})
export type MedicalRecordFormData = z.infer<typeof medicalRecordSchema>

export const consultationSchema = z.object({
  medical_record_id: z.string().min(1, 'Medical record is required'),
  date: z.string().min(1, 'Date is required'),
  chief_complaint: z.string().min(1, 'Reason for visit is required'),
  present_illness: z.string().min(1, 'Present illness is required'),
  physical_examination: z.string().optional(),
  assessment: z.string().optional(),
  plan: z.string().optional(),
})
export type ConsultationFormData = z.infer<typeof consultationSchema>

export const soapNoteSchema = z.object({
  subjective: z.string().min(1, 'Subjective section is required'),
  objective: z.string().min(1, 'Objective section is required'),
  assessment: z.string().min(1, 'Assessment section is required'),
  plan: z.string().min(1, 'Plan section is required'),
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
  consultation_id: z.string().min(1, 'Consultation is required'),
  notes: z.string().optional(),
  valid_until: z.string().optional(),
  items: z
    .array(
      z.object({
        medication_id: z.string().min(1, 'Medication is required'),
        dosage: z.string().min(1, 'Dosage is required'),
        frequency: z.string().min(1, 'Frequency is required'),
        duration: z.string().min(1, 'Duration is required'),
        quantity: z.number().min(1, 'Quantity must be greater than 0'),
        instructions: z.string().optional(),
      })
    )
    .min(1, 'Add at least one medication'),
})
export type PrescriptionFormData = z.infer<typeof prescriptionSchema>

export const appointmentSchema = z.object({
  patient_id: z.string().min(1, 'Patient is required'),
  doctor_id: z.string().min(1, 'Doctor is required'),
  date: z.string().min(1, 'Date is required'),
  start_time: z.string().min(1, 'Start time is required'),
  end_time: z.string().min(1, 'End time is required'),
  type: z.enum(['consultation', 'follow_up', 'emergency', 'procedure', 'lab'], {
    message: 'Appointment type is required',
  }),
  reason: z.string().optional(),
  notes: z.string().optional(),
  room: z.string().optional(),
})
export type AppointmentFormData = z.infer<typeof appointmentSchema>

export const labOrderSchema = z.object({
  patient_id: z.string().min(1, 'Patient is required'),
  consultation_id: z.string().optional(),
  priority: z.enum(['routine', 'urgent', 'stat'], { message: 'Priority is required' }),
  clinical_info: z.string().optional(),
  items: z
    .array(z.object({ test_id: z.string().min(1, 'Test is required' }))
    .min(1, 'Add at least one test'),
})
export type LabOrderFormData = z.infer<typeof labOrderSchema>

export const invoiceSchema = z.object({
  patient_id: z.string().min(1, 'Patient is required'),
  appointment_id: z.string().optional(),
  notes: z.string().optional(),
  items: z
    .array(
      z.object({
        description: z.string().min(1, 'Description is required'),
        quantity: z.number().min(1, 'Quantity must be greater than 0'),
        unit_price: z.number().min(0, 'Price must be 0 or greater'),
        service_code: z.string().optional(),
      })
    )
    .min(1, 'Add at least one service'),
})
export type InvoiceFormData = z.infer<typeof invoiceSchema>

export const paymentSchema = z.object({
  invoice_id: z.string().min(1, 'Invoice is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  method: z.enum(['cash', 'card', 'transfer', 'insurance', 'other'], {
    message: 'Payment method is required',
  }),
  reference: z.string().optional(),
  notes: z.string().optional(),
})
export type PaymentFormData = z.infer<typeof paymentSchema>

export const hospitalizationSchema = z.object({
  patient_id: z.string().min(1, 'Patient is required'),
  admission_date: z.string().min(1, 'Admission date is required'),
  reason: z.string().min(1, 'Reason is required'),
  diagnosis: z.string().optional(),
  bed_id: z.string().optional(),
  doctor_id: z.string().min(1, 'Doctor is required'),
  department: z.string().optional(),
  notes: z.string().optional(),
})
export type HospitalizationFormData = z.infer<typeof hospitalizationSchema>

export const emergencyTriageSchema = z.object({
  patient_id: z.string().min(1, 'Patient is required'),
  arrival_time: z.string().min(1, 'Arrival time is required'),
  chief_complaint: z.string().min(1, 'Chief complaint is required'),
  triage_level: z.number().min(1).max(5),
  notes: z.string().optional(),
})
export type EmergencyTriageFormData = z.infer<typeof emergencyTriageSchema>

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email'),
})
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Token is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    password_confirmation: z.string().min(1, 'Confirm your password'),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  })
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
