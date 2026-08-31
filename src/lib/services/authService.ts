import {
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp, collection, getDocs, query, orderBy, limit, updateDoc } from 'firebase/firestore'
import { initializeApp, deleteApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { auth, db } from '../firebase'
import { COLLECTIONS, writeAuditLog } from '../firestore'
import type { User, Role } from '@/types'

export const SYSTEM_ROLES = [
  'super_admin',
  'admin',
  'doctor',
  'nurse',
  'receptionist',
  'pharmacist',
  'laboratory',
  'billing',
  'patient',
] as const
export type SystemRole = (typeof SYSTEM_ROLES)[number]

/** Sole super-admin email. On login, Firestore users/{uid} is set to role super_admin. Password lives only in Firebase Auth. */
export const SUPER_ADMIN_EMAILS = ['kinyuaajames@gmail.com'].map((e) => e.toLowerCase())

export const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  admin: 'Administrator',
  doctor: 'Doctor',
  nurse: 'Nurse',
  receptionist: 'Receptionist',
  pharmacist: 'Pharmacist',
  laboratory: 'Laboratory',
  billing: 'Billing',
  patient: 'Patient',
}

export interface UserProfile {
  id: string
  email: string
  name: string
  first_name?: string
  last_name?: string
  phone?: string
  role: string
  role_name?: string
  permissions?: string[]
  institution_id: string
  is_active: boolean
  last_login?: string
  created_at: string
  updated_at: string
  photo_url?: string
}

function mapToUser(p: UserProfile): User {
  const roleName = p.role_name || p.role || 'patient'
  return {
    id: p.id,
    email: p.email,
    name: p.name || `${p.first_name || ''} ${p.last_name || ''}`.trim(),
    first_name: p.first_name,
    last_name: p.last_name,
    phone: p.phone,
    role: {
      id: p.role,
      name: roleName,
      permissions: (p.permissions || []).map((x, i) => ({
        id: String(i),
        name: x,
        module: x.split('.')[0] || 'general',
        action: x.split('.')[1] || 'read',
      })),
      is_system: true,
      created_at: p.created_at,
    } as Role,
    institution_id: p.institution_id || '',
    is_active: p.is_active !== false,
    last_login: p.last_login,
    created_at: p.created_at,
    updated_at: p.updated_at,
  }
}

export async function fetchUserProfile(uid: string): Promise<User | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.users, uid))
  if (!snap.exists()) return null
  const d = snap.data()
  return mapToUser({
    id: snap.id,
    email: d.email,
    name: d.name || d.display_name || '',
    first_name: d.first_name,
    last_name: d.last_name,
    phone: d.phone,
    role: d.role || 'patient',
    role_name: d.role_name || d.role,
    permissions: d.permissions || [],
    institution_id: d.institution_id || '',
    is_active: d.is_active !== false,
    last_login: d.last_login?.toDate?.()?.toISOString?.() || d.last_login,
    created_at: d.created_at?.toDate?.()?.toISOString?.() || d.created_at || new Date().toISOString(),
    updated_at: d.updated_at?.toDate?.()?.toISOString?.() || d.updated_at || new Date().toISOString(),
    photo_url: d.photo_url,
  })
}

/** Ensure super-admin emails always get super_admin role + full profile in Firestore */
async function ensureSuperAdminProfile(fbUser: FirebaseUser): Promise<User> {
  const email = (fbUser.email || '').toLowerCase()
  const isSuper = SUPER_ADMIN_EMAILS.includes(email)
  const existing = await fetchUserProfile(fbUser.uid)

  if (existing) {
    if (isSuper && existing.role?.name !== 'super_admin') {
      await setDoc(
        doc(db, COLLECTIONS.users, fbUser.uid),
        {
          email,
          role: 'super_admin',
          role_name: 'super_admin',
          permissions: ['*'],
          is_active: true,
          updated_at: serverTimestamp(),
        },
        { merge: true }
      )
      return (await fetchUserProfile(fbUser.uid))!
    }
    return existing
  }

  const name = fbUser.displayName || email.split('@')[0] || 'Admin'
  const role = isSuper ? 'super_admin' : 'patient'
  await setDoc(doc(db, COLLECTIONS.users, fbUser.uid), {
    email,
    name,
    first_name: name.split(' ')[0] || name,
    last_name: name.split(' ').slice(1).join(' ') || '',
    phone: '',
    role,
    role_name: role,
    permissions: isSuper ? ['*'] : [],
    institution_id: 'default',
    is_active: true,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
    last_login: serverTimestamp(),
  })
  return (await fetchUserProfile(fbUser.uid))!
}

export async function login(email: string, password: string): Promise<User> {
  const cred = await signInWithEmailAndPassword(auth, email.trim(), password)
  const profile = await ensureSuperAdminProfile(cred.user)
  if (!profile.is_active) {
    await signOut(auth)
    throw new Error('Account is deactivated.')
  }
  await setDoc(
    doc(db, COLLECTIONS.users, cred.user.uid),
    { last_login: serverTimestamp(), updated_at: serverTimestamp() },
    { merge: true }
  )
  try {
    await writeAuditLog({
      action: 'login',
      entity_type: 'user',
      entity_id: cred.user.uid,
      user_id: cred.user.uid,
      user_email: email,
      user_name: profile.name,
    })
  } catch {
    /* non-fatal */
  }
  return profile
}

