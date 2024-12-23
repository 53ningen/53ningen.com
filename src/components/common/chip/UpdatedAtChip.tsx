import { IoMdRefresh } from 'react-icons/io'
import Chip from './Chip'

type Props = {
  updatedAt: string
}

const UpdatedAtChip = ({ updatedAt }: Props) => {
  return <Chip text={updatedAt} icon={<IoMdRefresh className="text-gray-700 text-sm" />} className="bg-white px-2" />
}

export default UpdatedAtChip
