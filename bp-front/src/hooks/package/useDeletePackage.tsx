import { useMutation } from '@tanstack/react-query'

import {
  deletePackage,
  IDeletePackageParams
} from '@/api/packages/delete-packages'

export const useDeletePackage = () => {
  return useMutation({
    mutationFn: (params: IDeletePackageParams) => deletePackage(params)
  })
}
