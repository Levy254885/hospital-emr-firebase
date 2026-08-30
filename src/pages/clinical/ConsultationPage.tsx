import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useConsultation, useCreateSoapNote, useCreateVitalSigns, useCreateDiagnosis, useSearchCie10 } from '@/hooks/useMedicalRecords'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import TextArea from '@/components/ui/TextArea'
import Button from '@/components/ui/Button'
import { PageLoadingSpinner } from '@/components/ui/LoadingSpinner'
import { calculateIMC, getIMCCategory, getIMCColor } from '@/lib/utils'
import { ArrowLeft, Save, Activity, Stethoscope, FileText, Heart, Thermometer } from 'lucide-react'

interface VitalSigns {
  weight: string; height: string; temperature: string
  blood_pressure_systolic: string; blood_pressure_diastolic: string
  heart_rate: string; respiratory_rate: string; oxygen_saturation: string; glycemia: string
}
interface SoapData { subjective: string; objective: string; assessment: string; plan: string }

export default function ConsultationPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { data: consultation, isLoading } = useConsultation(id!)
  const createSoapNote = useCreateSoapNote()
  const createVitalSigns = useCreateVitalSigns()
  const createDiagnosis = useCreateDiagnosis()
  const [vitalSigns, setVitalSigns] = useState<VitalSigns>({
    weight: '', height: '', temperature: '', blood_pressure_systolic: '', blood_pressure_diastolic: '',
    heart_rate: '', respiratory_rate: '', oxygen_saturation: '', glycemia: '',
  })
  const [soap, setSoap] = useState<SoapData>({ subjective: '', objective: '', assessment: '', plan: '' })
  const [chiefComplaint, setChiefComplaint] = useState('')
  const [presentIllness, setPresentIllness] = useState('')
  const [diagnoses, setDiagnoses] = useState<{ code: string; name: string; type: string }[]>([])
  const [searchDiagnosis, setSearchDiagnosis] = useState('')
  const { data: cie10Results } = useSearchCie10(searchDiagnosis)
  const imc = vitalSigns.weight && vitalSigns.height
    ? calculateIMC(parseFloat(vitalSigns.weight), parseFloat(vitalSigns.height)) : null

  const handleSaveAll = async () => {
    if (!id || !consultation) return
    const medicalRecordId = consultation.medical_record_id
    try {
      if (soap.subjective || soap.objective || soap.assessment || soap.plan) {
        await createSoapNote.mutateAsync({
          medical_record_id: medicalRecordId,
          subjective: soap.subjective, objective: soap.objective,
          assessment: soap.assessment, plan: soap.plan,
        })
      }
      if (vitalSigns.weight || vitalSigns.temperature || vitalSigns.heart_rate) {
        await createVitalSigns.mutateAsync({
          medical_record_id: medicalRecordId,
          weight: vitalSigns.weight ? parseFloat(vitalSigns.weight) : undefined,
          height: vitalSigns.height ? parseFloat(vitalSigns.height) : undefined,
          temperature: vitalSigns.temperature ? parseFloat(vitalSigns.temperature) : undefined,
          blood_pressure_systolic: vitalSigns.blood_pressure_systolic ? parseInt(vitalSigns.blood_pressure_systolic) : undefined,
          blood_pressure_diastolic: vitalSigns.blood_pressure_diastolic ? parseInt(vitalSigns.blood_pressure_diastolic) : undefined,
          heart_rate: vitalSigns.heart_rate ? parseInt(vitalSigns.heart_rate) : undefined,
          respiratory_rate: vitalSigns.respiratory_rate ? parseInt(vitalSigns.respiratory_rate) : undefined,
          oxygen_saturation: vitalSigns.oxygen_saturation ? parseFloat(vitalSigns.oxygen_saturation) : undefined,
        })
      }
      for (const d of diagnoses) {
        await createDiagnosis.mutateAsync({
          medical_record_id: medicalRecordId,
          cie10_code: d.code, description: d.name, type: d.type as any,
        })
      }
      navigate(-1)
    } catch (e) {
      console.error('Error saving consultation:', e)
    }
  }

  if (isLoading) return <PageLoadingSpinner />

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" /></Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Consulta Medica</h1>
          <p className="text-sm text-gray-500">Registro clinico SOAP y signos vitales</p>
        </div>
        <Button leftIcon={<Save className="h-4 w-4" />} onClick={handleSaveAll} isLoading={createSoapNote.isPending || createVitalSigns.isPending}>Guardar Todo</Button>
      </div>

      <Card variant="elevated">
        <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary-600" />Motivo de Consulta</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <TextArea label="Motivo Principal" value={chiefComplaint} onChange={(e) => setChiefComplaint(e.target.value)} rows={2} placeholder="Motivo principal de la consulta..." />
          <TextArea label="Enfermedad Actual" value={presentIllness} onChange={(e) => setPresentIllness(e.target.value)} rows={3} placeholder="Descripcion de la enfermedad actual..." />
        </CardContent>
      </Card>

      <Card variant="elevated">
        <CardHeader><CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5 text-primary-600" />Signos Vitales</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <Input label="Peso (kg)" type="number" value={vitalSigns.weight} onChange={(e) => setVitalSigns({ ...vitalSigns, weight: e.target.value })} />
            <Input label="Talla (cm)" type="number" value={vitalSigns.height} onChange={(e) => setVitalSigns({ ...vitalSigns, height: e.target.value })} />
            <Input label="Temp (°C)" type="number" step="0.1" value={vitalSigns.temperature} onChange={(e) => setVitalSigns({ ...vitalSigns, temperature: e.target.value })} />
            <Input label="FC (lpm)" type="number" value={vitalSigns.heart_rate} onChange={(e) => setVitalSigns({ ...vitalSigns, heart_rate: e.target.value })} />
            <Input label="FR (rpm)" type="number" value={vitalSigns.respiratory_rate} onChange={(e) => setVitalSigns({ ...vitalSigns, respiratory_rate: e.target.value })} />
            <Input label="PAS" type="number" value={vitalSigns.blood_pressure_systolic} onChange={(e) => setVitalSigns({ ...vitalSigns, blood_pressure_systolic: e.target.value })} />
            <Input label="PAD" type="number" value={vitalSigns.blood_pressure_diastolic} onChange={(e) => setVitalSigns({ ...vitalSigns, blood_pressure_diastolic: e.target.value })} />
            <Input label="SpO2 (%)" type="number" value={vitalSigns.oxygen_saturation} onChange={(e) => setVitalSigns({ ...vitalSigns, oxygen_saturation: e.target.value })} />
            <Input label="Glicemia" type="number" value={vitalSigns.glycemia} onChange={(e) => setVitalSigns({ ...vitalSigns, glycemia: e.target.value })} />
          </div>
          {imc !== null && (
            <div className="mt-4 p-3 rounded-lg bg-gray-50">
              <p className="text-sm">IMC: <span className={`font-bold ${getIMCColor(imc)}`}>{imc.toFixed(1)}</span> — {getIMCCategory(imc)}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card variant="elevated">
        <CardHeader><CardTitle className="flex items-center gap-2"><Stethoscope className="h-5 w-5 text-primary-600" />Nota SOAP</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <TextArea label="S - Subjetivo" value={soap.subjective} onChange={(e) => setSoap({ ...soap, subjective: e.target.value })} rows={3} placeholder="Lo que refiere el paciente..." />
          <TextArea label="O - Objetivo" value={soap.objective} onChange={(e) => setSoap({ ...soap, objective: e.target.value })} rows={3} placeholder="Hallazgos del examen fisico..." />
          <TextArea label="A - Evaluacion" value={soap.assessment} onChange={(e) => setSoap({ ...soap, assessment: e.target.value })} rows={3} placeholder="Diagnostico e impresion clinica..." />
          <TextArea label="P - Plan" value={soap.plan} onChange={(e) => setSoap({ ...soap, plan: e.target.value })} rows={3} placeholder="Plan de tratamiento..." />
        </CardContent>
      </Card>

      <Card variant="elevated">
        <CardHeader><CardTitle className="flex items-center gap-2"><Heart className="h-5 w-5 text-primary-600" />Diagnosticos CIE-10</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Input label="Buscar diagnostico" value={searchDiagnosis} onChange={(e) => setSearchDiagnosis(e.target.value)} placeholder="Codigo o nombre CIE-10..." />
            {cie10Results && cie10Results.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-auto">
                {cie10Results.map((item: any) => (
                  <button key={item.code} type="button"
                    onClick={() => {
                      setDiagnoses([...diagnoses, { code: item.code, name: item.name, type: 'principal' }])
                      setSearchDiagnosis('')
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 border-b last:border-0">
                    <span className="font-mono text-primary-700 mr-2">{item.code}</span>{item.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          {diagnoses.length > 0 && (
            <div className="space-y-2">
              {diagnoses.map((d, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-primary-50 rounded-lg">
                  <span><span className="font-mono text-primary-700 mr-2">{d.code}</span>{d.name}</span>
                  <button type="button" className="text-red-500 text-sm" onClick={() => setDiagnoses(diagnoses.filter((_, idx) => idx !== i))}>Quitar</button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => navigate(-1)}>Cancelar</Button>
        <Button leftIcon={<Save className="h-4 w-4" />} onClick={handleSaveAll} isLoading={createSoapNote.isPending || createVitalSigns.isPending}>Guardar Consulta</Button>
      </div>
    </div>
  )
}
