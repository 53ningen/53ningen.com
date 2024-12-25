import { getDocument } from '@/lib/docs'

interface Props {
  params: Promise<{ slug: string[] }>
}

const EditArticle = async ({ params }: Props) => {
  const p = await params
  const slug = decodeURI(p.slug.join('/'))
  // TODO: Remove unstable_cache
  const document = await getDocument(slug)
  return (
    <div>
      <h1>Edit Document</h1>
      <p>{document?.body || ''}</p>
    </div>
  )
}

export default EditArticle
