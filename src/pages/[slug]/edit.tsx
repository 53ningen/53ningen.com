import { Article } from '@/components/Article/Article'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { Editor } from '@/components/Editor/Editor'
import { Meta } from '@/components/Meta'
import { getArticle } from '@/local'
import theme from '@/theme'
import EditIcon from '@mui/icons-material/Edit'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { Fab, Stack, Tooltip } from '@mui/material'
import { GetServerSideProps } from 'next'
import { useEffect, useState } from 'react'

type Props = {
  slug: string
  article: Article
}

const Page = ({ slug, article: givenArticle }: Props) => {
  const [article, setArticle] = useState<Article>(givenArticle)
  const [preview, setPreview] = useState(false)
  useEffect(() => {
    setArticle(givenArticle)
  }, [givenArticle])
  return (
    <>
      <Meta title={`edit: ${article.title}`} />
      <Stack px={{ xs: 2, sm: 2, md: 4 }}>
        <Breadcrumbs
          items={[
            {
              path: `/${slug}`,
              title: article.title === '' ? '(no title)' : article.title,
            },
            {
              path: `/${article.slug}/edit`,
              title: '編集',
            },
          ]}
        />
        <Editor article={givenArticle} preview={preview} />
      </Stack>
      <Tooltip title={preview ? '編集' : 'プレビュー'} arrow>
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

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  const { slug } = context.params as { slug: string }
  const article = await getArticle(slug)
  if (article) {
    return {
      props: {
        slug,
        article,
      },
    }
  } else {
    return {
      notFound: true,
    }
  }
}
