import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as svc from '@/lib/services'
import type { Medication, PaginatedResponse } from '@/types'
import { useAuth } from './useAuth'

function toPaginated<T>(data: T[], page = 1, perPage = 100): PaginatedResponse<T> {
  return {
    data,
    meta: {
      current_page: page,
      per_page: perPage,
      total: data.length,
      last_page: Math.max(1, Math.ceil(data.length / perPage) || 1),
    },
  }
}

export function useMedications(filters: { search?: string; page?: number; per_page?: number } = {}) {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['medications', filters],
    queryFn: async () => {
      const data = (await svc.listMedications(user?.institution_id)) as Medication[]
      let filtered = data || []
      if (filters.search) {
        const q = filters.search.toLowerCase()
        filtered = filtered.filter(
          (m) => m.name?.toLowerCase().includes(q) || m.generic_name?.toLowerCase().includes(q)
        )
      }
      return toPaginated(filtered, filters.page || 1, filters.per_page || 100)
    },
  })
}

export function useMedication(id: string) {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['medications', id],
    queryFn: async () => {
      const list = (await svc.listMedications(user?.institution_id)) as Medication[]
      return list.find((m) => m.id === id) || null
    },
    enabled: !!id,
  })
}

export function useCreateMedication() {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: (data: Partial<Medication>) =>
      svc.createMedication(
        { ...data, institution_id: data.institution_id || user?.institution_id },
        user?.id || 'system'
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['medications'] }),
  })
}

export function useUpdateMedication() {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Medication> }) => {
      await svc.createMedication({ ...data, id }, user?.id || 'system')
      return { id, ...data }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['medications'] }),
  })
}

export function useLowStockMedications() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['medications', 'low-stock'],
    queryFn: async () => {
      const list = (await svc.listMedications(user?.institution_id)) as Medication[]
      return (list || []).filter((m) => {
        const stock = m.current_stock ?? m.stock_quantity ?? 0
        const min = m.min_stock ?? m.minimum_stock ?? 0
        return stock <= min
      })
    },
  })
}

export function useInventory() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['inventory'],
    queryFn: () => svc.listInventory(user?.institution_id),
  })
}

export function useDispenseMedication() {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: ({
      medicationId,
      quantity,
      prescriptionId,
    }: {
      medicationId: string
      quantity: number
      prescriptionId?: string
    }) => svc.dispenseMedication(medicationId, quantity, user?.id || 'system', prescriptionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['medications'] })
      qc.invalidateQueries({ queryKey: ['inventory'] })
    },
  })
}

export function useSuppliers() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const data = await svc.listSuppliers(user?.institution_id)
      return toPaginated((data || []) as Array<Record<string, unknown>>)
    },
  })
}

export function useCreateSupplier() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: {
      name: string
      contact_name?: string
      phone?: string
      email?: string
      address?: string
    }) => ({ id: `sup_${Date.now()}`, ...data, created_at: new Date().toISOString() }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['suppliers'] }),
  })
}

export function usePurchaseOrders(filters: { page?: number; per_page?: number } = {}) {
  return useQuery({
    queryKey: ['purchase-orders', filters],
    queryFn: async () => toPaginated([] as Array<Record<string, unknown>>, filters.page || 1, filters.per_page || 100),
  })
}

export function useCreatePurchaseOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: {
      supplier_id: string
      items: Array<{ medication_id: string; quantity: number; unit_cost?: number }>
      notes?: string
    }) => ({ id: `po_${Date.now()}`, ...data, status: 'pending', created_at: new Date().toISOString() }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['purchase-orders'] }),
  })
}
