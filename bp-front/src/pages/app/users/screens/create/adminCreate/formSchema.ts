import { z } from 'zod'

import { UserStatusEnum } from '@/types'

export const admformSchema = z.object({
  name: z.string({ message: 'Nome obrigatório' }).min(3, 'Nome inválido'),
  email: z.string({ message: 'E-mail obrigatório' }).email('E-mail inválido'),
  assignments: z
    .array(
      z.object({
        assignmentId: z.string(),
        create: z.boolean(),
        read: z.boolean(),
        update: z.boolean(),
        delete: z.boolean()
      })
    )
    .refine((value) => value.some((item) => item), {
      message: 'Você deve selecionar pelo menos um item.'
    }),
  sources: z.array(z.string()).optional(),
  status: z.nativeEnum(UserStatusEnum, {
    message: 'Status obrigatório'
  })
})

export type AdminFormSchema = z.infer<typeof admformSchema>
