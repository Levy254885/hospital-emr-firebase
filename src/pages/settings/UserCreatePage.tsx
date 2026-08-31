import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as authService from '@/lib/services/authService'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import { ArrowLeft, Save, UserPlus } from 'lucide-react'
import toast from 'react-hot-toast'

export default function UserCreatePage() {
  const navigate = useNavigate()
  const { user, hasRole } = useAuth()
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: 'doctor' as authService.SystemRole,
    password: '',
    password_confirmation: '',
  })

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const roleOptions = authService.SYSTEM_ROLES.filter((r) => {
    if (r === 'super_admin') return hasRole('super_admin')
    return true
  }).map((r) => ({ value: r, label: authService.ROLE_LABELS[r] || r }))

  const handleSave = async () => {
    if (!formData.email || !formData.password || !formData.first_name) {
      toast.error('Please fill required fields')
      return
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    if (formData.password !== formData.password_confirmation) {
      toast.error('Passwords do not match')
      return
    }
    setSaving(true)
    try {
      await authService.createUserAsAdmin({
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        role: formData.role,
        institution_id: user?.institution_id || 'default',
        created_by: user?.id,
      })
      toast.success('User created successfully')
      navigate('/settings/users')
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string }
      if (e.code === 'auth/email-already-in-use') {
        toast.error('Email is already registered')
      } else {
        toast.error(e.message || 'Failed to create user')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New User</h1>
          <p className="text-sm text-gray-500">Create a system user and assign a role</p>
        </div>
      </div>

      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary-600" />
            User Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="First Name"
              required
              value={formData.first_name}
              onChange={(e) => updateField('first_name', e.target.value)}
            />
            <Input
              label="Last Name"
              required
              value={formData.last_name}
              onChange={(e) => updateField('last_name', e.target.value)}
            />
            <Input
              label="Email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => updateField('email', e.target.value)}
            />
            <Input
              label="Phone"
              value={formData.phone}
              onChange={(e) => updateField('phone', e.target.value)}
            />
            <Select
              label="Role"
              required
              options={roleOptions}
              value={formData.role}
              onChange={(e) => updateField('role', e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Password"
              type="password"
              required
              value={formData.password}
              onChange={(e) => updateField('password', e.target.value)}
            />
            <Input
              label="Confirm Password"
              type="password"
              required
              value={formData.password_confirmation}
              onChange={(e) => updateField('password_confirmation', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => navigate(-1)}>
          Cancel
        </Button>
        <Button leftIcon={<Save className="h-4 w-4" />} onClick={handleSave} isLoading={saving}>
          Create User
        </Button>
      </div>
    </div>
  )
}
