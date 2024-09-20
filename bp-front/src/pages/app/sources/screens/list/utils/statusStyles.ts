import { SourceStatusEnum } from '@/types'

export const statusStyles = {
  [SourceStatusEnum.ACTIVE]: {
    className: 'bg-success-light text-success',
    label: 'Ativo'
  },
  [SourceStatusEnum.INACTIVE]: {
    className: 'bg-neutral-50 text-neutral-800',
    label: 'Inativo'
  },
  [SourceStatusEnum.PENDING]: {
    className: 'bg-brand-highlight text-brand-secondary',
    label: 'Pendente'
  }
}
