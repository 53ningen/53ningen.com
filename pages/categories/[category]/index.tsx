import { GetStaticPropsResult } from 'next'
import { Article } from '../../../src/components/Article'
import {
  BlogMetadata,
  LocalArticleManager,
} from '../../../src/components/ArticleManager'
import CategoryPages from './[page]'

interface Props {
  articles: Article[]
  meta: BlogMetadata
  currentPage: number
  totalPages: number
  category: string
}

export default function CategoryPageIndex(props: Props) {
  return CategoryPages(props)
}

export async function getStaticPaths() {
  const manager = LocalArticleManager.sharedInstance
  const { categories } = await manager.fetchMetadata()
  const paths = categories.map((category) => ({
    params: {
      category,
    },
  }))
  return { paths, fallback: false }
}

export async function getStaticProps(
  context: any
): Promise<GetStaticPropsResult<Props>> {
  const { category } = context.params as { category: string }
  const manager = LocalArticleManager.sharedInstance
  const { articles, currentPage, totalPages } =
    await manager.fetchCategoryArticles(category, 1)
  const meta = await manager.fetchMetadata()
  return {
    props: {
      articles,
      currentPage,
      totalPages,
      category,
      meta,
    },
  }
}
