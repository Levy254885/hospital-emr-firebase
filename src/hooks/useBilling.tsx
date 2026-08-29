import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as svc from '@/lib/services'
import { useAuth } from './useAuth'
export function useInvoices(filters: { patient_id?: string; status?: string } = {}) {
  const { user } = useAuth()
  return useQuery({ queryKey: ['invoices', filters], queryFn: () => svc.listInvoices({ ...filters, institution_id: user?.institution_id }) })
}
export function useInvoice(id: string) {
  return useQuery({ queryKey: ['invoices', id], queryFn: () => svc.getInvoice(id), enabled: !!id })
}
export function useCreateInvoice() {
  const qc = useQueryClient(); const { user } = useAuth()
  return useMutation({ mutationFn: (data: Parameters<typeof svc.createInvoice>[0]) => svc.createInvoice({ ...data, institution_id: data.institution_id || user?.institution_id }, user?.id || 'system'), onSuccess: () => qc.invalidateQueries({ queryKey: ['invoices'] }) })
}
export function usePayments(invoiceId?: string) {
  return useQuery({ queryKey: ['payments', invoiceId], queryFn: () => svc.listPayments(invoiceId) })
}
export function useRecordPayment() {
  const qc = useQueryClient(); const { user } = useAuth()
  return useMutation({ mutationFn: (data: Parameters<typeof svc.recordPayment>[0]) => svc.recordPayment({ ...data, institution_id: data.institution_id || user?.institution_id }, user?.id || 'system'), onSuccess: () => { qc.invalidateQueries({ queryKey: ['payments'] }); qc.invalidateQueries({ queryKey: ['invoices'] }) } })
}
export function useMpesaPayment() {
  return useMutation({ mutationFn: svc.initiateMpesaPayment })
}
