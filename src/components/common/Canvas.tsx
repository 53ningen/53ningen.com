interface Props {
  className?: string
  children: React.ReactNode
}

const Canvas = ({ children, className }: Props) => {
  return (
    <div
      className={`      
    bg-white
      mx-0 sm:mx-4 md:mx-8
      px-4 sm:px-8
      py-4 sm:py-8
      xl:max-w-screen-lg xl:mx-auto
      whitespace-normal break-words
      rounded-none sm:rounded-lg
      border-gray-200
      border-t border-b sm:border
      ${className}
      `}>
      {children}
    </div>
  )
}

export default Canvas
