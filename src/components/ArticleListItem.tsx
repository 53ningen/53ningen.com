import ArticleIcon from '@mui/icons-material/Article'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import { Button, Card, Chip, Stack, Typography } from '@mui/material'
import { format } from 'date-fns'
import ReactMarkdown from 'react-markdown'
import { Article } from './Article'
import Link from './common/Link'
import { ShareButtons } from './common/ShareButtons'

const DisplayTextLength = 500

interface Props {
  article: Article
}

export const ArticleListItem: React.FC<Props> = ({ article }: Props) => {
  const displayDate = format(new Date(article.date), 'yyyy-MM-dd hh:mm')
  return (
    <Card>
      <Stack spacing={2} m={4} component="article">
        <Typography>
          <Stack direction="row" spacing={1}>
            <Link href={`/${article.slug}`}>
              <Chip
                icon={<CalendarTodayIcon fontSize="small" />}
                label={displayDate}
                variant="outlined"
                size="small"
              />
            </Link>
            <Link href={`/categories/${article.category}`}>
              <Chip
                icon={<ArticleIcon fontSize="small" />}
                label={article.category}
                variant="outlined"
                size="small"
              />
            </Link>
            <ShareButtons
              url={`https://53ningen.com/${article.slug}`}
              title={article.title}
              size={24}
              via="gomi_ningen"
            />
          </Stack>
        </Typography>
        <Typography variant="h2" pb={2}>
          <Link href={`/${article.slug}`}>{article.title}</Link>
        </Typography>
        <ReactMarkdown>
          {article.content.substr(0, DisplayTextLength) + '...'}
        </ReactMarkdown>
        <Button
          variant="outlined"
          href={`/${article.slug}`}
          LinkComponent={Link}>
          Read More
        </Button>
      </Stack>
    </Card>
  )
}
