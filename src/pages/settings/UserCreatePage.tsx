import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import { ArrowLeft, Save, UserPlus } from 'lucide-react'

export default function UserCreatePage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ first_name: '', last_name: '', email: '', phone: '', role: '', password: '', password_confirmation: '' })
  const updateField = (field: string, value: string) => setFormData(prev => ({ ...prev, [field]: value }))
  const handleSave = () => { console.log('Saving user:', formData); navigate('/settings/users') }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" /></Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nuevo Usuario</h1>
          <p className="text-sm text-gray-500">Registrar nuevo usuario del sistema</p>
        </div>
      </div>
      <Card variant="elevated">
        <CardHeader><CardTitle className="flex items-center gap-2"><UserPlus className="h-5 w-5 text-primary-600" />Datos del Usuario</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Nombre" required value={formData.first_name} onChange={(e) => updateField('first_name', e.target.value)} />
            <Input label="Apellido" required value={formData.last_name} onChange={(e) => updateField('last_name', e.target.value)} />
            <Input label="Email" type="email" required value={formData.email} onChange={(e) => updateField('email', e.target.value)} />
            <Input label="Telefono" value={formData.phone} onChange={(e) => updateField('phone', e.target.value)} />
            <Select label="Rol" required options={[
              { value: 'admin', label: 'Administrador' }, { value: 'doctor', label: 'Medico' },
              { value: 'nurse', label: 'Enfermero' }, { value: 'receptionist', label: 'Recepcionista' },
              { value: 'lab_tech', label: 'Tecnico de Laboratorio' }, { value: 'pharmacist', label: 'Farmaceutico' },
            ]} value={formData.role} onChange={(e) => updateField('role', e.target.value)} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Contrasena" type="password" required value={formData.password} onChange={(e) => updateField('password', e.target.value)} />
            <Input label="Confirmar Contrasena" type="password" required value={formData.password_confirmation} onChange={(e) => updateField('password_confirmation', e.target.value)} />
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => navigate(-1)}>Cancelar</Button>
        <Button leftIcon={<Save className="h-4 w-4" />} onClick={handleSave}>Crear Usuario</Button>
      </div>
    </div>
  )
}
