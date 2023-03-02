import { ArticleMeta, listAllArticleMetadata, listAllCategories } from '@/APIWrapper'
import { ArticleListPage } from '@/components/Article/ArticleListPage'
import { Meta } from '@/components/Meta'
import { Const } from '@/const'
import type { GetStaticPaths, GetStaticProps } from 'next'

type Props = {
  articles?: ArticleMeta[]
  pinnedArticles?: ArticleMeta[]
  categories?: string[]
  tags?: string[]
  pages?: number
  currentPage?: number
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
        paths={
          currentPage
            ? [{ path: `/pages/${currentPage}`, title: `ページ${currentPage}` }]
            : []
        }
      />
    </>
  )
}

export default Page

export const getStaticPaths: GetStaticPaths = async () => {
  const all = await listAllArticleMetadata()
  const pages = [...new Array(Math.ceil(all.length / Const.articlesPerPage))].map(
    (_, i) => (i + 1).toString()
  )
  return {
    paths: pages.map((page) => ({
      params: { page },
    })),
    fallback: true,
  }
}

export const getStaticProps: GetStaticProps = async (context) => {
  const { page: p } = context.params as { page: string }
  const currentPage = parseInt(p)

  const categories = await listAllCategories()
  const allArticleMeta = await listAllArticleMetadata()
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
    const pinnedArticles = allArticleMeta.filter((a) => a.pinned)
    const tags = [
      ...new Set(articles.flatMap((a) => a.tags!.items.flatMap((i) => i!.tagID))),
    ]
    const pages = Math.ceil(allArticleMeta.length / Const.articlesPerPage)
    return {
      props: {
        articles,
        pinnedArticles,
        categories,
        tags,
        pages,
        currentPage,
      },
      revalidate: Const.revalidateListPageSec,
    }
  }
}
