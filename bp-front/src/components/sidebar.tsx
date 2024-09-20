import { MountainIcon } from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { ROUTES } from '@/constants'
import { useMenuItems } from '@/constants/menuItems'

export function Sidebar({ children }: { children: React.ReactNode }) {
  const { menuItems } = useMenuItems()

  return (
    <div className="flex h-screen w-full">
      <div className="fixed h-screen w-[240px] border-r-[0.2px] border-text bg-neutral-0 p-6 dark:bg-gray-800">
        <div className="flex h-full flex-col gap-10">
          <div className="flex items-center justify-center">
            <NavLink
              className="flex items-center gap-2 text-lg font-semibold"
              to={ROUTES.DASHBOARD.HOME}
            >
              <MountainIcon className="h-6 w-6" />
              <span>Dashboard</span>
            </NavLink>
          </div>

          <nav className="flex-1 overflow-y-auto">
            <ul className="space-y-1">
              {menuItems?.map((item) => (
                <li key={item.title}>
                  <NavLink
                    className={({ isActive }) =>
                      isActive
                        ? 'flex items-center gap-3 rounded-md bg-brand-highlight p-3 text-sm font-medium text-brand-secondary dark:bg-blue-700 dark:text-white'
                        : 'flex items-center gap-3 rounded-md p-3 text-sm font-medium text-gray-700 text-text transition-colors hover:bg-gray-200 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-50'
                    }
                    to={item.route}
                  >
                    {item.icon}
                    <span className="text-xs font-medium">{item.title}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      {children}
    </div>
  )
}
