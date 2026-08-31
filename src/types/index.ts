export interface User {
  id: string
  email: string
  name: string
  first_name?: string
  last_name?: string
  phone?: string
  role: Role
  institution_id: string
  is_active: boolean
  last_login?: string
  created_at: string
  updated_at: string
}

export interface Institution {
  id: string
  name: string
  slug: string
  logo_url?: string
  address?: string
  phone?: string
  email?: string
  website?: string
  type: 'hospital' | 'clinic' | 'laboratory' | 'pharmacy'
  is_active: boolean
  created_at: string
}

export interface Role {
  id: string
  name: string
  description?: string
  permissions: Permission[]
  is_system: boolean
  created_at: string
}

export interface Permission {
  id: string
  name: string
  description?: string
  module: string
  action: string
}

export interface Patient {
  id: string
  medical_record_number: string
  first_name: string
  last_name: string
  second_last_name?: string
  birth_date: string
  gender: 'M' | 'F' | 'O'
  document_type: 'CI' | 'PASSPORT' | 'OTHER'
  document_number: string
  phone?: string
  email?: string
  address?: string
  blood_type?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'
  allergies?: string
  medical_history?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  insurance_provider?: string
  insurance_number?: string
  photo_url?: string
  is_active: boolean
  institution_id: string
  created_at: string
  updated_at: string
}

export interface MedicalRecord {
  id: string
  patient_id: string
  patient?: Patient
  doctor_id?: string
  doctor?: User
  record_number: string
  type?: string
  status: 'active' | 'archived' | 'transferred' | 'draft' | 'closed'
  institution_id: string
  created_by?: string
  consultation?: Consultation
  soapNote?: SoapNote
  diagnoses?: Diagnosis[]
  evolutions?: Evolution[]
  vitalSigns?: VitalSign[]
  antecedent?: any
  created_at: string
  updated_at: string
}

export interface Consultation {
  id: string
  medical_record_id: string
  medical_record?: MedicalRecord
  consultation_number: string
  date: string
  chief_complaint: string
  present_illness: string
  physical_examination?: string
  assessment?: string
  plan?: string
  status: 'in_progress' | 'completed' | 'cancelled'
  doctor_id: string
  doctor?: User
  appointment_id?: string
  created_at: string
  updated_at: string
}

