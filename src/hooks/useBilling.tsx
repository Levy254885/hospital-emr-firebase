import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as svc from '@/lib/services'
import type { Invoice, Payment, ServiceCatalogItem, PaginatedResponse } from '@/types'
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

export function useInvoices(
  filters: {
    patient_id?: string
    status?: string
    payment_status?: string
    page?: number
    per_page?: number
  } = {}
) {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['invoices', filters],
    queryFn: async () => {
      const data = await svc.listInvoices({
        patient_id: filters.patient_id,
        status: filters.status || filters.payment_status,
        institution_id: user?.institution_id,
      })
      return toPaginated((data || []) as Invoice[], filters.page || 1, filters.per_page || 100)
    },
  })
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: ['invoices', id],
    queryFn: async () => (await svc.getInvoice(id)) as Invoice | null,
    enabled: !!id,
  })
}

export function useCreateInvoice() {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: (data: {
      patient_id: string
      notes?: string
      due_date?: string
      items: Array<{
        service_catalog_id?: number
        description: string
        quantity: number
        unit_price: number
        discount?: number
      }>
    }) =>
      svc.createInvoice(
        {
          patient_id: data.patient_id,
          notes: data.notes,
          items: data.items.map((i) => ({
            description: i.description,
            quantity: i.quantity,
            unit_price: i.unit_price,
          })),
          discount: data.items.reduce((s, i) => s + (i.discount || 0), 0),
          institution_id: user?.institution_id,
        },
        user?.id || 'system'
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invoices'] }),
  })
}

export function usePayments(invoiceId?: string) {
  return useQuery({
    queryKey: ['payments', invoiceId],
    queryFn: () => svc.listPayments(invoiceId),
    enabled: invoiceId !== undefined ? !!invoiceId : true,
  })
}

export function usePaymentsList(
  filters: { page?: number; per_page?: number; method?: string; payment_method?: string } = {}
) {
  return useQuery({
    queryKey: ['payments', 'list', filters],
    queryFn: async () => {
      const data = (await svc.listPayments()) as Payment[]
      let items = data || []
      const method = filters.method || filters.payment_method
      if (method) {
        items = items.filter(
          (p) =>
            p.payment_method === method ||
            (p as Payment & { method?: string }).method === method
        )
      }
      return toPaginated(items, filters.page || 1, filters.per_page || 100)
    },
  })
}

export function useRecordPayment() {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: async (data: {
      invoice_id: string
      amount: number
      payment_method: Payment['payment_method']
      reference_number?: string
      notes?: string
      patient_id?: string
    }) => {
      const inv = (await svc.getInvoice(data.invoice_id)) as Invoice | null
      return svc.recordPayment(
        {
          invoice_id: data.invoice_id,
          patient_id: data.patient_id || inv?.patient_id || '',
          amount: data.amount,
          method: data.payment_method,
          reference: data.reference_number,
          institution_id: user?.institution_id,
        },
        user?.id || 'system'
      )
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoices'] })
      qc.invalidateQueries({ queryKey: ['payments'] })
    },
  })
}

export function useMpesaPayment() {
  return useMutation({
    mutationFn: (params: { invoice_id: string; phone: string; amount: number }) =>
      svc.initiateMpesaPayment(params),
  })
}

export function useServiceCatalog(search?: string) {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['service-catalog', search, user?.institution_id],
    queryFn: async () => {
      const items: ServiceCatalogItem[] = []
      return toPaginated(items)
    },
  })
}
