export type Article = {
  slug: string
  title: string
  body: string
  createdAt: string
  updatedAt: string
  category: string
  tags: string[]
}

export type ArticleMetadata = Omit<Article, 'body'>
