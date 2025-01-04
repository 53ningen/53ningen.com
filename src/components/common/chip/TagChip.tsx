import { getTag } from '@/lib/tags'
import { Tag } from '@prisma/client'
import Link from 'next/link'
import { FaHashtag } from 'react-icons/fa'
import Chip from './Chip'

type Props = {
  tagId?: number
  tag?: Tag
}

const TagChip = async ({ tagId, tag }: Props) => {
  const t = await retriveTag(tagId, tag)
  if (!t) {
    return <></>
  } else {
    return (
      <Link href={`/tags/${t.id}`} prefetch={false}>
        <Chip text={t.displayName} icon={<FaHashtag />} className="bg-gray-200 text-gray-500 px-2 border-0 mr-1" />
      </Link>
    )
  }
}

const retriveTag = async (tagId?: number, tag?: Tag) => {
  if (tag) {
    return tag
  }
  if (tagId) {
    return await getTag(tagId)
  }
  return undefined
}

export default TagChip
