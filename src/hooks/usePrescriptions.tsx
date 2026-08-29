import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as svc from '@/lib/services'
import { useAuth } from './useAuth'
export function usePrescriptions(filters: { status?: string } = {}) {
  const { user } = useAuth()
  return useQuery({ queryKey: ['prescriptions', filters], queryFn: () => svc.listPrescriptions({ ...filters, institution_id: user?.institution_id }) })
}
export function useCreatePrescription() {
  const qc = useQueryClient(); const { user } = useAuth()
  return useMutation({ mutationFn: (data: Parameters<typeof svc.createPrescription>[0]) => svc.createPrescription({ ...data, institution_id: data.institution_id || user?.institution_id }, user?.id || 'system'), onSuccess: () => qc.invalidateQueries({ queryKey: ['prescriptions'] }) })
}
