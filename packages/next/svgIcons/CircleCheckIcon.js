import * as React from "react"

function CircleCheckIcon(props) {
  return (
    <svg
      width="512px"
      height="512px"
      viewBox="0 0 512 512"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M426.072 86.928A238.75 238.75 0 0088.428 424.572 238.75 238.75 0 00426.072 86.928zM257.25 462.5c-114 0-206.75-92.748-206.75-206.75S143.248 49 257.25 49 464 141.748 464 255.75 371.252 462.5 257.25 462.5z"
        className="ci-primary"
      />
      <path
        className="ci-primary"
        d="M221.27 305.808L147.857 232.396 125.23 255.023 221.27 351.063 388.77 183.564 366.142 160.937 221.27 305.808z"
      />
    </svg>
  )
}

export default CircleCheckIcon

