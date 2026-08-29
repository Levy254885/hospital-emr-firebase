import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePatientSearch } from '@/hooks/usePatients'
import { useMedications } from '@/hooks/useMedications'
import { useDispensePrescription } from '@/hooks/usePrescriptions'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ArrowLeft, Save, Pill, CheckCircle } from 'lucide-react'

export default function DispensationPage() {
  const navigate = useNavigate()
  const [patientSearch, setPatientSearch] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<any>(null)
  const [prescriptionId, setPrescriptionId] = useState('')
  const [dispensedItems, setDispensedItems] = useState<string[]>([])
  const { data: searchResults } = usePatientSearch(patientSearch)
  const handleDispense = () => { console.log('Dispensing prescription:', prescriptionId); navigate('/pharmacy/medications') }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" /></Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Despacho de Medicamentos</h1>
          <p className="text-sm text-gray-500">Dispensar medicamentos segun receta medica</p>
        </div>
      </div>
      <Card variant="elevated">
        <CardHeader><CardTitle>Paciente</CardTitle></CardHeader>
        <CardContent>
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
              <Button variant="ghost" size="sm" onClick={() => setSelectedPatient(null)}>Cambiar</Button>
            </div>
          )}
        </CardContent>
      </Card>
      <Card variant="elevated">
        <CardHeader><CardTitle className="flex items-center gap-2"><Pill className="h-5 w-5 text-primary-600" />Medicamentos a Despachar</CardTitle></CardHeader>
        <CardContent><p className="text-sm text-gray-500 text-center py-8">Seleccione un paciente para ver sus recetas pendientes</p></CardContent>
      </Card>
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => navigate(-1)}>Cancelar</Button>
        <Button leftIcon={<CheckCircle className="h-4 w-4" />} onClick={handleDispense} disabled={!selectedPatient}>Confirmar Despacho</Button>
      </div>
    </div>
  )
}
