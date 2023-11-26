import {
  CreateDocumentMutationVariables,
  DeleteDocumentMutationVariables,
  Document,
  UpdateDocumentMutationVariables,
} from '@/API'
import { useAuth } from '@/context/AuthContext'
import { createDocument, deleteDocument, updateDocument } from '@/graphql/mutations'
import theme from '@/theme'
import { Box, Button, Stack, Typography } from '@mui/material'
import { API, Storage } from 'aws-amplify'
import { useRouter } from 'next/router'
import { SyntheticEvent, useCallback, useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { v4 as uuidv4 } from 'uuid'
import { ErrorBanner } from '../ErrorBanner'
import { BodyEditor } from './BodyEditor'
import { DocsMetadataEditor } from './DocsMetadataEditor'

type Props = {
  slug?: string
  readyToEdit: boolean
  document?: Document
  preview: boolean
}

const Errors = {
  Unauthenticated: 'Unauthenticated: You must sign in first.',
}

export const DocsEditor = ({ slug, readyToEdit, document: document, preview }: Props) => {
  const router = useRouter()
  const { isLoggedIn, initialized } = useAuth()
  const [errors, setErrors] = useState<string[]>([])
  const [title, setTitle] = useState(document?.title || '')
  const [kana, setKana] = useState(document?.kana || '')
  const [body, setBody] = useState(document?.body || '')
  const [bodyPos, setBodyPos] = useState(0)
  const [startPosition, setStartPosition] = useState<number>()
  const [disabled, setDisabled] = useState(true)
  const [isNewPage, setIsNewPage] = useState(document === undefined)
  useEffect(() => {
    if (readyToEdit) {
      if (document) {
        setTitle(document.title)
        setBody(document.body)
        setKana(document.kana)
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
      }
      setDisabled(false)
    }
  }, [document, readyToEdit, router.asPath])
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
  const onClickSave = async () => {
    try {
      setDisabled(true)
      await saveDoc(isNewPage, slug!, kana, title, body)
      setIsNewPage(false)
    } catch (e) {
      console.error(e)
      setErrors([JSON.stringify(e), ...errors])
    } finally {
      setDisabled(false)
    }
  }
  const onClickDelete = async () => {
    const isOk = window.confirm(`Are you sure you want to delete this document?`)
    if (isOk) {
      try {
        setDisabled(true)
        await deleteDoc(slug!)
      } catch (e) {
        console.error(e)
        setErrors([JSON.stringify(e), ...errors])
      } finally {
        setDisabled(false)
      }
      router.push('/')
    }
  }
  const onSelectBody = (e: SyntheticEvent<HTMLDivElement>) => {
    const elem = e.target as any
    setBodyPos(elem.selectionStart)
  }
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
  return (
    <Stack spacing={2}>
      <DocsMetadataEditor
        title={title}
        kana={kana}
        disabled={disabled}
        onChangeTitle={(t) => setTitle(t)}
        onChangeKana={(k) => setKana(k)}
      />
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
        defaultPosition={startPosition}
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
        {document && (
          <Button
            disabled={disabled}
            variant="contained"
            color="error"
            sx={{ mr: theme.spacing(2) }}
            onClick={onClickDelete}>
            削除
          </Button>
        )}
        <Button
          disabled={disabled}
          variant="contained"
          color="secondary"
          onClick={onClickSave}>
          保存
        </Button>
      </Box>
    </Stack>
  )
}

const saveDoc = async (
  isNew: boolean,
  slug: string,
  kana: string,
  title: string,
  body: string
) => {
  if (isNew) {
    await API.graphql({
      query: createDocument,
      variables: {
        input: {
          slug,
          title,
          kana,
          body,
          type: 'Document',
        },
      } as CreateDocumentMutationVariables,
      authMode: 'AWS_IAM',
    })
  } else {
    await API.graphql({
      query: updateDocument,
      variables: {
        input: {
          slug,
          kana,
          title,
          body,
        },
      } as UpdateDocumentMutationVariables,
      authMode: 'AWS_IAM',
    })
  }
}

const deleteDoc = async (slug: string) => {
  await API.graphql({
    query: deleteDocument,
    variables: {
      input: {
        slug,
      },
    } as DeleteDocumentMutationVariables,
    authMode: 'AWS_IAM',
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
