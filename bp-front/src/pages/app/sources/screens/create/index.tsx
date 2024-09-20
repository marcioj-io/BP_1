import { zodResolver } from '@hookform/resolvers/zod'
import { useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { Control, useForm } from 'react-hook-form'
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
import { Form } from '@/components/ui/form'
import { ROUTES } from '@/constants'
import { useCreateSource } from '@/hooks/source/useCreateSource'
import { useGetSourceById } from '@/hooks/source/useGetSourceById'
import { useUpdateSource } from '@/hooks/source/useUpdateSource'
import { modalAtom } from '@/store/modal'
import { ApplicationEnum } from '@/types'
import { TCustomError } from '@/types/responseError'
import { MaskMoney } from '@/utils/Mask/MoneyMask'

import { Application } from './components/Aplication'
import { ExtraInformation } from './components/ExtraInformation/ExtraInformation'
import { FormPage } from './components/FormPage'
import { RequiredFieldsGeral } from './components/RequiredFieldsGeral'
import { RequiredFieldPF } from './components/RequiredFieldsPF'
import { RequiredFieldPJ } from './components/RequiredFieldsPJ'
import {
  requiredFieldsGeralConst,
  requiredFieldsPFConst,
  requiredFieldsPJConst
} from './constants/checkFields'
import { deserializedData } from './utils/deserializedData'
import { formSchema } from './utils/formSchema'

export interface FormPageProps {
  control: Control<z.infer<typeof formSchema>>
}

export const CreateSource = () => {
  const navigate = useNavigate()

  const { mutateAsync: createSource } = useCreateSource()
  const { mutateAsync: updateSources } = useUpdateSource()

  const setModal = useSetAtom(modalAtom)

  const { id: sourceId } = useParams<{ id: string }>()

  const { data: sourceData, isLoading } = useGetSourceById({
    sourceId: sourceId ?? ''
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      unitCost: 'R$ 0,00',
      validityInDays: 0,
      application: {
        pf: false,
        pj: false
      },
      requiredFieldsGeral: requiredFieldsGeralConst,
      requiredFieldsPF: requiredFieldsPFConst,
      requiredFieldsPJ: requiredFieldsPJConst,
      extraInformation: sourceData ? sourceData?.data?.extraInformation : []
    }
  })

  const {
    formState: { isSubmitting, isDirty },
    reset,
    control,
    trigger
  } = form

  useEffect(() => {
    if (sourceData?.data && !isLoading) {
      reset({
        name: sourceData?.data?.name ?? '',
        description: sourceData?.data?.description ?? '',
        unitCost: MaskMoney(sourceData?.data?.unitCost.toString(), false),
        validityInDays: Number(sourceData?.data?.validityInDays) ?? 0,
        application: {
          pf:
            sourceData?.data?.application === ApplicationEnum.INDIVIDUAL ||
            sourceData?.data?.application === ApplicationEnum.BOTH,
          pj:
            sourceData?.data?.application === ApplicationEnum.BUSINESS ||
            sourceData?.data?.application === ApplicationEnum.BOTH
        },
        requiredFieldsGeral: Object.keys(requiredFieldsGeralConst).reduce(
          (acc: { [key: string]: boolean }, key) => {
            acc[key] = sourceData?.data?.requiredFieldsGeral.includes(key)
            return acc
          },
          {}
        ),
        requiredFieldsPF: Object.keys(requiredFieldsPFConst).reduce(
          (acc: { [key: string]: boolean }, key) => {
            acc[key] = sourceData?.data?.requiredFieldsPF.includes(key)
            return acc
          },
          {}
        ),
        requiredFieldsPJ: Object.keys(requiredFieldsPJConst).reduce(
          (acc: { [key: string]: boolean }, key) => {
            acc[key] = sourceData?.data?.requiredFieldsPJ.includes(key)
            return acc
          },
          {}
        ),
        extraInformation: sourceData?.data?.extraInformation
      })

      trigger()
    }
  }, [reset, sourceData, isLoading, trigger])

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const deserializedDataResult = await deserializedData(data)

    try {
      if (sourceId) {
        await updateSources({
          body: {
            ...deserializedDataResult,
            version: sourceData?.data?.version ?? 0
          },
          sourceId
        })
      } else {
        await createSource({
          body: {
            ...deserializedDataResult
          }
        })
      }
      reset()
      navigate(ROUTES.SOURCES.LIST)
      setModal({
        open: true,
        type: 'success',
        onClose: () => null,
        onConfirm: () => null,
        content: {
          title: `Fonte de pesquisa ${sourceId ? 'atualizado' : 'cadastrado'} com sucesso!`,
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

    if (sourceId) {
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
            Nova Fonte de Pesquisa
          </h1>

          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href={ROUTES.SOURCES.LIST}>
                  Fonte de Pesquisa
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-brand-tertiary underline">
                  Cadastrar nova
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="rounded-sm bg-neutral-0 p-4">
          <Form {...form}>
            <form className="flex flex-col gap-4 space-y-4" noValidate>
              {!isLoading && (
                <>
                  <FormPage control={control} />
                  <div className="p-0">
                    <Application control={control} />
                  </div>
                  <div className="p-0">
                    <div className="mb-4 text-xs font-semibold text-neutral-800">
                      Campos Obrigatórios - Geral
                    </div>
                    <RequiredFieldsGeral control={control} />
                  </div>
                  <div className="p-0">
                    <div className="mb-4 text-xs font-semibold text-neutral-800">
                      Campos Obrigatórios - Pessoa Física
                    </div>
                    <RequiredFieldPF control={control} />
                  </div>
                  <div className="p-0">
                    <div className="mb-4 text-xs font-semibold text-neutral-800">
                      Campos Obrigatórios - Pessoa Jurídica
                    </div>
                    <RequiredFieldPJ control={control} />
                  </div>

                  <div className="p-0">
                    <div className="mb-4 text-xs font-semibold text-neutral-800">
                      Informações Extras em Resultado de Consultas
                    </div>
                    <ExtraInformation control={control} />
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
                <Button
                  type="submit"
                  disabled={isSubmitting || !isDirty}
                  onClick={handleSubmitWithConfirmation}
                >
                  {sourceId ? 'Atualizar' : 'Cadastrar'} Fonte de Pesquisa
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </>
  )
}
