import ArticleEditor from '@/components/admin/ArticleEditor'
import Container from '@/components/common/Container'
import { listCategories } from '@/lib/categories'
import prisma from '@/lib/prisma'

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
  return (
    <div>
      <Container className="flex flex-col gap-2">
        <ArticleEditor slug={slug} article={article} categories={categories} />
      </Container>
    </div>
  )
}

export default EditArticle
