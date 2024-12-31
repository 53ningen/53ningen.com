import { getDictionary } from '@/i18n/dictionaries'
import Link from 'next/link'
import { FaGithub } from 'react-icons/fa'
import { IoMdDocument } from 'react-icons/io'
import { MdOutlineArticle } from 'react-icons/md'

type Props = {
  currentTab: 'Articles' | 'Documents'
}

const Tabs = async ({ currentTab }: Props) => {
  const { common: t } = await getDictionary()
  const items = [
    {
      label: (
        <div className="flex items-center gap-1">
          <MdOutlineArticle />
          <span>{t.articles}</span>
        </div>
      ),
      href: '/',
      tab: 'Articles',
    },
    {
      label: (
        <div className="flex items-center gap-1">
          <IoMdDocument />
          <span>{t.documents}</span>
        </div>
      ),
      href: '/docs',
      tab: 'Documents',
    },
    {
      label: (
        <div className="flex items-center gap-1">
          <FaGithub />
          <span>{t.github}</span>
        </div>
      ),
      href: 'https://github.com/53ningen',
      tab: 'GitHub',
    },
  ]
  return (
    <div className="flex gap-2 justify-center lg:justify-start mb-4 sm:mb-[-4]">
      {items.map((item, index) => (
        <Link
          key={index}
          href={item.href}
          className={`
          px-4 py-2 text-sm text-primary rounded-t-lg
          hover:text-primary hover:border-b-4 hover:border-gray-500
          ${item.tab === currentTab && 'border-b-4 border-gray-500'}`}
          target={item.href.startsWith('/') ? '_self' : '_blank'}>
          {item.label}
        </Link>
      ))}
    </div>
  )
}

export default Tabs
