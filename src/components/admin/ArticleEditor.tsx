'use client'

import { upsertArticle } from '@/actions/articles'
import { useDictionary } from '@/i18n/hook'
import { ISO8601toJPDateTimeStr } from '@/lib/datetime'
import { Article, Category } from '@prisma/client'
import { useActionState } from 'react'
import Banner from '../common/Banner'
import Breadcrumbs from '../common/Breadcrumbs'
import CreatedAtChip from '../common/chip/CreatedAtChip'
import UpdatedAtChip from '../common/chip/UpdatedAtChip'
import Button from '../form/Button'
import Checkbox from '../form/Checkbox'
import CheckboxLabel from '../form/CheckboxLabel'
import Label from '../form/Label'
import Select from '../form/Select'
import TextArea from '../form/TextArea'
import TextField from '../form/TextField'

type Props = {
  slug: string
  article: Article | null
  categories: Category[]
}

const ArticleEditor = ({ slug, article, categories }: Props) => {
  const [state, formAction, pending] = useActionState(upsertArticle, {
    slug,
    title: article?.title || '',
    description: article?.description || '',
    thumbnailUrl: article?.thumbnailUrl || '',
    body: article?.body || '',
    isPinned: article?.isPinned || false,
    status: article?.status || 'PUBLISHED',
    createdAt: article ? new Date(article.createdAt) : null,
    updatedAt: article ? new Date(article.updatedAt) : null,
    categoryId: article?.categoryId || 1,
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
            name: article ? `${article.title}` : t.create,
            href: `/${slug}`,
          },
          {
            name: t.edit,
            href: `/admin/articles/${slug}`,
          },
        ]}
      />
      <div className="flex gap-1">
        {state.createdAt && <CreatedAtChip createdAt={ISO8601toJPDateTimeStr(state.createdAt)} />}
        {state.updatedAt && <UpdatedAtChip updatedAt={ISO8601toJPDateTimeStr(state.updatedAt)} />}
      </div>
      {state.error && <Banner type="error" message={state.error} />}
      <CheckboxLabel htmlFor="isPinned">
        <Checkbox id="isPinned" name="isPinned" defaultChecked={state.isPinned} disabled={pending} />
        Pinned Article
      </CheckboxLabel>
      <Label>
        Title
        <TextField id="title" name="title" defaultValue={state.title} placeholder="Title" disabled={pending} />
      </Label>
      <Label>
        Description
        <TextField id="description" name="description" defaultValue={state.description || undefined} placeholder="Description" disabled={pending} />
      </Label>
      <Label>
        <TextField
          id="thumbnailUrl"
          name="thumbnailUrl"
          type="hidden"
          defaultValue={state.thumbnailUrl || undefined}
          placeholder="Thumbnail URL"
          disabled={pending}
        />
      </Label>
      <div className="flex gap-4">
        <Label>
          Category
          <Select id="categoryId" name="categoryId" key={state.categoryId} defaultValue={state.categoryId} disabled={pending}>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.displayName}
              </option>
            ))}
          </Select>
        </Label>
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

export default ArticleEditor
