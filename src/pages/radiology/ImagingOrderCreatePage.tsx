import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePatientSearch } from '@/hooks/usePatients'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import TextArea from '@/components/ui/TextArea'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import { ArrowLeft, Save, ScanLine } from 'lucide-react'

export default function ImagingOrderCreatePage() {
  const navigate = useNavigate()
  const [patientSearch, setPatientSearch] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<any>(null)
  const [examType, setExamType] = useState('')
  const [bodyArea, setBodyArea] = useState('')
  const [clinicalInfo, setClinicalInfo] = useState('')
  const [priority, setPriority] = useState('routine')
  const { data: searchResults } = usePatientSearch(patientSearch)
  const examTypes = ['Radiografia', 'Tomografia (TC)', 'Resonancia Magnetica (RM)', 'Ecografia', 'Mamografia', 'Densitometria', 'Fluoroscopia']
  const bodyAreas = ['Cabeza', 'Cuello', 'Torax', 'Abdomen', 'Pelvis', 'Columna Vertebral', 'Extremidad Superior', 'Extremidad Inferior', 'Articulaciones', 'Senos Paranasales']
  const handleSave = () => { console.log('Saving imaging order:', { selectedPatient, examType, bodyArea, clinicalInfo, priority }); navigate('/radiology') }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" /></Button>
        <div><h1 className="text-2xl font-bold text-gray-900">Nueva Orden de Imagenologia</h1><p className="text-sm text-gray-500">Solicitar estudio de imagen</p></div>
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
        <CardHeader><CardTitle className="flex items-center gap-2"><ScanLine className="h-5 w-5 text-primary-600" />Estudio de Imagen</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Select label="Tipo de Estudio" required options={examTypes.map(e => ({ value: e, label: e }))} value={examType} onChange={(e) => setExamType(e.target.value)} />
          <Select label="Zona Corporal" required options={bodyAreas.map(a => ({ value: a, label: a }))} value={bodyArea} onChange={(e) => setBodyArea(e.target.value)} />
          <Select label="Prioridad" options={[{ value: 'routine', label: 'Rutina' }, { value: 'urgent', label: 'Urgente' }]} value={priority} onChange={(e) => setPriority(e.target.value)} />
          <TextArea label="Informacion Clinica" value={clinicalInfo} onChange={(e) => setClinicalInfo(e.target.value)} placeholder="Indicacion clinica y hallazgos relevantes..." rows={3} />
        </CardContent>
      </Card>
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => navigate(-1)}>Cancelar</Button>
        <Button leftIcon={<Save className="h-4 w-4" />} onClick={handleSave} disabled={!selectedPatient || !examType}>Crear Orden</Button>
      </div>
    </div>
  )
}
