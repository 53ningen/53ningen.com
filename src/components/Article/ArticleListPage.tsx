import { ArticleMeta } from '@/APIWrapper'
import { ArticleList } from '@/components/Article/ArticleList'
import { Pagination } from '@/components/Pagination'
import { ShareButtons } from '@/components/ShareButtons'
import { Categories } from '@/components/Widgets/Categories'
import { PinnedArticles } from '@/components/Widgets/PinnedArticles'
import { Tags } from '@/components/Widgets/Tags'
import { Const } from '@/const'
import { useAuth } from '@/context/AuthContext'
import { Box, Stack } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2'
import { Breadcrumbs, Path } from '../Breadcrumbs'
import { About } from '../Widgets/About'
import { Search } from '../Widgets/Search'

type Props = {
  articles?: ArticleMeta[]
  pinnedArticles?: ArticleMeta[]
  categories?: string[]
  tags?: string[]
  pages?: number
  currentPage?: number
  pagesBasePath: string
  paths?: Path[]
}

export const ArticleListPage = ({
  articles,
  pinnedArticles,
  categories,
  tags,
  pages,
  currentPage,
  pagesBasePath,
  paths,
}: Props) => {
  const { initialized, isLoggedIn } = useAuth()
  return (
    <Stack pt={4} spacing={2} px={{ xs: 0, sm: 1, md: 2 }}>
      {paths && (
        <Box px={{ xs: 2, sm: 2, md: 1 }}>
          <Breadcrumbs items={paths} />
        </Box>
      )}
      <Grid container spacing={{ xs: 0, sm: 0, md: 2 }} width="100%">
        <Grid xs={12} sm={12} md={8.5} pb={4} px={{ xs: 2, sm: 2, md: 1 }}>
          <Stack spacing={2}>
            <ArticleList
              items={
                initialized && isLoggedIn() ? articles : articles?.filter((a) => !a.draft)
              }
            />
            {pages && currentPage && (
              <Pagination
                totalPages={pages}
                currentPage={currentPage}
                basePath={pagesBasePath}
              />
            )}
          </Stack>
        </Grid>
        <Grid display={{ xs: 'none', sm: 'none', md: 'block' }} md={3.5}>
          <Stack spacing={2} px={{ xs: 2, sm: 2, md: 0 }}>
            <Stack direction="row" spacing={1} px={2}>
              <ShareButtons url={Const.siteUrl} title={Const.siteSubtitle} size={24} />
            </Stack>
            <Search />
            {pinnedArticles && <PinnedArticles items={pinnedArticles} />}
            {categories && <Categories items={categories} />}
            {tags && <Tags items={tags} />}
            <About />
          </Stack>
        </Grid>
        <Grid display={{ xs: 'block', sm: 'block', md: 'none' }} xs={12} sm={12}>
          <Stack spacing={2} px={{ xs: 2, sm: 2, md: 0 }}>
            <Stack direction="row" spacing={1} px={2}>
              <ShareButtons url={Const.siteUrl} title={Const.siteTitle} size={24} />
            </Stack>
            {pinnedArticles && <PinnedArticles items={pinnedArticles} />}
            {categories && <Categories items={categories} />}
            {tags && <Tags items={tags} />}
            <About />
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  )
}
