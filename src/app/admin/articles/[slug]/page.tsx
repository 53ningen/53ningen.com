import ArticleEditor from '@/components/admin/ArticleEditor'
import ArticleTagEditor from '@/components/admin/ArticleTagEditor'
import Container from '@/components/common/Container'
import { listCategories } from '@/lib/categories'
import prisma from '@/lib/prisma'
import { listTagsByArticleId } from '@/lib/tags'

interface Props {
  params: Promise<{ slug: string }>
}

const EditArticle = async ({ params }: Props) => {
  const p = await params
  const { slug } = p
  const article = await prisma.article.findUnique({
    where: {
      slug,
    },
  })
  const categories = await listCategories()
  const tags = article ? await listTagsByArticleId(article.id) : []
  return (
    <div>
      <Container className="flex flex-col gap-2">
        <ArticleEditor slug={slug} article={article} categories={categories} />
        <ArticleTagEditor tags={tags} />
      </Container>
    </div>
  )
}

export default EditArticle
