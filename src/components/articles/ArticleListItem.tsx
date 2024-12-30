import { ISO8601toJPDateTimeStr } from '@/lib/datetime'
import { Article } from '@prisma/client'
import Link from 'next/link'
import Canvas from '../common/Canvas'
import CategoryChip from '../common/chip/CategoryChip'
import TagChips from '../common/chip/TagChips'

type Props = {
  article: Article
  basePath?: string
}

export const ArticleListItem = ({ article, basePath = '' }: Props) => {
  const publishedAt = ISO8601toJPDateTimeStr(article.createdAt)
  return (
    <Canvas>
      <div className="flex flex-col">
        {article.status !== 'PUBLISHED' && (
          <div>
            <span className="text-xs px-1 py-[0.5] bg-black text-white rounded-full">{article.status}</span>
          </div>
        )}
        <div className="text-sm">
          <Link href={`${basePath}/${article.slug}`} id={article.slug.toString()} className="text-gray-500 hover:text-gray-500">
            {publishedAt}
          </Link>
        </div>
        <div className="font-bold">
          <Link href={`${basePath}/${article.slug}`} id={article.slug.toString()} className="text-primary hover:text-primary">
            {article.title}
          </Link>
        </div>
        <div className="text-xs text-gray-500">{article.description}</div>
        <div className="flex gap-1 mt-1">
          <CategoryChip categoryId={article.categoryId} />
          <TagChips articleId={article.id} />
        </div>
      </div>
    </Canvas>
  )
}
