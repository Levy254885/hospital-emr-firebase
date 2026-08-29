# Hospital EMR — Firebase Edition (Rodrigo HMS Frontend)

Cloned from https://github.com/Rodrigo-Silva-Alarcon/hospital-emr-system and migrated to Firebase.

**Architecture:** React (existing UI) → Firebase Auth → Firestore → Storage → Cloud Functions → M-Pesa Daraja

## Quick start

```bash
npm install
npm run dev
```

1. Enable **Email/Password** auth, **Firestore**, **Storage**, **Functions** in Firebase project `hospitalmanagement-system-ke`.
2. Deploy rules: `firebase deploy --only firestore:rules,firestore:indexes,storage`
3. Create first admin: Auth user + Firestore `users/{uid}` with `role: "super_admin"`, `is_active: true`.

## Vercel deployment

1. Import this repo in Vercel
2. Set environment variables from `.env.example`
3. Framework: Vite · Build: `npm run build` · Output: `dist`

## Roles

`super_admin` · `admin` · `doctor` · `nurse` · `receptionist` · `pharmacist` · `laboratory` · `billing` · `patient`

## Collections

users, patients, appointments, consultations, medicalRecords, vitalSigns, diagnoses, prescriptions, medications, inventory, labOrders, labResults, wards, beds, admissions, invoices, payments, auditLogs, institutions, and more.

See full README sections in project for M-Pesa Cloud Functions setup.
