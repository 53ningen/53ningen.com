'use server'

import { DataTablePayload, DataTableState } from '@/components/admin/DataTableTypes'
import { CacheTag } from '@/lib/cache'
import prisma from '@/lib/prisma'
import { emptyToNull } from '@/lib/string'
import { getSession } from '@auth0/nextjs-auth0/edge'
import { Article_status } from '@prisma/client'
import { revalidatePath, revalidateTag } from 'next/cache'

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
    revalidatePath('/')
    revalidatePath(`/${nextState.slug}`)
    revalidatePath(`/${nextState.slug}`)
    revalidatePath(`/${encodeURI(nextState.slug)}`)
    revalidatePath(`/admin/articles/${nextState.slug}`)
    revalidatePath(`/admin/articles/${encodeURI(nextState.slug)}`)
    revalidatePath(`/admin/articles/preview/${nextState.slug}`)
    revalidatePath(`/admin/articles/preview/${encodeURI(nextState.slug)}`)
    revalidateTag(CacheTag('Articles'))
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

export async function modifyArticleTags(previousState: DataTableState, payload: DataTablePayload): Promise<DataTableState> {
  try {
    const session = getSession()
    if (!session) {
      return { ...previousState, error: 'unauthorized' }
    }
    const { action, targetRow, formData } = payload
    switch (action) {
      case 'add':
        await prisma.$transaction(async (prisma) => {
          const tag = await prisma.tag.findFirst({
            where: {
              displayName: formData.get('new.displayName') as string,
            },
          })
          if (tag) {
            await prisma.articleTag.create({
              data: {
                articleId: parseInt(formData.get('articleId') as string),
                tagId: tag.id,
              },
            })
          } else {
            const newTag = await prisma.tag.create({
              data: {
                displayName: formData.get('new.displayName') as string,
              },
            })
            await prisma.articleTag.create({
              data: {
                articleId: parseInt(formData.get('articleId') as string),
                tagId: newTag.id,
              },
            })
          }
        })
        revalidatePath('/')
        revalidateTag(CacheTag('Articles'))

        return { ...previousState, error: undefined }
      case 'delete':
        await prisma.articleTag.delete({
          where: {
            id: parseInt(formData.get(`${targetRow}.id`) as string),
          },
        })
        break
      default:
        throw new Error(`unknown action: ${action}`)
    }
    revalidatePath('/')
    revalidateTag(CacheTag('Articles'))
    return { ...previousState, error: undefined }
  } catch (e) {
    if (e instanceof Error) {
      console.error(e.message)
    } else {
      console.error('unknown error')
    }
    return { ...previousState, error: `failed to article tags: ${JSON.stringify(e)}` }
  }
}
