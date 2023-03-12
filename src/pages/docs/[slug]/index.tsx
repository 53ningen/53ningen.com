import { Document, GetDocumentQuery, GetDocumentQueryVariables } from '@/API'
import { listAllSlugs } from '@/APIWrapper'
import { ArticleBody } from '@/components/Article/ArticleBody'
import { ArticleIndex } from '@/components/Article/ArticleIndex'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { DocsMetadata } from '@/components/Docs/DocsMetadata'
import { Meta } from '@/components/Meta'
import { ShareButtons } from '@/components/ShareButtons'
import { About } from '@/components/Widgets/About'
import { Const } from '@/const'
import { getDocument } from '@/graphql/queries'
import theme from '@/theme'
import { GraphQLResult } from '@aws-amplify/api-graphql'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import { Box, Fab, Stack } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2'
import { API, Auth, graphqlOperation } from 'aws-amplify'
import type { GetStaticPaths, GetStaticProps } from 'next'
import { useEffect, useState } from 'react'

type Props = {
  slug?: string
  item?: Document
}

const Page = ({ slug, item }: Props) => {
  const [document, setDocument] = useState<Document | undefined>(item)
  useEffect(() => {
    setDocument(item)
  }, [item])
  useEffect(() => {
    ;(async () => {
      if (slug) {
        const res = await fetchLatestDocsData(slug)
        if (res) {
          setDocument(res)
        }
      }
    })()
  }, [slug])
  return (
    <>
      {document && (
        <Meta
          title={`${document.title} | ${Const.siteSubtitle}`}
          description={document.body.slice(0, 200)}
        />
      )}
      <Stack>
        <Box px={{ xs: 2, sm: 2, md: 4 }}>
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
                  ]
                : []
            }
          />
        </Box>
        <DocsMetadata meta={document} />
        <Grid
          container
          spacing={{ xs: 0, sm: 0, md: 2 }}
          px={{ xs: 0, sm: 1, md: 2 }}
          width="100%">
          <Grid xs={12} sm={12} md={8.5}>
            <ArticleBody body={document?.body} />
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
                {document && (
                  <ShareButtons
                    url={`${Const.siteUrl}/${document.slug}`}
                    title={document.title}
                    size={24}
                  />
                )}
              </Stack>
              <ArticleIndex body={document?.body} />
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

const fetchLatestDocsData = async (slug: string) => {
  try {
    const user = await Auth.currentAuthenticatedUser()
    if (!user) {
      return undefined
    }
  } catch {
    return undefined
  }
  try {
    const res = (await API.graphql({
      query: getDocument,
      variables: { slug },
      authMode: 'AWS_IAM',
    })) as GraphQLResult<GetDocumentQuery>
    if (res.data?.getDocument) {
      return res.data.getDocument as Document
    }
  } catch (e) {
    console.error(e)
  }
  return undefined
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
    graphqlOperation(getDocument, { slug } as GetDocumentQueryVariables)
  )) as GraphQLResult<GetDocumentQuery>
  if (res.data?.getDocument) {
    const document = res.data.getDocument as Document
    return {
      props: {
        slug,
        item: document,
      },
      revalidate: Const.revalidateImportPageSec,
    }
  } else {
    return {
      notFound: true,
      revalidate: Const.revalidateImportPageSec,
    }
  }
}
