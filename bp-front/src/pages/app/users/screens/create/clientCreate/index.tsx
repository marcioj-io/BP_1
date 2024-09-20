import { useQueryClient } from '@tanstack/react-query'
import { useAtomValue, useSetAtom } from 'jotai'
import { Loader2 } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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
import { useCreateUser } from '@/hooks/users/useCreateUser'
import { useEditUser } from '@/hooks/users/useEditUser'
import { GET_ONE_USER_KEY } from '@/hooks/users/useGetOneUser'
import { USERS_QUERY_KEY } from '@/hooks/users/useGetUsers'
import { modalAtom } from '@/store/modal'
import { authAtom } from '@/store/user'
import { UserStatusEnum } from '@/types'
import { assignmentNames } from '@/types/modules/tenant/assignments'
import { IAssignment } from '@/types/modules/users/ICreateUserBody'
import { TCustomError } from '@/types/responseError'

import { FormSchema } from './formSchema'
import { useUserForm } from './hooks/useUserForm'

export const CreateClientUser = () => {
  const auth = useAtomValue(authAtom)
  const setModal = useSetAtom(modalAtom)
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { id: userId } = useParams<{ id: string }>()

  const { form, assignments, costCenters, user } = useUserForm(userId ?? '')

  const { mutateAsync: createUser, isPending: isCreating } = useCreateUser()
  const { mutateAsync: editUser, isPending: isEditing } = useEditUser()

  const {
    formState: { isSubmitting, isDirty },
    reset
  } = form

  const onSubmit = async (data: FormSchema) => {
    try {
      if (user) {
        await editUser({
          ...data,
          id: user.id,
          roleId: user.role.id,
          version: user.version
        })
        toast.success('Usuário editado com sucesso')
      } else {
        await createUser({
          ...data,
          roleId: auth?.user?.roleId ?? '',
          clientId: auth?.user?.clientId ?? ''
        })
        toast.success('Usuário cadastrado com sucesso')
      }

      setModal({
        open: true,
        type: 'success',
        onClose: () => console.log('modal closed'),
        onConfirm: () => console.log('confirm'),
        content: {
          title: `${userId ? 'Alteração realizada' : 'Usuário cadastrado'} com sucesso!`,
          message: ''
        }
      })

      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] })
      queryClient.invalidateQueries({
        queryKey: [GET_ONE_USER_KEY, user?.id]
      })
      reset()
      navigate(ROUTES.USERS.LIST)
    } catch (error) {
      console.error('🔥 ~ onSubmit ~ error:', error)
      const customError = error as TCustomError
      const message = customError.response.data.messages.join(',')
      toast.error(message)

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

    if (userId) {
      handleEditModal(event)
    } else {
      form.handleSubmit(onSubmit)()
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-xl font-semibold text-neutral-800">
          {userId ? 'Editar' : 'Novo'} Usuário
        </h1>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href={ROUTES.USERS.LIST}>Usuários</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-brand-tertiary underline">
                {userId ? 'Editar' : 'Cadastrar novo'}
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
                      Nome do Usuário <span className="text-action">*</span>
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

              <FormField
                control={form.control}
                name="email"
                render={({ field, fieldState: { error } }) => (
                  <FormItem>
                    <FormLabel>
                      Login (E-mail) <span className="text-action">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        className={error ? 'border-danger' : ''}
                        placeholder="Digite o login..."
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
              name="assignments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Permissões <span className="text-action">*</span>
                  </FormLabel>
                  <div className="mt-4 grid grid-cols-4 items-start gap-3 border border-solid border-neutral-50 bg-background-300 p-4">
                    {assignments?.map((item) => {
                      const assignmentIndex = field.value.findIndex(
                        (assignment: IAssignment) =>
                          assignment.assignmentId === item.id
                      )
                      const assignmentExists = assignmentIndex !== -1
                      const assignment = field.value[assignmentIndex] || {}

                      const handleCheckboxChange = (
                        property: keyof IAssignment,
                        checked: boolean
                      ) => {
                        const updatedAssignments = [...field.value]
                        if (!assignmentExists && checked) {
                          updatedAssignments.push({
                            assignmentId: item.id,
                            create: false,
                            read: false,
                            update: false,
                            delete: false,
                            [property]: true
                          })
                        } else if (assignmentExists) {
                          updatedAssignments[assignmentIndex] = {
                            ...assignment,
                            [property]: checked
                          }
                        }

                        field.onChange(
                          updatedAssignments.filter(
                            (assn) =>
                              assn.create ||
                              assn.read ||
                              assn.update ||
                              assn.delete
                          )
                        )
                      }

                      return (
                        <div
                          key={item.id}
                          className="flex flex-col items-start space-y-2"
                        >
                          <div className="flex items-center justify-center gap-4">
                            <FormLabel className="text-xs font-bold text-neutral-800">
                              {
                                assignmentNames[
                                  item.name as keyof typeof assignmentNames
                                ]
                              }
                            </FormLabel>
                          </div>
                          {[
                            { label: 'Criar', value: 'create' },
                            { label: 'Ler', value: 'read' },
                            { label: 'Atualizar', value: 'update' },
                            { label: 'Deletar', value: 'delete' }
                          ].map((perm) => (
                            <FormItem
                              key={perm.value}
                              className="flex items-center justify-center gap-3"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={
                                    !!assignment[
                                      perm.value as keyof IAssignment
                                    ]
                                  }
                                  onCheckedChange={(checked: boolean) =>
                                    handleCheckboxChange(
                                      perm.value as keyof IAssignment,
                                      checked
                                    )
                                  }
                                />
                              </FormControl>
                              <FormLabel>{perm.label}</FormLabel>
                            </FormItem>
                          ))}
                        </div>
                      )
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="costCenters"
              render={({ field, fieldState: { error } }) => (
                <FormItem>
                  <FormLabel>
                    Associar Centros de Custo{' '}
                    <span className="text-action">*</span>
                  </FormLabel>
                  <FormControl>
                    <MultiSelect
                      onChange={field.onChange}
                      value={field.value}
                      options={
                        costCenters?.data && costCenters?.data?.length > 0
                          ? costCenters?.data?.map((costCenter) => ({
                              label: costCenter.name,
                              value: costCenter.id
                            }))
                          : []
                      }
                      className={error ? 'border-danger' : ''}
                      placeholder="Selecione o usuário ao qual o centro de custo pertence..."
                      creatable={false}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {(user?.status !== UserStatusEnum.PENDING || !user) && (
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
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex space-x-4"
                      >
                        <FormItem className="flex items-center space-x-1.5 space-y-0">
                          <FormControl>
                            <RadioGroupItem value={UserStatusEnum.ACTIVE} />
                          </FormControl>
                          <FormLabel className="font-normal">Ativo</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-1.5 space-y-0">
                          <FormControl>
                            <RadioGroupItem value={UserStatusEnum.INACTIVE} />
                          </FormControl>
                          <FormLabel className="font-normal">Inativo</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                {isEditing || isCreating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : userId ? (
                  'Salvar Alteração'
                ) : (
                  'Cadastrar Usuário'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
