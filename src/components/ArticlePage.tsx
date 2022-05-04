import ArticleIcon from '@mui/icons-material/Article'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import LocalOfferIcon from '@mui/icons-material/LocalOffer'
import { Card, Chip, Stack, Typography } from '@mui/material'
import { Box } from '@mui/system'
import { format } from 'date-fns'
import { Constants } from '../Constants'
import { Article } from './Article'
import Link from './common/Link'
import { Markdown } from './common/Markdown'
import { ShareButtons } from './common/ShareButtons'

interface Props {
  article: Article
}

export const ArticlePage: React.FC<Props> = ({ article }) => {
  const displayDate = format(new Date(article.date), 'yyyy-MM-dd HH:mm')
  return (
    <>
      <Card>
        <Stack m={4} spacing={2} component="article">
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
                url={`${Constants.siteURL}/${article.slug}`}
                title={article.title}
                size={24}
                via="gomi_ningen"
              />
            </Stack>
          </Typography>
          <Typography variant="h2" gutterBottom pb={4}>
            <Link href={article.slug}>{article.title}</Link>
          </Typography>
          <Markdown content={article.content} />
          <Stack direction="row" spacing={2} pt={4}>
            <ShareButtons
              url={`${Constants.siteURL}/${article.slug}`}
              title={article.title}
              size={36}
              via="gomi_ningen"
            />
          </Stack>
          <Stack direction="row" spacing={2}>
            <LocalOfferIcon fontSize="small" />
            {article.tags.map((tag) => {
              return (
                <Box key={tag}>
                  <Link href={`/tags/${tag}`}>{tag}</Link>
                </Box>
              )
            })}
          </Stack>
        </Stack>
      </Card>
    </>
  )
}
