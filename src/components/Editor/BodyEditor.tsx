import { TextField } from '@mui/material'
import { SyntheticEvent } from 'react'
import { ArticleBody } from '../Article/ArticleBody'

type Props = {
  body: string
  preview: boolean
  disabled: boolean
  onChangeBody: (body: string) => void
  onSelectBody?: (e: SyntheticEvent<HTMLDivElement>) => void
}

export const BodyEditor = ({
  body,
  preview,
  disabled,
  onChangeBody,
  onSelectBody,
}: Props) => {
  return (
    <>
      {preview ? (
        <ArticleBody body={body} />
      ) : (
        <TextField
          id="body"
          multiline
          fullWidth
          minRows={15}
          maxRows={30}
          sx={{ background: 'white' }}
          value={body}
          disabled={disabled}
          onChange={(e) => onChangeBody(e.target.value)}
          onSelect={onSelectBody}
        />
      )}
    </>
  )
}
