import {
  Article,
  ArticleTags,
  CreateArticleMutationVariables,
  DeleteArticleMutationVariables,
  UpdateArticleMutationVariables,
} from '@/API'
import { Const } from '@/const'
import { useAuth } from '@/context/AuthContext'
import {
  createArticle,
  deleteArticle as delArticle,
  updateArticle,
} from '@/graphql/mutations'
import theme from '@/theme'
import { Box, Button, Stack, Typography } from '@mui/material'
import { API, Storage } from 'aws-amplify'
import { useRouter } from 'next/router'
import { SyntheticEvent, useCallback, useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { v4 as uuidv4 } from 'uuid'
import { ErrorBanner } from '../ErrorBanner'
import { ArticleMetadataEditor } from './ArticleMetadataEditor'
import { BodyEditor } from './BodyEditor'
import { TagEditor } from './TagEditor'

type Props = {
  slug?: string
  readyToEdit: boolean
  article?: Article
  preview: boolean
  categories?: string[]
}

const Errors = {
  Unauthenticated: 'Unauthenticated: You must sign in first.',
}

export const ArticleEditor = ({
  slug,
  readyToEdit,
  article,
  preview,
  categories,
}: Props) => {
  const router = useRouter()
  const { isLoggedIn, initialized } = useAuth()
  const [errors, setErrors] = useState<string[]>([])
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [bodyPos, setBodyPos] = useState(0)
  const [pinned, setPinned] = useState(false)
  const [category, setCategory] = useState<string>()
  const [description, setDescription] = useState<string>('')
  const [disabled, setDisabled] = useState(true)
  const [startPosition, setStartPosition] = useState<number>()
  const [isNewPage, setIsNewPage] = useState(true)
  const [draft, setDraft] = useState(false)
  useEffect(() => {
    if (readyToEdit) {
      if (article) {
        setTitle(article.title)
        setBody(article.body)
        setDescription(article.description || '')
        setCategory(article.category.id)
        setPinned(article.pinned)
        setDraft(article.draft || false)
        setIsNewPage(false)
        try {
          const h = extractHash(router.asPath)
          if (h) {
            const n = parseInt(h)
            setStartPosition(n)
          }
        } catch (e) {
          setErrors((es) => [...es, JSON.stringify(e)])
        }
      } else {
        setCategory(Const.defaultCategory)
      }
      setDisabled(false)
    }
  }, [article, readyToEdit, router.asPath])
  useEffect(() => {
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
  }, [initialized, isLoggedIn])
  const onDrop = useCallback(
    async (f: File[]) => {
      try {
        const key = await uploadFile(f)
        const newBody =
          body.slice(0, bodyPos) + `![](${key})\n` + body.slice(bodyPos, body.length)
        setBody(newBody)
      } catch (e) {
        console.error(e)
        setErrors((es) => [...es, JSON.stringify(e)])
      } finally {
      }
    },
    [bodyPos, body]
  )
  const { getRootProps, getInputProps } = useDropzone({ onDrop })
  const onClickSave = async () => {
    try {
      setDisabled(true)
      await saveArticle(
        isNewPage,
        slug!,
        title,
        body,
        description,
        pinned,
        draft,
        category!
      )
      setIsNewPage(false)
    } catch (e) {
      console.error(e)
      setErrors([JSON.stringify(e), ...errors])
    } finally {
      setDisabled(false)
    }
  }
  const onClickDelete = async () => {
    const isOk = window.confirm(`Are you sure you want to delete this article?`)
    if (isOk) {
      try {
        setDisabled(true)
        await deleteArticle(slug!)
        router.push('/')
      } catch (e) {
        console.error(e)
        setErrors([JSON.stringify(e), ...errors])
      } finally {
        setDisabled(false)
      }
    }
  }
  const onSelectBody = (e: SyntheticEvent<HTMLDivElement>) => {
    const elem = e.target as any
    setBodyPos(elem.selectionStart)
  }
  return (
    <Stack spacing={2}>
      <ArticleMetadataEditor
        title={title}
        category={category}
        categories={categories || []}
        description={description}
        pinned={pinned}
        draft={draft}
        disabled={disabled}
        onChangeTitle={(t) => setTitle(t)}
        onChangeCategory={(c) => setCategory(c)}
        onChangePinned={(p) => setPinned(p)}
        onChangeDraft={(d) => setDraft(d)}
        onChangeDescription={(d) => setDescription(d)}
      />
      {slug && !isNewPage && article && (
        <TagEditor
          tags={(article.tags?.items || []) as ArticleTags[]}
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
        defaultPosition={startPosition}
        preview={preview}
        disabled={disabled}
        onChangeBody={(newBody) => setBody(newBody)}
        onSelectBody={onSelectBody}
      />
      <Box
        width="100%"
        {...getRootProps()}
        border={1}
        borderRadius={2}
        borderColor="gray"
        bgcolor="lightgray"
        textAlign="center">
        <input {...getInputProps()} />
        <Typography p={4} variant="h1">
          Drop the files here
        </Typography>
      </Box>
      <Box pt={2} display="flex" justifyContent="right">
        {!isNewPage && (
          <Button
            disabled={disabled}
            variant="contained"
            color="error"
            sx={{ mr: theme.spacing(2) }}
            onClick={onClickDelete}>
            Delete
          </Button>
        )}
        <Button
          disabled={disabled}
          variant="contained"
          color="secondary"
          onClick={onClickSave}>
          Save
        </Button>
      </Box>
    </Stack>
  )
}

const saveArticle = async (
  isNew: boolean,
  slug: string,
  title: string,
  body: string,
  description: string,
  pinned: boolean,
  draft: boolean,
  category: string
) => {
  if (isNew) {
    await API.graphql({
      query: createArticle,
      variables: {
        input: {
          slug,
          title,
          body,
          description,
          pinned,
          draft,
          type: 'Article',
          categoryArticlesId: category,
        },
      } as CreateArticleMutationVariables,
      authMode: 'AMAZON_COGNITO_USER_POOLS',
    })
  } else {
    await API.graphql({
      query: updateArticle,
      variables: {
        input: {
          slug,
          title,
          body,
          description,
          pinned,
          draft,
          categoryArticlesId: category,
        },
      } as UpdateArticleMutationVariables,
      authMode: 'AMAZON_COGNITO_USER_POOLS',
    })
  }
}

const deleteArticle = async (slug: string) => {
  await API.graphql({
    query: delArticle,
    variables: {
      input: {
        slug,
      },
    } as DeleteArticleMutationVariables,
    authMode: 'AMAZON_COGNITO_USER_POOLS',
  })
}

const uploadFile = async (f: File[]) => {
  const file = f[0]
  const fileId = `${uuidv4()}`
  const res = await Storage.put(fileId, file, {
    level: 'public',
    contentType: file.type,
  })
  return res.key
}

const extractHash = (path?: string) => {
  const es = path?.split('#')
  return es && es.length === 2 ? es[1] : undefined
}
