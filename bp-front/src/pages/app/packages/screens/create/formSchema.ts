import { z } from 'zod'

import { SimpleFormEnum } from '@/types/modules/packages'

function validatePriceRange(
  data: { amount?: string; price?: string },
  ctx: z.RefinementCtx
) {
  const amountIsFilled =
    data.amount !== undefined &&
    !isNaN(Number(data.amount)) &&
    data.amount.trim().length > 0
  const priceIsFilled = data.price !== undefined && data.price.trim() !== ''

  // Se tanto amount quanto price estiverem vazios, não há problemas
  if (!amountIsFilled && !priceIsFilled) {
    return
  }

  if (!amountIsFilled && priceIsFilled) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        'Unidade não deve estar vazio enquanto preço estiver preenchido.',
      path: ['amount']
    })
  }

  if (amountIsFilled && !priceIsFilled) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        'Preço não deve estar vazio enquanto unidade estiver preenchida.',
      path: ['price']
    })
  }
}

export const packageFormSchema = z.object({
  name: z.string({ message: 'Nome obrigatório' }).min(3, 'Nome inválido'),
  deliveryForecastInDays: z
    .string({ message: 'Previsão de Entrega Obrigatória' })
    .min(1, 'Número inválido'),
  simpleForm: z.nativeEnum(SimpleFormEnum, {
    message: 'Ficha simples obrigatória'
  }),
  notes: z.string().optional(),
  priceRanges: z
    .array(
      z
        .object({
          id: z.string().optional(),
          amount: z.string().optional(),
          price: z.string().optional()
        })
        .superRefine((data, ctx) => {
          if (data.amount || data.price) {
            validatePriceRange(data, ctx)
          }
        })
    )
    .optional(),
  sources: z
    .array(z.string({ message: 'Fontes de pesquisa obrigatórias' }))
    .min(1, 'Você deve selecionar pelo menos um item.')
})

export type PackageFormSchema = z.infer<typeof packageFormSchema>
