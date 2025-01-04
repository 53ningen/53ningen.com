import Chip from '@/components/common/chip/Chip'
import { getCategory } from '@/lib/categories'
import Link from 'next/link'
import { FaFolder } from 'react-icons/fa'

type Props = {
  categoryId: number
}

const CategoryChip = async ({ categoryId }: Props) => {
  const category = await getCategory(categoryId)
  if (!category) {
    return <></>
  }
  return (
    <Link href={`/categories/${category.id}`} prefetch={false}>
      <Chip text={category.displayName} icon={<FaFolder />} className="bg-gray-200 text-gray-500 px-2 border-0 mr-1" />
    </Link>
  )
}

export default CategoryChip
