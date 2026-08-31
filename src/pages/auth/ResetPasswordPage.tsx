import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Stethoscope, ArrowLeft, CheckCircle } from 'lucide-react'

export default function ResetPasswordPage() {
  const [params] = useSearchParams()
  const oobCode = params.get('oobCode') || params.get('token')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!oobCode) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card variant="elevated" className="w-full max-w-md">
          <CardContent className="pt-8 pb-8 px-6 text-center space-y-3">
            <h1 className="text-xl font-bold text-gray-900">Invalid token</h1>
            <p className="text-sm text-gray-500">
              The password recovery link is invalid or has expired.
            </p>
            <Link to="/login" className="text-sm text-primary-600 hover:text-primary-700">
              Go to sign in
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      setDone(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not reset password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-4">
      <Card variant="elevated" className="w-full max-w-md">
        <CardContent className="pt-8 pb-8 px-6">
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-primary-600 flex items-center justify-center mb-3">
              <Stethoscope className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
          </div>

          {done ? (
            <div className="text-center space-y-4">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
              <h2 className="text-lg font-semibold">Password Reset</h2>
              <p className="text-sm text-gray-500">Your password has been updated. You can sign in now.</p>
              <Link to="/login" className="text-sm text-primary-600 hover:text-primary-700">
                Go to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="rounded-lg bg-red-50 text-red-700 text-sm px-3 py-2">{error}</div>}
              <Input label="New password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
              <Input label="Confirm password" type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
              <Button type="submit" className="w-full" isLoading={loading}>
                Reset Password
              </Button>
              <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-primary-600">
                <ArrowLeft className="h-4 w-4" /> Back to sign in
              </Link>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
