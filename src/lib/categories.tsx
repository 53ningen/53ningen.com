import { unstable_cache } from 'next/cache'
import { CacheTag } from './cache'
import prisma from './prisma'

export const getCategory = unstable_cache(
  async (id: number) =>
    prisma.category.findUnique({
      where: {
        id,
      },
    }),
  undefined,
  { tags: [CacheTag('Categories')] }
)

export const listCategories = unstable_cache(
  async () =>
    prisma.category.findMany({
      orderBy: {
        id: 'asc',
      },
    }),
  undefined,
  { tags: [CacheTag('Categories')] }
)
