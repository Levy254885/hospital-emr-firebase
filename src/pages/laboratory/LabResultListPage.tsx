import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLabOrders } from '@/hooks/useLabOrders'
import { DataTable } from '@/components/ui/DataTable'
import { StatusBadge, Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { formatDate } from '@/lib/utils'
import { Printer } from 'lucide-react'
import type { LabOrder } from '@/types'

export default function LabResultListPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const { data, isLoading } = useLabOrders({ status: 'completed', page, per_page: 15 })

  const columns = [
    {
      key: 'order_number',
      header: 'Order #',
      render: (item: LabOrder) => (
        <span className="font-mono text-primary-700">{item.order_number}</span>
      ),
    },
    {
      key: 'patient',
      header: 'Patient',
      render: (item: LabOrder) => (
        <div>
          <p className="font-medium text-gray-900">
            {item.patient?.first_name} {item.patient?.last_name}
          </p>
          <p className="text-xs text-gray-500">{item.patient?.document_number}</p>
        </div>
      ),
    },
    {
      key: 'items',
      header: 'Tests',
      render: (item: LabOrder) => (
        <div className="flex flex-wrap gap-1">
          {(item.items || []).map((i) => (
            <Badge key={i.id} variant="info">
              {i.test_code}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: 'created_at',
      header: 'Date',
      render: (item: LabOrder) => formatDate(item.created_at),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: LabOrder) => <StatusBadge status={item.status} />,
    },
    {
      key: 'actions',
      header: '',
      render: (item: LabOrder) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            window.open(`/lab/results/${item.id}/print`, '_blank')
          }}
          className="text-gray-400 hover:text-primary-600 transition-colors"
          title="Print result"
        >
          <Printer className="h-4 w-4" />
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Lab Results</h1>
        <p className="text-sm text-gray-500">Completed laboratory test results</p>
      </div>
      <Card variant="elevated">
        <DataTable
          columns={columns}
          data={data?.data || []}
          isLoading={isLoading}
          onRowClick={(item) => navigate(`/lab/orders/${item.id}`)}
          pagination={
            data?.meta
              ? {
                  current_page: data.meta.current_page,
                  last_page: data.meta.last_page,
                  per_page: data.meta.per_page,
                  total: data.meta.total,
                  onPageChange: setPage,
                }
              : undefined
          }
          emptyTitle="No results"
          emptyDescription="No laboratory results available"
        />
      </Card>
    </div>
  )
}
