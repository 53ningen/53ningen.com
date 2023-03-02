import { ArticleMeta } from '@/APIWrapper'
import { Const } from '@/const'
import { Box, Card, Skeleton, Stack, Typography } from '@mui/material'
import { CategoryChip } from '../Chip/CategoryChip'
import { TagChip } from '../Chip/TagChip'
import Link from '../Link'

type Props = {
  article?: ArticleMeta
}

export const ArticleListItem = ({ article }: Props) => {
  if (!article) {
    return (
      <Card>
        <Box p={{ xs: 2, sm: 2, md: 2, lg: 2 }}>
          <Stack direction="row" spacing={2} alignContent="center" alignItems="center">
            <Stack spacing={1} width="100%">
              <Typography variant="caption">
                <Skeleton width="15%" />
              </Typography>
              <Typography variant="h3">
                <Skeleton width="65%" />
              </Typography>
              <Box lineHeight="2rem">
                <CategoryChip />
              </Box>
            </Stack>
          </Stack>
        </Box>
      </Card>
    )
  }
  const icon = '📝'
  const { slug, title, category, tags, createdAt } = article
  const created = Const.ISO8601toDateTimeString(createdAt)
  return (
    <Card>
      <Box p={{ xs: 2, sm: 2, md: 2, lg: 2 }}>
        <Stack direction="row" spacing={2} alignContent="center" alignItems="center">
          <Stack spacing={1}>
            <Typography variant="caption">
              <Link href={`/${slug}`} color="inherit" suppressHydrationWarning>
                {created}
              </Link>
            </Typography>
            <Typography variant="h3">
              <Link href={`/${slug}`} color="inherit">
                {icon} {title}
              </Link>
            </Typography>
            <Box lineHeight="2rem">
              <CategoryChip category={category.id} />
              {tags?.items.map((tag) => {
                return <TagChip key={tag!.tagID} tag={tag!.tagID} />
              })}
            </Box>
          </Stack>
        </Stack>
      </Box>
    </Card>
  )
}
