import Canvas from '@/components/common/Canvas'
import Container from '@/components/common/Container'

interface Params {
  params: Promise<{ slug: string[] }>
}

export default async function DocsSlug({ params }: Params) {
  const p = await params
  console.log(p)
  return (
    <>
      <Container>Hello from Container</Container>
      <Canvas>Hello from Canvas</Canvas>
    </>
  )
}
