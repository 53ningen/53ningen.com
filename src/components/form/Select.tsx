import React from 'react'

type Props = React.SelectHTMLAttributes<HTMLSelectElement>

const Select = (props: Props) => {
  return (
    <select
      {...props}
      className={`
        border border-gray-300 
        p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
        ${props.className || ''}`}
    />
  )
}

export default Select
