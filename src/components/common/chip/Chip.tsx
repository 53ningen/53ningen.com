import { ReactNode } from 'react'

interface Props {
  text: string
  icon?: ReactNode
  className?: string
}

const Chip = ({ text, icon, className }: Props) => {
  return (
    <div className="inline-block">
      <div className={`flex gap-1 items-center justify-center border p-1 text-xs rounded-full text-gray-500 select-none ${className}`}>
        {icon && <span>{icon}</span>}
        <span>{text}</span>
      </div>
    </div>
  )
}

export default Chip
