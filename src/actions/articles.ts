'use server'

import prisma from '@/lib/prisma'
import { emptyToNull } from '@/lib/string'
import { getSession } from '@auth0/nextjs-auth0/edge'
import { Article_status } from '@prisma/client'

type UpsertArticleState = {
  slug: string
  title: string
  description: string | null
  thumbnailUrl: string | null
  body: string
  isPinned: boolean
  status: Article_status
  categoryId: number
  createdAt: Date | null
  updatedAt: Date | null
  error?: string
}

export async function upsertArticle(prevState: UpsertArticleState, fromData: FormData): Promise<UpsertArticleState> {
  try {
    const session = getSession()
    if (!session) {
      return { ...prevState, error: 'unauthorized' }
    }
    const data = {
      title: fromData.get('title') as string,
      description: emptyToNull(fromData.get('description') as string),
      thumbnailUrl: emptyToNull(fromData.get('thumbnailUrl') as string),
      body: fromData.get('body') as string,
      isPinned: fromData.get('isPinned') === 'on',
      status: fromData.get('status') as Article_status,
      categoryId: parseInt((fromData.get('categoryId') || '0') as string),
    }
    const nextState = await prisma.article.upsert({
      where: {
        slug: prevState.slug,
      },
      update: data,
      create: { slug: prevState.slug, ...data },
    })
    return { ...nextState, error: undefined }
  } catch (e) {
    if (e instanceof Error) {
      console.error(e.message)
    } else {
      console.error('unknown error')
    }
    return { ...prevState, error: `failed to create/update article: ${JSON.stringify(e)}` }
  }
}
