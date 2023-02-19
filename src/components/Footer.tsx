import { Stack, Typography } from '@mui/material'
import { Const } from '../const'
import Link from './Link'

export const Footer = () => {
  return (
    <Stack
      spacing={2}
      minHeight={300}
      display="flex"
      alignItems="center"
      justifyContent="center">
      <Typography variant="caption">
        <Link href="/" color="inherit">
          Copyright © {Const.siteTitle}
        </Link>
      </Typography>
      <Stack direction="row" spacing={2}>
        <Typography variant="caption">
          <Link href="/privacy">Privacy Policy</Link>
        </Typography>
        <Typography variant="caption">
          <Link href={Const.twitterUrl} target="_blank">
            Twitter
          </Link>
        </Typography>
      </Stack>
    </Stack>
  )
}
