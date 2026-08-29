import {
  COLLECTIONS, createDocument, getDocument, updateDocument, listDocuments,
  writeAuditLog, decrementInventoryStock, listenCollection, where, orderBy, limit,
} from '../firestore'
import type { QueryConstraint, Unsubscribe } from 'firebase/firestore'
import type { Patient, Appointment, MedicalRecord, Prescription } from '@/types'
import { httpsCallable } from 'firebase/functions'
import { functions } from '../firebase'

// ---- PATIENTS ----
export async function listPatients(f: { search?: string; gender?: string; institution_id?: string; per_page?: number } = {}) {
  const c: QueryConstraint[] = [orderBy('created_at', 'desc'), limit(f.per_page || 50)]
  if (f.institution_id) c.unshift(where('institution_id', '==', f.institution_id))
  if (f.gender) c.unshift(where('gender', '==', f.gender))
  let patients = await listDocuments<Patient>(COLLECTIONS.patients, c)
  if (f.search) {
    const s = f.search.toLowerCase()
    patients = patients.filter(p =>
      p.first_name?.toLowerCase().includes(s) || p.last_name?.toLowerCase().includes(s) ||
      p.document_number?.toLowerCase().includes(s) || p.medical_record_number?.toLowerCase().includes(s)
    )
  }
  return { data: patients, meta: { current_page: 1, per_page: patients.length, total: patients.length, last_page: 1 } }
}
export const getPatient = (id: string) => getDocument<Patient>(COLLECTIONS.patients, id)
export async function createPatient(data: Partial<Patient>, userId: string) {
  const p = await createDocument<Patient>(COLLECTIONS.patients, {
    medical_record_number: data.medical_record_number || `MRN-${new Date().getFullYear()}-${Math.floor(Math.random()*900000+100000)}`,
    first_name: data.first_name||'', last_name: data.last_name||'', second_last_name: data.second_last_name||'',
    birth_date: data.birth_date||'', gender: data.gender||'O', document_type: data.document_type||'CI',
    document_number: data.document_number||'', phone: data.phone||'', email: data.email||'',
    address: data.address||'', blood_type: data.blood_type, allergies: data.allergies||'',
    medical_history: data.medical_history||'', emergency_contact_name: data.emergency_contact_name||'',
    emergency_contact_phone: data.emergency_contact_phone||'', insurance_provider: data.insurance_provider||'',
    insurance_number: data.insurance_number||'', photo_url: data.photo_url||'', is_active: true,
    institution_id: data.institution_id||'',
  })
  await writeAuditLog({ action: 'patient.create', entity_type: 'patient', entity_id: p.id, user_id: userId })
  return p
}
export async function updatePatient(id: string, data: Partial<Patient>, userId: string) {
  await updateDocument(COLLECTIONS.patients, id, data as Record<string, unknown>)
  await writeAuditLog({ action: 'patient.update', entity_type: 'patient', entity_id: id, user_id: userId })
}
export async function deletePatient(id: string, userId: string) {
  await updateDocument(COLLECTIONS.patients, id, { is_active: false })
  await writeAuditLog({ action: 'patient.deactivate', entity_type: 'patient', entity_id: id, user_id: userId })
}

