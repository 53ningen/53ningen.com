import { Stack } from '@mui/material'
import { Article } from './Article'
import { ArticleListItem } from './ArticleListItem'

type Props = {
  items: Article[]
}

export const ArticleList = ({ items }: Props) => {
  return (
    <Stack spacing={2} maxWidth="100%">
      {items.map((i) => {
        return <ArticleListItem key={i.slug} article={i} />
      })}
    </Stack>
  )
}
