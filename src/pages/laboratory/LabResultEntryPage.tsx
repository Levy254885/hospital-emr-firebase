import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useLabOrder, useAddLabResult } from '@/hooks/useLabOrders'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import TextArea from '@/components/ui/TextArea'
import Button from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/Badge'
import { PageLoadingSpinner } from '@/components/ui/LoadingSpinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { ArrowLeft, Save } from 'lucide-react'

interface ResultEntry {
  orderItemId: string
  result_value: string
  unit: string
  referenceRange: string
  isAbnormal: boolean
  notes: string
}

export default function LabResultEntryPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { data: order, isLoading } = useLabOrder(id!)
  const addResult = useAddLabResult()
  const [results, setResults] = useState<Record<string, ResultEntry>>({})

  const updateResult = (itemId: string, field: keyof ResultEntry, value: string | boolean) => {
    setResults(prev => {
      const existing = prev[itemId] || { orderItemId: itemId, result_value: '', unit: '', referenceRange: '', isAbnormal: false, notes: '' }
      return { ...prev, [itemId]: { ...existing, [field]: value } }
    })
  }

  const handleSaveAll = async () => {
    const entries = Object.values(results).filter(r => r.result_value)
    for (const entry of entries) {
      await addResult.mutateAsync({
        lab_order_item_id: entry.orderItemId, result_value: entry.result_value, unit: entry.unit,
        reference_range: entry.referenceRange, is_abnormal: entry.isAbnormal, notes: entry.notes,
      })
    }
    navigate('/lab/orders')
  }

  if (isLoading) return <PageLoadingSpinner />
  if (!order) return <EmptyState title="Orden no encontrada" />

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" /></Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Ingreso de Resultados</h1>
          <p className="text-sm text-gray-500">Orden {order.order_number}</p>
        </div>
        <StatusBadge status={order.status} />
        <Button leftIcon={<Save className="h-4 w-4" />} onClick={handleSaveAll} isLoading={addResult.isPending}>Guardar Todos</Button>
      </div>
      <Card variant="bordered">
        <CardContent className="py-3">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-primary-700">{order.patient?.first_name?.charAt(0)}{order.patient?.last_name?.charAt(0)}</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">{order.patient?.first_name} {order.patient?.last_name}</p>
              <p className="text-sm text-gray-500">CI: {order.patient?.document_number}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      {order.items.map((item) => (
        <Card key={item.id} variant="elevated">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle><span className="font-mono text-primary-700 mr-2">{item.test_code}</span>{item.test_name}</CardTitle>
              <StatusBadge status={item.status} />
            </div>
          </CardHeader>
          <CardContent>
            {item.status === 'completed' && item.result ? (
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm font-medium text-green-800">Resultado:</p>
                <p className="text-lg font-bold text-green-900">{item.result.value} {item.result.unit}</p>
                <p className="text-sm text-green-700">Rango de referencia: {item.result.reference_range}</p>
                {item.result.is_abnormal && <p className="text-sm text-red-600 font-medium mt-1">Valor fuera de rango</p>}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Input label="Resultado" value={results[item.id]?.result_value || ''} onChange={(e) => updateResult(item.id, 'result_value', e.target.value)} placeholder="Ingrese el resultado" />
                <Input label="Unidad" value={results[item.id]?.unit || ''} onChange={(e) => updateResult(item.id, 'unit', e.target.value)} placeholder="ej: mg/dL" />
                <Input label="Rango de Referencia" value={results[item.id]?.referenceRange || ''} onChange={(e) => updateResult(item.id, 'referenceRange', e.target.value)} placeholder="ej: 70-100" />
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={results[item.id]?.isAbnormal || false} onChange={(e) => updateResult(item.id, 'isAbnormal', e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500" />
                    <span className="text-sm text-gray-700">Valor anormal</span>
                  </label>
                </div>
                <div className="md:col-span-2 lg:col-span-4">
                  <TextArea label="Notas" value={results[item.id]?.notes || ''} onChange={(e) => updateResult(item.id, 'notes', e.target.value)} placeholder="Observaciones adicionales..." rows={2} />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
