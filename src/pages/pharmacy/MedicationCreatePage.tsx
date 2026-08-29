import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMedication, useCreateMedication, useUpdateMedication } from '@/hooks/useMedications'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { PageLoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ArrowLeft, Save, Pill } from 'lucide-react'

export default function MedicationCreatePage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { data: medication, isLoading } = useMedication(id!)
  const createMedication = useCreateMedication()
  const updateMedication = useUpdateMedication()
  const [formData, setFormData] = useState({
    name: '', generic_name: '', concentration: '', pharmaceutical_form: '', manufacturer: '',
    requires_prescription: true, minimum_stock: 10, current_stock: 0, unit_price: 0, cost_price: 0,
  })

  useEffect(() => {
    if (medication) {
      setFormData({
        name: medication.name || '', generic_name: medication.generic_name || '',
        concentration: medication.concentration || '',
        pharmaceutical_form: medication.pharmaceutical_form || medication.presentation || '',
        manufacturer: medication.manufacturer || '',
        requires_prescription: medication.requires_prescription ?? true,
        minimum_stock: medication.minimum_stock || medication.min_stock || 10,
        current_stock: medication.current_stock || medication.stock_quantity || 0,
        unit_price: medication.unit_price || 0, cost_price: medication.cost_price || 0,
      })
    }
  }, [medication])

  const updateField = (field: string, value: string | number | boolean) => setFormData(prev => ({ ...prev, [field]: value }))

  const handleSave = async () => {
    try {
      if (id) await updateMedication.mutateAsync({ id, data: formData as any })
      else await createMedication.mutateAsync(formData as any)
      navigate('/pharmacy/medications')
    } catch (error) {
      console.error('Error saving medication:', error)
    }
  }

  if (id && isLoading) return <PageLoadingSpinner />

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" /></Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{id ? 'Editar Medicamento' : 'Nuevo Medicamento'}</h1>
          <p className="text-sm text-gray-500">{id ? 'Actualizar datos del medicamento' : 'Registrar nuevo medicamento'}</p>
        </div>
      </div>
      <Card variant="elevated">
        <CardHeader><CardTitle className="flex items-center gap-2"><Pill className="h-5 w-5 text-primary-600" />Informacion del Medicamento</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input label="Nombre" required value={formData.name} onChange={(e) => updateField('name', e.target.value)} />
            <Input label="Nombre Generico" value={formData.generic_name} onChange={(e) => updateField('generic_name', e.target.value)} />
            <Input label="Forma Farmaceutica" placeholder="ej: Tabletas, Jarabe, Crema" value={formData.pharmaceutical_form} onChange={(e) => updateField('pharmaceutical_form', e.target.value)} />
            <Input label="Concentracion" placeholder="ej: 500mg, 100ml" value={formData.concentration} onChange={(e) => updateField('concentration', e.target.value)} />
            <Input label="Fabricante" value={formData.manufacturer} onChange={(e) => updateField('manufacturer', e.target.value)} />
          </div>
        </CardContent>
      </Card>
      <Card variant="elevated">
        <CardHeader><CardTitle>Inventario</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input label="Cantidad en Stock" type="number" min={0} value={formData.current_stock} onChange={(e) => updateField('current_stock', parseInt(e.target.value) || 0)} />
            <Input label="Stock Minimo" type="number" min={0} value={formData.minimum_stock} onChange={(e) => updateField('minimum_stock', parseInt(e.target.value) || 0)} helperText="Alerta cuando el stock baje de este valor" />
            <Input label="Precio Unitario" type="number" step="0.01" min={0} value={formData.unit_price} onChange={(e) => updateField('unit_price', parseFloat(e.target.value) || 0)} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <Input label="Precio de Costo" type="number" step="0.01" min={0} value={formData.cost_price} onChange={(e) => updateField('cost_price', parseFloat(e.target.value) || 0)} />
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.requires_prescription} onChange={(e) => updateField('requires_prescription', e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                <span className="text-sm text-gray-700">Requiere receta medica</span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => navigate(-1)}>Cancelar</Button>
        <Button leftIcon={<Save className="h-4 w-4" />} onClick={handleSave} isLoading={createMedication.isPending || updateMedication.isPending}>
          {id ? 'Guardar Cambios' : 'Crear Medicamento'}
        </Button>
      </div>
    </div>
  )
}
