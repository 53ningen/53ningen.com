import ArticleList from '@/components/articles/ArticleList'
import Pagenation from '@/components/common/Pagenation'
import { listArticlesByTag } from '@/lib/articles'
import Config from '@/lib/config'
import { notFound } from 'next/navigation'

const { articlesPerPage } = Config

type Props = {
  tagId: number
  page: number
}

export const TagArticleList = async ({ tagId, page }: Props) => {
  if (isNaN(page) || page < 1) {
    notFound()
  }

  const articles = await listArticlesByTag(tagId, page)
  if (articles.length === 0) {
    notFound()
  }
  const hasNextPage = articles.length > articlesPerPage
  return (
    <div className="flex flex-col gap-8">
      <ArticleList articles={articles.slice(0, articlesPerPage)} />
      <Pagenation currentPage={page} hasNext={hasNextPage} getPath={(p) => `/tags/${tagId.toString()}/pages/${p.toString()}`} />
    </div>
  )
}
