import { Document, GetDocsPagePropsQuery } from '@/API'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import {
  CollectionIndex,
  createCollectionIndexMapping,
} from '@/components/CollectionIndex'
import Link from '@/components/Link'
import { Meta } from '@/components/Meta'
import { Const } from '@/const'
import { getDocsPageProps } from '@/graphql/custom-queries'
import theme from '@/theme'
import { GraphQLResult } from '@aws-amplify/api-graphql'
import { Box, Card, Stack, Typography } from '@mui/material'
import { API, graphqlOperation } from 'aws-amplify'
import type { GetStaticProps } from 'next'
import React from 'react'

type Props = {
  items: Document[]
}

const Page = ({ items }: Props) => {
  const index = createCollectionIndexMapping(
    items.map((i) => {
      return { name: i.title, kana: i.kana }
    })
  )
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
        <CollectionIndex mapping={index} />
        <Card>
          <Box p={{ xs: 2, sm: 2, md: 2, lg: 4 }}>
            {items.map((item) => {
              const i = index.get(item.title)
              return (
                <React.Fragment key={item.slug}>
                  {i && (
                    <Typography
                      pt={1}
                      pb={1}
                      variant="h3"
                      color={theme.palette.primary.main}>
                      <Box
                        id={i}
                        component="span"
                        sx={{ marginTop: -12, paddingTop: theme.spacing(1) }}
                      />
                      {i}
                    </Typography>
                  )}
                  <Typography>
                    <Link href={`/docs/${item.slug}`}>{item.title}</Link>
                  </Typography>
                </React.Fragment>
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
