import { getDictionary } from '@/i18n/dictionaries'
import { listPinnedArticles } from '@/lib/articles'
import Link from 'next/link'
import WidgetCanvas from './WidgetCanvas'

const PinWidget = async () => {
  const articles = await listPinnedArticles()
  const { widgets: t } = await getDictionary()
  return (
    <WidgetCanvas className="flex flex-col gap-2">
      <h2 className="font-bold">{t.pinnedArticles}</h2>
      <div className="flex flex-col gap-1">
        {articles.map((article) => {
          return (
            <Link key={article.id} href={`/${article.slug}`} className="text-sm">
              📝 {article.title}
            </Link>
          )
        })}
      </div>
    </WidgetCanvas>
  )
}

export default PinWidget
