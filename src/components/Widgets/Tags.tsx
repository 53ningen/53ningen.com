import { Box, Typography } from '@mui/material'
import { TagChip } from '../Chip/TagChip'
import { Widget } from '../Widget'

type Props = {
  items: string[]
}

export const Tags = ({ items }: Props) => {
  return (
    <Widget>
      <Typography variant="h3">Tags</Typography>
      <Box lineHeight="2rem">
        {items.map((tag) => (
          <TagChip key={tag} tag={tag} />
        ))}
      </Box>
    </Widget>
  )
}
