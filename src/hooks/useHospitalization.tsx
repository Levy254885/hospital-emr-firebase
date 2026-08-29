import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as svc from '@/lib/services'
import { useAuth } from './useAuth'
export function useWards() { const { user } = useAuth(); return useQuery({ queryKey: ['wards'], queryFn: () => svc.listWards(user?.institution_id) }) }
export function useBeds(wardId?: string) { const { user } = useAuth(); return useQuery({ queryKey: ['beds', wardId], queryFn: () => svc.listBeds(wardId, user?.institution_id) }) }
export function useAdmissions(filters: { status?: string; patient_id?: string } = {}) {
  const { user } = useAuth()
  return useQuery({ queryKey: ['admissions', filters], queryFn: () => svc.listAdmissions({ ...filters, institution_id: user?.institution_id }) })
}
export function useAdmitPatient() {
  const qc = useQueryClient(); const { user } = useAuth()
  return useMutation({ mutationFn: (data: Parameters<typeof svc.admitPatient>[0]) => svc.admitPatient({ ...data, institution_id: data.institution_id || user?.institution_id }, user?.id || 'system'), onSuccess: () => { qc.invalidateQueries({ queryKey: ['admissions'] }); qc.invalidateQueries({ queryKey: ['beds'] }) } })
}
export function useTransferBed() {
  const qc = useQueryClient(); const { user } = useAuth()
  return useMutation({ mutationFn: ({ admissionId, newBedId, newWardId }: { admissionId: string; newBedId: string; newWardId: string }) => svc.transferBed(admissionId, newBedId, newWardId, user?.id || 'system'), onSuccess: () => { qc.invalidateQueries({ queryKey: ['admissions'] }); qc.invalidateQueries({ queryKey: ['beds'] }) } })
}
export function useDischargePatient() {
  const qc = useQueryClient(); const { user } = useAuth()
  return useMutation({ mutationFn: ({ admissionId, notes }: { admissionId: string; notes?: string }) => svc.dischargePatient(admissionId, user?.id || 'system', notes), onSuccess: () => { qc.invalidateQueries({ queryKey: ['admissions'] }); qc.invalidateQueries({ queryKey: ['beds'] }) } })
}
