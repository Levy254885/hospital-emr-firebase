import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as svc from '@/lib/services'
import type { MedicalRecord } from '@/types'
import { useAuth } from './useAuth'
export function useMedicalRecords(patientId?: string) {
  const { user } = useAuth()
  return useQuery({ queryKey: ['medicalRecords', patientId], queryFn: () => svc.listMedicalRecords(patientId, user?.institution_id) })
}
export function useMedicalRecord(id: string) {
  return useQuery({ queryKey: ['medicalRecords', id], queryFn: () => svc.getMedicalRecord(id), enabled: !!id })
}
export function useCreateMedicalRecord() {
  const qc = useQueryClient(); const { user } = useAuth()
  return useMutation({ mutationFn: (data: Partial<MedicalRecord>) => svc.createMedicalRecord({ ...data, institution_id: data.institution_id || user?.institution_id }, user?.id || 'system'), onSuccess: () => qc.invalidateQueries({ queryKey: ['medicalRecords'] }) })
}
