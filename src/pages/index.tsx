import { ArticleMeta, listAllArticleMetadata, listAllCategories } from '@/APIWrapper'
import { ArticleListPage } from '@/components/Article/ArticleListPage'
import { Meta } from '@/components/Meta'
import { Const } from '@/const'
import type { GetStaticProps } from 'next'

type Props = {
  articles: ArticleMeta[]
  pinnedArticles: ArticleMeta[]
  tags: string[]
  categories: string[]
  pages: number
  currentPage: number
}

const Page = ({
  articles,
  pinnedArticles,
  tags,
  categories,
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
  const categories = await listAllCategories()
  const allArticleMeta = await listAllArticleMetadata()
  const articles = allArticleMeta.slice(0, Const.articlesPerPage)
  const pinnedArticles = allArticleMeta.filter((a) => a.pinned)
  const tags = [
    ...new Set(articles.flatMap((a) => a.tags!.items.flatMap((i) => i!.tagID))),
  ]
  const pages = Math.ceil(allArticleMeta.length / Const.articlesPerPage)
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
    revalidate: Const.revalidateImportPageSec,
  }
}
