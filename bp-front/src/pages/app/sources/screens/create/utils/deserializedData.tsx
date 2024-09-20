import { z } from 'zod'

import { ApplicationEnum, ISourceBody } from '@/types'

import { formSchema } from './formSchema'

type FormSchemaKeys = keyof z.infer<typeof formSchema>

export const deserializedData = async (
  fields: z.infer<typeof formSchema>
): Promise<ISourceBody> => {
  const getSelectedFields = (key: FormSchemaKeys) =>
    Object.keys(fields[key]).reduce((acc: string[], field) => {
      if ((fields[key] as { [key: string]: boolean })[field]) acc.push(field)
      return acc
    }, [])

  const additionalFields = {
    requiredFieldsPJ: getSelectedFields('requiredFieldsPJ'),
    requiredFieldsPF: getSelectedFields('requiredFieldsPF'),
    requiredFieldsGeral: getSelectedFields('requiredFieldsGeral'),
    extraInformation: fields.extraInformation
  }

  const applicationResult: string[] = getSelectedFields('application')
  const unitCost = parseFloat(
    fields.unitCost.replace('R$', '').replace('.', '').replace(',', '.')
  )
  const application =
    applicationResult.length === 2
      ? ApplicationEnum.BOTH
      : applicationResult.shift() === 'pf'
        ? ApplicationEnum.INDIVIDUAL
        : ApplicationEnum.BUSINESS

  return {
    name: fields.name,
    application,
    requiredFieldsGeral: additionalFields.requiredFieldsGeral,
    requiredFieldsPF: additionalFields.requiredFieldsPF,
    requiredFieldsPJ: additionalFields.requiredFieldsPJ,
    extraInformation: additionalFields.extraInformation,
    description: fields.description,
    unitCost: unitCost || 0,
    validityInDays: Number(fields.validityInDays)
  }
}
