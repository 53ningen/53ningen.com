import { categories } from '@/data'
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material'
import { TagEditor } from './TagEditor'

type Props = {
  title?: string
  onChangeTitle: (title: string) => void
  category?: string
  onChangeCategory: (category: string) => void
  tags: string[]
  onChangeTags: (tags: string[]) => void
}

export const MetadataEditor = ({
  title,
  onChangeTitle,
  category,
  onChangeCategory,
  tags,
  onChangeTags,
}: Props) => {
  return (
    <Stack spacing={2} py={4}>
      <TextField
        fullWidth
        id="title"
        label="Title"
        variant="outlined"
        sx={{ background: 'white' }}
        value={title}
        onChange={(e) => onChangeTitle(e.target.value)}
      />
      <FormControl>
        <Box>
          <InputLabel id="category-label">Category</InputLabel>
          <Select
            id="category"
            label="category"
            size="small"
            sx={{ background: 'white' }}
            value={category || categories[0]}
            onChange={(e) => onChangeCategory(e.target.value)}>
            {categories.map((c) => {
              return (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              )
            })}
          </Select>
        </Box>
      </FormControl>
      <TagEditor tags={tags} />
    </Stack>
  )
}
