import PersonIcon from '@mui/icons-material/Person'
import { Card, Stack, Typography } from '@mui/material'
import { Box } from '@mui/system'
import Link from '../common/Link'

export const About: React.FC = () => {
  return (
    <Card>
      <Box m={4}>
        <Typography mb={2} variant="h3">
          <Stack direction="row" spacing={1} alignItems="center">
            <PersonIcon />
            <span>About</span>
          </Stack>
        </Typography>
        <Typography>
          <p>
            ウェブ界隈でエンジニアとして労働活動に励んでいる{' '}
            <Link href="https://twitter.com/gomi_ningen">@gomi_ningen</Link>{' '}
            個人のブログです。
          </p>
        </Typography>
      </Box>
    </Card>
  )
}
