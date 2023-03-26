import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

import { RingLoader } from 'react-spinners';
import tw from 'tailwind-styled-components';

import App from '@/components/App';

const LoadingContainer = tw.div`
  h-screen w-full flex justify-center items-center
`;


function Project() {
  const router = useRouter();
  const { shortcode } = router.query;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShortCode = async () => {
      const res = await fetch('/api/shortcode/'+shortcode, {
        method: 'POST',
      });
      const data = await res.json();
      console.log(data);
      setLoading(false);
    };

    fetchShortCode();
  }, []);

  return (
    <>
      <Head>
        <title>Generating short code...</title>
      </Head>
      {loading ? (
        <LoadingContainer>
          <RingLoader color="#3B82F6" size={80} />
        </LoadingContainer>
      ) : (
        <App />
      )}
    </>
  );
}

export default Project;