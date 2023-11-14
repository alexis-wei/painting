/* eslint-disable @next/next/no-img-element */
import React, { useState } from 'react';
import { ImageSize } from '@/components/types';
import DraggableBox from '@/components/DraggableBox';

type Props = {
  imgSrc: string;
  imgSize: ImageSize;
};

const Canvas: React.FC<Props> = ({ imgSrc, imgSize }) => {
  const [zoom] = useState<number>(1);

  return (
    <div className='flex h-full w-full flex-col items-center justify-center gap-2 border border-gray-50'>
      <span>
        {imgSize.width}x{imgSize.height}px
      </span>
      <img
        id='uploaded-img'
        src={imgSrc}
        alt='uploaded image'
        style={{
          width: imgSize.width * zoom,
          height: imgSize.height * zoom,
        }}
      />
      <DraggableBox initPosition={{ x: 10, y: 10 }} />
    </div>
  );
};

export default Canvas;
