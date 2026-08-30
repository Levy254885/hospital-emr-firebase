import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreateInvoice, useServiceCatalog } from '@/hooks/useBilling'
import { usePatientSearch } from '@/hooks/usePatients'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import TextArea from '@/components/ui/TextArea'
import Button from '@/components/ui/Button'
import { ArrowLeft, Save, Plus, Trash2, FileText } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { ServiceCatalogItem } from '@/types'

interface InvoiceItemForm {
  service_catalog_id?: number
  description: string
  quantity: number
  unit_price: number
  discount: number
}

export default function InvoiceCreatePage() {
  const navigate = useNavigate()
  const createInvoice = useCreateInvoice()
  const [patientSearch, setPatientSearch] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<any>(null)
  const [items, setItems] = useState<InvoiceItemForm[]>([])
  const [notes, setNotes] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [serviceSearch, setServiceSearch] = useState('')
  const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null)
  const { data: searchResults } = usePatientSearch(patientSearch)
  const { data: serviceResults } = useServiceCatalog(serviceSearch)

  const addItem = () => setItems([...items, { service_catalog_id: undefined, description: '', quantity: 1, unit_price: 0, discount: 0 }])
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index))
  const updateItem = (index: number, field: keyof InvoiceItemForm, value: string | number | undefined) => {
    const updated = [...items]
    updated[index] = { ...updated[index], [field]: value }
    setItems(updated)
  }
  const selectService = (index: number, service: ServiceCatalogItem) => {
    const updated = [...items]
    updated[index] = { ...updated[index], service_catalog_id: service.id as unknown as number, description: service.name, unit_price: service.price }
    setItems(updated)
    setServiceSearch('')
    setActiveItemIndex(null)
  }
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price) - item.discount, 0)

  const handleSave = async () => {
    if (!selectedPatient || items.length === 0) return
    try {
      await createInvoice.mutateAsync({
        patient_id: selectedPatient.id,
        notes,
        due_date: dueDate || undefined,
        items: items.map(i => ({
          service_catalog_id: i.service_catalog_id,
          description: i.description,
          quantity: i.quantity,
          unit_price: i.unit_price,
          discount: i.discount,
        })),
      })
      navigate('/billing/invoices')
    } catch (error) {
      console.error('Error creating invoice:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" /></Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nueva Factura</h1>
          <p className="text-sm text-gray-500">Crear factura para servicios medicos</p>
        </div>
      </div>
      <Card variant="elevated">
        <CardHeader><CardTitle>Paciente</CardTitle></CardHeader>
        <CardContent>
          <div className="relative">
            <Input placeholder="Buscar paciente..." value={patientSearch} onChange={(e) => setPatientSearch(e.target.value)} />
            {searchResults && searchResults.length > 0 && !selectedPatient && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                {searchResults.map((patient) => (
                  <button key={patient.id} onClick={() => { setSelectedPatient(patient); setPatientSearch('') }} className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b last:border-0">
                    <p className="font-medium text-gray-900">{patient.first_name} {patient.last_name}</p>
                    <p className="text-sm text-gray-500">CI: {patient.document_number}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
          {selectedPatient && (
            <div className="mt-3 p-3 bg-primary-50 rounded-lg flex items-center justify-between">
              <div>
                <p className="font-medium text-primary-900">{selectedPatient.first_name} {selectedPatient.last_name}</p>
                <p className="text-sm text-primary-700">CI: {selectedPatient.document_number}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedPatient(null)}>Cambiar</Button>
            </div>
          )}
        </CardContent>
      </Card>
      <Card variant="elevated">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary-600" />Servicios</CardTitle>
            <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={addItem}>Agregar Servicio</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No hay servicios agregados. Haga clic en "Agregar Servicio" para comenzar.</p>
          ) : (
            items.map((item, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">Servicio {index + 1}</h4>
                  <button onClick={() => removeItem(index)} className="text-red-500 hover:text-red-700"><Trash2 className="h-4 w-4" /></button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Buscar servicio</label>
                    <div className="relative">
                      <Input placeholder="Buscar en catalogo..." value={activeItemIndex === index ? serviceSearch : ''} onChange={(e) => { setActiveItemIndex(index); setServiceSearch(e.target.value) }} onFocus={() => setActiveItemIndex(index)} />
                      {serviceResults && serviceResults.data && serviceResults.data.length > 0 && activeItemIndex === index && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-auto">
                          {serviceResults.data.map((service) => (
                            <button key={service.id} onClick={() => selectService(index, service)} className="w-full px-4 py-2 text-left hover:bg-gray-50 border-b last:border-0">
                              <p className="font-medium text-gray-900 text-sm">{service.name} ({service.code})</p>
                              <p className="text-xs text-gray-500">{formatCurrency(service.price)}</p>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <Input label="Descripcion" value={item.description} onChange={(e) => updateItem(index, 'description', e.target.value)} />
                  <Input label="Cantidad" type="number" min={1} value={item.quantity} onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)} />
                  <Input label="Precio Unitario" type="number" step="0.01" min={0} value={item.unit_price} onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-3">
                  <Input label="Descuento" type="number" step="0.01" min={0} value={item.discount} onChange={(e) => updateItem(index, 'discount', parseFloat(e.target.value) || 0)} />
                  <div className="flex items-end"><span className="text-sm text-gray-500">Subtotal: <span className="font-medium text-gray-900">{formatCurrency((item.quantity * item.unit_price) - item.discount)}</span></span></div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
      <Card variant="elevated">
        <CardHeader><CardTitle>Resumen</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <TextArea label="Notas" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Notas adicionales..." />
              <Input label="Fecha de vencimiento" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span className="font-medium">{formatCurrency(subtotal)}</span></div>
              <div className="border-t pt-3 flex justify-between"><span className="text-lg font-bold text-gray-900">Total</span><span className="text-lg font-bold text-primary-700">{formatCurrency(subtotal)}</span></div>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => navigate(-1)}>Cancelar</Button>
        <Button leftIcon={<Save className="h-4 w-4" />} onClick={handleSave} isLoading={createInvoice.isPending} disabled={!selectedPatient || items.length === 0}>Crear Factura</Button>
      </div>
    </div>
  )
}
