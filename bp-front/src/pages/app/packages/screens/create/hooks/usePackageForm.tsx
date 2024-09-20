import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

import { SimpleFormEnum } from '@/types/modules/packages'
import { MaskMoney } from '@/utils/Mask/MoneyMask'

import { PackageFormSchema, packageFormSchema } from '../formSchema'
import { usePackageData } from './usePackageData'

export const usePackageForm = (packageId: string) => {
  const { packageData, sources, isLoading } = usePackageData(packageId)

  const form = useForm<PackageFormSchema>({
    resolver: zodResolver(packageFormSchema),
    defaultValues: {
      name: '',
      deliveryForecastInDays: undefined,
      simpleForm: SimpleFormEnum.ACTIVE,
      notes: '',
      priceRanges: [],
      sources: []
    }
  })

  useEffect(() => {
    if (packageData) {
      form.reset({
        ...form.getValues(),
        name: packageData.name,
        deliveryForecastInDays: packageData.deliveryForecastInDays.toString(),
        simpleForm: packageData.simpleForm
          ? SimpleFormEnum.ACTIVE
          : SimpleFormEnum.INACTIVE,
        notes: packageData.notes,
        priceRanges: packageData.PriceRange?.map((pr) => ({
          id: pr.id,
          amount: String(pr.amount),
          price: MaskMoney(pr.price)
        })),
        sources: packageData.Sources?.map((src) => src.id)
      })
    }
  }, [form, packageData])

  return { form, packageData, sources, isLoading }
}
