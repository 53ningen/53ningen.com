import LocalOfferIcon from '@mui/icons-material/LocalOffer'
import { Chip } from '@mui/material'
import Link from '../Link'

type Props = {
  tag: string
  editable?: boolean
  onDelete?: () => Promise<void>
}

export const TagChip = ({ tag, editable: editable = false, onDelete }: Props) => {
  return (
    <Chip
      key={tag}
      icon={<LocalOfferIcon />}
      label={
        <Link href={`/tags/${tag}`} color="inherit">
          {tag}
        </Link>
      }
      size="small"
      sx={{ mr: 1 }}
      onDelete={editable ? onDelete : undefined}
    />
  )
}
