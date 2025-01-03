import { unstable_cache } from 'next/cache'
import { CacheTag } from './cache'
import Config from './config'
import prisma from './prisma'

export const getTag = unstable_cache(async (id: number) =>
  prisma.tag.findUnique({
    where: {
      id,
    },
  })
)

export const listTagsByArticleId = unstable_cache(
  async (articleId: number) =>
    prisma.tag.findMany({
      where: {
        ArticleTag: {
          some: {
            articleId,
          },
        },
      },
    }),
  undefined,
  { tags: [CacheTag('ArticleTags')] }
)

export const listTagsForWidget = unstable_cache(
  async () =>
    prisma.articleTag
      .findMany({
        select: {
          Tag: true,
        },
        orderBy: {
          articleId: 'desc',
        },
        distinct: ['tagId'],
        take: 50,
      })
      .then((articleTags) => articleTags.map((articleTag) => articleTag.Tag)),
  undefined,
  { revalidate: Config.revalidate }
)
