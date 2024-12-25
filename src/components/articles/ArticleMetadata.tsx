import { getArticle } from '@/lib/articles'
import { ISO8601toJPDateTimeStr } from '@/lib/datetime'
import { notFound } from 'next/navigation'
import EditButton from '../admin/EditButton'
import Breadcrumbs from '../common/Breadcrumbs'
import Container from '../common/Container'
import CategoryChip from '../common/chip/CategoryChip'
import CreatedAtChip from '../common/chip/CreatedAtChip'
import TagChips from '../common/chip/TagChips'
import UpdatedAtChip from '../common/chip/UpdatedAtChip'

type Props = {
  slug: string
}

const ArticleMetadata = async ({ slug }: Props) => {
  const article = await getArticle(slug)
  if (!article) {
    return notFound()
  }
  const created = ISO8601toJPDateTimeStr(article.createdAt)
  const updated = ISO8601toJPDateTimeStr(article.updatedAt)
  return (
    <Container className="flex flex-col gap-2">
      <Breadcrumbs
        items={[
          {
            name: article.title,
            href: `/${slug}`,
          },
        ]}
      />
      <div className="flex gap-2 items-center">
        <EditButton path={`/admin/articles/${slug}`} />
        <h1 className="text-xl font-bold">{article.title}</h1>
      </div>
      <div className="flex gap-1">
        <CreatedAtChip createdAt={created} />
        <UpdatedAtChip updatedAt={updated} />
      </div>
      <div className="flex gap-1">
        <CategoryChip categoryId={article.categoryId} />
        <TagChips articleId={article.id} />
      </div>
    </Container>
  )
}

export default ArticleMetadata
