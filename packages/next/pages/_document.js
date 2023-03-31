import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  const maxHeight = { maxHeight: "100%", height: "100%", overflowX: "auto" }

  return (
    <Html lang="en" style={maxHeight}>
      <Head />
      <body style={maxHeight}>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
