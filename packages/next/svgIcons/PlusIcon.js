import * as React from "react"

function PlusIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M19 12c0 .41-.34.75-.75.75h-5.5v5.5c0 .41-.34.75-.75.75s-.75-.34-.75-.75v-5.5h-5.5c-.41 0-.75-.34-.75-.75s.34-.75.75-.75h5.5v-5.5c0-.41.34-.75.75-.75s.75.34.75.75v5.5h5.5c.41 0 .75.34.75.75"
      />
    </svg>
  )
}

export default PlusIcon
