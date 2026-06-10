import { Button } from '@/components/ui/button'
import { DialogClose } from '@radix-ui/react-dialog'
import React from 'react'
import { auth } from '../../FirebaseConfig'
import { withdrawMoney } from './walletService'

const WithdrawalForm = ({ onSuccess, onError, currentBalance }) => {
  const [amount, setAmount] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)
  const [closeDialog, setCloseDialog] = React.useState(false)

  const handleChange = (e) => {
    const value = e.target.value
    // Allow only numbers and decimal points
    if (/^\d*\.?\d*$/.test(value)) {
      setAmount(value)
    }
  }

  const handleSubmit = async () => {
    const user = auth.currentUser;
    
    if (!user) {
      onError('Please log in first')
      return
    }

    if (!amount || parseFloat(amount) <= 0) {
      onError('Please enter a valid withdrawal amount')
      return
    }

    if (parseFloat(amount) > currentBalance) {
      onError('Withdrawal amount cannot exceed current balance')
      return
    }


    try {
      setIsLoading(true)
      onError('') // Clear previous error messages

      const result = await withdrawMoney(user.uid, amount)
      
      if (result.success) {
        // Reset form
        setAmount('')
        
        // Call success callback to refresh data
        if (onSuccess) {
          await onSuccess()
        }
        
        // Close dialog
        setCloseDialog(true)
      }
    } catch (error) {
      console.error('Withdrawal failed:', error)
      onError(error.message || 'Withdrawal failed, please try again')
    } finally {
      setIsLoading(false)
    }
  }

  const maxWithdrawAmount = Math.min(currentBalance, 5000) // Limit maximum withdrawal amount to 5000

  return (
    <div className='pt-10 space-y-5'>
      {/* Display current balance */}
      <div className='bg-gray-50 p-3 rounded-md'>
        <div className='flex justify-between items-center'>
          <p className="text-sm text-gray-600">Available Balance:</p>
          <p className="font-semibold text-lg">${currentBalance?.toFixed(2) || '0.00'}</p>
        </div>
      </div>

      <div className='flex flex-col items-center'>
        <h1 className="mb-4">Enter Withdrawal Amount</h1>

        <div className='flex items-center justify-center w-full'>
          <input
            onChange={handleChange}
            value={amount}
            className="withdrawlInput py-7 border-none outline-none focus:outline-none 
            px-0 text-2xl text-center w-full" 
            placeholder="Enter amount, e.g.: 100" 
            type="text"
            disabled={isLoading}
          />
        </div>
        
        {amount && parseFloat(amount) > 0 && (
          <p className="text-sm text-gray-500 mt-2">
            Balance after withdrawal: ${(currentBalance - parseFloat(amount)).toFixed(2)}
          </p>
        )}
      </div>

      {/* Quick amount selection
      <div>
        <p className="text-sm text-gray-600 mb-2">Quick Select:</p>
        <div className="flex gap-2 flex-wrap">
          {[50, 100, 500, 1000].filter(amt => amt <= currentBalance).map(quickAmount => (
            <button
              key={quickAmount}
              onClick={() => setAmount(quickAmount.toString())}
              className="px-3 py-1 border rounded-md text-sm hover:bg-gray-100"
              disabled={isLoading}
            >
              ${quickAmount}
            </button>
          ))}
          {currentBalance > 10 && (
            <button
              onClick={() => setAmount(Math.min(currentBalance, maxWithdrawAmount).toString())}
              className="px-3 py-1 border rounded-md text-sm hover:bg-gray-100"
              disabled={isLoading}
            >
              All
            </button>
          )}
        </div>
      </div> */}

      <div>
        <p className='pb-2'>Withdraw to</p>
        <div className='flex items-center gap-5 border px-5 py-2 rounded-md'>
          <img
            className="h-8 w-8"
            src="https://cdn.pixabay.com/photo/2020/02/18/11/03/bank-4859142_1280.png"
            alt="Bank Account"
          />
          <div>
            <p className="text-xl font-bold">Your Bank Account</p>
            {/* <p className="text-xs text-gray-500">Funds will arrive within 1-3 business days</p> */}
          </div>
        </div>
      </div>

      {/* <div className="text-xs text-gray-500 space-y-1">
        <p>• Minimum Withdrawal Amount: $10</p>
        <p>• Maximum Withdrawal Amount: $5,000</p>
        <p>• Withdrawal Request Review Time: 1-3 business days</p>
        <p>• Withdrawal may incur a fee</p>
      </div> */}

      {closeDialog ? (
        <DialogClose className="w-full">
          <Button className="w-full py-7" disabled>
            Withdrawal Request Submitted
          </Button>
        </DialogClose>
      ) : (
        <Button 
          onClick={handleSubmit} 
          className="w-full py-7 text-xl"
          disabled={
            isLoading || 
            !amount || 
            parseFloat(amount) <= 0 || 
            parseFloat(amount) > currentBalance 
          }
        >
          {isLoading ? 'Processing...' : `Withdraw $${amount || '0'}`}
        </Button>
      )}
    </div>
  )
}

export default WithdrawalForm