import { Article, GetEditPagePropsQuery } from '@/API'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { Editor } from '@/components/Editor/Editor'
import { Meta } from '@/components/Meta'
import { getEditPageProps } from '@/graphql/custom-queries'
import theme from '@/theme'
import { GraphQLResult } from '@aws-amplify/api-graphql'
import EditIcon from '@mui/icons-material/Edit'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { Fab, Stack, Tooltip } from '@mui/material'
import { API, graphqlOperation } from 'aws-amplify'
import { GetStaticPaths, GetStaticProps } from 'next'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

type Props = {
  slug?: string
  article?: Article
  categories?: string[]
}

const Page = ({ slug, article: givenArticle, categories }: Props) => {
  const router = useRouter()
  const [article, setArticle] = useState<Article | undefined>(givenArticle)
  const [preview, setPreview] = useState(false)
  useEffect(() => {
    setArticle(givenArticle)
  }, [givenArticle, router])
  return (
    <>
      {article && <Meta title={`edit: ${article.title}`} noindex={true} />}
      <Stack px={{ xs: 2, sm: 2, md: 4 }}>
        <Breadcrumbs
          items={
            slug
              ? [
                  {
                    path: `/${slug}`,
                    title: article?.title === '' ? '(no title)' : article?.title || slug,
                  },
                  {
                    path: `/${slug}/edit`,
                    title: 'edit',
                  },
                ]
              : []
          }
        />
        <Editor slug={slug} article={article} preview={preview} categories={categories} />
      </Stack>
      <Tooltip title={preview ? 'edit' : 'preview'} arrow>
        <Fab
          color="secondary"
          onClick={() => setPreview(!preview)}
          sx={{
            position: 'fixed',
            bottom: { xs: theme.spacing(4), sm: theme.spacing(4), md: theme.spacing(8) },
            right: { xs: theme.spacing(4), sm: theme.spacing(4), md: theme.spacing(8) },
          }}>
          {preview ? <EditIcon /> : <VisibilityIcon />}
        </Fab>
      </Tooltip>
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

export const getStaticProps: GetStaticProps<Props> = async (context) => {
  const { slug } = context.params as { slug: string }
  try {
    const res = (await API.graphql(
      graphqlOperation(getEditPageProps, { slug })
    )) as GraphQLResult<GetEditPagePropsQuery>
    const categories = res.data?.listCategories?.items.map((i) => i!.id) || []
    if (res.data?.getArticle) {
      const article = res.data.getArticle as Article
      return {
        props: {
          slug,
          article,
          categories,
        },
        revalidate: 1,
      }
    } else {
      return {
        props: {
          slug,
          categories,
        },
        revalidate: 1,
      }
    }
  } catch (e) {
    console.error(e)
    throw e
  }
}
