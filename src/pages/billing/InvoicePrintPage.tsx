import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { useInstitution } from '@/hooks/useInstitution'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Printer, ArrowLeft } from 'lucide-react'
import Button from '@/components/ui/Button'
import '@/styles/print.css'

export default function InvoicePrintPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: institution } = useInstitution()
  const { data: invoice, isLoading } = useQuery({
    queryKey: ['invoice', id],
    queryFn: async () => { const response = await api.get(`/invoices/${id}`); return response.data.data },
    enabled: !!id,
  })

  if (isLoading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" /></div>
  if (!invoice) return <div className="text-center py-12 text-gray-500">Factura no encontrada</div>

  const totalPaid = invoice.payments?.reduce((sum: number, p: any) => sum + p.amount, 0) || 0
  const balance = invoice.total_amount - totalPaid
  const handlePrint = () => window.print()

  return (
    <>
      <div className="no-print max-w-4xl mx-auto py-4 px-4">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" /></Button>
          <h1 className="text-xl font-bold">Vista Previa de Impresion</h1>
          <Button leftIcon={<Printer className="h-4 w-4" />} onClick={handlePrint}>Imprimir</Button>
        </div>
      </div>
      <div className="print-area" style={{ fontFamily: 'Arial, sans-serif', color: '#000', fontSize: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #1380a0', paddingBottom: '15px', marginBottom: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {institution?.logo ? <img src={institution.logo} alt="Logo" style={{ width: '70px', height: '70px', objectFit: 'contain' }} /> : (
              <div style={{ width: '70px', height: '70px', background: '#1380a0', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '24px', fontWeight: 'bold' }}>{institution?.name?.charAt(0) || 'H'}</div>
            )}
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: '#1380a0' }}>{institution?.name || 'Hospital'}</h2>
              <p style={{ margin: '2px 0', fontSize: '11px', color: '#666' }}>NIT: {institution?.nit || '---'}</p>
              <p style={{ margin: '2px 0', fontSize: '11px', color: '#666' }}>{institution?.address || ''}, {institution?.city || ''}</p>
              <p style={{ margin: '2px 0', fontSize: '11px', color: '#666' }}>Tel: {institution?.phone || ''} | {institution?.email || ''}</p>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h3 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1380a0', margin: 0 }}>FACTURA</h3>
            <p style={{ fontSize: '13px', fontWeight: 'bold', margin: '5px 0' }}>N {invoice.invoice_number}</p>
            <p style={{ fontSize: '11px', color: '#666' }}>Fecha: {formatDate(invoice.invoice_date)}</p>
            {invoice.due_date && <p style={{ fontSize: '11px', color: '#666' }}>Vence: {formatDate(invoice.due_date)}</p>}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', padding: '10px', background: '#f8f9fa', borderRadius: '5px' }}>
          <div>
            <p style={{ fontSize: '10px', color: '#666', margin: 0, textTransform: 'uppercase' }}>Paciente</p>
            <p style={{ fontSize: '13px', fontWeight: 'bold', margin: '2px 0' }}>{invoice.patient?.first_name} {invoice.patient?.last_name}</p>
            <p style={{ fontSize: '11px', color: '#666', margin: 0 }}>CI: {invoice.patient?.document_number || '---'}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '10px', color: '#666', margin: 0, textTransform: 'uppercase' }}>Estado</p>
            <p style={{ fontSize: '13px', fontWeight: 'bold', color: invoice.payment_status === 'paid' ? '#16a34a' : '#dc2626', margin: '2px 0' }}>
              {invoice.payment_status === 'paid' ? 'PAGADO' : invoice.payment_status === 'partial' ? 'PARCIAL' : 'PENDIENTE'}
            </p>
          </div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px' }}>
          <thead><tr style={{ background: '#1380a0', color: 'white' }}>
            <th style={{ padding: '8px', textAlign: 'left', fontSize: '11px' }}>Descripcion</th>
            <th style={{ padding: '8px', textAlign: 'center', fontSize: '11px' }}>Cant.</th>
            <th style={{ padding: '8px', textAlign: 'right', fontSize: '11px' }}>Precio Unit.</th>
            <th style={{ padding: '8px', textAlign: 'right', fontSize: '11px' }}>Descuento</th>
            <th style={{ padding: '8px', textAlign: 'right', fontSize: '11px' }}>Subtotal</th>
          </tr></thead>
          <tbody>
            {invoice.items?.map((item: any, idx: number) => (
              <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb', background: idx % 2 === 0 ? '#fff' : '#f9fafb' }}>
                <td style={{ padding: '8px', fontSize: '11px' }}>{item.description}</td>
                <td style={{ padding: '8px', fontSize: '11px', textAlign: 'center' }}>{item.quantity}</td>
                <td style={{ padding: '8px', fontSize: '11px', textAlign: 'right' }}>{formatCurrency(item.unit_price)}</td>
                <td style={{ padding: '8px', fontSize: '11px', textAlign: 'right' }}>{formatCurrency(item.discount || 0)}</td>
                <td style={{ padding: '8px', fontSize: '11px', textAlign: 'right', fontWeight: 'bold' }}>{formatCurrency(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '15px' }}>
          <div style={{ width: '280px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '11px' }}><span>Subtotal:</span><span>{formatCurrency(invoice.subtotal)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '11px' }}><span>Impuestos:</span><span>{formatCurrency(invoice.tax_amount)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '11px' }}><span>Descuento:</span><span>-{formatCurrency(invoice.discount || 0)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '14px', fontWeight: 'bold', borderTop: '2px solid #1380a0' }}><span>TOTAL:</span><span style={{ color: '#1380a0' }}>{formatCurrency(invoice.total_amount)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '11px', color: '#16a34a' }}><span>Pagado:</span><span>{formatCurrency(totalPaid)}</span></div>
            {balance > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '11px', color: '#dc2626', fontWeight: 'bold' }}><span>Saldo:</span><span>{formatCurrency(balance)}</span></div>}
          </div>
        </div>
        {invoice.notes && <div style={{ padding: '10px', background: '#f8f9fa', borderRadius: '5px', marginBottom: '15px', fontSize: '11px' }}><strong>Notas:</strong> {invoice.notes}</div>}
        <div style={{ borderTop: '1px solid #ccc', paddingTop: '10px', textAlign: 'center', fontSize: '10px', color: '#666' }}>
          <p style={{ margin: '2px 0' }}>{institution?.mission || ''}</p>
          <p style={{ margin: '2px 0' }}>Documento generado el {new Date().toLocaleString('es-BO')}</p>
        </div>
      </div>
    </>
  )
}
