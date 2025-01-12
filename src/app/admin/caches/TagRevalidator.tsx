'use client'

import { revalidateByTag } from '@/actions/cache'
import Banner from '@/components/common/Banner'
import Button from '@/components/form/Button'
import Label from '@/components/form/Label'
import TextField from '@/components/form/TextField'
import { useActionState } from 'react'

const TagRevalidator = () => {
  const [state, dispath, pending] = useActionState(revalidateByTag, {})
  return (
    <form id="tagform" className="flex flex-col gap-1" action={dispath}>
      <Label>
        tag
        <TextField name="tag" />
      </Label>
      {state.message && <Banner type="info" message={state.message} />}
      {state.error && <Banner type="error" message={state.error} />}
      <Button type="submit" disabled={pending}>
        revalidate tag
      </Button>
    </form>
  )
}

export default TagRevalidator
