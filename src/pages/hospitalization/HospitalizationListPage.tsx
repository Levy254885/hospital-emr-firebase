import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHospitalizations } from '@/hooks/useHospitalization'
import { DataTable } from '@/components/ui/DataTable'
import { StatusBadge } from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { formatDate } from '@/lib/utils'
import { Plus, Bed } from 'lucide-react'
import type { Hospitalization } from '@/types'

export default function HospitalizationListPage() {
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const { data, isLoading } = useHospitalizations({
    status: statusFilter || undefined,
    page,
    per_page: 15,
  })

  const columns = [
    {
      key: 'patient',
      header: 'Patient',
      render: (item: Hospitalization) => (
        <div>
          <p className="font-medium text-gray-900">
            {item.patient?.first_name} {item.patient?.last_name}
          </p>
          <p className="text-xs text-gray-500">{item.patient?.document_number}</p>
        </div>
      ),
    },
    {
      key: 'admission_date',
      header: 'Admission date',
      sortable: true,
      render: (item: Hospitalization) => formatDate(item.admission_date),
    },
    {
      key: 'bed',
      header: 'Bed',
      render: (item: Hospitalization) => (
        <div className="flex items-center gap-2">
          <Bed className="h-4 w-4 text-gray-400" />
          <span>{item.bed?.number || 'Unassigned'}</span>
        </div>
      ),
    },
    {
      key: 'department',
      header: 'Department',
      render: (item: Hospitalization) => item.department || '—',
    },
    {
      key: 'doctor',
      header: 'Doctor',
      render: (item: Hospitalization) => (
        <span>
          Dr. {item.doctor?.first_name} {item.doctor?.last_name}
        </span>
      ),
    },
    {
      key: 'reason',
      header: 'Reason',
      render: (item: Hospitalization) => (
        <span className="truncate max-w-[200px] block">{item.reason}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: Hospitalization) => <StatusBadge status={item.status} />,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inpatient</h1>
          <p className="text-sm text-gray-500">Currently admitted patients</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/hospitalization/bed-map')}>
            <Bed className="h-4 w-4 mr-2" />
            Bed map
          </Button>
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/hospitalization/create')}>
            New admission
          </Button>
        </div>
      </div>
      <Card variant="elevated">
        <CardHeader>
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
            <option value="discharged">Discharged</option>
            <option value="transferred">Transferred</option>
          </select>
        </CardHeader>
        <DataTable
          columns={columns}
          data={data?.data || []}
          isLoading={isLoading}
          onRowClick={(item) => navigate(`/hospitalization/${item.id}`)}
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
          emptyTitle="No admissions"
          emptyDescription="No active hospitalizations found"
        />
      </Card>
    </div>
  )
}
