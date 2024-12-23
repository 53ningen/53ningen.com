import Link from 'next/link'
import { GrFormNext, GrFormPrevious } from 'react-icons/gr'

type Props = {
  currentPage: number
  hasNext: boolean
  getPath: (page: number) => string
}

type Index = number | 'PREV' | 'NEXT' | 'LEADERS'

const Pagenation = ({ currentPage, hasNext, getPath }: Props) => {
  const hasPrev = currentPage > 1
  const indices = generateIndices(currentPage, hasNext)

  const Item = ({ index }: { index: Index }) => {
    switch (index) {
      case 'PREV':
        return hasPrev ? (
          <Link href={getPath(currentPage - 1)}>
            <GrFormPrevious className="text-secondary" />
          </Link>
        ) : (
          <GrFormPrevious className="text-secondary" />
        )
      case 'NEXT':
        return hasNext ? (
          <Link href={getPath(currentPage + 1)}>
            <GrFormNext className="text-secondary" />
          </Link>
        ) : (
          <GrFormNext className="text-secondary" />
        )
      case 'LEADERS':
        return <span className="select-none text-secondary">...</span>
      default:
        return index === currentPage ? (
          <div className="flex justify-center items-center text-white bg-secondary font-bold rounded-full h-6 w-6 select-none cursor-pointer">
            {index}
          </div>
        ) : (
          <div className="flex justify-center items-center text-secondary font-bold h-6 w-6 select-none cursor-pointer">
            <Link href={getPath(index)} className="text-primary hover:text-primary">
              {index}
            </Link>
          </div>
        )
    }
  }
  return (
    <div className="flex gap-4 justify-center items-center">
      {indices.map((index, i) => {
        return <Item key={i} index={index} />
      })}
    </div>
  )
}

const generateIndices = (currentPage: number, hasNext: boolean): (number | 'PREV' | 'NEXT' | 'LEADERS')[] => {
  if (currentPage <= 3) {
    const indices = Array.from({ length: hasNext ? currentPage + 1 : currentPage }, (_, i) => i + 1)
    return hasNext ? ['PREV', ...indices, 'LEADERS', 'NEXT'] : indices
  } else {
    return hasNext
      ? ['PREV', 1, 'LEADERS', currentPage - 1, currentPage, currentPage + 1, 'LEADERS', 'NEXT']
      : ['PREV', 1, 'LEADERS', currentPage - 1, currentPage, 'NEXT']
  }
}

export default Pagenation
