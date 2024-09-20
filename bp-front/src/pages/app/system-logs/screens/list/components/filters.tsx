import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { DateParam, StringParam, useQueryParams } from 'use-query-params'
import { z } from 'zod'

import { FilterIcon } from '@/assets/icons/Filter'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet'
import { useGetUsers } from '@/hooks/users/useGetUsers'

enum EventTypeEnum {
  SYSTEM = 'Sistema',
  RESEARCH = 'Pesquisa'
}

const formSchema = z.object({
  startDate: z.date().optional().nullable(),
  endDate: z.date().optional().nullable(),
  user: z.string().optional(),
  type: z.string().optional()
})

export const Filters = () => {
  const { data: users } = useGetUsers()

  const [query, setQuery] = useQueryParams({
    startDate: DateParam,
    endDate: DateParam,
    user: StringParam,
    type: StringParam
  })

  const defaultValues = {
    startDate: query.startDate || undefined,
    endDate: query.endDate || undefined,
    user: query.user || '',
    type: query.type || ''
  }

  const [isSheetOpen, setSheetOpen] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues
  })

  const {
    handleSubmit,
    control,
    formState: { isDirty },
    reset
  } = form

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    const filteredData = Object.fromEntries(
      Object.entries(data).filter(([, value]) => !!value)
    )

    setQuery(filteredData, 'push')
    setSheetOpen(false)
  }

  const handleClear = () => {
    setQuery({}, 'push')
    reset({ endDate: null, startDate: null, type: '', user: '' })
  }

  return (
    <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger>
        <div className="flex w-[105px] items-center gap-1.5 rounded-sm bg-brand-tertiary px-4 py-2 text-sm font-semibold text-neutral-0 transition-colors hover:bg-brand-secondary disabled:bg-neutral-50 disabled:text-neutral-400">
          Filtros
          <FilterIcon />
        </div>
      </SheetTrigger>
      <SheetContent className="flex h-full flex-col">
        <SheetHeader>
          <SheetTitle>Filtros</SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form
            className="flex h-full flex-col justify-between p-6"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="space-y-6">
              <FormField
                control={control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data Inicial</FormLabel>
                    <DatePicker
                      value={field.value ?? undefined}
                      onChange={field.onChange}
                      fromYear={2015}
                      toYear={2025}
                      placeholder="Selecione a data inicial..."
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data Final</FormLabel>
                    <DatePicker
                      value={field.value ?? undefined}
                      onChange={field.onChange}
                      fromYear={2015}
                      toYear={2025}
                      placeholder="Selecione a data final..."
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="user"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Usuário</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o usuário..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {users?.data.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="type"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Origem</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a origem..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(EventTypeEnum).map(([key, value]) => (
                          <SelectItem key={key} value={key}>
                            {value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex w-full gap-4">
              <Button
                type="button"
                className="w-full"
                variant="secondary"
                onClick={handleClear}
              >
                Limpar
              </Button>
              <Button className="w-full" type="submit" disabled={!isDirty}>
                Filtrar
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
