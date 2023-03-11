import { useAuth } from '@/context/AuthContext'
import { Box, Paper, Typography } from '@mui/material'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

const Custom404 = () => {
  const router = useRouter()
  const { initialized, isLoggedIn } = useAuth()
  useEffect(() => {
    if (!initialized || !isLoggedIn()) {
      return
    }
    const paths = router.asPath.split('/')
    if (paths.length === 2) {
      router.replace(`/${paths[1]}/edit`)
    }
    if (paths.length === 3 && paths[1] === 'docs') {
      router.replace(`/docs/${paths[2]}/edit`)
    }
  }, [initialized, isLoggedIn, router, router.pathname])
  return (
    <>
      <Paper>
        <Box textAlign="center" pt={48} pb={48}>
          <Typography variant="h2">
            <strong>404 | This page cloud not be found</strong>
          </Typography>
        </Box>
      </Paper>
    </>
  )
}

export default Custom404
