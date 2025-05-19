import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useNavigate } from 'react-router-dom'
import { registerUser } from '@/FirebaseConfig'
import { useAuth } from '@/lib/AuthContext'
import { useState, useCallback } from 'react'

// 定义表单验证规则
const formSchema = z.object({
  name: z.string().min(2, { message: '用户名至少需要2个字符' }),
  email: z.string().email({ message: '请输入有效的邮箱地址' }),
  password: z.string().min(6, { message: '密码至少需要6个字符' })
})

const SignupForm = () => {
    const navigate = useNavigate()
    const { login } = useAuth()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const form = useForm({
       resolver: zodResolver(formSchema),
        defaultValues:{
            name: "",
            email: "",
            password: "",
        } 
    })

    const getErrorMessage = (errorCode) => {
      switch(errorCode) {
        case 'auth/email-already-in-use':
          return '该邮箱已被注册，请使用其他邮箱或直接登录';
        case 'auth/invalid-email':
          return '邮箱格式不正确';
        case 'auth/weak-password':
          return '密码强度太弱';
        case 'auth/network-request-failed':
          return '网络连接失败，请检查您的网络';
        case 'auth/too-many-requests':
          return '操作过于频繁，请稍后再试';
        case 'auth/operation-not-allowed':
          return '此登录方式未启用';
        default:
          return errorCode || '注册出现问题，请稍后再试';
      }
    };

    const onSubmit = useCallback(async (data) => {
        if (loading) return;
        setLoading(true);
        setError('');
        
        try {
            const { user, error: registerError } = await registerUser(data.email, data.password);
            
            if (registerError) {
                // 提取Firebase错误代码并获取友好消息
                const errorCode = registerError.split('(')[1]?.split(')')[0] || '';
                setError(getErrorMessage(errorCode));
                setLoading(false);
                return;
            }

            if (user) {
                // 注册成功，使用AuthContext登录
                login({
                    uid: user.uid,
                    email: user.email,
                    name: data.name
                });
                
                // 使用一个短暂的延迟，确保状态更新完成
                setTimeout(() => {
                    navigate('/');
                }, 100);
            } else {
                setLoading(false);
            }
        } catch (err) {
            console.error('Registration error:', err);
            setError('注册过程中出现错误，请稍后再试');
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
                name="name"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                        <Input 
                        className="border w-full border-gray-700 p-5"
                        placeholder="Your name" {...field} />
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
                    {loading ? 'Creating account...' : 'Sign Up'}
                </Button>
            </form>
        </Form>
    </div>
  )
}

export default SignupForm