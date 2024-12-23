'use client'

import 'katex/dist/katex.min.css'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import { Prism, SyntaxHighlighterProps } from 'react-syntax-highlighter'
import { Tweet } from 'react-twitter-widgets'
import rehypeKatex from 'rehype-katex'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SyntaxHighlighter = Prism as any as React.FC<SyntaxHighlighterProps>

type Props = {
  body: string
}

export const Markdown = ({ body }: Props) => {
  return (
    <ReactMarkdown
      className="[&_]:w-full [&>ul]:ml-2 [&>ol]:ml-2 [&:nth-child(1)]:my-0 text-primary text-md"
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeRaw, rehypeKatex]}
      components={{
        blockquote: ({ children }) => <div className="text-gray-500 border-l-[6px] pl-4">{children}</div>,
        img: ({ src, alt }) => (
          <a href={src} target="_blank">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={alt ?? ''} className="max-w-full object-contain" />
          </a>
        ),
        ul: ({ children }) => <ul className="list-disc list-inside ml-6">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal list-inside ml-6">{children}</ol>,
        li: ({ children }) => <li>{children}</li>,
        h1: ({ children, id }) => (
          <h1 id={id} className="text-2xl font-extrabold my-4 pt-4 pb-2 before:mt-16">
            {children}
          </h1>
        ),
        h2: ({ children, id }) => (
          <h2 id={id} className="border-b text-xl font-bold my-4 pt-2 pb-2">
            {children}
          </h2>
        ),
        h3: ({ children, id }) => (
          <h3 id={id} className="text-xl font-bold my-4 pt-4 pb-2">
            {children}
          </h3>
        ),
        h4: ({ children, id }) => (
          <h4 id={id} className="text-lg font-bold pt-2 pb-2">
            {children}
          </h4>
        ),
        h5: ({ children, id }) => (
          <h5 id={id} className="text-md font-bold pt-2 pb-2">
            {children}
          </h5>
        ),
        h6: ({ children, id }) => (
          <h6 id={id} className="text-md pt-2 pb-2">
            {children}
          </h6>
        ),
        strong: ({ children }) => <strong className="font-bold">{children}</strong>,
        a: ({ children, href }) => {
          const target = href?.startsWith('/') || href?.startsWith('#') ? '_self' : '_blank'
          return (
            <Link href={href ?? '/'} target={target}>
              {children}
            </Link>
          )
        },
        p: ({ children }) => <div className="text-md my-6">{children}</div>,
        pre: ({ children }) => <>{children}</>,
        code({ className, children }) {
          const match = /language-(\w+)/.exec(className || '')
          if (className === 'language-twitter') {
            return <Tweet tweetId={String(children).replace(/\n$/, '')} />
          }
          const inline = typeof children === 'string' && !children.includes('\n')

          return inline ? (
            <span className="bg-gray-200 px-1 py-[0.5] rounded">{children}</span>
          ) : (
            <div className="pb-2">
              <SyntaxHighlighter language={match ? match[1] : undefined}>{String(children).replace(/\n$/, '')}</SyntaxHighlighter>
            </div>
          )
        },
      }}>
      {body}
    </ReactMarkdown>
  )
}
