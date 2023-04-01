import { useRouter } from 'next/router';
import { TakeoffProvider } from '@/components/contexts/TakeoffContext';
import { TourProvider } from '@/components/contexts/TourContext';
import SiteHeader from '@/components/SiteHeader';

import '@/styles/globals.css'
import Head from 'next/head';

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const { shortcode } = router.query;
  const isProjectRoute = router.pathname.startsWith('/p/');

  if (isProjectRoute) {
    return (
      <>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"/>
        </Head>
        <TakeoffProvider >
          <TourProvider>
            {/* <SiteHeader /> */}
            <Component {...pageProps} />
          </TourProvider>
        </TakeoffProvider>
      </>
    )
  } else {
    return <Component {...pageProps} />
  }
}
