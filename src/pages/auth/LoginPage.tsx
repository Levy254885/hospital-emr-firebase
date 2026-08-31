import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/hooks/useAuth'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { Mail, Lock } from 'lucide-react'
import { CLINIC } from '@/lib/clinic'

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
})
type LoginFormData = z.infer<typeof schema>

export default function LoginPage() {
  const { login } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({ resolver: zodResolver(schema) })

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
      } else if (anyErr?.message) {
        message = anyErr.message
      }
      setError(message)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-emerald-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <img
            src="/icons/elikin-logo.svg"
            alt={CLINIC.name}
            className="w-20 h-20 object-contain drop-shadow-md"
          />
        </div>
        <h2 className="mt-4 text-center text-3xl font-bold tracking-tight">
          <span className="text-emerald-600">ELIKIN</span>{' '}
          <span className="text-primary-700">MEDICAL</span>
        </h2>
        <p className="text-center text-2xl font-bold text-primary-600 -mt-1">CLINIC</p>
        <p className="mt-1 text-center text-sm italic text-primary-500">{CLINIC.tagline}</p>
        <p className="mt-1 text-center text-xs font-semibold tracking-wide text-primary-700 uppercase">
          Clinic Management System
        </p>
        <p className="mt-3 text-center text-xs text-gray-500">
          {CLINIC.hours} · {CLINIC.phoneDisplay}
        </p>
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
              leftIcon={<Mail className="h-4 w-4" />}
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              leftIcon={<Lock className="h-4 w-4" />}
              error={errors.password?.message}
              {...register('password')}
            />

            <div className="flex items-center justify-between text-sm">
              <Link to="/forgot-password" className="text-primary-600 hover:text-primary-700 font-medium">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full" isLoading={isSubmitting}>
              Sign in
            </Button>
          </form>
        </div>
        <p className="mt-6 text-center text-xs text-gray-400">
          {CLINIC.email} · {CLINIC.social}
        </p>
      </div>
    </div>
  )
}
