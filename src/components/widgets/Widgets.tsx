import AboutWidget from './AboutWidget'
import CategoryWidget from './CategoryWidget'
import PinWidget from './PinWidget'
import TagWidget from './TagWidget'

const Widgets = () => {
  return (
    <div className="flex flex-col gap-4">
      <PinWidget />
      <AboutWidget />
      <CategoryWidget />
      <TagWidget />
    </div>
  )
}

export default Widgets
