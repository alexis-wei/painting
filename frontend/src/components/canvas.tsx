import React from 'react';

type Props = {
  imgSrc: string;
};

const Canvas: React.FC<Props> = ({ imgSrc }) => {
  return (
    <div className='relative left-0 top-0 h-full w-full border border-gray-50'>
      <img
        className='relative left-0 top-0'
        src={imgSrc}
        alt='uploaded image'
      />
    </div>
  );
};

export default Canvas;
