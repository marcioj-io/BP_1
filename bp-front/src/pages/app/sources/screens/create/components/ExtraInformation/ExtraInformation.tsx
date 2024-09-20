import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { MultiSelect } from '@/components/ui/multi-select'

import { FormPageProps } from '../..'

export const ExtraInformation: React.FC<FormPageProps> = ({ control }) => {
  return (
    <div>
      <div className="grid grid-cols-1">
        <FormField
          control={control}
          name="extraInformation"
          render={({ field, fieldState: { error } }) => (
            <FormItem>
              <FormLabel>Criar Campo</FormLabel>
              <FormControl>
                <MultiSelect
                  className={error && 'border-danger'}
                  placeholder="Digite o nome do campo que deseja incluir na fonte de pesquisa..."
                  value={field.value || []}
                  onChange={field.onChange}
                  options={[]}
                  creatable
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
