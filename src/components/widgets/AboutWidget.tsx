import { getDictionary } from '@/i18n/dictionaries'
import WidgetCanvas from './WidgetCanvas'

const AboutWidget = async () => {
  const { widgets: t } = await getDictionary()
  return (
    <WidgetCanvas className="flex flex-col gap-2">
      <h2 className="font-bold">{t.about}</h2>
      <div className="text-sm">{t.aboutContent}</div>
    </WidgetCanvas>
  )
}

export default AboutWidget
