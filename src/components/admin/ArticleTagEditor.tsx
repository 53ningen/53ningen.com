import { Tag } from '@prisma/client'
import Label from '../form/Label'
import DataTable from './DataTable'
import { DataTableKey } from './DataTableTypes'

type Props = {
  tags: Tag[]
}

const ArticleTagEditor = ({ tags }: Props) => {
  const keys: DataTableKey[] = [
    { key: 'id', editable: false },
    { key: 'displayName', editable: false },
    { key: 'createdAt', editable: false },
  ]
  return (
    <div>
      <Label>
        tags for this article
        <DataTable data={tags} keys={keys} options={{ deletable: true, addable: true }} />
      </Label>
    </div>
  )
}
export default ArticleTagEditor
