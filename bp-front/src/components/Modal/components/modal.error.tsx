import { Button } from '@/components/ui/button'

export const error = (
  onClose: () => void,
  content: { title: string; message: string },
  onConfirm: () => void
) => {
  return (
    <>
      <p className="text-center text-sm text-neutral-700">{content?.message}</p>

      <div className="flex justify-center space-x-3">
        <Button
          onClick={onConfirm}
          className="h-10 w-28 bg-danger hover:bg-danger-dark"
        >
          Ok
        </Button>
        <Button
          onClick={onClose}
          className="h-10 w-28 border border-danger bg-transparent text-red-600 hover:bg-danger-dark hover:text-white"
        >
          Cancelar
        </Button>
      </div>
    </>
  )
}
