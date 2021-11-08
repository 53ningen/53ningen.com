import FolderOpenIcon from '@mui/icons-material/FolderOpen'
import { Card, ListItem, ListItemText, Stack, Typography } from '@mui/material'
import { Box } from '@mui/system'
import Link from '../common/Link'

interface Props {
  categories: string[]
}

export const CategoryList: React.FC<Props> = ({ categories }: Props) => {
  return (
    <Card>
      <Box m={4}>
        <Typography mb={2} variant="h3">
          <Stack direction="row" spacing={1} alignItems="center">
            <FolderOpenIcon />
            <span>Categories</span>
          </Stack>
        </Typography>
        {categories.map((category) => (
          <ListItem
            key={category}
            component={Link}
            href={`/categories/${category}`}
            disableGutters>
            <ListItemText primary={category} />
          </ListItem>
        ))}
      </Box>
    </Card>
  )
}
