type CacheTagsType = 'Articles' | 'PinnedArticles' | 'Categories' | 'ArticleTags' | 'Documents'

export const CacheTag = (tag: CacheTagsType) => {
  return tag as string
}
