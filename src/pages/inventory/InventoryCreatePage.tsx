import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { createInventoryItem } from '@/lib/services/inventoryService'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import { ArrowLeft, Save, Package } from 'lucide-react'
import toast from 'react-hot-toast'

export default function InventoryCreatePage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const qc = useQueryClient()
  const { user } = useAuth()
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    category: 'general',
    quantity: 0,
    min_quantity: 10,
    unit: 'units',
    location: '',
    supplier: '',
    cost: 0,
  })

  const updateField = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Name is required')
      return
    }
    setSaving(true)
    try {
      await createInventoryItem(
        {
          ...formData,
          institution_id: user?.institution_id || 'default',
        },
        user?.id || 'system'
      )
      await qc.invalidateQueries({ queryKey: ['inventory-items'] })
      toast.success('Inventory item saved')
      navigate('/inventory')
    } catch (err: unknown) {
      const e = err as Error
      toast.error(e.message || 'Failed to save item')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {id ? 'Edit Item' : 'New Inventory Item'}
          </h1>
          <p className="text-sm text-gray-500">
            {id ? 'Update inventory item' : 'Register a new stock item'}
          </p>
        </div>
      </div>

      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary-600" />
            Item details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input label="Name" required value={formData.name} onChange={(e) => updateField('name', e.target.value)} />
            <Select
              label="Category"
              options={[
                { value: 'general', label: 'General' },
                { value: 'medication', label: 'Medication' },
                { value: 'consumable', label: 'Consumable' },
                { value: 'equipment', label: 'Equipment' },
                { value: 'surgical', label: 'Surgical' },
              ]}
              value={formData.category}
              onChange={(e) => updateField('category', e.target.value)}
            />
            <Input label="Quantity" type="number" value={formData.quantity} onChange={(e) => updateField('quantity', parseFloat(e.target.value) || 0)} />
            <Input label="Minimum quantity" type="number" value={formData.min_quantity} onChange={(e) => updateField('min_quantity', parseFloat(e.target.value) || 0)} />
            <Input label="Unit" value={formData.unit} onChange={(e) => updateField('unit', e.target.value)} placeholder="units, boxes, ml..." />
            <Input label="Location" value={formData.location} onChange={(e) => updateField('location', e.target.value)} />
            <Input label="Supplier" value={formData.supplier} onChange={(e) => updateField('supplier', e.target.value)} />
            <Input label="Unit cost (KSh)" type="number" value={formData.cost} onChange={(e) => updateField('cost', parseFloat(e.target.value) || 0)} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
        <Button leftIcon={<Save className="h-4 w-4" />} onClick={handleSave} isLoading={saving}>Save Item</Button>
      </div>
    </div>
  )
}
