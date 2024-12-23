import Container from '@/components/common/Container'
import Tabs from '@/components/common/Tabs'
import DocumentList from '@/components/docs/DocumentList'
import Widgets from '@/components/widgets/Widgets'

export default async function Docs() {
  return (
    <div>
      <Container>
        <Tabs currentTab="Documents" />
      </Container>
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4">
        <div className="col-span-1 lg:col-span-2 xl:col-span-3">
          <DocumentList />
        </div>
        <div className="hidden lg:flex lg:col-span-1 lg:mr-8">
          <Widgets />
        </div>
      </div>
    </div>
  )
}
