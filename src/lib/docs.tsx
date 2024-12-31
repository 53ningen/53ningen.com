import { unstable_cache } from 'next/cache'
import prisma from './prisma'

export const getDocument = unstable_cache(async (slug: string) =>
  prisma.document.findUnique({
    where: {
      slug,
      status: 'PUBLISHED',
    },
  })
)

export const listAllDocumentItems = unstable_cache(async () =>
  prisma.document.findMany({
    select: {
      slug: true,
      title: true,
    },
    where: {
      status: 'PUBLISHED',
    },
    orderBy: {
      slug: 'asc',
    },
  })
)
