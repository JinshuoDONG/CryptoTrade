import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { Avatar, AvatarImage } from "@radix-ui/react-avatar"
import { BookmarkFilledIcon } from "@radix-ui/react-icons"
import { BookmarkIcon, DotIcon } from "lucide-react"
import StockChart from "../Home/StockChart"
import TreadingForm from "./TreadingForm"
const StockDetails = () => {
  return (
    <div className="p-5 mt-5" >
      <div className="flex justify-between">
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
        <div className="flex items-center gap-4">
          <Button>
            {true?(<BookmarkFilledIcon className="h-6 w-6"/>):
            (<BookmarkIcon className="h-6 w-6"/>)}
          </Button>
          <Dialog>
            <DialogTrigger>
              <Button size="lg">Tread</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>How much u wanna spend?</DialogTitle>
                
              </DialogHeader>
              <TreadingForm/>
            </DialogContent>
          </Dialog>

        </div>
      </div>
      <div className="mt-14">
          <StockChart />
      </div>
    
    </div>
    
  )
}

export default StockDetails