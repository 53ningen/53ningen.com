import { Const } from '@/const'
import { Box, Skeleton, Stack, Typography } from '@mui/material'
import { CategoryChip } from '../Chip/CategoryChip'
import { CreatedDateChip } from '../Chip/CreatedDateChip'
import { TagChip } from '../Chip/TagChip'
import { UpdatedDateChip } from '../Chip/UpdatedDateChip'
import Link from '../Link'
import { ArticleMetadata as ArticleMeta } from './Article'

type Props = {
  meta?: ArticleMeta
}

export const ArticleMetadata = ({ meta }: Props) => {
  const created = Const.ISO8601toDateTimeString(meta?.createdAt)
  const updated = Const.ISO8601toDateTimeString(meta?.updatedAt)
  return (
    <Stack spacing={1} px={{ xs: 2, sm: 2, md: 4 }} py={4}>
      <Typography variant="h1">
        {meta ? (
          <Link href={`/${meta.slug}`} color="inherit">
            {meta.title}
          </Link>
        ) : (
          <Skeleton width="80%" />
        )}
      </Typography>
      <Box>
        <CreatedDateChip createdAt={created} />
        <UpdatedDateChip updatedAt={updated} />
      </Box>
      <Box lineHeight={2.5}>
        <CategoryChip category={meta?.category} />
        {meta?.tags.map((tag) => {
          return <TagChip key={tag} tag={tag} />
        })}
      </Box>
    </Stack>
  )
}