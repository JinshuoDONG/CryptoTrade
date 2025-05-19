import { Button } from "@/components/ui/button"
import { Input } from '@/components/ui/input'
import { DotFilledIcon } from '@radix-ui/react-icons'
import { Label } from '@radix-ui/react-label'
import { RadioGroup, RadioGroupItem } from '@radix-ui/react-radio-group'
import React from 'react'


const TopupForm = () => {
  const [amount, setAmount] = React.useState('')
  const [paymentMethod, setPaymentMethod] = React.useState("RAZORPAY")
  const handlePaymentMethodChange = (value) => {
    setPaymentMethod(value)
  }
  const handleChange =(e)=>{
    setAmount(e.target.value)
  }

  const handleSubmit =()=>{
    console.log(amount,paymentMethod)
  }

  return (
    <div className='pt-10 space-y-5'>
      <div>
        <h1 className='pb-1'>Enter Amount</h1>
        <Input
          onChange={handleChange}
          value={amount}
          className='py-7 text-lg'
          placeholder="$9999"
        />
      </div>

      <div>
        <h1 className='pb-1'>Select payment method</h1>
        <RadioGroup
        onValueChange={(value)=>handlePaymentMethodChange(value)}
        className='flex' 
        defaultValue='RAZORPAY'>

          <div className='flex items-center space-x-2 border p-3 px-5 rounded-md '>
            <RadioGroupItem
            icon={DotFilledIcon}
            className="h-9 w-9"
            value="RAZORPAY"
            id="r1"
            />
            {/* <DotFilledIcon className="text-green-700 w-6 h-6" /> */}
            <Label htmlFor="r1">
                <div className='bg-white rounded-md px-5 w-32'>
                  <img className="h-10" src="https://play-lh.googleusercontent.com/quzvssC112NXIlt4YBkclEo7f9ZnhaNtZ5fvaCs_P19X7KL71DiUqd2ysR8ZHsTaRTY"
                  alt=""/>
                </div>
            </Label>
          </div>
          <div className='flex items-center space-x-2 border p-3 px-5 rounded-md '>
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
                  alt=""/>
                </div>
            </Label>
          </div>
        </RadioGroup>
      </div>
      <Button onClick={handleSubmit} className="w-full py-7">
        Submit
      </Button>
    </div>
  )
}


export default TopupForm