import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { RingLoader } from 'react-spinners';
import tw from 'tailwind-styled-components';

const LoadingContainer = tw.div`
  h-screen w-full flex justify-center items-center
`;

const IndexPage = () => {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchShortCode = async () => {
      const res = await fetch('/api/shortcode', {
        method: 'POST',
      });
      const data = await res.json();
      console.log(data);
      router.push(`/p/${data.shortcode}`);
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
      ) : null}
    </>
  );
};

export default IndexPage;