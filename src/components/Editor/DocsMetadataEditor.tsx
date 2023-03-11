import { Stack, TextField } from '@mui/material'

type Props = {
  title?: string
  kana?: string
  disabled: boolean
  onChangeTitle: (title: string) => void
  onChangeKana: (kana: string) => void
}

export const DocsMetadataEditor = ({
  title,
  kana,
  disabled,
  onChangeTitle,
  onChangeKana,
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
      <TextField
        fullWidth
        id="kana"
        label="Kana"
        variant="outlined"
        sx={{ background: 'white' }}
        value={kana}
        disabled={disabled}
        onChange={(e) => onChangeKana(e.target.value)}
      />
    </Stack>
  )
}
