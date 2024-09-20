import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage
} from '@/components/ui/form'
import { PasswordInput } from '@/components/ui/password-input'
import { ROUTES } from '@/constants'
import { REGEX } from '@/helpers'
import { cn } from '@/lib/utils'
import { TCustomError } from '@/types/responseError'

import { useRecoverPassword } from '../../hooks'

const formSchema = z
  .object({
    newPassword: z
      .string({ required_error: 'Senha é obrigatória!' })
      .min(8, {
        message: 'Sua senha deve ter pelo menos oito caracteres.'
      })
      .regex(REGEX.PASSWORD, {
        message:
          'Sua senha deve ter letras maiúsculas, minúsculas, números e símbolos.'
      }),
    confirmNewPassword: z.string({
      required_error: 'Confirmação de senha é obrigatória!'
    })
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'As senhas digitadas não correspondem',
    path: ['confirmNewPassword']
  })

export function RecoverPassword() {
  const navigate = useNavigate()

  const [token, setToken] = useState<string>('')

  const getTokenFromUrl = async () => {
    try {
      const currentUrl = window.location.href
      const tokenRegex = /token=(.*)/
      const tokenMatch = currentUrl.match(tokenRegex)
      if (tokenMatch) {
        setToken(tokenMatch[1])
      }
    } catch (error) {
      console.error('getTokenFromUrl ~ error:', error)
    }
  }

  useEffect(() => {
    getTokenFromUrl()
  }, [])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newPassword: '',
      confirmNewPassword: ''
    }
  })

  const {
    formState: { isSubmitting, isDirty }
  } = form

  const { mutateAsync: recoverPassword, isPending } = useRecoverPassword()

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      if (token === null) {
        throw new Error('Token não encontrado na URL')
      }

      await recoverPassword({
        newPassword: data.newPassword,
        accessToken: token
      })

      toast.success('Senha alterada com sucesso!')
      navigate(ROUTES.AUTH.LOGIN)
    } catch (error) {
      const customError = error as TCustomError
      const message = customError.response.data.messages.join(',')
      toast.error(message)
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-brand-tertiary">
          Esqueceu sua senha?
        </h1>

        <p className="max-w-96 text-lg leading-8 text-neutral-600">
          Sua senha deve ter pelo menos seis caracteres. Para torná-la mais
          forte, use letras maiúsculas e minúsculas, números e símbolos como !
          &quot; ? $ % ^ &.
        </p>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-[350px] space-y-8"
          noValidate
        >
          <FormField
            control={form.control}
            name="newPassword"
            render={({ field, fieldState: { error } }) => (
              <FormItem>
                <FormControl>
                  <PasswordInput
                    className={cn('py-3 text-base', error && 'border-danger')}
                    type="password"
                    placeholder="Digite sua senha"
                    autoComplete="new-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmNewPassword"
            render={({ field, fieldState: { error } }) => (
              <FormItem>
                <FormControl>
                  <PasswordInput
                    className={cn('py-3 text-base', error && 'border-danger')}
                    type="password"
                    placeholder="Digite novamente a sua senha"
                    autoComplete="new-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={isSubmitting || !isDirty}
            className="w-full"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Redefinir Senha'
            )}
          </Button>
        </form>
      </Form>
    </div>
  )
}
