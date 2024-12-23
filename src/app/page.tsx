import Container from '@/components/common/Container'
import Tabs from '@/components/common/Tabs'
import Widgets from '@/components/widgets/Widgets'
import { PagesArticleList } from './pages/[page]/PagesArticleList'

export default async function Home() {
  return (
    <div>
      <Container>
        <Tabs currentTab="Articles" />
      </Container>
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4">
        <div className="col-span-1 lg:col-span-2 xl:col-span-3">
          <PagesArticleList page={1} />
        </div>
        <div className="hidden lg:flex lg:col-span-1 lg:mr-8">
          <Widgets />
        </div>
      </div>
    </div>
  )
}
