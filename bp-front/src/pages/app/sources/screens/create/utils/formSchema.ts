import { z } from 'zod'

import {
  requiredFieldsGeralConst,
  requiredFieldsPFConst,
  requiredFieldsPJConst
} from '../constants/checkFields'

export const formSchema = z.object({
  name: z
    .string({ message: 'Código Obrigatório' })
    .min(3, 'Nome inválido')
    .max(50, 'Nome deve ter no máximo 50 caracteres'),
  description: z
    .string({ message: 'Descrição Obrigatório' })
    .min(3, 'Descrição inválida'),
  unitCost: z.string().refine((value) => value !== 'R$ 0,00', {
    message: 'Custo unitário não pode ser R$ 0,00'
  }),
  validityInDays: z
    .number()
    .min(1, { message: 'Dias de validade inválidos' })
    .max(31, { message: 'Validade deve ser no máximo 31' }),
  application: z
    .object({
      pf: z.boolean(),
      pj: z.boolean()
    })
    .refine((obj) => obj.pf || obj.pj, {
      message: 'Pelo menos um campo deve ser selecionado'
    }),
  requiredFieldsGeral: z.lazy(() =>
    z.object(
      Object.keys(requiredFieldsGeralConst).reduce(
        (acc: { [key: string]: z.ZodBoolean }, key) => {
          acc[key] = z.boolean()
          return acc
        },
        {}
      )
    )
  ),
  requiredFieldsPF: z.lazy(() =>
    z.object(
      Object.keys(requiredFieldsPFConst).reduce(
        (acc: { [key: string]: z.ZodBoolean }, key) => {
          acc[key] = z.boolean()
          return acc
        },
        {}
      )
    )
  ),
  requiredFieldsPJ: z.lazy(() =>
    z.object(
      Object.keys(requiredFieldsPJConst).reduce(
        (acc: { [key: string]: z.ZodBoolean }, key) => {
          acc[key] = z.boolean()
          return acc
        },
        {}
      )
    )
  ),
  extraInformation: z.array(z.string())
})
