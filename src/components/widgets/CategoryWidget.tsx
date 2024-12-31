import { getDictionary } from '@/i18n/dictionaries'
import { listCategories } from '@/lib/categories'
import Link from 'next/link'
import WidgetCanvas from './WidgetCanvas'

const CategoryWidget = async () => {
  const { widgets: t } = await getDictionary()
  const categories = await listCategories()
  return (
    <WidgetCanvas className="flex flex-col gap-2">
      <h2 className="font-bold">{t.categories}</h2>
      <div className="flex flex-col gap-1">
        {categories.map((category) => {
          return (
            <Link key={category.id} href={`/categories/${category.id}`} className="text-sm">
              📂 {category.displayName}
            </Link>
          )
        })}
      </div>
    </WidgetCanvas>
  )
}

export default CategoryWidget
