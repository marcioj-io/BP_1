import { SourceStatusEnum } from '@/types/modules/source'

import { statusStyles } from '../utils/statusStyles'

interface StatusIndicatorProps {
  status: SourceStatusEnum
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status }) => (
  <div
    className={`mx-auto w-fit whitespace-nowrap rounded-full px-2 py-0.5 ${statusStyles[status].className}`}
  >
    {statusStyles[status].label}
  </div>
)
