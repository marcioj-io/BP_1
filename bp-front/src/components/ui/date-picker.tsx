import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'
import { CalendarIcon } from 'lucide-react'

import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'

import { Button } from './button'
import { Popover, PopoverContent, PopoverTrigger } from './popover'

interface DateSelectorProps {
  fromYear?: number
  toYear?: number
  value?: Date
  onChange: (date: Date) => void
  placeholder?: string
}

const DatePicker: React.FC<DateSelectorProps> = ({
  fromYear = 1900,
  toYear = new Date().getFullYear(),
  value,
  onChange,
  placeholder = 'Selecione uma data'
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'border-neutral-100 pl-3 text-left font-normal hover:bg-transparent focus:border-neutral-900',
            !value && 'text-neutral-400'
          )}
        >
          {value ? (
            format(value, 'P', { locale: ptBR })
          ) : (
            <span>{placeholder}</span>
          )}
          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={(date) => {
            if (date) onChange(date)
          }}
          captionLayout="dropdown-buttons"
          fromYear={fromYear}
          toYear={toYear}
          disabled={(date) =>
            date > new Date() || date < new Date('1900-01-01')
          }
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}

DatePicker.displayName = 'DatePicker'

export { DatePicker }
