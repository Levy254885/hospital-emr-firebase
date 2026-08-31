/** Role-based access: which path prefixes each role may open */

export type AppRole =
  | 'super_admin'
  | 'admin'
  | 'doctor'
  | 'nurse'
  | 'receptionist'
  | 'pharmacist'
  | 'laboratory'
  | 'billing'
  | 'patient'

const ROLE_PATHS: Record<AppRole, string[] | '*'> = {
  super_admin: '*',
  admin: '*',
  doctor: [
    '/dashboard',
    '/patients',
    '/clinical',
    '/appointments',
    '/prescriptions',
    '/lab',
    '/surgery',
    '/radiology',
    '/hospitalization',
    '/emergency',
    '/reports',
    '/notifications',
  ],
  nurse: [
    '/dashboard',
    '/patients',
    '/hospitalization',
    '/emergency',
    '/appointments',
    '/clinical',
    '/lab',
    '/notifications',
  ],
  receptionist: [
    '/dashboard',
    '/patients',
    '/appointments',
    '/billing',
    '/notifications',
  ],
  pharmacist: [
    '/dashboard',
    '/pharmacy',
    '/inventory',
    '/prescriptions',
    '/reports',
    '/notifications',
  ],
  laboratory: [
    '/dashboard',
    '/lab',
    '/patients',
    '/reports',
    '/notifications',
  ],
  billing: [
    '/dashboard',
    '/billing',
    '/patients',
    '/reports',
    '/notifications',
  ],
  patient: ['/dashboard', '/patient-portal', '/notifications'],
}

export const ROLE_MENU_SECTIONS: Record<AppRole, string[] | '*'> = {
  super_admin: '*',
  admin: '*',
  doctor: ['Main', 'Patients', 'Clinical'],
  nurse: ['Main', 'Patients', 'Clinical'],
  receptionist: ['Main', 'Patients', 'Finance'],
  pharmacist: ['Main', 'Pharmacy'],
  laboratory: ['Main', 'Clinical'],
  billing: ['Main', 'Finance'],
  patient: ['Main'],
}

export function normalizeRole(role?: string | null): AppRole {
  if (!role) return 'patient'
  const r = role.toLowerCase().replace(/\s+/g, '_')
  if (r === 'lab_tech' || r === 'lab') return 'laboratory'
  if ((ROLE_PATHS as Record<string, unknown>)[r]) return r as AppRole
  return 'patient'
}

export function canAccessPath(role: string | null | undefined, pathname: string): boolean {
  const r = normalizeRole(role)
  const allowed = ROLE_PATHS[r]
  if (allowed === '*') return true
  if (pathname === '/' || pathname === '') return true
  return allowed.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + '/')
  )
}

export function canSeeMenuSection(role: string | null | undefined, sectionLabel: string): boolean {
  const r = normalizeRole(role)
  const sections = ROLE_MENU_SECTIONS[r]
  if (sections === '*') return true
  return sections.includes(sectionLabel)
}

export function canSeeMenuPath(role: string | null | undefined, path: string): boolean {
  return canAccessPath(role, path)
}

export function defaultHomePath(role: string | null | undefined): string {
  const r = normalizeRole(role)
  if (r === 'patient') return '/patient-portal'
  return '/dashboard'
}

export function roleDashboardTitle(role: string | null | undefined): string {
  const r = normalizeRole(role)
  const titles: Record<AppRole, string> = {
    super_admin: 'Super Admin Dashboard',
    admin: 'Administrator Dashboard',
    doctor: 'Doctor Dashboard',
    nurse: 'Nurse Dashboard',
    receptionist: 'Reception Dashboard',
    pharmacist: 'Pharmacy Dashboard',
    laboratory: 'Laboratory Dashboard',
    billing: 'Billing Dashboard',
    patient: 'Patient Portal',
  }
  return titles[r] || 'Dashboard'
}
