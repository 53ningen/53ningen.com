import Canvas from '@/components/common/Canvas'
import { ISO8601toJPDateTimeStr } from '@/lib/datetime'
import prisma from '@/lib/prisma'
import { Document_status } from '@prisma/client'
import Link from 'next/link'

type Props = {
  status: Document_status
}

export const NonPublishedDocumentList = async ({ status }: Props) => {
  const documents = await prisma.document.findMany({
    where: {
      status,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
  const basePath = '/admin/docs/preview'
  return (
    <div className="flex flex-col gap-8">
      {documents.map((document) => (
        <Canvas key={document.id}>
          <div className="flex flex-col">
            {document.status !== 'PUBLISHED' && (
              <div>
                <span className="text-xs px-1 py-[0.5] bg-black text-white rounded-full">{document.status}</span>
              </div>
            )}
            <div className="text-sm">
              <Link href={`${basePath}/${document.slug}`} id={document.slug.toString()} className="text-gray-500 hover:text-gray-500">
                {ISO8601toJPDateTimeStr(document.createdAt)}
              </Link>
            </div>
            <div className="font-bold">
              <Link href={`${basePath}/${document.slug}`} id={document.slug.toString()} className="text-primary hover:text-primary">
                {document.title}
              </Link>
            </div>
          </div>
        </Canvas>
      ))}
      {documents.length === 0 && (
        <Canvas>
          <div>No documents found</div>
        </Canvas>
      )}
    </div>
  )
}
