import { listArticleMetadata, listCategoryIds, listSlugs } from '@/graphql/custom-queries'
import { GraphQLResult } from '@aws-amplify/api-graphql'
import { API, graphqlOperation } from 'aws-amplify'
import { promises as fs } from 'fs'
import {
  Article,
  ListArticleMetadataQuery,
  ListArticleMetadataQueryVariables,
  ListCategoryIdsQuery,
  listSlugsQuery,
  ListTagIdsQuery,
  ModelSortDirection,
} from './API'
import { listTags } from './graphql/queries'

export const listAllSlugs = async (nextToken?: string): Promise<string[]> => {
  const cacheKey = 'slugs'
  const c = await cache.get(cacheKey)
  if (!nextToken && c) {
    return c as string[]
  }
  const res = (await API.graphql(
    graphqlOperation(listSlugs, { nextToken })
  )) as GraphQLResult<listSlugsQuery>
  if (!res.data?.listArticles?.items || res.errors) {
    console.error(res)
    throw new Error('unexpected error')
  }
  const items = res.data.listArticles.items.map((i) => i!.slug) as string[]
  const next = res.data?.listArticles?.nextToken
  var slugs: string[] = []
  if (next) {
    const more = await listAllSlugs(next)
    slugs = items.concat(more)
  } else {
    slugs = items
  }
  !nextToken && cache.set(cacheKey, slugs)
  return slugs
}

export const listAllTags = async (nextToken?: string): Promise<string[]> => {
  const cacheKey = 'tags'
  const c = await cache.get(cacheKey)
  if (!nextToken && c) {
    return c as string[]
  }
  const res = (await API.graphql(
    graphqlOperation(listTags, { nextToken })
  )) as GraphQLResult<ListTagIdsQuery>
  if (!res.data?.listTags?.items || res.errors) {
    console.error(res)
    throw new Error('unexpected error')
  }
  const items = res.data.listTags.items.map((i) => i!.id) as string[]
  const next = res.data?.listTags?.nextToken

  var ids: string[] = []
  if (next) {
    const more = await listAllTags(next)
    ids = items.concat(more)
  } else {
    ids = items
  }
  !nextToken && cache.set(cacheKey, ids)
  return ids
}

export const listAllCategories = async (nextToken?: string): Promise<string[]> => {
  const cacheKey = 'categories'
  const c = await cache.get(cacheKey)
  if (!nextToken && c) {
    return c as string[]
  }
  const res = (await API.graphql(
    graphqlOperation(listCategoryIds, { nextToken })
  )) as GraphQLResult<ListCategoryIdsQuery>
  if (!res.data?.listCategories?.items || res.errors) {
    console.error(res)
    throw new Error('unexpected error')
  }
  const items = res.data.listCategories.items.map((i) => i!.id) as string[]
  const next = res.data?.listCategories?.nextToken
  var ids: string[] = []
  if (next) {
    const more = await listAllTags(next)
    ids = items.concat(more)
  } else {
    ids = items
  }
  !nextToken && cache.set(cacheKey, ids)
  return ids
}

export type ArticleMeta = Omit<Article, 'body'>

export const listAllArticleMetadata = async (
  nextToken?: string
): Promise<ArticleMeta[]> => {
  const cacheKey = 'metadata'
  const c = await cache.get(cacheKey)
  if (!nextToken && c) {
    return c as ArticleMeta[]
  }
  const res = (await API.graphql(
    graphqlOperation(listArticleMetadata, {
      nextToken,
      sortDirection: ModelSortDirection.DESC,
    } as ListArticleMetadataQueryVariables)
  )) as GraphQLResult<ListArticleMetadataQuery>
  if (!res.data?.listArticlesOrderByCreatedAt?.items || res.errors) {
    console.error(res)
    throw new Error('unexpected error')
  }
  const items = res.data.listArticlesOrderByCreatedAt.items as ArticleMeta[]
  const next = res.data?.listArticlesOrderByCreatedAt?.nextToken

  var meta: ArticleMeta[] = []
  if (next) {
    const more = await listAllArticleMetadata(next)
    meta = items.concat(more)
  } else {
    meta = items
  }
  !nextToken && cache.set(cacheKey, meta)
  return meta
}

const cache = {
  get: async (key: string): Promise<any> => {
    try {
      const data = await fs.readFile(`/tmp/${key}.db`)
      const cache = JSON.parse(data as unknown as string) as any[]
      if (cache.length > 0) {
        return cache
      }
    } catch (e) {
      console.log(`${key}: fetching...`)
      if (e instanceof Error && e.name !== 'ENOENT') {
        return undefined
      }
      console.log(e)
    }
    return undefined
  },
  set: async (key: string, value: any) => {
    try {
      await fs.writeFile(`/tmp/${key}.db`, JSON.stringify(value))
    } catch (e) {
      console.error(e)
    }
  },
}
