import { unstable_cache } from 'next/cache'
import prisma from './prisma'

export const getCategory = unstable_cache(async (id: number) =>
  prisma.category.findUnique({
    where: {
      id,
    },
  })
)

export const listCategories = unstable_cache(async () =>
  prisma.category.findMany({
    orderBy: {
      id: 'asc',
    },
  })
)
