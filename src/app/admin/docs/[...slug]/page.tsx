import DocumentEditor from '@/components/admin/DocumentEditor'
import Container from '@/components/common/Container'
import prisma from '@/lib/prisma'

interface Props {
  params: Promise<{ slug: string[] }>
}

const EditDocs = async ({ params }: Props) => {
  const p = await params
  const slug = p.slug.join('/')
  const document = await prisma.document.findUnique({
    where: {
      slug,
    },
  })
  return (
    <div>
      <Container className="flex flex-col gap-2">
        <DocumentEditor slug={slug} document={document} />
      </Container>
    </div>
  )
}

export default EditDocs
