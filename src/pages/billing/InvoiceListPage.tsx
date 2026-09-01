import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useInvoices } from '@/hooks/useBilling'
import { Card, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { DataTable } from '@/components/ui/DataTable'
import { StatusBadge } from '@/components/ui/Badge'
import { PageLoadingSpinner } from '@/components/ui/LoadingSpinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { Plus, Search, FileText } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Invoice } from '@/types'

export default function InvoiceListPage() {
  const navigate = useNavigate()
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const { data, isLoading } = useInvoices({ status: status || undefined })

  const invoices = data?.data || []
  const filtered = search
    ? invoices.filter(
        (inv) =>
          inv.invoice_number?.toLowerCase().includes(search.toLowerCase()) ||
          inv.patient?.first_name?.toLowerCase().includes(search.toLowerCase()) ||
          inv.patient?.last_name?.toLowerCase().includes(search.toLowerCase())
      )
    : invoices

  const columns = [
    {
      key: 'invoice_number',
      header: 'Invoice No.',
      render: (item: Invoice) => (
        <button
          type="button"
          className="font-medium text-primary-600 hover:underline"
          onClick={() => navigate(`/billing/invoices/${item.id}`)}
        >
          {item.invoice_number}
        </button>
      ),
    },
    {
      key: 'patient',
      header: 'Patient',
      render: (item: Invoice) =>
        item.patient ? `${item.patient.first_name} ${item.patient.last_name}` : '—',
    },
    {
      key: 'invoice_date',
      header: 'Date',
      render: (item: Invoice) => formatDate(item.invoice_date),
    },
    {
      key: 'total_amount',
      header: 'Total',
      render: (item: Invoice) => formatCurrency(item.total_amount),
    },
    {
      key: 'payment_status',
      header: 'Status',
      render: (item: Invoice) => <StatusBadge status={item.payment_status} />,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-sm text-gray-500">Patient billing and invoices (KSh)</p>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/billing/invoices/create')}>
          New invoice
        </Button>
      </div>

      <Card variant="elevated">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search by invoice number or patient..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>
          <select
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="partial">Partial</option>
            <option value="paid">Paid</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </CardContent>
      </Card>

      {isLoading ? (
        <PageLoadingSpinner />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No invoices"
          description="Create an invoice for patient services"
          action={
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/billing/invoices/create')}>
              New invoice
            </Button>
          }
        />
      ) : (
        <Card variant="elevated">
          <DataTable columns={columns} data={filtered} keyExtractor={(item) => item.id} />
        </Card>
      )}
    </div>
  )
}
