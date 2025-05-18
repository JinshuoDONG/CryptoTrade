import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { VerifiedIcon } from 'lucide-react'
import AccountVerificationForm from './AccountVerificationForm'


const Profile = () => {

  const handleEnableTwoStepVerification=()=>{
    console.log("two step verification")
  }

  return (
    <div className='flex flex-col items-center mb-5'>
      <div className='pt-10 w-full lg:w-[60%]'>
        <Card>
          <CardHeader className="pb-9">
            <CardTitle>Your info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='lg:flex gap-32'>
              <div className='space-y-7'>
                <div className='flex'>
                  <p className ="w-[9rem]">Email:</p>
                  <p className='text-gray-700'>grandeHotel@kth.se</p>
                </div>
                <div className='flex'>
                  <p className ="w-[9rem]">Name:</p>
                  <p className='text-gray-700'>Yuan</p>
                </div>
                <div className='flex'>
                  <p className ="w-[9rem]">Date of birth</p>
                  <p className='text-gray-700'>01/02/1970</p>
                </div>
                <div className='flex'>
                  <p className ="w-[9rem]">Nationality:</p>
                  <p className='text-gray-700'>China</p>
                </div>
              </div>
              <div className='space-y-7'>
                <div className='flex'>
                  <p className ="w-[9rem]">Address:</p>
                  <p className='text-gray-700'>kth entre</p>
                </div>
                <div className='flex'>
                  <p className ="w-[9rem]">PostCode:</p>
                  <p className='text-gray-700'>010101</p>
                </div>
                <div className='flex'>
                  <p className ="w-[9rem]">Job:</p>
                  <p className='text-gray-700'>Lost</p>
                </div>
                <div className='flex'>
                  <p className ="w-[9rem]">Height:</p>
                  <p className='text-gray-700'>180cm</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className='mt-6'>
          <Card className="w-full">
            <CardHeader className="pb-7">
              <div className='flex items-center gap-3'>
                <CardTitle>
                  2 step verification
                </CardTitle>
                {true ? <Badge
                className={"space-x-2 text-white bg-blue-600"}>
                  <VerifiedIcon/>
                  <span>Enabled</span>
                  </Badge> : <Badge className="bg-orange-600">
                  Disabled
                </Badge>}
                
              </div>
            </CardHeader>
            <CardContent>
              <div>
              <Dialog>
              <DialogTrigger>
                <Button>Enabled two step Verification</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Verify ur account?</DialogTitle>
                  
                </DialogHeader>
                <AccountVerificationForm handleSubmit={handleEnableTwoStepVerification}/>
              </DialogContent>
            </Dialog>

              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Profile