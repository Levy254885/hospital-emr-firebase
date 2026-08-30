import { useQuery } from '@tanstack/react-query'
import * as svc from '@/lib/services'
import { useAuth } from './useAuth'

export type ReportFilters = {
  date_from?: string
  date_to?: string
  department?: string
}

export function useDashboardReport() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['reports', 'dashboard', user?.institution_id],
    queryFn: async () => {
      const stats = await svc.getDashboardStats(user?.institution_id)
      return {
        total_patients: stats?.summary?.total_patients ?? 0,
        appointments_today: stats?.summary?.today_appointments ?? 0,
        revenue_month: stats?.summary?.monthly_revenue ?? 0,
        bed_occupancy: 0,
        active_hospitalizations: stats?.summary?.active_hospitalizations ?? 0,
        pending_lab_orders: stats?.summary?.pending_lab_orders ?? 0,
        emergency_waiting: stats?.summary?.emergency_waiting ?? 0,
        pending_payments: stats?.summary?.pending_payments ?? 0,
      }
    },
  })
}

export function usePatientReport(_filters: ReportFilters = {}) {
  return useQuery({
    queryKey: ['reports', 'patients', _filters],
    queryFn: async () => ({
      total: 0,
      total_patients: 0,
      new_patients: 0,
      new_patients_period: 0,
      active: 0,
      by_gender: [] as Array<{ gender: string; count: number }>,
      by_age_group: [] as Array<{ group: string; count: number }>,
      by_blood_type: [] as Array<{ blood_type: string; count: number }>,
      top_diagnoses: [] as Array<{ code: string; name: string; count: number }>,
    }),
  })
}

export function useAppointmentReport(_filters: ReportFilters = {}) {
  return useQuery({
    queryKey: ['reports', 'appointments', _filters],
    queryFn: async () => ({
      total: 0,
      total_appointments: 0,
      completed: 0,
      cancelled: 0,
      no_show: 0,
      pending: 0,
      by_status: [] as Array<{ status: string; count: number }>,
      by_day_of_week: [] as Array<{ day: string; count: number }>,
      by_specialty: [] as Array<{ specialty: string; count: number }>,
    }),
  })
}

export function useRevenueReport(_filters: ReportFilters = {}) {
  return useQuery({
    queryKey: ['reports', 'revenue', _filters],
    queryFn: async () => ({
      total: 0,
      total_revenue: 0,
      total_collected: 0,
      total_pending: 0,
      pending: 0,
      invoice_count: 0,
      by_month: [] as Array<{ month: string; amount: number }>,
      by_payment_method: [] as Array<{ method: string; amount: number }>,
      top_services: [] as Array<{ name: string; amount: number }>,
    }),
  })
}

export function useLabReport(_filters: ReportFilters = {}) {
  return useQuery({
    queryKey: ['reports', 'lab', _filters],
    queryFn: async () => ({
      total_orders: 0,
      completed: 0,
      pending: 0,
      in_progress: 0,
      by_status: [] as Array<{ status: string; count: number }>,
      by_priority: [] as Array<{ priority: string; count: number }>,
    }),
  })
}

export function usePharmacyReport(_filters: ReportFilters = {}) {
  return useQuery({
    queryKey: ['reports', 'pharmacy', _filters],
    queryFn: async () => ({
      dispensations: 0,
      low_stock: 0,
      total_medications: 0,
      by_category: [] as Array<{ category: string; count: number }>,
    }),
  })
}

export function useHospitalizationReport(_filters: ReportFilters = {}) {
  return useQuery({
    queryKey: ['reports', 'hospitalization', _filters],
    queryFn: async () => ({
      occupied_beds: 0,
      available_beds: 0,
      admissions: 0,
      discharges: 0,
      average_stay_days: 0,
    }),
  })
}

export function useDiagnosisReport(_filters: ReportFilters = {}) {
  return useQuery({
    queryKey: ['reports', 'diagnoses', _filters],
    queryFn: async () => ({
      top_diagnoses: [] as Array<{ code: string; name: string; count: number }>,
      total: 0,
    }),
  })
}
