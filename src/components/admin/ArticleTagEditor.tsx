import { modifyArticleTags } from '@/actions/articles'
import { Tag } from '@prisma/client'
import Label from '../form/Label'
import DataTable from './DataTable'
import { DataTableKey } from './DataTableTypes'

type Props = {
  articleId: number
  tags: Tag[]
}

const ArticleTagEditor = ({ articleId, tags }: Props) => {
  const keys: DataTableKey[] = [
    { key: 'id', editable: false },
    { key: 'displayName', editable: false, required: true },
    { key: 'createdAt', editable: false },
  ]
  return (
    <div>
      <Label>
        tags for this article
        <DataTable
          data={tags}
          keys={keys}
          options={{ deletable: true, addable: true, fixedKeyValues: [['articleId', articleId.toString()]] }}
          action={modifyArticleTags}
        />
      </Label>
    </div>
  )
}
export default ArticleTagEditor
