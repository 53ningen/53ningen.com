'use client'

import { revalidateByPath } from '@/actions/cache'
import Banner from '@/components/common/Banner'
import Button from '@/components/form/Button'
import Label from '@/components/form/Label'
import TextField from '@/components/form/TextField'
import { useActionState } from 'react'

const PathRevalidator = () => {
  const [state, dispath, pending] = useActionState(revalidateByPath, {})
  return (
    <form id="pathform" className="flex flex-col gap-1" action={dispath}>
      <Label>
        path
        <TextField name="path" />
      </Label>
      {state.message && <Banner type="info" message={state.message} />}
      {state.error && <Banner type="error" message={state.error} />}
      <Button type="submit" disabled={pending}>
        revalidate path
      </Button>
    </form>
  )
}

export default PathRevalidator
