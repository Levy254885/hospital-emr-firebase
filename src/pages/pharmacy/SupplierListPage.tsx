import { useNavigate } from 'react-router-dom'
import { useSuppliers } from '@/hooks/useMedications'
import { Card, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { PageLoadingSpinner } from '@/components/ui/LoadingSpinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { Plus, Building2 } from 'lucide-react'

export default function SupplierListPage() {
  const navigate = useNavigate()
  const { data, isLoading } = useSuppliers()
  const suppliers = (data as { id: string; name?: string; contact_person?: string; phone?: string; email?: string; nit?: string }[]) || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Suppliers</h1>
          <p className="text-sm text-gray-500">Medication and supply vendors</p>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/pharmacy/suppliers/create')}>
          New supplier
        </Button>
      </div>

      {isLoading ? (
        <PageLoadingSpinner />
      ) : suppliers.length === 0 ? (
        <EmptyState
          title="No suppliers"
          description="Register suppliers to manage your medications"
          action={
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/pharmacy/suppliers/create')}>
              New supplier
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliers.map((supplier) => (
            <Card key={supplier.id} variant="elevated">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary-100">
                    <Building2 className="h-5 w-5 text-primary-700" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{supplier.name}</p>
                    {supplier.contact_person && (
                      <p className="text-sm text-gray-500">{supplier.contact_person}</p>
                    )}
                    {supplier.phone && <p className="text-sm text-gray-500">{supplier.phone}</p>}
                    {supplier.email && <p className="text-sm text-gray-500">{supplier.email}</p>}
                    {supplier.nit && (
                      <p className="text-sm text-gray-500">Tax ID: {supplier.nit}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
