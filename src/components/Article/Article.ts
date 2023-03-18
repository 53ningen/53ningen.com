import { Article } from '@/API'

export type ArticleMetadata = Omit<Article, 'body'>
