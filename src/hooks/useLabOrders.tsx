import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as svc from '@/lib/services'
import { useAuth } from './useAuth'
export function useLabOrders(filters: { status?: string; patient_id?: string } = {}) {
  const { user } = useAuth()
  return useQuery({ queryKey: ['labOrders', filters], queryFn: () => svc.listLabOrders({ ...filters, institution_id: user?.institution_id }) })
}
export function useCreateLabOrder() {
  const qc = useQueryClient(); const { user } = useAuth()
  return useMutation({ mutationFn: (data: Record<string, unknown>) => svc.createLabOrder({ ...data, institution_id: data.institution_id || user?.institution_id }, user?.id || 'system'), onSuccess: () => qc.invalidateQueries({ queryKey: ['labOrders'] }) })
}
export function useUpdateLabOrder() {
  const qc = useQueryClient(); const { user } = useAuth()
  return useMutation({ mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => svc.updateLabOrder(id, data, user?.id || 'system'), onSuccess: () => qc.invalidateQueries({ queryKey: ['labOrders'] }) })
}
export function useLabResults(labOrderId?: string, patientId?: string) {
  return useQuery({ queryKey: ['labResults', labOrderId, patientId], queryFn: () => svc.listLabResults(labOrderId, patientId) })
}
export function useCreateLabResult() {
  const qc = useQueryClient(); const { user } = useAuth()
  return useMutation({ mutationFn: (data: Record<string, unknown>) => svc.createLabResult({ ...data, institution_id: data.institution_id || user?.institution_id }, user?.id || 'system'), onSuccess: () => { qc.invalidateQueries({ queryKey: ['labResults'] }); qc.invalidateQueries({ queryKey: ['labOrders'] }) } })
}
