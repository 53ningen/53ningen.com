'use client'

import { useUser } from '@auth0/nextjs-auth0/client'
import Link from 'next/link'
import { BiEdit } from 'react-icons/bi'

type Props = {
  path: string
}

const EditButton = ({ path }: Props) => {
  const { isLoading, user } = useUser()
  return !isLoading && user ? (
    <Link href={path} prefetch={false} className="text-xl">
      <BiEdit />
    </Link>
  ) : (
    <></>
  )
}

export default EditButton
