import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useInvoices } from '@/hooks/useBilling'
import { DataTable } from '@/components/ui/DataTable'
import { StatusBadge } from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Plus, FileText, CreditCard } from 'lucide-react'
import type { Invoice } from '@/types'

export default function InvoiceListPage() {
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useInvoices({
    payment_status: statusFilter || undefined,
    page,
    per_page: 15,
  })

  const columns = [
    {
      key: 'invoice_number',
      header: 'N Factura',
      sortable: true,
      render: (item: Invoice) => (
        <span className="font-mono text-primary-700">{item.invoice_number}</span>
      ),
    },
    {
      key: 'patient',
      header: 'Paciente',
      render: (item: Invoice) => (
        <p className="font-medium text-gray-900">
          {item.patient?.first_name} {item.patient?.last_name}
        </p>
      ),
    },
    {
      key: 'invoice_date',
      header: 'Fecha Emision',
      sortable: true,
      render: (item: Invoice) => formatDate(item.invoice_date),
    },
    {
      key: 'total_amount',
      header: 'Total',
      render: (item: Invoice) => (
        <span className="font-medium">{formatCurrency(item.total_amount)}</span>
      ),
    },
    {
      key: 'payment_status',
      header: 'Estado',
      render: (item: Invoice) => <StatusBadge status={item.payment_status} />,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Facturas</h1>
          <p className="text-sm text-gray-500">Gestion de facturacion</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/billing/payments')}>
            <CreditCard className="h-4 w-4 mr-2" />
            Pagos
          </Button>
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/billing/invoices/create')}>
            Nueva Factura
          </Button>
        </div>
      </div>

      <Card variant="elevated">
        <CardHeader>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
            className="block w-full sm:w-40 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          >
            <option value="">Todos los estados</option>
            <option value="pending">Pendientes</option>
            <option value="paid">Pagadas</option>
            <option value="partial">Parcial</option>
            <option value="cancelled">Canceladas</option>
          </select>
        </CardHeader>
        <DataTable
          columns={columns}
          data={data?.data || []}
          isLoading={isLoading}
          onRowClick={(item) => navigate(`/billing/invoices/${item.id}`)}
          pagination={data?.meta ? {
            current_page: data.meta.current_page,
            last_page: data.meta.last_page,
            per_page: data.meta.per_page,
            total: data.meta.total,
            onPageChange: setPage,
          } : undefined}
          emptyTitle="No hay facturas"
          emptyDescription="No se encontraron facturas"
        />
      </Card>
    </div>
  )
}
