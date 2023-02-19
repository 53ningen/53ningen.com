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
import type { GetStaticProps } from 'next'

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
      <Meta title={Const.siteSubtitle} description={Const.siteDescription} />
      <ArticleListPage
        articles={articles}
        pinnedArticles={pinnedArticles}
        categories={categories}
        tags={tags}
        pages={pages}
        currentPage={currentPage}
        pagesBasePath="/pages"
      />
    </>
  )
}

export default Page

export const getStaticProps: GetStaticProps = async () => {
  const articles = (await fetchAllArticles()).slice(0, Const.articlesPerPage)
  const pinnedArticles = await fetchPinnedArticles()
  const categories = await fetchAllCategories()
  const tags = (await fetchAllTags()).slice(0, 30)
  const pages = Math.ceil((await fetchAllArticles()).length / Const.articlesPerPage)
  const currentPage = 1
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
