interface Props {
  className?: string
  children?: React.ReactNode
}
const WidgetCanvas = ({ children, className }: Props) => {
  return (
    <div
      className={`      
        bg-white
          mr-0 sm:mr-4 md:mr-8
          px-4 py-4
          whitespace-normal break-words
          rounded-none sm:rounded-lg
          border-gray-200
          border-t border-b sm:border
          w-full
          ${className}
          `}>
      {children}
    </div>
  )
}

export default WidgetCanvas
