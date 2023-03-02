import { ArticleMeta } from '@/APIWrapper'
import { Stack, Typography } from '@mui/material'
import Link from '../Link'
import { Widget } from '../Widget'

type Props = {
  items: ArticleMeta[]
}

export const PinnedArticles = ({ items }: Props) => {
  return (
    <Widget>
      <Typography variant="h3">Pinned Articles</Typography>
      <Stack spacing={1}>
        {items.map((article) => (
          <Typography key={article.slug} variant="body2">
            📝 <Link href={`/${article.slug}`}>{article.title}</Link>
          </Typography>
        ))}
      </Stack>
    </Widget>
  )
}
