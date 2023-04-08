import * as React from "react"

function TextIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M20 3.5v5.25c0 .41-.34.75-.75.75s-.75-.34-.75-.75V5h-6v14h2.75c.41 0 .75.34.75.75s-.34.75-.75.75h-7c-.41 0-.75-.34-.75-.75s.34-.75.75-.75H11V5H5v3.75c0 .41-.34.75-.75.75s-.75-.34-.75-.75V3.5H20z"
      />
    </svg>
  )
}

export default TextIcon
