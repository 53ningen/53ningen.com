import Head from 'next/head'
import React from 'react'
import { Constants } from '../../Constants'

interface Props {
  title: string
  description: string
}

export const Meta = ({ title, description }: Props) => {
  const trimmedDescription = description.slice(0, 80)
  return (
    <Head>
      <title>{title}</title>
      <meta property="description" content={trimmedDescription} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={trimmedDescription} />
      <meta
        property="og:image"
        content={`${Constants.siteURL}/favicon192x192.jpg`}
      />
      <meta name="twitter:card" content="summary" />
    </Head>
  )
}
