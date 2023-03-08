import {
  ArticleTags,
  CreateArticleTagsMutation,
  CreateArticleTagsMutationVariables,
  GetTagQuery,
  GetTagQueryVariables,
} from '@/API'
import { createArticleTags, createTag } from '@/graphql/mutations'
import { getTag } from '@/graphql/queries'
import { GraphQLResult } from '@aws-amplify/api-graphql'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material'
import { API } from 'aws-amplify'
import { useState } from 'react'
import { ErrorBanner } from './../ErrorBanner'

interface AddTagDialogProps {
  open: boolean
  slug: string
  handleClose: () => void
  onAdded: (tag: ArticleTags) => void
}

export const AddTagDialog = ({ open, slug, handleClose, onAdded }: AddTagDialogProps) => {
  const [tag, setTag] = useState('')
  const [isBusy, setIsBusy] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>()
  const addTag = async () => {
    setIsBusy(true)
    try {
      if (tag.length === 0) {
        throw Error('invalid tag')
      }
      const exists = await checkIfTagExisits(tag)
      if (!exists) {
        await createNewTag(tag)
      }
      const articleTag = await createNewArticleTag(slug, tag)
      onAdded(articleTag)
      setTag('')
    } catch (e) {
      console.error(e)
      if (e instanceof Error) {
        setErrorMessage(e.message)
      }
    }
    setIsBusy(false)
  }

  return (
    <Dialog open={open} onClose={handleClose}>
      <form
        onSubmit={async (e) => {
          e.preventDefault()
          await addTag()
        }}>
        <DialogTitle>Add Tag</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            id="id"
            label="Tag"
            value={tag}
            type="text"
            disabled={isBusy}
            fullWidth
            margin="dense"
            onChange={(e) => setTag(e.target.value)}
          />
          <ErrorBanner errorMessage={errorMessage} />
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" color="primary" onClick={handleClose}>
            CANCEL
          </Button>
          <Button
            type="submit"
            disabled={isBusy}
            variant="contained"
            color="info"
            onClick={addTag}>
            ADD
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

const checkIfTagExisits = async (tagId: string): Promise<boolean> => {
  const res = (await API.graphql({
    query: getTag,
    variables: {
      id: tagId,
    } as GetTagQueryVariables,
    authMode: 'AMAZON_COGNITO_USER_POOLS',
  })) as GraphQLResult<GetTagQuery>
  return res.data?.getTag !== null
}

const createNewTag = async (tagId: string) => {
  const res = (await API.graphql({
    query: createTag,
    variables: {
      input: {
        id: tagId,
      },
    } as CreateArticleTagsMutation,
    authMode: 'AMAZON_COGNITO_USER_POOLS',
  })) as GraphQLResult<CreateArticleTagsMutation>
  return true
}

const createNewArticleTag = async (slug: string, tagId: string) => {
  const res = (await API.graphql({
    query: createArticleTags,
    variables: {
      input: {
        articleID: slug,
        tagID: tagId,
      },
    } as CreateArticleTagsMutationVariables,
    authMode: 'AMAZON_COGNITO_USER_POOLS',
  })) as GraphQLResult<CreateArticleTagsMutation>
  return res.data!.createArticleTags as ArticleTags
}
