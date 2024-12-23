import { getDictionary } from '@/i18n/dictionaries'
import { listTagsForWidget } from '@/lib/tags'
import TagChip from '../common/chip/TagChip'
import WidgetCanvas from './WidgetCanvas'

const TagWidget = async () => {
  const { widgets: t } = await getDictionary()
  const tags = await listTagsForWidget()
  return (
    <WidgetCanvas className="flex flex-col gap-2">
      <h2 className="font-bold">{t.tags}</h2>
      <div className="flex flex-wrap gap-1">
        {tags.map((tag) => {
          return <TagChip key={tag.id} tag={tag} />
        })}
      </div>
    </WidgetCanvas>
  )
}

export default TagWidget
