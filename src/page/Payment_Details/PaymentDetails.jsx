import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import PaymentDetailsForm from "./PaymentDetailsForm"

const PaymentDetails = () => {
  return (
    <div className="px-20">
      <h1 className="text-3xl font-bold py-10">Payment Details</h1>

      <Card>
        <CardHeader>
          <CardTitle>
            Some Bank
          </CardTitle>
          <CardDescription>
            A/C No
            **************1081
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <p className="w-32">A/C Holder</p>
            <p className="text-gray-400"> : Yuan</p>
          </div>
          <div className="flex items-center">
            <p className="w-32">BankID</p>
            <p className="text-gray-400"> : FAKE0000007</p>
          </div>
        </CardContent>
      </Card>
      <Dialog>
      <DialogTrigger>
        <Button className="py-6">Add payment details</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Payment Detail</DialogTitle>

        </DialogHeader>

        <PaymentDetailsForm/>
      </DialogContent>
    </Dialog>

    </div>
  )
}

export default PaymentDetails
