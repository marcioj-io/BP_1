import { api } from '@/lib/axios'
import { store } from '@/lib/jotai'
import { authAtom } from '@/store/user'

export interface IUpdateAvatar {
  file: File
}

export async function updateAvatar(content: IUpdateAvatar): Promise<void> {
  const auth = store.get(authAtom)

  const formData = new FormData()
  formData.append('file', content.file)

  const { data } = await api.post(
    `user/${auth?.user?.id}/avatar?module=ADMIN&version=${auth?.user?.version}`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  )
  return data
}
