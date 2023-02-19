import FolderOpenIcon from '@mui/icons-material/FolderOpen'
import { Chip, Skeleton } from '@mui/material'
import Link from '../Link'

type Props = {
  category?: string
}

export const CategoryChip = ({ category }: Props) => {
  return (
    <Chip
      icon={<FolderOpenIcon />}
      label={
        category ? (
          <Link href={`/categories/${category}`} color="inherit">
            {category}
          </Link>
        ) : (
          <Skeleton width="6rem" />
        )
      }
      size="small"
      sx={{ mr: 1 }}
    />
  )
}
