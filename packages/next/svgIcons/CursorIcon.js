import * as React from "react"

function CursorIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height={24}
      width={24}
      viewBox="0 0 24 24"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M6.564 1A.561.561 0 006 1.564v17.721a.56.56 0 00.961.393l2.835-2.885 2.428 5.897a.501.501 0 00.655.271l4.252-1.776a.5.5 0 00.27-.651l-2.378-5.791h4.166c.501 0 .75-.613.393-.967L6.953 1.163A.546.546 0 006.564 1M7.5 3.83l9.425 9.413h-4.139l2.85 6.941-2.407 1.005-2.911-7.067L7.5 16.989V3.83"
        fill="#fff"
      />
    </svg>
  )
}

export default CursorIcon
