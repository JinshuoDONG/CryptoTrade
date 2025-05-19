import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useState } from 'react'
import { getAuth, sendPasswordResetEmail } from 'firebase/auth'

// 定义表单验证规则
const formSchema = z.object({
  email: z.string().email({ message: '请输入有效的邮箱地址' })
})

const ForgotPasswordForm = () => {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: ""
    }
  })

  const onSubmit = async (data) => {
    setLoading(true)
    setMessage('')
    setError('')

    try {
      const auth = getAuth()
      await sendPasswordResetEmail(auth, data.email)
      setMessage('密码重置邮件已发送，请查收邮箱')
      form.reset()
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        setError('此邮箱未注册账号')
      } else {
        setError('发送重置邮件失败，请稍后再试')
      }
      console.error('Password reset error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='px-10 py-2'>
      <h2 className="text-2xl font-semibold mb-6 text-center">重置密码</h2>
      <p className="text-gray-600 mb-6 text-center">
        请输入您的邮箱地址，我们将发送密码重置链接
      </p>

      <Form {...form}>
        <form
          className='space-y-6'
          onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>邮箱地址</FormLabel>
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

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          {message && (
            <div className="text-green-500 text-sm">{message}</div>
          )}

          <Button
            type="submit"
            className="w-full py-5"
            disabled={loading}
          >
            {loading ? '发送中...' : '发送重置链接'}
          </Button>
        </form>
      </Form>
    </div>
  )
}

export default ForgotPasswordForm