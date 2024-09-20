import { useAtomValue, useSetAtom } from 'jotai'
import { useNavigate, useParams } from 'react-router-dom'
import { isDirty } from 'zod'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { MultiSelect } from '@/components/ui/multi-select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ROUTES } from '@/constants'
import { useCreatePackage } from '@/hooks/package/useCreatePackage'
import { useUpdatePackage } from '@/hooks/package/useUpdatePackage'
import { modalAtom } from '@/store/modal'
import { authAtom } from '@/store/user'
import { SimpleFormEnum } from '@/types/modules/packages'
import { TCustomError } from '@/types/responseError'

import { PriceRange } from './components'
import { PackageFormSchema } from './formSchema'
import { usePackageForm } from './hooks/usePackageForm'

export const CreatePackage = () => {
  const navigate = useNavigate()
  const setModal = useSetAtom(modalAtom)
  const auth = useAtomValue(authAtom)

  const { mutateAsync: createPackage } = useCreatePackage()
  const { mutateAsync: updatePackage } = useUpdatePackage()

  const { id: packageId } = useParams<{ id: string }>()

  const { form, packageData, sources, isLoading } = usePackageForm(
    packageId ?? ''
  )

  const {
    formState: { isSubmitting, errors },
    reset,
    control
  } = form

  type IRange = {
    id?: string
    amount?: string
    price?: string
  }

  const onSubmit = async (data: PackageFormSchema) => {
    try {
      if (packageId) {
        if (!packageData || !packageData.version) {
          throw new Error('Package data or version is missing.')
        }

        const formattedData = {
          ...data,
          version: packageData.version,
          clientId: auth?.user?.clientId ?? '',
          deliveryForecastInDays: Number(data.deliveryForecastInDays),
          notes: data.notes!,
          simpleForm: data.simpleForm === SimpleFormEnum.ACTIVE ? true : false,
          priceRanges: (data.priceRanges || [])
            .filter((range: IRange) => range.amount && range.price)
            .map((range: IRange) => ({
              amount: parseInt(range?.amount || ''),
              price: parseFloat((range?.price || '').replace(/[^\d.-]/g, ''))
            })),
          sources: data.sources.map((source: string) => ({ id: source }))
        }

        await updatePackage({
          packageId: packageId,
          body: formattedData
        })
      } else {
        const formattedUpdateData = {
          ...data,
          clientId: auth?.user?.clientId ?? '',
          deliveryForecastInDays: Number(data.deliveryForecastInDays),
          notes: data.notes!,
          simpleForm: data.simpleForm === SimpleFormEnum.ACTIVE ? true : false,
          priceRanges: (data.priceRanges || [])
            .filter((range: IRange) => range.amount && range.price)
            .map((range: IRange) => ({
              amount: parseInt(range?.amount || ''),
              price: parseFloat((range?.price || '').replace(/[^\d.-]/g, ''))
            })),
          sources: data.sources.map((source: string) => ({ id: source }))
        }

        await createPackage({
          body: formattedUpdateData
        })
      }

      reset()
      navigate(ROUTES.PACKAGES.LIST)
      setModal({
        open: true,
        type: 'success',
        onClose: () => console.log('modal closed'),
        onConfirm: () => console.log('confirm'),
        content: {
          title: `${packageId ? 'Alteração realizada' : 'Pacote cadastrado'} com sucesso!`,
          message: ''
        }
      })
    } catch (error) {
      const customError = error as TCustomError
      const message = customError.response.data.messages.join(',')
      setModal({
        open: true,
        type: 'error',
        onClose: () => console.log('modal closed'),
        onConfirm: () => console.log('confirm'),
        content: {
          title: 'Sua solicitação não pode ser concluída.',
          message
        }
      })
    }
  }

  // const handleConfirmEdit = async (data: PackageFormSchema) => {
  //     setModal({
  //         open: true,
  //         type: 'alert',
  //         onClose: () => console.log('modal closed'),
  //         onConfirm: () => onSubmit(data),
  //         content: {
  //             title: `Tem certeza que deseja alterar?`,
  //             message:
  //                 'Se você continuar com esta ação, a alteração será feita substituirá o cadastro salvo anteriormente.'
  //         }
  //     })
  // }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-xl font-semibold text-neutral-800">
          {packageId ? packageData?.name : 'Pacotes'}
        </h1>

        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href={ROUTES.PACKAGES.LIST}>
                Pacotes
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-brand-tertiary underline">
                {packageId ? 'Editar' : 'Cadastrar novo'}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="rounded-sm bg-neutral-0 p-4">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4 space-y-4"
            noValidate
          >
            {!isLoading && (
              <>
                <div className="flex gap-4">
                  <div className="w-[44rem]">
                    <FormField
                      control={control}
                      name="name"
                      render={({ field, fieldState: { error } }) => (
                        <FormItem>
                          <FormLabel>
                            Nome do Pacote{' '}
                            <span className="text-action">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              className={error ? 'border-danger' : ''}
                              placeholder="Digite o nome completo..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="w-[15rem]">
                    <FormField
                      control={control}
                      name="deliveryForecastInDays"
                      render={({ field, fieldState: { error } }) => (
                        <FormItem>
                          <FormLabel>
                            Previsão de Entrega{' '}
                            <span className="text-action">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              className={error ? 'border-danger' : ''}
                              placeholder="Digite o número de dias..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                          <div className="text-xs font-normal text-neutral-400">
                            Informe a previsão de entrega, em dias, de respostas
                            a solicitações deste pacote.
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="w-[116px]">
                    <FormField
                      control={form.control}
                      name="simpleForm"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Ficha Simples <span className="text-action">*</span>
                          </FormLabel>
                          <FormControl className="flex pt-2">
                            <RadioGroup
                              value={field.value}
                              onValueChange={(value) => field.onChange(value)}
                              className="flex space-x-4"
                            >
                              <FormItem className="flex items-center space-x-1.5 space-y-0">
                                <FormControl>
                                  <RadioGroupItem
                                    value={SimpleFormEnum.ACTIVE}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Sim
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-1.5 space-y-0">
                                <FormControl>
                                  <RadioGroupItem
                                    value={SimpleFormEnum.INACTIVE}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Não
                                </FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <FormField
                  control={control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Digite observações adicionais..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <PriceRange control={control} errors={errors} />

                <div className="flex flex-col gap-4">
                  <p className="text=[#44444F] font-Inter text-sm font-bold">
                    Fontes de Pesquisa
                  </p>
                  <FormField
                    control={control}
                    name="sources"
                    render={({ field, fieldState: { error } }) => (
                      <FormItem>
                        <FormLabel>
                          Fontes de Pesquisa{' '}
                          <span className="text-action">*</span>
                        </FormLabel>
                        <FormControl>
                          <MultiSelect
                            onChange={field.onChange}
                            value={field.value}
                            options={
                              (sources?.data ?? []).length > 0
                                ? sources?.data?.map((source) => ({
                                    label: source.name,
                                    value: source.id
                                  }))
                                : []
                            }
                            className={error ? 'border-danger' : ''}
                            placeholder="Selecione as fontes de pesquisa autorizadas para o usuário..."
                            creatable={false}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate(-1)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting || !isDirty}>
                {packageId ? 'Salvar Alterações' : 'Cadastrar Pacote'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
