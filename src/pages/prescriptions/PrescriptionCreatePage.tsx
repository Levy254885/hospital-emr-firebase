import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreatePrescription } from '@/hooks/usePrescriptions'
import { usePatientSearch } from '@/hooks/usePatients'
import { useMedications } from '@/hooks/useMedications'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import TextArea from '@/components/ui/TextArea'
import Button from '@/components/ui/Button'
import { ArrowLeft, Save, Plus, Trash2, FileText, Pill } from 'lucide-react'

interface PrescriptionItemForm {
  medication_id: string
  medication_name: string
  dosage: string
  frequency: string
  duration: string
  quantity: number
  instructions: string
}

export default function PrescriptionCreatePage() {
  const navigate = useNavigate()
  const createPrescription = useCreatePrescription()
  const [patientSearch, setPatientSearch] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<any>(null)
  const [items, setItems] = useState<PrescriptionItemForm[]>([])
  const [notes, setNotes] = useState('')
  const { data: searchResults } = usePatientSearch(patientSearch)
  const { data: medications } = useMedications({ per_page: 100 })

  const addItem = () => setItems([...items, { medication_id: '', medication_name: '', dosage: '', frequency: '', duration: '', quantity: 1, instructions: '' }])
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index))
  const updateItem = (index: number, field: keyof PrescriptionItemForm, value: string | number) => {
    const updated = [...items]
    updated[index] = { ...updated[index], [field]: value }
    setItems(updated)
  }

  const handleSave = async () => {
    if (!selectedPatient || items.length === 0) return
    try {
      await createPrescription.mutateAsync({
        patient_id: selectedPatient.id,
        consultation_id: 'current',
        notes,
        items: items.map(i => ({
          medication_id: i.medication_id,
          dosage: i.dosage,
          frequency: i.frequency,
          duration: i.duration,
          quantity: i.quantity,
          instructions: i.instructions,
        })),
      } as any)
      navigate('/prescriptions')
    } catch (error) {
      console.error('Error creating prescription:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" /></Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nueva Receta Medica</h1>
          <p className="text-sm text-gray-500">Ingrese los medicamentos a prescribir</p>
        </div>
      </div>
      <Card variant="elevated">
        <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary-600" />Seleccion de Paciente</CardTitle></CardHeader>
        <CardContent>
          <div className="relative">
            <Input label="Buscar Paciente" placeholder="Escriba nombre o CI del paciente..." value={patientSearch} onChange={(e) => setPatientSearch(e.target.value)} />
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
            <CardTitle className="flex items-center gap-2"><Pill className="h-5 w-5 text-primary-600" />Medicamentos</CardTitle>
            <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={addItem}>Agregar</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No hay medicamentos agregados. Haga clic en "Agregar" para comenzar.</p>
          ) : (
            items.map((item, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">Medicamento {index + 1}</h4>
                  <button onClick={() => removeItem(index)} className="text-red-500 hover:text-red-700"><Trash2 className="h-4 w-4" /></button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Medicamento *</label>
                    <select value={item.medication_id} onChange={(e) => updateItem(index, 'medication_id', e.target.value)}
                      className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20">
                      <option value="">Seleccionar medicamento</option>
                      {medications?.data?.map((med) => (
                        <option key={med.id} value={med.id}>{med.name} - {med.presentation}</option>
                      ))}
                    </select>
                  </div>
                  <Input label="Dosis" placeholder="ej: 500mg" value={item.dosage} onChange={(e) => updateItem(index, 'dosage', e.target.value)} />
                  <Input label="Frecuencia" placeholder="ej: Cada 8 horas" value={item.frequency} onChange={(e) => updateItem(index, 'frequency', e.target.value)} />
                  <Input label="Duracion" placeholder="ej: 7 dias" value={item.duration} onChange={(e) => updateItem(index, 'duration', e.target.value)} />
                  <Input label="Cantidad" type="number" min={1} value={item.quantity} onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)} />
                  <Input label="Instrucciones" placeholder="ej: Tomar con alimentos" value={item.instructions} onChange={(e) => updateItem(index, 'instructions', e.target.value)} />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
      <Card variant="elevated">
        <CardHeader><CardTitle>Observaciones</CardTitle></CardHeader>
        <CardContent>
          <TextArea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notas adicionales para la receta..." rows={3} />
        </CardContent>
      </Card>
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => navigate(-1)}>Cancelar</Button>
        <Button leftIcon={<Save className="h-4 w-4" />} onClick={handleSave} isLoading={createPrescription.isPending} disabled={!selectedPatient || items.length === 0}>Guardar Receta</Button>
      </div>
    </div>
  )
}
