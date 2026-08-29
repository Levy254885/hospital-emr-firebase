import {
  signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword,
  sendPasswordResetEmail, onAuthStateChanged, updateProfile, type User as FirebaseUser,
} from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../firebase'
import { COLLECTIONS, writeAuditLog } from '../firestore'
import type { User, Role } from '@/types'

export const SYSTEM_ROLES = [
  'super_admin', 'admin', 'doctor', 'nurse', 'receptionist',
  'pharmacist', 'laboratory', 'billing', 'patient',
] as const
export type SystemRole = (typeof SYSTEM_ROLES)[number]

export interface UserProfile {
  id: string; email: string; name: string; first_name?: string; last_name?: string
  phone?: string; role: string; role_name?: string; permissions?: string[]
  institution_id: string; is_active: boolean; last_login?: string
  created_at: string; updated_at: string; photo_url?: string
}

function mapToUser(p: UserProfile): User {
  const roleName = p.role_name || p.role || 'patient'
  return {
    id: p.id, email: p.email,
    name: p.name || `${p.first_name || ''} ${p.last_name || ''}`.trim(),
    first_name: p.first_name, last_name: p.last_name, phone: p.phone,
    role: {
      id: p.role, name: roleName,
      permissions: (p.permissions || []).map((x, i) => ({
        id: String(i), name: x, module: x.split('.')[0] || 'general', action: x.split('.')[1] || 'read',
      })),
      is_system: true, created_at: p.created_at,
    } as Role,
    institution_id: p.institution_id || '', is_active: p.is_active !== false,
    last_login: p.last_login, created_at: p.created_at, updated_at: p.updated_at,
  }
}

export async function fetchUserProfile(uid: string): Promise<User | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.users, uid))
  if (!snap.exists()) return null
  const d = snap.data()
  return mapToUser({
    id: snap.id, email: d.email, name: d.name || d.display_name || '',
    first_name: d.first_name, last_name: d.last_name, phone: d.phone,
    role: d.role || 'patient', role_name: d.role_name || d.role,
    permissions: d.permissions || [], institution_id: d.institution_id || '',
    is_active: d.is_active !== false,
    last_login: d.last_login?.toDate?.()?.toISOString?.() || d.last_login,
    created_at: d.created_at?.toDate?.()?.toISOString?.() || d.created_at || new Date().toISOString(),
    updated_at: d.updated_at?.toDate?.()?.toISOString?.() || d.updated_at || new Date().toISOString(),
    photo_url: d.photo_url,
  })
}

export async function login(email: string, password: string): Promise<User> {
  const cred = await signInWithEmailAndPassword(auth, email, password)
  const profile = await fetchUserProfile(cred.user.uid)
  if (!profile) { await signOut(auth); throw new Error('User profile not found. Contact administrator.') }
  if (!profile.is_active) { await signOut(auth); throw new Error('Account is deactivated.') }
  await setDoc(doc(db, COLLECTIONS.users, cred.user.uid), { last_login: serverTimestamp(), updated_at: serverTimestamp() }, { merge: true })
  await writeAuditLog({ action: 'login', entity_type: 'user', entity_id: cred.user.uid, user_id: cred.user.uid, user_email: email, user_name: profile.name })
  return profile
}

export async function logout(): Promise<void> {
  const uid = auth.currentUser?.uid
  if (uid) { try { await writeAuditLog({ action: 'logout', entity_type: 'user', entity_id: uid, user_id: uid }) } catch {} }
  await signOut(auth)
}

export async function register(
  email: string, password: string,
  data: { name: string; first_name?: string; last_name?: string; phone?: string; role?: SystemRole; institution_id?: string }
): Promise<User> {
  const cred = await createUserWithEmailAndPassword(auth, email, password)
  if (data.name) await updateProfile(cred.user, { displayName: data.name })
  await setDoc(doc(db, COLLECTIONS.users, cred.user.uid), {
    email, name: data.name,
    first_name: data.first_name || data.name.split(' ')[0],
    last_name: data.last_name || data.name.split(' ').slice(1).join(' '),
    phone: data.phone || '', role: data.role || 'patient', role_name: data.role || 'patient',
    permissions: [], institution_id: data.institution_id || '', is_active: true,
    created_at: serverTimestamp(), updated_at: serverTimestamp(),
  })
  await writeAuditLog({ action: 'register', entity_type: 'user', entity_id: cred.user.uid, user_id: cred.user.uid, user_email: email, user_name: data.name })
  const user = await fetchUserProfile(cred.user.uid)
  if (!user) throw new Error('Failed to create profile')
  return user
}

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email)
}

export function subscribeToAuth(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
    if (!fbUser) { callback(null); return }
    try { callback(await fetchUserProfile(fbUser.uid)) } catch { callback(null) }
  })
}
