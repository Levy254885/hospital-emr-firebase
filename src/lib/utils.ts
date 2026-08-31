import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, parseISO, differenceInYears } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'dd MMM yyyy')
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'dd MMM yyyy HH:mm')
}

export function formatTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'HH:mm')
}

export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return formatDistanceToNow(d, { addSuffix: true })
}

/** Kenyan Shillings */
export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) return 'KSh 0.00'
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 2,
  }).format(Number(amount))
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-KE').format(num)
}

export function calculateAge(birthDate: string | Date): number {
  const d = typeof birthDate === 'string' ? parseISO(birthDate) : birthDate
  return differenceInYears(new Date(), d)
}

export function getInitials(first?: string, last?: string): string {
  const a = (first || '').trim().charAt(0)
  const b = (last || '').trim().charAt(0)
  return (a + b).toUpperCase() || '?'
}

/** BMI / IMC (kg/m²). weight in kg, height in cm. */
export function calculateIMC(weightKg: number, heightCm: number): number {
  if (!weightKg || !heightCm || heightCm <= 0 || weightKg <= 0) return 0
  const heightM = heightCm / 100
  const bmi = weightKg / (heightM * heightM)
  return Math.round(bmi * 10) / 10
}

export function getIMCCategory(imc: number): string {
  if (!imc || imc <= 0) return '—'
  if (imc < 18.5) return 'Underweight'
  if (imc < 25) return 'Normal'
  if (imc < 30) return 'Overweight'
  if (imc < 35) return 'Obesity class I'
  if (imc < 40) return 'Obesity class II'
  return 'Obesity class III'
}

export function getIMCColor(imc: number): string {
  if (!imc || imc <= 0) return 'text-gray-500'
  if (imc < 18.5) return 'text-blue-600'
  if (imc < 25) return 'text-green-600'
  if (imc < 30) return 'text-yellow-600'
  return 'text-red-600'
}