// ---- APPOINTMENTS ----
export async function listAppointments(f: { patient_id?: string; doctor_id?: string; status?: string; institution_id?: string } = {}) {
  const c: QueryConstraint[] = [orderBy('appointment_date', 'desc'), limit(100)]
  if (f.institution_id) c.unshift(where('institution_id', '==', f.institution_id))
  if (f.patient_id) c.unshift(where('patient_id', '==', f.patient_id))
  if (f.doctor_id) c.unshift(where('doctor_id', '==', f.doctor_id))
  if (f.status) c.unshift(where('status', '==', f.status))
  return listDocuments<Appointment>(COLLECTIONS.appointments, c)
}
export const getAppointment = (id: string) => getDocument<Appointment>(COLLECTIONS.appointments, id)
export async function createAppointment(data: Partial<Appointment>, userId: string) {
  const a = await createDocument<Appointment>(COLLECTIONS.appointments, {
    patient_id: data.patient_id||'', doctor_id: data.doctor_id||'', specialty_id: data.specialty_id,
    appointment_date: data.appointment_date||'', start_time: data.start_time||'', end_time: data.end_time||'',
    type: data.type||'consultation', status: data.status||'scheduled', reason: data.reason||'',
    notes: data.notes||'', room: data.room||'', institution_id: data.institution_id||'',
  })
  await writeAuditLog({ action: 'appointment.create', entity_type: 'appointment', entity_id: a.id, user_id: userId })
  return a
}
export async function updateAppointment(id: string, data: Partial<Appointment>, userId: string) {
  await updateDocument(COLLECTIONS.appointments, id, data as Record<string, unknown>)
  await writeAuditLog({ action: 'appointment.update', entity_type: 'appointment', entity_id: id, user_id: userId })
}

// ---- MEDICATIONS / PHARMACY ----
export async function listMedications(institutionId?: string) {
  const c: QueryConstraint[] = [where('is_active', '==', true), orderBy('name'), limit(200)]
  if (institutionId) c.unshift(where('institution_id', '==', institutionId))
  return listDocuments(COLLECTIONS.medications, c)
}
export async function createMedication(data: Record<string, unknown>, userId: string) {
  const med = await createDocument(COLLECTIONS.medications, { ...data, is_active: true, requires_prescription: data.requires_prescription !== false })
  await createDocument(COLLECTIONS.inventory, { medication_id: med.id, quantity: 0, min_stock: 10, institution_id: data.institution_id||'' })
  await writeAuditLog({ action: 'medication.create', entity_type: 'medication', entity_id: med.id, user_id: userId })
  return med
}
export async function listInventory(institutionId?: string) {
  const c: QueryConstraint[] = [orderBy('updated_at', 'desc'), limit(200)]
  if (institutionId) c.unshift(where('institution_id', '==', institutionId))
  return listDocuments(COLLECTIONS.inventory, c)
}
export async function dispenseMedication(medicationId: string, quantity: number, userId: string, prescriptionId?: string) {
  await decrementInventoryStock(medicationId, quantity, userId, prescriptionId ? `Rx ${prescriptionId}` : 'Dispensation')
  await writeAuditLog({ action: 'pharmacy.dispense', entity_type: 'medication', entity_id: medicationId, user_id: userId, details: { quantity, prescriptionId } })
}
export async function listSuppliers(institutionId?: string) {
  const c: QueryConstraint[] = [orderBy('name'), limit(100)]
  if (institutionId) c.unshift(where('institution_id', '==', institutionId))
  return listDocuments(COLLECTIONS.suppliers, c)
}

// ---- LAB ----
export async function listLabOrders(f: { status?: string; patient_id?: string; institution_id?: string } = {}) {
  const c: QueryConstraint[] = [orderBy('created_at', 'desc'), limit(100)]
  if (f.institution_id) c.unshift(where('institution_id', '==', f.institution_id))
  if (f.status) c.unshift(where('status', '==', f.status))
  if (f.patient_id) c.unshift(where('patient_id', '==', f.patient_id))
  return listDocuments(COLLECTIONS.labOrders, c)
}
export async function createLabOrder(data: Record<string, unknown>, userId: string) {
  const o = await createDocument(COLLECTIONS.labOrders, {
    ...data, order_number: `LAB-${Date.now().toString(36).toUpperCase()}`, status: 'pending', priority: data.priority||'routine',
  })
  await writeAuditLog({ action: 'lab.order.create', entity_type: 'labOrder', entity_id: o.id, user_id: userId })
  return o
}
export async function updateLabOrder(id: string, data: Record<string, unknown>, userId: string) {
  await updateDocument(COLLECTIONS.labOrders, id, data)
  await writeAuditLog({ action: 'lab.order.update', entity_type: 'labOrder', entity_id: id, user_id: userId })
}
export async function listLabResults(labOrderId?: string, patientId?: string) {
  const c: QueryConstraint[] = [orderBy('created_at', 'desc'), limit(100)]
  if (labOrderId) c.unshift(where('lab_order_id', '==', labOrderId))
  if (patientId) c.unshift(where('patient_id', '==', patientId))
  return listDocuments(COLLECTIONS.labResults, c)
}
export async function createLabResult(data: Record<string, unknown>, userId: string) {
  const r = await createDocument(COLLECTIONS.labResults, { ...data, status: data.status||'final', performed_by: userId })
  if (data.lab_order_id) await updateDocument(COLLECTIONS.labOrders, data.lab_order_id as string, { status: 'completed', completed_at: new Date().toISOString() })
  await writeAuditLog({ action: 'lab.result.create', entity_type: 'labResult', entity_id: r.id, user_id: userId })
  return r
}

