import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/hooks/useAuth'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { Stethoscope, Mail, Lock, Eye, EyeOff } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
  remember_me: z.boolean().optional(),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { remember_me: false },
  })

  const onSubmit = async (data: LoginFormData) => {
    setError(null)
    try {
      await login(data.email, data.password)
    } catch (err: unknown) {
      const anyErr = err as { code?: string; message?: string }
      let message = 'Login failed. Check your credentials.'
      if (
        anyErr?.code === 'auth/invalid-credential' ||
        anyErr?.code === 'auth/wrong-password' ||
        anyErr?.code === 'auth/user-not-found' ||
        anyErr?.code === 'auth/invalid-email'
      ) {
        message = 'Incorrect email or password.'
      } else if (anyErr?.code === 'auth/too-many-requests') {
        message = 'Too many attempts. Try again later.'
      } else if (anyErr?.code === 'auth/network-request-failed') {
        message = 'Network error. Check your connection.'
      } else if (anyErr?.message?.includes('profile') || anyErr?.message?.includes('deactivated')) {
        message = anyErr.message
      } else if (anyErr?.message) {
        message = anyErr.message
      }
      setError(message)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl flex items-center justify-center shadow-lg">
            <Stethoscope className="h-8 w-8 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">Hospital EMR</h2>
        <p className="mt-2 text-center text-sm text-gray-600">Electronic Medical Records System</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-xl sm:px-10 border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
            {error ? (
              <div role="alert" className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            ) : null}

            <Input
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="you@hospital.com"
              leftIcon={<Mail className="h-4 w-4" />}
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              leftIcon={<Lock className="h-4 w-4" />}
              rightIcon={
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
              error={errors.password?.message}
              {...register('password')}
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  {...register('remember_me')}
                />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm font-medium text-primary-600 hover:text-primary-700">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>
              Sign In
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
