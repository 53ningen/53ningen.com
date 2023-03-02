import { Const } from '@/const'
import Head from 'next/head'

interface MetaProps {
  title: string
  description?: string
  noindex?: boolean
}

export const Meta = ({
  title,
  description = Const.siteDescription,
  noindex = false,
}: MetaProps) => {
  return (
    <Head>
      <title>{title}</title>
      <meta property="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={`${Const.siteUrl}/favicon192x192.jpg`} />
      <meta name="twitter:card" content="summary" />
      {noindex && <meta name="robots" content="noindex,nofollow,noarchive" />}
    </Head>
  )
}
