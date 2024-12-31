import Breadcrumbs from '@/components/common/Breadcrumbs'
import Container from '@/components/common/Container'
import Widgets from '@/components/widgets/Widgets'
import { getDictionary } from '@/i18n/dictionaries'
import { getCategory } from '@/lib/categories'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CategoryArticleList } from '../../CategoryArticleList'

interface Params {
  params: Promise<{ categoryId: string; page: string }>
}

export const generateMetadata = async ({ params }: Params): Promise<Metadata> => {
  const p = await params
  const categoryId = parseInt(p.categoryId)
  if (isNaN(categoryId) || categoryId < 1) {
    notFound()
  }
  const category = await getCategory(categoryId)
  if (!category) {
    notFound()
  }
  const { common: t } = await getDictionary()
  const title = `${t.category}: ${category.displayName} | ${t.title}`
  return {
    title,
    openGraph: {
      title,
    },
  }
}

export default async function Articles({ params }: Params) {
  const p = await params
  const categoryId = parseInt(p.categoryId)
  if (isNaN(categoryId) || categoryId < 1) {
    notFound()
  }
  const page = parseInt(p.page)
  if (isNaN(page) || page < 1) {
    notFound()
  }
  const category = await getCategory(categoryId)
  if (!category) {
    notFound()
  }
  const { common: t } = await getDictionary()
  return (
    <div>
      <Container>
        <Breadcrumbs
          items={[
            { name: `${t.category}: ${category?.displayName}`, href: `/categories/${categoryId}` },
            { name: `${t.page}: ${page}`, href: `/categories/${categoryId}/pages/${page}` },
          ]}
        />
      </Container>
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4">
        <div className="flex flex-col gap-4 col-span-1 lg:col-span-2 xl:col-span-3">
          <CategoryArticleList categoryId={categoryId} page={page} />
        </div>
        <div className="hidden lg:flex lg:col-span-1 lg:mr-8">
          <Widgets />
        </div>
      </div>
    </div>
  )
}
