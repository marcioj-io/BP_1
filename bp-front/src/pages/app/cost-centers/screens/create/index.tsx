import { zodResolver } from '@hookform/resolvers/zod'
import { useAtom, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { z } from 'zod'

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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ROUTES } from '@/constants'
import { useCreateCostCenter } from '@/hooks/cost-center/useCreateCostCenter'
import { useGetByIdCostCenter } from '@/hooks/cost-center/useGetCostCenterById'
import { useUpdateCostCenter } from '@/hooks/cost-center/useUpdateCostCenter'
import { modalAtom } from '@/store/modal'
import { authAtom } from '@/store/user'
import { CostCenterStatusEnum } from '@/types/modules/cost-center'
import { TCustomError } from '@/types/responseError'

import { formSchema } from './formSchema'

export const CreateCostCenter = () => {
  const navigate = useNavigate()
  const [auth] = useAtom(authAtom)
  const { mutateAsync: createCostCenters } = useCreateCostCenter()
  const { mutateAsync: updateCostCenters } = useUpdateCostCenter()
  const setModal = useSetAtom(modalAtom)
  const { id: costCenterId } = useParams<{ id: string }>()
  const clientId = auth?.user?.clientId ?? ''

  const { data: costCenterData } = useGetByIdCostCenter({
    clientId,
    costCenterId: costCenterId ?? ''
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      status: CostCenterStatusEnum.ACTIVE
    }
  })
  const {
    formState: { isSubmitting, isDirty },
    reset,
    setValue
  } = form

  useEffect(() => {
    if (costCenterData) {
      setValue('name', costCenterData?.name ?? '', {
        shouldValidate: true
      })
      setValue('description', costCenterData?.description ?? '', {
        shouldValidate: true
      })
      setValue('status', costCenterData?.status as CostCenterStatusEnum, {
        shouldValidate: true
      })
    }
  }, [costCenterData, setValue])

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      if (costCenterId) {
        await updateCostCenters({
          body: { ...data, version: costCenterData?.version ?? 0 },
          clientId,
          costCenterId
        })
      } else {
        await createCostCenters({ body: data, clientId })
      }
      reset()
      navigate(ROUTES.COST_CENTERS.LIST)
      setModal({
        open: true,
        type: 'success',
        onClose: () => null,
        onConfirm: () => null,
        content: {
          title: `${costCenterId ? 'Alteração realizada' : 'Centro de custo cadastrado'} com sucesso!`,
          message: ''
        }
      })
    } catch (error) {
      const customError = error as TCustomError
      const message = customError.response.data.messages.join(',')
      setModal({
        open: true,
        type: 'error',
        onClose: () => null,
        onConfirm: () => null,
        content: {
          title: 'Sua solicitação não pode ser concluída.',
          message
        }
      })
    }
  }

  const handleEditModal = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()

    setModal({
      open: true,
      type: 'alert',
      onClose: () => null,
      onConfirm: () => {
        form.handleSubmit(onSubmit)()
      },
      content: {
        title: 'Tem certeza que deseja alterar?',
        message:
          'Se você continuar com esta ação, a alteração será feita substituirá o cadastro salvo anteriormente.'
      }
    })
  }

  const handleSubmitWithConfirmation = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault()

    if (costCenterId) {
      handleEditModal(event)
    } else {
      form.handleSubmit(onSubmit)()
    }
  }

  return (
    <>
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-xl font-semibold text-neutral-800">
            {costCenterId
              ? `Centro de Custo ${costCenterData?.name}`
              : 'Novo Centro de Custo'}
          </h1>

          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href={ROUTES.COST_CENTERS.LIST}>
                  Centros de custo
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-brand-tertiary underline">
                  {costCenterId ? 'Editar' : 'Cadastrar'}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="rounded-sm bg-neutral-0 p-4">
          <Form {...form}>
            <form className="space-y-4" noValidate>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field, fieldState: { error } }) => (
                    <FormItem>
                      <FormLabel>
                        Código <span className="text-action">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          id="name"
                          className={error && 'border-danger'}
                          placeholder="Digite o código..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
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
                          placeholder="Digite a descrição..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Status <span className="text-action">*</span>
                    </FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={(value) =>
                          field.onChange({
                            target: {
                              name: field.name,
                              value
                            }
                          })
                        }
                        value={field.value}
                        className="flex space-x-4"
                      >
                        <FormItem className="flex items-center space-x-1.5 space-y-0">
                          <FormControl>
                            <RadioGroupItem
                              value={CostCenterStatusEnum.ACTIVE}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">Ativo</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-1.5 space-y-0">
                          <FormControl>
                            <RadioGroupItem
                              value={CostCenterStatusEnum.INACTIVE}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">Inativo</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate(-1)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !isDirty}
                  onClick={handleSubmitWithConfirmation}
                >
                  {costCenterId ? 'Atualizar' : 'Cadastrar'} Centro de Custo
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </>
  )
}
