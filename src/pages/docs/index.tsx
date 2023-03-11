import { Document, GetDocsPagePropsQuery } from '@/API'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import Link from '@/components/Link'
import { Meta } from '@/components/Meta'
import { Const } from '@/const'
import { getDocsPageProps } from '@/graphql/custom-queries'
import { GraphQLResult } from '@aws-amplify/api-graphql'
import { Box, Card, Stack, Typography } from '@mui/material'
import { API, graphqlOperation } from 'aws-amplify'
import type { GetStaticProps } from 'next'

type Props = {
  items: Document[]
}

const Page = ({ items }: Props) => {
  return (
    <>
      <Meta title={Const.siteSubtitle} description={Const.siteDescription} />
      <Box px={{ xs: 2, sm: 2, md: 4 }}>
        <Breadcrumbs
          items={[
            {
              path: `/docs`,
              title: 'documents',
            },
          ]}
        />
      </Box>
      <Stack pt={4} spacing={2} px={{ xs: 0, sm: 1, md: 2 }}>
        <Card>
          <Box p={{ xs: 2, sm: 2, md: 2, lg: 4 }}>
            {items.map((i) => {
              return (
                <Typography key={i.slug}>
                  <Link href={`/docs/${i.slug}`}>{i.title}</Link>
                </Typography>
              )
            })}
          </Box>
        </Card>
      </Stack>
    </>
  )
}

export default Page

export const getStaticProps: GetStaticProps = async () => {
  const res = (await API.graphql(
    graphqlOperation(getDocsPageProps, { type: 'Document' })
  )) as GraphQLResult<GetDocsPagePropsQuery>
  if (res.data?.listDocumentsOrderByKana) {
    const items = res.data.listDocumentsOrderByKana.items as Document[]
    return {
      props: {
        items,
      },
      revalidate: Const.revalidateImportPageSec,
    }
  } else {
    console.error(res.errors)
    throw Error(JSON.stringify(res.errors))
  }
}
