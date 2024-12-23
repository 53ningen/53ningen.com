import { getDictionary } from '@/i18n/dictionaries'
import Link from 'next/link'

const Footer = async () => {
  const { common } = await getDictionary()
  return (
    <footer className="grid gap-4 p-32 text-center">
      <Link href="/" className="text-xs text-gray-500">
        {common.copyright}
      </Link>
      <Link href="/privacy" className="text-xs text-gray-500">
        {common.privacyPolicy}
      </Link>
    </footer>
  )
}

export default Footer
