import { ArticleMeta, listAllArticleMetadata } from '@/APIWrapper'
import { ArticleListPage } from '@/components/Article/ArticleListPage'
import { Meta } from '@/components/Meta'
import { Const } from '@/const'
import type { GetStaticPaths, GetStaticProps } from 'next'

type Props = {
  tag?: string
  articles?: ArticleMeta[]
  tags?: string[]
  pages?: number
  currentPage?: number
}

const Page = ({ tag, articles, tags, pages, currentPage }: Props) => {
  return (
    <>
      {tag && <Meta title={`タグ: ${tag} の記事一覧 | ${Const.siteSubtitle}`} />}
      <ArticleListPage
        articles={articles}
        tags={tags}
        pages={pages}
        currentPage={currentPage}
        pagesBasePath={`/tags/${tag}`}
        paths={
          currentPage
            ? [
                {
                  path: `/tags/${tag}`,
                  title: `タグ: ${tag}`,
                },
                {
                  path: `/tags/${tag}/${currentPage}`,
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
  const { page: p, tag } = context.params as { page: string; tag: string }
  const currentPage = parseInt(p)
  const allArticleMeta = (await listAllArticleMetadata()).filter((a) =>
    a.tags!.items.map((i) => i!.tagID).includes(tag)
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
    const tags = [
      ...new Set(articles.flatMap((a) => a.tags!.items.flatMap((i) => i!.tagID))),
    ]
    const pages = Math.ceil(allArticleMeta.length / Const.articlesPerPage)
    return {
      props: {
        tag,
        articles,
        tags,
        pages,
        currentPage,
      },
      revalidate: Const.revalidateListPageSec,
    }
  }
}
