import { Outlet } from 'react-router-dom'

import { Header } from '@/components/header'
import { Sidebar } from '@/components/sidebar'

export const DashboardLayout = () => {
  return (
    <Sidebar>
      <Header className="fixed right-0 h-16 w-[calc(100vw-240px)]" />
      <div className="absolute left-[240px] top-16 h-[calc(100vh-4rem)] w-[calc(100vw-240px)] overflow-auto bg-background-200 p-8 dark:bg-background-200">
        <Outlet />
      </div>
    </Sidebar>
  )
}
