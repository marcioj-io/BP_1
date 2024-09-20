import { zodResolver } from '@hookform/resolvers/zod'
import { useAtom } from 'jotai'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { CentroCusto } from '@/assets/icons/CentroCusto'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage
} from '@/components/ui/form'
import { Modal } from '@/components/ui/modal'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useGetCostCenters } from '@/hooks/cost-center/useGetCostCenters'
import { costCenterAtom } from '@/store/cost-center'
import { authAtom } from '@/store/user'
import { StatusEnum } from '@/types/modules/packages'

const formSchema = z.object({
  costCenter: z.string().min(1, {
    message: 'Selecione um Centro de Custo'
  })
})

export const CostCenterModal = () => {
  const [costCenter, setCostCenter] = useAtom(costCenterAtom)
  const [open, setOpen] = useState(true)
  const [auth] = useAtom(authAtom)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      costCenter: costCenter
    }
  })

  const {
    handleSubmit,
    control,
    formState: { isDirty }
  } = form

  const onSubmit = ({ costCenter }: z.infer<typeof formSchema>) => {
    setCostCenter(costCenter)
    setOpen(false)
    toast.success('Centro de Custo selecionado com sucesso')
  }

  const { data: costCenters } = useGetCostCenters({
    clientId: auth?.user?.clientId ?? '',
    status: StatusEnum.ACTIVE
  })

  return (
    <Modal
      title="Centro de Custo"
      open={open}
      onOpenChange={setOpen}
      icon={<CentroCusto />}
      preventCloseInteractions
    >
      <p className="text-center">
        Selecione abaixo com qual Centro de Custo deseja trabalhar:
      </p>

      <Form {...form}>
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <FormField
            control={control}
            name="costCenter"
            render={({ field }) => (
              <FormItem>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o Centro de Custo..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {costCenters?.data?.map((costCenter) => (
                      <SelectItem key={costCenter.id} value={costCenter.id}>
                        {costCenter.name}
                      </SelectItem>
                    )) || []}
                  </SelectContent>
                </Select>

                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-center gap-2">
            <Button type="submit" disabled={!isDirty}>
              Confirmar
            </Button>
          </div>
        </form>
      </Form>
    </Modal>
  )
}
