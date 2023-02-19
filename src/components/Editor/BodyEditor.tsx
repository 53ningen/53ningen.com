import { TextField } from '@mui/material'
import { ArticleBody } from '../Article/ArticleBody'

type Props = {
  body: string
  preview: boolean
  onChangeBody: (body: string) => void
}

export const BodyEditor = ({ body, preview, onChangeBody }: Props) => {
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
          onChange={(e) => onChangeBody(e.target.value)}
        />
      )}
    </>
  )
}
