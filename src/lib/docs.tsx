import { Article_status, Document_status } from '@prisma/client'
import { unstable_cache } from 'next/cache'
import prisma from './prisma'

export const getDocument = unstable_cache(async (slug: string, onlyPublished: boolean = true) =>
  prisma.document.findUnique({
    where: {
      slug,
      status: onlyPublished ? 'PUBLISHED' : undefined,
    },
  })
)

export const listAllDocumentItems = unstable_cache(async (status?: Document_status) =>
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
  })
)

export const listNonPublishedDocumentItems = unstable_cache(async (status: Article_status) =>
  prisma.document.findMany({
    select: {
      slug: true,
      title: true,
    },
    where: {
      status,
    },
    orderBy: {
      slug: 'asc',
    },
  })
)
