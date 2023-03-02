import fm from 'front-matter'
import * as fs from 'fs'
import { glob } from 'glob'

export type Article = {
  slug: string
  title: string
  body: string
  pinned: boolean
  createdAt: string
  updatedAt: string
  category: string
  tags: string[]
}

export var allArticles: Article[] = []

export const fetchAllArticles = async () => {
  if (allArticles.length > 0) {
    return allArticles
  }
  const paths = glob.sync('../..//tmp/**/*.md')
  const articles: Article[] = paths
    .map((p) => {
      const file = fs.readFileSync(p, { encoding: 'utf-8' })
      const res = fm(file) as {
        attributes: {
          title: string
          category: string
          date: Date
          tags: [string]
          pinned: boolean
        }
        body: string
      }
      const ps = p.split('/')
      const slug = ps[ps.length - 1].replace('.md', '')
      const dateISOString = res.attributes.date.toISOString()
      const date = `${dateISOString.slice(0, dateISOString.length - 1)}+09:00`
      return {
        slug: slug,
        title: res.attributes.title,
        body: res.body,
        category: res.attributes.category,
        createdAt: date.toString(),
        updatedAt: date.toString(),
        tags: res.attributes.tags,
        pinned: res.attributes.pinned,
      } as Article
    })
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
  allArticles = articles
  return allArticles
}

export const fetchArticle = async (slug: string) => {
  const all = await fetchAllArticles()
  return all.find((a) => a.slug === slug)
}

export const fetchPinnedArticles = async () => {
  const all = await fetchAllArticles()
  return all.filter((a) => (a as any)['pinned'])
}

export const fetchAllCategories = async () => {
  const all = await fetchAllArticles()
  const categories = [...new Set(all.map((a) => a.category))]
  return categories
}

export const fetchAllTags = async () => {
  const all = await fetchAllArticles()
  const tags = [...new Set(all.flatMap((a) => a.tags))]
  return tags
}
