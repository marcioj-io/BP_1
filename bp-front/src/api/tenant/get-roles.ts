import { api } from '@/lib/axios'

export async function getRoles() {
  const { data } = await api.get('/tenant/roles', {
    params: {
      module: 'ADMIN'
    }
  })
  return data
}
