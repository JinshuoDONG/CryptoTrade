import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useNavigate } from 'react-router-dom'
import { loginUser } from '@/FirebaseConfig'
import { useAuth } from '@/lib/AuthContext'
import { useState, useCallback } from 'react'

// 定义表单验证规则
const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(1, { message: 'Please enter your password' })
})

const SigninForm = () => {
    const navigate = useNavigate()
    const { login } = useAuth()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const form = useForm({
       resolver: zodResolver(formSchema),
        defaultValues:{
            email: "",
            password: "",
        } 
    })

    const getErrorMessage = (errorCode) => {
      switch(errorCode) {
        case 'auth/invalid-credential':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          return 'Incorrect email or password';
        case 'auth/invalid-email':
          return 'Invalid email format';
        case 'auth/user-disabled':
          return 'This account has been disabled';
        case 'auth/too-many-requests':
          return 'Too many login attempts, please try again later';
        case 'auth/network-request-failed':
          return 'Network connection failed, please check your internet';
        default:
          return errorCode || 'Login failed, please try again later';
      }
    };

    const onSubmit = useCallback(async (data) => {
        if (loading) return;
        setLoading(true);
        setError('');

        try {
            const { user, error: loginError } = await loginUser(data.email, data.password);
            
            if (loginError) {
                // 提取Firebase错误代码并获取友好消息
                const errorCode = loginError.split('(')[1]?.split(')')[0] || '';
                setError(getErrorMessage(errorCode));
                setLoading(false);
                return;
            }

            if (user) {
                // 登录成功，使用AuthContext登录
                login({
                    uid: user.uid,
                    email: user.email,
                    name: user.displayName || data.email.split('@')[0]
                });
                
                // 使用一个短暂的延迟，确保状态更新完成
                setTimeout(() => {
                    navigate('/');
                }, 100);
            } else {
                setLoading(false);
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('An error occurred during login, please try again later');
            setLoading(false);
        }
    }, [loading, login, navigate]);

    return (
    <div className='px-10 py-2'>
        <Form {...form}>
            <form 
            className='space-y-6'
            onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                        <Input 
                        type="email"
                        className="border w-full border-gray-700 p-5"
                        placeholder="your.email@example.com" {...field} />
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
                        type="password"
                        className="border w-full border-gray-700 p-5"
                        placeholder="******" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
          
                {error && (
                    <div className="text-red-500 text-sm p-2 bg-red-50 border border-red-200 rounded-md">
                      {error}
                    </div>
                )}
                
                <Button 
                    type="submit" 
                    className="w-full py-5"
                    disabled={loading}
                >
                    {loading ? 'Signing in...' : 'Sign In'}
                </Button>
            </form>
        </Form>
    </div>
  )
}

export default SigninForm