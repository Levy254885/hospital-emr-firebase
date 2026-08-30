import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as svc from '@/lib/services'
import type { MedicalRecord, Consultation, PaginatedResponse } from '@/types'
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

export function useMedicalRecords(patientId?: string) {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['medical-records', patientId],
    queryFn: async () => {
      const data = await svc.listMedicalRecords(patientId, user?.institution_id)
      return toPaginated((data || []) as MedicalRecord[])
    },
  })
}

export function useMedicalRecord(id: string) {
  return useQuery({
    queryKey: ['medical-records', id],
    queryFn: () => svc.getMedicalRecord(id),
    enabled: !!id,
  })
}

export function useCreateMedicalRecord() {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: (data: Partial<MedicalRecord>) =>
      svc.createMedicalRecord(
        { ...data, institution_id: data.institution_id || user?.institution_id },
        user?.id || 'system'
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['medical-records'] }),
  })
}

export function useConsultations(patientId?: string) {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['consultations', patientId],
    queryFn: async () => {
      const records = await svc.listMedicalRecords(patientId, user?.institution_id)
      const consultations: Consultation[] = []
      for (const r of records || []) {
        if (r.consultation) consultations.push(r.consultation)
      }
      return toPaginated(consultations)
    },
  })
}

export function useConsultation(id: string) {
  return useQuery({
    queryKey: ['consultations', id],
    queryFn: async () => {
      const records = await svc.listMedicalRecords(undefined, undefined)
      for (const r of records || []) {
        if (r.consultation?.id === id) return r.consultation
        if (r.id === id) {
          return {
            id: r.id,
            medical_record_id: r.id,
            medical_record: r,
            consultation_number: r.record_number,
            date: r.created_at,
            chief_complaint: '',
            present_illness: '',
            status: 'in_progress' as const,
            doctor_id: r.doctor_id || '',
            created_at: r.created_at,
            updated_at: r.updated_at,
          } satisfies Consultation
        }
      }
      return null
    },
    enabled: !!id,
  })
}

export function useSoapNotes(consultationId?: string) {
  return useQuery({
    queryKey: ['soap-notes', consultationId],
    queryFn: async () => [] as Array<{ id: string; subjective: string; objective: string; assessment: string; plan: string }>,
    enabled: !!consultationId,
  })
}

export function useCreateSoapNote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: {
      medical_record_id: string
      consultation_id?: string
      subjective: string
      objective: string
      assessment: string
      plan: string
    }) => ({ id: `soap_${Date.now()}`, ...data, created_at: new Date().toISOString() }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['soap-notes'] }),
  })
}

export function useCreateVitalSigns() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: {
      medical_record_id: string
      consultation_id?: string
      weight?: number
      height?: number
      temperature?: number
      blood_pressure_systolic?: number
      blood_pressure_diastolic?: number
      heart_rate?: number
      respiratory_rate?: number
      oxygen_saturation?: number
      glycemia?: number
    }) => ({ id: `vs_${Date.now()}`, ...data, recorded_at: new Date().toISOString() }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vital-signs'] }),
  })
}

export function useCreateDiagnosis() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: {
      medical_record_id: string
      consultation_id?: string
      cie10_code?: string
      code?: string
      description?: string
      name?: string
      type?: string
    }) => ({
      id: `dx_${Date.now()}`,
      code: data.cie10_code || data.code || '',
      name: data.description || data.name || '',
      type: data.type || 'primary',
      created_at: new Date().toISOString(),
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['diagnoses'] }),
  })
}

export function useSearchCie10(search: string) {
  return useQuery({
    queryKey: ['cie10', search],
    queryFn: async () => {
      if (!search || search.trim().length < 2) return [] as Array<{ code: string; name: string }>
      const catalog = [
        { code: 'J06.9', name: 'Infeccion respiratoria aguda' },
        { code: 'I10', name: 'Hipertension esencial' },
        { code: 'E11', name: 'Diabetes mellitus tipo 2' },
        { code: 'J45', name: 'Asma' },
        { code: 'A09', name: 'Diarrea y gastroenteritis' },
        { code: 'R50.9', name: 'Fiebre no especificada' },
        { code: 'M54.5', name: 'Lumbago' },
        { code: 'J00', name: 'Rinofaringitis aguda' },
        { code: 'N39.0', name: 'Infeccion urinaria' },
        { code: 'K29', name: 'Gastritis' },
      ]
      const q = search.toLowerCase()
      return catalog.filter((c) => c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q))
    },
    enabled: search.trim().length >= 2,
  })
}
