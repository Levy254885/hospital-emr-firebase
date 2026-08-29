import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ArrowLeft, ArrowUpDown, ArrowUpRight, ArrowDownRight } from 'lucide-react'

interface Movement {
  id: string; type: 'entry' | 'exit' | 'adjustment'; item_name: string; quantity: number
  reference: string; notes: string; created_by: string; created_at: string
}

export default function InventoryMovementPage() {
  const navigate = useNavigate()
  const movements: Movement[] = []

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" /></Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Movimientos de Inventario</h1>
          <p className="text-sm text-gray-500">Historial de entradas y salidas</p>
        </div>
      </div>
      <Card variant="elevated">
        <CardContent>
          {movements.length === 0 ? (
            <EmptyState title="No hay movimientos" description="No se registran movimientos de inventario" icon={<ArrowUpDown className="h-8 w-8 text-gray-400" />} />
          ) : (
            <div className="space-y-3">
              {movements.map((movement) => (
                <div key={movement.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        movement.type === 'entry' ? 'bg-green-100' : movement.type === 'exit' ? 'bg-red-100' : 'bg-yellow-100'
                      }`}>
                        {movement.type === 'entry' ? <ArrowDownRight className="h-4 w-4 text-green-600" /> :
                         movement.type === 'exit' ? <ArrowUpRight className="h-4 w-4 text-red-600" /> :
                         <ArrowUpDown className="h-4 w-4 text-yellow-600" />}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{movement.item_name}</p>
                        <p className="text-sm text-gray-500">{movement.notes}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${
                        movement.type === 'entry' ? 'text-green-600' : movement.type === 'exit' ? 'text-red-600' : 'text-yellow-600'
                      }`}>
                        {movement.type === 'entry' ? '+' : movement.type === 'exit' ? '-' : ''}{movement.quantity}
                      </p>
                      <p className="text-xs text-gray-500">{movement.created_at}</p>
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
