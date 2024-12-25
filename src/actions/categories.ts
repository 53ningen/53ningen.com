'use server'

import prisma from '@/lib/prisma'
import { getSession } from '@auth0/nextjs-auth0/edge'
import { Category } from '@prisma/client'

type AddCategoryState = {
  categories: Category[]
  error?: string
}

export async function addCategory(prevState: AddCategoryState, fromData: FormData): Promise<AddCategoryState> {
  try {
    const session = getSession()
    if (!session) {
      return { ...prevState, error: 'unauthorized' }
    }
    await prisma.category.create({
      data: {
        displayName: fromData.get('displayName') as string,
      },
    })
    const categories = await prisma.category.findMany()
    // TODO: revalidate cache
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
