import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import { Box, Breadcrumbs as MuiBreadcrumbs, Typography } from '@mui/material'
import Link from './Link'

export type Path = {
  path: string
  title: string
}

type Props = {
  items: Path[]
}

const HomeTitle = '🏠'

export const Breadcrumbs = ({ items }: Props) => {
  return (
    <Box pt={2}>
      <MuiBreadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
        <Link href="/">{HomeTitle}</Link>
        {items.map((item, index) => {
          return index < items.length - 1 ? (
            <Link key={item.path} href={item.path}>
              {item.title}
            </Link>
          ) : (
            <Typography key={item.path}>{item.title}</Typography>
          )
        })}
      </MuiBreadcrumbs>
    </Box>
  )
}
