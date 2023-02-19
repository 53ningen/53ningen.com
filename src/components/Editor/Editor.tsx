import { Box, Button, Stack } from '@mui/material'
import { useState } from 'react'
import { Article } from '../Article/Article'
import { BodyEditor } from './BodyEditor'
import { MetadataEditor } from './MetadataEditor'

type Props = {
  article?: Article
  preview: boolean
}

export const Editor = ({ article, preview }: Props) => {
  const [title, setTitle] = useState(article?.title || '')
  const [body, setBody] = useState(article?.body || '')
  const [category, setCategory] = useState(article?.category)
  const [tags, setTags] = useState(article?.tags || [])
  return (
    <Stack>
      <MetadataEditor
        title={title}
        onChangeTitle={(t) => setTitle(t)}
        category={category}
        onChangeCategory={(c) => setCategory(c)}
        tags={tags}
        onChangeTags={(ts) => setTags(ts)}
      />
      <BodyEditor
        body={body}
        preview={preview}
        onChangeBody={(newBody) => setBody(newBody)}
      />
      <Box pt={2} display="flex" justifyContent="right">
        <Button variant="contained" color="secondary">
          保存
        </Button>
      </Box>
    </Stack>
  )
}
