import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreateSupplier } from '@/hooks/useMedications'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import TextArea from '@/components/ui/TextArea'
import Button from '@/components/ui/Button'
import { ArrowLeft, Save, Building2 } from 'lucide-react'

export default function SupplierCreatePage() {
  const navigate = useNavigate()
  const createSupplier = useCreateSupplier()

  const [formData, setFormData] = useState({
    name: '',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
    nit: '',
  })

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    try {
      await createSupplier.mutateAsync(formData)
      navigate('/pharmacy/suppliers')
    } catch (error) {
      console.error('Error saving supplier:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nuevo Proveedor</h1>
          <p className="text-sm text-gray-500">Registrar proveedor de medicamentos</p>
        </div>
      </div>

      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary-600" />
            Datos del Proveedor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Nombre de la Empresa" required value={formData.name} onChange={(e) => updateField('name', e.target.value)} />
            <Input label="Persona de Contacto" value={formData.contact_person} onChange={(e) => updateField('contact_person', e.target.value)} />
            <Input label="Telefono" value={formData.phone} onChange={(e) => updateField('phone', e.target.value)} />
            <Input label="Email" type="email" value={formData.email} onChange={(e) => updateField('email', e.target.value)} />
            <Input label="NIT" value={formData.nit} onChange={(e) => updateField('nit', e.target.value)} />
          </div>
          <Input label="Direccion" value={formData.address} onChange={(e) => updateField('address', e.target.value)} />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => navigate(-1)}>Cancelar</Button>
        <Button
          leftIcon={<Save className="h-4 w-4" />}
          onClick={handleSave}
          isLoading={createSupplier.isPending}
          disabled={!formData.name}
        >
          Guardar Proveedor
        </Button>
      </div>
    </div>
  )
}
