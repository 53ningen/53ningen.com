import React from 'react'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  theme?: 'normal' | 'danger'
}

const Button = (props: Props) => {
  const colors = props.theme === 'danger' ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-blue-500 text-white hover:bg-blue-600'
  return (
    <button
      {...props}
      className={`
        ${colors}
        p-2 rounded-md
        ${props.className || ''}`}
    />
  )
}

export default Button
