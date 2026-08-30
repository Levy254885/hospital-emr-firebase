import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import TextArea from '@/components/ui/TextArea'
import Button from '@/components/ui/Button'
import { Building2, Save, Upload, Palette } from 'lucide-react'

interface Institution {
  id: number
  name: string
  nit: string
  address: string
  city: string
  phone: string
  email: string
  logo: string | null
  mission: string | null
  vision: string | null
  primary_color: string | null
  secondary_color: string | null
}

export default function InstitutionSettingsPage() {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<Partial<Institution>>({})

  const { data: institution, isLoading } = useQuery({
    queryKey: ['institution'],
    queryFn: async () => {
      const response = await api.get('/institution')
      return response.data.data as Institution
    },
  })

  useEffect(() => {
    if (institution) {
      setForm({
        name: institution.name || '',
        nit: institution.nit || '',
        address: institution.address || '',
        city: institution.city || '',
        phone: institution.phone || '',
        email: institution.email || '',
        logo: institution.logo || '',
        mission: institution.mission || '',
        vision: institution.vision || '',
        primary_color: institution.primary_color || '#1380a0',
        secondary_color: institution.secondary_color || '#3db89a',
      })
    }
  }, [institution])

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<Institution>) => {
      const response = await api.put('/institution', data)
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['institution'] })
      alert('Configuracion guardada correctamente')
    },
  })

  const handleSave = () => updateMutation.mutate(form)

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuracion del Hospital</h1>
          <p className="text-sm text-gray-500">Datos generales de la institucion</p>
        </div>
        <Button leftIcon={<Save className="h-4 w-4" />} onClick={handleSave} isLoading={updateMutation.isPending}>Guardar Cambios</Button>
      </div>
      <Card variant="elevated">
        <CardHeader><CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5 text-primary-600" />Datos Generales</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Nombre del Hospital *" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ej: Hospital General de Bolivia" />
            <Input label="NIT *" value={form.nit || ''} onChange={(e) => setForm({ ...form, nit: e.target.value })} placeholder="Ej: 1234567890" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Direccion" value={form.address || ''} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Ej: Av. Principal No. 1234" />
            <Input label="Ciudad" value={form.city || ''} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Ej: La Paz" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Telefono" value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Ej: +591 2 123456" />
            <Input label="Correo Electronico" type="email" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Ej: info@hospital.bo" />
          </div>
        </CardContent>
      </Card>
      <Card variant="elevated">
        <CardHeader><CardTitle className="flex items-center gap-2"><Upload className="h-5 w-5 text-primary-600" />Logotipo</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center bg-gray-50">
              {form.logo ? (
                <img src={form.logo} alt="Logo" className="max-w-full max-h-full object-contain p-2" />
              ) : (
                <div className="text-center"><Building2 className="h-10 w-10 text-gray-300 mx-auto" /><p className="text-xs text-gray-400 mt-1">Sin logo</p></div>
              )}
            </div>
            <div className="flex-1">
              <Input label="URL del Logo" value={form.logo || ''} onChange={(e) => setForm({ ...form, logo: e.target.value })} placeholder="https://ejemplo.com/logo.png" />
              <p className="text-xs text-gray-500 mt-1">Ingrese la URL de la imagen del logo del hospital</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card variant="elevated">
        <CardHeader><CardTitle>Mision y Vision</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <TextArea label="Mision" value={form.mission || ''} onChange={(e) => setForm({ ...form, mission: e.target.value })} rows={3} placeholder="Mision del hospital..." />
          <TextArea label="Vision" value={form.vision || ''} onChange={(e) => setForm({ ...form, vision: e.target.value })} rows={3} placeholder="Vision del hospital..." />
        </CardContent>
      </Card>
      <Card variant="elevated">
        <CardHeader><CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5 text-primary-600" />Colores del Sistema</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color Primario</label>
              <div className="flex items-center gap-3">
                <input type="color" value={form.primary_color || '#1380a0'} onChange={(e) => setForm({ ...form, primary_color: e.target.value })} className="w-10 h-10 rounded-lg border cursor-pointer" />
                <Input value={form.primary_color || '#1380a0'} onChange={(e) => setForm({ ...form, primary_color: e.target.value })} placeholder="#1380a0" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color Secundario</label>
              <div className="flex items-center gap-3">
                <input type="color" value={form.secondary_color || '#3db89a'} onChange={(e) => setForm({ ...form, secondary_color: e.target.value })} className="w-10 h-10 rounded-lg border cursor-pointer" />
                <Input value={form.secondary_color || '#3db89a'} onChange={(e) => setForm({ ...form, secondary_color: e.target.value })} placeholder="#3db89a" />
              </div>
            </div>
          </div>
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Vista previa:</p>
            <div className="flex gap-3 mt-2">
              <div className="px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ backgroundColor: form.primary_color || '#1380a0' }}>Boton Primario</div>
              <div className="px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ backgroundColor: form.secondary_color || '#3db89a' }}>Boton Secundario</div>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-end">
        <Button leftIcon={<Save className="h-4 w-4" />} onClick={handleSave} isLoading={updateMutation.isPending} size="lg">Guardar Configuracion</Button>
      </div>
    </div>
  )
}
