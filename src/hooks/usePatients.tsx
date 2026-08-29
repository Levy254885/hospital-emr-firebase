import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as svc from '@/lib/services'
import type { Patient } from '@/types'
import { useAuth } from './useAuth'

export function usePatients(filters: { search?: string; gender?: string; blood_type?: string; is_active?: boolean; page?: number; per_page?: number } = {}) {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['patients', filters],
    queryFn: () => svc.listPatients({ ...filters, institution_id: user?.institution_id }),
  })
}
export function usePatient(id: string) {
  return useQuery({ queryKey: ['patients', id], queryFn: () => svc.getPatient(id), enabled: !!id })
}
export function useCreatePatient() {
  const qc = useQueryClient(); const { user } = useAuth()
  return useMutation({
    mutationFn: (data: Partial<Patient>) => svc.createPatient({ ...data, institution_id: data.institution_id || user?.institution_id }, user?.id || 'system'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['patients'] }),
  })
}
export function useUpdatePatient() {
  const qc = useQueryClient(); const { user } = useAuth()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Patient> }) => { await svc.updatePatient(id, data, user?.id || 'system'); return svc.getPatient(id) },
    onSuccess: (_, v) => { qc.invalidateQueries({ queryKey: ['patients'] }); qc.invalidateQueries({ queryKey: ['patients', v.id] }) },
  })
}
export function useDeletePatient() {
  const qc = useQueryClient(); const { user } = useAuth()
  return useMutation({
    mutationFn: (id: string) => svc.deletePatient(id, user?.id || 'system'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['patients'] }),
  })
}
