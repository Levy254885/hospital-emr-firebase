import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { User, FileText, Pill, TestTube, Download, Calendar, Plus } from 'lucide-react'

type PortalTab = 'overview' | 'history' | 'prescriptions' | 'lab' | 'certificates' | 'appointments'

export default function PatientPortalPage() {
  const [activeTab, setActiveTab] = useState<PortalTab>('overview')
  const tabs: { key: PortalTab; label: string; icon: React.ReactNode }[] = [
    { key: 'overview', label: 'Resumen', icon: <User className="h-4 w-4" /> },
    { key: 'history', label: 'Historial', icon: <FileText className="h-4 w-4" /> },
    { key: 'prescriptions', label: 'Recetas', icon: <Pill className="h-4 w-4" /> },
    { key: 'lab', label: 'Laboratorio', icon: <TestTube className="h-4 w-4" /> },
    { key: 'certificates', label: 'Certificados', icon: <FileText className="h-4 w-4" /> },
    { key: 'appointments', label: 'Citas', icon: <Calendar className="h-4 w-4" /> },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Portal del Paciente</h1>
        <p className="text-sm text-gray-500">Acceda a su informacion medica</p>
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
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card variant="elevated"><CardContent className="py-6 text-center"><FileText className="h-8 w-8 text-primary-600 mx-auto mb-3" /><p className="text-2xl font-bold text-gray-900">3</p><p className="text-sm text-gray-500">Consultas</p></CardContent></Card>
          <Card variant="elevated"><CardContent className="py-6 text-center"><Pill className="h-8 w-8 text-green-600 mx-auto mb-3" /><p className="text-2xl font-bold text-gray-900">5</p><p className="text-sm text-gray-500">Recetas Activas</p></CardContent></Card>
          <Card variant="elevated"><CardContent className="py-6 text-center"><TestTube className="h-8 w-8 text-blue-600 mx-auto mb-3" /><p className="text-2xl font-bold text-gray-900">2</p><p className="text-sm text-gray-500">Resultados Pendientes</p></CardContent></Card>
          <Card variant="elevated"><CardContent className="py-6 text-center"><Calendar className="h-8 w-8 text-yellow-600 mx-auto mb-3" /><p className="text-2xl font-bold text-gray-900">1</p><p className="text-sm text-gray-500">Proxima Cita</p></CardContent></Card>
        </div>
      )}
      {activeTab === 'history' && (<Card variant="elevated"><CardHeader><CardTitle>Historial Medico</CardTitle></CardHeader><CardContent><EmptyState title="Historial medico" description="Sus consultas y evoluciones medicas apareceran aqui" icon={<FileText className="h-8 w-8 text-gray-400" />} /></CardContent></Card>)}
      {activeTab === 'prescriptions' && (<Card variant="elevated"><CardHeader><div className="flex items-center justify-between"><CardTitle>Mis Recetas</CardTitle><Button variant="outline" size="sm" leftIcon={<Download className="h-4 w-4" />}>Descargar</Button></div></CardHeader><CardContent><EmptyState title="No hay recetas" description="Sus recetas medicas apareceran aqui" icon={<Pill className="h-8 w-8 text-gray-400" />} /></CardContent></Card>)}
      {activeTab === 'lab' && (<Card variant="elevated"><CardHeader><div className="flex items-center justify-between"><CardTitle>Resultados de Laboratorio</CardTitle><Button variant="outline" size="sm" leftIcon={<Download className="h-4 w-4" />}>Descargar</Button></div></CardHeader><CardContent><EmptyState title="No hay resultados" description="Sus resultados de laboratorio apareceran aqui" icon={<TestTube className="h-8 w-8 text-gray-400" />} /></CardContent></Card>)}
      {activeTab === 'certificates' && (<Card variant="elevated"><CardHeader><CardTitle>Certificados Medicos</CardTitle></CardHeader><CardContent><EmptyState title="No hay certificados" description="Sus certificados medicos apareceran aqui" icon={<FileText className="h-8 w-8 text-gray-400" />} /></CardContent></Card>)}
      {activeTab === 'appointments' && (
        <div className="space-y-4">
          <div className="flex justify-end"><Button leftIcon={<Plus className="h-4 w-4" />}>Agendar Cita</Button></div>
          <Card variant="elevated"><CardHeader><CardTitle>Mis Citas</CardTitle></CardHeader><CardContent><EmptyState title="No hay citas programadas" description="Agende una consulta medica" icon={<Calendar className="h-8 w-8 text-gray-400" />} action={<Button leftIcon={<Plus className="h-4 w-4" />}>Agendar Cita</Button>} /></CardContent></Card>
        </div>
      )}
    </div>
  )
}
