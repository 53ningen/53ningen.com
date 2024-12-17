interface Props {
  className?: string
  children: React.ReactNode
}

const Container = ({ children, className }: Props) => {
  return (
    <div
      className={`        
        mx-0 sm:mx-4 md:mx-8
        px-4 sm:px-0
        py-4 sm:py-8
        xl:max-w-screen-lg xl:mx-auto
        whitespace-normal break-words
        ${className}`}>
      {children}
    </div>
  )
}

export default Container
