import { Const } from '@/const'
import { Favorite, GitHub, Menu, Twitter } from '@mui/icons-material'
import { Box, Button, Stack, Typography } from '@mui/material'
import Link from '../Link'
import { Widget } from '../Widget'

type Props = {}

export const About = ({}: Props) => {
  return (
    <Widget>
      <Typography variant="h3">About</Typography>
      <Stack spacing={1}>
        <Typography variant="body2">
          ウェブ界隈でエンジニアとして労働活動に励んでいる{' '}
          <Link href={Const.twitterUrl} target="_blank">
            @gomi_ningen
          </Link>{' '}
          個人のブログです
        </Typography>
        <Stack>
          <Box>
            <Button
              variant="text"
              size="small"
              startIcon={<Twitter />}
              href={Const.twitterUrl}
              target="_blank">
              Twitter: @gomi_ningen
            </Button>
          </Box>
          <Box>
            <Button
              variant="text"
              size="small"
              startIcon={<GitHub />}
              href={Const.githubUrl}
              target="_blank">
              GitHub: 53ningen
            </Button>
          </Box>
          <Box>
            <Button
              variant="text"
              size="small"
              startIcon={<Favorite />}
              href={Const.tokikenUrl}
              target="_blank">
              超ときめき♡研究部
            </Button>
          </Box>
          <Box>
            <Button
              variant="text"
              size="small"
              startIcon={<Menu />}
              href={Const.circleUrl}
              target="_blank">
              同人サークル: 串カツ広川
            </Button>
          </Box>
        </Stack>
      </Stack>
    </Widget>
  )
}
