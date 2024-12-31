import prisma from '@/lib/prisma'

type Props = {
  categoryId?: number
}

const CategorySelector = async ({ categoryId }: Props) => {
  const categories = await prisma.category.findMany()
  return (
    <select className="border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
      {categories.map((category) => (
        <option key={category.id} value={category.id} defaultValue={categoryId || 0}>
          {category.displayName}
        </option>
      ))}
    </select>
  )
}

export default CategorySelector
