import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as svc from '@/lib/services'
import { useAuth } from './useAuth'
export function useMedications() { const { user } = useAuth(); return useQuery({ queryKey: ['medications'], queryFn: () => svc.listMedications(user?.institution_id) }) }
export function useCreateMedication() {
  const qc = useQueryClient(); const { user } = useAuth()
  return useMutation({ mutationFn: (data: Record<string, unknown>) => svc.createMedication({ ...data, institution_id: data.institution_id || user?.institution_id }, user?.id || 'system'), onSuccess: () => qc.invalidateQueries({ queryKey: ['medications'] }) })
}
export function useInventory() { const { user } = useAuth(); return useQuery({ queryKey: ['inventory'], queryFn: () => svc.listInventory(user?.institution_id) }) }
export function useDispenseMedication() {
  const qc = useQueryClient(); const { user } = useAuth()
  return useMutation({ mutationFn: ({ medicationId, quantity, prescriptionId }: { medicationId: string; quantity: number; prescriptionId?: string }) => svc.dispenseMedication(medicationId, quantity, user?.id || 'system', prescriptionId), onSuccess: () => { qc.invalidateQueries({ queryKey: ['inventory'] }); qc.invalidateQueries({ queryKey: ['medications'] }) } })
}
export function useSuppliers() { const { user } = useAuth(); return useQuery({ queryKey: ['suppliers'], queryFn: () => svc.listSuppliers(user?.institution_id) }) }
