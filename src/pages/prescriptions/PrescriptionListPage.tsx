import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePrescriptions } from '@/hooks/usePrescriptions'
import { DataTable } from '@/components/ui/DataTable'
import { StatusBadge } from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { formatDate } from '@/lib/utils'
import { Plus, Printer } from 'lucide-react'
import type { Prescription } from '@/types'

export default function PrescriptionListPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const { data, isLoading } = usePrescriptions({
    status: statusFilter || undefined,
    page,
    per_page: 15,
  })

  const columns = [
    {
      key: 'prescription_number',
      header: 'Rx No.',
      sortable: true,
      render: (item: Prescription) => (
        <span className="font-mono text-primary-700">{item.prescription_number}</span>
      ),
    },
    {
      key: 'patient',
      header: 'Patient',
      render: (item: Prescription) => (
        <p className="font-medium text-gray-900">
          {item.patient?.first_name} {item.patient?.last_name}
        </p>
      ),
    },
    {
      key: 'doctor',
      header: 'Doctor',
      render: (item: Prescription) => (
        <span>
          Dr. {item.doctor?.first_name} {item.doctor?.last_name}
        </span>
      ),
    },
    {
      key: 'items',
      header: 'Medications',
      render: (item: Prescription) => (
        <span>{item.items?.length ?? 0} item(s)</span>
      ),
    },
    {
      key: 'issued_date',
      header: 'Issued',
      sortable: true,
      render: (item: Prescription) => formatDate(item.issued_date),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: Prescription) => <StatusBadge status={item.status} />,
    },
    {
      key: 'actions',
      header: '',
      render: (item: Prescription) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            window.open(`/prescriptions/${item.id}/print`, '_blank')
          }}
          className="text-gray-400 hover:text-primary-600 transition-colors"
          title="Print prescription"
        >
          <Printer className="h-4 w-4" />
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Prescriptions</h1>
          <p className="text-sm text-gray-500">Medical prescription management</p>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/prescriptions/create')}>
          New prescription
        </Button>
      </div>
      <Card variant="elevated">
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by number or patient..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(1)
              }}
              className="block w-full sm:w-40 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="dispensed">Dispensed</option>
              <option value="cancelled">Cancelled</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </CardHeader>
        <DataTable
          columns={columns}
          data={data?.data || []}
          isLoading={isLoading}
          onRowClick={(item) => navigate(`/prescriptions/${item.id}`)}
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
          emptyTitle="No prescriptions"
          emptyDescription="No prescriptions found"
        />
      </Card>
    </div>
  )
}
