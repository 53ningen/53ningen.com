import { Box, Skeleton } from '@mui/material'
import { Storage } from 'aws-amplify'
import { FC, useEffect, useState } from 'react'

type S3ImageProps = {
  imgKey?: string
  level?: 'public' | 'protected' | 'private'
}

// TODO: Refinement
export const S3Image: FC<S3ImageProps> = ({ imgKey, level }) => {
  const [signedUrl, setSignedUrl] = useState<string>()
  useEffect(() => {
    const getImage = async () => {
      if (imgKey) {
        const res = await Storage.get(imgKey, { level })
        setSignedUrl(res)
      }
    }
    getImage()
  }, [imgKey, level])
  return (
    <Box textAlign="center">
      {signedUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={signedUrl} alt="" style={{ maxWidth: '100%' }} />
      ) : (
        <>
          <Skeleton />
          <Skeleton />
          <Skeleton />
          <Skeleton />
          <Skeleton />
          <Skeleton />
        </>
      )}
    </Box>
  )
}
