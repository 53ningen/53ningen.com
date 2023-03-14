import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material'
import { useState } from 'react'

interface AddCategoryDialogProps {
  open: boolean
  handleClose: (category?: string) => void
}

export const AddCategoryDialog = ({ open, handleClose }: AddCategoryDialogProps) => {
  const [category, setCategory] = useState('')
  return (
    <Dialog open={open} onClose={() => handleClose()}>
      <form
        onSubmit={async (e) => {
          e.preventDefault()
          handleClose(category)
        }}>
        <DialogTitle>Add Category</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            id="id"
            label="Category"
            value={category}
            type="text"
            fullWidth
            margin="dense"
            onChange={(e) => setCategory(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" color="primary" onClick={() => handleClose()}>
            CANCEL
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="info"
            onClick={() => handleClose(category)}>
            ADD
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
