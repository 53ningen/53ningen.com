import React from 'react'

type Props = React.LabelHTMLAttributes<HTMLLabelElement>

const Label = (props: Props) => {
  return <label {...props} className={`flex flex-col text-xs text-gray-500 ${props.className || ''}`} />
}

export default Label
