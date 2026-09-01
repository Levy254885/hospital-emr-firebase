import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { DatePicker } from '@/components/ui/DatePicker'
import { Plus, Scissors, Clock } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default function SurgerySchedulePage() {
  const navigate = useNavigate()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Surgery calendar</h1>
          <p className="text-sm text-gray-500">View and schedule surgical procedures</p>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/surgery/create')}>
          Schedule surgery
        </Button>
      </div>

      <Card variant="elevated">
        <CardContent className="p-4">
          <DatePicker label="Date" value={selectedDate} onChange={(d) => setSelectedDate(d)} />
        </CardContent>
      </Card>

      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scissors className="h-5 w-5 text-primary-600" />
            Scheduled surgeries - {formatDate(selectedDate.toISOString())}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No surgeries scheduled for this date</p>
            <Button
              className="mt-4"
              variant="outline"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => navigate('/surgery/create')}
            >
              Schedule surgery
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
