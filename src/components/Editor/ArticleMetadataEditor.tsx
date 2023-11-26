import {
  Box,
  Button,
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
import { useEffect, useState } from 'react'
import { AddCategoryDialog } from './AddCategory'

type Props = {
  title?: string
  category?: string
  categories?: string[]
  pinned?: boolean
  draft?: boolean
  disabled: boolean
  onChangeTitle: (title: string) => void
  onChangeCategory: (category: string) => void
  onChangePinned: (pinned: boolean) => void
  onChangeDraft: (draft: boolean) => void
}

export const ArticleMetadataEditor = ({
  title,
  category,
  categories,
  pinned,
  draft,
  disabled,
  onChangeTitle,
  onChangeCategory,
  onChangePinned,
  onChangeDraft,
}: Props) => {
  const [categoryItems, setCategoryItems] = useState<string[]>([])
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  useEffect(() => {
    if (categories) {
      setCategoryItems((items) => (items.length === 0 ? categories : items))
    }
  }, [categories])
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
                {categoryItems.map((c) => {
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
          <Button
            size="small"
            variant="outlined"
            disabled={disabled}
            onClick={() => {
              setCategoryDialogOpen(true)
            }}>
            Add Category
          </Button>
          <AddCategoryDialog
            open={categoryDialogOpen}
            handleClose={(c) => {
              if (c && !categoryItems.includes(c)) {
                setCategoryItems([...categoryItems, c])
                onChangeCategory(c)
              }
              setCategoryDialogOpen(false)
            }}
          />
          <FormGroup>
            <Stack direction="row">
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
              <FormControlLabel
                control={
                  <Checkbox
                    checked={draft || false}
                    disabled={disabled}
                    onChange={(e) => onChangeDraft(e.target.checked)}
                  />
                }
                label={'draft'}
              />
            </Stack>
          </FormGroup>
        </Stack>
      </FormControl>
      <TextField
        fullWidth
        id="description"
        label="Description"
        variant="outlined"
        size="small"
        sx={{ background: 'white' }}
        value={title}
        disabled={disabled}
        onChange={(e) => onChangeTitle(e.target.value)}
      />
    </Stack>
  )
}
