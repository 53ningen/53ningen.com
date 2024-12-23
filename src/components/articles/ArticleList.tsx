import { Article } from '@prisma/client'
import { ArticleListItem } from './ArticleListItem'

type Props = {
  articles: Article[]
}

const ArticleList = ({ articles }: Props) => {
  return (
    <div className="flex flex-col gap-4">
      {articles.map((article) => (
        <ArticleListItem key={article.id} article={article} />
      ))}
    </div>
  )
}

export default ArticleList
