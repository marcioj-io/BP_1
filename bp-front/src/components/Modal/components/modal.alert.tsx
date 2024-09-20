import { Button } from '@/components/ui/button'

export const alert = (
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
          className="h-10 w-28 bg-warning hover:bg-warning/80"
        >
          Confirmar
        </Button>
        <Button
          variant="secondary"
          onClick={onClose}
          className="h-10 w-28 border border-warning bg-transparent text-warning hover:border-warning/80 hover:text-warning/80"
        >
          Cancelar
        </Button>
      </div>
    </>
  )
}
