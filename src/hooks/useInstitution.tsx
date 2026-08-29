import { useQuery } from '@tanstack/react-query'
import { getDocument, listDocuments, COLLECTIONS, limit } from '@/lib/firestore'
import { useAuth } from './useAuth'
export function useInstitution() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['institution', user?.institution_id],
    queryFn: async () => {
      if (user?.institution_id) {
        const inst = await getDocument(COLLECTIONS.institutions, user.institution_id)
        if (inst) return inst
      }
      const list = await listDocuments(COLLECTIONS.institutions, [limit(1)])
      return list[0] || { id: 'default', name: 'Hospital Management System' }
    },
    staleTime: 5 * 60 * 1000,
  })
}
