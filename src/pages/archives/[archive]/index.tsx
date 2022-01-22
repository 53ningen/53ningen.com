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
  archive: string
}
export default function ArchivePageIndex({
  articles,
  meta,
  currentPage,
  totalPages,
  archive,
}: Props) {
  const title = `${archive} の記事 | ${Constants.title}`
  const description = `${archive} の記事一覧`
  return (
    <>
      <Meta title={title} description={description} />
      <ArticleListPage
        articles={articles}
        meta={meta}
        currentPage={currentPage}
        totalPages={totalPages}
        pageBasePath={`/archives/${archive}`}
      />
    </>
  )
}

export async function getStaticPaths() {
  const manager = LocalArticleManager.sharedInstance
  const { archives } = await manager.fetchMetadata()
  const paths = archives.map((archive) => ({
    params: {
      archive,
    },
  }))
  return { paths, fallback: false }
}

export async function getStaticProps(
  context: any
): Promise<GetStaticPropsResult<Props>> {
  const { archive } = context.params as { archive: string }
  const manager = LocalArticleManager.sharedInstance
  const articles = await manager.fetchArchiveArticles(archive)
  const meta = await manager.fetchMetadata()
  return {
    props: {
      articles,
      meta,
      currentPage: 1,
      totalPages: 1,
      archive,
    },
  }
}
