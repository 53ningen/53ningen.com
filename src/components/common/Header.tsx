import { getDictionary } from '@/i18n/dictionaries'
import Image from 'next/image'
import Link from 'next/link'

const Header = async () => {
  const { common } = await getDictionary()
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 py-2 bg-primary">
        <div
          className={`
            grid grid-cols-3
            px-4 sm:px-0
            mx-0 sm:mx-4 md:mx-8
            xl:max-w-screen-lg xl:mx-auto
          `}>
          <div className="flex items-center">
            <Link href="/">
              <div className="flex gap-2 items-center text-white font-extrabold">
                <Image
                  src="/favicon192x192.jpg"
                  alt={common.subtitle}
                  width={32}
                  height={32}
                  priority={true}
                  className="rounded-full border-white border-2"
                />
                <span>{common.subtitle}</span>
              </div>
            </Link>
          </div>
        </div>
      </header>
      <div className="h-20 w-full" />
    </>
  )
}

export default Header
