import Typography from '@mui/material/Typography'
import Link from './Link'

export const Footer: React.FC = () => {
  return (
    <Typography m={4} variant="body2" color="text.secondary" align="center">
      <Link href="/">Copyright © 53ningen.com</Link>
    </Typography>
  )
}
