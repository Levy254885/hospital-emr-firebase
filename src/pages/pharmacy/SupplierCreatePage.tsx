import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreateSupplier } from '@/hooks/useMedications'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
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
    setFormData((prev) => ({ ...prev, [field]: value }))
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
          <h1 className="text-2xl font-bold text-gray-900">New supplier</h1>
          <p className="text-sm text-gray-500">Register a medication supplier</p>
        </div>
      </div>

      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary-600" />
            Supplier details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Company name"
              required
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
            />
            <Input
              label="Contact person"
              value={formData.contact_person}
              onChange={(e) => updateField('contact_person', e.target.value)}
            />
            <Input label="Phone" value={formData.phone} onChange={(e) => updateField('phone', e.target.value)} />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => updateField('email', e.target.value)}
            />
            <Input label="Tax ID" value={formData.nit} onChange={(e) => updateField('nit', e.target.value)} />
          </div>
          <Input label="Address" value={formData.address} onChange={(e) => updateField('address', e.target.value)} />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => navigate(-1)}>
          Cancel
        </Button>
        <Button
          leftIcon={<Save className="h-4 w-4" />}
          onClick={handleSave}
          isLoading={createSupplier.isPending}
          disabled={!formData.name}
        >
          Save supplier
        </Button>
      </div>
    </div>
  )
}
