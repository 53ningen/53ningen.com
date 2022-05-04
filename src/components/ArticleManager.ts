import { format } from 'date-fns'
import fm from 'front-matter'
import * as fs from 'fs'
import { glob } from 'glob'
import { Constants } from '../Constants'
import { Article } from './Article'

interface PaginatedArticles {
  articles: Article[]
  currentPage: number
  totalPages: number
}

export interface BlogMetadata {
  categories: string[]
  tags: string[]
  archives: string[]
  pinnedArticles: Article[]
}

export interface ArticleManger {
  fetchAllArticles: () => Promise<Article[]>
  fetchArticle: (slug: string) => Promise<Article | undefined>
  fetchArticles: (page: number) => Promise<PaginatedArticles>
  fetchCategoryArticles: (
    category: string,
    page: number
  ) => Promise<PaginatedArticles>
  fetchTagArticles: (tag: string, page: number) => Promise<PaginatedArticles>
  fetchArchiveArticles: (archive: string) => Promise<Article[]>
  fetchMetadata: () => Promise<BlogMetadata>
}

export class LocalArticleManager implements ArticleManger {
  public static sharedInstance: ArticleManger = new LocalArticleManager(
    Constants.articlesPerPage
  )

  private useCache: boolean = true
  private allArticles?: Article[]
  private meta?: BlogMetadata
  private articlesPerPage: number

  constructor(articlesPerPage: number) {
    this.articlesPerPage = articlesPerPage
  }

  fetchAllArticles = async () => {
    if (this.allArticles && this.useCache) {
      return this.allArticles
    }
    const paths = glob.sync(Constants.articlePaths)
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
        // FIXME
        const dateISOString = res.attributes.date.toISOString()
        const date = `${dateISOString.slice(0, dateISOString.length - 1)}+09:00`
        return {
          slug: slug,
          title: res.attributes.title,
          category: res.attributes.category,
          date: date,
          tags: res.attributes.tags,
          pinned: res.attributes.pinned,
          content: res.body,
        }
      })
      .sort((a, b) => (a.date == b.date ? 0 : a.date > b.date ? -1 : 1))
    this.allArticles = articles
    return this.allArticles
  }

  fetchArticle = async (slug: string) => {
    const all = await this.fetchAllArticles()
    return all.find((a) => a.slug === slug)
  }

  fetchArticles = async (page: number) => {
    const all = await this.fetchAllArticles()
    const totalPages = Math.ceil(all.length / this.articlesPerPage)
    const startIndex = this.articlesPerPage * (page - 1)
    const endIndex = startIndex + this.articlesPerPage
    const articles = all.slice(startIndex, endIndex)
    return {
      articles,
      currentPage: page,
      totalPages,
    }
  }

  fetchCategoryArticles = async (category: string, page: number) => {
    const all = await this.fetchAllArticles()
    const allForCategory = all.filter((a) => a.category === category)
    const totalPages = Math.ceil(allForCategory.length / this.articlesPerPage)
    const startIndex = this.articlesPerPage * (page - 1)
    const endIndex = startIndex + this.articlesPerPage
    const articles = allForCategory.slice(startIndex, endIndex)
    return {
      articles,
      currentPage: page,
      totalPages,
    }
  }

  fetchTagArticles = async (tag: string, page: number) => {
    const all = await this.fetchAllArticles()
    const allForTag = all.filter((a) => a.tags.find((t) => t === tag))
    const totalPages = Math.ceil(allForTag.length / this.articlesPerPage)
    const startIndex = this.articlesPerPage * (page - 1)
    const endIndex = startIndex + this.articlesPerPage
    const articles = allForTag.slice(startIndex, endIndex)
    return {
      articles,
      currentPage: page,
      totalPages,
    }
  }

  fetchArchiveArticles = async (archive: string) => {
    const all = await this.fetchAllArticles()
    const articles = all.filter(
      (a) => format(new Date(a.date), 'yyyy-MM') === archive
    )
    return articles
  }

  private fetchPinnedArticles = async () => {
    const all = await this.fetchAllArticles()
    return all.filter((a) => a.pinned)
  }

  private fetchCategories = async () => {
    const all = await this.fetchAllArticles()
    const categories = [...new Set(all.map((a) => a.category))]
    return categories
  }

  private fetchTags = async () => {
    const all = await this.fetchAllArticles()
    const counter = new Map<string, number>()
    for (const article of all) {
      for (const tag of article.tags) {
        counter.set(tag, (counter.get(tag) ?? 0) + 1)
      }
    }
    const tags = [...new Set(all.flatMap((a) => a.tags))]
    return tags.sort((a, b) => counter.get(b)! - counter.get(a)!)
  }

  private fetchArchives = async () => {
    const all = await this.fetchAllArticles()
    const archives = [
      ...new Set(all.map((a) => format(new Date(a.date), 'yyyy-MM'))),
    ]
    return archives
  }

  fetchMetadata = async () => {
    if (this.meta && this.useCache) {
      return this.meta
    }
    const categories = await this.fetchCategories()
    const tags = await this.fetchTags()
    const archives = await this.fetchArchives()
    const pinnedArticles = await this.fetchPinnedArticles()
    this.meta = {
      categories,
      tags,
      archives,
      pinnedArticles,
    }
    return this.meta
  }
}
