import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppointments } from '@/hooks/useAppointments'
import Button from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { formatDate } from '@/lib/utils'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'

type ViewMode = 'day' | 'week' | 'month'

export default function AppointmentCalendarPage() {
  const navigate = useNavigate()
  const [viewMode, setViewMode] = useState<ViewMode>('week')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [doctorFilter, setDoctorFilter] = useState('')
  const dateStr = currentDate.toISOString().split('T')[0]
  const { data: appointments } = useAppointments({
    date: viewMode === 'day' ? dateStr : undefined,
    doctor_id: doctorFilter || undefined,
    per_page: 100,
  })
  const statusColors: Record<string, string> = {
    scheduled: 'bg-blue-100 border-blue-300',
    confirmed: 'bg-green-100 border-green-300',
    in_progress: 'bg-yellow-100 border-yellow-300',
    completed: 'bg-gray-100 border-gray-300',
    cancelled: 'bg-red-100 border-red-300',
    no_show: 'bg-red-50 border-red-200',
  }
  const hours = Array.from({ length: 12 }, (_, i) => i + 7)
  const getAppointmentsForHour = (hour: number) =>
    (appointments?.data || []).filter((apt) => parseInt(apt.start_time.split(':')[0]) === hour)
  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (viewMode === 'day') newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1))
    else if (viewMode === 'week') newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7))
    else newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1))
    setCurrentDate(newDate)
  }
  const weekDays = useMemo(() => {
    const start = new Date(currentDate)
    start.setDate(start.getDate() - start.getDay() + 1)
    return Array.from({ length: 7 }, (_, i) => { const d = new Date(start); d.setDate(d.getDate() + i); return d })
  }, [currentDate])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendario de Citas</h1>
          <p className="text-sm text-gray-500">Gestion y visualizacion de citas medicas</p>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/appointments/create')}>Nueva Cita</Button>
      </div>
      <Card variant="elevated">
        <CardContent className="py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigateDate('prev')}><ChevronLeft className="h-4 w-4" /></Button>
              <span className="font-medium text-gray-900 min-w-[200px] text-center">
                {viewMode === 'day' && formatDate(currentDate)}
                {viewMode === 'week' && `Semana del ${formatDate(weekDays[0])}`}
                {viewMode === 'month' && currentDate.toLocaleDateString('es', { month: 'long', year: 'numeric' })}
              </span>
              <Button variant="ghost" size="sm" onClick={() => navigateDate('next')}><ChevronRight className="h-4 w-4" /></Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>Hoy</Button>
            </div>
            <div className="flex bg-gray-100 rounded-lg p-1">
              {(['day', 'week', 'month'] as ViewMode[]).map((mode) => (
                <button key={mode} onClick={() => setViewMode(mode)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === mode ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                  {mode === 'day' ? 'Dia' : mode === 'week' ? 'Semana' : 'Mes'}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      <Card variant="elevated">
        <CardContent>
          {viewMode === 'day' && (
            <div className="space-y-0">
              {hours.map((hour) => (
                <div key={hour} className="flex border-b border-gray-100">
                  <div className="w-20 py-3 text-sm text-gray-500 font-medium">{String(hour).padStart(2, '0')}:00</div>
                  <div className="flex-1 py-2 min-h-[60px]">
                    {getAppointmentsForHour(hour).map((apt) => (
                      <div key={apt.id} className={`p-2 rounded-lg border-l-4 mb-1 cursor-pointer hover:shadow-sm transition-shadow ${statusColors[apt.status] || 'bg-gray-50'}`}
                        onClick={() => navigate(`/appointments/${apt.id}`)}>
                        <p className="text-sm font-medium text-gray-900">{apt.patient?.first_name} {apt.patient?.last_name}</p>
                        <p className="text-xs text-gray-500">{apt.start_time} - {apt.end_time} • Dr. {apt.doctor?.last_name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          {viewMode === 'week' && (
            <div className="overflow-x-auto">
              <div className="grid grid-cols-8 gap-px bg-gray-200 min-w-[800px]">
                <div className="bg-gray-50 p-2 text-center text-xs font-medium text-gray-500">Hora</div>
                {weekDays.map((day) => (
                  <div key={day.toISOString()} className="bg-gray-50 p-2 text-center">
                    <p className="text-xs font-medium text-gray-500">{day.toLocaleDateString('es', { weekday: 'short' })}</p>
                    <p className={`text-lg font-bold ${day.toDateString() === new Date().toDateString() ? 'text-primary-600' : 'text-gray-900'}`}>{day.getDate()}</p>
                  </div>
                ))}
                {hours.map((hour) => (
                  <div key={hour} className="contents">
                    <div className="bg-white p-2 text-xs text-gray-500 font-medium border-b">{String(hour).padStart(2, '0')}:00</div>
                    {weekDays.map((day) => {
                      const dayStr = day.toISOString().split('T')[0]
                      const dayAppts = (appointments?.data || []).filter((a) => a.appointment_date === dayStr && parseInt(a.start_time.split(':')[0]) === hour)
                      return (
                        <div key={`${dayStr}-${hour}`} className="bg-white p-1 border-b min-h-[40px]">
                          {dayAppts.map((apt) => (
                            <div key={apt.id} className={`p-1 rounded text-xs cursor-pointer ${statusColors[apt.status] || 'bg-gray-50'}`} onClick={() => navigate(`/appointments/${apt.id}`)}>
                              <p className="font-medium truncate">{apt.patient?.last_name}</p>
                            </div>
                          ))}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}
          {viewMode === 'month' && (
            <div className="grid grid-cols-7 gap-px bg-gray-200">
              {['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'].map((day) => (
                <div key={day} className="bg-gray-50 p-2 text-center text-xs font-medium text-gray-500">{day}</div>
              ))}
              {Array.from({ length: 35 }, (_, i) => {
                const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), i - currentDate.getDay() + 2)
                const dayStr = d.toISOString().split('T')[0]
                const dayAppts = (appointments?.data || []).filter((a) => a.appointment_date === dayStr)
                const isCurrentMonth = d.getMonth() === currentDate.getMonth()
                return (
                  <div key={i} className={`bg-white p-2 min-h-[80px] ${!isCurrentMonth ? 'opacity-50' : ''}`}>
                    <p className={`text-sm font-medium mb-1 ${d.toDateString() === new Date().toDateString() ? 'text-primary-600' : 'text-gray-900'}`}>{d.getDate()}</p>
                    {dayAppts.slice(0, 3).map((apt) => (
                      <div key={apt.id} className={`text-xs p-1 rounded mb-1 cursor-pointer ${statusColors[apt.status] || 'bg-gray-50'}`} onClick={() => navigate(`/appointments/${apt.id}`)}>
                        <p className="font-medium truncate">{apt.start_time} {apt.patient?.last_name}</p>
                      </div>
                    ))}
                    {dayAppts.length > 3 && <p className="text-xs text-gray-500">+{dayAppts.length - 3} mas</p>}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
      <div className="flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-blue-200 border border-blue-300"></div><span className="text-gray-600">Programado</span></div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-green-200 border border-green-300"></div><span className="text-gray-600">Confirmado</span></div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-yellow-200 border border-yellow-300"></div><span className="text-gray-600">En Progreso</span></div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-red-200 border border-red-300"></div><span className="text-gray-600">Cancelado</span></div>
      </div>
    </div>
  )
}
