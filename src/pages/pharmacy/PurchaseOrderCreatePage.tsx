import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSuppliers, useMedications, useCreatePurchaseOrder } from '@/hooks/useMedications'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'
import { ArrowLeft, Save, Plus, Trash2, ShoppingCart } from 'lucide-react'

interface OrderItem { medication_id: string; quantity: number; unit_cost: number }

export default function PurchaseOrderCreatePage() {
  const navigate = useNavigate()
  const createPurchaseOrder = useCreatePurchaseOrder()
  const { data: suppliers } = useSuppliers()
  const { data: medications } = useMedications({ per_page: 100 })
  const [supplierId, setSupplierId] = useState('')
  const [items, setItems] = useState<OrderItem[]>([])
  const [notes, setNotes] = useState('')

  const addItem = () => setItems([...items, { medication_id: '', quantity: 1, unit_cost: 0 }])
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index))
  const updateItem = (index: number, field: keyof OrderItem, value: string | number) => {
    const updated = [...items]
    updated[index] = { ...updated[index], [field]: value }
    setItems(updated)
  }
  const total = items.reduce((sum, item) => sum + (item.quantity * item.unit_cost), 0)

  const handleSave = async () => {
    if (!supplierId || items.length === 0) return
    try {
      await createPurchaseOrder.mutateAsync({
        supplier_id: supplierId, notes,
        items: items.map(item => ({ medication_id: item.medication_id, quantity: item.quantity, unit_cost: item.unit_cost })),
      })
      navigate('/pharmacy/purchases')
    } catch (error) {
      console.error('Error creating purchase order:', error)
    }
  }

  const medicationOptions = medications?.data?.map((m: any) => ({ value: m.id.toString(), label: `${m.name} (${m.concentration || m.pharmaceutical_form || ''})` })) || []
  const supplierOptions = suppliers?.map((s: any) => ({ value: s.id.toString(), label: s.name })) || []

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" /></Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nueva Orden de Compra</h1>
          <p className="text-sm text-gray-500">Crear orden de compra a proveedor</p>
        </div>
      </div>
      <Card variant="elevated">
        <CardHeader><CardTitle>Proveedor</CardTitle></CardHeader>
        <CardContent>
          <Select label="Seleccionar Proveedor" required options={supplierOptions} value={supplierId} onChange={(e) => setSupplierId(e.target.value)} />
        </CardContent>
      </Card>
      <Card variant="elevated">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2"><ShoppingCart className="h-5 w-5 text-primary-600" />Medicamentos</CardTitle>
            <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={addItem}>Agregar</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No hay medicamentos agregados</p>
          ) : (
            items.map((item, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">Item {index + 1}</h4>
                  <button onClick={() => removeItem(index)} className="text-red-500 hover:text-red-700"><Trash2 className="h-4 w-4" /></button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Select label="Medicamento" options={medicationOptions} value={item.medication_id} onChange={(e) => updateItem(index, 'medication_id', e.target.value)} />
                  <Input label="Cantidad" type="number" min={1} value={item.quantity} onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)} />
                  <Input label="Precio Unitario" type="number" step="0.01" min={0} value={item.unit_cost} onChange={(e) => updateItem(index, 'unit_cost', parseFloat(e.target.value) || 0)} />
                </div>
              </div>
            ))
          )}
          {items.length > 0 && (
            <div className="text-right p-4 bg-gray-50 rounded-lg">
              <p className="text-lg font-bold text-gray-900">Total: {formatCurrency(total)}</p>
            </div>
          )}
        </CardContent>
      </Card>
      <Card variant="elevated">
        <CardHeader><CardTitle>Notas</CardTitle></CardHeader>
        <CardContent>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notas adicionales para la orden de compra..."
            className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 resize-y min-h-[80px]" />
        </CardContent>
      </Card>
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => navigate(-1)}>Cancelar</Button>
        <Button leftIcon={<Save className="h-4 w-4" />} onClick={handleSave} isLoading={createPurchaseOrder.isPending} disabled={!supplierId || items.length === 0}>Crear Orden</Button>
      </div>
    </div>
  )
}
