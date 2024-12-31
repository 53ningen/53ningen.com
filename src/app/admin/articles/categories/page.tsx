import CategoryForm from '@/components/admin/CategoryForm'
import Breadcrumbs from '@/components/common/Breadcrumbs'
import Container from '@/components/common/Container'
import { getDictionary } from '@/i18n/dictionaries'
import { listCategories } from '@/lib/categories'

const AdminCategories = async () => {
  const data = await listCategories()
  const d = await getDictionary()
  return (
    <Container className="flex flex-col gap-2">
      <Breadcrumbs
        items={[
          { name: d.admin.admin, href: '/admin' },
          { name: d.common.category, href: '/admin/articles/categories' },
        ]}
      />
      <CategoryForm categories={data} />
    </Container>
  )
}

export default AdminCategories
