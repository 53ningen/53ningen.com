import { getArticle } from '@/lib/articles'
import { notFound } from 'next/navigation'
import Canvas from '../common/Canvas'
import { Markdown } from '../common/Markdown'

type Props = {
  slug: string
}

const ArticleView = async ({ slug }: Props) => {
  const article = await getArticle(slug)
  if (!article) {
    return notFound()
  }
  return (
    <Canvas>
      <Markdown body={article.body} />
    </Canvas>
  )
}

export default ArticleView
