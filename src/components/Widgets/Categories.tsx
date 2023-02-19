import { Stack, Typography } from '@mui/material'
import Link from '../Link'
import { Widget } from '../Widget'

type Props = {
  items: string[]
}

export const Categories = ({ items }: Props) => {
  return (
    <Widget>
      <Typography variant="h3">Categories</Typography>
      <Stack spacing={1}>
        {items.map((category) => (
          <Typography key={category} variant="body2">
            <Link href={`/categories/${category}`}>{category}</Link>
          </Typography>
        ))}
      </Stack>
    </Widget>
  )
}
