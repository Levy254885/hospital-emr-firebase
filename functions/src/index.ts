import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import axios from 'axios'
admin.initializeApp()
const db = admin.firestore()

export const initiateMpesaSTK = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Login required')
  const { invoice_id, phone, amount } = data as { invoice_id: string; phone: string; amount: number }
  if (!invoice_id || !phone || !amount || amount <= 0)
    throw new functions.https.HttpsError('invalid-argument', 'invoice_id, phone and amount required')
  const inv = await db.collection('invoices').doc(invoice_id).get()
  if (!inv.exists) throw new functions.https.HttpsError('not-found', 'Invoice not found')
  const invData = inv.data()!
  if (amount > invData.balance) throw new functions.https.HttpsError('failed-precondition', 'Amount exceeds balance')
  const cfg = functions.config().mpesa || {}
  const consumerKey = cfg.consumer_key || process.env.MPESA_CONSUMER_KEY
  const consumerSecret = cfg.consumer_secret || process.env.MPESA_CONSUMER_SECRET
  const shortcode = cfg.shortcode || process.env.MPESA_SHORTCODE
  const passkey = cfg.passkey || process.env.MPESA_PASSKEY
  const callbackUrl = cfg.callback_url || process.env.MPESA_CALLBACK_URL
  if (!consumerKey || !consumerSecret || !shortcode || !passkey)
    throw new functions.https.HttpsError('failed-precondition', 'M-Pesa not configured')
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64')
  const tokenRes = await axios.get('https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', { headers: { Authorization: `Basic ${auth}` } })
  const accessToken = tokenRes.data.access_token
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14)
  const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64')
  const normalizedPhone = phone.replace(/^0/, '254').replace(/^\+/, '')
  const stkRes = await axios.post('https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
    BusinessShortCode: shortcode, Password: password, Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline', Amount: Math.round(amount),
    PartyA: normalizedPhone, PartyB: shortcode, PhoneNumber: normalizedPhone,
    CallBackURL: callbackUrl, AccountReference: invData.invoice_number || invoice_id,
    TransactionDesc: `Payment for invoice ${invData.invoice_number}`,
  }, { headers: { Authorization: `Bearer ${accessToken}` } })
  await db.collection('payments').add({
    invoice_id, patient_id: invData.patient_id, amount, method: 'mpesa', status: 'pending',
    reference: stkRes.data.CheckoutRequestID, received_by: context.auth.uid,
    institution_id: invData.institution_id || '', created_at: admin.firestore.FieldValue.serverTimestamp(),
  })
  return { checkoutRequestId: stkRes.data.CheckoutRequestID, merchantRequestId: stkRes.data.MerchantRequestID }
})

export const mpesaCallback = functions.https.onRequest(async (req, res) => {
  try {
    const callback = req.body?.Body?.stkCallback
    if (!callback) { res.status(400).send('Invalid'); return }
    const checkoutId = callback.CheckoutRequestID
    const resultCode = callback.ResultCode
    const snap = await db.collection('payments').where('reference', '==', checkoutId).where('status', '==', 'pending').limit(1).get()
    if (snap.empty) { res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' }); return }
    const paymentDoc = snap.docs[0]
    const payment = paymentDoc.data()
    if (resultCode === 0) {
      const metadata = callback.CallbackMetadata?.Item || []
      const receipt = metadata.find((i: { Name: string }) => i.Name === 'MpesaReceiptNumber')?.Value
      await paymentDoc.ref.update({ status: 'completed', mpesa_receipt: receipt || '', updated_at: admin.firestore.FieldValue.serverTimestamp() })
      const invRef = db.collection('invoices').doc(payment.invoice_id)
      await db.runTransaction(async (tx) => {
        const inv = await tx.get(invRef)
        if (!inv.exists) return
        const d = inv.data()!
        const newPaid = (d.amount_paid || 0) + payment.amount
        const newBalance = (d.total || 0) - newPaid
        tx.update(invRef, { amount_paid: newPaid, balance: newBalance, status: newBalance <= 0 ? 'paid' : 'partial', updated_at: admin.firestore.FieldValue.serverTimestamp() })
      })
    } else {
      await paymentDoc.ref.update({ status: 'failed', updated_at: admin.firestore.FieldValue.serverTimestamp() })
    }
    res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' })
  } catch (e) { console.error(e); res.status(500).send('Error') }
})
