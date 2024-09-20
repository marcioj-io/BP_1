import React from 'react'

import { cn } from '@/lib/utils'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog'

interface DialogProps
  extends React.ComponentPropsWithoutRef<typeof DialogContent> {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  icon?: React.ReactNode
  preventCloseInteractions?: boolean
}

export const Modal = React.forwardRef<
  React.ElementRef<typeof DialogContent>,
  DialogProps
>(
  (
    {
      children,
      title,
      open,
      onOpenChange,
      preventCloseInteractions = false,
      ...props
    },
    ref
  ) => {
    const handleInteractOutside = (event: Event) => {
      if (preventCloseInteractions) {
        event.preventDefault()
      }
    }

    const handleEscapeKeyDown = (event: KeyboardEvent) => {
      if (preventCloseInteractions) {
        event.preventDefault()
      }
    }

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          {...props}
          ref={ref}
          className={cn('p-8', props.className)}
          onInteractOutside={handleInteractOutside}
          onEscapeKeyDown={handleEscapeKeyDown}
        >
          <DialogHeader>
            <DialogTitle className="flex flex-col items-center gap-4 text-center">
              <div>{props.icon}</div>
              <p className="text-xl font-semibold">{title}</p>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">{children}</div>
        </DialogContent>
      </Dialog>
    )
  }
)
Modal.displayName = 'Modal'
