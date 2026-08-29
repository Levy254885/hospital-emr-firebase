import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { StatusBadge, Badge } from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatDate } from '@/lib/utils'
import { Plus, ScanLine, FileText } from 'lucide-react'

interface ImagingOrder {
  id: string; order_number: string; patient_name: string; patient_document: string
  exam_type: string; body_area: string; status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  requested_by: string; created_at: string
}
const mockOrders: ImagingOrder[] = []

export default function ImagingOrderListPage() {
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState('')

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ordenes de Imagenologia</h1>
          <p className="text-sm text-gray-500">Gestion de estudios de imagen</p>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/radiology/orders/create')}>Nueva Orden</Button>
      </div>
      <Card variant="elevated">
        <CardHeader>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full sm:w-40 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20">
            <option value="">Todos los estados</option>
            <option value="pending">Pendientes</option>
            <option value="in_progress">En Proceso</option>
            <option value="completed">Completados</option>
          </select>
        </CardHeader>
        <CardContent>
          {mockOrders.length === 0 ? (
            <EmptyState title="No hay ordenes de imagenologia" description="No se encontraron ordenes de estudios de imagen" icon={<ScanLine className="h-8 w-8 text-gray-400" />} />
          ) : (
            <div className="space-y-3">
              {mockOrders.map((order) => (
                <div key={order.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{order.exam_type}</p>
                      <p className="text-sm text-gray-500">{order.patient_name} • {order.body_area}</p>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={order.status} />
                      <p className="text-xs text-gray-500 mt-1">{formatDate(order.created_at)}</p>
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
