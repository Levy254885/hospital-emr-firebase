import { useQuery } from '@tanstack/react-query'
import { getDashboardStats } from '@/lib/services'
import { useAuth } from './useAuth'
export function useDashboardReport() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['reports', 'dashboard'],
    queryFn: async () => {
      const s = await getDashboardStats(user?.institution_id)
      return {
        patients: { total: s.total_patients, new_this_month: 0, new_today: 0 },
        appointments: { today_total: s.today_appointments, today_completed: 0, today_pending: s.today_appointments, today_cancelled: 0 },
        revenue: { today: 0, this_month: 0, pending_payments: s.pending_invoices },
        hospitalizations: { active: s.active_admissions, discharged_today: 0 },
        emergencies: { waiting: 0, today_total: 0 },
        lab: { pending: s.pending_lab_orders, completed_today: 0 },
      }
    },
  })
}
export function usePatientReport() { return useQuery({ queryKey: ['reports', 'patients'], queryFn: async () => ({ total_patients: 0, new_patients_period: 0, by_gender: [], by_age_group: [], by_blood_type: [], top_diagnoses: [] }) }) }
export function useAppointmentReport() { return useQuery({ queryKey: ['reports', 'appointments'], queryFn: async () => ({ total_appointments: 0, completed: 0, cancelled: 0, no_show: 0, scheduled: 0, by_status: [], by_day_of_week: [], by_specialty: [] }) }) }
export function useRevenueReport() { return useQuery({ queryKey: ['reports', 'revenue'], queryFn: async () => ({ total_revenue: 0, total_collected: 0, total_pending: 0, by_month: [], by_payment_method: [], top_services: [] }) }) }
export function useLabReport() { return useQuery({ queryKey: ['reports', 'lab'], queryFn: async () => ({ total_orders: 0, completed: 0, pending: 0, in_progress: 0, by_status: [], by_priority: [] }) }) }
