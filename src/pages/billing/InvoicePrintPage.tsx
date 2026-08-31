import { useParams, useNavigate } from 'react-router-dom'
import { useInvoice } from '@/hooks/useBilling'
import { useInstitution } from '@/hooks/useInstitution'
import { formatDate, formatCurrency } from '@/lib/utils'
import { CLINIC } from '@/lib/clinic'
import { Printer, ArrowLeft } from 'lucide-react'
import Button from '@/components/ui/Button'
import { PageLoadingSpinner } from '@/components/ui/LoadingSpinner'
import '@/styles/print.css'

export default function InvoicePrintPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: institution } = useInstitution()
  const { data: invoice, isLoading } = useInvoice(id || '')

  if (isLoading) return <PageLoadingSpinner />
  if (!invoice) {
    return (
      <div className="text-center py-12 text-gray-500">
        Invoice not found
        <div className="mt-4">
          <Button variant="outline" onClick={() => navigate('/billing/invoices')}>
            Back to invoices
          </Button>
        </div>
      </div>
    )
  }

  const items = (invoice.items || []) as Array<{
    description?: string
    quantity?: number
    unit_price?: number
    subtotal?: number
  }>
  const patient = invoice.patient as
    | { first_name?: string; last_name?: string; document_number?: string; phone?: string; address?: string }
    | undefined
  const payments = (invoice.payments || []) as Array<{ amount?: number }>
  const totalPaid =
    payments.reduce((s, p) => s + Number(p.amount || 0), 0) || Number(invoice.amount_paid || 0)
  const total = Number(invoice.total_amount ?? invoice.total ?? 0)
  const subtotal = Number(invoice.subtotal ?? 0)
  const tax = Number(invoice.tax_amount ?? invoice.tax ?? 0)
  const discount = Number(invoice.discount ?? 0)
  const balance = Number(invoice.balance ?? total - totalPaid)
  const clinicName = institution?.name || CLINIC.name
  const clinicPhone = institution?.phone || CLINIC.phoneDisplay
  const clinicEmail = institution?.email || CLINIC.email
  const logo = institution?.logo || '/icons/elikin-logo.svg'

  return (
    <>
      <div className="no-print max-w-3xl mx-auto py-4 px-4 flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-lg font-semibold text-gray-900 flex-1">Invoice preview</h1>
        <Button leftIcon={<Printer className="h-4 w-4" />} onClick={() => window.print()}>
          Print
        </Button>
      </div>

      <div
        className="print-area mx-auto bg-white"
        style={{
          maxWidth: '800px',
          padding: '40px 48px',
          fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
          color: '#0f172a',
          fontSize: '13px',
          lineHeight: 1.5,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            borderBottom: '3px solid #0d6b89',
            paddingBottom: '24px',
            marginBottom: '28px',
          }}
        >
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <img src={logo} alt="" style={{ width: 64, height: 64, objectFit: 'contain' }} />
            <div>
              <div style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.02em' }}>
                <span style={{ color: '#22a06b' }}>ELIKIN</span>{' '}
                <span style={{ color: '#0d6b89' }}>MEDICAL CLINIC</span>
              </div>
              <div style={{ fontStyle: 'italic', color: '#64748b', fontSize: '13px' }}>
                {institution?.tagline || CLINIC.tagline}
              </div>
              <div style={{ marginTop: '6px', fontSize: '11px', color: '#475569' }}>
                {clinicPhone}
                <br />
                {clinicEmail}
                <br />
                {CLINIC.hours} · {CLINIC.social}
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div
              style={{
                display: 'inline-block',
                background: 'linear-gradient(135deg, #0d6b89 0%, #0a5569 100%)',
                color: '#fff',
                padding: '8px 16px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '12px',
                letterSpacing: '0.08em',
              }}
            >
              INVOICE
            </div>
            <div style={{ marginTop: '12px', fontSize: '12px' }}>
              <div>
                <span style={{ color: '#64748b' }}>No.</span>{' '}
                <strong>{invoice.invoice_number}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Date</span>{' '}
                {formatDate(String(invoice.invoice_date || invoice.created_at || new Date().toISOString()))}
              </div>
              <div style={{ marginTop: '6px' }}>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '2px 10px',
                    borderRadius: '999px',
                    fontSize: '11px',
                    fontWeight: 600,
                    background: balance <= 0 ? '#dcfce7' : '#fef3c7',
                    color: balance <= 0 ? '#166534' : '#92400e',
                  }}
                >
                  {balance <= 0
                    ? 'PAID'
                    : String(invoice.status || invoice.payment_status || 'PENDING').toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '28px' }}>
          <div
            style={{
              background: '#f8fafc',
              borderRadius: '12px',
              padding: '16px 18px',
              border: '1px solid #e2e8f0',
            }}
          >
            <div
              style={{
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.1em',
                color: '#0d6b89',
                marginBottom: '8px',
              }}
            >
              BILL TO
            </div>
            <div style={{ fontWeight: 700, fontSize: '15px' }}>
              {patient?.first_name || '—'} {patient?.last_name || ''}
            </div>
            {patient?.document_number && (
              <div style={{ color: '#64748b', fontSize: '12px' }}>ID: {patient.document_number}</div>
            )}
            {patient?.phone && <div style={{ color: '#64748b', fontSize: '12px' }}>{patient.phone}</div>}
            {patient?.address && (
              <div style={{ color: '#64748b', fontSize: '12px' }}>{patient.address}</div>
            )}
          </div>
          <div
            style={{
              background: '#f0f9ff',
              borderRadius: '12px',
              padding: '16px 18px',
              border: '1px solid #bae6fd',
            }}
          >
            <div
              style={{
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.1em',
                color: '#0d6b89',
                marginBottom: '8px',
              }}
            >
              FROM
            </div>
            <div style={{ fontWeight: 700, fontSize: '15px' }}>{clinicName}</div>
            <div style={{ color: '#64748b', fontSize: '12px' }}>{CLINIC.tagline}</div>
            <div style={{ color: '#64748b', fontSize: '12px', marginTop: '4px' }}>{clinicPhone}</div>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
          <thead>
            <tr style={{ background: '#0d6b89', color: '#fff' }}>
              <th style={{ textAlign: 'left', padding: '12px 14px', fontSize: '11px', fontWeight: 600 }}>
                Description
              </th>
              <th
                style={{
                  textAlign: 'center',
                  padding: '12px 14px',
                  fontSize: '11px',
                  fontWeight: 600,
                  width: 70,
                }}
              >
                Qty
              </th>
              <th
                style={{
                  textAlign: 'right',
                  padding: '12px 14px',
                  fontSize: '11px',
                  fontWeight: 600,
                  width: 110,
                }}
              >
                Unit (KSh)
              </th>
              <th
                style={{
                  textAlign: 'right',
                  padding: '12px 14px',
                  fontSize: '11px',
                  fontWeight: 600,
                  width: 120,
                }}
              >
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: '16px', textAlign: 'center', color: '#94a3b8' }}>
                  No line items
                </td>
              </tr>
            ) : (
              items.map((item, idx) => {
                const line = Number(item.subtotal ?? (item.quantity || 0) * (item.unit_price || 0))
                return (
                  <tr
                    key={idx}
                    style={{
                      borderBottom: '1px solid #e2e8f0',
                      background: idx % 2 ? '#f8fafc' : '#fff',
                    }}
                  >
                    <td style={{ padding: '12px 14px' }}>{item.description || 'Service'}</td>
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>{item.quantity ?? 1}</td>
                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                      {formatCurrency(item.unit_price || 0)}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 600 }}>
                      {formatCurrency(line)}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '32px' }}>
          <div style={{ width: '280px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', color: '#64748b' }}>
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {tax > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', color: '#64748b' }}>
                <span>Tax</span>
                <span>{formatCurrency(tax)}</span>
              </div>
            )}
            {discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', color: '#64748b' }}>
                <span>Discount</span>
                <span>-{formatCurrency(discount)}</span>
              </div>
            )}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '12px 0',
                marginTop: '4px',
                borderTop: '2px solid #0d6b89',
                fontSize: '16px',
                fontWeight: 800,
              }}
            >
              <span>Total</span>
              <span style={{ color: '#0d6b89' }}>{formatCurrency(total)}</span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '6px 0',
                color: '#16a34a',
                fontWeight: 600,
              }}
            >
              <span>Paid</span>
              <span>{formatCurrency(totalPaid)}</span>
            </div>
            {balance > 0 && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '6px 0',
                  color: '#dc2626',
                  fontWeight: 700,
                }}
              >
                <span>Balance due</span>
                <span>{formatCurrency(balance)}</span>
              </div>
            )}
          </div>
        </div>

        {invoice.notes && (
          <div
            style={{
              padding: '14px 16px',
              background: '#f8fafc',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              marginBottom: '28px',
              fontSize: '12px',
            }}
          >
            <strong style={{ color: '#0d6b89' }}>Notes</strong>
            <div style={{ marginTop: '4px', color: '#475569' }}>{String(invoice.notes)}</div>
          </div>
        )}

        <div
          style={{
            borderTop: '1px solid #e2e8f0',
            paddingTop: '18px',
            textAlign: 'center',
            fontSize: '10px',
            color: '#94a3b8',
          }}
        >
          <div style={{ fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>
            {clinicName} — {CLINIC.tagline}
          </div>
          <div>Your health is our priority · Thank you for choosing us</div>
          <div style={{ marginTop: '6px' }}>
            {clinicPhone} · {clinicEmail} · {CLINIC.social}
          </div>
          <div style={{ marginTop: '8px' }}>Generated {new Date().toLocaleString('en-KE')}</div>
        </div>
      </div>
    </>
  )
}
