import { LucideProps } from 'lucide-react'
import React, { ForwardRefExoticComponent, RefAttributes } from 'react'

import { cn } from '@/lib/utils'

import { Input } from './input'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>
  >
  iconPosition?: 'left' | 'right'
  iconClassName?: string
}

const InputWithIcon = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      icon: Icon,
      iconPosition = 'right',
      iconClassName = 'h-5 w-5',
      ...props
    },
    ref
  ) => {
    const iconPositionClass = iconPosition === 'left' ? 'left-4' : 'right-4'
    const inputClass =
      iconPosition === 'left'
        ? 'pl-[calc(1rem+20px+8px)]'
        : 'pr-[calc(1rem+20px+8px)]'

    return (
      <div className="relative w-full">
        <div
          className={cn(
            'absolute top-1/2 z-10 -translate-y-1/2 transform',
            iconPositionClass
          )}
        >
          <Icon className={cn('text-neutral-400', iconClassName)} />
        </div>

        <Input
          ref={ref}
          type={type}
          className={cn(inputClass, className)}
          {...props}
        />
      </div>
    )
  }
)

InputWithIcon.displayName = 'InputWithIcon'

export { InputWithIcon }
