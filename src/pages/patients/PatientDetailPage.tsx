import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { usePatient, usePatientMedicalHistory } from '@/hooks/usePatients'
import { useConsultations } from '@/hooks/useMedicalRecords'
import { usePrescriptions } from '@/hooks/usePrescriptions'
import { useLabOrders } from '@/hooks/useLabOrders'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { LoadingSpinner, PageLoadingSpinner } from '@/components/ui/LoadingSpinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatDate, calculateAge } from '@/lib/utils'
import { ArrowLeft, Edit, Printer, User, Phone, Mail, MapPin, AlertTriangle, FileText, Pill, TestTube, Shield, Calendar, Droplets } from 'lucide-react'

type Tab = 'personal' | 'history' | 'consultations' | 'prescriptions' | 'lab' | 'documents' | 'insurance' | 'allergies'

export default function PatientDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [activeTab, setActiveTab] = useState<Tab>('personal')
  const { data: patient, isLoading: patientLoading } = usePatient(id!)
  const { data: medicalHistory, isLoading: historyLoading } = usePatientMedicalHistory(id!)
  const { data: consultations } = useConsultations(id!)
  const { data: prescriptions } = usePrescriptions({ patient_id: id })
  const { data: labOrders } = useLabOrders({ patient_id: id })

  if (patientLoading) return <PageLoadingSpinner />
  if (!patient) return <EmptyState title="Paciente no encontrado" />

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'personal', label: 'Datos Personales', icon: <User className="h-4 w-4" /> },
    { key: 'history', label: 'Historial Medico', icon: <FileText className="h-4 w-4" /> },
    { key: 'consultations', label: 'Consultas', icon: <Calendar className="h-4 w-4" /> },
    { key: 'prescriptions', label: 'Recetas', icon: <Pill className="h-4 w-4" /> },
    { key: 'lab', label: 'Laboratorio', icon: <TestTube className="h-4 w-4" /> },
    { key: 'documents', label: 'Documentos', icon: <FileText className="h-4 w-4" /> },
    { key: 'insurance', label: 'Seguro', icon: <Shield className="h-4 w-4" /> },
    { key: 'allergies', label: 'Alergias', icon: <AlertTriangle className="h-4 w-4" /> },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" /></Button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
              {patient.photo_url ? (
                <img src={patient.photo_url} alt="" className="w-16 h-16 rounded-full object-cover" />
              ) : (
                <span className="text-xl font-bold text-primary-700">{patient.first_name.charAt(0)}{patient.last_name.charAt(0)}</span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{patient.first_name} {patient.last_name}</h1>
              <p className="text-sm text-gray-500">N {patient.medical_record_number} • {patient.document_type}: {patient.document_number}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" leftIcon={<Printer className="h-4 w-4" />}>Imprimir</Button>
          <Button leftIcon={<Edit className="h-4 w-4" />} onClick={() => navigate(`/patients/${id}/edit`)}>Editar</Button>
        </div>
      </div>
      <div className="border-b border-gray-200">
        <nav className="flex overflow-x-auto -mb-px gap-1">
          {tabs.map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.key ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}>{tab.icon}{tab.label}</button>
          ))}
        </nav>
      </div>
      {activeTab === 'personal' && (
        <Card variant="elevated">
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <InfoItem label="Nombre Completo" value={`${patient.first_name} ${patient.last_name}`} />
              <InfoItem label="Fecha de Nacimiento" value={`${formatDate(patient.birth_date)} (${calculateAge(patient.birth_date)} anos)`} />
              <InfoItem label="Sexo" value={patient.gender === 'M' ? 'Masculino' : patient.gender === 'F' ? 'Femenino' : 'Otro'} />
              <InfoItem label="Tipo de Sangre" value={patient.blood_type || 'No registrado'} icon={<Droplets className="h-4 w-4 text-red-500" />} />
              <InfoItem label="Telefono" value={patient.phone || 'No registrado'} icon={<Phone className="h-4 w-4 text-gray-400" />} />
              <InfoItem label="Email" value={patient.email || 'No registrado'} icon={<Mail className="h-4 w-4 text-gray-400" />} />
              <InfoItem label="Direccion" value={patient.address || 'No registrado'} icon={<MapPin className="h-4 w-4 text-gray-400" />} />
              <InfoItem label="Contacto de Emergencia" value={patient.emergency_contact_name || 'No registrado'} />
              <InfoItem label="Tel. Emergencia" value={patient.emergency_contact_phone || 'No registrado'} />
            </div>
          </CardContent>
        </Card>
      )}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {historyLoading ? <LoadingSpinner /> : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <HistoryCard title="Antecedentes Personales" content={medicalHistory?.personal} />
              <HistoryCard title="Antecedentes Familiares" content={medicalHistory?.family} />
              <HistoryCard title="Antecedentes Patologicos" content={medicalHistory?.pathological} />
              <HistoryCard title="Antecedentes Quirurgicos" content={medicalHistory?.surgical} />
              <HistoryCard title="Antecedentes Traumaticos" content={medicalHistory?.traumatic} />
              <HistoryCard title="Alergias" content={medicalHistory?.allergic} />
              <HistoryCard title="Antecedentes Farmacologicos" content={medicalHistory?.pharmacological} />
            </div>
          )}
        </div>
      )}
      {activeTab === 'consultations' && (
        <Card variant="elevated">
          <CardHeader><CardTitle>Consultas Medicas</CardTitle></CardHeader>
          <CardContent>
            {consultations?.data?.length ? (
              <div className="space-y-3">
                {consultations.data.map((c) => (
                  <div key={c.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors" onClick={() => navigate(`/clinical/consultation/${c.id}`)}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{c.chief_complaint}</p>
                        <p className="text-sm text-gray-500">N {c.consultation_number}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-900">{formatDate(c.date)}</p>
                        <StatusBadge status={c.status} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No hay consultas" description="Este paciente no tiene consultas registradas" />
            )}
          </CardContent>
        </Card>
      )}
      {activeTab === 'prescriptions' && (
        <Card variant="elevated">
          <CardHeader><CardTitle>Recetas Medicas</CardTitle></CardHeader>
          <CardContent>
            {prescriptions?.data?.length ? (
              <div className="space-y-3">
                {prescriptions.data.map((p) => (
                  <div key={p.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Receta {p.prescription_number}</p>
                        <p className="text-sm text-gray-500">{p.items.length} medicamento(s)</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-900">{formatDate(p.issued_date)}</p>
                        <StatusBadge status={p.status} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No hay recetas" description="Este paciente no tiene recetas registradas" />
            )}
          </CardContent>
        </Card>
      )}
      {activeTab === 'lab' && (
        <Card variant="elevated">
          <CardHeader><CardTitle>Ordenes de Laboratorio</CardTitle></CardHeader>
          <CardContent>
            {labOrders?.data?.length ? (
              <div className="space-y-3">
                {labOrders.data.map((order) => (
                  <div key={order.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Orden {order.order_number}</p>
                        <p className="text-sm text-gray-500">{order.items.length} examen(es)</p>
                      </div>
                      <StatusBadge status={order.status} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No hay ordenes" description="Este paciente no tiene ordenes de laboratorio" />
            )}
          </CardContent>
        </Card>
      )}
      {activeTab === 'documents' && (
        <Card variant="elevated"><CardContent><EmptyState title="No hay documentos" description="Aun no se han subido documentos para este paciente" /></CardContent></Card>
      )}
      {activeTab === 'insurance' && (
        <Card variant="elevated">
          <CardHeader><CardTitle>Informacion de Seguro</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoItem label="Proveedor" value={patient.insurance_provider || 'No registrado'} />
              <InfoItem label="Numero de Poliza" value={patient.insurance_number || 'No registrado'} />
            </div>
          </CardContent>
        </Card>
      )}
      {activeTab === 'allergies' && (
        <Card variant="elevated">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Alergias Conocidas</CardTitle>
              <Button size="sm">Agregar Alergia</Button>
            </div>
          </CardHeader>
          <CardContent>
            {patient.allergies ? (
              <p className="text-gray-700 whitespace-pre-wrap">{patient.allergies}</p>
            ) : (
              <EmptyState title="No hay alergias registradas" />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function InfoItem({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div>
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <div className="flex items-center gap-2">{icon}<p className="text-gray-900 font-medium">{value}</p></div>
    </div>
  )
}

function HistoryCard({ title, content }: { title: string; content?: string }) {
  return (
    <Card variant="bordered">
      <CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader>
      <CardContent><p className="text-sm text-gray-700 whitespace-pre-wrap">{content || 'No registrado'}</p></CardContent>
    </Card>
  )
}
