import LinkIcon from '@mui/icons-material/Link'
import { Typography } from '@mui/material'
import { styled } from '@mui/system'
import 'katex/dist/katex.min.css'
import md5 from 'md5'
import React from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { Tweet } from 'react-twitter-widgets'
import rehypeKatex from 'rehype-katex'
import rehypeRaw from 'rehype-raw'
import remarkMath from 'remark-math'
import Link from './Link'

interface Props {
  content: string
  isPreview?: boolean
}

export const Markdown: React.FC<Props> = ({ content, isPreview }) => {
  return (
    <ReactMarkdown
      rehypePlugins={isPreview ? [] : [rehypeRaw, rehypeKatex]}
      remarkPlugins={[remarkMath]}
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
        h1: ({ children }) => headerElement('h1', children, isPreview),
        h2: ({ children }) => headerElement('h2', children, isPreview),
        h3: ({ children }) => headerElement('h3', children, isPreview),
        h4: ({ children }) => headerElement('h4', children, isPreview),
        h5: ({ children }) => headerElement('h5', children, isPreview),
        h6: ({ children }) => headerElement('h6', children, isPreview),
        p: ({ children }) => (
          <Typography textAlign="justify">{children}</Typography>
        ),
      }}>
      {content}
    </ReactMarkdown>
  )
}

type Variant = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

const headerElement = (
  variant: Variant,
  children: React.ReactNode & React.ReactNode[],
  isPreview?: boolean
) => {
  const pt = (variant: Variant) => {
    switch (variant) {
      case 'h1' || 'h2':
        return 6
      case 'h3':
        return 4
      default:
        return 2
    }
  }
  const id = md5(variant + children[0]).slice(0, 6)
  if (isPreview) {
    return (
      <Typography variant={variant} pt={pt(variant)}>
        {children}
      </Typography>
    )
  } else {
    const A = styled('a')({
      textDecoration: 'none',
      color: 'inherit',
      '&:hover svg': {
        display: 'inline-block',
      },
    })
    const Icon = styled(LinkIcon)({
      display: 'none',
      paddingLeft: '0.5rem',
      paddingBottom: '0.15em',
      verticalAlign: 'middle',
    })
    return (
      <>
        <A className="headers" href={`#${id}`}>
          <Typography id={id} variant={variant} pt={pt(variant)}>
            {children}
            <Icon color="disabled" fontSize="inherit" />
          </Typography>
        </A>
      </>
    )
  }
}
