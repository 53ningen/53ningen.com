import theme from '@/theme'
import { Box, Typography } from '@mui/material'
import 'katex/dist/katex.min.css'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { Tweet } from 'react-twitter-widgets'
import rehypeKatex from 'rehype-katex'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import Link from '../Link'
import { generateIndexId } from './Index'

type Props = {
  body: string
}

export const Markdown = ({ body }: Props) => {
  return (
    <Box>
      <ReactMarkdown
        rehypePlugins={[rehypeRaw, rehypeKatex]}
        remarkPlugins={[remarkGfm, remarkMath]}
        components={{
          blockquote: ({ children }) => (
            <Typography
              component="blockquote"
              variant="caption"
              my={2}
              pl={2}
              sx={{
                position: 'relative',
                borderLeft: `5px solid ${theme.palette.grey[400]}`,
              }}>
              {children}
            </Typography>
          ),
          a: ({ children, href, ...props }) =>
            href ? (
              <Link
                href={href ?? '/'}
                target={href.startsWith('/') ? '_self' : '_blank'}
                {...props}>
                {children}
              </Link>
            ) : (
              <a {...props}>{children}</a>
            ),
          h1: ({ children }) => headerElement('h1', children),
          h2: ({ children }) => headerElement('h2', children),
          h3: ({ children }) => headerElement('h3', children),
          h4: ({ children }) => headerElement('h4', children),
          h5: ({ children }) => headerElement('h5', children),
          h6: ({ children }) => headerElement('h6', children),
          p: ({ children }) => (
            <Typography variant="body1" py={2}>
              {children}
            </Typography>
          ),
          div: ({ children, className, ...props }) => {
            return (
              <Box className={className} py={2} {...props}>
                {children}
              </Box>
            )
          },
          img({ src, alt, title }) {
            return (
              <Link href={src || ''} target="_blank">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={alt} title={title} style={{ maxWidth: '100%' }} />
              </Link>
            )
          },
          ul: ({ children, depth, ordered, ...props }) =>
            depth === 0 ? (
              <Box py={2}>
                <ul
                  style={{ marginTop: 0, paddingTop: 0, paddingLeft: theme.spacing(2) }}
                  {...props}>
                  {children}
                </ul>
              </Box>
            ) : (
              <ul
                style={{
                  marginTop: 0,
                  paddingTop: 0,
                  paddingLeft: 0,
                  marginLeft: '1em',
                }}>
                {children}
              </ul>
            ),
          ol: ({ children, ordered, depth, ...props }) =>
            depth === 0 ? (
              <Box py={2}>
                <ol
                  style={{ marginTop: 0, paddingTop: 0, paddingLeft: theme.spacing(2) }}
                  {...props}>
                  {children}
                </ol>
              </Box>
            ) : (
              <ol
                style={{ marginTop: 0, paddingTop: 0, paddingLeft: 0, marginLeft: '1em' }}
                {...props}>
                {children}
              </ol>
            ),
          li: ({ children, ordered, ...props }) => (
            <li key={children.toString()} {...props}>
              {children}
            </li>
          ),
          code({ inline, className, children }) {
            const match = /language-(\w+)/.exec(className || '')
            if (className === 'language-twitter') {
              return <Tweet tweetId={String(children).replace(/\n$/, '')} />
            }
            return !inline ? (
              <Box pb={2}>
                <SyntaxHighlighter language={match ? match[1] : undefined}>
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              </Box>
            ) : (
              <Typography
                component="code"
                display="inline"
                px={0.5}
                style={{
                  background: theme.palette.grey[300],
                  borderRadius: 2,
                }}>
                {children}
              </Typography>
            )
          },
        }}>
        {body}
      </ReactMarkdown>
    </Box>
  )
}

const headerElement = (
  variant: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6',
  children: React.ReactNode & React.ReactNode[]
) => {
  const id = generateIndexId(variant, children[0]?.toString() || '')
  return (
    <>
      <Typography
        id={id}
        variant={variant}
        pt={1}
        pb={variant === 'h1' ? 1 : 2}
        borderBottom={variant === 'h1' ? 1 : 0}
        borderColor={theme.palette.grey[300]}>
        <Link href={`#${id}`} color="inherit">
          {children}
        </Link>
      </Typography>
    </>
  )
}
