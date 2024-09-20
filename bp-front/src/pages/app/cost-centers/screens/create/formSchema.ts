import { z } from 'zod'

export const formSchema = z.object({
  name: z
    .string({ message: 'Nome obrigatório' })
    .min(5, 'Código deve ter no mínimo 5 caracteres')
    .max(50, 'Nome deve ter no máximo 50 caracteres'),
  description: z
    .string({ message: 'Descrição Obrigatória' })
    .min(5, 'Descrição deve ter no mínimo 5 caracteres')
    .max(100, 'Descrição deve ter no máximo 100 caracteres'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING'], {
    message: 'Status obrigatório'
  })
})
