/* eslint-disable @next/next/no-img-element */
import React, { useState, useRef, useEffect } from 'react';
import { ImageSize, BoundingBox } from '@/components/types';
import DraggableBox from '@/components/DraggableBox';

type Props = {
  imgSrc: string;
  imgSize: ImageSize;
};

export const setCanvasToColor = (
  context: CanvasRenderingContext2D,
  color: string
) => {
  context.fillStyle = color;
  context.fillRect(0, 0, 512, 512);
};

const Canvas: React.FC<Props> = ({ imgSrc, imgSize }) => {
  const initImageRef = useRef<HTMLImageElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const imgCanvasRef = useRef<HTMLCanvasElement>(null);

  const [zoom] = useState<number>(1);
  const [maskPos, setMaskPos] = useState<DOMRect | undefined>();

  let imgClipping = { x: 0, y: 0 };
  let blackBox: BoundingBox = { xMin: 0, yMin: 0, xMax: 512, yMax: 512 };

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

  const findBlackBox = (maskRect: DOMRect) => {
    const imgRect = initImageRef.current?.getBoundingClientRect();
    if (imgRect) {
      const xMin = cutLeft(imgRect, maskRect);
      const yMin = cutTop(imgRect, maskRect);
      const xMax = cutRight(imgRect, maskRect);
      const yMax = cutBottom(imgRect, maskRect);
      blackBox = { xMin, yMin, xMax, yMax };
      const x = imgSize.width - (xMax - xMin);
      const y = imgSize.height - (yMax - yMin);
      imgClipping = { x, y };
    } else {
      console.log('no image rect found');
    }
  };

  const drawWhiteBox = (context: CanvasRenderingContext2D) => {
    context.fillStyle = '#FFFFFF';
    const { xMin, xMax, yMin, yMax } = blackBox;
    const overlap = 8;
    context.fillRect(
      xMin - overlap,
      yMin - overlap,
      xMax - xMin - overlap * 2,
      yMax - yMin - overlap * 2
    );
  };

  const drawToCanvas = (
    context: CanvasRenderingContext2D,
    image: HTMLImageElement
  ) => {
    const w = blackBox.xMax - blackBox.xMin;
    const h = blackBox.yMax - blackBox.yMin;

    context.drawImage(
      image,
      imgClipping.x,
      imgClipping.y,
      w,
      h,
      blackBox.xMin,
      blackBox.yMin,
      w,
      h
    );
  };

  const handleBoxMove = (rec: DOMRect) => {
    setMaskPos(rec);
  };

  const handleGenerateButtonClick = async () => {
    const maskCtx = maskCanvasRef.current?.getContext('2d');
    const imgCtx = imgCanvasRef.current?.getContext('2d');
    const currImg = initImageRef.current;

    if (maskCtx && imgCtx && maskPos && currImg) {
      try {
        findBlackBox(maskPos);
        drawWhiteBox(maskCtx);
        drawToCanvas(imgCtx, currImg);
        const maskDataUrl = maskCanvasRef.current?.toDataURL('image/jpeg');
        const imgDataUrl = imgCanvasRef.current?.toDataURL('image/jpeg');
        if (imgDataUrl && maskDataUrl) {
          console.log('imgDataUrl:', imgDataUrl);
          console.log('maskDataUrl:', maskDataUrl);
          await callGenerate(imgDataUrl, maskDataUrl);
        } else {
          throw new Error('failed to get image masks');
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  const callGenerate = async (initImg: string, maskImg: string) => {
    try {
      const response = await fetch('/api/mask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: 'busy bakery, realistic style',
          initImg: initImg,
          maskImg: maskImg,
        }),
      });
      let prediction = await response.json();

      console.log(prediction);
    } catch (err) {
      console.log(err);
    }
  };

  const initCanvas = (canvas: HTMLCanvasElement | null, color: string) => {
    if (!canvas) {
      return;
    }
    canvas.width = 512;
    canvas.height = 512;

    const context = canvas.getContext('2d');
    if (context) {
      setCanvasToColor(context, color);
    }
  };

  useEffect(() => {
    initCanvas(maskCanvasRef.current, '#000000');
    initCanvas(imgCanvasRef.current, '#FFFFFF');
  }, []);

  return (
    <div className='flex h-full w-full flex-col items-center justify-center gap-2 border border-gray-50'>
      <button
        className='rounded-lg border border-black px-3 py-1'
        onClick={handleGenerateButtonClick}
      >
        generate
      </button>
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
      <DraggableBox
        initPosition={{ left: 10, top: 10 }}
        onNewPosition={handleBoxMove}
      />
      <canvas ref={maskCanvasRef} style={{ display: 'none' }} />
      <canvas ref={imgCanvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default Canvas;
