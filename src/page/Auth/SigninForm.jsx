import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useForm } from 'react-hook-form'

const SigninForm = () => {
    const form = useForm({
       resolver:"",
        defaultValues:{
            Name:"",
            email:"",
            password:"",
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
                name="Name"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Name</FormLabel>
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
                name="email"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Email</FormLabel>
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
                name="password"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                        <Input 
                        className="border w-full border-gray-700 p-5"
                        placeholder="*********" {...field} />
                    </FormControl>
                    
                    <FormMessage />
                    </FormItem>
                )}
                />
          
                
                    <Button type="submit" className="w-full py-5">
                    Submit
                </Button>

                
            </form>
        </Form>
    </div>
  )
}

export default SigninForm