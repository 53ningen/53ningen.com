import { Article } from '@/components/Article/Article'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import Link from '@/components/Link'
import { Meta } from '@/components/Meta'
import { Const } from '@/const'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Stack,
  Typography,
} from '@mui/material'
import type { GetStaticProps } from 'next'

type Props = {
  articles: Article[]
}

// 自分の記事一覧
// ・カテゴリ管理
// ・自分のプロフィール変更
// ・自分の記事削除
// ・自分の記事編集
// ・自分の記事追加
// ・自分の記事の公開状態変更
// ・自分のメディア管理
// ・アクセス解析
// ・特権ユーザーのみ: 他のユーザーの管理
// ・特権ユーザーのみ: 他のユーザーの記事管理
const Page = ({ articles }: Props) => {
  return (
    <>
      <Meta title={`Dashboard | ${Const.siteSubtitle}`} noindex={true} />
      <Stack px={{ xs: 2, sm: 2, md: 4 }} spacing={2}>
        <Breadcrumbs items={[{ path: '/dashboard', title: 'Dashboard' }]} />
        <Accordion expanded>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header">
            <Typography>Related Tools</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={2}>
              <Link
                href="https://ap-northeast-1.admin.amplifyapp.com/admin/d1pqp5vbsuoyi9/prod"
                target="_blank">
                Amplify Studio
              </Link>
              <Link
                href="https://analytics.google.com/analytics/web/?authuser=1#/report-home/a113656388w169268902p169252739"
                target="_blank">
                Google Analytics
              </Link>
            </Stack>
          </AccordionDetails>
        </Accordion>
        <Accordion expanded>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header">
            <Typography>Analytics</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
              malesuada lacus ex, sit amet blandit leo lobortis eget.
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion expanded>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header">
            <Typography>Posts</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
              malesuada lacus ex, sit amet blandit leo lobortis eget.
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion expanded>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header">
            <Typography>Categories</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
              malesuada lacus ex, sit amet blandit leo lobortis eget.
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion expanded>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header">
            <Typography>Uploads</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
              malesuada lacus ex, sit amet blandit leo lobortis eget.
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion expanded>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header">
            <Typography>Profile</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
              malesuada lacus ex, sit amet blandit leo lobortis eget.
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion expanded disabled>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header">
            <Typography>Users</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
              malesuada lacus ex, sit amet blandit leo lobortis eget.
            </Typography>
          </AccordionDetails>
        </Accordion>
      </Stack>
    </>
  )
}

export default Page

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {
      articles: [],
    },
  }
}
