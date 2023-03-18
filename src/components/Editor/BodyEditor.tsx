import { TextField } from '@mui/material'
import { SyntheticEvent, useEffect, useRef, useState } from 'react'
import { ArticleBody } from '../Article/ArticleBody'

type Props = {
  body: string
  preview: boolean
  disabled: boolean
  defaultPosition?: number
  onChangeBody: (body: string) => void
  onSelectBody?: (e: SyntheticEvent<HTMLDivElement>) => void
}

export const BodyEditor = ({
  body,
  preview,
  disabled,
  defaultPosition,
  onChangeBody,
  onSelectBody,
}: Props) => {
  const [initialized, setInitialized] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (!initialized && defaultPosition && body && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.setSelectionRange(defaultPosition, defaultPosition)
      setInitialized(true)
    }
  }, [body, defaultPosition, initialized])
  return (
    <>
      {preview ? (
        <ArticleBody body={body} />
      ) : (
        <>
          <TextField
            id="body"
            inputRef={inputRef}
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
        </>
      )}
    </>
  )
}
