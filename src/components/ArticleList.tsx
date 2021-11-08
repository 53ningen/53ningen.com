import { Box } from '@mui/system'
import { Article } from './Article'
import { ArticleListItem } from './ArticleListItem'

interface Props {
  articles: Article[]
}

export const ArticleList: React.FC<Props> = ({ articles }: Props) => {
  return (
    <>
      {articles.map((a) => (
        <Box mb={4} key={a.slug}>
          <ArticleListItem article={a} />
        </Box>
      ))}
    </>
  )
}
