import { useQuery } from '@tanstack/react-query'
import * as svc from '@/lib/services'
import type { DashboardStats } from '@/types'
import { useAuth } from './useAuth'

export function useDashboardStats() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['dashboard', user?.institution_id],
    queryFn: async (): Promise<DashboardStats> => {
      const stats = await svc.getDashboardStats(user?.institution_id)
      if (stats) return stats as DashboardStats
      return {
        summary: {
          total_patients: 0,
          active_hospitalizations: 0,
          today_appointments: 0,
          pending_lab_orders: 0,
          emergency_waiting: 0,
          monthly_revenue: 0,
          pending_payments: 0,
        },
        recent_appointments: [],
        recent_patients: [],
        emergency_waiting_list: [],
      }
    },
  })
}
