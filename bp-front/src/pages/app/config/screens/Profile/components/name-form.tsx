import { zodResolver } from '@hookform/resolvers/zod'
import { useAtom } from 'jotai'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
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
import { Input } from '@/components/ui/input'
import { authAtom, AuthProps } from '@/store/user'
import { TCustomError } from '@/types/responseError'

import { useUpdateAvatar } from '../../../hooks/useUpdateAvatar'
import { useUpdateProfile } from '../../../hooks/useUpdateProfile'

const formSchema = z.object({
  name: z.string({ message: 'Nome obrigatório' }).min(3, 'Nome inválido')
})

export const NameForm = () => {
  const [auth, setAuth] = useAtom(authAtom)
  const [image, setImage] = useState<string | File>(auth?.user?.avatar || '')
  const [file, setFile] = useState<string | File>(auth?.user?.avatar || '')

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImage(reader.result as string)
      }
      reader.readAsDataURL(file)
      setFile(file)
    }
  }
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: ''
    }
  })

  const {
    formState: { isSubmitting, isDirty },
    reset
  } = form

  useEffect(() => {
    form.setValue('name', auth?.user?.name ?? '')
  }, [auth?.user?.name, form])

  const { mutateAsync: updateProfile } = useUpdateProfile()
  const { mutateAsync: updateAvatarProfile } = useUpdateAvatar()

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      if (file !== auth?.user?.avatar) {
        await updateAvatarProfile({ file: file as File })
        if (auth?.token) {
          const authUser = await getProfile(auth?.token)
          setAuth((prev) => ({ ...prev, user: authUser }) as AuthProps)
        }
      }

      await updateProfile({ name: data.name })

      toast.success('Perfil atualizado com sucesso')
    } catch (error) {
      const customError = error as TCustomError
      const message = customError.response.data.messages.join(',')
      toast.error(message)
    } finally {
      if (auth?.token) {
        const authUser = await getProfile(auth?.token)
        setAuth((prev) => ({ ...prev, user: authUser }) as AuthProps)
      }
      reset()
    }
  }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field, fieldState: { error } }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    className={error && 'border-danger'}
                    placeholder="Digite o nome completo..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="relative h-24 w-24 overflow-hidden rounded-full">
            {image ? (
              <img
                src={typeof image === 'string' ? image : ''}
                alt="User avatar"
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                <span className="text-gray-400">No image</span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
          </div>
          <Button disabled={(!image && !isDirty) || isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Atualizar'
            )}
          </Button>
        </form>
      </Form>
    </div>
  )
}
