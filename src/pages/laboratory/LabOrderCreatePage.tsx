import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreateLabOrder } from '@/hooks/useLabOrders'
import { usePatientSearch } from '@/hooks/usePatients'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import TextArea from '@/components/ui/TextArea'
import Button from '@/components/ui/Button'
import { ArrowLeft, Save, Plus, Trash2, TestTube } from 'lucide-react'

interface LabTest { test_name: string; test_code: string }

export default function LabOrderCreatePage() {
  const navigate = useNavigate()
  const createLabOrder = useCreateLabOrder()
  const [patientSearch, setPatientSearch] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<any>(null)
  const [medicalRecordId, setMedicalRecordId] = useState('')
  const [priority, setPriority] = useState<'routine' | 'urgent' | 'stat'>('routine')
  const [clinicalInfo, setClinicalInfo] = useState('')
  const [selectedTests, setSelectedTests] = useState<LabTest[]>([])
  const { data: searchResults } = usePatientSearch(patientSearch)

  const availableTests = [
    { test_name: 'Hemograma Completo', test_code: 'HC001' },
    { test_name: 'Glucosa', test_code: 'GL001' },
    { test_name: 'Colesterol Total', test_code: 'CT001' },
    { test_name: 'Trigliceridos', test_code: 'TG001' },
    { test_name: 'Urianalisis', test_code: 'UA001' },
    { test_name: 'Examen General de Orina', test_code: 'EGO001' },
    { test_name: 'Hepatograma', test_code: 'HP001' },
    { test_name: 'Perfil Lipidico', test_code: 'PL001' },
    { test_name: 'Hemoglobina Glicosilada', test_code: 'HG001' },
    { test_name: 'Creatinina', test_code: 'CR001' },
    { test_name: 'BUN', test_code: 'BUN001' },
    { test_name: 'Acido Urico', test_code: 'AU001' },
  ]

  const addTest = (test: LabTest) => {
    if (!selectedTests.find(t => t.test_code === test.test_code)) setSelectedTests([...selectedTests, test])
  }
  const removeTest = (testCode: string) => setSelectedTests(selectedTests.filter(t => t.test_code !== testCode))

  const handleSave = async () => {
    if (!selectedPatient || selectedTests.length === 0 || !medicalRecordId) return
    try {
      await createLabOrder.mutateAsync({
        medical_record_id: medicalRecordId, patient_id: selectedPatient.id, doctor_id: '',
        priority, clinical_reason: clinicalInfo,
        items: selectedTests.map(t => ({ test_name: t.test_name, test_code: t.test_code })),
      })
      navigate('/lab/orders')
    } catch (error) {
      console.error('Error creating lab order:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" /></Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nueva Orden de Laboratorio</h1>
          <p className="text-sm text-gray-500">Seleccione los examenes a realizar</p>
        </div>
      </div>
      <Card variant="elevated">
        <CardHeader><CardTitle>Paciente</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Input placeholder="Buscar paciente por nombre o CI..." value={patientSearch} onChange={(e) => setPatientSearch(e.target.value)} />
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
              <Button variant="ghost" size="sm" onClick={() => { setSelectedPatient(null); setMedicalRecordId('') }}>Cambiar</Button>
            </div>
          )}
          {selectedPatient && (
            <Input label="ID Historial Clinico" type="number" value={medicalRecordId} onChange={(e) => setMedicalRecordId(e.target.value)} placeholder="Ingrese el ID del historial clinico" required />
          )}
        </CardContent>
      </Card>
      <Card variant="elevated">
        <CardHeader><CardTitle>Detalles de la Orden</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Prioridad *</label>
            <div className="flex gap-3">
              {[{ value: 'routine', label: 'Rutina', color: 'bg-gray-100 border-gray-300' }, { value: 'urgent', label: 'Urgente', color: 'bg-yellow-50 border-yellow-300' }, { value: 'stat', label: 'STAT', color: 'bg-red-50 border-red-300' }].map((p) => (
                <button key={p.value} onClick={() => setPriority(p.value as any)}
                  className={`px-4 py-2 rounded-lg border-2 font-medium text-sm transition-colors ${priority === p.value ? `${p.color} border-current` : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <TextArea label="Informacion Clinica" value={clinicalInfo} onChange={(e) => setClinicalInfo(e.target.value)} placeholder="Informacion clinica relevante para los examenes..." rows={3} />
        </CardContent>
      </Card>
      <Card variant="elevated">
        <CardHeader><CardTitle className="flex items-center gap-2"><TestTube className="h-5 w-5 text-primary-600" />Examenes Disponibles</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {availableTests.map((test) => (
              <button key={test.test_code} onClick={() => addTest(test)} disabled={selectedTests.some(t => t.test_code === test.test_code)}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-left">
                <div><p className="text-sm font-medium text-gray-900">{test.test_name}</p><p className="text-xs text-gray-500">{test.test_code}</p></div>
                <Plus className="h-4 w-4 text-gray-400" />
              </button>
            ))}
          </div>
          {selectedTests.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Examenes Seleccionados</h4>
              <div className="space-y-2">
                {selectedTests.map((test) => (
                  <div key={test.test_code} className="flex items-center justify-between p-3 bg-primary-50 rounded-lg">
                    <div><span className="font-mono text-primary-700 mr-2">{test.test_code}</span><span className="text-gray-900">{test.test_name}</span></div>
                    <button onClick={() => removeTest(test.test_code)} className="text-red-500 hover:text-red-700"><Trash2 className="h-4 w-4" /></button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => navigate(-1)}>Cancelar</Button>
        <Button leftIcon={<Save className="h-4 w-4" />} onClick={handleSave} isLoading={createLabOrder.isPending} disabled={!selectedPatient || selectedTests.length === 0 || !medicalRecordId}>Crear Orden</Button>
      </div>
    </div>
  )
}
