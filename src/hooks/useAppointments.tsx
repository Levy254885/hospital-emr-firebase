import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as svc from '@/lib/services'
import type { Appointment, PaginatedResponse } from '@/types'
import { useAuth } from './useAuth'

export type AppointmentFilters = {
  patient_id?: string
  doctor_id?: string
  status?: string
  date?: string
  type?: string
  page?: number
  per_page?: number
}

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

export function useAppointments(filters: AppointmentFilters = {}) {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['appointments', filters],
    queryFn: async () => {
      const data = await svc.listAppointments({
        patient_id: filters.patient_id,
        doctor_id: filters.doctor_id,
        status: filters.status,
        institution_id: user?.institution_id,
      })
      let filtered = data
      if (filters.date) filtered = filtered.filter((a) => a.appointment_date === filters.date)
      if (filters.type) filtered = filtered.filter((a) => a.type === filters.type)
      return toPaginated(filtered, filters.page || 1, filters.per_page || 100)
    },
  })
}

export function useAppointment(id: string) {
  return useQuery({
    queryKey: ['appointments', id],
    queryFn: () => svc.getAppointment(id),
    enabled: !!id,
  })
}

export function useCreateAppointment() {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: (data: Partial<Appointment> & { scheduled_at?: string; duration_minutes?: number }) => {
      const payload: Partial<Appointment> = { ...data }
      if (data.scheduled_at && !data.appointment_date) {
        const [datePart, timePart] = data.scheduled_at.split('T')
        payload.appointment_date = datePart
        payload.start_time = (timePart || '00:00').slice(0, 5)
        if (data.duration_minutes) {
          const [h, m] = payload.start_time.split(':').map(Number)
          const end = new Date(2000, 0, 1, h, m + data.duration_minutes)
          payload.end_time = `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`
        }
      }
      return svc.createAppointment(
        { ...payload, institution_id: payload.institution_id || user?.institution_id },
        user?.id || 'system'
      )
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['appointments'] }),
  })
}

export function useUpdateAppointment() {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Appointment> }) =>
      svc.updateAppointment(id, data, user?.id || 'system'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['appointments'] }),
  })
}

export function useConfirmAppointment() {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: (id: string) =>
      svc.updateAppointment(id, { status: 'confirmed', confirmed_at: new Date().toISOString() }, user?.id || 'system'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['appointments'] }),
  })
}

export function useCancelAppointment() {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      svc.updateAppointment(id, {
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancellation_reason: reason,
      }, user?.id || 'system'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['appointments'] }),
  })
}

export function useCompleteAppointment() {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: (id: string) =>
      svc.updateAppointment(id, { status: 'completed' }, user?.id || 'system'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['appointments'] }),
  })
}
