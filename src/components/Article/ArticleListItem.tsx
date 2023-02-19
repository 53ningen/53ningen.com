import { Const } from '@/const'
import { Box, Card, Stack, Typography } from '@mui/material'
import { CategoryChip } from '../Chip/CategoryChip'
import { TagChip } from '../Chip/TagChip'
import Link from '../Link'
import { Article } from './Article'

type Props = {
  article: Article
}

export const ArticleListItem = ({ article }: Props) => {
  const { slug, title, category, tags, createdAt } = article
  const icons = ['📝']
  const icon = icons[Math.floor((Math.random() * icons.length) % icons.length)]
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
              <CategoryChip category={category} />
              {tags.map((tag) => {
                return <TagChip key={tag} tag={tag} />
              })}
            </Box>
          </Stack>
        </Stack>
      </Box>
    </Card>
  )
}
