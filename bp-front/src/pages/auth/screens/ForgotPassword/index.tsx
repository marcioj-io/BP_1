import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Mail } from 'lucide-react'
import { useForm } from 'react-hook-form'
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
import { InputWithIcon } from '@/components/ui/input-with-icon'
import { cn } from '@/lib/utils'
import { TCustomError } from '@/types/responseError'

import { useForgotPassword } from '../../hooks'

const formSchema = z.object({
  email: z
    .string({ required_error: 'E-mail é obrigatório!' })
    .email({
      message: 'E-mail inválido!'
    })
    .min(2)
    .max(50)
})

export function ForgotPassword() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: ''
    }
  })

  const {
    formState: { isSubmitting, isDirty },
    reset
  } = form

  const { mutateAsync: forgotPassword, isPending } = useForgotPassword()

  const onSubmit = async (formObj: z.infer<typeof formSchema>) => {
    try {
      await forgotPassword(formObj)
      toast.success(
        'Enviamos as instruções para recuperação da sua senha no seu email'
      )
      reset()
    } catch (error) {
      console.error('🔥 ~ onSubmit ~ error:', error)
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
          Digite seu endereço de e-mail cadastrado. Você receberá um link por
          e-mail para criar uma nova senha.
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
