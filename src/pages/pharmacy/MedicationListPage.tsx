import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMedications, useLowStockMedications } from '@/hooks/useMedications'
import { DataTable } from '@/components/ui/DataTable'
import { StatusBadge, Badge } from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { formatCurrency } from '@/lib/utils'
import { Plus, AlertTriangle, Package } from 'lucide-react'
import type { Medication } from '@/types'

export default function MedicationListPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const { data, isLoading } = useMedications({ search, page, per_page: 15 })
  const { data: lowStock } = useLowStockMedications()

  const columns = [
    {
      key: 'name',
      header: 'Nombre',
      sortable: true,
      render: (item: Medication) => (
        <div>
          <p className="font-medium text-gray-900">{item.name}</p>
          {item.generic_name && <p className="text-xs text-gray-500">{item.generic_name}</p>}
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Categoria',
      render: (item: Medication) => <Badge variant="primary">{item.category || 'N/A'}</Badge>,
    },
    {
      key: 'pharmaceutical_form',
      header: 'Forma',
      render: (item: Medication) => item.pharmaceutical_form || item.presentation || 'N/A',
    },
    {
      key: 'concentration',
      header: 'Concentracion',
      render: (item: Medication) => item.concentration,
    },
    {
      key: 'current_stock',
      header: 'Stock',
      sortable: true,
      render: (item: Medication) => {
        const stock = item.current_stock ?? item.stock_quantity ?? 0
        const minStock = item.min_stock ?? item.minimum_stock ?? 10
        return (
          <div className="flex items-center gap-2">
            <span className={`font-medium ${stock <= minStock ? 'text-red-600' : 'text-gray-900'}`}>{stock}</span>
            {stock <= minStock && <AlertTriangle className="h-4 w-4 text-red-500" />}
          </div>
        )
      },
    },
    {
      key: 'unit_price',
      header: 'Precio',
      render: (item: Medication) => formatCurrency(item.unit_price),
    },
    {
      key: 'is_active',
      header: 'Estado',
      render: (item: Medication) => <StatusBadge status={item.is_active ? 'active' : 'inactive'} />,
    },
  ]

  const lowStockList = lowStock ?? []

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Medicamentos</h1>
          <p className="text-sm text-gray-500">Inventario de medicamentos</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/pharmacy/dispensation')}>
            <Package className="h-4 w-4 mr-2" />
            Despacho
          </Button>
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/pharmacy/medications/create')}>
            Nuevo Medicamento
          </Button>
        </div>
      </div>

      {lowStockList.length > 0 && (
        <Card variant="bordered" className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="h-5 w-5" />
              Stock Bajo ({lowStockList.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {lowStockList.slice(0, 5).map((med) => (
                <Badge key={med.id} variant="warning">
                  {med.name}: {med.current_stock ?? med.stock_quantity ?? 0} unidades
                </Badge>
              ))}
              {lowStockList.length > 5 && (
                <Badge variant="warning">+{lowStockList.length - 5} mas</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card variant="elevated">
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar medicamento..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
          </div>
        </CardHeader>
        <DataTable
          columns={columns}
          data={data?.data || []}
          isLoading={isLoading}
          onRowClick={(item) => navigate(`/pharmacy/medications/${item.id}`)}
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
          emptyTitle="No hay medicamentos"
          emptyDescription="No se encontraron medicamentos en el inventario"
        />
      </Card>
    </div>
  )
}
