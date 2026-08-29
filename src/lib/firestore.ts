import {
  collection, doc, getDoc, getDocs, addDoc, setDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, startAfter, onSnapshot, serverTimestamp,
  Timestamp, writeBatch, type DocumentData, type QueryConstraint,
  type Unsubscribe, type DocumentSnapshot,
} from 'firebase/firestore'
import { db } from './firebase'

export const COLLECTIONS = {
  users: 'users', patients: 'patients', appointments: 'appointments',
  consultations: 'consultations', medicalRecords: 'medicalRecords',
  vitalSigns: 'vitalSigns', diagnoses: 'diagnoses', prescriptions: 'prescriptions',
  prescriptionItems: 'prescriptionItems', medications: 'medications',
  inventory: 'inventory', inventoryTransactions: 'inventoryTransactions',
  inventoryBatches: 'inventoryBatches', suppliers: 'suppliers',
  purchaseOrders: 'purchaseOrders', labOrders: 'labOrders', labResults: 'labResults',
  labTests: 'labTests', wards: 'wards', beds: 'beds', admissions: 'admissions',
  bedTransfers: 'bedTransfers', surgeries: 'surgeries', emergencyRecords: 'emergencyRecords',
  invoices: 'invoices', invoiceItems: 'invoiceItems', payments: 'payments',
  insurance: 'insurance', departments: 'departments', notifications: 'notifications',
  auditLogs: 'auditLogs', institutions: 'institutions', imagingOrders: 'imagingOrders',
  roles: 'roles',
} as const

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS]

function toDate(value: unknown): string {
  if (!value) return new Date().toISOString()
  if (value instanceof Timestamp) return value.toDate().toISOString()
  if (typeof value === 'string') return value
  if (value instanceof Date) return value.toISOString()
  return new Date().toISOString()
}

export function serializeDoc<T extends DocumentData>(snap: DocumentSnapshot): T | null {
  if (!snap.exists()) return null
  const data = snap.data()
  const result: Record<string, unknown> = { id: snap.id }
  for (const [k, v] of Object.entries(data)) {
    result[k] = v instanceof Timestamp ? v.toDate().toISOString() : v
  }
  return result as T
}

export function serializeDocs<T extends DocumentData>(snaps: DocumentSnapshot[]): T[] {
  return snaps.map((s) => serializeDoc<T>(s)!).filter(Boolean)
}

export async function getDocument<T extends DocumentData>(col: CollectionName, id: string): Promise<T | null> {
  return serializeDoc<T>(await getDoc(doc(db, col, id)))
}

export async function listDocuments<T extends DocumentData>(col: CollectionName, constraints: QueryConstraint[] = []): Promise<T[]> {
  const snap = await getDocs(query(collection(db, col), ...constraints))
  return serializeDocs<T>(snap.docs)
}

export async function createDocument<T extends DocumentData>(
  col: CollectionName,
  data: Record<string, unknown>,
  customId?: string
): Promise<T> {
  const payload = { ...data, created_at: serverTimestamp(), updated_at: serverTimestamp() }
  if (customId) {
    await setDoc(doc(db, col, customId), payload)
    return { id: customId, ...data, created_at: toDate(new Date()), updated_at: toDate(new Date()) } as unknown as T
  }
  const ref = await addDoc(collection(db, col), payload)
  return { id: ref.id, ...data, created_at: toDate(new Date()), updated_at: toDate(new Date()) } as unknown as T
}

export async function updateDocument(col: CollectionName, id: string, data: Record<string, unknown>): Promise<void> {
  await updateDoc(doc(db, col, id), { ...data, updated_at: serverTimestamp() })
}

export async function deleteDocument(col: CollectionName, id: string): Promise<void> {
  await deleteDoc(doc(db, col, id))
}

export function listenCollection<T extends DocumentData>(
  col: CollectionName, constraints: QueryConstraint[], callback: (items: T[]) => void
): Unsubscribe {
  return onSnapshot(query(collection(db, col), ...constraints), (snap) => {
    callback(serializeDocs<T>(snap.docs))
  })
}

export async function writeAuditLog(entry: {
  action: string; entity_type: string; entity_id?: string; user_id: string
  user_email?: string; user_name?: string; details?: Record<string, unknown>
}): Promise<void> {
  await addDoc(collection(db, COLLECTIONS.auditLogs), { ...entry, created_at: serverTimestamp() })
}

export async function decrementInventoryStock(
  medicationId: string, quantity: number, userId: string, reason: string
): Promise<void> {
  const invSnap = await getDocs(query(collection(db, COLLECTIONS.inventory), where('medication_id', '==', medicationId), limit(1)))
  if (invSnap.empty) throw new Error('Inventory item not found')
  const invDoc = invSnap.docs[0]
  const current = invDoc.data().quantity ?? 0
  if (current < quantity) throw new Error(`Insufficient stock. Available: ${current}`)
  const batch = writeBatch(db)
  batch.update(invDoc.ref, { quantity: current - quantity, updated_at: serverTimestamp() })
  batch.set(doc(collection(db, COLLECTIONS.inventoryTransactions)), {
    medication_id: medicationId, inventory_id: invDoc.id, type: 'dispensation',
    quantity: -quantity, balance_after: current - quantity, reason, performed_by: userId,
    created_at: serverTimestamp(),
  })
  await batch.commit()
}

export { where, orderBy, limit, collection, doc, query, getDocs, onSnapshot, serverTimestamp, startAfter }
export type { QueryConstraint, Unsubscribe, DocumentSnapshot }
