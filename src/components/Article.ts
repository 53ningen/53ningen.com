export interface Article {
  slug: string
  date: string
  title: string
  content: string
  category: string
  tags: [string]
  pinned: boolean
}
