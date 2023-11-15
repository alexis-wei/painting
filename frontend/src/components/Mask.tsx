import React, { useRef, useEffect } from 'react';
import { BoundingBox } from './types';

type MaskFunc = (mask: string) => void;

interface Prop {
  blackBox: BoundingBox;
  returnMask: MaskFunc;
}

const setCanvasToWhite = (context: CanvasRenderingContext2D) => {
  context.fillStyle = '#FFFFFF';
  context.fillRect(0, 0, 512, 512);

};

const drawBlackBox = (context: CanvasRenderingContext2D, blackBox: BoundingBox) => {
  context.fillStyle = '#000000';
  const {xMin, xMax, yMin, yMax} = blackBox;
  context.fillRect(xMin, yMin, xMax - xMin, yMax - yMin);
};

const sendDataURL = (canvas: HTMLCanvasElement | null, returnMask: MaskFunc) => {
  const dataUrl = canvas?.toDataURL('image/jpeg');
  returnMask(dataUrl ?? '');
};

const MaskImg: React.FC<Prop> = ({ blackBox, returnMask }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const getCanvasContext = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.log('canvas is null');
      return undefined;
    }
    const context = canvas.getContext('2d');
    return context;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.log('canvas is null');
      return;
    }

    // Set canvas size
    canvas.width = 512;
    canvas.height = 512;

    const context = canvas.getContext('2d');
    if (context){
      setCanvasToWhite(context);
    }

  },[]);


  useEffect(() => {
    console.log('black box value changed:', blackBox);
    const context = getCanvasContext();

    if (context){
      setCanvasToWhite(context);
      drawBlackBox(context, blackBox);
      sendDataURL(canvasRef.current, returnMask);
    }

  }, [blackBox, returnMask]);

  return <canvas ref={canvasRef} style={{ display: 'none' }} />;
};

export default MaskImg;
