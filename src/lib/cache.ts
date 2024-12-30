type CacheTagsType = 'Articles' | 'PinnedArticles' | 'Categories' | 'ArticleTags'

export const CacheTag = (tag: CacheTagsType) => {
  return tag as string
}
