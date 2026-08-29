# Hospital EMR — Firebase Edition

React frontend (Rodrigo HMS UI) + Firebase Auth + Firestore + Storage + Cloud Functions (M-Pesa).

**Repo:** https://github.com/Levy254885/hospital-emr-firebase  
**Firebase project:** `hospitalmanagement-system-ke`

## Status

Core Firebase migration is in this repo:
- Firebase config & Auth hooks
- All React Query data hooks (patients, appointments, pharmacy, lab, billing, inpatient, etc.)
- Firestore security rules
- Vercel config

**Full UI pages/components** live in the project workspace. To push the complete tree (recommended):

```bash
# 1. Clone
git clone https://github.com/Levy254885/hospital-emr-firebase.git
cd hospital-emr-firebase

# 2. Copy complete source from the project artifacts (or extract the tarball)
#    Replace the working tree with the full hms-firebase folder contents
#    (package.json, src/, functions/, firestore.rules, etc.)

# 3. Commit and push
git add -A
git commit -m "Complete HMS Firebase source: pages, components, services, functions"
git push origin main
```

Or from the workspace tarball:

```bash
tar xzf hospital-emr-firebase-complete.tar.gz
cd hms-firebase
git init
git remote add origin https://github.com/Levy254885/hospital-emr-firebase.git
git add -A
git commit -m "Full Hospital EMR Firebase application"
git branch -M main
git push -u origin main --force
```

## Quick start

```bash
npm install
cp .env.example .env   # already has project keys
npm run dev
```

### Firebase setup
1. Enable Email/Password Auth, Firestore, Storage, Functions
2. `firebase deploy --only firestore:rules,firestore:indexes,storage`
3. Create Super Admin: Auth user + Firestore `users/{uid}` with `role: "super_admin"`, `is_active: true`

### Vercel
1. Import this GitHub repo in Vercel
2. Framework: Vite, Build: `npm run build`, Output: `dist`
3. Add env vars from `.env.example`

### M-Pesa (optional)
```bash
cd functions && npm i && npm run build
firebase functions:config:set mpesa.consumer_key="..." mpesa.consumer_secret="..." \
  mpesa.shortcode="..." mpesa.passkey="..." mpesa.callback_url="https://.../mpesaCallback"
firebase deploy --only functions
```

## Architecture

```
React (Vite + Tailwind) → Firebase Auth → Firestore → Storage → Cloud Functions → Daraja
```

Roles: super_admin, admin, doctor, nurse, receptionist, pharmacist, laboratory, billing, patient
