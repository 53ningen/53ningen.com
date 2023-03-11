import { Stack, Typography } from '@mui/material'
import Link from './Link'

export type KanaIndex =
  | 'あ'
  | 'か'
  | 'さ'
  | 'た'
  | 'な'
  | 'は'
  | 'ま'
  | 'や'
  | 'ら'
  | 'わ'

export const kanaIndex: KanaIndex[] = [
  'あ',
  'か',
  'さ',
  'た',
  'な',
  'は',
  'ま',
  'や',
  'ら',
  'わ',
]

interface CollectionIndexProps {
  mapping: Map<string, KanaIndex>
}

export const createCollectionIndexMapping = (items: { name: string; kana: string }[]) => {
  const index = new Map<string, KanaIndex>()
  for (const l of kanaIndex) {
    for (const item of items) {
      const h = item.kana[0]
      if (h && l <= h) {
        index.set(item.name, l)
        break
      }
    }
  }
  return index
}

export const CollectionIndex = ({ mapping }: CollectionIndexProps) => {
  return (
    <Stack direction="row" spacing={2}>
      {kanaIndex.map((i) => {
        if ([...mapping.values()].includes(i)) {
          return (
            <Link key={i} href={`#${i}`}>
              {i}
            </Link>
          )
        } else {
          return (
            <Typography key={i} color="InactiveCaptionText">
              {i}
            </Typography>
          )
        }
      })}
    </Stack>
  )
}
