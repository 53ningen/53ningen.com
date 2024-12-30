'use client'

import Canvas from '@/components/common/Canvas'
import { useEffect } from 'react'

const Logout = () => {
  useEffect(() => {
    window.location.href = '/api/auth/logout'
  })
  return (
    <Canvas className="flex flex-col h-64 justify-center">
      <div>Logging out...</div>
    </Canvas>
  )
}

export default Logout
