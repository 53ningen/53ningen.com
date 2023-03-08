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

type Props = {
  title?: string
  category?: string
  categories?: string[]
  pinned?: boolean
  disabled: boolean
  onChangeTitle: (title: string) => void
  onChangeCategory: (category: string) => void
  onChangePinned: (pinned: boolean) => void
}

export const MetadataEditor = ({
  title,
  category,
  categories,
  pinned,
  disabled,
  onChangeTitle,
  onChangeCategory,
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
                  checked={pinned || false}
                  disabled={disabled}
                  onChange={(e) => onChangePinned(e.target.checked)}
                />
              }
              label={'pinned'}
            />
          </FormGroup>
        </Stack>
      </FormControl>
    </Stack>
  )
}
