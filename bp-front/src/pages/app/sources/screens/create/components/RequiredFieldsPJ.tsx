import { Controller } from 'react-hook-form'

import { FormControl, FormItem, FormLabel } from '@/components/ui/form'

import { FormPageProps } from '..'
import { requiredFieldsPJConst } from '../constants/checkFields'

type RequiredFieldsGeralKeys = keyof typeof requiredFieldsPJConst

type PrefixedKeys = {
  [K in RequiredFieldsGeralKeys as `requiredFieldsPJ.${K}`]: K
}

type Field = {
  id: keyof PrefixedKeys
  label: string
  description?: string
}

const fields: Field[] = [
  {
    id: 'requiredFieldsPJ.socialName',
    label: 'Razão Social'
  },
  {
    id: 'requiredFieldsPJ.municipalRegistration',
    label: 'Inscrição municipal'
  },
  {
    id: 'requiredFieldsPJ.stateRegistration',
    label: 'Inscrição estadual'
  },
  {
    id: 'requiredFieldsPJ.shareCapital',
    label: 'Capital social'
  },
  {
    id: 'requiredFieldsPJ.latestContractAmendment',
    label: 'Última alteração contratual'
  },
  {
    id: 'requiredFieldsPJ.businessSegment',
    label: 'Ramo'
  }
]

export const RequiredFieldPJ: React.FC<FormPageProps> = ({ control }) => {
  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="mt-4 grid grid-cols-2 gap-4 border border-solid border-neutral-50 bg-background-300 px-2 py-4">
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
                      className="form-checkbox h-5 w-5 rounded-s border border-hidden bg-gray-300 checked:bg-brand-secondary focus:ring-brand-secondary"
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
                  <div className="text-xs font-normal text-neutral-800">
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
