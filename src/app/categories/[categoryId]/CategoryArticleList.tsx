import ArticleList from '@/components/articles/ArticleList'
import Pagenation from '@/components/common/Pagenation'
import { listArticlesByCategory } from '@/lib/articles'
import Config from '@/lib/config'
import { notFound } from 'next/navigation'

const { articlesPerPage } = Config

type Props = {
  categoryId: number
  page: number
}

export const CategoryArticleList = async ({ categoryId, page }: Props) => {
  if (isNaN(page) || page < 1) {
    notFound()
  }

  const articles = await listArticlesByCategory(categoryId, page)
  if (articles.length === 0) {
    notFound()
  }
  const hasNextPage = articles.length > articlesPerPage
  return (
    <div className="flex flex-col gap-8">
      <ArticleList articles={articles.slice(0, articlesPerPage)} />
      <Pagenation currentPage={page} hasNext={hasNextPage} getPath={(p) => `/categories/${categoryId.toString()}/pages/${p.toString()}`} />
    </div>
  )
}
