'use client'

import { upsertDocument } from '@/actions/documents'
import { useDictionary } from '@/i18n/hook'
import { ISO8601toJPDateTimeStr } from '@/lib/datetime'
import { Document } from '@prisma/client'
import { useActionState } from 'react'
import Banner from '../common/Banner'
import Breadcrumbs from '../common/Breadcrumbs'
import CreatedAtChip from '../common/chip/CreatedAtChip'
import UpdatedAtChip from '../common/chip/UpdatedAtChip'
import Button from '../form/Button'
import Label from '../form/Label'
import Select from '../form/Select'
import TextArea from '../form/TextArea'
import TextField from '../form/TextField'

type Props = {
  slug: string
  document: Document | null
}

const DocumentEditor = ({ slug, document }: Props) => {
  const [state, formAction, pending] = useActionState(upsertDocument, {
    slug,
    title: document?.title || '',
    kana: document?.kana || '',
    body: document?.body || '',
    status: document?.status || 'PUBLISHED',
    createdAt: document ? new Date(document.createdAt) : null,
    updatedAt: document ? new Date(document.updatedAt) : null,
  })
  const { admin: t } = useDictionary()
  return (
    <form action={formAction} className="flex flex-col gap-2 text-sm">
      <Breadcrumbs
        items={[
          {
            name: t.admin,
            href: '/admin',
          },
          {
            name: document ? `${document.title}` : slug,
            href: `/docs/${slug}`,
          },
          {
            name: t.edit,
            href: `/admin/docs/${slug}`,
          },
        ]}
      />
      <div className="flex gap-1">
        {state.createdAt && <CreatedAtChip createdAt={ISO8601toJPDateTimeStr(state.createdAt)} />}
        {state.updatedAt && <UpdatedAtChip updatedAt={ISO8601toJPDateTimeStr(state.updatedAt)} />}
      </div>
      {state.error && <Banner type="error" message={state.error} />}
      <Label>
        Title
        <TextField id="title" name="title" defaultValue={state.title} placeholder="Title" disabled={pending} />
      </Label>
      <Label>
        Kana
        <TextField id="kana" name="kana" defaultValue={state.kana || undefined} placeholder="Description" disabled={pending} />
      </Label>
      <div className="flex gap-4">
        <Label>
          Status
          <Select id="status" name="status" key={state.status} defaultValue={state.status} disabled={pending}>
            {['ARCHIVED', 'DRAFT', 'PUBLISHED', 'PRIVATE'].map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>
        </Label>
      </div>
      <Label>
        Body
        <TextArea id="body" name="body" placeholder="Body" defaultValue={state.body} disabled={pending} className="h-[55vh]" />
      </Label>
      <Button disabled={pending} className="">
        {t.update}
      </Button>
    </form>
  )
}

export default DocumentEditor
