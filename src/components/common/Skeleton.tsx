type Props = {
  lines: number
}

const Skelton = ({ lines }: Props) => {
  return (
    <div className="animate-pulse">
      {Array.from({ length: lines - 1 }).map((_, i) => (
        <div key={i} className="bg-gray-200 h-4 w-full rounded-md my-1"></div>
      ))}
      <div className="bg-gray-200 h-4 w-1/2 rounded-md my-1"></div>
    </div>
  )
}

export default Skelton
