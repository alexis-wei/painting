import React, { useState, useRef } from 'react';
import { DivPosition } from '@/components/types';

type Props = {
  initPosition: DivPosition;
  // eslint-disable-next-line no-unused-vars
  onNewPosition: (rec: DOMRect) => void;
};

const DraggableBox: React.FC<Props> = ({ initPosition, onNewPosition }) => {
  const [isDragging, setIsDragging] = useState<Boolean>(false);
  const [position, setPosition] = useState<DivPosition>({
    left: initPosition.left,
    top: initPosition.top,
  });
  const [rel, setRel] = useState<DivPosition>({ left: 0, top: 0 });

  const boxRef = useRef<HTMLDivElement>(null);

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return; // Only left mouse button

    const box = (e.target as HTMLDivElement).getBoundingClientRect();
    setRel({
      left: e.pageX - box.left,
      top: e.pageY - box.top,
    });
    setIsDragging(true);
    e.stopPropagation();
    e.preventDefault();
  };

  const onMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(false);
    if (boxRef.current) {
      const rect1 = boxRef.current.getBoundingClientRect();
      onNewPosition(rect1);
    }

    e.stopPropagation();
    e.preventDefault();
  };

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setPosition({
      left: e.pageX - rel.left,
      top: e.pageY - rel.top,
    });
    e.stopPropagation();
    e.preventDefault();
  };

  return (
    <div
      ref={boxRef}
      style={{
        left: `${position.left}px`,
        top: `${position.top}px`,
      }}
      className='absolute h-[512px] w-[512px] border border-purple-400 bg-purple-300/50 p-2 hover:cursor-move'
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseMove={onMouseMove}
    />
  );
};

export default DraggableBox;
