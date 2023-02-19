import { Article } from '@/components/Article/Article'
import { ArticleListPage } from '@/components/Article/ArticleListPage'
import { Meta } from '@/components/Meta'
import { Const } from '@/const'
import {
  fetchAllArticles,
  fetchAllCategories,
  fetchAllTags,
  fetchPinnedArticles,
} from '@/local'
import type { GetStaticPaths, GetStaticProps } from 'next'

type Props = {
  articles: Article[]
  pinnedArticles: Article[]
  categories: string[]
  tags: string[]
  pages: number
  currentPage: number
}

const Page = ({
  articles,
  pinnedArticles,
  categories,
  tags,
  pages,
  currentPage,
}: Props) => {
  return (
    <>
      <Meta title={`記事一覧 | ${Const.siteSubtitle}`} />
      <ArticleListPage
        articles={articles}
        pinnedArticles={pinnedArticles}
        categories={categories}
        tags={tags}
        pages={pages}
        currentPage={currentPage}
        pagesBasePath="/pages"
        paths={[{ path: `/pages/${currentPage}`, title: `ページ${currentPage}` }]}
      />
    </>
  )
}

export default Page

export const getStaticPaths: GetStaticPaths = async () => {
  const all = await fetchAllArticles()
  const pages = [...new Array(Math.ceil(all.length / Const.articlesPerPage))].map(
    (_, i) => (i + 1).toString()
  )
  return {
    paths: pages.map((page) => ({
      params: { page },
    })),
    fallback: 'blocking',
  }
}

export const getStaticProps: GetStaticProps = async (context) => {
  const { page: p } = context.params as { page: string }
  const currentPage = parseInt(p)

  const articles = (await fetchAllArticles()).slice(
    Const.articlesPerPage * (currentPage - 1),
    Const.articlesPerPage * currentPage
  )
  const pinnedArticles = await fetchPinnedArticles()
  const categories = await fetchAllCategories()
  const tags = (await fetchAllTags()).slice(0, 30)
  const pages = Math.ceil((await fetchAllArticles()).length / Const.articlesPerPage)
  return {
    props: {
      articles,
      pinnedArticles,
      categories,
      tags,
      pages,
      currentPage,
    },
    // revalidate: Const.revalidatePreGeneratedArticleSec,
  }
}
