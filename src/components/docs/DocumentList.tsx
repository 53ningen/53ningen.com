import { listAllDocumentItems } from '@/lib/docs'
import { Document_status } from '@prisma/client'
import Link from 'next/link'
import { GoFileDirectory } from 'react-icons/go'
import { MdOutlineSubdirectoryArrowRight } from 'react-icons/md'
import { VscBlank } from 'react-icons/vsc'
import Canvas from '../common/Canvas'

type Props = {
  status?: Document_status
  basePath?: string
}

const DocumentList = async ({ status = 'PUBLISHED', basePath = '/docs' }: Props) => {
  const items = await listAllDocumentItems(status)
  const info = listDocumentInfo(items)
  return (
    <Canvas>
      <div className="flex flex-col">
        {info.map((item, index) => (
          <div key={index} className="flex flex-col">
            <div className={`flex gap-2 items-center`}>
              {Array.from({ length: item.depth - 1 }).map((_, index) => (
                <VscBlank key={index} className="w-2" />
              ))}
              {item.hasChildren ? <GoFileDirectory /> : <MdOutlineSubdirectoryArrowRight />}
              {item.title ? <Link href={`${basePath}/${item.path}`}>{item.title}</Link> : <>{item.path}</>}
            </div>
          </div>
        ))}
      </div>
    </Canvas>
  )
}

type DocumentInfo = {
  path: string
  title?: string
  depth: number
  hasChildren: boolean
}

const listDocumentInfo = (items: { slug: string; title: string }[]): DocumentInfo[] => {
  const documentInfo: DocumentInfo[] = []
  items.forEach((item) => {
    const depth = item.slug.split('/').length
    const hasChildren = items.some((child) => child.slug.startsWith(item.slug + '/')) || depth === 1
    const parentPath = item.slug.split('/').slice(0, -1).join('/')
    const hasParent = documentInfo.some((parent) => parent.path === parentPath)
    if (depth > 1 && !hasParent) {
      documentInfo.push({
        path: parentPath,
        depth: depth - 1,
        hasChildren: true,
      })
    }
    documentInfo.push({
      path: item.slug,
      title: item.title,
      depth,
      hasChildren,
    })
  })
  return documentInfo
}

export default DocumentList
