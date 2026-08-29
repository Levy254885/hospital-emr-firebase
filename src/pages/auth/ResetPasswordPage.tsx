import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { resetPasswordSchema, type ResetPasswordFormData } from '@/validations'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { Stethoscope, Lock, Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react'
import api from '@/lib/api'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token: token || '' },
  })

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      setError(null)
      await api.post('/auth/reset-password', data)
      setIsSubmitted(true)
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } }
      setError(axiosError.response?.data?.message || 'Error al restablecer la contrasena. Intenta nuevamente.')
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="relative sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-xl sm:rounded-xl sm:px-10 border border-gray-100 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Token no valido</h3>
            <p className="text-sm text-gray-500 mb-6">El enlace de recuperacion de contrasena no es valido o ha expirado.</p>
            <Link to="/forgot-password" className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700">
              <ArrowLeft className="h-4 w-4" />Solicitar nuevo enlace
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-100 rounded-full opacity-50 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-100 rounded-full opacity-50 blur-3xl" />
      </div>
      <div className="relative sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl flex items-center justify-center shadow-lg">
            <Stethoscope className="h-8 w-8 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">Restablecer Contrasena</h2>
        <p className="mt-2 text-center text-sm text-gray-600">Ingresa tu nueva contrasena</p>
      </div>
      <div className="relative mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-xl sm:px-10 border border-gray-100">
          {isSubmitted ? (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Contrasena Restablecida</h3>
              <p className="text-sm text-gray-500 mb-6">Tu contrasena ha sido actualizada exitosamente. Ya puedes iniciar sesion con tu nueva contrasena.</p>
              <Link to="/login" className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700">
                <ArrowLeft className="h-4 w-4" />Ir al inicio de sesion
              </Link>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {error && (<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>)}
              <input type="hidden" {...register('token')} />
              <div className="relative">
                <Input label="Nueva contrasena" type={showPassword ? 'text' : 'password'} placeholder="••••••••" leftIcon={<Lock className="h-4 w-4" />} error={errors.password?.message} {...register('password')} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div className="relative">
                <Input label="Confirmar contrasena" type={showConfirmPassword ? 'text' : 'password'} placeholder="••••••••" leftIcon={<Lock className="h-4 w-4" />} error={errors.password_confirmation?.message} {...register('password_confirmation')} />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600">
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>Restablecer Contrasena</Button>
              <div className="text-center">
                <Link to="/login" className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900">
                  <ArrowLeft className="h-4 w-4" />Volver al inicio de sesion
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
