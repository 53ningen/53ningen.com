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
          {
            path: `/categories/${category}/${currentPage}`,
            title: `ページ: ${currentPage}`,
          },
        ]}
      />
    </>
  )
}

export default Page

export const getStaticPaths: GetStaticPaths = async () => {
  const all = await fetchAllArticles()
  const categories = await fetchAllCategories()
  let paths: { params: { page: string; category: string } }[] = []
  for (const category of categories) {
    const articles = all.filter((a) => a.category === category)
    const pages = [...new Array(Math.ceil(articles.length / Const.articlesPerPage))].map(
      (_, i) => (i + 1).toString()
    )
    for (const page of pages) {
      paths.push({
        params: {
          page,
          category,
        },
      })
    }
  }
  return {
    paths,
    fallback: 'blocking',
  }
}

export const getStaticProps: GetStaticProps = async (context) => {
  const { page: p, category } = context.params as { page: string; category: string }
  const currentPage = parseInt(p)
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
