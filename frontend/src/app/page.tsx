'use client';

import { useState, ChangeEvent } from 'react';
import Canvas from '@/components/canvas';
import { ImageSize } from '@/components/types';

const Main = () => {
  const [preview, setPreview] = useState<string>('');
  const [imageSize, setImageSize] = useState<ImageSize>({ width: 0, height: 0 });

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : undefined;
    if (file && file.type.startsWith('image/')) {
      // Generate a preview URL
      const reader:FileReader = new FileReader();

      reader.onloadend = () => {
        setPreview(reader.result as string);
        const img = new Image();
        img.onload = () => {
          setImageSize({ width: img.width, height: img.height });
        };
        img.src = reader.result as string;
      };

      reader.readAsDataURL(file);
    } else {
      setPreview('');
    }
  };

  return (
    <main className='flex h-screen w-screen grow flex-col'>
      <div className='flex h-full w-full flex-col items-center justify-center gap-2 p-4'>
        {preview ? (
          <Canvas imgSrc={preview} imgSize={imageSize} />
        ) : (
          <input type='file' onChange={handleFileChange} className='w-fit' />
        )}
      </div>
    </main>
  );
};

export default Main;
