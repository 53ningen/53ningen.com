import { Article } from '@/components/Article/Article'
import { ArticleListPage } from '@/components/Article/ArticleListPage'
import { Meta } from '@/components/Meta'
import { Const } from '@/const'
import { fetchAllArticles, fetchAllCategories } from '@/local'
import type { GetStaticPaths, GetStaticProps } from 'next'

type Props = {
  category: string
  articles: Article[]
  categories: string[]
  pages: number
  currentPage: number
}

const Page = ({ category, articles, categories, pages, currentPage }: Props) => {
  return (
    <>
      <Meta title={`カテゴリ: ${category} の記事一覧 | ${Const.siteSubtitle}`} />
      <ArticleListPage
        articles={articles}
        categories={categories}
        pages={pages}
        currentPage={currentPage}
        pagesBasePath={`/categories/${category}`}
        paths={[
          {
            path: `/categories/${category}`,
            title: `カテゴリ: ${category}`,
          },
        ]}
      />
    </>
  )
}

export default Page

export const getStaticPaths: GetStaticPaths = async () => {
  const categories = await fetchAllCategories()
  return {
    paths: categories.map((category) => ({
      params: {
        category,
      },
    })),
    fallback: 'blocking',
  }
}

export const getStaticProps: GetStaticProps = async (context) => {
  const { category } = context.params as { category: string }
  const currentPage = 1
  const all = (await fetchAllArticles()).filter((a) => a.category === category)
  const articles = all.slice(
    Const.articlesPerPage * (currentPage - 1),
    Const.articlesPerPage * currentPage
  )
  const categories = await fetchAllCategories()
  const pages = Math.ceil(all.length / Const.articlesPerPage)
  return {
    props: {
      category,
      articles,
      categories,
      pages,
      currentPage,
    },
    // revalidate: Const.revalidatePreGeneratedArticleSec,
  }
}
