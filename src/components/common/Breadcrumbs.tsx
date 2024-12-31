import { ChevronRightIcon } from '@heroicons/react/24/solid'
import { Fragment } from 'react'
import Breadcrumb from './Breadcrumb'

interface Props {
  items: { name: string; href: string }[]
}

const Breadcrumbs = ({ items }: Props) => {
  return (
    <nav>
      <Breadcrumb item={{ name: '🏠', href: '/' }} />
      {items.map((i) => (
        <Fragment key={i.name}>
          <span className="px-1 ">
            <ChevronRightIcon className="inline h-4 w-4 text-gray-500" />
          </span>
          <Breadcrumb item={i} />
        </Fragment>
      ))}
    </nav>
  )
}

export default Breadcrumbs
