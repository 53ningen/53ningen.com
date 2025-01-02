import Breadcrumbs from '@/components/common/Breadcrumbs'
import Canvas from '@/components/common/Canvas'
import Container from '@/components/common/Container'
import Skelton from '@/components/common/Skeleton'
import DocumentList from '@/components/docs/DocumentList'
import { getDictionary } from '@/i18n/dictionaries'
import { Document_status } from '@prisma/client'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { NonPublishedDocumentList } from './NonPublishedDocsList'

interface Props {
  params: Promise<{ status: string }>
}

const AdminNonPublishedDocs = async ({ params }: Props) => {
  const p = await params
  const status = p.status.toUpperCase()
  const statuses = Object.keys(Document_status)
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
            { name: `${t.documents}（status: ${status}）`, href: `{/admin/docs/statuses/${status}` },
          ]}
        />
      </Container>
      <div className="flex flex-col gap-4">
        <Suspense fallback={null}>
          <DocumentList status={status as Document_status} basePath="/admin/docs/preview" />
        </Suspense>
        <Suspense
          fallback={
            <Canvas>
              <Skelton lines={20} />
            </Canvas>
          }>
          <NonPublishedDocumentList status={status as Document_status} />
        </Suspense>
      </div>
    </div>
  )
}

export default AdminNonPublishedDocs