// ---- BILLING ----
export async function listInvoices(f: { patient_id?: string; status?: string; institution_id?: string } = {}) {
  const c: QueryConstraint[] = [orderBy('created_at', 'desc'), limit(100)]
  if (f.institution_id) c.unshift(where('institution_id', '==', f.institution_id))
  if (f.patient_id) c.unshift(where('patient_id', '==', f.patient_id))
  if (f.status) c.unshift(where('status', '==', f.status))
  return listDocuments(COLLECTIONS.invoices, c)
}
export const getInvoice = (id: string) => getDocument(COLLECTIONS.invoices, id)
export async function createInvoice(data: {
  patient_id: string; items: { description: string; quantity: number; unit_price: number }[]
  tax?: number; discount?: number; notes?: string; institution_id?: string
}, userId: string) {
  const subtotal = data.items.reduce((s, i) => s + i.quantity * i.unit_price, 0)
  const tax = data.tax||0, discount = data.discount||0, total = subtotal + tax - discount
  const inv = await createDocument(COLLECTIONS.invoices, {
    invoice_number: `INV-${new Date().getFullYear()}-${Date.now().toString(36).toUpperCase()}`,
    patient_id: data.patient_id, status: 'pending', subtotal, tax, discount, total,
    amount_paid: 0, balance: total, notes: data.notes||'', institution_id: data.institution_id||'', created_by: userId,
  })
  for (const item of data.items) {
    await createDocument(COLLECTIONS.invoiceItems, { invoice_id: inv.id, ...item, total: item.quantity * item.unit_price })
  }
  await writeAuditLog({ action: 'invoice.create', entity_type: 'invoice', entity_id: inv.id, user_id: userId, details: { total } })
  return inv
}
export async function listPayments(invoiceId?: string) {
  const c: QueryConstraint[] = [orderBy('created_at', 'desc'), limit(100)]
  if (invoiceId) c.unshift(where('invoice_id', '==', invoiceId))
  return listDocuments(COLLECTIONS.payments, c)
}
export async function recordPayment(data: {
  invoice_id: string; patient_id: string; amount: number; method: string; reference?: string; institution_id?: string
}, userId: string) {
  if (data.method === 'mpesa') throw new Error('Use initiateMpesaPayment for M-Pesa')
  const inv = await getInvoice(data.invoice_id) as any
  if (!inv) throw new Error('Invoice not found')
  if (data.amount > inv.balance) throw new Error('Amount exceeds balance')
  const payment = await createDocument(COLLECTIONS.payments, {
    ...data, status: 'completed', received_by: userId, institution_id: data.institution_id || inv.institution_id,
  })
  const newPaid = inv.amount_paid + data.amount
  const newBalance = inv.total - newPaid
  await updateDocument(COLLECTIONS.invoices, data.invoice_id, {
    amount_paid: newPaid, balance: newBalance, status: newBalance <= 0 ? 'paid' : 'partial',
  })
  await writeAuditLog({ action: 'payment.create', entity_type: 'payment', entity_id: payment.id, user_id: userId, details: { amount: data.amount } })
  return payment
}
export async function initiateMpesaPayment(params: { invoice_id: string; phone: string; amount: number }) {
  const fn = httpsCallable(functions, 'initiateMpesaSTK')
  return (await fn(params)).data as { checkoutRequestId: string; merchantRequestId: string }
}

