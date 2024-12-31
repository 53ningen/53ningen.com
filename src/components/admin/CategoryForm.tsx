'use client'

import { addCategory } from '@/actions/categories'
import { Category } from '@prisma/client'
import { useActionState } from 'react'
import Banner from '../common/Banner'
import Button from '../form/Button'
import Label from '../form/Label'
import TextField from '../form/TextField'
import DataTable from './DataTable'

type Props = {
  categories: Category[]
}

const CategoryForm = ({ categories }: Props) => {
  const [state, dispatch, pending] = useActionState(addCategory, { categories })
  const keys = [
    { key: 'id', editable: false },
    { key: 'displayName', editable: false },
    { key: 'createdAt', editable: false },
  ]
  return (
    <div className="flex flex-col gap-4">
      <form id="category_editor" className="flex flex-col gap-2">
        <Banner message="Once a category is added, it cannot be deleted." type="warn" />
        {state.error && <Banner type="error" message={state.error} onClose={() => dispatch({ action: 'ackError' })} />}
        <Label>
          displayname of category to add
          <TextField name="displayName" placeholder="DisplayName" />
        </Label>
        <Button type="submit" disabled={pending} formAction={(formData) => dispatch({ formData, action: 'add' })}>
          Add
        </Button>
      </form>
      <div>
        <Label>
          existing categories
          <DataTable data={state.categories} keys={keys} />
        </Label>
      </div>
    </div>
  )
}

export default CategoryForm
