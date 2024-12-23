import { listTagsByArticleId } from '@/lib/tags'
import TagChip from './TagChip'

type Props = {
  articleId: number
}

const TagChips = async ({ articleId }: Props) => {
  const tags = await listTagsByArticleId(articleId)
  return (
    <>
      {tags.map((tag) => (
        <TagChip key={tag.id} tagId={tag.id} />
      ))}
    </>
  )
}

export default TagChips
