import DocumentView from '@/components/docs/ArticleView'
import DocumentMetadata from '@/components/docs/DocumentMetadata'
import Widgets from '@/components/widgets/Widgets'
import { getDictionary } from '@/i18n/dictionaries'
import { getDocument } from '@/lib/docs'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

interface Params {
  params: Promise<{ slug: string[] }>
}

export const generateMetadata = async ({ params }: Params): Promise<Metadata> => {
  const p = await params
  const slug = p.slug.map((s) => decodeURIComponent(s)).join('/')
  const document = await getDocument(slug)
  if (!document) {
    return notFound()
  }
  const { common: t } = await getDictionary()
  const title = `${document.title} | ${t.title}`
  return {
    title,
    openGraph: {
      title,
    },
  }
}

export default async function Slug({ params }: Params) {
  const p = await params
  const slug = p.slug.map((s) => decodeURIComponent(s)).join('/')
  return (
    <div>
      <DocumentMetadata slug={slug} />
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4">
        <div className="col-span-1 lg:col-span-2 xl:col-span-3">
          <DocumentView slug={slug} />
        </div>
        <div className="hidden lg:flex lg:col-span-1 lg:mr-8">
          <Widgets />
        </div>
      </div>
    </div>
  )
}
