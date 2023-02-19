import CreateIcon from '@mui/icons-material/Create'
import { Chip, Skeleton } from '@mui/material'

type Props = {
  createdAt?: string
}

export const CreatedDateChip = ({ createdAt }: Props) => {
  return (
    <Chip
      icon={<CreateIcon />}
      label={
        <span suppressHydrationWarning>{createdAt}</span> || <Skeleton width="6rem" />
      }
      variant="outlined"
      size="small"
      sx={{ mr: 1, background: 'white' }}
    />
  )
}
