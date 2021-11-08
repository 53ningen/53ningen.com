import PushPinIcon from '@mui/icons-material/PushPin'
import { Card, ListItem, ListItemText, Stack, Typography } from '@mui/material'
import { Box } from '@mui/system'
import { Article } from '../Article'
import Link from '../common/Link'

interface Props {
  articles: Article[]
}

export const PinnedArticleList: React.FC<Props> = ({ articles }: Props) => {
  return (
    <Card>
      <Box m={4}>
        <Typography mb={2} variant="h3">
          <Stack direction="row" spacing={1} alignItems="center">
            <PushPinIcon />
            <span>Pinned Articles</span>
          </Stack>
        </Typography>
        {articles.map((article) => (
          <ListItem
            key={article.slug}
            component={Link}
            href={`/${article.slug}`}
            disableGutters>
            <ListItemText primary={article.title} />
          </ListItem>
        ))}
      </Box>
    </Card>
  )
}
