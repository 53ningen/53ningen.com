'use server'

import { CacheTag } from '@/lib/cache'
import prisma from '@/lib/prisma'
import { getSession } from '@auth0/nextjs-auth0/edge'
import { Article_status, Document_status } from '@prisma/client'
import { revalidatePath, revalidateTag } from 'next/cache'

type UpsertDocumentState = {
  slug: string
  title: string
  kana: string | null
  body: string
  status: Article_status
  createdAt: Date | null
  updatedAt: Date | null
  error?: string
}

export async function upsertDocument(prevState: UpsertDocumentState, fromData: FormData): Promise<UpsertDocumentState> {
  try {
    const session = getSession()
    if (!session) {
      return { ...prevState, error: 'unauthorized' }
    }
    const data = {
      title: fromData.get('title') as string,
      kana: fromData.get('kana') as string,
      body: fromData.get('body') as string,
      status: fromData.get('status') as Document_status,
    }
    const nextState = await prisma.document.upsert({
      where: {
        slug: prevState.slug,
      },
      update: data,
      create: { slug: prevState.slug, ...data },
    })
    revalidatePath('/docs')
    revalidatePath(`/docs/${nextState.slug}`)
    revalidatePath(`/admin/docs/${nextState.slug}`)
    revalidatePath(`/admin/docs/preview/${nextState.slug}`)
    revalidateTag(CacheTag('Documents'))
    return { ...nextState, error: undefined }
  } catch (e) {
    if (e instanceof Error) {
      console.error(e.message)
    } else {
      console.error('unknown error')
    }
    return { ...prevState, error: `failed to create/update document: ${JSON.stringify(e)}` }
  }
}
