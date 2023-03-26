import { useRouter } from 'next/router';
import { TakeoffProvider } from '@/components/contexts/TakeoffContext';

import '@/styles/globals.css'

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const isProjectRoute = router.pathname.startsWith('/p/');

  if (isProjectRoute) {
    return (
      <TakeoffProvider>
        <Component {...pageProps} />
      </TakeoffProvider>
    )
  } else {
    return <Component {...pageProps} />
  }
}
