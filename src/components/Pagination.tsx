import { Box, Pagination as MuiPagination } from '@mui/material'
import { useRouter } from 'next/router'

interface Props {
  totalPages: number
  currentPage: number
  basePath: string
}

export const Pagination = ({ totalPages, currentPage, basePath }: Props) => {
  const router = useRouter()
  return (
    <Box display="flex" justifyContent="center" pt={4}>
      <MuiPagination
        count={totalPages}
        page={currentPage}
        onChange={(_, page) => {
          router.push(`${basePath}/${page}`)
        }}
        color="primary"
      />
    </Box>
  )
}
