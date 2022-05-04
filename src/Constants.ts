export const Constants = {
  title: process.env.NEXT_PUBLIC_SITE_TITLE as string,
  subtitle: process.env.NEXT_PUBLIC_SITE_SUBTITLE as string,
  articlePaths: process.env.NEXT_PUBLIC_ARTICLE_PATHS as string,
  articlesPerPage: parseInt(
    process.env.NEXT_PUBLIC_ARTICLES_PER_PAGE as string
  ),
  siteURL: process.env.NEXT_PUBLIC_SITE_URL as string,
}
