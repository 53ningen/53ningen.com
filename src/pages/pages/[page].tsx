import { GetStaticPropsResult } from 'next'
import * as React from 'react'
import { Article } from '../../components/Article'
import ArticleListPage from '../../components/ArticleListPage'
import {
  BlogMetadata,
  LocalArticleManager,
} from '../../components/ArticleManager'
import { Meta } from '../../components/common/Meta'
import { Constants } from '../../Constants'

interface Props {
  articles: Article[]
  meta: BlogMetadata
  currentPage: number
  totalPages: number
}

export default function Pages({
  articles,
  meta,
  currentPage,
  totalPages,
}: Props) {
  const title = `過去の投稿 (${currentPage}) | ${Constants.title}`
  const description = `${Constants.title} の記事一覧`
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

export async function getStaticPaths() {
  const manager = LocalArticleManager.sharedInstance
  const { totalPages } = await manager.fetchArticles(1)
  const paths = Array.from(Array(totalPages).keys()).map((i) => ({
    params: {
      page: (i + 1).toString(),
    },
  }))
  return { paths, fallback: false }
}

export async function getStaticProps(
  context: any
): Promise<GetStaticPropsResult<Props>> {
  const currentPage = parseInt((context.params as { page: string }).page)
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
