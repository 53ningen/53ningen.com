import { Card, Stack } from '@mui/material'
import { ReactNode } from 'react'

type Props = {
  children: ReactNode
}

export const Widget = ({ children }: Props) => {
  return (
    <Card>
      <Stack spacing={3} p={{ xs: 2, sm: 2, md: 2, lg: 4 }}>
        {children}
      </Stack>
    </Card>
  )
}
