import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Stack,
  Typography,
} from '@mui/material'
import Link from '../Link'
import { Widget } from '../Widget'

type Props = {}

export const Archives = ({}: Props) => {
  return (
    <Widget>
      <Typography variant="h3">Archives</Typography>
      <Stack>
        <Accordion variant="outlined">
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>2023 年</AccordionSummary>
          <AccordionDetails>
            <Stack>
              <Link href="">2023 年 1 月</Link>
              <Link href="">2023 年 2 月</Link>
              <Link href="">2023 年 3 月</Link>
              <Link href="">2023 年 4 月</Link>
              <Link href="">2023 年 5 月</Link>
              <Link href="">2023 年 6 月</Link>
              <Link href="">2023 年 7 月</Link>
              <Link href="">2023 年 8 月</Link>
            </Stack>
          </AccordionDetails>
        </Accordion>
        <Accordion variant="outlined">
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>2022 年</AccordionSummary>
          <AccordionDetails>
            <Stack>
              <Link href="">2022 年 1 月</Link>
              <Link href="">2022 年 2 月</Link>
              <Link href="">2022 年 3 月</Link>
              <Link href="">4月</Link>
              <Link href="">5月</Link>
              <Link href="">6月</Link>
              <Link href="">7月</Link>
              <Link href="">8月</Link>
            </Stack>
          </AccordionDetails>
        </Accordion>
      </Stack>
    </Widget>
  )
}
