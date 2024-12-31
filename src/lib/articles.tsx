import Config from '@/lib/config'
import { unstable_cache } from 'next/cache'
import { CacheTag } from './cache'
import prisma from './prisma'

export const getArticle = unstable_cache(async (slug: string) =>
  prisma.article.findFirst({
    where: {
      slug,
      status: 'PUBLISHED',
    },
  })
)

export const listArticles = unstable_cache(
  async (page: number) =>
    prisma.article.findMany({
      where: {
        status: 'PUBLISHED',
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: Config.articlesPerPage + 1,
      skip: (page - 1) * Config.articlesPerPage,
    }),
  undefined,
  { tags: [CacheTag('Articles')], revalidate: Config.revalidate }
)

export const listPinnedArticles = unstable_cache(
  async () =>
    prisma.article.findMany({
      where: {
        isPinned: true,
        status: 'PUBLISHED',
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
  undefined,
  { tags: [CacheTag('PinnedArticles')] }
)

export const listArticlesByCategory = unstable_cache(
  async (categoryId: number, page: number) =>
    prisma.article.findMany({
      where: {
        categoryId,
        status: 'PUBLISHED',
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: Config.articlesPerPage + 1,
      skip: (page - 1) * Config.articlesPerPage,
    }),
  undefined,
  { tags: [CacheTag('Articles')], revalidate: Config.revalidate }
)

export const listArticlesByTag = unstable_cache(
  async (tagId: number, page: number) =>
    prisma.articleTag
      .findMany({
        select: {
          Article: true,
        },
        where: {
          tagId: tagId,
          Article: {
            status: 'PUBLISHED',
          },
        },
        orderBy: {
          Article: {
            createdAt: 'desc',
          },
        },
        take: Config.articlesPerPage + 1,
        skip: (page - 1) * Config.articlesPerPage,
      })
      .then((articleTags) => articleTags.map((at) => at.Article)),
  undefined,
  { tags: [CacheTag('Articles')], revalidate: Config.revalidate }
)
