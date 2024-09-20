import { atom } from 'jotai'

export type ModalType = 'alert' | 'success' | 'error'

export const modalAtom = atom<{
  open: boolean
  type: ModalType
  onClose: () => void
  onConfirm: () => void
  content: {
    title: string
    message: string
  }
}>({
  open: false,
  type: 'alert',
  onClose: () => {},
  onConfirm: () => {},
  content: {
    title: '',
    message: ''
  }
})
