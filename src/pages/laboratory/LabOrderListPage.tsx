import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLabOrders } from '@/hooks/useLabOrders'
import { DataTable } from '@/components/ui/DataTable'
import { StatusBadge } from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { formatDate } from '@/lib/utils'
import { Plus, TestTube } from 'lucide-react'
import type { LabOrder } from '@/types'

export default function LabOrderListPage() {
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [page, setPage] = useState(1)
  const { data, isLoading } = useLabOrders({
    status: statusFilter || undefined,
    priority: priorityFilter || undefined,
    page,
    per_page: 15,
  })

  const columns = [
    {
      key: 'order_number',
      header: 'Order No.',
      sortable: true,
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
      key: 'doctor',
      header: 'Ordering doctor',
      render: (item: LabOrder) => (
        <span>
          Dr. {item.doctor?.first_name} {item.doctor?.last_name}
        </span>
      ),
    },
    {
      key: 'items',
      header: 'Tests',
      render: (item: LabOrder) => <span>{item.items?.length ?? 0} test(s)</span>,
    },
    {
      key: 'priority',
      header: 'Priority',
      render: (item: LabOrder) => <StatusBadge status={item.priority} />,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: LabOrder) => <StatusBadge status={item.status} />,
    },
    {
      key: 'created_at',
      header: 'Date',
      sortable: true,
      render: (item: LabOrder) => formatDate(item.created_at),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Laboratory orders</h1>
          <p className="text-sm text-gray-500">Lab test order management</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/lab/results')}>
            <TestTube className="h-4 w-4 mr-2" />
            View results
          </Button>
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/lab/orders/create')}>
            New order
          </Button>
        </div>
      </div>
      <Card variant="elevated">
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(1)
              }}
              className="block w-full sm:w-40 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value)
                setPage(1)
              }}
              className="block w-full sm:w-40 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="">All priorities</option>
              <option value="routine">Routine</option>
              <option value="urgent">Urgent</option>
              <option value="stat">STAT</option>
            </select>
          </div>
        </CardHeader>
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
          emptyTitle="No orders"
          emptyDescription="No laboratory orders found"
        />
      </Card>
    </div>
  )
}
