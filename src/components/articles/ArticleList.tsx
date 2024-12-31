import { Article } from '@prisma/client'
import { ArticleListItem } from './ArticleListItem'

type Props = {
  articles: Article[]
  basePath?: string
}

const ArticleList = ({ articles, basePath = '' }: Props) => {
  return (
    <div className="flex flex-col gap-4">
      {articles.map((article) => (
        <ArticleListItem key={article.id} article={article} basePath={basePath} />
      ))}
    </div>
  )
}

export default ArticleList
