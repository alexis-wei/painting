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

  const handleMaskClick = async () => {
    try {
      const response = await fetch('/api/mask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: 'busy bakery, realistic style',
        }),
      });
      let prediction = await response.json();

      console.log(prediction);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <main className='flex h-screen w-screen grow flex-col'>
      <div className='flex h-full w-full flex-col items-center justify-center gap-2 p-4'>
        <button onClick={handleMaskClick}>send</button>
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
