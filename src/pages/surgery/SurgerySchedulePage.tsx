import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { Badge, StatusBadge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'
import { Plus, Calendar, Clock, User, Scissors } from 'lucide-react'

interface Surgery {
  id: string
  patient_name: string
  procedure: string
  surgeon: string
  date: string
  time: string
  operating_room: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
}

export default function SurgerySchedulePage() {
  const navigate = useNavigate()
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  const surgeries: Surgery[] = []

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendario de Cirugias</h1>
          <p className="text-sm text-gray-500">Programacion de cirugias</p>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/surgery/create')}>
          Programar Cirugia
        </Button>
      </div>

      <Card variant="elevated">
        <CardContent className="py-3">
          <div className="flex items-center gap-4">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="block rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
            <Button variant="outline" size="sm">Hoy</Button>
          </div>
        </CardContent>
      </Card>

      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary-600" />
            Cirugias Programadas - {formatDate(selectedDate)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {surgeries.length === 0 ? (
            <div className="text-center py-12">
              <Scissors className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No hay cirugias programadas para esta fecha</p>
              <Button className="mt-4" onClick={() => navigate('/surgery/create')}>
                Programar Cirugia
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {surgeries.map((surgery) => (
                <div key={surgery.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{surgery.procedure}</p>
                      <p className="text-sm text-gray-500">
                        {surgery.patient_name} • Dr. {surgery.surgeon}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{surgery.time}</span>
                      </div>
                      <StatusBadge status={surgery.status} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
