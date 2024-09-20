import { useAtom } from 'jotai'

import { AlertIcon } from '@/assets/icons/Alert'
import { ErrorIcon } from '@/assets/icons/Error'
import { SuccessIcon } from '@/assets/icons/Success'
import { modalAtom } from '@/store/modal'

import { Modal } from '../ui/modal'
import { alert } from './components/modal.alert'
import { error } from './components/modal.error'
import { success } from './components/modal.success'

interface ITypeModal {
  alert: JSX.Element
  success: JSX.Element
  error: JSX.Element
}

export const ModalProvider: React.FC = () => {
  const [{ open, type, onClose, onConfirm, content }, setModal] =
    useAtom(modalAtom)

  const closeModal = () => {
    setModal((prevState) => ({ ...prevState, open: false }))
    onClose()
  }
  const confirmModal = () => {
    setModal((prevState) => ({ ...prevState, open: false }))
    onConfirm()
  }

  const typesModal: ITypeModal = {
    alert: alert(closeModal, content, confirmModal),
    success: success(closeModal, content, confirmModal),
    error: error(closeModal, content, confirmModal)
  }
  const modalIcons: ITypeModal = {
    alert: <AlertIcon />,
    success: <SuccessIcon />,
    error: <ErrorIcon />
  }

  return (
    <>
      {open && (
        <Modal
          title={content.title}
          open={true}
          icon={modalIcons[type as keyof ITypeModal]}
          className={type === 'success' ? 'gap-0' : ''}
        >
          {typesModal[type as keyof ITypeModal]}
        </Modal>
      )}
    </>
  )
}
