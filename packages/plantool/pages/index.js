import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

const UploadPage = () => {
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles) => {
    setUploading(true);
    for (const file of acceptedFiles) {
      const response = await fetch(`${apiUrl}/presigned-url?filename=${filename}`);
      const data = await response.json();
      const { url } = data;

      await fetch(url, { method: "PUT", body: file });
      alert("File uploaded successfully!");
    }
    setUploading(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div
          {...getRootProps()}
          className={`border-dashed border-2 border-gray-400 px-8 py-10 rounded-lg text-center ${
            isDragActive ? 'bg-gray-200' : 'bg-white'
          }`}
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p className="text-2xl">Drop the files here...</p>
          ) : (
            <>
              <p className="text-2xl">Drag 'n' drop files here, or click to select files</p>
              {uploading && <p className="mt-2 text-gray-500">Uploading...</p>}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
