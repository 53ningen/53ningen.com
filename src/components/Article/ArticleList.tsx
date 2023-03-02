import { ArticleMeta } from '@/APIWrapper'
import { Stack } from '@mui/material'
import { ArticleListItem } from './ArticleListItem'

type Props = {
  items?: ArticleMeta[]
}

export const ArticleList = ({ items }: Props) => {
  return (
    <Stack spacing={2} maxWidth="100%">
      {items ? (
        items.map((i) => {
          return <ArticleListItem key={i.slug} article={i} />
        })
      ) : (
        <>
          <ArticleListItem />
          <ArticleListItem />
          <ArticleListItem />
          <ArticleListItem />
          <ArticleListItem />
          <ArticleListItem />
          <ArticleListItem />
          <ArticleListItem />
          <ArticleListItem />
          <ArticleListItem />
        </>
      )}
    </Stack>
  )
}
