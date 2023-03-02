import { format } from 'date-fns'

export const Const = {
  siteTitle: '53ningen.com',
  siteSubtitle: 'ゴミ人間.com',
  siteDescription:
    'ウェブ界隈でエンジニアとして労働活動に励んでいる @gomi_ningen 個人のサイトです',
  siteUrl: 'https://53ningen.com',
  twitterUrl: 'https://twitter.com/gomi_ningen',
  githubUrl: 'https://github.com/53ningen',
  tokikenUrl: 'https://tokiken.com',
  circleUrl: 'https://circle.53ningen.com',
  reservedSlugs: ['tags', 'categories', 'archives', 'pages', 'etc'],
  revalidateImportPageSec: 1 * 60,
  revalidateListPageSec: 60 * 60,
  revalidateNotFoundPageSec: 30 * 60,
  articlesPerPage: 20,
  ISO8601toDateTimeString: (dt?: string) => {
    return dt ? format(new Date(dt), 'yyyy-MM-dd HH:mm') : ''
  },
}
