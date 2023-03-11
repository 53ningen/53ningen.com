import { Document, GetDocumentQuery } from '@/API'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { DocsEditor } from '@/components/Editor/DocsEditor'
import { Meta } from '@/components/Meta'
import { getDocument } from '@/graphql/queries'
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
  item?: Document
}

const Page = ({ slug, item }: Props) => {
  const router = useRouter()
  const [document, setDocument] = useState<Document | undefined>(item)
  const [preview, setPreview] = useState(false)
  useEffect(() => {
    setDocument(item)
  }, [item, router])
  return (
    <>
      {document && <Meta title={`edit: ${document.title}`} noindex={true} />}
      <Stack px={{ xs: 2, sm: 2, md: 4 }}>
        <Breadcrumbs
          items={
            slug
              ? [
                  {
                    path: `/docs`,
                    title: 'documents',
                  },
                  {
                    path: `/docs/${slug}`,
                    title:
                      document?.title === '' ? '(no title)' : document?.title || slug,
                  },
                  {
                    path: `/docs/${slug}/edit`,
                    title: 'edit',
                  },
                ]
              : []
          }
        />
        <DocsEditor slug={slug} document={item} preview={preview} />
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
      graphqlOperation(getDocument, { slug })
    )) as GraphQLResult<GetDocumentQuery>
    if (res.data?.getDocument) {
      const document = res.data.getDocument as Document
      return {
        props: {
          slug,
          item: document,
        },
        revalidate: 1,
      }
    } else {
      return {
        props: {
          slug,
        },
        revalidate: 1,
      }
    }
  } catch (e) {
    console.error(e)
    throw e
  }
}
