import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { cn } from '@/lib/utils'

import { FormPageProps } from '..'

type Field = {
  id: 'application.pf' | 'application.pj'

  label: string
  description: string
}

const fields: Field[] = [
  {
    id: 'application.pf',
    label: 'Pessoa Física',
    description: ''
  },
  {
    id: 'application.pj',
    label: 'Pessoa Jurídica',
    description: ''
  }
]

export const Application: React.FC<FormPageProps> = ({ control }) => {
  return (
    <div>
      <FormField
        control={control}
        name="application"
        render={({ fieldState: { error } }) => (
          <FormItem className="space-y-4">
            <FormLabel className="mb-4 text-xs font-semibold text-neutral-800">
              Aplicação <span className="text-action">*</span>
            </FormLabel>
            <div
              className={cn(
                'flex w-full flex-col gap-4 border border-solid border-neutral-50 bg-background-300 px-2 py-4',
                error && 'border-danger'
              )}
            >
              {fields.map((item) => (
                <FormField
                  key={item.id}
                  control={control}
                  name={item.id}
                  render={({ field }) => {
                    return (
                      <FormItem
                        key={item.id}
                        className="flex flex-row items-start space-x-3 space-y-0"
                      >
                        <FormControl>
                          <input
                            type="checkbox"
                            className="form-checkbox h-5 w-5 rounded-s border border-hidden bg-gray-300 checked:bg-brand-secondary focus:ring-brand-secondary"
                            {...field}
                            onChange={(e) =>
                              field.onChange(
                                (e.target as HTMLInputElement).checked
                              )
                            }
                            value={field.value.toString()}
                            checked={field.value}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {item.label}
                        </FormLabel>
                      </FormItem>
                    )
                  }}
                />
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
