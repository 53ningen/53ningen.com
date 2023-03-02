import { Article, GetArticleQuery } from '@/API'
import { listAllSlugs } from '@/APIWrapper'
import { ArticleBody } from '@/components/Article/ArticleBody'
import { ArticleIndex } from '@/components/Article/ArticleIndex'
import { ArticleMetadata } from '@/components/Article/ArticleMetadata'
import { Meta } from '@/components/Meta'
import { ShareButtons } from '@/components/ShareButtons'
import { About } from '@/components/Widgets/About'
import { Const } from '@/const'
import { getSlugPageProps } from '@/graphql/custom-queries'
import theme from '@/theme'
import { GraphQLResult } from '@aws-amplify/api-graphql'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import { Fab, Stack } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2'
import { API, graphqlOperation } from 'aws-amplify'
import type { GetStaticPaths, GetStaticProps } from 'next'
import { useEffect, useState } from 'react'

type Props = {
  article?: Article
}

const Page = ({ article: givenArticle }: Props) => {
  const [article, setArticle] = useState<Article | undefined>(givenArticle)
  useEffect(() => {
    setArticle(givenArticle)
  }, [givenArticle])
  return (
    <>
      {article && (
        <Meta
          title={`${article.title} | ${Const.siteSubtitle}`}
          description={article.body.slice(0, 200)}
        />
      )}
      <Stack>
        <ArticleMetadata meta={article} />
        <Grid
          container
          spacing={{ xs: 0, sm: 0, md: 2 }}
          px={{ xs: 0, sm: 1, md: 2 }}
          width="100%">
          <Grid xs={12} sm={12} md={8.5}>
            <ArticleBody body={article?.body} />
          </Grid>
          <Grid
            display={{ xs: 'none', sm: 'none', md: 'block' }}
            md={3.5}
            sx={{
              position: 'sticky',
              top: theme.spacing(60 / 8 + 2),
              maxHeight: '80vh',
              overflowY: 'scroll',
            }}>
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} px={2}>
                {article && (
                  <ShareButtons
                    url={`${Const.siteUrl}/${article.slug}`}
                    title={article.title}
                    size={24}
                  />
                )}
              </Stack>
              <ArticleIndex body={article?.body} />
              <About />
            </Stack>
          </Grid>
        </Grid>
      </Stack>
      <Fab
        color="secondary"
        onClick={() => window?.scrollTo({ top: 0, behavior: 'smooth' })}
        sx={{
          position: 'fixed',
          bottom: { xs: theme.spacing(4), sm: theme.spacing(4), md: theme.spacing(8) },
          right: { xs: theme.spacing(4), sm: theme.spacing(4), md: theme.spacing(8) },
        }}>
        <KeyboardArrowUpIcon />
      </Fab>
    </>
  )
}

export default Page

export const getStaticPaths: GetStaticPaths = async () => {
  const slugs: string[] = await listAllSlugs()
  return {
    paths: slugs.map((slug) => {
      return {
        params: {
          slug,
        },
      }
    }),
    fallback: true,
  }
}

export const getStaticProps: GetStaticProps<Props> = async (context) => {
  const { slug } = context.params as { slug: string }
  const res = (await API.graphql(
    graphqlOperation(getSlugPageProps, { slug })
  )) as GraphQLResult<GetArticleQuery>
  if (res.data?.getArticle) {
    const article = res.data.getArticle as Article
    return {
      props: {
        article,
      },
      revalidate: Const.revalidateImportPageSec,
    }
  } else {
    return {
      notFound: true,
      revalidate: Const.revalidateNotFoundPageSec,
    }
  }
}
