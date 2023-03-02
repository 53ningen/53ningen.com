import { ArticleMeta, listAllArticleMetadata, listAllCategories } from '@/APIWrapper'
import { ArticleListPage } from '@/components/Article/ArticleListPage'
import { Meta } from '@/components/Meta'
import { Const } from '@/const'
import type { GetStaticPaths, GetStaticProps } from 'next'

type Props = {
  category?: string
  articles?: ArticleMeta[]
  categories?: string[]
  pages?: number
  currentPage?: number
}

const Page = ({ category, articles, categories, pages, currentPage }: Props) => {
  return (
    <>
      {category && (
        <Meta title={`カテゴリ: ${category} の記事一覧 | ${Const.siteSubtitle}`} />
      )}
      <ArticleListPage
        articles={articles}
        categories={categories}
        pages={pages}
        currentPage={currentPage}
        pagesBasePath={`/categories/${category}`}
        paths={
          currentPage
            ? [
                {
                  path: `/categories/${category}`,
                  title: `カテゴリ: ${category}`,
                },
                {
                  path: `/categories/${category}/${currentPage}`,
                  title: `ページ: ${currentPage}`,
                },
              ]
            : []
        }
      />
    </>
  )
}

export default Page

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: true,
  }
}

export const getStaticProps: GetStaticProps = async (context) => {
  const { page: p, category } = context.params as { page: string; category: string }
  const currentPage = parseInt(p)
  const allArticleMeta = (await listAllArticleMetadata()).filter(
    (a) => a.category.id === category
  )
  const articles = allArticleMeta.slice(
    Const.articlesPerPage * (currentPage - 1),
    Const.articlesPerPage * currentPage
  )
  if (articles.length === 0) {
    return {
      notFound: true,
      revalidate: Const.revalidateListPageSec,
    }
  } else {
    const pages = Math.ceil(allArticleMeta.length / Const.articlesPerPage)
    const categories = await listAllCategories()
    return {
      props: {
        category,
        articles,
        categories,
        pages,
        currentPage,
      },
      revalidate: Const.revalidateListPageSec,
    }
  }
}
