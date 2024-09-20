interface BaseCardProps {
  title: string
  children: React.ReactNode
}

export const BaseCard: React.FC<BaseCardProps> = ({ title, children }) => {
  return (
    <div className="w-full space-y-4 rounded-lg bg-neutral-0 p-4">
      <p className="w-full rounded-sm bg-brand-highlight p-1 text-center font-bold uppercase text-brand-secondary">
        {title}
      </p>
      <div>{children}</div>
    </div>
  )
}
