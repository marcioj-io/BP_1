import { Controller } from 'react-hook-form'

import { FormControl, FormItem, FormLabel } from '@/components/ui/form'

import { FormPageProps } from '..'
import { requiredFieldsPFConst } from '../constants/checkFields'

type RequiredFieldsGeralKeys = keyof typeof requiredFieldsPFConst

type PrefixedKeys = {
  [K in RequiredFieldsGeralKeys as `requiredFieldsPF.${K}`]: K
}

type Field = {
  id: keyof PrefixedKeys
  label: string
  description?: string
}

const fields: Field[] = [
  {
    id: 'requiredFieldsPF.birthday',
    label: 'Data de Nascimento'
  },
  {
    id: 'requiredFieldsPF.maritalStatus',
    label: 'Estado civil'
  },
  {
    id: 'requiredFieldsPF.fatherName',
    label: 'Nome do pai'
  },
  {
    id: 'requiredFieldsPF.motherName',
    label: 'Nome da mãe'
  },
  {
    id: 'requiredFieldsPF.naturalness',
    label: 'Naturalidade'
  },
  {
    id: 'requiredFieldsPF.nationality',
    label: 'Nacionalidade'
  },
  {
    id: 'requiredFieldsPF.familyIncome',
    label: 'Renda familiar'
  }
]

export const RequiredFieldPF: React.FC<FormPageProps> = ({ control }) => {
  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="mt-[16px] grid grid-cols-2 gap-4 border border-solid border-[#E7E7E7] bg-[#F1F5F940] px-2 py-4">
        {fields.map((item) => (
          <Controller
            key={item.id}
            name={item.id}
            control={control}
            defaultValue={false}
            render={({ field }) => (
              <FormItem className="flex w-full flex-col items-start justify-start gap-4">
                <div className="flex items-center justify-center gap-2">
                  <FormControl>
                    <input
                      type="checkbox"
                      {...field}
                      className="form-checkbox h-5 w-5 rounded-[4px] border border-hidden bg-gray-300 checked:bg-[#3B5999] focus:ring-[#3B5999]"
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
