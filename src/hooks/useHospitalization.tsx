import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as svc from '@/lib/services'
import type { Hospitalization, Bed, PaginatedResponse } from '@/types'
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

export function useWards() {
  const { user } = useAuth()
  return useQuery({ queryKey: ['wards'], queryFn: () => svc.listWards(user?.institution_id) })
}

export function useBeds(wardId?: string) {
  const { user } = useAuth()
  return useQuery({ queryKey: ['beds', wardId], queryFn: () => svc.listBeds(wardId, user?.institution_id) })
}

export function useAdmissions(filters: { status?: string; patient_id?: string; page?: number; per_page?: number } = {}) {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['admissions', filters],
    queryFn: async () => {
      const data = await svc.listAdmissions({
        status: filters.status,
        patient_id: filters.patient_id,
        institution_id: user?.institution_id,
      })
      return toPaginated((data || []) as Hospitalization[], filters.page || 1, filters.per_page || 100)
    },
  })
}

export function useHospitalizations(filters: { status?: string; patient_id?: string; page?: number; per_page?: number } = {}) {
  return useAdmissions(filters)
}

export function useHospitalization(id: string) {
  return useQuery({
    queryKey: ['admissions', id],
    queryFn: async () => {
      const list = await svc.listAdmissions({})
      return ((list || []) as Hospitalization[]).find((h) => h.id === id) || null
    },
    enabled: !!id,
  })
}

export function useAdmitPatient() {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: (data: {
      patient_id: string
      bed_id?: string
      ward_id?: string
      reason?: string
      diagnosis?: string
      doctor_id?: string
      notes?: string
    }) =>
      svc.admitPatient(
        {
          patient_id: data.patient_id,
          bed_id: data.bed_id || '',
          ward_id: data.ward_id || '',
          doctor_id: data.doctor_id || user?.id || 'system',
          diagnosis: data.diagnosis || data.reason,
          notes: data.notes,
          institution_id: user?.institution_id,
        },
        user?.id || 'system'
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admissions'] })
      qc.invalidateQueries({ queryKey: ['beds'] })
    },
  })
}

export function useTransferBed() {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: ({ admissionId, newBedId, newWardId }: { admissionId: string; newBedId: string; newWardId: string }) =>
      svc.transferBed(admissionId, newBedId, newWardId, user?.id || 'system'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admissions'] })
      qc.invalidateQueries({ queryKey: ['beds'] })
    },
  })
}

export function useDischargePatient() {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: ({ admissionId, notes }: { admissionId: string; notes?: string }) =>
      svc.dischargePatient(admissionId, user?.id || 'system', notes),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admissions'] })
      qc.invalidateQueries({ queryKey: ['beds'] })
    },
  })
}

export function useBedMap() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['bed-map', user?.institution_id],
    queryFn: async () => {
      const beds = (await svc.listBeds(undefined, user?.institution_id)) as Bed[]
      return { beds: beds || [], floors: [] }
    },
  })
}

export function useBuildings() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['buildings', user?.institution_id],
    queryFn: async () => [
      { id: 'main', name: 'Edificio Principal', code: 'MAIN', floors: 3, is_active: true, rooms: [] },
      { id: 'annex', name: 'Anexo', code: 'ANNEX', floors: 2, is_active: true, rooms: [] },
    ],
  })
}

export function useRooms(buildingId?: string) {
  return useQuery({
    queryKey: ['rooms', buildingId],
    queryFn: async () => [] as Array<{ id: string; number: string; floor: number }>,
  })
}
