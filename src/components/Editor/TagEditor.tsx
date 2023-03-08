import { ArticleTags, DeleteArticleTagsMutationVariables } from '@/API'
import { deleteArticleTags } from '@/graphql/mutations'
import { Box, Button } from '@mui/material'
import { API } from 'aws-amplify'
import { useEffect, useState } from 'react'
import { TagChip } from '../Chip/TagChip'
import { AddTagDialog } from './AddTagDialog'

type Props = {
  tags: ArticleTags[]
  slug: string
  disabled: boolean
}

export const TagEditor = ({ tags: given, slug, disabled }: Props) => {
  const [tags, setTags] = useState(given)
  const [dialogOpen, setDialogOpen] = useState(false)
  useEffect(() => {
    setTags(given)
  }, [given])
  const deleteTag = async (tag: ArticleTags) => {
    try {
      await API.graphql({
        query: deleteArticleTags,
        variables: {
          input: {
            id: tag.id,
          },
        } as DeleteArticleTagsMutationVariables,
        authMode: 'AMAZON_COGNITO_USER_POOLS',
      })
      setTags(tags.filter((t) => t.tagID !== tag.tagID))
    } catch (e) {
      console.error(e)
      window?.alert(JSON.stringify(e))
    }
  }
  return (
    <Box lineHeight={2.5}>
      {tags.map((tag) => {
        return (
          <TagChip
            key={tag.tagID}
            tag={tag.tagID}
            onDelete={() => deleteTag(tag)}
            editable={!disabled}
          />
        )
      })}
      <Button
        variant="outlined"
        size="small"
        disableElevation
        onClick={() => setDialogOpen(true)}
        disabled={disabled}>
        Add Tag
      </Button>
      <AddTagDialog
        open={dialogOpen}
        slug={slug}
        handleClose={() => setDialogOpen(false)}
        onAdded={(tag) => {
          setTags([...tags, tag])
        }}
      />
    </Box>
  )
}
