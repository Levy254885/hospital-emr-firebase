import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSuppliers, useCreateSupplier } from '@/hooks/useMedications'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatDate } from '@/lib/utils'
import { Plus, Building2 } from 'lucide-react'

export default function SupplierListPage() {
  const navigate = useNavigate()
  const { data: suppliers, isLoading } = useSuppliers()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Proveedores</h1>
          <p className="text-sm text-gray-500">Gestion de proveedores de medicamentos</p>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/pharmacy/suppliers/create')}>
          Nuevo Proveedor
        </Button>
      </div>

      <Card variant="elevated">
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Cargando proveedores...</div>
          ) : !suppliers || suppliers.length === 0 ? (
            <EmptyState
              title="No hay proveedores"
              description="Registre proveedores para gestionar sus medicamentos"
              icon={<Building2 className="h-8 w-8 text-gray-400" />}
              action={
                <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/pharmacy/suppliers/create')}>
                  Registrar Proveedor
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              {suppliers.map((supplier: any) => (
                <div key={supplier.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{supplier.name}</p>
                      <p className="text-sm text-gray-500">
                        {supplier.contact_person && `${supplier.contact_person} • `}
                        {supplier.phone && `${supplier.phone} • `}
                        {supplier.email}
                      </p>
                    </div>
                    <div className="text-right">
                      {supplier.nit && (
                        <p className="text-sm text-gray-500">NIT: {supplier.nit}</p>
                      )}
                      <p className="text-xs text-gray-400">{supplier.status || 'active'}</p>
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
