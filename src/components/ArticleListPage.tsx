import { Grid, Stack } from '@mui/material'
import * as React from 'react'
import { Article } from './Article'
import { ArticleList } from './ArticleList'
import { BlogMetadata } from './ArticleManager'
import { Header } from './common/Header'
import { Pagination } from './common/Pagination'
import { About } from './widgets/About'
import { Archives } from './widgets/Archives'
import { CategoryList } from './widgets/CategoryList'
import { LabList } from './widgets/Lab'
import { PinnedArticleList } from './widgets/PinnedArticleList'
import { Search } from './widgets/Search'
import { TagList } from './widgets/TagList'

interface Props {
  articles: Article[]
  meta: BlogMetadata
  currentPage: number
  totalPages: number
  pageBasePath: string
}

export default function ArticleListPage(props: Props) {
  return (
    <>
      <Header />
      <Grid pt={2} container spacing={4}>
        <Grid item md={8} xs={12}>
          <ArticleList articles={props.articles} />
          {props.totalPages > 1 ? (
            <Pagination
              totalPages={props.totalPages}
              currentPage={props.currentPage}
              basePath={props.pageBasePath}
            />
          ) : undefined}
        </Grid>
        <Grid item md={4} xs={12}>
          <Stack spacing={4}>
            <Search />
            <About />
            <PinnedArticleList articles={props.meta.pinnedArticles} />
            <LabList />
            <CategoryList categories={props.meta.categories} />
            <TagList tags={props.meta.tags} />
            <Archives dates={props.meta.archives} />
          </Stack>
        </Grid>
      </Grid>
    </>
  )
}
