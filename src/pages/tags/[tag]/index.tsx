import { Article } from '@/components/Article/Article'
import { ArticleListPage } from '@/components/Article/ArticleListPage'
import { Meta } from '@/components/Meta'
import { Const } from '@/const'
import { fetchAllArticles, fetchAllTags } from '@/local'
import type { GetStaticPaths, GetStaticProps } from 'next'

type Props = {
  tag: string
  articles: Article[]
  tags: string[]
  pages: number
  currentPage: number
}

const Page = ({ tag, articles, tags, pages, currentPage }: Props) => {
  return (
    <>
      <Meta title={`タグ: ${tag} の記事一覧 | ${Const.siteSubtitle}`} />
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
  const tags = await fetchAllTags()
  return {
    paths: tags.map((tag) => ({
      params: {
        tag,
      },
    })),
    fallback: 'blocking',
  }
}

export const getStaticProps: GetStaticProps = async (context) => {
  const { tag } = context.params as { tag: string }
  const currentPage = 1
  const all = (await fetchAllArticles()).filter((a) => a.tags.includes(tag))
  const articles = all.slice(
    Const.articlesPerPage * (currentPage - 1),
    Const.articlesPerPage * currentPage
  )
  const tags = (await fetchAllTags()).slice(0, 30)
  const pages = Math.ceil(all.length / Const.articlesPerPage)
  return {
    props: {
      tag,
      articles,
      tags,
      pages,
      currentPage,
    },
    // revalidate: Const.revalidatePreGeneratedArticleSec,
  }
}
