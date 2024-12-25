import ArticleList from '@/components/articles/ArticleList'
import Config from '@/lib/config'
import prisma from '@/lib/prisma'

const { articlesPerPage } = Config

export const DraftArticleList = async () => {
  const articles = await prisma.article.findMany({
    where: {
      status: 'DRAFT',
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
  return (
    <div className="flex flex-col gap-8">
      <ArticleList articles={articles.slice(0, articlesPerPage)} basePath="/admin/articles" />
    </div>
  )
}
