import React from 'react'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement>

const Button = (props: Props) => {
  return (
    <button
      {...props}
      className={`
        bg-blue-500 text-white p-2 rounded-md
        ${props.className || ''}`}
    />
  )
}

export default Button