// ---- HOSPITALIZATION ----
export async function listWards(institutionId?: string) {
  const c: QueryConstraint[] = [where('is_active', '==', true), orderBy('name')]
  if (institutionId) c.unshift(where('institution_id', '==', institutionId))
  return listDocuments(COLLECTIONS.wards, c)
}
export async function listBeds(wardId?: string, institutionId?: string) {
  const c: QueryConstraint[] = [limit(200)]
  if (wardId) c.unshift(where('ward_id', '==', wardId))
  if (institutionId) c.unshift(where('institution_id', '==', institutionId))
  return listDocuments(COLLECTIONS.beds, c)
}
export async function listAdmissions(f: { status?: string; patient_id?: string; institution_id?: string } = {}) {
  const c: QueryConstraint[] = [orderBy('admission_date', 'desc'), limit(100)]
  if (f.institution_id) c.unshift(where('institution_id', '==', f.institution_id))
  if (f.status) c.unshift(where('status', '==', f.status))
  if (f.patient_id) c.unshift(where('patient_id', '==', f.patient_id))
  return listDocuments(COLLECTIONS.admissions, c)
}
export async function admitPatient(data: {
  patient_id: string; ward_id: string; bed_id: string; doctor_id: string
  admission_type?: string; diagnosis?: string; notes?: string; institution_id?: string
}, userId: string) {
  const bed = await getDocument(COLLECTIONS.beds, data.bed_id) as any
  if (!bed || bed.status !== 'available') throw new Error('Bed not available')
  const adm = await createDocument(COLLECTIONS.admissions, {
    ...data, admission_date: new Date().toISOString(), status: 'admitted', admission_type: data.admission_type||'elective',
  })
  await updateDocument(COLLECTIONS.beds, data.bed_id, { status: 'occupied' })
  await writeAuditLog({ action: 'admission.create', entity_type: 'admission', entity_id: adm.id, user_id: userId })
  return adm
}
export async function transferBed(admissionId: string, newBedId: string, newWardId: string, userId: string) {
  const adm = await getDocument(COLLECTIONS.admissions, admissionId) as any
  if (!adm || adm.status !== 'admitted') throw new Error('Invalid admission')
  const newBed = await getDocument(COLLECTIONS.beds, newBedId) as any
  if (!newBed || newBed.status !== 'available') throw new Error('New bed not available')
  await updateDocument(COLLECTIONS.beds, adm.bed_id, { status: 'available' })
  await updateDocument(COLLECTIONS.beds, newBedId, { status: 'occupied' })
  await updateDocument(COLLECTIONS.admissions, admissionId, { bed_id: newBedId, ward_id: newWardId })
  await createDocument(COLLECTIONS.bedTransfers, {
    admission_id: admissionId, from_bed_id: adm.bed_id, to_bed_id: newBedId,
    from_ward_id: adm.ward_id, to_ward_id: newWardId, transferred_by: userId, transferred_at: new Date().toISOString(),
  })
  await writeAuditLog({ action: 'admission.transfer', entity_type: 'admission', entity_id: admissionId, user_id: userId })
}
export async function dischargePatient(admissionId: string, userId: string, notes?: string) {
  const adm = await getDocument(COLLECTIONS.admissions, admissionId) as any
  if (!adm || adm.status !== 'admitted') throw new Error('Invalid admission')
  await updateDocument(COLLECTIONS.admissions, admissionId, { status: 'discharged', discharge_date: new Date().toISOString(), notes: notes||adm.notes })
  await updateDocument(COLLECTIONS.beds, adm.bed_id, { status: 'available' })
  await writeAuditLog({ action: 'admission.discharge', entity_type: 'admission', entity_id: admissionId, user_id: userId })
}

