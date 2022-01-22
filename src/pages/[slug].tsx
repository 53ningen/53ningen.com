import { Grid } from '@mui/material'
import type { GetStaticPaths, GetStaticProps } from 'next'
import { Article } from '../components/Article'
import { LocalArticleManager } from '../components/ArticleManager'
import { ArticlePage } from '../components/ArticlePage'
import { Header } from '../components/common/Header'
import { Meta } from '../components/common/Meta'
import { Constants } from '../Constants'

type Props = {
  article: Article
}

export default function Slug({ article }: Props) {
  const title = `${article.title} | ${Constants.title}`
  const description = article.content
  return (
    <>
      <Meta title={title} description={description} />
      <Header />
      <Grid pt={2} container spacing={4}>
        <Grid item md={12} xs={12}>
          <ArticlePage article={article} />
        </Grid>
      </Grid>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const manager = LocalArticleManager.sharedInstance
  const all = await manager.fetchAllArticles()
  return {
    paths: all.map(({ slug }) => ({
      params: { slug },
    })),
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps = async (context) => {
  const { slug } = context.params as { slug: string }
  const manager = LocalArticleManager.sharedInstance
  const article = await manager.fetchArticle(slug)
  return {
    props: {
      article,
    },
  }
}
