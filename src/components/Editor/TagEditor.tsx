import { Box } from '@mui/material'
import { TagChip } from '../Chip/TagChip'

type Props = {
  tags: string[]
}

export const TagEditor = ({ tags }: Props) => {
  return (
    <Box lineHeight={2.5}>
      {tags.map((tag) => {
        return <TagChip key={tag} tag={tag} />
      })}
    </Box>
  )
}
