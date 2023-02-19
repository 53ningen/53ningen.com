import { Const } from '@/const'
import Head from 'next/head'

interface MetaProps {
  title: string
  description?: string
}

export const Meta = ({ title, description = Const.siteDescription }: MetaProps) => {
  return (
    <Head>
      <title>{title}</title>
      <meta property="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta name="twitter:card" content="summary" />
    </Head>
  )
}
