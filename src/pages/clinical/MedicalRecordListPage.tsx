import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMedicalRecords } from '@/hooks/useMedicalRecords'
import { DataTable } from '@/components/ui/DataTable'
import { StatusBadge } from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { formatDate } from '@/lib/utils'
import { Plus } from 'lucide-react'
import type { MedicalRecord } from '@/types'

export default function MedicalRecordListPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)

  const { data, isLoading } = useMedicalRecords({ page, per_page: 15 })

  const columns = [
    {
      key: 'record_number',
      header: 'Record No.',
      sortable: true,
      render: (item: MedicalRecord) => (
        <span className="font-mono text-primary-700">{item.record_number}</span>
      ),
    },
    {
      key: 'patient',
      header: 'Patient',
      render: (item: MedicalRecord) => (
        <div>
          <p className="font-medium text-gray-900">
            {item.patient?.first_name} {item.patient?.last_name}
          </p>
          <p className="text-xs text-gray-500">{item.patient?.document_number}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: MedicalRecord) => <StatusBadge status={item.status} />,
    },
    {
      key: 'created_at',
      header: 'Created',
      sortable: true,
      render: (item: MedicalRecord) => formatDate(item.created_at),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Medical records</h1>
          <p className="text-sm text-gray-500">Patient clinical history management</p>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/clinical/records/create')}>
          New record
        </Button>
      </div>

      <Card variant="elevated">
        <div className="p-4">
          <DataTable
            columns={columns}
            data={data?.data || []}
            isLoading={isLoading}
            searchable
            searchPlaceholder="Search by number or patient..."
            onRowClick={(item) => navigate(`/clinical/records/${item.id}`)}
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
            emptyTitle="No medical records"
            emptyDescription="No clinical records found"
          />
        </div>
      </Card>
    </div>
  )
}
