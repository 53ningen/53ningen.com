import { Document, GetDocumentQuery, GetDocumentQueryVariables } from '@/API'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { DocsEditor } from '@/components/Editor/DocsEditor'
import { Meta } from '@/components/Meta'
import { Const } from '@/const'
import { getDocument } from '@/graphql/queries'
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
}

const Page = ({ slug }: Props) => {
  const [loaded, setLoaded] = useState(false)
  const [document, setDocument] = useState<Document>()
  const [preview, setPreview] = useState(false)
  useEffect(() => {
    ;(async () => {
      if (slug) {
        try {
          const a = await fetchDocs(slug)
          if (a) {
            setDocument(a)
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
      <Meta title={`edit: ${document?.title || slug || ''}`} noindex={true} />
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
        <DocsEditor
          slug={slug}
          readyToEdit={loaded}
          document={document}
          preview={preview}
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
  return {
    props: {
      slug,
    },
    revalidate: Const.revalidateImportPageSec,
  }
}

const fetchDocs = async (slug: string) => {
  const res = (await API.graphql({
    query: getDocument,
    variables: {
      slug,
    } as GetDocumentQueryVariables,
    authMode: 'AWS_IAM',
  })) as GraphQLResult<GetDocumentQuery>
  return res.data ? (res.data.getDocument as Document) : undefined
}
