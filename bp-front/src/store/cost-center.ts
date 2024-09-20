import { atomWithStorage } from 'jotai/utils'

const COST_CENTER_KEY = 'aginco@cost-center'

export const costCenterAtom = atomWithStorage<string>(
  COST_CENTER_KEY,
  localStorage.getItem(COST_CENTER_KEY) ?? ''
)
