import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarImage } from "@radix-ui/react-avatar"
import { DotIcon } from "lucide-react"
import { useState } from "react"

const TreadingForm = () => {

  const [orderType,setOrderType]=useState("BUY")

    const handleChange =()=>{

    }
  return (
    <div className="space-y-10 p-5">
      <div>
        <div className="flex gap-4 items-center justify-between">
          <Input
            className="py-7 focus:outline-none"
            placeholder="Enter Amount"
            onChange={handleChange}
            type="number"
            name="amount"
          />
          <div>
                <p className="border text-2xl flex justify-center items-center w-36 h-14 rounded-md">
                    4563
                </p>
                </div>

        </div>

        { false && <h1 className="text-red-600 text-center pt-4">Insufficient wallet balance to buy</h1>}
      
      </div>
      <div className="flex gap-5 items-center">
          <div  className="w-[100px]">
            <Avatar >
              <AvatarImage
              src={
                "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Bitcoin.svg/800px-Bitcoin.svg.png"
              }
              />
            </Avatar>
          </div>
          <div>
            <div className="flex items-center gap-2">
                <p>BTC</p>
                <DotIcon className="text-gray-600"/>
                <p className="text-gray-600">Bitcoin</p>

            </div>
            <div className="flex items-end gap-2">
               <p className="text-xl font-bold">$6954</p>       
               <p className="text-red-600">
               
                  <span>-1319049822.578</span>
                  <span>(-0.29803%)</span>
             
             

               </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
              <p>Order Type</p>
              <p>Market Order</p>
        </div>

        <div className="flex items-center justify-between">
              <p>{orderType=="BUY"?"Available Case":"Available Quantity"}</p>
              <p>{orderType=="BUY"?9000:23.08}</p>
        </div>
        <div>
          <Button className="w-full py-6">
            {orderType}
          </Button>
          <Button className="w-full py-6" onClick={()=>setOrderType(orderType=="BUY"?"SELL":"BUY")}>
            {orderType=="BUY"?"Or Sell":"Or Buy"}
          </Button>
        </div>
    </div>
  )
}

export default TreadingForm
