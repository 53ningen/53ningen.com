import { ArticleMeta, listAllArticleMetadata, listAllTags } from '@/APIWrapper'
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
        paths={[
          {
            path: `/tags/${tag}`,
            title: `タグ: ${tag}`,
          },
        ]}
      />
    </>
  )
}

export default Page

export const getStaticPaths: GetStaticPaths = async () => {
  const tags = await listAllTags()
  return {
    paths: tags.map((tag) => ({
      params: {
        tag,
      },
    })),
    fallback: true,
  }
}

export const getStaticProps: GetStaticProps = async (context) => {
  const { tag } = context.params as { tag: string }
  const currentPage = 1
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
