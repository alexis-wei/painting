/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { ImageSize } from '@/components/types';

type Props = {
  imgSrc: string;
  imgSize: ImageSize,
};

const Canvas: React.FC<Props> = ({ imgSrc, imgSize }) => {

  return (
    <div className='flex h-full w-full flex-col items-center justify-center gap-2 border border-gray-50'>
      <span>{imgSize.width}x{imgSize.height}px</span>
      <img
        id="uploaded-img"
        src={imgSrc}
        alt='uploaded image'
      />

    </div>
  );
};

export default Canvas;
