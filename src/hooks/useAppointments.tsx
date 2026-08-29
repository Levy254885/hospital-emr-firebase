import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as svc from '@/lib/services'
import type { Appointment } from '@/types'
import { useAuth } from './useAuth'
export function useAppointments(filters: { patient_id?: string; doctor_id?: string; status?: string } = {}) {
  const { user } = useAuth()
  return useQuery({ queryKey: ['appointments', filters], queryFn: async () => {
    const data = await svc.listAppointments({ ...filters, institution_id: user?.institution_id })
    return { data, meta: { current_page: 1, per_page: data.length, total: data.length, last_page: 1 } }
  }})
}
export function useAppointment(id: string) {
  return useQuery({ queryKey: ['appointments', id], queryFn: () => svc.getAppointment(id), enabled: !!id })
}
export function useCreateAppointment() {
  const qc = useQueryClient(); const { user } = useAuth()
  return useMutation({ mutationFn: (data: Partial<Appointment>) => svc.createAppointment({ ...data, institution_id: data.institution_id || user?.institution_id }, user?.id || 'system'), onSuccess: () => qc.invalidateQueries({ queryKey: ['appointments'] }) })
}
export function useUpdateAppointment() {
  const qc = useQueryClient(); const { user } = useAuth()
  return useMutation({ mutationFn: ({ id, data }: { id: string; data: Partial<Appointment> }) => svc.updateAppointment(id, data, user?.id || 'system'), onSuccess: () => qc.invalidateQueries({ queryKey: ['appointments'] }) })
}
