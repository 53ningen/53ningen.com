import { Article } from '@/components/Article/Article'
import { demoArticles } from '@/data'
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
  return <></>
}

export default Page

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {
      articles: demoArticles,
    },
    // revalidate: Const.revalidatePreGeneratedArticleSec,
  }
}
