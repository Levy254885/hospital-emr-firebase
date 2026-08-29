import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Badge } from '@/components/ui/Badge'
import { Plus, Package, ArrowUpDown } from 'lucide-react'

interface InventoryItem {
  id: string
  name: string
  category: string
  quantity: number
  min_quantity: number
  unit: string
  location: string
  last_updated: string
}

export default function InventoryListPage() {
  const navigate = useNavigate()
  const items: InventoryItem[] = []

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventario</h1>
          <p className="text-sm text-gray-500">Gestion de inventario general</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/inventory/movements')}>
            <ArrowUpDown className="h-4 w-4 mr-2" />
            Movimientos
          </Button>
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/inventory/create')}>
            Nuevo Item
          </Button>
        </div>
      </div>

      <Card variant="elevated">
        <CardContent>
          {items.length === 0 ? (
            <EmptyState
              title="No hay items en inventario"
              description="Registre items para comenzar a gestionar el inventario"
              icon={<Package className="h-8 w-8 text-gray-400" />}
              action={
                <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/inventory/create')}>
                  Registrar Item
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">{item.category} • {item.location}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${item.quantity <= item.min_quantity ? 'text-red-600' : 'text-gray-900'}`}>
                        {item.quantity} {item.unit}
                      </p>
                      {item.quantity <= item.min_quantity && (
                        <Badge variant="warning">Stock Bajo</Badge>
                      )}
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
