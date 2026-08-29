import { useState } from 'react'
import { usePatientSearch } from '@/hooks/usePatients'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import TextArea from '@/components/ui/TextArea'
import Button from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { User, Clock, Activity, Save } from 'lucide-react'

interface TriageEntry {
  id: string
  patient_name: string
  arrival_time: string
  chief_complaint: string
  triage_level: 1 | 2 | 3 | 4 | 5
  status: string
}

const triageColors: Record<number, { bg: string; text: string; label: string }> = {
  1: { bg: 'bg-red-600', text: 'text-white', label: 'I - Resucitacion' },
  2: { bg: 'bg-red-500', text: 'text-white', label: 'II - Emergencia' },
  3: { bg: 'bg-yellow-500', text: 'text-white', label: 'III - Urgencia' },
  4: { bg: 'bg-green-500', text: 'text-white', label: 'IV - Menos Urgente' },
  5: { bg: 'bg-blue-500', text: 'text-white', label: 'V - No Urgente' },
}

export default function TriagePage() {
  const [patientSearch, setPatientSearch] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<any>(null)
  const [triageLevel, setTriageLevel] = useState<1 | 2 | 3 | 4 | 5>(3)
  const [chiefComplaint, setChiefComplaint] = useState('')
  const [notes, setNotes] = useState('')
  const { data: searchResults } = usePatientSearch(patientSearch)
  const [queue] = useState<TriageEntry[]>([
    { id: '1', patient_name: 'Maria Garcia', arrival_time: '14:30', chief_complaint: 'Dolor abdominal intenso', triage_level: 2, status: 'waiting' },
    { id: '2', patient_name: 'Carlos Lopez', arrival_time: '14:45', chief_complaint: 'Fiebre y tos', triage_level: 3, status: 'in_treatment' },
    { id: '3', patient_name: 'Ana Martinez', arrival_time: '15:00', chief_complaint: 'Herida en brazo', triage_level: 4, status: 'waiting' },
  ])

  const handleSave = () => {
    console.log('Saving triage:', { selectedPatient, triageLevel, chiefComplaint, notes })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Triage - Emergencias</h1>
          <p className="text-sm text-gray-500">Registro y clasificacion de pacientes</p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card variant="elevated">
            <CardHeader><CardTitle className="flex items-center gap-2"><User className="h-5 w-5 text-primary-600" />Registro de Paciente</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Input label="Buscar Paciente" placeholder="Nombre o CI del paciente..." value={patientSearch} onChange={(e) => setPatientSearch(e.target.value)} />
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nivel de Triage *</label>
                <div className="grid grid-cols-5 gap-2">
                  {([1, 2, 3, 4, 5] as const).map((level) => (
                    <button key={level} onClick={() => setTriageLevel(level)}
                      className={`p-3 rounded-lg text-center font-medium transition-all ${
                        triageLevel === level ? `${triageColors[level].bg} ${triageColors[level].text} ring-2 ring-offset-2 ring-gray-400` : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}>
                      <p className="text-lg font-bold">{level}</p>
                      <p className="text-xs">{triageColors[level].label.split(' - ')[1]}</p>
                    </button>
                  ))}
                </div>
              </div>
              <TextArea label="Motivo de Consulta" required value={chiefComplaint} onChange={(e) => setChiefComplaint(e.target.value)} placeholder="Describa el motivo principal de consulta..." rows={3} />
              <TextArea label="Notas Adicionales" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Observaciones del triage..." rows={2} />
              <Button leftIcon={<Save className="h-4 w-4" />} onClick={handleSave} className="w-full">Registrar en Triage</Button>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card variant="elevated">
            <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5 text-primary-600" />Cola de Espera</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {queue.map((entry) => (
                  <div key={entry.id} className={`p-3 rounded-lg border-l-4 ${
                    entry.triage_level === 1 ? 'border-red-600 bg-red-50' :
                    entry.triage_level === 2 ? 'border-red-500 bg-red-50' :
                    entry.triage_level === 3 ? 'border-yellow-500 bg-yellow-50' :
                    entry.triage_level === 4 ? 'border-green-500 bg-green-50' : 'border-blue-500 bg-blue-50'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-gray-900">{entry.patient_name}</p>
                      <Badge variant={entry.triage_level <= 2 ? 'danger' : entry.triage_level === 3 ? 'warning' : entry.triage_level === 4 ? 'success' : 'info'}>Nivel {entry.triage_level}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">{entry.chief_complaint}</p>
                    <p className="text-xs text-gray-500 mt-1">Llegada: {entry.arrival_time}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card variant="elevated">
            <CardHeader><CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5 text-primary-600" />Resumen</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between"><span className="text-sm text-gray-500">En espera</span><span className="font-medium">2</span></div>
              <div className="flex justify-between"><span className="text-sm text-gray-500">En tratamiento</span><span className="font-medium">1</span></div>
              <div className="flex justify-between"><span className="text-sm text-gray-500">Atendidos hoy</span><span className="font-medium">12</span></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
