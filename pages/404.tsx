import { Grid, Paper, Stack, Typography } from '@mui/material'
import { Box } from '@mui/system'
import { GetStaticPropsResult } from 'next'
import * as React from 'react'
import {
  BlogMetadata,
  LocalArticleManager,
} from '../src/components/ArticleManager'
import { Header } from '../src/components/common/Header'
import { Meta } from '../src/components/common/Meta'
import { About } from '../src/components/widgets/About'
import { PinnedArticleList } from '../src/components/widgets/PinnedArticleList'
import { Search } from '../src/components/widgets/Search'
import { Constants } from '../src/Constants'

interface Props {
  meta: BlogMetadata
}

export default function Custom404({ meta }: Props) {
  const title = `${Constants.title} | ${Constants.subtitle}`
  const { subtitle: description } = Constants
  return (
    <>
      <Header />
      <Meta title={title} description={description} />
      <Grid pt={2} container spacing={4}>
        <Grid item md={8} xs={12}>
          <Paper>
            <Box textAlign="center" pt={48} pb={48}>
              <Typography variant="h2">
                <strong>404 | This page cloud not be found</strong>
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item md={4} xs={12}>
          <Stack spacing={4}>
            <Search />
            <About />
            <PinnedArticleList articles={meta.pinnedArticles} />
          </Stack>
        </Grid>
      </Grid>
    </>
  )
}

export async function getStaticProps(
  _: any
): Promise<GetStaticPropsResult<Props>> {
  const manager = LocalArticleManager.sharedInstance
  const meta = await manager.fetchMetadata()
  return {
    props: {
      meta,
    },
  }
}
