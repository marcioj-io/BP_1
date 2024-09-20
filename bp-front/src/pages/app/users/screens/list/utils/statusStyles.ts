import { UserStatusEnum } from '@/types'

export const statusStyles = {
  [UserStatusEnum.ACTIVE]: {
    className: 'bg-success-light text-success',
    label: 'Ativo'
  },
  [UserStatusEnum.INACTIVE]: {
    className: 'bg-neutral-50 text-neutral-800',
    label: 'Inativo'
  },
  [UserStatusEnum.PENDING]: {
    className: 'bg-brand-highlight text-brand-secondary',
    label: 'Pendente'
  }
}
