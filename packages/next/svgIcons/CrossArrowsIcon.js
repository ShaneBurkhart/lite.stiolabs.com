import * as React from "react"

function CrossArrowsIcon(props) {
  return (
    <svg
      width="24px"
      height="24px"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M13 21.293l2.146-2.147a.5.5 0 01.708.708l-3 3a.5.5 0 01-.708 0l-3-3a.5.5 0 01.708-.708L12 21.293V15.5a.5.5 0 111 0v5.793zM3.707 13l2.147 2.146a.5.5 0 01-.708.708l-3-3a.5.5 0 010-.708l3-3a.5.5 0 11.708.708L3.707 12H9.5a.5.5 0 110 1H3.707zm17.586-1l-2.147-2.146a.5.5 0 01.708-.708l3 3a.5.5 0 010 .708l-3 3a.5.5 0 01-.708-.708L21.293 13H15.5a.5.5 0 110-1h5.793zM13 3.707V9.5a.5.5 0 11-1 0V3.707L9.854 5.854a.5.5 0 11-.708-.708l3-3a.5.5 0 01.708 0l3 3a.5.5 0 01-.708.708L13 3.707z" />
    </svg>
  )
}

export default CrossArrowsIcon;
