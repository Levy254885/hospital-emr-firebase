import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Shield } from 'lucide-react'
import { ROLE_LABELS, SYSTEM_ROLES } from '@/lib/services/authService'

const ROLE_DESCRIPTIONS: Record<string, string> = {
  super_admin: 'Full system access — manage users, roles, settings, and all modules',
  admin: 'Hospital administrator — manage operations and most modules',
  doctor: 'Clinical care — patients, records, prescriptions, lab orders',
  nurse: 'Nursing care — patients, vitals, inpatient, triage',
  receptionist: 'Front desk — registration, appointments, basic billing',
  pharmacist: 'Pharmacy — medications, inventory, dispensation',
  laboratory: 'Lab — orders and results entry',
  billing: 'Finance — invoices, payments, cash register',
  patient: 'Patient portal access only',
}

export default function RoleListPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Roles</h1>
        <p className="text-sm text-gray-500">System roles and their access levels</p>
      </div>

      <div className="grid gap-4">
        {SYSTEM_ROLES.map((role) => (
          <Card key={role} variant="elevated">
            <CardContent className="py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary-50">
                    <Shield className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{ROLE_LABELS[role]}</p>
                      <Badge variant="default">System</Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{ROLE_DESCRIPTIONS[role]}</p>
                    <p className="text-xs text-gray-400 mt-1 font-mono">{role}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
