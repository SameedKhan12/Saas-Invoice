import { Loader } from 'lucide-react'
import React from 'react'

export default function Loading() {
  return (
    <div className='flex flex-col items-center justify-between mx-auto h-screen my-auto '>
        <Loader className='w-12 h-12 animate-spin'/>
        <span>loading</span>
    </div>
  )
}
