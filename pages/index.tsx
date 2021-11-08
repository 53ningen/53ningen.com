import { GetStaticPropsResult } from 'next'
import * as React from 'react'
import { Article } from '../src/components/Article'
import ArticleListPage from '../src/components/ArticleListPage'
import { BlogMetadata, LocalArticleManager } from '../src/components/ArticleManager'
import { Meta } from '../src/components/common/Meta'
import { Constants } from '../src/Constants'

interface Props {
  articles: Article[]
  meta: BlogMetadata
  currentPage: number
  totalPages: number
}

export default function Index({
  articles,
  meta,
  currentPage,
  totalPages,
}: Props) {
  const title = `${Constants.title} | ${Constants.subtitle}`
  const { subtitle: description } = Constants
  return (
    <>
      <Meta title={title} description={description} />
      <ArticleListPage
        articles={articles}
        meta={meta}
        currentPage={currentPage}
        totalPages={totalPages}
        pageBasePath="/pages"
      />
    </>
  )
}

export async function getStaticProps(
  _: any
): Promise<GetStaticPropsResult<Props>> {
  const currentPage = 1
  const manager = LocalArticleManager.sharedInstance
  const { articles, totalPages } = await manager.fetchArticles(currentPage)
  const meta = await manager.fetchMetadata()
  return {
    props: {
      articles: articles,
      meta,
      currentPage,
      totalPages,
    },
  }
}
