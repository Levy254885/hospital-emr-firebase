import { useMemo, useState } from 'react'
import {
  Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,
} from 'chart.js'
import { Pie, Bar } from 'react-chartjs-2'
import { useQuery } from '@tanstack/react-query'
import { listPatients } from '@/lib/services'
import { listInventoryItems } from '@/lib/services/inventoryService'
import { useAuth } from '@/hooks/useAuth'
import { normalizeRole } from '@/lib/rbac'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { PageLoadingSpinner } from '@/components/ui/LoadingSpinner'
import { formatCurrency } from '@/lib/utils'
import { BarChart3, PieChart, Package, Users } from 'lucide-react'

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export default function ReportsPage() {
  const { user } = useAuth()
  const role = normalizeRole(user?.role?.name)
  const [tab, setTab] = useState<'overview' | 'inventory' | 'pharmacy'>('overview')

  const { data: patients, isLoading: pLoading } = useQuery({
    queryKey: ['report-patients', user?.institution_id],
    queryFn: async () => {
      const res = await listPatients({ institution_id: user?.institution_id, per_page: 500 })
      return res.data || []
    },
    enabled: role !== 'pharmacist',
  })

  const { data: inventory = [], isLoading: iLoading } = useQuery({
    queryKey: ['report-inventory', user?.institution_id],
    queryFn: () => listInventoryItems(user?.institution_id),
  })

  const isLoading = (role !== 'pharmacist' && pLoading) || iLoading

  const genderPie = useMemo(() => {
    const list = patients || []
    const counts: Record<string, number> = { Male: 0, Female: 0, Other: 0 }
    list.forEach((p) => {
      const g = (p.gender || 'O').toUpperCase()
      if (g === 'M' || g === 'MALE') counts.Male++
      else if (g === 'F' || g === 'FEMALE') counts.Female++
      else counts.Other++
    })
    return {
      labels: Object.keys(counts),
      datasets: [{ data: Object.values(counts), backgroundColor: ['#0d6b89', '#e11d48', '#94a3b8'], borderWidth: 0 }],
    }
  }, [patients])

  const inventoryByCategory = useMemo(() => {
    const map: Record<string, number> = {}
    inventory.forEach((i) => {
      const c = i.category || 'general'
      map[c] = (map[c] || 0) + 1
    })
    return {
      labels: Object.keys(map).map((k) => k.charAt(0).toUpperCase() + k.slice(1)),
      datasets: [{ label: 'Items', data: Object.values(map), backgroundColor: ['#0d6b89', '#059669', '#d97706', '#7c3aed', '#dc2626'] }],
    }
  }, [inventory])

  const stockBar = useMemo(() => {
    const top = [...inventory].sort((a, b) => (b.quantity || 0) - (a.quantity || 0)).slice(0, 8)
    return {
      labels: top.map((i) => i.name?.slice(0, 16) || 'Item'),
      datasets: [{ label: 'Quantity', data: top.map((i) => i.quantity || 0), backgroundColor: '#0d6b89' }],
    }
  }, [inventory])

  const inventoryValue = inventory.reduce((s, i) => s + (i.cost || 0) * (i.quantity || 0), 0)
  const lowStock = inventory.filter((i) => (i.quantity || 0) <= (i.min_quantity || 0)).length

  if (isLoading) return <PageLoadingSpinner />

  const tabs =
    role === 'pharmacist'
      ? [{ id: 'pharmacy' as const, label: 'Pharmacy' }, { id: 'inventory' as const, label: 'Inventory' }]
      : [
          { id: 'overview' as const, label: 'Overview' },
          { id: 'inventory' as const, label: 'Inventory' },
          { id: 'pharmacy' as const, label: 'Pharmacy' },
        ]

  const activeTab = role === 'pharmacist' && tab === 'overview' ? 'pharmacy' : tab

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-sm text-gray-500">Analytics and charts (currency: KSh)</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              activeTab === t.id ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && role !== 'pharmacist' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Patients by gender</CardTitle>
            </CardHeader>
            <CardContent className="h-72 flex items-center justify-center">
              {(patients || []).length === 0 ? (
                <p className="text-sm text-gray-500">No patient data yet</p>
              ) : (
                <Pie data={genderPie} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
              )}
            </CardContent>
          </Card>
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" /> Inventory by category</CardTitle>
            </CardHeader>
            <CardContent className="h-72 flex items-center justify-center">
              {inventory.length === 0 ? (
                <p className="text-sm text-gray-500">No inventory data yet</p>
              ) : (
                <Bar data={inventoryByCategory} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }} />
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {(activeTab === 'inventory' || activeTab === 'pharmacy') && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card variant="elevated"><CardContent className="py-4"><p className="text-sm text-gray-500">Total items</p><p className="text-2xl font-bold text-gray-900">{inventory.length}</p></CardContent></Card>
            <Card variant="elevated"><CardContent className="py-4"><p className="text-sm text-gray-500">Low stock</p><p className="text-2xl font-bold text-red-600">{lowStock}</p></CardContent></Card>
            <Card variant="elevated"><CardContent className="py-4"><p className="text-sm text-gray-500">Stock value</p><p className="text-2xl font-bold text-primary-600">{formatCurrency(inventoryValue)}</p></CardContent></Card>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card variant="elevated">
              <CardHeader><CardTitle className="flex items-center gap-2"><PieChart className="h-5 w-5" /> Items by category</CardTitle></CardHeader>
              <CardContent className="h-72 flex items-center justify-center">
                {inventory.length === 0 ? (
                  <p className="text-sm text-gray-500">Add inventory items to see charts</p>
                ) : (
                  <Pie
                    data={{
                      ...inventoryByCategory,
                      datasets: [{ data: inventoryByCategory.datasets[0].data, backgroundColor: ['#0d6b89', '#059669', '#d97706', '#7c3aed', '#dc2626'], borderWidth: 0 }],
                    }}
                    options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }}
                  />
                )}
              </CardContent>
            </Card>
            <Card variant="elevated">
              <CardHeader><CardTitle className="flex items-center gap-2"><Package className="h-5 w-5" /> Top stock quantities</CardTitle></CardHeader>
              <CardContent className="h-72 flex items-center justify-center">
                {inventory.length === 0 ? (
                  <p className="text-sm text-gray-500">No stock data</p>
                ) : (
                  <Bar data={stockBar} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }} />
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
