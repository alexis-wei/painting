/* eslint-disable @next/next/no-img-element */
import React, { useState, useRef } from 'react';
import { ImageSize, BoundingBox } from '@/components/types';
import DraggableBox from '@/components/DraggableBox';
import MaskImg from '@/components/Mask';

type Props = {
  imgSrc: string;
  imgSize: ImageSize;
};

const Canvas: React.FC<Props> = ({ imgSrc, imgSize }) => {
  const initImageRef = useRef<HTMLImageElement>(null);
  const [zoom] = useState<number>(1);
  const [maskPos, setMaskPos] = useState<DOMRect | undefined>();
  const [blackBox, setBlackBox] = useState<BoundingBox>({xMin: 0, yMin: 0, xMax: 512, yMax: 512});

  const cutLeft = (imgRect: DOMRect, maskRect: DOMRect) => {
    const space = imgRect.left - maskRect.left;
    return space > 0 ? space : 0;
  };  

  const cutTop = (imgRect: DOMRect, maskRect: DOMRect) => {
    const topSpace = imgRect.top - maskRect.top;
    return topSpace > 0 ? topSpace : 0;
  };  

  const cutRight = (imgRect: DOMRect, maskRect: DOMRect) => {
    const space = maskRect.right - imgRect.right;
    return space > 0 ? 512 - space : 512;
  };  

  const cutBottom = (imgRect: DOMRect, maskRect: DOMRect) => {
    const space = maskRect.bottom - imgRect.bottom;
    return space > 0 ? 512 - space : 512;
  };  
  
  const findBlackBox = (maskRec: DOMRect) => {
    setMaskPos(maskPos);
    const imgRect = initImageRef.current?.getBoundingClientRect();
    if (imgRect){
      const xMin = cutLeft(imgRect, maskRec);
      const yMin = cutTop(imgRect, maskRec);
      const xMax = cutRight(imgRect, maskRec);
      const yMax = cutBottom(imgRect, maskRec);
      setBlackBox({xMin, yMin, xMax, yMax});
    } else {
      console.log('no image rect found');
    }

    // let overlapX:number = undefined;
    // const overlapY:number = undefined;

    // let imgMoreRight: boolean;
    // let imgLower: boolean;

    // return !(
    //   imgRect.right < maskRec.left ||
    //   imgRect.left > maskRec.right ||
    //   imgRect.bottom < maskRec.top ||
    //   imgRect.top > maskRec.bottom
    // );
  };

  const handleBoxMove = (rec: DOMRect) => {
    console.log('box new position');
    console.log(rec.left, rec.top);
    findBlackBox(rec);
  };

  const handleReturnBox = (maskString: string) => {
    console.log('received box string:', maskString);
  };

  return (
    <div className='flex h-full w-full flex-col items-center justify-center gap-2 border border-gray-50'>
      <span>
        {imgSize.width}x{imgSize.height}px
      </span>
      <img
        ref={initImageRef}
        id='uploaded-img'
        src={imgSrc}
        alt='uploaded image'
        style={{
          width: imgSize.width * zoom,
          height: imgSize.height * zoom,
        }}
      />
      <MaskImg blackBox={blackBox} returnMask={handleReturnBox}/>
      <DraggableBox initPosition={{ left: 10, top: 10 }} onNewPosition={handleBoxMove} />
    </div>
  );
};

export default Canvas;
