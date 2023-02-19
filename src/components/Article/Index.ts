import md5 from 'md5'
import { Heading } from 'mdast'
import { remark } from 'remark'

export type HeadingVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

type SectionIndex = [number, number, number, number, number, number]

export type Index = {
  id: string
  sectionIndex: SectionIndex
  hash: string
  label: string
  depth: number
}

export const generateIndexId = (variant: string, label: string) => {
  return md5(`@h${variant}` + label).slice(0, 6)
}

export const generateIndices = (body: string, depth: number) => {
  const indices: Index[] = []
  const p = remark().parse(body)
  const items = p.children.filter(
    (v) => v.type === 'heading' && v.depth <= depth
  ) as Heading[]
  var sectionIndex: SectionIndex = [0, 0, 0, 0, 0, 0]
  for (const item of items) {
    sectionIndex = sectionIndex.map((n, i) => {
      if (i === item.depth - 1) {
        return n + 1
      } else if (i >= item.depth) {
        return 0
      } else {
        return n
      }
    }) as SectionIndex
    const startLine = item.position?.start.line ?? ''
    const startColumn = item.position?.start.column ?? ''
    const endLine = item.position?.end.line ?? ''
    const endColumn = item.position?.end.column ?? ''
    const hash = `#${startLine},${startColumn},${endLine},${endColumn}`
    const label = item.children.flatMap((c) => (c.type === 'text' ? c.value : '')).join()
    const id = generateIndexId(`h${item.depth}`, label)
    indices.push({
      id,
      sectionIndex,
      hash,
      label,
      depth: item.depth,
    })
  }
  return indices
}
