import { Document_status } from '@prisma/client'
import { unstable_cache } from 'next/cache'
import { CacheTag } from './cache'
import Config from './config'
import prisma from './prisma'

export const getDocument = unstable_cache(async (slug: string, onlyPublished: boolean = true) =>
  prisma.document.findUnique({
    where: {
      slug,
      status: onlyPublished ? 'PUBLISHED' : undefined,
    },
  })
)

export const listAllDocumentItems = unstable_cache(
  async (status?: Document_status) =>
    prisma.document.findMany({
      select: {
        slug: true,
        title: true,
      },
      where: {
        status: status || 'PUBLISHED',
      },
      orderBy: {
        slug: 'asc',
      },
    }),
  undefined,
  { tags: [CacheTag('Documents')], revalidate: Config.revalidate }
)
