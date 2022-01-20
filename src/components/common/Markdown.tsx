import { Typography } from '@mui/material'
import React from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { Tweet } from 'react-twitter-widgets'
import rehypeRaw from 'rehype-raw'
import Link from './Link'

interface Props {
  content: string
  isPreview?: boolean
}

export const Markdown: React.FC<Props> = ({ content, isPreview }) => {
  return (
    <ReactMarkdown
      rehypePlugins={isPreview ? [] : [rehypeRaw]}
      components={{
        a: ({ children, href, ...props }) =>
          href ? (
            <Link href={href ?? '/'} {...props} children={children} />
          ) : (
            <a {...props}>{children}</a>
          ),
        code({ inline, className, children }) {
          const match = /language-(\w+)/.exec(className || '')
          if (className === 'language-twitter') {
            return <Tweet tweetId={String(children).replace(/\n$/, '')} />
          }
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
        ul: ({ children, depth, ...props }) =>
          depth === 0 ? (
            <ul {...props} style={{ paddingLeft: '1em' }}>
              {children}
            </ul>
          ) : (
            <ul {...props} style={{ paddingLeft: 0, marginLeft: '1em' }}>
              {children}
            </ul>
          ),
        li: ({ children }) => (
          <li style={{ textAlign: 'justify' }}>{children}</li>
        ),
        h1: ({ children }) => (
          <Typography variant="h1" pt={6}>
            {children}
          </Typography>
        ),
        h2: ({ children }) => (
          <Typography variant="h2" pt={6}>
            {children}
          </Typography>
        ),
        h3: ({ children }) => (
          <Typography variant="h3" pt={4}>
            {children}
          </Typography>
        ),
        h4: ({ children }) => (
          <Typography variant="h4" pt={2}>
            {children}
          </Typography>
        ),
        h5: ({ children }) => (
          <Typography variant="h5" pt={2}>
            {children}
          </Typography>
        ),
        h6: ({ children }) => (
          <Typography variant="h6" pt={2}>
            {children}
          </Typography>
        ),
        p: ({ children }) => (
          <Typography textAlign="justify">{children}</Typography>
        ),
      }}>
      {content}
    </ReactMarkdown>
  )
}
