import { useState } from 'react'
import { usePaymentsList } from '@/hooks/useBilling'
import { Card, CardContent } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import { DataTable } from '@/components/ui/DataTable'
import { PageLoadingSpinner } from '@/components/ui/LoadingSpinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { Search, CreditCard } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Payment } from '@/types'

export default function PaymentListPage() {
  const [method, setMethod] = useState('')
  const { data, isLoading } = usePaymentsList({ method: method || undefined })
  const payments = data?.data || []

  const columns = [
    {
      key: 'received_at',
      header: 'Date',
      render: (item: Payment) => formatDate(item.received_at || item.created_at),
    },
    {
      key: 'invoice_id',
      header: 'Invoice',
      render: (item: Payment) => item.invoice?.invoice_number || item.invoice_id?.slice(0, 8) || '—',
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (item: Payment) => (
        <span className="font-medium text-green-700">{formatCurrency(item.amount)}</span>
      ),
    },
    {
      key: 'payment_method',
      header: 'Method',
      render: (item: Payment) => (item.payment_method || '—').toString().toUpperCase(),
    },
    {
      key: 'reference_number',
      header: 'Reference',
      render: (item: Payment) => item.reference_number || '—',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payment history</h1>
        <p className="text-sm text-gray-500">All received payments</p>
      </div>

      <Card variant="elevated">
        <CardContent className="p-4">
          <select
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            value={method}
            onChange={(e) => setMethod(e.target.value)}
          >
            <option value="">All methods</option>
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="transfer">Transfer</option>
            <option value="mpesa">M-Pesa</option>
            <option value="insurance">Insurance</option>
          </select>
        </CardContent>
      </Card>

      {isLoading ? (
        <PageLoadingSpinner />
      ) : payments.length === 0 ? (
        <EmptyState title="No payments recorded" description="Payments will appear here when recorded against invoices" />
      ) : (
        <Card variant="elevated">
          <DataTable columns={columns} data={payments} keyExtractor={(item) => item.id} />
        </Card>
      )}
    </div>
  )
}
