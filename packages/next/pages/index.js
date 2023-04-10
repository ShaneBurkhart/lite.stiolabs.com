import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { RingLoader } from 'react-spinners';
import tw from 'tailwind-styled-components';
import UploadPDF from '../components/UploadPDF';

const LoadingContainer = tw.div`
  h-screen w-full flex justify-center items-center
`;

const IndexPage = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // useEffect(() => {
  //   const fetchShortCode = async () => {
  //     const res = await fetch('/api/shortcode', {
  //       method: 'POST',
  //     });
  //     const data = await res.json();
  //     router.push(`/v/${data.shortcode}`);
  //   };

  //   fetchShortCode();
  // }, []);

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
        <div className="">
          <UploadPDF /> 
        </div>
      )}
    </>
  );
};

export default IndexPage;
