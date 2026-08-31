import { useState } from 'react'
import { format } from 'date-fns'
import { Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from '@radix-ui/react-popover'

interface DatePickerProps {
  value?: Date | string
  onChange?: (date: Date) => void
  placeholder?: string
  label?: string
  error?: string
  disabled?: boolean
  className?: string
  minDate?: Date
  maxDate?: Date
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Select date',
  label,
  error,
  disabled,
  className,
  minDate,
  maxDate,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(value ? new Date(value) : new Date())

  const selectedDate = value ? new Date(value) : null

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate()

  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay()

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i)

  const handleDateClick = (day: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    onChange?.(newDate)
    setIsOpen(false)
  }

  const isDateDisabled = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    if (minDate && date < minDate) return true
    if (maxDate && date > maxDate) return true
    return false
  }

  const isToday = (day: number) => {
    const today = new Date()
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    )
  }

  const isSelected = (day: number) => {
    if (!selectedDate) return false
    return (
      day === selectedDate.getDate() &&
      currentMonth.getMonth() === selectedDate.getMonth() &&
      currentMonth.getFullYear() === selectedDate.getFullYear()
    )
  }

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      )}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            className={cn(
              'flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-left',
              'focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
              className
            )}
          >
            <span className={selectedDate ? 'text-gray-900' : 'text-gray-400'}>
              {selectedDate ? format(selectedDate, 'dd MMM yyyy') : placeholder}
            </span>
            <Calendar className="h-4 w-4 text-gray-400" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-white rounded-lg shadow-lg border border-gray-200" align="start">
          <div className="p-3">
            <div className="flex items-center justify-between mb-2">
              <button type="button" onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm font-medium text-gray-900">
                {format(currentMonth, 'MMMM yyyy')}
              </span>
              <button type="button" onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded">
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-1">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {blanks.map((blank) => (
                <div key={`blank-${blank}`} />
              ))}
              {days.map((day) => (
                <button
                  key={day}
                  type="button"
                  disabled={isDateDisabled(day)}
                  onClick={() => handleDateClick(day)}
                  className={cn(
                    'h-8 w-8 rounded-full text-sm font-medium transition-colors',
                    isSelected(day)
                      ? 'bg-primary-600 text-white'
                      : isToday(day)
                        ? 'bg-primary-100 text-primary-700'
                        : 'hover:bg-gray-100 text-gray-900',
                    isDateDisabled(day) && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
      {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
    </div>
  )
}

function ChevronLeft({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m15 18-6-6 6-6" />
    </svg>
  )
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}
