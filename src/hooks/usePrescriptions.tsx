import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as svc from '@/lib/services'
import type { Prescription, PaginatedResponse } from '@/types'
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

export function usePrescriptions(
  filters: { status?: string; patient_id?: string; page?: number; per_page?: number } = {}
) {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['prescriptions', filters],
    queryFn: async () => {
      const data = (await svc.listPrescriptions({
        status: filters.status,
        institution_id: user?.institution_id,
      })) as Prescription[]
      let filtered = data || []
      if (filters.patient_id) {
        filtered = filtered.filter((p) => p.patient_id === filters.patient_id)
      }
      return toPaginated(filtered, filters.page || 1, filters.per_page || 100)
    },
  })
}

export function useCreatePrescription() {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: (data: {
      patient_id: string
      consultation_id?: string
      notes?: string
      items: Array<{
        medication_id: string
        medication_name?: string
        dosage: string
        frequency: string
        duration: string
        quantity: number
        instructions?: string
      }>
    }) =>
      svc.createPrescription(
        {
          patient_id: data.patient_id,
          consultation_id: data.consultation_id,
          notes: data.notes,
          doctor_id: user?.id || 'system',
          institution_id: user?.institution_id,
          items: data.items.map((i) => ({
            medication_id: i.medication_id,
            medication_name: i.medication_name || '',
            dosage: i.dosage,
            frequency: i.frequency,
            duration: i.duration,
            quantity: i.quantity,
          })),
        },
        user?.id || 'system'
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['prescriptions'] }),
  })
}

export function useDispensePrescription() {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: async ({
      prescriptionId,
      items,
    }: {
      prescriptionId: string
      items?: Array<{ medication_id: string; quantity: number }>
    }) => {
      if (items) {
        for (const item of items) {
          await svc.dispenseMedication(item.medication_id, item.quantity, user?.id || 'system', prescriptionId)
        }
      }
      return { id: prescriptionId, status: 'dispensed' as const }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['prescriptions'] })
      qc.invalidateQueries({ queryKey: ['medications'] })
    },
  })
}
