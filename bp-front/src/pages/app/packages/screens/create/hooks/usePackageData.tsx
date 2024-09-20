import { IGetSourceParams } from '@/api/source/get-sources'
import { useGetOnePackage } from '@/hooks/package/useGetOnePackage'
import { useGetSources } from '@/hooks/source/useGetSources'

export const usePackageData = (packageId: string) => {
  const { data: packageData, isLoading } = useGetOnePackage(packageId ?? '')

  const { data: sources } = useGetSources({} as IGetSourceParams)

  return { packageData, sources, isLoading }
}
