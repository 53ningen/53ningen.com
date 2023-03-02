import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  InputLabel,
  MenuItem,
  Select,
  Skeleton,
  Stack,
  TextField,
} from '@mui/material'
import { TagEditor } from './TagEditor'

type Props = {
  title?: string
  onChangeTitle: (title: string) => void
  categories: string[]
  category?: string
  onChangeCategory: (category: string) => void
  tags: string[]
  onChangeTags: (tags: string[]) => void
  disabled: boolean
  pinned: boolean
  onChangePinned: (pinned: boolean) => void
}

export const MetadataEditor = ({
  title,
  onChangeTitle,
  categories,
  category,
  onChangeCategory,
  tags,
  disabled,
  onChangeTags,
  pinned,
  onChangePinned,
}: Props) => {
  return (
    <Stack spacing={2} pt={2}>
      <TextField
        fullWidth
        id="title"
        label="Title"
        variant="outlined"
        sx={{ background: 'white' }}
        value={title}
        disabled={disabled}
        onChange={(e) => onChangeTitle(e.target.value)}
      />
      <FormControl>
        <Stack direction="row" spacing={2}>
          {category && categories ? (
            <Box>
              <InputLabel id="category-label">Category</InputLabel>
              <Select
                id="category"
                label="category"
                size="small"
                sx={{ background: 'white' }}
                value={category}
                disabled={disabled}
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
          ) : (
            <Skeleton width="10rem" component="span" />
          )}
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={pinned}
                  disabled={disabled}
                  onChange={(e) => onChangePinned(e.target.checked)}
                />
              }
              label={pinned ? 'pinned' : 'unpinned'}
            />
          </FormGroup>
        </Stack>
      </FormControl>
      <TagEditor tags={tags} />
    </Stack>
  )
}
