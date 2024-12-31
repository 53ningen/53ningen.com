import React from 'react'

type Props = React.InputHTMLAttributes<HTMLInputElement>

const Checkbox = (props: Props) => {
  return <input type="checkbox" {...props} className={`rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${props.className || ''}`} />
}

export default Checkbox
