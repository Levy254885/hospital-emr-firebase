import { useQuery } from '@tanstack/react-query'
import { getDashboardStats } from '@/lib/services'
import { useAuth } from './useAuth'
export function useDashboardStats() {
  const { user } = useAuth()
  return useQuery({ queryKey: ['dashboard', 'stats', user?.institution_id], queryFn: () => getDashboardStats(user?.institution_id), refetchInterval: 60000 })
}
