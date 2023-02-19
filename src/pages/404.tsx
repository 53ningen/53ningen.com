import { Box, Paper, Typography } from '@mui/material'

const Custom404 = () => {
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
