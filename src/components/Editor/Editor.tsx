import {
  Article,
  ArticleTags,
  CreateArticleMutationVariables,
  DeleteArticleMutationVariables,
  UpdateArticleMutationVariables,
} from '@/API'
import { useAuth } from '@/context/AuthContext'
import {
  createArticle,
  deleteArticle as delArticle,
  updateArticle,
} from '@/graphql/mutations'
import theme from '@/theme'
import { Box, Button, Stack } from '@mui/material'
import { API } from 'aws-amplify'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { ErrorBanner } from '../ErrorBanner'
import { BodyEditor } from './BodyEditor'
import { MetadataEditor } from './MetadataEditor'
import { TagEditor } from './TagEditor'

type Props = {
  slug?: string
  article?: Article
  preview: boolean
  categories?: string[]
}

const Errors = {
  Unauthenticated: 'Unauthenticated: You must sign in first.',
}

export const Editor = ({ slug, article, preview, categories }: Props) => {
  const router = useRouter()
  const { isLoggedIn, initialized } = useAuth()
  const [errors, setErrors] = useState<string[]>([])
  const [title, setTitle] = useState(article?.title || '')
  const [body, setBody] = useState(article?.body || '')
  const [pinned, setPinned] = useState(article?.pinned || false)
  const [category, setCategory] = useState(article?.category.id)
  const [disabled, setDisabled] = useState(true)
  const [isNewPage, setIsNewPage] = useState(article === undefined)
  useEffect(() => {
    if (article) {
      setTitle(article.title)
      setBody(article.body)
      setCategory(article.category.id)
      setPinned(article.pinned)
      setIsNewPage(false)
    } else if (categories) {
      setCategory('programming')
    }
  }, [article, categories])
  useEffect(() => {
    if (router.isFallback) {
      setDisabled(true)
    } else {
      if (initialized && !isLoggedIn()) {
        setDisabled(true)
        setErrors((errors) =>
          errors.includes(Errors.Unauthenticated)
            ? errors
            : [Errors.Unauthenticated, ...errors]
        )
      } else {
        setDisabled(false)
        setErrors((errors) => errors.filter((e) => e !== Errors.Unauthenticated))
      }
    }
  }, [initialized, isLoggedIn, router])
  const saveArticle = async () => {
    try {
      setDisabled(true)
      if (article) {
        await API.graphql({
          query: updateArticle,
          variables: {
            input: {
              slug: article?.slug,
              title,
              body,
              pinned,
              categoryArticlesId: category,
            },
          } as UpdateArticleMutationVariables,
          authMode: 'AMAZON_COGNITO_USER_POOLS',
        })
      } else {
        await API.graphql({
          query: createArticle,
          variables: {
            input: {
              slug,
              title,
              body,
              pinned,
              type: 'Article',
              categoryArticlesId: category,
            },
          } as CreateArticleMutationVariables,
          authMode: 'AMAZON_COGNITO_USER_POOLS',
        })
      }
    } catch (e) {
      console.error(e)
      setErrors([JSON.stringify(e), ...errors])
    } finally {
      setDisabled(false)
    }
  }
  const confirmDelete = async () => {
    const isOk = window.confirm(`Are you sure you want to delete this article?`)
    if (isOk) {
      await deleteArticle()
      router.push('/')
    }
  }
  const deleteArticle = async () => {
    try {
      setDisabled(true)
      await API.graphql({
        query: delArticle,
        variables: {
          input: {
            slug: article?.slug,
          },
        } as DeleteArticleMutationVariables,
        authMode: 'AMAZON_COGNITO_USER_POOLS',
      })
    } catch (e) {
      console.error(e)
      setErrors([JSON.stringify(e), ...errors])
    } finally {
      setDisabled(false)
    }
  }
  return (
    <Stack spacing={2}>
      <MetadataEditor
        title={title}
        category={category}
        categories={categories || []}
        pinned={pinned}
        disabled={disabled}
        onChangeTitle={(t) => setTitle(t)}
        onChangeCategory={(c) => setCategory(c)}
        onChangePinned={(p) => setPinned(p)}
      />
      {slug && !isNewPage && (
        <TagEditor
          tags={(article?.tags?.items || []) as ArticleTags[]}
          slug={slug}
          disabled={disabled}
        />
      )}
      {errors.length > 0 && (
        <Stack spacing={1}>
          {errors.map((e) => (
            <ErrorBanner key={e} errorMessage={e} />
          ))}
        </Stack>
      )}
      <BodyEditor
        body={body}
        preview={preview}
        disabled={disabled}
        onChangeBody={(newBody) => setBody(newBody)}
      />
      <Box pt={2} display="flex" justifyContent="right">
        {article && (
          <Button
            disabled={disabled}
            variant="contained"
            color="error"
            sx={{ mr: theme.spacing(2) }}
            onClick={confirmDelete}>
            削除
          </Button>
        )}
        <Button
          disabled={disabled}
          variant="contained"
          color="secondary"
          onClick={saveArticle}>
          保存
        </Button>
      </Box>
    </Stack>
  )
}
