'use server'

import { revalidatePath, revalidateTag } from 'next/cache'

type State = { message?: string; error?: string }

export const revalidateByPath = async (_: State, formData: FormData): Promise<State> => {
  const path = (formData.get('path') as string)?.trim()
  if (!path) {
    return { error: 'path is required' }
  }
  revalidatePath(path)
  return { message: `revalidated ${path}` }
}

export const revalidateByTag = async (_: State, formData: FormData): Promise<State> => {
  const tag = (formData.get('tag') as string)?.trim()
  if (!tag) {
    return { error: 'tag is required' }
  }
  revalidateTag(tag)
  return { message: `revalidated ${tag}` }
}
