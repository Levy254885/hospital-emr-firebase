import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePatientSearch } from '@/hooks/usePatients'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import TextArea from '@/components/ui/TextArea'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import { ArrowLeft, Save, Scissors } from 'lucide-react'

export default function SurgeryCreatePage() {
  const navigate = useNavigate()
  const [patientSearch, setPatientSearch] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<any>(null)
  const [formData, setFormData] = useState({ procedure: '', surgeon: '', date: '', time: '', duration: '', operating_room: '', notes: '' })
  const { data: searchResults } = usePatientSearch(patientSearch)
  const updateField = (field: string, value: string) => setFormData(prev => ({ ...prev, [field]: value }))
  const handleSave = () => { console.log('Saving surgery:', { selectedPatient, ...formData }); navigate('/surgery') }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" /></Button>
        <div><h1 className="text-2xl font-bold text-gray-900">Programar Cirugia</h1><p className="text-sm text-gray-500">Registrar nueva cirugia</p></div>
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
              <div><p className="font-medium text-primary-900">{selectedPatient.first_name} {selectedPatient.last_name}</p><p className="text-sm text-primary-700">CI: {selectedPatient.document_number}</p></div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedPatient(null)}>Cambiar</Button>
            </div>
          )}
        </CardContent>
      </Card>
      <Card variant="elevated">
        <CardHeader><CardTitle className="flex items-center gap-2"><Scissors className="h-5 w-5 text-primary-600" />Detalles de la Cirugia</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Procedimiento" required value={formData.procedure} onChange={(e) => updateField('procedure', e.target.value)} />
            <Input label="Cirujano Principal" required value={formData.surgeon} onChange={(e) => updateField('surgeon', e.target.value)} />
            <Input label="Fecha" type="date" required value={formData.date} onChange={(e) => updateField('date', e.target.value)} />
            <Input label="Hora de Inicio" type="time" required value={formData.time} onChange={(e) => updateField('time', e.target.value)} />
            <Input label="Duracion Estimada" placeholder="ej: 2 horas" value={formData.duration} onChange={(e) => updateField('duration', e.target.value)} />
            <Select label="Quirofano" required options={[{ value: 'OR1', label: 'Quirofano 1' }, { value: 'OR2', label: 'Quirofano 2' }, { value: 'OR3', label: 'Quirofano 3' }]} value={formData.operating_room} onChange={(e) => updateField('operating_room', e.target.value)} />
          </div>
          <TextArea label="Notas" value={formData.notes} onChange={(e) => updateField('notes', e.target.value)} rows={3} />
        </CardContent>
      </Card>
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => navigate(-1)}>Cancelar</Button>
        <Button leftIcon={<Save className="h-4 w-4" />} onClick={handleSave} disabled={!selectedPatient}>Programar Cirugia</Button>
      </div>
    </div>
  )
}
