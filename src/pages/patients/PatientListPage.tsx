import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePatients } from '@/hooks/usePatients'
import { DataTable } from '@/components/ui/DataTable'
import { StatusBadge, Badge } from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import { Card, CardHeader } from '@/components/ui/Card'
import { calculateAge } from '@/lib/utils'
import { Plus } from 'lucide-react'
import type { Patient } from '@/types'

export default function PatientListPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [genderFilter, setGenderFilter] = useState('')
  const [page, setPage] = useState(1)
  const { data, isLoading } = usePatients({
    search,
    is_active: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined,
    gender: genderFilter || undefined,
    page,
    per_page: 15,
  })

  const columns = [
    {
      key: 'medical_record_number',
      header: 'MRN',
      sortable: true,
      render: (item: Patient) => (
        <span className="font-mono text-primary-700">{item.medical_record_number}</span>
      ),
    },
    {
      key: 'name',
      header: 'Full name',
      sortable: true,
      render: (item: Patient) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-xs font-medium text-primary-700">
              {item.first_name.charAt(0)}
              {item.last_name.charAt(0)}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900">
              {item.first_name} {item.last_name}
            </p>
            <p className="text-xs text-gray-500">{item.document_number}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'birth_date',
      header: 'Age',
      sortable: true,
      render: (item: Patient) => <span>{calculateAge(item.birth_date)} years</span>,
    },
    {
      key: 'gender',
      header: 'Sex',
      render: (item: Patient) => (
        <Badge variant={item.gender === 'M' ? 'info' : item.gender === 'F' ? 'secondary' : 'default'}>
          {item.gender === 'M' ? 'Male' : item.gender === 'F' ? 'Female' : 'Other'}
        </Badge>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (item: Patient) => item.phone || '—',
    },
    {
      key: 'is_active',
      header: 'Status',
      render: (item: Patient) => <StatusBadge status={item.is_active ? 'active' : 'inactive'} />,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
          <p className="text-sm text-gray-500">Hospital patient management</p>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/patients/create')}>
          New patient
        </Button>
      </div>
      <Card variant="elevated">
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by name, ID, or record number..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
            <Select
              options={[
                { value: '', label: 'All statuses' },
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
              ]}
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(1)
              }}
              className="w-full sm:w-40"
            />
            <Select
              options={[
                { value: '', label: 'All sexes' },
                { value: 'M', label: 'Male' },
                { value: 'F', label: 'Female' },
                { value: 'O', label: 'Other' },
              ]}
              value={genderFilter}
              onChange={(e) => {
                setGenderFilter(e.target.value)
                setPage(1)
              }}
              className="w-full sm:w-40"
            />
          </div>
        </CardHeader>
        <DataTable
          columns={columns}
          data={data?.data || []}
          isLoading={isLoading}
          onRowClick={(item) => navigate(`/patients/${item.id}`)}
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
          emptyTitle="No patients"
          emptyDescription="No patients match the selected filters"
        />
      </Card>
    </div>
  )
}
