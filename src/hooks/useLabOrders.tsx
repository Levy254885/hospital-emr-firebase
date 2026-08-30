import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as svc from '@/lib/services'
import type { LabOrder, PaginatedResponse } from '@/types'
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

export function useLabOrders(
  filters: {
    status?: string
    patient_id?: string
    priority?: string
    page?: number
    per_page?: number
  } = {}
) {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['lab-orders', filters],
    queryFn: async () => {
      const data = (await svc.listLabOrders({
        status: filters.status,
        patient_id: filters.patient_id,
        institution_id: user?.institution_id,
      })) as LabOrder[]
      let filtered = data || []
      if (filters.priority) filtered = filtered.filter((o) => o.priority === filters.priority)
      return toPaginated(filtered, filters.page || 1, filters.per_page || 100)
    },
  })
}

export function useLabOrder(id: string) {
  return useQuery({
    queryKey: ['lab-orders', id],
    queryFn: async () => {
      const list = (await svc.listLabOrders({})) as LabOrder[]
      return list.find((o) => o.id === id) || null
    },
    enabled: !!id,
  })
}

export function useCreateLabOrder() {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: (data: {
      medical_record_id?: string
      patient_id: string
      doctor_id?: string
      priority?: LabOrder['priority']
      clinical_reason?: string
      clinical_info?: string
      items: Array<{ test_name: string; test_code: string }>
    }) =>
      svc.createLabOrder(
        {
          ...data,
          clinical_info: data.clinical_info || data.clinical_reason,
          institution_id: user?.institution_id,
          doctor_id: data.doctor_id || user?.id,
        },
        user?.id || 'system'
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lab-orders'] }),
  })
}

export function useUpdateLabOrder() {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      svc.updateLabOrder(id, data, user?.id || 'system'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lab-orders'] }),
  })
}

export function useLabResults(labOrderId?: string, patientId?: string) {
  return useQuery({
    queryKey: ['lab-results', labOrderId, patientId],
    queryFn: () => svc.listLabResults(labOrderId, patientId),
  })
}

export function useCreateLabResult() {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      svc.createLabResult(data, user?.id || 'system'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lab-results'] })
      qc.invalidateQueries({ queryKey: ['lab-orders'] })
    },
  })
}

export function useAddLabResult() {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: (data: {
      lab_order_item_id: string
      result_value: string
      unit?: string
      reference_range?: string
      is_abnormal?: boolean
      notes?: string
    }) =>
      svc.createLabResult(
        {
          lab_order_item_id: data.lab_order_item_id,
          value: data.result_value,
          unit: data.unit,
          reference_range: data.reference_range,
          is_abnormal: data.is_abnormal ?? false,
          notes: data.notes,
          performed_by: user?.id || 'system',
          performed_at: new Date().toISOString(),
        },
        user?.id || 'system'
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lab-results'] })
      qc.invalidateQueries({ queryKey: ['lab-orders'] })
    },
  })
}
