import { GetStaticPropsResult } from 'next'
import { Article } from '../../../components/Article'
import {
  BlogMetadata,
  LocalArticleManager,
} from '../../../components/ArticleManager'
import TagPages from './[page]'

interface Props {
  articles: Article[]
  meta: BlogMetadata
  currentPage: number
  totalPages: number
  tag: string
}

export default function TagPageIndex(props: Props) {
  return TagPages(props)
}

export async function getStaticPaths() {
  const manager = LocalArticleManager.sharedInstance
  const { tags } = await manager.fetchMetadata()
  const paths = tags.map((tag) => ({
    params: {
      tag,
    },
  }))
  return { paths, fallback: false }
}

export async function getStaticProps(
  context: any
): Promise<GetStaticPropsResult<Props>> {
  const { tag } = context.params as {
    tag: string
  }
  const manager = LocalArticleManager.sharedInstance
  const { articles, currentPage, totalPages } = await manager.fetchTagArticles(
    tag,
    1
  )
  const meta = await manager.fetchMetadata()
  return {
    props: {
      articles,
      meta,
      currentPage,
      totalPages,
      tag,
    },
  }
}
