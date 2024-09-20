import { CirclePlus } from 'lucide-react'
import React, { useEffect } from 'react'
import {
  Control,
  Controller,
  FieldErrors,
  useFieldArray
} from 'react-hook-form'
import { v4 as uuidv4 } from 'uuid'

import { FormControl, FormItem } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { MaskMoney } from '@/utils/Mask/MoneyMask'

import { PackageFormSchema } from '../formSchema'
interface PriceRangeProps {
  control: Control<PackageFormSchema>
  errors: FieldErrors<PackageFormSchema>
}

export const PriceRange: React.FC<PriceRangeProps> = ({ control, errors }) => {
  const { fields, append } = useFieldArray({
    control,
    name: 'priceRanges'
  })

  const generateId = (): string => {
    return uuidv4()
  }

  let countFields: number = 0
  const defaultFields = (Qtdfields: number) => {
    if (Qtdfields < 3) {
      let i = Qtdfields
      for (i; i < 3; i++) {
        countFields = countFields + 1
        append({ id: generateId(), amount: '', price: '' })
      }
    }
  }

  useEffect(() => {
    if (fields.length < 3 && countFields < 3) {
      defaultFields(fields.length)
    }
  }, [fields.length, countFields])

  const handleAddPriceRange = () => {
    append({ id: generateId(), amount: '', price: '' })
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="font-Inter text-sm font-bold text-neutral-800">
        Tabela de Preços
      </p>
      <div className="flex min-h-[19rem] w-full flex-col gap-4 rounded-[8px] bg-[#F1F5F9] p-2">
        <div
          id="table"
          className="grid min-h-[210px] w-[532px] grid-cols-2 gap-2"
        >
          <div className="flex h-12 justify-center bg-neutral-0 py-4 font-inter text-xs font-medium text-custom-3">
            UNIDADES DE CONSULTA
          </div>
          <div className="flex h-12 justify-center bg-neutral-0 py-4 font-inter text-xs font-medium text-custom-3">
            PREÇO
          </div>

          {fields.map((field, index) => (
            <React.Fragment key={field.id}>
              <FormItem>
                <div className="bg-neutral-0 p-2">
                  <FormControl>
                    <Controller
                      name={`priceRanges.${index}.amount`}
                      control={control}
                      defaultValue={field.amount}
                      render={({ field, fieldState: { error } }) => (
                        <Input
                          type="number"
                          id={`units_${index}`}
                          min={0}
                          className={`border-custom-2 bg-custom-2 text-center font-inter font-medium text-neutral-800 placeholder-neutral-400 ${error ? 'border-danger' : ''}`}
                          placeholder="0"
                          {...field}
                          onChange={(e) => {
                            const value = e.currentTarget.value
                            field.onChange(value)
                          }}
                          onWheel={(e) => e.currentTarget.blur()}
                        />
                      )}
                    />
                  </FormControl>
                </div>
                {errors?.priceRanges?.[index]?.amount && (
                  <span className="text-[10px] text-danger">
                    {errors?.priceRanges[index]?.amount?.message}
                  </span>
                )}
              </FormItem>
              <FormItem>
                <div className="bg-neutral-0 p-2">
                  <FormControl>
                    <Controller
                      name={`priceRanges.${index}.price`}
                      control={control}
                      defaultValue={field.price}
                      render={({ field, fieldState: { error } }) => (
                        <Input
                          type="text"
                          id={`price_${index}`}
                          placeholder="0,00"
                          className={`border-custom-2 bg-custom-2 text-center font-inter font-medium text-neutral-800 placeholder-neutral-400 ${error ? 'border-danger' : ''}`}
                          {...field}
                          onChange={(e) => {
                            field.onChange(MaskMoney(e.currentTarget.value))
                          }}
                        />
                      )}
                    />
                  </FormControl>
                </div>
                {errors?.priceRanges?.[index]?.price && (
                  <span className="text-[10px] text-danger">
                    {errors?.priceRanges[index]?.price?.message}
                  </span>
                )}
              </FormItem>
            </React.Fragment>
          ))}
        </div>
        <a
          className="flex cursor-pointer gap-2 bg-transparent text-custom-5"
          onClick={handleAddPriceRange}
        >
          <div className="flex items-center gap-2">
            <CirclePlus />
            <p className="font-Inter h-4 border border-b-2 border-l-0 border-r-0 border-t-0 border-custom-5 font-inter text-xs font-medium">
              Adicionar linha de preço
            </p>
          </div>
        </a>
      </div>
    </div>
  )
}
