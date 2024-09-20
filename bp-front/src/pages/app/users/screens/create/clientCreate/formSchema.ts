import { z } from 'zod'

import { UserStatusEnum } from '@/types'

export const formSchema = z.object({
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
      message: 'You have to select at least one item.'
    }),
  costCenters: z.array(z.string()).min(1, 'Fontes da pesquisa obrigatória'),
  status: z.nativeEnum(UserStatusEnum, {
    message: 'Status obrigatório'
  })
})

export type FormSchema = z.infer<typeof formSchema>
