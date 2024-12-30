import ArticleList from '@/components/articles/ArticleList'
import Canvas from '@/components/common/Canvas'
import Config from '@/lib/config'
import prisma from '@/lib/prisma'
import { Article_status } from '@prisma/client'

const { articlesPerPage } = Config

type Props = {
  status: Article_status
}

export const NonPublishedArticleList = async ({ status }: Props) => {
  const articles = await prisma.article.findMany({
    where: {
      status,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
  return (
    <div className="flex flex-col gap-8">
      <ArticleList articles={articles.slice(0, articlesPerPage)} basePath="/admin/articles" />
      {articles.length === 0 && (
        <Canvas>
          <div>No articles found</div>
        </Canvas>
      )}
    </div>
  )
}
