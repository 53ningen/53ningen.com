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
  document?: Document
  preview: boolean
}

const Errors = {
  Unauthenticated: 'Unauthenticated: You must sign in first.',
}

export const DocsEditor = ({ slug, document: document, preview }: Props) => {
  const router = useRouter()
  const { isLoggedIn, initialized } = useAuth()
  const [errors, setErrors] = useState<string[]>([])
  const [title, setTitle] = useState(document?.title || '')
  const [kana, setKana] = useState(document?.kana || '')
  const [body, setBody] = useState(document?.body || '')
  const [bodyPos, setBodyPos] = useState(0)
  const [disabled, setDisabled] = useState(true)
  const [isNewPage, setIsNewPage] = useState(document === undefined)
  const onDrop = useCallback(
    async (f: File[]) => {
      try {
        const file = f[0]
        const now = new Date()
        const fileId = `${uuidv4()}`
        const res = await Storage.put(fileId, file, {
          level: 'public',
          contentType: file.type,
        })
        const newBody =
          body.slice(0, bodyPos) + `![](${res.key})\n` + body.slice(bodyPos, body.length)
        setBody(newBody)
      } catch (e) {
        // TODO: エラー処理
        console.log(e)
      } finally {
      }
    },
    [bodyPos, body]
  )
  const { getRootProps, getInputProps } = useDropzone({ onDrop })
  useEffect(() => {
    if (document) {
      setTitle(document.title)
      setBody(document.body)
      setKana(document.kana)
      setIsNewPage(false)
    }
  }, [document])
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
  const saveDocs = async () => {
    try {
      setDisabled(true)
      if (document) {
        await API.graphql({
          query: updateDocument,
          variables: {
            input: {
              slug: document?.slug,
              kana,
              title,
              body,
            },
          } as UpdateDocumentMutationVariables,
          authMode: 'AWS_IAM',
        })
      } else {
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
      }
    } catch (e) {
      console.error(e)
      setErrors([JSON.stringify(e), ...errors])
    } finally {
      setDisabled(false)
    }
  }
  const confirmDelete = async () => {
    const isOk = window.confirm(`Are you sure you want to delete this document?`)
    if (isOk) {
      await deleteDocs()
      router.push('/')
    }
  }
  const deleteDocs = async () => {
    try {
      setDisabled(true)
      await API.graphql({
        query: deleteDocument,
        variables: {
          input: {
            slug: document?.slug,
          },
        } as DeleteDocumentMutationVariables,
        authMode: 'AWS_IAM',
      })
    } catch (e) {
      console.error(e)
      setErrors([JSON.stringify(e), ...errors])
    } finally {
      setDisabled(false)
    }
  }
  const onSelectBody = (e: SyntheticEvent<HTMLDivElement>) => {
    const elem = e.target as any
    setBodyPos(elem.selectionStart)
  }
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
            onClick={confirmDelete}>
            削除
          </Button>
        )}
        <Button
          disabled={disabled}
          variant="contained"
          color="secondary"
          onClick={saveDocs}>
          保存
        </Button>
      </Box>
    </Stack>
  )
}
