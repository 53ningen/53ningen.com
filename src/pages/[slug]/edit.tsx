import { Article, GetArticleQuery, GetArticleQueryVariables } from '@/API'
import { listAllCategories } from '@/APIWrapper'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { ArticleEditor } from '@/components/Editor/ArticleEditor'
import { Meta } from '@/components/Meta'
import { Const } from '@/const'
import { getArticle } from '@/graphql/queries'
import theme from '@/theme'
import { GraphQLResult } from '@aws-amplify/api-graphql'
import EditIcon from '@mui/icons-material/Edit'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { Fab, Stack, Tooltip } from '@mui/material'
import { API } from 'aws-amplify'
import { GetStaticPaths, GetStaticProps } from 'next'
import { useEffect, useState } from 'react'

type Props = {
  slug?: string
  categories?: string[]
}

const Page = ({ slug, categories }: Props) => {
  const [loaded, setLoaded] = useState(false)
  const [article, setArticle] = useState<Article>()
  const [preview, setPreview] = useState(false)
  useEffect(() => {
    ;(async () => {
      if (slug) {
        try {
          const a = await fetchArticle(slug)
          if (a) {
            setArticle(a)
          }
          setLoaded(true)
        } catch (e) {
          console.error(e)
        }
      }
    })()
  }, [slug])
  return (
    <>
      <Meta title={`edit: ${article?.title || slug || ''}`} noindex={true} />
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
        <ArticleEditor
          slug={slug}
          article={article}
          readyToEdit={loaded}
          preview={preview}
          categories={categories}
        />
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
  const categories = await listAllCategories()
  return {
    props: { slug, categories },
    revalidate: Const.revalidateImportPageSec,
  }
}

const fetchArticle = async (slug: string) => {
  const res = (await API.graphql({
    query: getArticle,
    variables: {
      slug,
    } as GetArticleQueryVariables,
    authMode: 'AMAZON_COGNITO_USER_POOLS',
  })) as GraphQLResult<GetArticleQuery>
  return res.data ? (res.data.getArticle as Article) : undefined
}
