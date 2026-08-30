import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as svc from '@/lib/services'
import type { Patient, PaginatedResponse } from '@/types'
import { useAuth } from './useAuth'

export type PatientFilters = {
  search?: string
  gender?: string
  blood_type?: string
  is_active?: boolean
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

export function usePatients(filters: PatientFilters = {}) {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['patients', filters],
    queryFn: async () => {
      const data = await svc.listPatients({
        search: filters.search,
        gender: filters.gender,
        institution_id: user?.institution_id,
        per_page: filters.per_page,
      })
      let filtered = data
      if (filters.blood_type) filtered = filtered.filter((p) => p.blood_type === filters.blood_type)
      if (filters.is_active !== undefined) filtered = filtered.filter((p) => p.is_active === filters.is_active)
      return toPaginated(filtered, filters.page || 1, filters.per_page || 100)
    },
  })
}

export function usePatient(id: string) {
  return useQuery({
    queryKey: ['patients', id],
    queryFn: () => svc.getPatient(id),
    enabled: !!id,
  })
}

export function usePatientSearch(search: string) {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['patients', 'search', search],
    queryFn: async () => {
      if (!search || search.trim().length < 2) return [] as Patient[]
      return svc.listPatients({
        search: search.trim(),
        institution_id: user?.institution_id,
        per_page: 20,
      })
    },
    enabled: search.trim().length >= 2,
  })
}

export function usePatientMedicalHistory(patientId: string) {
  return useQuery({
    queryKey: ['patients', patientId, 'medical-history'],
    queryFn: async () => {
      const patient = await svc.getPatient(patientId)
      return {
        personal: patient?.medical_history || '',
        family: '',
        pathological: '',
        surgical: '',
        traumatic: '',
        allergic: patient?.allergies || '',
        pharmacological: '',
      }
    },
    enabled: !!patientId,
  })
}

export function useCreatePatient() {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: (data: Partial<Patient>) =>
      svc.createPatient(
        { ...data, institution_id: data.institution_id || user?.institution_id },
        user?.id || 'system'
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['patients'] }),
  })
}

export function useUpdatePatient() {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Patient> }) =>
      svc.updatePatient(id, data, user?.id || 'system'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['patients'] }),
  })
}

export function useDeletePatient() {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: (id: string) => svc.deletePatient(id, user?.id || 'system'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['patients'] }),
  })
}
