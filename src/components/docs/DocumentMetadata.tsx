import { getDictionary } from '@/i18n/dictionaries'
import { ISO8601toJPDateTimeStr } from '@/lib/datetime'
import { getDocument } from '@/lib/docs'
import { notFound } from 'next/navigation'
import Breadcrumbs from '../common/Breadcrumbs'
import Container from '../common/Container'
import CreatedAtChip from '../common/chip/CreatedAtChip'
import UpdatedAtChip from '../common/chip/UpdatedAtChip'

type Props = {
  slug: string
}

const DocumentMetadata = async ({ slug }: Props) => {
  const document = await getDocument(slug)
  if (!document) {
    return notFound()
  }
  const created = ISO8601toJPDateTimeStr(document.createdAt)
  const updated = ISO8601toJPDateTimeStr(document.updatedAt)
  const { common: t } = await getDictionary()

  const paths = slug.split('/')
  const routes = paths.map((path, index) => {
    return { title: path, path: paths.slice(0, index + 1).join('/') }
  })
  return (
    <Container className="flex flex-col gap-2">
      <Breadcrumbs
        items={[
          {
            name: t.documents,
            href: `/docs`,
          },
          ...routes.map((r) => ({
            name: r.title,
            href: `/docs/${r.path}`,
          })),
        ]}
      />
      <h1 className="text-xl font-bold">{document.title}</h1>
      <div className="flex gap-1">
        <CreatedAtChip createdAt={created} />
        <UpdatedAtChip updatedAt={updated} />
      </div>
    </Container>
  )
}

export default DocumentMetadata
