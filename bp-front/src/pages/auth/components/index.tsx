import { ReactNode } from 'react'

export const ActionSubmit = ({ children }: { children: ReactNode }) => (
  <div className="mt-2.5 flex w-[300px] flex-col gap-2.5">{children}</div>
)
