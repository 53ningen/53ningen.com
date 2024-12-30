import { CgCloseR } from 'react-icons/cg'
import { FaExclamationCircle, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa'

type BannerType = 'error' | 'warn' | 'info'

type Props = {
  type: BannerType
  message: string
  onClose?: (() => void) | (() => Promise<void>)
}

const Banner = ({ message, type = 'info', onClose }: Props) => {
  const getIcon = (type: BannerType) => {
    switch (type) {
      case 'error':
        return <FaExclamationCircle />
      case 'warn':
        return <FaExclamationTriangle />
      case 'info':
      default:
        return <FaInfoCircle />
    }
  }
  const getColor = (type: BannerType) => {
    switch (type) {
      case 'error':
        return 'bg-red-100 text-red-800'
      case 'warn':
        return 'bg-yellow-100 text-yellow-800'
      case 'info':
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }
  const color = getColor(type)
  return (
    <div className={`flex justify-between p-2 rounded-md ${color}`}>
      <div className="flex items-center justify-start">
        {getIcon(type)}
        <span className="ml-2">{message}</span>
      </div>
      {onClose && (
        <div className="flex items-center justify-end">
          <button className="mr-2" onClick={onClose}>
            <CgCloseR />
          </button>
        </div>
      )}
    </div>
  )
}

export default Banner
