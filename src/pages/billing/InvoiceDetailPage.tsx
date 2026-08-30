import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useInvoice, useRecordPayment } from '@/hooks/useBilling'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { PageLoadingSpinner } from '@/components/ui/LoadingSpinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatDate, formatCurrency } from '@/lib/utils'
import { ArrowLeft, CreditCard, Save, FileText } from 'lucide-react'

export default function InvoiceDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { data: invoice, isLoading } = useInvoice(id!)
  const recordPayment = useRecordPayment()
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [paymentReference, setPaymentReference] = useState('')

  if (isLoading) return <PageLoadingSpinner />
  if (!invoice) return <EmptyState title="Factura no encontrada" />

  const totalPaid = invoice.payments?.reduce((sum, p) => sum + p.amount, 0) || 0
  const balance = invoice.total_amount - totalPaid

  const handleRecordPayment = async () => {
    try {
      await recordPayment.mutateAsync({
        invoice_id: invoice.id,
        amount: paymentAmount,
        payment_method: paymentMethod as any,
        reference_number: paymentReference || undefined,
      })
      setShowPaymentForm(false)
      setPaymentAmount(0)
      setPaymentReference('')
    } catch (error) {
      console.error('Error recording payment:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" /></Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Factura {invoice.invoice_number}</h1>
          <p className="text-sm text-gray-500">{invoice.patient?.first_name} {invoice.patient?.last_name} • {formatDate(invoice.invoice_date)}</p>
        </div>
        <StatusBadge status={invoice.payment_status} />
        <Button variant="outline" size="sm" onClick={() => window.open(`/billing/invoices/${invoice.id}/print`, '_blank')}>
          <FileText className="h-4 w-4 mr-1" />Imprimir
        </Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card variant="elevated">
            <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary-600" />Detalle de Servicios</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 text-sm font-medium text-gray-500">Descripcion</th>
                      <th className="text-right py-3 text-sm font-medium text-gray-500">Cant.</th>
                      <th className="text-right py-3 text-sm font-medium text-gray-500">Precio</th>
                      <th className="text-right py-3 text-sm font-medium text-gray-500">Desc.</th>
                      <th className="text-right py-3 text-sm font-medium text-gray-500">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map((item) => (
                      <tr key={item.id} className="border-b">
                        <td className="py-3 text-sm text-gray-900">{item.description}</td>
                        <td className="py-3 text-sm text-gray-900 text-right">{item.quantity}</td>
                        <td className="py-3 text-sm text-gray-900 text-right">{formatCurrency(item.unit_price)}</td>
                        <td className="py-3 text-sm text-gray-900 text-right">{formatCurrency(item.discount)}</td>
                        <td className="py-3 text-sm font-medium text-gray-900 text-right">{formatCurrency(item.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          <Card variant="elevated">
            <CardHeader><CardTitle>Pagos Registrados</CardTitle></CardHeader>
            <CardContent>
              {invoice.payments && invoice.payments.length > 0 ? (
                <div className="space-y-3">
                  {invoice.payments.map((payment) => (
                    <div key={payment.id} className="p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-green-900">{formatCurrency(payment.amount)}</p>
                          <p className="text-sm text-green-700">{payment.payment_method} {payment.reference_number && `- ${payment.reference_number}`}</p>
                        </div>
                        <p className="text-sm text-green-600">{formatDate(payment.received_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No hay pagos registrados</p>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card variant="elevated">
            <CardHeader><CardTitle>Resumen</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatCurrency(invoice.subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Impuestos</span><span>{formatCurrency(invoice.tax_amount)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Descuento</span><span>-{formatCurrency(invoice.discount)}</span></div>
              <div className="border-t pt-3 flex justify-between"><span className="font-bold">Total</span><span className="font-bold text-lg">{formatCurrency(invoice.total_amount)}</span></div>
              <div className="border-t pt-3 flex justify-between"><span className="text-gray-500">Pagado</span><span className="text-green-600">{formatCurrency(totalPaid)}</span></div>
              <div className="flex justify-between"><span className="font-bold">Saldo</span><span className={`font-bold ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>{formatCurrency(balance)}</span></div>
            </CardContent>
          </Card>
          {balance > 0 && (
            <Card variant="elevated">
              <CardContent>
                <Button className="w-full" leftIcon={<CreditCard className="h-4 w-4" />} onClick={() => setShowPaymentForm(true)}>Registrar Pago</Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      {showPaymentForm && (
        <Card variant="elevated">
          <CardHeader><CardTitle>Registrar Pago</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input label="Monto" type="number" step="0.01" min={0.01} max={balance} value={paymentAmount} onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)} />
            <Select label="Metodo de Pago" options={[{ value: 'cash', label: 'Efectivo' }, { value: 'card', label: 'Tarjeta' }, { value: 'transfer', label: 'Transferencia' }, { value: 'insurance', label: 'Seguro' }, { value: 'mixed', label: 'Mixto' }]} value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} />
            <Input label="Referencia" value={paymentReference} onChange={(e) => setPaymentReference(e.target.value)} placeholder="Numero de referencia o comprobante" />
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowPaymentForm(false)}>Cancelar</Button>
              <Button leftIcon={<Save className="h-4 w-4" />} onClick={handleRecordPayment} isLoading={recordPayment.isPending} disabled={paymentAmount <= 0}>Guardar Pago</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
