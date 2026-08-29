import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePurchaseOrders } from '@/hooks/useMedications'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { StatusBadge, Badge } from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Plus, ShoppingCart } from 'lucide-react'

export default function PurchaseOrderListPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const { data, isLoading } = usePurchaseOrders({ page, per_page: 15 })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ordenes de Compra</h1>
          <p className="text-sm text-gray-500">Gestion de ordenes de compra a proveedores</p>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/pharmacy/purchases/create')}>
          Nueva Orden
        </Button>
      </div>

      <Card variant="elevated">
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Cargando ordenes...</div>
          ) : !data?.data || data.data.length === 0 ? (
            <EmptyState
              title="No hay ordenes de compra"
              description="Cree ordenes de compra para reposicion de inventario"
              icon={<ShoppingCart className="h-8 w-8 text-gray-400" />}
              action={
                <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/pharmacy/purchases/create')}>
                  Nueva Orden de Compra
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              {data.data.map((order: any) => (
                <div key={order.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Orden {order.order_number}</p>
                      <p className="text-sm text-gray-500">{order.supplier?.name || 'Proveedor'}</p>
                      <p className="text-xs text-gray-400">{formatDate(order.created_at)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{formatCurrency(order.total)}</p>
                      <StatusBadge status={order.status} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
