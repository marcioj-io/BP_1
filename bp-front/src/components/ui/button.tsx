import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-sm text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none transition-all font-semibold',
  {
    variants: {
      variant: {
        default:
          'bg-brand-tertiary text-neutral-0 hover:bg-brand-secondary disabled:bg-neutral-50 disabled:text-neutral-400 h-10',
        secondary:
          'border border-neutral-200 text-neutral-600 hover:border-brand-secondary hover:text-brand-secondary disabled:text-neutral-200 disabled:bg-neutral-0',
        danger: 'bg-danger text-neutral-0 hover:bg-danger-dark',

        // Estilos padrões da lib
        action:
          'bg-action-light text-action hover:brightness-90 font-semibold border border-action',

        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-brand-secondary bg-background hover:bg-accent',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-brand underline-offset-4 hover:underline'
      },
      size: {
        default: 'px-4 py-2.5',
        sm: 'py-[11px] px-4',
        lg: 'h-11 rounded-sm px-8',
        icon: 'h-10 w-10'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
