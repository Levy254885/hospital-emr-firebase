import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { listInventoryItems } from '@/lib/services'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { PageLoadingSpinner } from '@/components/ui/LoadingSpinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatCurrency } from '@/lib/utils'
import { Plus, Package, ArrowUpDown, RefreshCw } from 'lucide-react'

export default function InventoryListPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: items = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ['inventory-items', user?.institution_id],
    queryFn: () => listInventoryItems(user?.institution_id),
    staleTime: 0,
    refetchOnMount: 'always',
  })

  if (isLoading) return <PageLoadingSpinner />

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
          <p className="text-sm text-gray-500">Stock and supplies ({items.length} items)</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            leftIcon={<RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />}
            onClick={() => refetch()}
          >
            Refresh
          </Button>
          <Button variant="outline" onClick={() => navigate('/inventory/movements')}>
            <ArrowUpDown className="h-4 w-4 mr-2" />
            Movements
          </Button>
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/inventory/create')}>
            Add Item
          </Button>
        </div>
      </div>

      <Card variant="elevated">
        <CardContent className="pt-6">
          {items.length === 0 ? (
            <EmptyState
              title="No inventory items"
              description="Add items to start tracking stock"
              icon={<Package className="h-8 w-8 text-gray-400" />}
              action={
                <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/inventory/create')}>
                  Add Item
                </Button>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="text-left text-xs font-semibold text-gray-500 uppercase">
                    <th className="px-3 py-3">Name</th>
                    <th className="px-3 py-3">Category</th>
                    <th className="px-3 py-3">Qty</th>
                    <th className="px-3 py-3">Location</th>
                    <th className="px-3 py-3">Cost</th>
                    <th className="px-3 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((item) => {
                    const low = (item.quantity ?? 0) <= (item.min_quantity ?? 0)
                    return (
                      <tr
                        key={item.id}
                        className="text-sm cursor-pointer hover:bg-gray-50"
                        onClick={() => navigate(`/inventory/${item.id}`)}
                      >
                        <td className="px-3 py-3 font-medium text-gray-900">{item.name}</td>
                        <td className="px-3 py-3 text-gray-600">{item.category || '—'}</td>
                        <td className={`px-3 py-3 font-medium ${low ? 'text-red-600' : 'text-gray-900'}`}>
                          {item.quantity} {item.unit || ''}
                        </td>
                        <td className="px-3 py-3 text-gray-600">{item.location || '—'}</td>
                        <td className="px-3 py-3">{formatCurrency(item.cost || 0)}</td>
                        <td className="px-3 py-3">
                          {low ? <Badge variant="warning">Low stock</Badge> : <Badge variant="success">OK</Badge>}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