export async function logout(): Promise<void> {
  await signOut(auth)
}

export async function register(
  email: string,
  password: string,
  data: {
    name: string
    first_name?: string
    last_name?: string
    phone?: string
    role?: SystemRole
    institution_id?: string
  }
): Promise<User> {
  const cred = await createUserWithEmailAndPassword(auth, email.trim(), password)
  const isSuper = SUPER_ADMIN_EMAILS.includes(email.trim().toLowerCase())
  const role = isSuper ? 'super_admin' : data.role || 'patient'
  await setDoc(doc(db, COLLECTIONS.users, cred.user.uid), {
    email: email.trim().toLowerCase(),
    name: data.name,
    first_name: data.first_name || data.name.split(' ')[0] || '',
    last_name: data.last_name || data.name.split(' ').slice(1).join(' ') || '',
    phone: data.phone || '',
    role,
    role_name: role,
    permissions: role === 'super_admin' || role === 'admin' ? ['*'] : [],
    institution_id: data.institution_id || 'default',
    is_active: true,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  })
  const user = await fetchUserProfile(cred.user.uid)
  if (!user) throw new Error('Failed to create profile')
  return user
}

/**
 * Create a user without signing out the current admin.
 * Uses a secondary Firebase Auth app instance.
 */
export async function createUserAsAdmin(params: {
  email: string
  password: string
  first_name: string
  last_name: string
  phone?: string
  role: SystemRole
  institution_id?: string
  created_by?: string
}): Promise<User> {
  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyCAe5JZQFQhDpzV-lAjiZGzP-uqA5f5R6E',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'hospitalmanagement-system-ke.firebaseapp.com',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'hospitalmanagement-system-ke',
    storageBucket:
      import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'hospitalmanagement-system-ke.firebasestorage.app',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '186525212144',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:186525212144:web:56c00c66dfb5bcb1ee5135',
  }

  const appName = `Secondary-${Date.now()}`
  const secondaryApp = initializeApp(firebaseConfig, appName)
  const secondaryAuth = getAuth(secondaryApp)

  try {
    const cred = await createUserWithEmailAndPassword(secondaryAuth, params.email, params.password)
    const name = `${params.first_name} ${params.last_name}`.trim()
    const isSuper = SUPER_ADMIN_EMAILS.includes(params.email.toLowerCase())
    const role = isSuper ? 'super_admin' : params.role || 'patient'
    await setDoc(doc(db, COLLECTIONS.users, cred.user.uid), {
      email: params.email.toLowerCase(),
      name,
      first_name: params.first_name,
      last_name: params.last_name,
      phone: params.phone || '',
      role,
      role_name: role,
      permissions: role === 'super_admin' || role === 'admin' ? ['*'] : [],
      institution_id: params.institution_id || 'default',
      is_active: true,
      created_by: params.created_by || null,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    })
    await signOut(secondaryAuth)
    const user = await fetchUserProfile(cred.user.uid)
    if (!user) throw new Error('Failed to create user profile')
    return user
  } finally {
    try {
      await deleteApp(secondaryApp)
    } catch {
      /* ignore */
    }
  }
}

export async function listUsers(): Promise<User[]> {
  let snap
  try {
    snap = await getDocs(
      query(collection(db, COLLECTIONS.users), orderBy('created_at', 'desc'), limit(200))
    )
  } catch {
    snap = await getDocs(query(collection(db, COLLECTIONS.users), limit(200)))
  }
  return snap.docs.map((d) => {
    const data = d.data()
    return mapToUser({
      id: d.id,
      email: data.email,
      name: data.name || '',
      first_name: data.first_name,
      last_name: data.last_name,
      phone: data.phone,
      role: data.role || 'patient',
      role_name: data.role_name || data.role,
      permissions: data.permissions || [],
      institution_id: data.institution_id || '',
      is_active: data.is_active !== false,
      last_login: data.last_login?.toDate?.()?.toISOString?.() || data.last_login,
      created_at: data.created_at?.toDate?.()?.toISOString?.() || data.created_at || '',
      updated_at: data.updated_at?.toDate?.()?.toISOString?.() || data.updated_at || '',
    })
  })
}

export async function updateUserRole(
  userId: string,
  role: SystemRole,
  updatedBy?: string
): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.users, userId), {
    role,
    role_name: role,
    permissions: role === 'super_admin' || role === 'admin' ? ['*'] : [],
    updated_at: serverTimestamp(),
    updated_by: updatedBy || null,
  })
}

export async function setUserActive(userId: string, isActive: boolean): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.users, userId), {
    is_active: isActive,
    updated_at: serverTimestamp(),
  })
}

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email)
}

export function subscribeToAuth(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
    if (!fbUser) {
      callback(null)
      return
    }
    try {
      const profile = await ensureSuperAdminProfile(fbUser)
      callback(profile)
    } catch {
      callback(null)
    }
  })
}
