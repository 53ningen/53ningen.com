import { Card, Skeleton, Stack, Typography } from '@mui/material'
import Link from '../Link'
import { Widget } from '../Widget'
import { generateIndices } from './Index'

type Props = {
  body?: string
  depth?: number
}

export const ArticleIndex = ({ body, depth = 3 }: Props) => {
  if (body) {
    const indices = generateIndices(body, depth)
    return indices && indices.length > 0 ? (
      <Widget>
        <Typography variant="h3">Index</Typography>
        <Stack spacing={1}>
          {indices.map((v, i) => (
            <Typography pl={v.depth - 1} key={i.toString()} variant="body2">
              <Link href={`#${v.id}`}>{v.label}</Link>
            </Typography>
          ))}
        </Stack>
      </Widget>
    ) : (
      <></>
    )
  } else {
    return (
      <Card>
        <Stack p={2}>
          <Skeleton />
          <Skeleton />
          <Skeleton />
          <Skeleton />
          <Skeleton />
          <Skeleton />
          <Skeleton />
          <Skeleton />
          <Skeleton />
          <Skeleton />
          <Skeleton />
          <Skeleton />
          <Skeleton />
          <Skeleton />
          <Skeleton />
          <Skeleton />
          <Skeleton />
        </Stack>
      </Card>
    )
  }
}
