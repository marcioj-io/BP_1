import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Mail } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage
} from '@/components/ui/form'
import { InputWithIcon } from '@/components/ui/input-with-icon'
import { PasswordInput } from '@/components/ui/password-input'
import { ROUTES } from '@/constants'
import { cn } from '@/lib/utils'

import { useAuth } from '../../hooks'

const formSchema = z.object({
  email: z
    .string({ required_error: 'E-mail é obrigatório!' })
    .email({
      message: 'E-mail inválido!'
    })
    .min(2)
    .max(50),
  password: z
    .string({ required_error: 'Senha é obrigatória!' })
    .min(5, { message: 'Senha é obrigatória!' })
    .max(50)
})

export const Login = () => {
  const navigate = useNavigate()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  })

  const {
    formState: { isSubmitting, isDirty }
  } = form

  const { login, isLoading, isError } = useAuth()

  useEffect(() => {
    if (isError) {
      form.setError('email', {
        type: 'manual',
        message: 'E-mail inválido!'
      })

      form.setError('password', {
        type: 'manual',
        message: 'Senha inválida!'
      })
    }
  }, [isError, form])

  function onSubmit(values: z.infer<typeof formSchema>) {
    login(values)
  }

  const forgotPassword = () => navigate(ROUTES.AUTH.FORGOT_PASSWORD)

  return (
    <Form {...form}>
      <h1 className="mb-10 text-2xl font-semibold text-brand-tertiary">
        Faça seu login
      </h1>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-[350px] space-y-4"
        noValidate
      >
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field, fieldState: { error } }) => (
              <FormItem>
                <FormControl>
                  <InputWithIcon
                    className={cn('py-3 text-base', error && 'border-danger')}
                    type="email"
                    placeholder="Digite seu e-mail"
                    autoComplete="username"
                    icon={Mail}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field, fieldState: { error } }) => (
              <FormItem>
                <FormControl>
                  <PasswordInput
                    className={cn('py-3 text-base', error && 'border-danger')}
                    placeholder="Digite sua senha"
                    type="password"
                    autoComplete="current-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div
          className="cursor-pointer text-center text-sm text-brand-tertiary underline transition-all hover:text-brand/90"
          onClick={forgotPassword}
        >
          Esqueci minha senha
        </div>

        <Button
          type="submit"
          disabled={isSubmitting || !isDirty}
          className="w-full"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Entrar'}
        </Button>
      </form>
    </Form>
  )
}
