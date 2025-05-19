import { Button } from '@/components/ui/button'
import { DialogClose } from '@radix-ui/react-dialog'
import React from 'react'


const WithdrawalForm = () => {
      const [amount, setAmount] = React.useState('')
     
      const handleChange =(e)=>{
        setAmount(e.target.value)
      }
    const handleSubmit=()=>{
        console.log(amount)
    }
    return (
      <div className='pt-10 space-y-5'>
        <div className='flex justify-between items-center ...'>
          <p>Available balance</p>
          <p>$9000</p>
        </div>
  
        <div className='flex flex-col items-center'>
          <h1>Enter Withdrawal amount</h1>

          <div className='flex items-center justify-center'>
            <input
            onChange ={handleChange}
            value={amount}
            className="withdrawlInput py-7 border-none outline-none focus:outline-none 
            px-0 text-2xl text-center" placeholder="$9999" type="number"
            />
          </div>
        </div>
        <div>
            <p className='pb-2'>Transfer to </p>
            <div className='flex items-center gap-5 border px-5 py-2 rounded-md'>
            <img
                    className="h-8 w-8"
                src="https://cdn.pixabay.com/photo/2020/02/18/11/03/bank-4859142_1280.png"
                alt=""
                />
                <div>
                <p className="text-xl font-bold">Some Bank</p>
                <p className="text-xs">************1651</p>
                </div>
            </div>
        </div>
        <DialogClose className="w-full">
        <Button onClick={handleSubmit} className="w-full py-7 text-xl">
            Withdraw
        </Button>  
        </DialogClose>
       
      </div>
    )
  }
  

export default WithdrawalForm