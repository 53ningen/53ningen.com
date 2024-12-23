import Breadcrumbs from '@/components/common/Breadcrumbs'
import Container from '@/components/common/Container'
import Widgets from '@/components/widgets/Widgets'
import { getDictionary } from '@/i18n/dictionaries'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PagesArticleList } from './PagesArticleList'

interface Params {
  params: Promise<{ page: string }>
}

export const generateMetadata = async ({ params }: Params): Promise<Metadata> => {
  const p = await params
  const page = parseInt(p.page)
  if (isNaN(page) || page < 1) {
    return notFound()
  }
  const { common: t } = await getDictionary()
  const title = `${t.articles} | ${t.title}`
  return {
    title,
    openGraph: {
      title,
    },
  }
}

export default async function Slug({ params }: Params) {
  const p = await params
  const page = parseInt(p.page)
  if (isNaN(page) || page < 1) {
    return notFound()
  }
  const { common: t } = await getDictionary()
  return (
    <div>
      <Container>
        <Breadcrumbs items={[{ name: `${t.page}: ${page}`, href: `/pages/${page}` }]} />
      </Container>
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4">
        <div className="col-span-1 lg:col-span-2 xl:col-span-3">
          <PagesArticleList page={page} />
        </div>
        <div className="hidden lg:flex lg:col-span-1 lg:mr-8">
          <Widgets />
        </div>
      </div>
    </div>
  )
}
