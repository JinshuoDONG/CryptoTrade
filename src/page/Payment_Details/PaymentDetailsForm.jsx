import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { DialogClose } from '@radix-ui/react-dialog'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { auth, db } from '@/FirebaseConfig'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { useState, useEffect } from 'react'

const formSchema = z.object({
  accountHolderName: z.string().min(1, 'Required'),
  bankId: z.string().min(1, 'Required'),
  accountNumber: z.string().min(1, 'Required'),
  confirmAccountNumber: z.string().min(1, 'Required'),
  bankName: z.string().min(1, 'Required'),
})

const PaymentDetailsForm = ({ onSuccess }) => {
    const [loading, setLoading] = useState(false)
    const form = useForm({
       resolver: zodResolver(formSchema),
        defaultValues: {
            accountHolderName: "",
            bankId: "",
            accountNumber: "",
            confirmAccountNumber: "",
            bankName: ""
        }
    })

    useEffect(() => {
      // 加载已有数据
      const load = async () => {
        const user = auth.currentUser
        if (!user) return
        const snap = await getDoc(doc(db, 'paymentDetails', user.uid))
        if (snap.exists()) {
          const d = snap.data()
          form.reset({
            accountHolderName: d.accountHolderName || '',
            bankId: d.bankId || '',
            accountNumber: d.accountNumber || '',
            confirmAccountNumber: d.accountNumber || '',
            bankName: d.bankName || '',
          })
        }
      }
      load()
    }, [form])

    const onSubmit = async (data) => {
      if (data.accountNumber !== data.confirmAccountNumber) {
        form.setError('confirmAccountNumber', { message: 'Account numbers do not match' })
        return
      }
      const user = auth.currentUser
      if (!user) return

      setLoading(true)
      try {
        await setDoc(doc(db, 'paymentDetails', user.uid), {
          accountHolderName: data.accountHolderName,
          bankId: data.bankId,
          accountNumber: data.accountNumber,
          bankName: data.bankName,
          updatedAt: serverTimestamp()
        })
        if (onSuccess) await onSuccess()
      } catch (e) {
        console.error('Save payment details error:', e)
      } finally {
        setLoading(false)
      }
    }

    return (
    <div className='px-10 py-2'>
        <Form {...form}>
            <form className='space-y-6' onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                control={form.control}
                name="accountHolderName"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Account Holder Name</FormLabel>
                    <FormControl>
                        <Input className="border w-full border-gray-700 p-5" placeholder="Yuan" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="bankId"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Bank ID</FormLabel>
                    <FormControl>
                        <Input className="border w-full border-gray-700 p-5" placeholder="BANK00123456" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="accountNumber"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Account Number</FormLabel>
                    <FormControl>
                        <Input className="border w-full border-gray-700 p-5" placeholder="*********" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="confirmAccountNumber"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Confirm Account Number</FormLabel>
                    <FormControl>
                        <Input className="border w-full border-gray-700 p-5" placeholder="" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="bankName"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Bank Name</FormLabel>
                    <FormControl>
                        <Input className="border w-full border-gray-700 p-5" placeholder="Some Bank" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <DialogClose className='w-full'>
                    <Button type="submit" className="w-full py-5" disabled={loading}>
                        {loading ? 'Saving...' : 'Submit'}
                    </Button>
                </DialogClose>
            </form>
        </Form>
    </div>
  )
}

export default PaymentDetailsForm
