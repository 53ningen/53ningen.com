import Canvas from '@/components/common/Canvas'
import Container from '@/components/common/Container'
import Link from 'next/link'

export default async function Home() {
  return (
    <>
      <Container>Hello from Container</Container>
      <Canvas>
        <div>Hello from Canvas</div>
        <div className="flex flex-col">
          <Link href="/test">/test</Link>
          <Link href="/docs">/docs</Link>
          <Link href="/docs/test">/docs/test</Link>
          <Link href="/docs/hoge/fuga/piyo">/docs/hoge/fuga/piyo</Link>
        </div>
      </Canvas>
    </>
  )
}
