import { API, graphqlOperation } from 'aws-amplify'
import { CreateArticleInput, CreateArticleTagsInput } from '../../../src/API'
import {
  createArticle,
  createArticleTags,
  createCategory,
  createTag,
} from '../../../src/graphql/mutations'
import { getArticle, getCategory, getTag } from '../../../src/graphql/queries'

import { Article } from './markdown'

export const addCategory = async (category: string) => {
  try {
    const res: any = await API.graphql(graphqlOperation(getCategory, { id: category }))
    if (res?.data?.getCategory?.id === category) {
      console.log(`category: ${category} already exists. skipping...`)
      return
    } else {
      await API.graphql(graphqlOperation(createCategory, { input: { id: category } }))
      console.log(`category: ${category} added`)
    }
  } catch (e) {
    console.error(e)
  }
}

export const addTag = async (tag: string) => {
  try {
    const res: any = await API.graphql(graphqlOperation(getTag, { id: tag }))
    if (res?.data?.getTag?.id === tag) {
      console.log(`tag: ${tag} already exists. skipping...`)
      return
    } else {
      await API.graphql(graphqlOperation(createTag, { input: { id: tag } }))
      console.log(`tag: ${tag} added`)
    }
  } catch (e) {
    console.error(e)
  }
}

export const addArticle = async (article: Article) => {
  try {
    const res: any = await API.graphql(
      graphqlOperation(getArticle, { slug: article.slug })
    )
    if (res?.data?.getArticle?.slug === article.slug) {
      console.log(`article: ${article.slug} already exists. skipping...`)
      return
    } else {
      await API.graphql(
        graphqlOperation(createArticle, {
          input: {
            slug: article.slug,
            title: article.title,
            body: article.body,
            pinned: article.pinned,
            categoryArticlesId: article.category,
            type: 'Article',
            createdAt: article.createdAt,
            updatedAt: article.updatedAt,
          } as CreateArticleInput,
        })
      )
      for (const tag of article.tags) {
        await API.graphql(
          graphqlOperation(createArticleTags, {
            input: {
              articleID: article.slug,
              tagID: tag,
            } as CreateArticleTagsInput,
          })
        )
      }
      console.log(`article: ${article.slug} added`)
    }
  } catch (e) {
    console.error(e)
  }
}
