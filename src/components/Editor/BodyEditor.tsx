import { TextField } from '@mui/material'
import { ArticleBody } from '../Article/ArticleBody'

type Props = {
  body: string
  preview: boolean
  disabled: boolean
  onChangeBody: (body: string) => void
}

export const BodyEditor = ({ body, preview, disabled, onChangeBody }: Props) => {
  return (
    <>
      {preview ? (
        <ArticleBody body={body} />
      ) : (
        <TextField
          id="body"
          multiline
          fullWidth
          minRows={20}
          sx={{ background: 'white' }}
          value={body}
          disabled={disabled}
          onChange={(e) => onChangeBody(e.target.value)}
        />
      )}
    </>
  )
}
