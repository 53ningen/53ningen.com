import {
  FacebookIcon,
  FacebookShareButton,
  HatenaIcon,
  HatenaShareButton,
  LineIcon,
  LineShareButton,
  PocketIcon,
  PocketShareButton,
  TwitterIcon,
  TwitterShareButton,
} from 'react-share'

interface Props {
  url: string
  title: string
  size: number
  via?: string
}

export const ShareButtons = ({ url, title, size, via }: Props) => {
  return (
    <>
      <TwitterShareButton url={url} title={title} via={via}>
        <TwitterIcon round size={size} />
      </TwitterShareButton>
      <FacebookShareButton url={url}>
        <FacebookIcon round size={size} />
      </FacebookShareButton>
      <PocketShareButton url={url} title={title}>
        <PocketIcon round size={size} />
      </PocketShareButton>
      <HatenaShareButton url={url}>
        <HatenaIcon round size={size} />
      </HatenaShareButton>
      <LineShareButton url={url}>
        <LineIcon round size={size} />
      </LineShareButton>
    </>
  )
}
