import { Button } from "@/components/ui/button"
import { Input } from '@/components/ui/input'
import { DotFilledIcon } from '@radix-ui/react-icons'
import { Label } from '@radix-ui/react-label'
import { RadioGroup, RadioGroupItem } from '@radix-ui/react-radio-group'
import { DialogClose } from '@radix-ui/react-dialog'
import React from 'react'
import { auth } from '../../FirebaseConfig'
import { addMoney } from './walletService'

const TopupForm = ({ onSuccess, onError, currentBalance }) => {
  const [amount, setAmount] = React.useState('')
  const [paymentMethod, setPaymentMethod] = React.useState("RAZORPAY")
  const [isLoading, setIsLoading] = React.useState(false)
  const [closeDialog, setCloseDialog] = React.useState(false)

  const handlePaymentMethodChange = (value) => {
    setPaymentMethod(value)
  }

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
      onError('Please enter a valid top-up amount')
      return
    }

    if (parseFloat(amount) > 10000) {
      onError('Single top-up amount cannot exceed $10,000')
      return
    }

    try {
      setIsLoading(true)
      onError('') // Clear previous error messages

      const result = await addMoney(user.uid, amount, paymentMethod)
      
      if (result.success) {
        // Reset form
        setAmount('')
        setPaymentMethod("RAZORPAY")
        
        // Call success callback to refresh data
        if (onSuccess) {
          await onSuccess()
        }
        
        // Close dialog
        setCloseDialog(true)
      }
    } catch (error) {
      console.error('Top-up failed:', error)
      onError(error.message || 'Top-up failed, please try again')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='pt-10 space-y-5'>
      {/* Display current balance */}
      <div className="bg-gray-50 p-3 rounded-md">
        <p className="text-sm text-gray-600">Current Balance: <span className="font-semibold">${currentBalance?.toFixed(2) || '0.00'}</span></p>
      </div>

      <div>
        <h1 className='pb-1'>Enter Top-up Amount</h1>
        <Input
          onChange={handleChange}
          value={amount}
          className='py-7 text-lg'
          placeholder="Enter amount, e.g.: 100"
          type="text"
          disabled={isLoading}
        />
        {amount && parseFloat(amount) > 0 && (
          <p className="text-sm text-gray-500 mt-1">
            Balance after top-up: ${(currentBalance + parseFloat(amount)).toFixed(2)}
          </p>
        )}
      </div>

      {/* <div>
        <h1 className='pb-1'>Select Payment Method</h1>
        <RadioGroup
          onValueChange={(value) => handlePaymentMethodChange(value)}
          className='flex' 
          defaultValue='RAZORPAY'
          disabled={isLoading}
        >
          <div className='flex items-center space-x-2 border p-3 px-5 rounded-md'>
            <RadioGroupItem
              icon={DotFilledIcon}
              className="h-9 w-9"
              value="RAZORPAY"
              id="r1"
            />
            <Label htmlFor="r1">
              <div className='bg-white rounded-md px-5 w-32'>
                <img 
                  className="h-10" 
                  src="https://play-lh.googleusercontent.com/quzvssC112NXIlt4YBkclEo7f9ZnhaNtZ5fvaCs_P19X7KL71DiUqd2ysR8ZHsTaRTY"
                  alt="Razorpay"
                />
              </div>
            </Label>
          </div>
          
          <div className='flex items-center space-x-2 border p-3 px-5 rounded-md'>
            <RadioGroupItem
              icon={DotFilledIcon}
              className="h-9 w-9"
              value="STRIPE"
              id="r2"
            />
            <Label htmlFor="r2">
              <div className='bg-white rounded-md px-5 w-32'>
                <img 
                  className="h-10" 
                  src="https://images-eds-ssl.xboxlive.com/image?url=4rt9.lXDC4H_93laV1_eHM0OYfiFeMI2p9MWie0CvL99U4GA1gf6_kayTt_kBblFwHwo8BW8JXlqfnYxKPmmBcK6aS1DC.PdksjndFddPxM_YjAk9P4G6ogSEeo8jj0BvtFXOhr9zUonigSWU.S3ka6QsYe6IK0JhFNqgfsKtPI-&format=source"
                  alt="Stripe"
                />
              </div>
            </Label>
          </div>
        </RadioGroup>
      </div> */}
{/* <div className="text-xs text-gray-500 space-y-1">
        <p>• Minimum Top-up Amount: $1</p>
        <p>• Maximum Top-up Amount: $10,000</p>
        <p>• Top-up usually arrives within 1-5 minutes</p>
      </div> */}

      {closeDialog ? (
        <DialogClose className="w-full">
          <Button className="w-full py-7" disabled>
            Top-up Successful
          </Button>
        </DialogClose>
      ) : (
        <Button 
          onClick={handleSubmit} 
          className="w-full py-7"
          disabled={isLoading || !amount || parseFloat(amount) <= 0}
        >
          {isLoading ? 'Processing...' : `Top Up $${amount || '0'}`}
        </Button>
      )}
    </div>
  )
}

export default TopupForm