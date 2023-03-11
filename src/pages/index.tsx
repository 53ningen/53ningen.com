import { ArticleMeta, listAllArticleMetadata, listAllCategories } from '@/APIWrapper'
import { ArticleListPage } from '@/components/Article/ArticleListPage'
import { Meta } from '@/components/Meta'
import { Const } from '@/const'
import { Box, Tab, Tabs } from '@mui/material'
import type { GetStaticProps } from 'next'
import { useRouter } from 'next/router'

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
  const router = useRouter()
  const onChangeTab = (event: any, v: any) => {
    switch (v) {
      case 1:
        router.push('/docs')
        break
      case 2:
        window.open('https://p.53ningen.com')
        break
    }
  }
  return (
    <>
      <Meta title={Const.siteSubtitle} description={Const.siteDescription} />
      <Box px={{ xs: 2, sm: 2, md: 4 }} pt={2}>
        <Tabs value={0} onChange={onChangeTab} centered scrollButtons="auto">
          <Tab label="Blog" id="blogs" />
          <Tab label="Docs" id="documents" />
          <Tab label="Profile" id="profile" />
        </Tabs>
      </Box>
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
