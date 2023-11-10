'use client';

import { useState, ChangeEvent } from 'react';
import Canvas from '@/components/canvas';

const Main = () => {
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (file && file.type.startsWith('image/')) {
      // Generate a preview URL
      const reader = new FileReader();

      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  return (
    <main className='flex h-screen w-screen grow flex-col'>
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
