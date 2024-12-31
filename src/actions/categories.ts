'use server'

import { CacheTag } from '@/lib/cache'
import prisma from '@/lib/prisma'
import { getSession } from '@auth0/nextjs-auth0/edge'
import { Category } from '@prisma/client'
import { revalidatePath, revalidateTag } from 'next/cache'

type AddCategoryState = {
  categories: Category[]
  error?: string
  message?: string
}

type AddCategoryActions = 'add' | 'ackError'

type AddCategoryPayload = {
  action: AddCategoryActions
  formData?: FormData
}

export async function addCategory(prevState: AddCategoryState, payload: AddCategoryPayload): Promise<AddCategoryState> {
  if (payload.action === 'ackError') {
    return { ...prevState, error: undefined }
  }
  if (!payload.formData) {
    return { ...prevState, error: 'no form data' }
  }

  const fromData = payload.formData
  try {
    const session = await getSession()
    if (!session?.user) {
      return { ...prevState, error: 'unauthorized' }
    }
    const displayName = fromData.get('displayName')
    if (!displayName || prevState.categories.map((c) => c.displayName).includes(displayName as string)) {
      return { ...prevState, error: `category: ${displayName} already exists` }
    }
    const res = await prisma.category.create({
      data: {
        displayName: fromData.get('displayName') as string,
      },
    })
    revalidatePath('/')
    revalidatePath(`/categories/${res.id}`)
    revalidateTag(CacheTag('Categories'))
    const categories = await prisma.category.findMany()
    return { categories, error: undefined }
  } catch (e) {
    if (e instanceof Error) {
      console.error(e.message)
    } else {
      console.error('unknown error')
    }
    return { ...prevState, error: `failed to add category : ${JSON.stringify(e)}` }
  }
}
