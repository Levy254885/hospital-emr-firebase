import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBedMap, useBuildings } from '@/hooks/useHospitalization'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { PageLoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Bed } from 'lucide-react'

export default function BedMapPage() {
  const navigate = useNavigate()
  const [selectedBuilding, setSelectedBuilding] = useState('')
  const [selectedFloor, setSelectedFloor] = useState('')
  const [selectedBed, setSelectedBed] = useState<any>(null)
  const { data: bedMap, isLoading } = useBedMap()
  const { data: buildings } = useBuildings()

  if (isLoading) return <PageLoadingSpinner />

  const bedStatusColors: Record<string, string> = {
    available: 'bg-green-100 border-green-400 hover:bg-green-200',
    occupied: 'bg-red-100 border-red-400',
    reserved: 'bg-yellow-100 border-yellow-400',
    maintenance: 'bg-gray-200 border-gray-400',
  }
  const bedStatusIcons: Record<string, string> = { available: '✓', occupied: '●', reserved: '◉', maintenance: '⚙' }
  const stats = { total: 50, available: 18, occupied: 25, reserved: 4, maintenance: 3 }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mapa de Camas</h1>
          <p className="text-sm text-gray-500">Visualizacion del estado de camas del hospital</p>
        </div>
        <Button onClick={() => navigate('/hospitalization/list')}>Ver Hospitalizados</Button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <Card variant="elevated" className="text-center"><CardContent className="py-4"><p className="text-2xl font-bold text-gray-900">{stats.total}</p><p className="text-sm text-gray-500">Total</p></CardContent></Card>
        <Card variant="elevated" className="text-center"><CardContent className="py-4"><p className="text-2xl font-bold text-green-600">{stats.available}</p><p className="text-sm text-gray-500">Disponibles</p></CardContent></Card>
        <Card variant="elevated" className="text-center"><CardContent className="py-4"><p className="text-2xl font-bold text-red-600">{stats.occupied}</p><p className="text-sm text-gray-500">Ocupadas</p></CardContent></Card>
        <Card variant="elevated" className="text-center"><CardContent className="py-4"><p className="text-2xl font-bold text-yellow-600">{stats.reserved}</p><p className="text-sm text-gray-500">Reservadas</p></CardContent></Card>
        <Card variant="elevated" className="text-center"><CardContent className="py-4"><p className="text-2xl font-bold text-gray-500">{stats.maintenance}</p><p className="text-sm text-gray-500">Mantenimiento</p></CardContent></Card>
      </div>
      <Card variant="elevated">
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-3">
            <select value={selectedBuilding} onChange={(e) => setSelectedBuilding(e.target.value)} className="block w-full sm:w-48 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20">
              <option value="">Todos los edificios</option>
              <option value="main">Edificio Principal</option>
              <option value="annex">Anexo</option>
            </select>
            <select value={selectedFloor} onChange={(e) => setSelectedFloor(e.target.value)} className="block w-full sm:w-36 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20">
              <option value="">Todos los pisos</option>
              <option value="1">Piso 1</option>
              <option value="2">Piso 2</option>
              <option value="3">Piso 3</option>
            </select>
          </div>
        </CardHeader>
      </Card>
      <Card variant="elevated">
        <CardHeader><CardTitle className="flex items-center gap-2"><Bed className="h-5 w-5 text-primary-600" />Planta - Piso 1</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
            {Array.from({ length: 30 }, (_, i) => {
              const statuses = ['available', 'occupied', 'reserved', 'maintenance']
              const status = statuses[i % 4]
              return (
                <div key={i} onClick={() => setSelectedBed({ number: `${i + 101}`, status })}
                  className={`aspect-square rounded-lg border-2 flex flex-col items-center justify-center cursor-pointer transition-all ${bedStatusColors[status]}`}>
                  <span className="text-lg font-bold">{i + 101}</span>
                  <span className="text-xs">{bedStatusIcons[status]}</span>
                </div>
              )
            })}
          </div>
          <div className="flex flex-wrap gap-4 mt-6 text-xs">
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-green-100 border-2 border-green-400"></div><span>Disponible</span></div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-red-100 border-2 border-red-400"></div><span>Ocupada</span></div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-yellow-100 border-2 border-yellow-400"></div><span>Reservada</span></div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-gray-200 border-2 border-gray-400"></div><span>Mantenimiento</span></div>
          </div>
        </CardContent>
      </Card>
      {selectedBed && (
        <Card variant="elevated">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Cama {selectedBed.number}</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setSelectedBed(null)}>×</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Badge variant={selectedBed.status === 'available' ? 'success' : selectedBed.status === 'occupied' ? 'danger' : selectedBed.status === 'reserved' ? 'warning' : 'default'}>
                {selectedBed.status === 'available' ? 'Disponible' : selectedBed.status === 'occupied' ? 'Ocupada' : selectedBed.status === 'reserved' ? 'Reservada' : 'Mantenimiento'}
              </Badge>
              {selectedBed.status === 'available' && <Button size="sm" onClick={() => navigate('/hospitalization/list')}>Hospitalizar Paciente</Button>}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
