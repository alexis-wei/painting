/* eslint-disable @next/next/no-img-element */
import React, { useState, useRef, useEffect } from 'react';
import { ImageSize, BoundingBox } from '@/components/types';
import DraggableBox from '@/components/DraggableBox';

const CANVAS_SIZE = 256;
const OVERLAP = 8;

type Props = {
  imgSrc: string;
  imgSize: ImageSize;
};

export const setCanvasToColor = (
  context: CanvasRenderingContext2D,
  color: string
) => {
  context.fillStyle = color;
  context.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
};

interface genImage {
  src: string;
  xPos: number;
  yPos: number;
}

const Canvas: React.FC<Props> = ({ imgSrc, imgSize }) => {
  const initImageRef = useRef<HTMLImageElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const imgCanvasRef = useRef<HTMLCanvasElement>(null);
  const [generatedImgs, setGeneratedImgs] = useState<genImage[]>([]);

  const [zoom] = useState<number>(1);
  const [maskPos, setMaskPos] = useState<DOMRect | undefined>();

  let imgClipping = { x: 0, y: 0 };
  let blackBox: BoundingBox = {
    xMin: 0,
    yMin: 0,
    xMax: CANVAS_SIZE,
    yMax: CANVAS_SIZE,
  };

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
    return space > 0 ? CANVAS_SIZE - space : CANVAS_SIZE;
  };

  const cutBottom = (imgRect: DOMRect, maskRect: DOMRect) => {
    const space = maskRect.bottom - imgRect.bottom;
    return space > 0 ? CANVAS_SIZE - space : CANVAS_SIZE;
  };

  const findBlackBox = (maskRect: DOMRect) => {
    const imgRect = initImageRef.current?.getBoundingClientRect();
    if (imgRect) {
      const xMin = cutLeft(imgRect, maskRect);
      const yMin = cutTop(imgRect, maskRect);
      const xMax = cutRight(imgRect, maskRect);
      const yMax = cutBottom(imgRect, maskRect);
      blackBox = { xMin, yMin, xMax, yMax };
      const x = xMax === CANVAS_SIZE ? 0 : imgSize.width - (xMax - xMin);
      const y = yMax === CANVAS_SIZE ? 0 : imgSize.height - (yMax - yMin);
      imgClipping = { x, y };
    } else {
      console.log('no image rect found');
    }
  };

  const drawWhiteBox = (context: CanvasRenderingContext2D) => {
    context.fillStyle = '#FFFFFF';
    const { xMin, xMax, yMin, yMax } = blackBox;

    // we want the white rect to be smaller, only if it's not bordering the canvas
    context.fillRect(
      xMin === 0 ? 0 : xMin + OVERLAP,
      yMin === 0 ? 0 : yMin + OVERLAP,
      xMax === CANVAS_SIZE ? xMax - xMin : xMax - xMin - OVERLAP * 2,
      yMax === CANVAS_SIZE ? yMax - yMin : yMax - yMin - OVERLAP * 2
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
          // console.log('imgDataUrl:', imgDataUrl);
          // console.log('maskDataUrl:', maskDataUrl);
          await callGenerate(imgDataUrl, maskDataUrl);
        } else {
          throw new Error('failed to get image masks');
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  const bufferToBase64 = (buffer: any) => {
    let binary = '';
    const bytes = new Uint8Array(buffer.data);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
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
      if (prediction && prediction.images && maskPos) {
        const base64Image = bufferToBase64(prediction.images[0]);
        const generatedImgSrc = `data:image/jpeg;base64,${base64Image}`;
        setGeneratedImgs([
          ...generatedImgs,
          { src: generatedImgSrc, xPos: maskPos?.left, yPos: maskPos.top },
        ]);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const initCanvas = (canvas: HTMLCanvasElement | null, color: string) => {
    if (!canvas) {
      return;
    }
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;

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
        initPosition={{ left: 20, top: 20 }}
        onNewPosition={handleBoxMove}
      />
      {generatedImgs.map((item, idx) => (
        <img
          className='absolute'
          style={{
            left: item.xPos,
            top: item.yPos,
          }}
          src={item.src}
          key={idx}
          alt={`generated image ${idx}`}
        />
      ))}
      <canvas ref={maskCanvasRef} style={{ display: 'none' }} />
      <canvas ref={imgCanvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default Canvas;
