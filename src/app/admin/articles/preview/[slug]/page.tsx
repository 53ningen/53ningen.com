import ArticleMetadata from '@/components/articles/ArticleMetadata'
import ArticleView from '@/components/articles/ArticleView'
import Widgets from '@/components/widgets/Widgets'
import { currentBaseUrl } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionaries'
import { getArticle } from '@/lib/articles'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

interface Params {
  params: Promise<{ slug: string }>
}

export const generateMetadata = async ({ params }: Params): Promise<Metadata> => {
  const p = await params
  const article = await getArticle(p.slug, false)
  if (!article) {
    return notFound()
  }
  const { common: t } = await getDictionary()
  const title = `${article.title} | ${t.title}`
  const description = article.description || undefined
  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
    twitter: {
      title,
      description,
      creator: '@gomi_ningen',
      images: [`${currentBaseUrl}/favicon192x192.jpg`],
      card: 'summary',
    },
  }
}

export default async function Slug({ params }: Params) {
  const p = await params
  return (
    <div>
      <ArticleMetadata slug={p.slug} onlyPublished={false} />
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4">
        <div className="col-span-1 lg:col-span-2 xl:col-span-3">
          <ArticleView slug={p.slug} onlyPublished={false} />
        </div>
        <div className="hidden lg:flex lg:col-span-1 lg:mr-8">
          <Widgets />
        </div>
      </div>
    </div>
  )
}