export interface SoapNote {
  id: string
  consultation_id: string
  consultation?: Consultation
  subjective: string
  objective: string
  assessment: string
  plan: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface Evolution {
  id: string
  consultation_id: string
  consultation?: Consultation
  note: string
  author_id: string
  author?: User
  created_at: string
}

export interface VitalSign {
  id: string
  consultation_id: string
  consultation?: Consultation
  temperature?: number
  heart_rate?: number
  respiratory_rate?: number
  blood_pressure_systolic?: number
  blood_pressure_diastolic?: number
  oxygen_saturation?: number
  weight?: number
  height?: number
  bmi?: number
  recorded_at: string
  recorded_by: string
  created_at: string
}

export interface Diagnosis {
  id: string
  consultation_id: string
  consultation?: Consultation
  code: string
  name: string
  type: 'primary' | 'secondary' | 'differential'
  status: 'active' | 'resolved' | 'ruled_out'
  notes?: string
  created_at: string
}

export interface Appointment {
  id: string
  patient_id: string
  patient?: Patient
  doctor_id: string
  doctor?: User
  specialty_id?: string
  specialty?: { id: string; name: string }
  appointment_date: string
  start_time: string
  end_time: string
  type?: 'consultation' | 'follow_up' | 'emergency' | 'procedure' | 'lab' | 'telemedicine'
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
  reason?: string
  notes?: string
  room?: string
  confirmed_at?: string
  cancelled_at?: string
  cancellation_reason?: string
  institution_id: string
  created_at: string
  updated_at: string
}

export interface Prescription {
  id: string
  consultation_id: string
  consultation?: Consultation
  prescription_number: string
  notes?: string
  status: 'active' | 'dispensed' | 'cancelled' | 'expired'
  issued_date: string
  valid_until?: string
  doctor_id: string
  doctor?: User
  patient_id: string
  patient?: Patient
  items: PrescriptionItem[]
  created_at: string
  updated_at: string
}

export interface PrescriptionItem {
  id: string
  prescription_id: string
  medication_id: string
  medication?: Medication
  dosage: string
  frequency: string
  duration: string
  quantity: number
  instructions?: string
  dispensed: boolean
  dispensed_at?: string
}

export interface Medication {
  id: string
  name: string
  generic_name?: string
  category?: string
  category_id?: number
  presentation?: string
  pharmaceutical_form?: string
  concentration: string
  manufacturer?: string
  requires_prescription: boolean
  is_controlled?: boolean
  stock_quantity?: number
  current_stock?: number
  min_stock?: number
  minimum_stock?: number
  unit_price: number
  cost_price?: number
  is_active: boolean
  institution_id: string
  created_at: string
  updated_at: string
}

export interface LabOrder {
  id: string
  patient_id: string
  patient?: Patient
  consultation_id?: string
  consultation?: Consultation
  order_number: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'routine' | 'urgent' | 'stat'
  clinical_info?: string
  doctor_id: string
  doctor?: User
  items: LabOrderItem[]
  institution_id: string
  created_at: string
  updated_at: string
}

export interface LabOrderItem {
  id: string
  lab_order_id: string
  test_id: string
  test_name: string
  test_code: string
  status: 'pending' | 'in_progress' | 'completed'
  result?: LabResult
}

export interface LabResult {
  id: string
  lab_order_item_id: string
  value: string
  unit?: string
  reference_range?: string
  is_abnormal: boolean
  notes?: string
  performed_by: string
  performed_at: string
  validated_by?: string
  validated_at?: string
  created_at: string
}

export interface ServiceCatalogItem {
  id: string
  institution_id: string
  name: string
  code: string
  category: string
  description?: string
  price: number
  insurance_price?: number
  is_active: boolean
  requires_authorization: boolean
  created_at: string
  updated_at: string
}

export interface Invoice {
  id: string
  invoice_number: string
  patient_id: string
  patient?: Patient | null
  appointment_id?: string
  appointment?: Appointment
  subtotal: number
  tax_amount: number
  tax?: number
  discount: number
  total_amount: number
  /** Alias used by some Firestore docs */
  total?: number
  amount_paid?: number
  balance?: number
  payment_status: 'pending' | 'paid' | 'partial' | 'cancelled'
  status?: 'pending' | 'paid' | 'partial' | 'cancelled'
  invoice_date: string
  due_date?: string
  notes?: string
  items: InvoiceItem[]
  payments?: Payment[]
  institution_id: string
  created_by?: string
  created_at?: string
  updated_at?: string
  clinic_name?: string
}

export interface InvoiceItem {
  id?: string
  invoice_id?: string
  service_catalog_id?: number
  description: string
  quantity: number
  unit_price: number
  discount?: number
  subtotal?: number
  total?: number
}

export interface Payment {
  id: string
  invoice_id: string
  invoice?: Invoice
  amount: number
  payment_method: 'cash' | 'card' | 'transfer' | 'insurance' | 'mixed'
  reference_number?: string
  notes?: string
  received_by: string
  received_at: string
  status: 'completed' | 'refunded' | 'pending'
  created_at: string
}

export interface Hospitalization {
  id: string
  patient_id: string
  patient?: Patient
  admission_date: string
  discharge_date?: string
  reason: string
  diagnosis?: string
  status: 'active' | 'discharged' | 'transferred' | 'deceased'
  bed_id?: string
  bed?: Bed
  doctor_id: string
  doctor?: User
  department?: string
  notes?: string
  institution_id: string
  created_at: string
  updated_at: string
}

export interface Bed {
  id: string
  number: string
  room_id: string
  room?: Room
  status: 'available' | 'occupied' | 'maintenance' | 'reserved'
  type: 'general' | 'icu' | 'emergency' | 'pediatric' | 'maternity'
  current_patient_id?: string
  current_patient?: Patient
}

export interface Room {
  id: string
  number: string
  name?: string
  floor: number
  building_id: string
  building?: Building
  type: 'general' | 'icu' | 'emergency' | 'operating' | 'recovery' | 'maternity' | 'pediatric'
  capacity: number
  beds: Bed[]
  is_active: boolean
}

export interface Building {
  id: string
  name: string
  code: string
  floors: number
  is_active: boolean
  rooms: Room[]
}

export interface EmergencyTriage {
  id: string
  patient_id: string
  patient?: Patient
  arrival_time: string
  chief_complaint: string
  triage_level: 1 | 2 | 3 | 4 | 5
  vital_signs?: VitalSign
  notes?: string
  status: 'waiting' | 'in_treatment' | 'admitted' | 'discharged' | 'transferred'
  doctor_id?: string
  doctor?: User
  institution_id: string
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  link?: string
  created_at: string
}

export interface Setting {
  id: string
  key: string
  value: string
  category: string
  description?: string
}

export interface AuditLog {
  id: string
  user_id: string
  user?: User
  action: string
  resource: string
  resource_id?: string
  details?: Record<string, unknown>
  ip_address?: string
  user_agent?: string
  created_at: string
}

export interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}

export interface DashboardStats {
  summary: {
    total_patients: number
    active_hospitalizations: number
    today_appointments: number
    pending_lab_orders: number
    emergency_waiting: number
    monthly_revenue: number
    pending_payments: number
  }
  recent_appointments: Appointment[]
  recent_patients: Patient[]
  emergency_waiting_list: EmergencyTriage[]
}
