import Breadcrumbs from '@/components/common/Breadcrumbs'
import Canvas from '@/components/common/Canvas'
import Container from '@/components/common/Container'
import { getDictionary } from '@/i18n/dictionaries'
import PathRevalidator from './PathRevalidator'
import TagRevalidator from './TagRevalidator'

const Cache = async () => {
  const { admin: t } = await getDictionary()
  return (
    <div>
      <Container>
        <Breadcrumbs
          items={[
            {
              name: t.admin,
              href: '/admin',
            },
            {
              name: t.cache,
              href: '/admin/caches',
            },
          ]}
        />
      </Container>
      <Canvas className="flex flex-col gap-8">
        <PathRevalidator />
        <TagRevalidator />
      </Canvas>
    </div>
  )
}

export default Cache
