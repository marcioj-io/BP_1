import { Controller } from 'react-hook-form'

import { FormControl, FormItem, FormLabel } from '@/components/ui/form'

import { FormPageProps } from '..'
import { requiredFieldsGeralConst } from '../constants/checkFields'

type RequiredFieldsGeralKeys = keyof typeof requiredFieldsGeralConst

type PrefixedKeys = {
  [K in RequiredFieldsGeralKeys as `requiredFieldsGeral.${K}`]: K
}

type Field = {
  id: keyof PrefixedKeys
  label: string
  description?: string
}

const fields: Field[] = [
  {
    id: 'requiredFieldsGeral.name',
    label: 'Nome',
    description:
      'O nome de batismo (Pessoa Física) ou nome fantasia (Pessoa Jurídica).'
  },
  {
    id: 'requiredFieldsGeral.phone',
    label: 'Telefone'
  },
  {
    id: 'requiredFieldsGeral.fax',
    label: 'Fax'
  },
  {
    id: 'requiredFieldsGeral.email',
    label: 'E-mail'
  },
  {
    id: 'requiredFieldsGeral.site',
    label: 'Site'
  },
  {
    id: 'requiredFieldsGeral.register',
    label: 'Identidade/Registro',
    description:
      'O número de identidade (RG) se Pessoa Física, ou número de registro, se Pessoa Jurídica.'
  },
  {
    id: 'requiredFieldsGeral.registrationIssuanceDate',
    label: 'Data de emissão de registro',
    description:
      'A data de emissão da identidade (RG, Pessoa Física) ou número de registro.'
  },
  {
    id: 'requiredFieldsGeral.registrationIssuingBody',
    label: 'Órgão Expeditor',
    description: 'O órgão expeditor do registro da pessoa.'
  },
  {
    id: 'requiredFieldsGeral.bankReference',
    label: 'Referências bancárias'
  },
  {
    id: 'requiredFieldsGeral.commercialReference',
    label: 'Referências Comerciais'
  }
]

export const RequiredFieldsGeral: React.FC<FormPageProps> = ({ control }) => {
  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="mt-4 grid grid-cols-2 gap-4 border border-solid border-gray-300 bg-[#F1F5F940] p-4">
        {' '}
        {fields.map((item) => (
          <Controller
            key={item.id}
            name={item.id}
            control={control}
            defaultValue={false}
            render={({ field }) => (
              <FormItem className="mb-0 mt-0 flex w-full flex-col items-start justify-start gap-[4px] p-0">
                <div className="flex items-center justify-center gap-[16px]">
                  <FormControl>
                    <input
                      type="checkbox"
                      className="form-checkbox h-5 w-5 rounded-[4px] border border-hidden bg-gray-300 checked:bg-[#3B5999] focus:ring-[#3B5999]"
                      {...field}
                      onChange={(e) =>
                        field.onChange((e.target as HTMLInputElement).checked)
                      }
                      value={field.value.toString()}
                      checked={field.value}
                    />
                  </FormControl>
                  <FormLabel>{item.label}</FormLabel>
                </div>

                {item.description && (
                  <div className="font-inter text-xs font-normal text-[#9C9C9C]">
                    {item.description}
                  </div>
                )}
              </FormItem>
            )}
          />
        ))}
      </div>
    </div>
  )
}