// ---- CLINICAL ----
export async function listMedicalRecords(patientId?: string, institutionId?: string) {
  const c: QueryConstraint[] = [orderBy('created_at', 'desc'), limit(50)]
  if (patientId) c.unshift(where('patient_id', '==', patientId))
  if (institutionId) c.unshift(where('institution_id', '==', institutionId))
  return listDocuments<MedicalRecord>(COLLECTIONS.medicalRecords, c)
}
export const getMedicalRecord = (id: string) => getDocument<MedicalRecord>(COLLECTIONS.medicalRecords, id)
export async function createMedicalRecord(data: Partial<MedicalRecord>, userId: string) {
  const r = await createDocument<MedicalRecord>(COLLECTIONS.medicalRecords, {
    patient_id: data.patient_id||'', doctor_id: data.doctor_id||userId,
    record_number: `MR-${Date.now().toString(36).toUpperCase()}`, type: data.type||'consultation',
    status: 'active', institution_id: data.institution_id||'', created_by: userId,
  })
  await writeAuditLog({ action: 'medicalRecord.create', entity_type: 'medicalRecord', entity_id: r.id, user_id: userId })
  return r
}
export async function listPrescriptions(f: { status?: string; institution_id?: string } = {}) {
  const c: QueryConstraint[] = [orderBy('issued_date', 'desc'), limit(100)]
  if (f.status) c.unshift(where('status', '==', f.status))
  if (f.institution_id) c.unshift(where('institution_id', '==', f.institution_id))
  return listDocuments<Prescription>(COLLECTIONS.prescriptions, c)
}
export async function createPrescription(data: {
  consultation_id?: string; patient_id: string; doctor_id: string; notes?: string
  items: { medication_id: string; medication_name: string; dosage: string; frequency: string; duration: string; quantity: number }[]
  institution_id?: string
}, userId: string) {
  const rx = await createDocument(COLLECTIONS.prescriptions, {
    consultation_id: data.consultation_id||'', prescription_number: `RX-${Date.now().toString(36).toUpperCase()}`,
    notes: data.notes||'', status: 'active', issued_date: new Date().toISOString(),
    doctor_id: data.doctor_id||userId, patient_id: data.patient_id, institution_id: data.institution_id||'',
  })
  for (const item of data.items) await createDocument(COLLECTIONS.prescriptionItems, { prescription_id: rx.id, ...item })
  await writeAuditLog({ action: 'prescription.create', entity_type: 'prescription', entity_id: rx.id, user_id: userId })
  return rx
}

// ---- DASHBOARD ----
export async function getDashboardStats(institutionId?: string) {
  const [patients, appointments, admissions, labOrders] = await Promise.all([
    listDocuments(COLLECTIONS.patients, [...(institutionId ? [where('institution_id', '==', institutionId)] : []), where('is_active', '==', true), limit(500)]).then(a => a.length),
    listDocuments(COLLECTIONS.appointments, [...(institutionId ? [where('institution_id', '==', institutionId)] : []), where('status', '==', 'scheduled'), limit(100)]).then(a => a.length),
    listDocuments(COLLECTIONS.admissions, [...(institutionId ? [where('institution_id', '==', institutionId)] : []), where('status', '==', 'admitted'), limit(100)]).then(a => a.length),
    listDocuments(COLLECTIONS.labOrders, [...(institutionId ? [where('institution_id', '==', institutionId)] : []), where('status', '==', 'pending'), limit(100)]).then(a => a.length),
  ])
  return { total_patients: patients, today_appointments: appointments, active_admissions: admissions, pending_lab_orders: labOrders, pending_invoices: 0 }
}

export { listenCollection, where, orderBy, limit }
