import Canvas from '@/components/common/Canvas'
import { getDictionary } from '@/i18n/dictionaries'
import Link from 'next/link'
import { GoFileDirectory } from 'react-icons/go'
import { MdOutlineSubdirectoryArrowRight } from 'react-icons/md'

const Admin = async () => {
  const { admin: t } = await getDictionary()
  return (
    <div>
      <Canvas className="flex flex-col gap-2">
        <div>
          <AdminMenuItem label={t.articles} />
          <AdminMenuItem href="/admin/articles/statuses/draft" label="Draft Articles" />
          <AdminMenuItem href="/admin/articles/statuses/private" label="Private Articles" />
          <AdminMenuItem href="/admin/articles/statuses/archived" label="Archived Articles" />
          <AdminMenuItem href="/admin/articles/categories" label="Categories" />
        </div>
        <div>
          <AdminMenuItem label={t.documents} />
          <AdminMenuItem href="/admin/docs/statuses/draft" label="Draft Documents" />
          <AdminMenuItem href="/admin/docs/statuses/private" label="Private Documents" />
          <AdminMenuItem href="/admin/docs/statuses/archived" label="Archived Documents" />
        </div>
        <div>
          <AdminMenuItem label={t.operations} />
          <AdminMenuItem href="/admin/caches" label={t.cache} />
          <AdminMenuItem href="/admin/logout" label={t.logout} />
        </div>
      </Canvas>
    </div>
  )
}

export default Admin

type AdminMenuItemProps = {
  href?: string
  label: string
}

const AdminMenuItem = ({ href, label }: AdminMenuItemProps) => {
  return (
    <div className="flex gap-2 items-center text-sm">
      {href ? <MdOutlineSubdirectoryArrowRight /> : <GoFileDirectory />}
      {href ? <Link href={href}>{label}</Link> : <span>{label}</span>}
    </div>
  )
}
