import { zodResolver } from '@hookform/resolvers/zod'
import { useAtom } from 'jotai'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { getProfile } from '@/api/auth/get-profile'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { PasswordInput } from '@/components/ui/password-input'
import { REGEX } from '@/helpers'
import { authAtom, AuthProps } from '@/store/user'
import { TCustomError } from '@/types/responseError'

import { useUpdatePassword } from '../../../hooks/useUpdatePassword'

const formSchema = z
  .object({
    actualPassword: z
      .string({ required_error: 'Senha atual é obrigatória!' })
      .min(3, 'Senha atual é obrigatória!'),
    newPassword: z
      .string({ required_error: 'Nova senha é obrigatória!' })
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

export const PasswordForm = () => {
  const [auth, setAuth] = useAtom(authAtom)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      actualPassword: '',
      newPassword: '',
      confirmNewPassword: ''
    }
  })

  const {
    formState: { isSubmitting, isDirty },
    reset
  } = form

  const { mutateAsync: updatePassword } = useUpdatePassword()

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      await updatePassword(data)

      if (auth?.token) {
        const authUser = await getProfile(auth?.token)
        setAuth((prev) => ({ ...prev, user: authUser }) as AuthProps)
      }

      toast.success('Senha atualizada com sucesso')
    } catch (error) {
      console.log('🔥 ~ onSubmit ~ error:', error)
      const customError = error as TCustomError
      const message = customError.response.data.messages.join(',')
      toast.error(message)
    } finally {
      reset()
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
        <div className="flex gap-2">
          <FormField
            control={form.control}
            name="actualPassword"
            render={({ field, fieldState: { error } }) => (
              <FormItem className="w-full">
                <FormLabel>Senha atual</FormLabel>
                <FormControl>
                  <PasswordInput
                    className={error && 'border-danger'}
                    placeholder="Digite a senha atual..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="newPassword"
            render={({ field, fieldState: { error } }) => (
              <FormItem className="w-full">
                <FormLabel>Nova senha</FormLabel>
                <FormControl>
                  <PasswordInput
                    className={error && 'border-danger'}
                    placeholder="Digite a nova senha..."
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
              <FormItem className="w-full">
                <FormLabel>Confirme a senha</FormLabel>
                <FormControl>
                  <PasswordInput
                    className={error && 'border-danger'}
                    placeholder="Confirme a nova senha..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button disabled={!isDirty || isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Atualizar'
          )}
        </Button>
      </form>
    </Form>
  )
}
