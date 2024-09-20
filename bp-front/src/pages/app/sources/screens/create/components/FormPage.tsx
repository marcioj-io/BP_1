import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { MaskMoney } from '@/utils/Mask/MoneyMask'

import { FormPageProps } from '..'

export const FormPage: React.FC<FormPageProps> = ({ control }) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 ">
        <FormField
          name="name"
          control={control}
          defaultValue={undefined}
          render={({ field, fieldState: { error } }) => (
            <FormItem>
              <FormLabel>
                Nome <span className="text-action">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="text"
                  id="name"
                  className={error && 'border-danger'}
                  placeholder="Digite o nome da fonte de pesquisa (Ex.: SPC, Receita Federal etc.)..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="grid grid-cols-1 gap-4">
        <FormField
          name="description"
          control={control}
          defaultValue=""
          render={({ field, fieldState: { error } }) => (
            <FormItem>
              <FormLabel>
                Descrição <span className="text-action">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="text"
                  id="description"
                  className={error && 'border-danger'}
                  placeholder="Digite a descrição detalhada desta fonte..."
                  {...field}
                />
              </FormControl>

              <div className="text-xs font-normal text-neutral-400">
                Esta informação será mostrada para clientes.
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField
          name="unitCost"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <FormItem>
              <FormLabel>
                Custo Unitário <span className="text-action">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="text"
                  id="unitCost"
                  className={error && 'border-danger'}
                  placeholder="Informe o custo unitário de uma pesquisa nesta fonte..."
                  {...field}
                  onChange={(e) => {
                    field.onChange(MaskMoney(e.currentTarget.value))
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="validityInDays"
          control={control}
          defaultValue={0}
          render={({ field, fieldState: { error } }) => (
            <FormItem>
              <FormLabel>
                Validade <span className="text-action">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  id="validityInDays"
                  className={error && 'border-danger'}
                  placeholder="Especifique a validade, em dias, de resultados desta fonte de pesquisa..."
                  {...field}
                  onChange={(e) =>
                    field.onChange(Number(e.currentTarget.valueAsNumber))
                  }
                  onWheel={(e) => e.currentTarget.blur()}
                />
              </FormControl>
              <div className="text-xs font-normal text-neutral-400">
                Pesquisas do mesmo sindicado serão atendidas automaticamente,
                caso haja resultado dentro deste prazo de validade.
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
