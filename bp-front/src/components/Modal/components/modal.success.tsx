import { Button } from '@/components/ui/button'

export const success = (
  onClose: () => void,
  content: { title: string; message: string },
  onConfirm: () => void
) => {
  return (
    <>
      <p className="text-center text-sm text-neutral-700">{content?.message}</p>

      <div className="flex justify-center">
        <Button
          onClick={onClose}
          className="h-10 w-28 bg-success transition-colors hover:bg-success/80"
        >
          Ok
        </Button>
      </div>
      <div className="hidden">
        <Button
          onClick={onConfirm}
          className="h-10 w-28 bg-success transition-colors hover:bg-success/80"
        >
          Confirmar
        </Button>
      </div>
    </>
  )
}
