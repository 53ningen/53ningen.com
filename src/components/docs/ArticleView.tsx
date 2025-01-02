import { getDocument } from '@/lib/docs'
import { notFound } from 'next/navigation'
import Canvas from '../common/Canvas'
import { Markdown } from '../common/Markdown'

type Props = {
  slug: string
  onlyPublished?: boolean
}

const DocumentView = async ({ slug, onlyPublished = true }: Props) => {
  const document = await getDocument(slug, onlyPublished)
  if (!document) {
    return notFound()
  }
  return (
    <Canvas>
      <Markdown body={document.body} />
    </Canvas>
  )
}

export default DocumentView
