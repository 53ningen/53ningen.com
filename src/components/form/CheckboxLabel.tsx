import React from 'react'

type Props = React.LabelHTMLAttributes<HTMLLabelElement>

const CheckboxLabel = (props: Props) => {
  return <label {...props} className={`flex items-center gap-1 text-xs text-gray-500 ${props.className || ''}`} />
}

export default CheckboxLabel
