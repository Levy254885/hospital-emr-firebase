import {
  COLLECTIONS,
  createDocument,
  updateDocument,
  listDocuments,
  writeAuditLog,
  where,
  orderBy,
  limit,
} from '../firestore'
import type { QueryConstraint } from 'firebase/firestore'

export interface InventoryItem {
  id: string
  name: string
  category?: string
  quantity: number
  min_quantity?: number
  unit?: string
  location?: string
  supplier?: string
  cost?: number
  institution_id?: string
  created_at?: string
  updated_at?: string
}

export async function listInventoryItems(institutionId?: string) {
  const c: QueryConstraint[] = [limit(200)]
  if (institutionId) c.unshift(where('institution_id', '==', institutionId))
  try {
    return await listDocuments<InventoryItem>(COLLECTIONS.inventory, [
      ...c,
      orderBy('created_at', 'desc'),
    ])
  } catch {
    return listDocuments<InventoryItem>(COLLECTIONS.inventory, c)
  }
}

export async function createInventoryItem(
  data: Partial<InventoryItem>,
  userId: string
) {
  const item = await createDocument<InventoryItem>(COLLECTIONS.inventory, {
    name: data.name || '',
    category: data.category || 'general',
    quantity: Number(data.quantity) || 0,
    min_quantity: Number(data.min_quantity) || 10,
    unit: data.unit || 'units',
    location: data.location || '',
    supplier: data.supplier || '',
    cost: Number(data.cost) || 0,
    institution_id: data.institution_id || 'default',
    created_by: userId,
  })
  try {
    await writeAuditLog({
      action: 'inventory.create',
      entity_type: 'inventory',
      entity_id: item.id,
      user_id: userId,
    })
  } catch {
    /* non-fatal */
  }
  return item
}

export async function updateInventoryItem(id: string, data: Partial<InventoryItem>) {
  await updateDocument(COLLECTIONS.inventory, id, {
    ...data,
    quantity: data.quantity !== undefined ? Number(data.quantity) : undefined,
    min_quantity: data.min_quantity !== undefined ? Number(data.min_quantity) : undefined,
    cost: data.cost !== undefined ? Number(data.cost) : undefined,
  })
}
