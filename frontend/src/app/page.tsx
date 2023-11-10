'use client';

import { useState, ChangeEvent } from 'react';
import Canvas from '@/components/canvas';

const Main = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);

      // Generate a preview URL
      const reader = new FileReader();

      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedFile(null);
      setPreview(null);
    }
  };

  return (
    <main className='flex-co flex h-screen w-screen grow'>
      <div className='flex h-full w-full flex-col items-center justify-center gap-2 p-4'>
        {preview ? (
          <Canvas imgSrc={preview} />
        ) : (
          <input type='file' onChange={handleFileChange} className='w-fit' />
        )}
      </div>
    </main>
  );
};

export default Main;
