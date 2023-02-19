import RefreshIcon from '@mui/icons-material/Refresh'
import { Chip, Skeleton } from '@mui/material'

type Props = {
  updatedAt?: string
}

export const UpdatedDateChip = ({ updatedAt }: Props) => {
  return (
    <Chip
      icon={<RefreshIcon />}
      label={
        <span suppressHydrationWarning>{updatedAt}</span> || <Skeleton width="6rem" />
      }
      variant="outlined"
      size="small"
      sx={{ mr: 1, background: 'white' }}
    />
  )
}
