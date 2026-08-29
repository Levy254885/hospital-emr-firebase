import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { useInstitution } from '@/hooks/useInstitution'
import { formatDate } from '@/lib/utils'
import { Printer, ArrowLeft } from 'lucide-react'
import Button from '@/components/ui/Button'
import '@/styles/print.css'

export default function LabResultPrintPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: institution } = useInstitution()
  const { data: result, isLoading } = useQuery({
    queryKey: ['lab-result', id],
    queryFn: async () => { const response = await api.get(`/lab-results/${id}`); return response.data.data },
    enabled: !!id,
  })

  if (isLoading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" /></div>
  if (!result) return <div className="text-center py-12 text-gray-500">Resultado no encontrado</div>
  const handlePrint = () => window.print()

  return (
    <>
      <div className="no-print max-w-4xl mx-auto py-4 px-4">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" /></Button>
          <h1 className="text-xl font-bold">Vista Previa - Resultado de Laboratorio</h1>
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
              <p style={{ margin: '2px 0', fontSize: '11px', color: '#666' }}>Tel: {institution?.phone || ''}</p>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1380a0', margin: 0 }}>RESULTADO DE LABORATORIO</h3>
            <p style={{ fontSize: '11px', color: '#666', margin: '5px 0' }}>N {result.result_number || result.id}</p>
            <p style={{ fontSize: '11px', color: '#666' }}>Fecha: {formatDate(result.result_date || result.created_at)}</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div style={{ padding: '10px', background: '#f8f9fa', borderRadius: '5px' }}>
            <p style={{ fontSize: '10px', color: '#666', margin: '0 0 3px 0', textTransform: 'uppercase' }}>Paciente</p>
            <p style={{ fontSize: '13px', fontWeight: 'bold', margin: '0 0 2px 0' }}>{result.lab_order?.patient?.first_name} {result.lab_order?.patient?.last_name}</p>
            <p style={{ fontSize: '11px', color: '#666', margin: 0 }}>CI: {result.lab_order?.patient?.ci || result.lab_order?.patient?.document_number || '---'}</p>
          </div>
          <div style={{ padding: '10px', background: '#f8f9fa', borderRadius: '5px' }}>
            <p style={{ fontSize: '10px', color: '#666', margin: '0 0 3px 0', textTransform: 'uppercase' }}>Medico Solicitante</p>
            <p style={{ fontSize: '13px', fontWeight: 'bold', margin: '0 0 2px 0' }}>{result.lab_order?.doctor?.name || '---'}</p>
          </div>
        </div>
        <div style={{ padding: '10px', border: '1px solid #e5e7eb', borderRadius: '5px', marginBottom: '15px' }}>
          <p style={{ fontSize: '10px', color: '#666', margin: '0 0 5px 0', textTransform: 'uppercase' }}>Examen / Prueba</p>
          <p style={{ fontSize: '13px', fontWeight: 'bold', margin: 0, color: '#1380a0' }}>{result.exam_name || result.test_name || '---'}</p>
        </div>
        {(result.results || result.items) && (result.results || result.items).length > 0 && (
          <div style={{ marginBottom: '15px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: '#1380a0', margin: '0 0 10px 0', borderBottom: '1px solid #e5e7eb', paddingBottom: '5px' }}>Resultados</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: '#1380a0', color: 'white' }}>
                <th style={{ padding: '8px', textAlign: 'left', fontSize: '11px' }}>Parametro</th>
                <th style={{ padding: '8px', textAlign: 'center', fontSize: '11px' }}>Resultado</th>
                <th style={{ padding: '8px', textAlign: 'center', fontSize: '11px' }}>Unidad</th>
                <th style={{ padding: '8px', textAlign: 'center', fontSize: '11px' }}>Valores Referencia</th>
                <th style={{ padding: '8px', textAlign: 'center', fontSize: '11px' }}>Estado</th>
              </tr></thead>
              <tbody>
                {(result.results || result.items).map((item: any, idx: number) => {
                  const isAbnormal = item.is_abnormal || (item.status === 'abnormal' || item.status === 'high' || item.status === 'low')
                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb', background: isAbnormal ? '#fef2f2' : idx % 2 === 0 ? '#fff' : '#f9fafb' }}>
                      <td style={{ padding: '8px', fontSize: '11px', fontWeight: 'bold' }}>{item.parameter || item.test_name || '---'}</td>
                      <td style={{ padding: '8px', fontSize: '11px', textAlign: 'center', fontWeight: 'bold', color: isAbnormal ? '#dc2626' : '#000' }}>{item.result_value || item.value || '---'}</td>
                      <td style={{ padding: '8px', fontSize: '11px', textAlign: 'center' }}>{item.unit || '---'}</td>
                      <td style={{ padding: '8px', fontSize: '11px', textAlign: 'center', color: '#666' }}>{item.reference_range || '---'}</td>
                      <td style={{ padding: '8px', fontSize: '10px', textAlign: 'center', fontWeight: 'bold', color: isAbnormal ? '#dc2626' : '#16a34a' }}>
                        {item.status === 'high' ? 'ALTO' : item.status === 'low' ? 'BAJO' : item.status === 'abnormal' ? 'ANORMAL' : 'Normal'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
        {result.observations && <div style={{ padding: '10px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '5px', marginBottom: '15px', fontSize: '11px' }}><strong>Observaciones:</strong> {result.observations}</div>}
        <div style={{ borderTop: '1px solid #ccc', paddingTop: '10px', textAlign: 'center', fontSize: '9px', color: '#666', marginTop: '20px' }}>
          <p style={{ margin: '2px 0' }}>{institution?.name || ''} | NIT: {institution?.nit || ''}</p>
          <p style={{ margin: '2px 0' }}>Los resultados deben ser interpretados por el medico tratante</p>
        </div>
      </div>
    </>
  )
}
