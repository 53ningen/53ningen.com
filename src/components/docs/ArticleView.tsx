import { getDocument } from '@/lib/docs'
import { notFound } from 'next/navigation'
import Canvas from '../common/Canvas'
import { Markdown } from '../common/Markdown'

type Props = {
  slug: string
}

const DocumentView = async ({ slug }: Props) => {
  const document = await getDocument(slug)
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
