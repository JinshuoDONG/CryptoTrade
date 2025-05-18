import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { DialogClose } from '@radix-ui/react-dialog'
import { useForm } from 'react-hook-form'

const PaymentDetailsForm = () => {
    const form = useForm({
       resolver:"",
        defaultValues:{
            accountHolderName:"",
            BankID:"",
            accountNumber:"",
            bankName:""
        } 
    })
    const onSubmit=(data)=>{
        console.log(data)
    }
    return (
    <div className='px-10 py-2'>
        <Form {...form}>
            <form 
            className='space-y-6'
            onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                control={form.control}
                name="accountHolderName"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Account Holder Name</FormLabel>
                    <FormControl>
                        <Input 
                        
                        className="border w-full border-gray-700 p-5"
                        placeholder="Yuan" {...field} />
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
                    <FormLabel>BankID</FormLabel>
                    <FormControl>
                        <Input 
                        className="border w-full border-gray-700 p-5"
                        placeholder="**********" {...field} />
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
                        <Input 
                        className="border w-full border-gray-700 p-5"
                        placeholder="*********" {...field} />
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
                        <Input 
                        className="border w-full border-gray-700 p-5"
                        placeholder="" {...field} />
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
                        <Input 
                        className="border w-full border-gray-700 p-5"
                        placeholder="Some Bank" {...field} />
                    </FormControl>
                    
                    <FormMessage />
                    </FormItem>
                )}
                />
                <DialogClose className='w-full'>
                    <Button type="submit" className="w-full py-5">
                    Submit
                </Button>
                </DialogClose>
                
            </form>
        </Form>
    </div>
  )
}

export default PaymentDetailsForm