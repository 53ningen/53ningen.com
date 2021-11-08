import { GetStaticPropsResult } from 'next'
import * as React from 'react'
import { Article } from '../../../src/components/Article'
import ArticleListPage from '../../../src/components/ArticleListPage'
import {
  BlogMetadata,
  LocalArticleManager,
} from '../../../src/components/ArticleManager'
import { Meta } from '../../../src/components/common/Meta'
import { Constants } from '../../../src/Constants'

interface Props {
  articles: Article[]
  meta: BlogMetadata
  currentPage: number
  totalPages: number
  tag: string
}
export default function TagPages({
  articles,
  meta,
  currentPage,
  totalPages,
  tag,
}: Props) {
  const title = `タグ: ${tag} (${currentPage}) | ${Constants.title}`
  const description = `タグ: ${tag} の記事一覧`
  return (
    <>
      <Meta title={title} description={description} />
      <ArticleListPage
        articles={articles}
        meta={meta}
        currentPage={currentPage}
        totalPages={totalPages}
        pageBasePath={`/tags/${tag}`}
      />
    </>
  )
}

export async function getStaticPaths() {
  const manager = LocalArticleManager.sharedInstance
  const { tags } = await manager.fetchMetadata()
  let paths = new Array<{ params: { tag: string; page: string } }>()
  for (const tag of tags) {
    const { totalPages } = await manager.fetchTagArticles(tag, 1)
    for (const i of Array.from(Array(totalPages).keys())) {
      paths.push({
        params: {
          tag,
          page: (i + 1).toString(),
        },
      })
    }
  }
  return { paths, fallback: false }
}

export async function getStaticProps(
  context: any
): Promise<GetStaticPropsResult<Props>> {
  const { tag, page } = context.params as {
    tag: string
    page: string
  }
  const manager = LocalArticleManager.sharedInstance
  const { articles, currentPage, totalPages } = await manager.fetchTagArticles(
    tag,
    parseInt(page)
  )
  const meta = await manager.fetchMetadata()
  return {
    props: {
      articles,
      meta,
      currentPage,
      totalPages,
      tag,
    },
  }
}
