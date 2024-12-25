import { FaExclamationCircle, FaInfoCircle } from 'react-icons/fa'

type Props = {
  type: 'error' | 'info'
  message: string
}

const Banner = ({ type, message }: Props) => {
  return (
    <div className={`flex items-center justify-center p-2 rounded-md ${type === 'error' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
      {type === 'error' ? <FaExclamationCircle /> : <FaInfoCircle />}
      <span className="ml-2">{message}</span>
    </div>
  )
}

export default Banner
