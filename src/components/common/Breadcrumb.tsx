import Link from 'next/link'

interface Props {
  item: { name: string; href: string }
}

const Breadcrumb = ({ item }: Props) => (
  <Link href={item.href} className="inline text-secondary text-xs">
    {item.name}
  </Link>
)

export default Breadcrumb
