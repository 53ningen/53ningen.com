import ArticleList from '@/components/articles/ArticleList'
import Pagenation from '@/components/common/Pagenation'
import { listArticles } from '@/lib/articles'
import Config from '@/lib/config'
import { notFound } from 'next/navigation'

const { articlesPerPage } = Config

type Props = {
  page: number
}

export const PagesArticleList = async ({ page }: Props) => {
  if (isNaN(page) || page < 1) {
    notFound()
  }

  const articles = await listArticles(page)
  if (articles.length === 0) {
    notFound()
  }
  const hasNextPage = articles.length > articlesPerPage
  return (
    <div className="flex flex-col gap-8">
      <ArticleList articles={articles.slice(0, articlesPerPage)} />
      <Pagenation currentPage={page} hasNext={hasNextPage} getPath={(p) => `/pages/${p.toString()}`} />
    </div>
  )
}
