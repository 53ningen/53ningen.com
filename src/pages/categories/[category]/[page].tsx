import { GetStaticPropsResult } from 'next'
import * as React from 'react'
import { Article } from '../../../components/Article'
import ArticleListPage from '../../../components/ArticleListPage'
import {
  BlogMetadata,
  LocalArticleManager,
} from '../../../components/ArticleManager'
import { Meta } from '../../../components/common/Meta'
import { Constants } from '../../../Constants'

interface Props {
  articles: Article[]
  meta: BlogMetadata
  currentPage: number
  totalPages: number
  category: string
}
export default function CategoryPages({
  articles,
  meta,
  currentPage,
  totalPages,
  category,
}: Props) {
  const title = `カテゴリ: ${category} (${currentPage}) | ${Constants.title}`
  const description = `カテゴリ: ${category} の記事一覧`
  return (
    <>
      <Meta title={title} description={description} />
      <ArticleListPage
        articles={articles}
        meta={meta}
        currentPage={currentPage}
        totalPages={totalPages}
        pageBasePath={`/categories/${category}`}
      />
    </>
  )
}

export async function getStaticPaths() {
  const manager = LocalArticleManager.sharedInstance
  const { categories } = await manager.fetchMetadata()
  let paths = new Array<{ params: { category: string; page: string } }>()
  for (const category of categories) {
    const { totalPages } = await manager.fetchCategoryArticles(category, 1)
    for (const i of Array.from(Array(totalPages).keys())) {
      paths.push({
        params: {
          category: category,
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
  const { category, page } = context.params as {
    category: string
    page: string
  }
  const manager = LocalArticleManager.sharedInstance
  const { articles, currentPage, totalPages } =
    await manager.fetchCategoryArticles(category, parseInt(page))
  const meta = await manager.fetchMetadata()
  return {
    props: {
      articles,
      meta,
      currentPage,
      totalPages,
      category,
    },
  }
}
