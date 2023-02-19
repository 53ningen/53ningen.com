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
          {
            path: `/tags/${tag}/${currentPage}`,
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
  const tags = await fetchAllTags()
  let paths: { params: { page: string; tag: string } }[] = []
  for (const tag of tags) {
    const articles = all.filter((a) => a.tags.includes(tag))
    const pages = [...new Array(Math.ceil(articles.length / Const.articlesPerPage))].map(
      (_, i) => (i + 1).toString()
    )
    for (const page of pages) {
      paths.push({
        params: {
          page,
          tag,
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
  const { page: p, tag } = context.params as { page: string; tag: string }
  const currentPage = parseInt(p)
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
