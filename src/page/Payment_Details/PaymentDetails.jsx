import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import PaymentDetailsForm from "./PaymentDetailsForm"
import { auth, db } from '@/FirebaseConfig'
import { doc, getDoc } from 'firebase/firestore'
import { useEffect, useState } from 'react'

const PaymentDetails = () => {
  const [details, setDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(u => { setUser(u); if (!u) setLoading(false) })
    return () => unsub()
  }, [])

  const loadDetails = async () => {
    if (!user) return
    setLoading(true)
    try {
      const snap = await getDoc(doc(db, 'paymentDetails', user.uid))
      if (snap.exists()) setDetails(snap.data())
      else setDetails(null)
    } catch(e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { if (user) loadDetails() }, [user])

  const maskAccount = (num) => {
    if (!num) return '**************'
    return num.length > 4 ? '**************' + num.slice(-4) : num
  }

  if (!user) return <div className="px-20 py-20 text-center text-gray-500">Please log in to view payment details</div>
  if (loading) return <div className="px-20 py-20 text-center">Loading...</div>

  return (
    <div className="px-20">
      <h1 className="text-3xl font-bold py-10">Payment Details</h1>

      {details ? (
        <Card>
          <CardHeader>
            <CardTitle>{details.bankName}</CardTitle>
            <CardDescription>A/C No {maskAccount(details.accountNumber)}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <p className="w-32">A/C Holder</p>
              <p className="text-gray-400"> : {details.accountHolderName}</p>
            </div>
            <div className="flex items-center">
              <p className="w-32">Bank ID</p>
              <p className="text-gray-400"> : {details.bankId}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No payment details</CardTitle>
            <CardDescription>You haven't added any payment details yet.</CardDescription>
          </CardHeader>
        </Card>
      )}

      <Dialog>
        <DialogTrigger>
          <Button className="py-6 mt-4">
            {details ? 'Update payment details' : 'Add payment details'}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
          </DialogHeader>
          <PaymentDetailsForm onSuccess={loadDetails} />
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default PaymentDetails
