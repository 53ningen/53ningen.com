import Breadcrumbs from '@/components/common/Breadcrumbs'
import Container from '@/components/common/Container'
import Widgets from '@/components/widgets/Widgets'
import { getDictionary } from '@/i18n/dictionaries'
import { getTag } from '@/lib/tags'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { TagArticleList } from '../TagArticleList'

interface Params {
  params: Promise<{ tagId: string }>
}

export const generateMetadata = async ({ params }: Params): Promise<Metadata> => {
  const p = await params
  const tagId = parseInt(p.tagId)
  if (isNaN(tagId) || tagId < 1) {
    notFound()
  }
  const tag = await getTag(tagId)
  if (!tag) {
    notFound()
  }
  const { common: t } = await getDictionary()
  const title = `${t.tag}: ${tag.displayName} | ${t.title}`
  return {
    title,
    openGraph: {
      title,
    },
  }
}

export default async function Articles({ params }: Params) {
  const p = await params
  const tagId = parseInt(p.tagId)
  if (isNaN(tagId) || tagId < 1) {
    notFound()
  }
  const tag = await getTag(tagId)
  if (!tag) {
    notFound()
  }
  const { common: t } = await getDictionary()
  return (
    <div>
      <Container>
        <Breadcrumbs items={[{ name: `${t.tag}: ${tag?.displayName}`, href: `/tags/${tagId}` }]} />
      </Container>
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4">
        <div className="col-span-1 lg:col-span-2 xl:col-span-3">
          <TagArticleList tagId={tagId} page={1} />
        </div>
        <div className="hidden lg:flex lg:col-span-1 lg:mr-8">
          <Widgets />
        </div>
      </div>
    </div>
  )
}
