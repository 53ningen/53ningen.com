import { HiOutlinePencilSquare } from 'react-icons/hi2'
import Chip from './Chip'

type Props = {
  createdAt: string
}

const CreatedAtChip = ({ createdAt }: Props) => {
  return <Chip text={createdAt} icon={<HiOutlinePencilSquare className="text-gray-700 text-sm" />} className="bg-white px-2" />
}

export default CreatedAtChip
