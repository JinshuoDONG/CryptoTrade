import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DialogClose } from '@radix-ui/react-dialog'
import React from 'react'
import { auth } from '../../FirebaseConfig'
import { transferMoney } from './walletService'

const TransferForm = ({ onSuccess, onError, currentBalance }) => {
  const [formData, setFormData] = React.useState({
    amount: '',
    walletId: '',
    purpose: ''
  })
  const [isLoading, setIsLoading] = React.useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    const user = auth.currentUser;
    if (!user) {
      onError('Please log in first')
      return
    }

    const amount = parseFloat(formData.amount)
    if (!amount || amount <= 0) {
      onError('Please enter a valid transfer amount')
      return
    }
    if (amount > currentBalance) {
      onError('Transfer amount cannot exceed current balance')
      return
    }
    if (!formData.walletId.trim()) {
      onError('Please enter the target wallet ID')
      return
    }

    try {
      setIsLoading(true)
      onError('')

      const result = await transferMoney(user.uid, amount, formData.walletId.trim())

      if (result.success) {
        setFormData({ amount: '', walletId: '', purpose: '' })
        if (onSuccess) await onSuccess()
      }
    } catch (error) {
      console.error('Transfer failed:', error)
      onError(error.message || 'Transfer failed, please try again')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='pt-10 space-y-5'>
      <div className="bg-gray-50 p-3 rounded-md">
        <p className="text-sm text-gray-600">Available Balance: <span className="font-semibold">${currentBalance?.toFixed(2) || '0.00'}</span></p>
      </div>

      <div>
        <h1 className='pb-1'>Enter Amount</h1>
        <Input
          name="amount"
          onChange={handleChange}
          value={formData.amount}
          className="py-7"
          placeholder="$100"
          type="text"
          disabled={isLoading}
        />
      </div>

      <div>
        <h1 className='pb-1'>Target Wallet ID</h1>
        <Input
          name="walletId"
          onChange={handleChange}
          value={formData.walletId}
          className="py-7"
          placeholder="#wallet123"
          disabled={isLoading}
        />
      </div>

      <div>
        <h1 className='pb-1'>Purpose (optional)</h1>
        <Input
          name="purpose"
          onChange={handleChange}
          value={formData.purpose}
          className="py-7"
          placeholder="gift for a friend"
          disabled={isLoading}
        />
      </div>

      <Button
        onClick={handleSubmit}
        className="w-full py-7"
        disabled={isLoading || !formData.amount || !formData.walletId || parseFloat(formData.amount) <= 0 || parseFloat(formData.amount) > currentBalance}
      >
        {isLoading ? 'Processing...' : `Transfer $${formData.amount || '0'}`}
      </Button>
    </div>
  )
}

export default TransferForm
