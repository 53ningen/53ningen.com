import ArticleIcon from '@mui/icons-material/Article'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import LocalOfferIcon from '@mui/icons-material/LocalOffer'
import { Card, Chip, Stack, Typography } from '@mui/material'
import { Box } from '@mui/system'
import { format } from 'date-fns'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import rehypeRaw from 'rehype-raw'
import { Article } from './Article'
import Link from './common/Link'
import { ShareButtons } from './common/ShareButtons'

interface Props {
  article: Article
}

export const ArticlePage: React.FC<Props> = ({ article }) => {
  const displayDate = format(new Date(article.date), 'yyyy-MM-dd hh:mm')
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
                url={`https://53ningen.com/${article.slug}`}
                title={article.title}
                size={24}
                via="gomi_ningen"
              />
            </Stack>
          </Typography>
          <Typography variant="h2" gutterBottom pb={4}>
            <Link href={article.slug}>{article.title}</Link>
          </Typography>
          <ReactMarkdown
            rehypePlugins={[rehypeRaw]}
            components={{
              a: ({ children, href, ref, ...props }) =>
                href ? (
                  <Link href={href ?? '/'} {...props} children={children} />
                ) : (
                  <a ref={ref} {...props}>
                    {children}
                  </a>
                ),
              code({ inline, className, children }) {
                const match = /language-(\w+)/.exec(className || '')
                return !inline ? (
                  <SyntaxHighlighter
                    children={String(children).replace(/\n$/, '')}
                    language={match ? match[1] : undefined}
                    PreTag="div"
                  />
                ) : (
                  <strong style={{ color: '#777' }}>{children}</strong>
                )
              },
              img({ src, alt, title }) {
                return (
                  <img
                    src={src}
                    alt={alt}
                    title={title}
                    style={{ maxWidth: '100%' }}
                  />
                )
              },
            }}>
            {article.content}
          </ReactMarkdown>
          <Stack direction="row" spacing={2} pt={4}>
            <ShareButtons
              url={`https://53ningen.com/${article.slug}`}
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
