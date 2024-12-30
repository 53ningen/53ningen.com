import Breadcrumbs from '@/components/common/Breadcrumbs'
import Canvas from '@/components/common/Canvas'
import Container from '@/components/common/Container'
import Skelton from '@/components/common/Skeleton'
import { getDictionary } from '@/i18n/dictionaries'
import { Article_status } from '@prisma/client'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { NonPublishedArticleList } from './NonPublishedArticleList'

interface Props {
  params: Promise<{ status: string }>
}

const AdminNonPublishedArticles = async ({ params }: Props) => {
  const p = await params
  const status = p.status.toUpperCase()
  const statuses = Object.keys(Article_status)
  if (!statuses.includes(status)) {
    return notFound()
  }
  const { admin: t } = await getDictionary()
  return (
    <div>
      <Container className="flex flex-col gap-2">
        <Breadcrumbs
          items={[
            { name: t.admin, href: '/admin' },
            { name: `${t.articles}（status: ${status}）`, href: '/admin/articles/categories' },
          ]}
        />
      </Container>
      <Suspense
        fallback={
          <Canvas>
            <Skelton lines={20} />
          </Canvas>
        }>
        <NonPublishedArticleList status={status as Article_status} />
      </Suspense>
    </div>
  )
}

export default AdminNonPublishedArticles
